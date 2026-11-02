# bulk-read: cheaper Claude Code sessions on large files

When Claude Code reads a large file, the whole file goes into its context. It stays there for the rest of the session, and you pay for it again on every later turn. bulk-read sends that reading to a cheap model (Haiku) instead. The main model only gets a short answer with `file:line` references.

The idea comes from Spotify's [shunt plugin](https://github.com/spotify/portal-ai-plugins/tree/main/plugins/shunt), described in [this post](https://engineering.atspotify.com/2026/9/portal-by-spotify-cut-my-claude-code-token-usage-by-90). shunt needs a Spotify Portal account. bulk-read does not: it uses Claude Code's own subagents.

## What is in this folder

| File | What it does |
| --- | --- |
| `hooks/big-read-guard` | A PreToolUse hook. In the main session, it blocks a full read of a text file over 400 lines, through the Read tool or a plain `cat`/`bat`/`less`/`more`. The block message tells Claude to ask the bulk-reader agent, or to read only the lines it needs. |
| `agents/bulk-reader.md` | A read-only subagent on Haiku. It answers one question about the files and cites `path:line` for each point. |
| `SKILL.md` | Tells Claude when to use bulk-reader on its own initiative (questions that span several files, long logs, a codebase overview) and when not to. |
| `install-hook.sh` | Links the agent and registers the hook in `~/.claude/settings.json`. It makes a backup first, and you can run it more than once. |

The hook never blocks:
- reads of part of a file (with `offset` or `limit`);
- commands with a pipe, redirect or chain, such as `cat x | grep y`;
- images, PDFs and notebooks;
- tool calls from subagents. Agents that edit code keep full access.

## Install

You need Claude Code and `jq` (`brew install jq` on macOS).

1. Put this folder at `~/.claude/skills/bulk-read` (unzip it there, or copy it).
2. Make the scripts runnable and install the hook:

   ```bash
   chmod +x ~/.claude/skills/bulk-read/install-hook.sh ~/.claude/skills/bulk-read/hooks/big-read-guard
   ~/.claude/skills/bulk-read/install-hook.sh
   ```

3. Start a new Claude Code session. Sessions that are already open don't pick up the hook.

To check it works, ask Claude to read a text file over 400 lines in full. The read should be blocked with a `big-read-guard` message, and Claude should then use bulk-reader or read only part of the file.

## Settings

Set these in your shell profile, or under `"env"` in `~/.claude/settings.json`:

| Variable | Default | Effect |
| --- | --- | --- |
| `BIG_READ_MIN_LINES` | `400` | Files over this many lines are blocked. Raise it if the hook fires too often. |
| `BIG_READ_GUARD` | `on` | Set to `off` to turn the hook off without removing it. |

## What it saves

The test: one question about a 1,147-line Python file, with Sonnet as the main model.

- With bulk-read it cost $0.194. Without it, $0.244. That is 20% cheaper.
- The main session held about 15k fewer tokens.

The saving is larger in long sessions, because a file Claude reads directly is carried along on every later turn.

The cost is detail. The answer from reading the file directly was a bit more thorough, and each hand-off adds a few seconds.

## When not to use it

- **Editing:** Claude should read the exact lines it will change. The hook allows that.
- **Debugging, security review and design questions:** Haiku misses subtle problems. Let the main model read the code.
- **Small files:** a direct read costs less than the hand-off.

## Uninstall

1. In `~/.claude/settings.json`, delete the `PreToolUse` entry whose command ends in `bulk-read/hooks/big-read-guard`. Or restore `~/.claude/settings.json.bak-bulkread`, if you have changed nothing since installing.
2. Delete `~/.claude/agents/bulk-reader.md` and `~/.claude/skills/bulk-read`.
