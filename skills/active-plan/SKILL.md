---
name: active-plan
description: Load the active project, reconcile with reality, pick next task and execute. Creates the project on first use.
allowed_tools: ["Read", "Bash", "Write", "Edit"]
---

## Step 0 — Check for a queued-task inbox (if this project has one)

Some projects have an automation that drops auto-generated task prompts into an inbox folder. Check for it:
```bash
ls 00-Inbox/agent-queue/*.md 2>/dev/null
```

**If `00-Inbox/agent-queue/` doesn't exist, skip this step entirely** — it's specific to projects that have wired up that automation.

**If queued files exist:** read each one and tell the user what's waiting. For each, offer:
- (a) Spin it up as a new project via the Step 1 creation flow below, or
- (b) Run it as a one-off task in the current session, no new project needed

**On completion of a queued item** (either path): flip its frontmatter `status: queued` → `status: done` — don't delete the file.

## Step 1 — Find or create the active plan

Detect which mode this repo is in:

**PARA-vault mode** — if `02-Projects/` exists at the repo root:
```bash
./09-agents/tasks-db/tasks-db run tasks overview   # if that script exists
ls 02-Projects/ 2>/dev/null
```
Use the vault's per-project convention: each project is `02-Projects/<name>/ACTIVE_PLAN.md`.

**Generic mode** — otherwise, look for a single plan file at the repo root, first match wins: `ACTIVE_PLAN.md`, `PLAN.md`, `TODO.md`, `ROADMAP.md`.

**If no plan exists (either mode), or the user is starting a new one:** Ask:
1. "What's the project name?" (used as the folder name in PARA-vault mode, ignored in generic mode)
2. "What's the goal in one sentence?"
3. "What's the deadline or timeframe?"

Then create the plan using this structure — at `02-Projects/<name>/ACTIVE_PLAN.md` in PARA-vault mode, or `ACTIVE_PLAN.md` at the repo root in generic mode:

```markdown
# [Project Name]

**Goal:** [One sentence — what done looks like]
**Deadline:** [Date or timeframe]
**Owner:** [You]

---

## Session Protocol
- 🤖 Claude can do autonomously
- 🤝 Claude drafts, human reviews
- 🧑 Human-only action required
- Never skip a GATE — these are explicit checkpoints requiring sign-off

## Human-Action Queue
*(tasks Claude can't do — needs you)*

---

## Phase 1 — [Phase name]
- [ ] 🤖 ▶ NEXT [First task]
- [ ] 🤖 [Second task]
- [ ] 🧑 GATE: [Checkpoint description]

## Phase 2 — [Phase name]
- [ ] 🤖 [Task]

---

## Blockers
*(anything waiting on input, credentials, or external events)*

## Status Log
| Date | Summary |
|------|---------|
| [today] | Project created |
```

In PARA-vault mode, also create `02-Projects/<name>/README.md` with the project name and a link to `ACTIVE_PLAN.md`, and add the project to `index.md`'s Active Projects table, if that file exists.

**If one plan exists:** Read it directly.

**If multiple plans exist (PARA-vault mode, several `02-Projects/` entries):** Ask which one to work on.

---

## Step 2 — Reconcile with reality
Check `## Blockers` first — anything resolved? Then verify the project's files still match what the plan describes.

Cross-reference against the plan's checkboxes:
- Items clearly done → tick them off
- New blockers → add to `## Blockers`
- Order still optimal? → reorder if needed, never skip a GATE

## Step 3 — Pick the next task
Go to the `▶ NEXT` marker. If the task is 🧑, prepare everything Claude can, add it to the Human-Action Queue, and move `▶ NEXT` to the next non-blocked task. Say which task you're starting.

## Step 4 — Execute
Work the task. Add discovered sub-tasks to the plan immediately. When done, tick the checkbox and move `▶ NEXT`.

## Step 5 — After each task
Append to `## Status Log` (date + one line). Loop to Step 3 until stopping.

## Completing the project
When the project goal is met:
1. Confirm with the user: "Project complete — archive it?"
2. If yes:
   - **PARA-vault mode:** move `02-Projects/<name>/` to `08-Archive/<name>/`, and remove it from `index.md`'s Active Projects table.
   - **Generic mode:** create `docs/archive/` if it doesn't exist, and move the plan file there (e.g. `docs/archive/ACTIVE_PLAN.md`; add a suffix if one's already there).
3. Return: "Project archived. Run this skill again to start a new one."

## Stopping (project not yet complete)
If this project has a wrap-up convention (e.g. a `/wrap-up` skill), run it. Otherwise, just make sure the most recent `## Status Log` entry captures exactly where you stopped and what's next.
