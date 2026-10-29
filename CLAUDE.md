# Owner rules (all projects)

Corrections the owner has repeated across sessions. A repo's own AGENTS.md/CLAUDE.md wins where it is stricter.

## Merging and pushing to main: never lose work
Other sessions and machines often have work in flight on the same repo.
- `git fetch` first. Integrate with merge or rebase; never `--force` push and never reset away commits you didn't make.
- Stage with explicit paths, never `git add -A`. Uncommitted files that aren't yours belong to another session, so leave them alone.
- On a conflict, keep both sides' intent. When it isn't obvious, stop and give a recommendation.
- After the merge, confirm nothing from `origin/main` was dropped (`git log HEAD..origin/main` is empty) and say what went in.
- When briefing a subagent to merge or push, paste the repo's push/release-gate section word for word (not "read AGENTS.md"), and have it quote the section back before pushing to main. Some repos have no gate but deploy to production on every push, so say that too and have it watch the deploy.

## Don't relay stale status as current
Before passing a blocker or status on to the owner or a subagent, re-fetch it (tracker entry, plus one `gh pr view` for PRs). A session-start snapshot can be days old: a 5-day-old "PRs blocked" note was relayed as current and the PRs had already merged.

## Do it yourself, don't hand steps back
If a step is part of the task and you have the means, such as a token in `.env`/`.env.local`, a runner script, or a migration to apply, run it instead of asking the owner to. Repo rules on what needs approval still apply.

## "The previous session"
When the owner refers to an earlier session, find it before asking: search `~/.claude/projects/*/*.jsonl` (`session-search` skill) and `~/.agent/sessions/*/{STATE,NEXT}.md`.

## Compact instructions
When compacting, carry these forward in the summary, verbatim where possible (retro Tier 1, see `~/.claude/skills/retro/SKILL.md`):
- Decisions made this session and the reason for each (what was chosen, what was rejected).
- New synthesis or answers not yet filed anywhere durable (say where they should be filed).
- Files created or edited, and anything left half-written or uncommitted.
- Open questions and deferred items.
- People, projects, or interactions mentioned that are not yet in memory or a log.
- Shared merge points touched (index files, MEMORY.md, STATE.md/NEXT.md, backlogs).
