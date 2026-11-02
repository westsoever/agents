---
name: bulk-read
description: Delegate reading of large files or many files to the cheap bulk-reader subagent (Haiku) instead of loading them into the main context. Use when a question spans several files, a file is long (over ~400 lines), or you need an overview of a folder, a codebase, a log or a long document, and you will not edit the text you are reading. Also explains the big-read-guard hook that blocks whole-file reads of large files, and how to tune or turn it off.
---

# bulk-read

Most reading is I/O, not thinking. Send it to a cheap model and keep only the answer.
Same idea as Spotify's shunt plugin (portal-ai-plugins), but it runs on Claude Code's own subagents, so it needs no Portal account.

## How to delegate

Call the Agent tool with `subagent_type: "bulk-reader"`. In the prompt give:
- the paths, a folder or a glob, and
- one specific question ("list every route and its handler with path:line", not "look at this").

Ask several questions in one call when they concern the same files. The reply has `path:line` refs. Before you edit, Read just that section with `offset`/`limit`.

## When not to delegate
- You are about to edit the text: read the section yourself (targeted read).
- Subtle reasoning: debugging, concurrency, security review, design decisions. Haiku misses things there.
- Small files (under the threshold): reading directly is cheaper than the round trip.

## The guard hook

`hooks/big-read-guard` is a PreToolUse hook on `Read|Bash`, registered in `~/.claude/settings.json`. In the main thread it denies:
- a Read of a text file over the threshold without `offset`/`limit`;
- a plain `cat`/`bat`/`less`/`more` of files whose total is over the threshold (pipes, redirects and chains pass).

It always allows subagent calls (they carry `agent_id`), targeted reads, images, PDFs and notebooks. The deny message tells Claude to use bulk-reader, a targeted read, or an explicit `limit` when the whole file really must be in context.

Settings (env, in the shell or in `settings.json` `env`):
- `BIG_READ_MIN_LINES`: threshold, default 400.
- `BIG_READ_GUARD=off`: turn the guard off.

## Install
Run `~/.agents/install.sh` (links the skill), then `skills/bulk-read/install-hook.sh` (links `~/.claude/agents/bulk-reader.md` and registers the hook in `~/.claude/settings.json`, with a backup). Both are idempotent. The agent-terminal guard (`~/.claude/agent-terminal/bin/guard.sh`) blocks agents from editing `settings.json`, so the owner runs the hook script (`! ~/.agents/skills/bulk-read/install-hook.sh`).

## Measured (2026-11-02)
One question about a 1,147-line Python file, Sonnet main thread: $0.194 with the guard vs $0.244 without (20% cheaper), and about 15k fewer tokens in the main context. Savings grow in long sessions, because a directly read file is carried in context on every later turn.
