# Owner rules (all projects)

Corrections the owner has repeated across sessions. A repo's own AGENTS.md/CLAUDE.md wins where it is stricter.

## Merging and pushing to main: never lose work
Other sessions and machines often have work in flight on the same repo.
- `git fetch` first. Integrate with merge or rebase; never `--force` push and never reset away commits you didn't make.
- Stage with explicit paths, never `git add -A`. Uncommitted files that aren't yours belong to another session, so leave them alone.
- On a conflict, keep both sides' intent. When it isn't obvious, stop and give a recommendation.
- After the merge, confirm nothing from `origin/main` was dropped (`git log HEAD..origin/main` is empty) and say what went in.

## Do it yourself, don't hand steps back
If a step is part of the task and you have the means, such as a token in `.env`/`.env.local`, a runner script, or a migration to apply, run it instead of asking the owner to. Repo rules on what needs approval still apply.

## "The previous session"
When the owner refers to an earlier session, find it before asking: search `~/.claude/projects/*/*.jsonl` (`session-search` skill) and `~/.agent/sessions/*/{STATE,NEXT}.md`.
