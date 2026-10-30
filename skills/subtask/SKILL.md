---
name: subtask
description: Use when the owner says "/subtask", "with /subtask", "run it through /subtask agents", "do it in parallel using /subtask", or asks to hand a job to subagents. Splits the work into independent pieces, runs each in its own subagent (in parallel, in the background), then collects and reports the results. The owner can hand over a whole numbered list or a batch of tasks and walk away.
---

# /subtask

The owner hands you a job and wants it done by subagents, not step by step in this session. Start right away, report when done. Text after `/subtask` (or the sentence it sits in) is the job; "with /subtask" at the end of one item in a list applies to that item only.

## Steps

1. **Split.** Break the job into pieces that don't depend on each other: one per repo, per task id, per list item, per file group. Pieces that need another piece's output run after it, not beside it. A job that is a single small step doesn't need a subagent: do it here and say so.
2. **Brief each subagent** like a peer who has no context: goal, the exact paths or ids, what is already ruled out, the repo rules that apply (paste the relevant `AGENTS.md`/`CLAUDE.md` section word for word, not "read AGENTS.md"), what to return. When briefing a subagent to merge or push, follow the owner's global push/merge rule (fetch first, explicit paths, never force-push, confirm nothing from `origin/main` was dropped).
3. **Launch in parallel.** Send all independent subagents in one message with `run_in_background: true`. Use `isolation: "worktree"` when two of them could edit the same repo. Model: the session default, or the one the owner names ("on Opus" means `model: "opus"`). Pick a read-only type (`Explore`, `data-checker`) for checks and counts; `general-purpose` for work that edits.
4. **Keep working or wait.** Do other parts of the owner's message meanwhile. Don't poll: you are notified when a subagent finishes. Never write a result for a subagent that hasn't reported.
5. **Verify.** Read what each subagent says it did against the repo or the tool's real state (a `git log`, a row count, a file listing) before you repeat it. Say plainly when one failed or skipped something.
6. **Report.** One short summary: what each subagent did, what changed, what needs the owner. If the owner said "take all decisions for me", decide, log the decision, and keep going. If they asked for errors in a file ("write them in an error file"), write that file.

## Owner conventions

- **Tasks in the vault** (`~/cos`): each subagent claims its task per `AGENTS.md` (owner `agent:<name>`, `in_progress`, progress log), ends at `status: review` (never `done`), commits per task, and doesn't push unless asked. Don't create new tasks when told not to.
- **Don't send personal data** (the owner's email address, tokens) to external APIs from a subagent unless the brief says to.
- Commit and push stay the owner's call: `/subtask` runs the work, `/commit` and `/merge` land it.
