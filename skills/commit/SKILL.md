---
name: commit
description: Use when asked to commit, save or back up this session's work without landing it on main ("commit this", "/commit", "commit and push", "save my work", "push the branch"). Commits only this session's files and pushes the branch so the work is safe on the remote; the branch or worktree stays open for later. Landing on main is /merge.
---

# Commit and push (no merge)

Save this session's work as a commit and push it, so closing the session can't lose anything. The branch or worktree stays as it is; landing it on `main` is `/merge`'s job. Commit right away when asked, then report.

## Steps

1. **Orient.** `git fetch`. Note your branch and whether you're in a worktree (`git worktree list`). Read the repo's `AGENTS.md`/`CLAUDE.md`: its commit message, branch, push and deploy rules win over this skill. `/commit` is the owner asking you to push.

2. **Pick your files.** `git status`. Stage only files this session changed, by explicit path. Files you didn't touch belong to another session: leave them unstaged and list them in the report. Never stage secrets (`.env*`, keys, tokens, anything named like `SECRETS`); if one of yours is among the changes, stop and say so.

3. **Choose where the commit goes.**
   - **On a branch or in a worktree:** commit there.
   - **On `main` (or the default branch):** if the repo's rules have work land through branches or PRs, or every push to `main` deploys, move the work to a branch first: `git switch -c <short-topic>` (uncommitted changes come along), then commit there. Commit straight on `main` only when the repo's rules or its history show that's how it works (a vault with direct commits, no merge commits on `git log --first-parent origin/main`). If you can't tell, take the branch.

4. **Commit.** Message in the repo's convention (`git log -10 --oneline`; for example the vault's `task <id>: <what changed>`), otherwise `<area>: <what changed>`, with one bullet per change in the body when there is more than one. End with the attribution trailers from this session's instructions. One commit per logical change is fine; don't squash other sessions' commits.

5. **Push.**
   - Branch, first push: `git push -u origin <branch>`. Later: `git push`.
   - Rejected because the remote moved (someone else pushed to the same branch or to `main`): `git fetch`, then `git merge origin/<branch>` (or `git pull --rebase` for your own unpushed commits on `main`), resolve keeping both sides' intent, run the tests if the repo has a quick command, push again. Never force. When the right combination isn't clear, abort the merge and stop with a recommendation.

6. **Verify.** `git status -sb` shows nothing ahead, and `git log origin/<branch>..HEAD` is empty. On `main`, also `git log HEAD..origin/main` is empty (nothing from the remote dropped).

7. **Leave a resume point.** Add one line to this session's `STATE.md` (the SessionStart context names its directory): `<date> committed <hash> on <branch>, pushed; not merged`. If `NEXT.md` exists, make sure its "Do now" still matches. Don't remove the worktree or the branch.

8. **Report** in a few lines: the commit hash and message, the branch and where it was pushed, the files left uncommitted because they aren't yours, and the next step (`/merge` when it should land, or nothing if it stays a branch).

## Common mistakes

- `git add -A`, `commit -a` or `stash` to get a clean tree. Other sessions' files stay as they are.
- Pushing straight to `main` in a repo that lands through branches or deploys on push. Branch first.
- Committing without pushing: the work is still only on this machine.
- Merging, removing the worktree or deleting the branch. That's `/merge`, and only when asked.
