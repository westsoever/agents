#!/usr/bin/env python3
"""Build the skills marketplace from ~/.agents/skills.

Reads every skills/<name>/SKILL.md and writes, next to this file:
  index.html   self-contained page: one card per skill, Cmd+K full-text search
  skills.json  compact index (name, description, path) for asking Claude "which skill can do X"

Run:  python3 ~/.agents/marketplace/build.py
Standard library only. Re-run after adding or editing a skill.
"""
import json
import re
import sys
from datetime import datetime
from pathlib import Path

HERE = Path(__file__).resolve().parent
SKILLS = HERE.parent / "skills"
MAX_LISTED_FILES = 60


def unquote(v):
    v = v.strip()
    if len(v) >= 2 and v[0] == v[-1] == '"':
        return v[1:-1].replace('\\"', '"').replace("\\n", "\n")
    if len(v) >= 2 and v[0] == v[-1] == "'":
        return v[1:-1].replace("''", "'")
    return v


def parse_frontmatter(text):
    """Tolerant reader for the YAML subset skills use. Returns (fields, body)."""
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n?", text, re.S)
    if not m:
        return {}, text
    lines = m.group(1).split("\n")
    out, i = {}, 0
    while i < len(lines):
        km = re.match(r"^([A-Za-z_][\w-]*):\s*(.*)$", lines[i])
        i += 1
        if not km:
            continue
        key, val = km.groups()
        if re.fullmatch(r"[>|][+-]?", val):  # block scalar
            block = []
            while i < len(lines) and (lines[i].startswith((" ", "\t")) or lines[i] == ""):
                block.append(lines[i].strip())
                i += 1
            sep = " " if val[0] == ">" else "\n"
            val = sep.join(block).strip()
        elif val == "":  # nested map or list: keep as flat text, never needed for display
            block = []
            while i < len(lines) and lines[i].startswith((" ", "\t", "-")):
                block.append(lines[i].strip())
                i += 1
            val = " ".join(block)
        else:  # plain or quoted scalar, possibly continued on indented lines
            parts = [val]
            while i < len(lines) and lines[i].startswith((" ", "\t")):
                parts.append(lines[i].strip())
                i += 1
            val = unquote(" ".join(parts))
        out[key] = val
    return out, text[m.end():]


def list_files(folder):
    files = []
    for p in sorted(folder.rglob("*")):
        rel = p.relative_to(folder)
        if p.is_file() and rel.name != "SKILL.md" and not any(part.startswith(".") for part in rel.parts):
            files.append(str(rel))
    return files


def main():
    skills = []
    for d in sorted(SKILLS.iterdir()):
        md = d / "SKILL.md"
        if not d.is_dir() or not md.is_file():
            continue
        text = md.read_text(encoding="utf-8", errors="replace")
        fm, body = parse_frontmatter(text)
        if not fm.get("name"):
            print(f"warn: {d.name}: no name in frontmatter, using folder name", file=sys.stderr)
        elif fm["name"] != d.name:
            print(f"warn: {d.name}: frontmatter name is '{fm['name']}'", file=sys.stderr)
        files = list_files(d)
        skills.append(
            {
                "name": d.name,
                "description": " ".join(fm.get("description", "").split()),
                "manual": fm.get("disable-model-invocation", "").lower() == "true",
                "path": f"~/.agents/skills/{d.name}",
                "file_count": len(files),
                "files": files[:MAX_LISTED_FILES],
                "body": text,  # full SKILL.md incl. frontmatter, for search and the detail view
            }
        )

    generated = datetime.now().strftime("%Y-%m-%d %H:%M")
    meta = {"generated": generated, "source": "~/.agents/skills", "count": len(skills)}

    # Compact index for Claude: no bodies.
    compact = {
        **meta,
        "how_to_use": "Pick the skills whose description fits the request. manual=true means it only runs when typed as /name.",
        "skills": [{k: s[k] for k in ("name", "description", "manual", "path")} for s in skills],
    }
    (HERE / "skills.json").write_text(json.dumps(compact, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

    # "<" escaped so a SKILL.md containing </script> cannot end the data block.
    data = json.dumps({**meta, "skills": skills}, ensure_ascii=False).replace("<", "\\u003c")
    template = (HERE / "template.html").read_text(encoding="utf-8")
    (HERE / "index.html").write_text(template.replace("__DATA__", data), encoding="utf-8")

    print(f"{len(skills)} skills -> {HERE / 'index.html'} and skills.json")


if __name__ == "__main__":
    main()
