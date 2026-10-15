---
name: ad-execute
description: Cut through context loss — reconcile the current plan file, CLAUDE.md, and claude-mem into a short TL;DR plus ready-to-paste agent prompts for what's actually left
allowed_tools: ["Read", "Bash", "mcp__plugin_claude-mem_mcp-search__search"]
---

# /ad-execute

Built for the moment context has slipped — too many open loops, unclear what's already done, hard to hold the thread. This skill does the reconciliation work so you don't have to hold it in your head: it checks the project's own sources against each other, cuts anything already resolved, and hands you copy-paste-ready prompts for what's left. No essay, no re-reading old sessions.

## Step 1 — Load the current plan
Check for these files at the repo root, first match wins: `ACTIVE_PLAN.md`, `PLAN.md`, `TODO.md`, `ROADMAP.md`. If one exists, read it and pull out only:
- Anything marked as next/in-progress/blocked
- Unchecked items
- A "Blockers" or "Waiting on" section, if present

If none of these files exist, skip this step — there's nothing to reconcile against yet.

## Step 2 — Load hard rules and pre-flight context
Check for `CLAUDE.md`, `AGENTS.md`, or `README.md` (first match) and read it. Note any hard rules and any pre-flight memory-search convention — every prepared prompt in Step 5 must bake this check in, so handed-off agents don't repeat work. If none of these files exist, skip.

## Step 3 — Cross-check against a task tracker, then claude-mem
If this project has its own task-tracking script (e.g. a `tasks-db`-style CLI under `09-agents/` or similar) and it's present and executable, run its "open items" query instead of guessing from the plan file. Otherwise, treat the unchecked items from Step 1 as the current open-loop list directly.

For anything left — items that are conversational/ambiguous commitments not yet captured in any plan file — fall back to claude-mem free-text search to see if it's already been resolved since the plan was last updated:
```
mcp__plugin_claude-mem_mcp-search__search
  query: "<item keywords>"
  project: "<current repo's directory name, or its git remote name if set>"
  orderBy: "date_desc"
  limit: 5
```
Drop any item claude-mem shows as done. Keep items that are still open, partially done, or ambiguous — flag ambiguous ones rather than guessing.

## Step 4 — Reconcile into one clean list
Merge Step 1 + Step 3 into a single deduplicated list of what is *actually* still outstanding right now. Order by: blockers first (nothing else can proceed without these), then anything flagged next/in-progress, then everything else. Cap at 5 items — if there are more, keep the top 5 and name the rest in one line ("+N more in \<plan file\>").

## Step 5 — Generate the TL;DR
Format for a 10-second scan, not a read:
```
## 🎯 Right now
- [ ] <verb-first, one line, ≤12 words>
- [ ] <verb-first, one line, ≤12 words>
...

⛔ Blocked on: <thing>, from <person/system>   (omit if none)
```

## Step 6 — Generate ready-to-hand-off agent prompts
For every item in the TL;DR, write one self-contained prompt block — assume the reader (a fresh agent) has zero memory of this conversation:

```
### <item title>
\`\`\`
Task: <one sentence, concrete outcome>
Context: <2-3 sentences — why this matters, what's already true>
Before starting: query mcp__plugin_claude-mem_mcp-search__search for
  "<relevant keywords>" (project: "<current repo name>") — do not redo work that's already there.
Files/sources: <exact paths or doc names>
Done when: <one concrete, checkable condition>
\`\`\`
```

## Step 7 — Output order
1. The TL;DR block (Step 5) — always first, always short.
2. The prompt blocks (Step 6) — one per item, ready to paste into a new agent session.
3. Nothing else. No recap, no "let me know if," no summary paragraph after the prompts.
