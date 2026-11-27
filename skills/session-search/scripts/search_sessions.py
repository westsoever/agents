#!/usr/bin/env python3
"""Search local Claude Code session transcripts (~/.claude/projects/**/*.jsonl)
and surface --resume-able sessions matching a query, or the most recent ones.

Usage:
  search_sessions.py "some query"                 # search all projects
  search_sessions.py "some query" --project orbit  # restrict to cwd containing 'orbit'
  search_sessions.py --recent                      # list most recently active sessions
  search_sessions.py "query" --limit 5 --json      # machine-readable output
"""
import argparse
import glob
import json
import os
import re
import subprocess
import sys
from datetime import datetime

PROJECTS_DIR = os.path.expanduser("~/.claude/projects")


def flatten_content(content):
    """Turn a message's content (str or list of blocks) into searchable/displayable text."""
    if content is None:
        return ""
    if isinstance(content, str):
        return content
    parts = []
    if isinstance(content, list):
        for block in content:
            if not isinstance(block, dict):
                continue
            btype = block.get("type")
            if btype == "text":
                parts.append(block.get("text", ""))
            elif btype == "tool_result":
                c = block.get("content")
                if isinstance(c, str):
                    parts.append(c)
                elif isinstance(c, list):
                    for sub in c:
                        if isinstance(sub, dict) and sub.get("type") == "text":
                            parts.append(sub.get("text", ""))
            elif btype == "tool_use":
                parts.append(f"[{block.get('name','tool')} {json.dumps(block.get('input', {}))[:200]}]")
    return "\n".join(p for p in parts if p)


def all_jsonl_files():
    return glob.glob(os.path.join(PROJECTS_DIR, "*", "*.jsonl"))


def candidate_files_for_query(query, files):
    """Fast pre-filter using grep -l so we don't fully parse every transcript."""
    if not files:
        return []
    try:
        matched = []
        chunk = 500
        for i in range(0, len(files), chunk):
            batch = files[i : i + chunk]
            out = subprocess.run(
                ["grep", "-l", "-i", "-F", query] + batch,
                capture_output=True,
                text=True,
            )
            matched.extend(out.stdout.splitlines())
        return matched
    except FileNotFoundError:
        return files  # no grep available; fall back to scanning everything


def human_ts(ts_iso):
    try:
        dt = datetime.fromisoformat(ts_iso.replace("Z", "+00:00"))
        return dt.astimezone().strftime("%Y-%m-%d %H:%M")
    except Exception:
        return ts_iso or "?"


NOISE_PREFIXES = (
    "<local-command-caveat>",
    "<local-command-stdout>",
    "<command-name>",
    "<command-message>",
    "Base directory for this skill:",
)


def is_noise(text):
    stripped = text.strip()
    return stripped.startswith(NOISE_PREFIXES)


def snippet(text, query=None, width=160):
    text = " ".join(text.split())
    if query:
        idx = text.lower().find(query.lower())
        if idx >= 0:
            start = max(0, idx - width // 2)
            return ("…" if start > 0 else "") + text[start : start + width]
    return text[:width]


def scan_file(path, query, project_filter):
    """Parse one transcript file, return a session summary dict or None."""
    session = {
        "sessionId": None,
        "cwd": None,
        "gitBranch": None,
        "first_ts": None,
        "last_ts": None,
        "match_count": 0,
        "snippets": [],
        "file": path,
        "_user_texts": [],
    }
    pattern = re.compile(re.escape(query), re.IGNORECASE) if query else None

    try:
        with open(path, "r", errors="ignore") as fh:
            for line in fh:
                line = line.strip()
                if not line:
                    continue
                try:
                    d = json.loads(line)
                except json.JSONDecodeError:
                    continue

                sid = d.get("sessionId")
                if sid and not session["sessionId"]:
                    session["sessionId"] = sid
                cwd = d.get("cwd")
                if cwd:
                    session["cwd"] = cwd
                gb = d.get("gitBranch")
                if gb:
                    session["gitBranch"] = gb
                ts = d.get("timestamp")
                if ts:
                    if not session["first_ts"]:
                        session["first_ts"] = ts
                    session["last_ts"] = ts

                msg = d.get("message")
                if not isinstance(msg, dict):
                    continue
                role = msg.get("role")
                if role not in ("user", "assistant"):
                    continue
                text = flatten_content(msg.get("content"))
                if not text:
                    continue

                if pattern and pattern.search(text):
                    session["match_count"] += 1
                    if len(session["snippets"]) < 3:
                        session["snippets"].append(
                            {"role": role, "ts": ts, "text": snippet(text, query)}
                        )
                elif not pattern and role == "user" and len(session["_user_texts"]) < 8:
                    session["_user_texts"].append({"ts": ts, "text": text})
    except OSError:
        return None

    if not session["sessionId"]:
        return None

    if not pattern:
        # --recent mode: title from the first non-noise user message, else first at all
        candidates = session["_user_texts"]
        title = next((c for c in candidates if not is_noise(c["text"])), None)
        if title is None and candidates:
            title = candidates[0]
        if title:
            session["snippets"].append(
                {"role": "user", "ts": title["ts"], "text": snippet(title["text"])}
            )
    del session["_user_texts"]
    if project_filter and (not session["cwd"] or project_filter.lower() not in session["cwd"].lower()):
        return None
    return session


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("query", nargs="?", default=None, help="text to search for across past sessions")
    ap.add_argument("--project", help="only include sessions whose cwd contains this substring")
    ap.add_argument("--limit", type=int, default=10, help="max sessions to show (default 10)")
    ap.add_argument("--recent", action="store_true", help="list most recently active sessions instead of searching")
    ap.add_argument("--json", action="store_true", help="emit JSON instead of formatted text")
    args = ap.parse_args()

    if not args.query and not args.recent:
        ap.error("provide a query, or pass --recent to list recent sessions")

    files = all_jsonl_files()
    if args.query:
        files = candidate_files_for_query(args.query, files)

    sessions = []
    for f in files:
        s = scan_file(f, args.query, args.project)
        if s:
            sessions.append(s)

    if args.query:
        sessions.sort(key=lambda s: (s["match_count"], s["last_ts"] or ""), reverse=True)
    else:
        sessions.sort(key=lambda s: s["last_ts"] or "", reverse=True)

    sessions = sessions[: args.limit]

    if args.json:
        print(json.dumps(sessions, indent=2))
        return

    if not sessions:
        print("No matching sessions found.")
        return

    for i, s in enumerate(sessions, 1):
        cwd = s["cwd"] or "?"
        branch = f", {s['gitBranch']}" if s["gitBranch"] else ""
        last = human_ts(s["last_ts"])
        header = f"{i}. {last}{branch} — {cwd}"
        if args.query:
            header += f"  ({s['match_count']} match{'es' if s['match_count'] != 1 else ''})"
        print(header)
        print(f"   session: {s['sessionId']}")
        for sn in s["snippets"]:
            print(f"   [{sn['role']}] {sn['text']}")
        print(f"   resume:  cd '{cwd}' && claude --resume {s['sessionId']}")
        print()


if __name__ == "__main__":
    main()
