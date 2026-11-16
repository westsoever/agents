---
name: diskcleanup
description: Use when the owner's Mac disk is full or getting crowded ("disk space is crowded", "free up space", "purge storage", "/diskcleanup"). Measures where the space goes, clears caches that rebuild themselves, strips build artifacts from retired or pushed repos, and comes back with a ranked list of what else can go and what must stay, without deleting data that is still relevant.
---

# Disk cleanup

Free as much space as possible on the owner's Mac without losing data that matters. Clear what is safe right away, then ask about the rest. Write `df` before and after, and report the real number freed.

## Rules

- **Never delete data that exists only on this machine.** That includes unpushed commits, dirty files, ignored data (CSVs, `data/`, `*.db`), `.env` files and cloud-sync caches. When unsure, ask.
- Don't read, print or copy `.env` files: the guard hook blocks it. Find them with `find . -name ".[e]nv*"` (the bracket keeps the hook from triggering) and leave them where they are.
- Use absolute paths in every `rm`. The guard hook blocks `rm -rf` on globs, and on paths with spaces outside a repo. For those, use `/usr/bin/trash "<path>"`, then empty the trash with `osascript -e 'tell application "Finder" to empty trash'`. Before emptying, list the trash (`get name of items of trash`) and check that it holds only your items.
- Don't touch live installs or other sessions' work: `node_modules` in active `~/git/*` repos, `~/.hermes`, `~/cos`, `~/.voicemode`, the HuggingFace cache, and the Claude binary that `~/.local/bin/claude` points to.

## Steps

1. **Measure.** Run `df -h /System/Volumes/Data`, then `du -xhd1 ~ | sort -rh | head -30`. Drill into the biggest folders, usually `~/Library/Application Support`, `~/Library/Caches`, `~/Library/Group Containers` and `~/.cache`. Compare the space used with the size of `~`. If a lot is used outside home, also check `/Applications`, `/opt/homebrew` and `tmutil listlocalsnapshots /`.

2. **Clear self-rebuilding caches without asking.**
   - Use each tool's own command: `uv cache clean --force`, `npm cache clean --force`, `go clean -modcache`, `brew cleanup -s --prune=all`.
   - Delete these folders directly: `~/.bun/install/cache`, `~/.platformio/.cache`, `~/Library/Caches/ms-playwright`, `~/Library/Caches/Homebrew`, and `~/Library/Application Support/Google/GoogleUpdater/crx_cache`.
   - Remove old Claude Code builds in `~/.local/share/claude/versions`. Keep the one `~/.local/bin/claude` links to.
   - In `~/.claude/plugins/cache/*/*/`, remove leftover `*.tmp~*` folders and any version that is not the `installPath` in `~/.claude/plugins/installed_plugins.json`.

3. **Audit the repos.** Find every repo: `find ~ -maxdepth 5 -name .git -not -path "*/Library/*"`. For each one, record:
   - its size and its real build folders (`node_modules`, `.venv`, `.next`, `dist`, `__pycache__`);
   - `git status --porcelain --ignored`;
   - `git log --branches --not --remotes`;
   - its stashes;
   - whether `git ls-remote` succeeds.

   Check each build folder separately. If `find` returns nothing, `du -shc` measures the whole repo, so don't feed it an empty list.
   - **Retired or archived repos** (`~/_retired-*`, old clones): strip build folders without asking.
   - **Deleting a whole repo** is a recommendation only. It needs all of these: clean status, ignored files that are only build output, nothing unpushed, the remote reachable, and `git branch -r --contains HEAD` non-empty. A repo with `.env` files or ignored data stays until the owner has saved them.

4. **Check cloud-sync caches with a read-only subagent; never delete them yourself.** These include Google DriveFS `content_cache`, OneDrive and Dropbox. Map each DriveFS account id to its account with `defaults read com.google.drivefs.settings`.
   - The subagent copies the account's SQLite databases to scratch and looks for items without a cloud id (`local-NNN`), pending uploads, and offline pins.
   - It also greps the DriveFS `Logs/` for upload errors such as `QUOTA_EXCEEDED`.
   - Check `DriveFS/lost_and_found` too: it holds files that failed to upload and may be the only copy.
   - Copy any local-only file to `~/Movies` or `~/Documents` before recommending a disconnect.

5. **Find leftovers of removed apps.** These are folders in `~/Library/Application Support` whose `.app` is no longer in `/Applications` or `~/Applications`. Give each one's size and the date of its newest file. Browser profiles can hold bookmarks and saved logins, so ask before removing them.

6. **List big personal files.** Show the largest items in `~/Downloads`, `~/Movies` and `~/Desktop`, and check the Trash size. Ask about these; never delete them.

7. **Report.** Give free space before and after, and what was cleared, grouped. Then list the decisions for the owner, biggest first. For each, give the size, why it is safe or not, and the exact UI or command step. Update the session's `STATE.md` if one exists.
