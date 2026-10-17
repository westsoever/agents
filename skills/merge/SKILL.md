---
name: merge
description: Use when asked to merge, land or ship the current branch or worktree into main ("merge it", "/merge", "get this on main", "merge and push"), or when the agent terminal sends a merge request to this session.
---

# Merge to main

Land this session's branch on `main` the way the owner's repos already look: a `--no-ff` merge commit named after the branch, tests green, nothing from `origin/main` dropped, other sessions' files untouched. Merge right away when asked, then report.

## Steps

1. **Orient.** `git fetch`. Note your branch, and the main checkout (first line of `git worktree list`). Repo `AGENTS.md`/`CLAUDE.md` merge, PR or conflict rules win over this skill. If the repo lands work through pull requests, push the branch, open or update the PR, and stop there (`gh pr merge` is blocked by the guard). Run `git status` in the main checkout: changes there that aren't yours belong to another session.

2. **Bring main into your branch.** In your worktree: `git merge origin/main`. Resolve conflicts here, never on `main`, keeping both sides' intent (both changelog entries; two edits to one line combined). Derived or binary files follow the repo's rule. When the right combination isn't clear, `git merge --abort` and stop with a recommendation.

3. **Test.** Run the repo's test command on the merged branch. Red means stop and report; do not land it.

4. **Land on main, from the main checkout,** always with `git -C <main checkout>` (the guard cannot resolve a push after `cd`):
   - `git -C <main> merge --ff-only origin/main` to bring local `main` up to date. If local `main` has commits not on origin, merge `origin/main` instead; those commits are someone's work.
   - `git -C <main> merge --no-ff <branch>` with this message:
     ```
     Merge <branch>: <what it brings, one line>

     - <one bullet per change that went in>
     Conflicts kept both sides: <file> (<what came from main>, <what came from the branch>)

     <attribution trailers from this session's instructions>
     ```
     Leave out the Conflicts line when there were none.
   - If git refuses because another session's uncommitted file would be overwritten, land from a temporary worktree instead: `git -C <main> worktree add --detach <tmp> origin/main`, the same `--no-ff` merge there, `git -C <tmp> push origin HEAD:main`; run steps 5 and 6 with `<tmp>` in place of `<main>`, then `git -C <main> worktree remove <tmp>`. Local `main` stays behind for its owner to pull; say so. Never stash, checkout, restore or commit files that aren't yours.

5. **Push.** `git -C <main> push origin main`. Rejected because main moved? Fetch and repeat step 4's first bullet, then push again. Never force.

6. **Verify.** After a fresh fetch, `git -C <main> log HEAD..origin/main` and `git -C <main> log origin/main..HEAD` are both empty.

7. **Clean up, only now.** `git -C <main> worktree remove <your worktree>` (no `--force`; if it has uncommitted files, leave it and say so), then `git -C <main> branch -d <branch>` (lowercase `-d` refuses unmerged work; if it refuses because local `main` is behind, keep the branch and say so). Leave remote branches alone.

8. **Report** in a few lines: the merge commit hash, what went in, how each conflict was resolved, the test result, that both verify logs are empty, what was cleaned up, and any other session's files you left untouched.

## Common mistakes

- `git push origin HEAD:main` from the branch: main then has no "Merge <branch>: …" commit. Use step 4.
- Landing without tests, or leaving the worktree, branch or a stale local `main` behind.
- `git add -A`, `commit -a` or `stash` to get a clean tree. Stage explicit paths; other sessions' files stay as they are.
