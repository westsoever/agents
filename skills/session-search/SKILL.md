---
name: session-search
description: Search past Claude Code sessions (stored locally as JSONL under ~/.claude/projects/) by keyword to find where a task, bug, or plan was previously discussed, and get the exact `claude --resume <id>` command to jump back in. Use when the user asks "did I work on X before", "find that session where...", "what did we do about Y last time", or wants to resume/continue past work without knowing the session id. Also use for "show recent sessions" / browsing session history.
---

# Session Search

Finds and ranks past local session transcripts so the user can resume the right one, without manually paging through the `claude --resume` picker.

## How it works

All session transcripts live at `~/.claude/projects/<encoded-cwd>/<session-id>.jsonl`, one JSONL file per session, one line per event. A helper script does the searching so you don't have to grep/parse transcripts by hand:

```
python3 ~/.claude/skills/session-search/scripts/search_sessions.py "<query>" [--project <substr>] [--limit N] [--json]
python3 ~/.claude/skills/session-search/scripts/search_sessions.py --recent [--project <substr>] [--limit N]
```

- `"<query>"` — case-insensitive substring search across user + assistant message text (including tool results and tool-use summaries) in every transcript. Sessions are ranked by match count, then recency.
- `--recent` — no query; lists the most recently active sessions, titled by their first substantive user message (skipping caveat/command wrapper noise).
- `--project <substr>` — restrict to sessions whose working directory contains this substring (e.g. `--project orbit`).
- `--limit N` — cap results (default 10).
- `--json` — machine-readable output if you need to post-process results yourself.

Each result includes the session id, cwd, git branch, last-active timestamp, up to 3 matching snippets, and a ready-to-use resume line:

```
resume:  cd '<cwd>' && claude --resume <session-id>
```

## Usage instructions

1. Run the script with the user's search terms (pick out the key nouns/phrases from their request — don't over-quote their whole sentence).
2. Present the ranked results plainly: timestamp, project, one snippet, and the resume command.
3. **Do not run `claude --resume` yourself** — it's an interactive command that takes over the terminal. Tell the user to run it themselves, or suggest prefixing with `!` if they want to run it from inside the current session.
4. If nothing matches, retry with a broader/looser term before concluding there's no prior session — the search is a plain substring match, not fuzzy or semantic, so exact phrasing matters (e.g. try individual keywords instead of a whole sentence).
5. If the user just wants to browse ("what have I been doing"), use `--recent` instead of asking them for a query.
