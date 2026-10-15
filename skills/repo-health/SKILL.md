---
name: repo-health
description: Repo hygiene audit — orphaned docs, stale docs, stale plan, and broken links
allowed_tools: ["Read", "Bash"]
---

# Repo Health

Full audit of this repo's documentation. Takes 2-3 minutes. Run periodically or before major decisions.

## Step 1 — Orphaned docs
```bash
find . -name "*.md" -not -path './node_modules/*' -not -path './.git/*' -not -path './.claude/*' -not -path './.obsidian/*' | sort
```
Flag any markdown file not linked from `README.md` or any other doc in the repo.

## Step 2 — Stale docs
```bash
git log -1 --format=%cd --date=short -- <file>
```
Flag docs untouched in the last 90 days.

## Step 3 — Stale plan
If a plan file exists (`ACTIVE_PLAN.md`, `PLAN.md`, `TODO.md`, or `ROADMAP.md` — first match), flag if:
- No update in >14 days (via `git log`), or
- All tasks are checked off but the file isn't marked done/archived

If no plan file exists, skip this step.

## Step 4 — Broken links
Scan markdown files for links (`[text](path)` and `[[wikilink]]` if present) that point at files that don't exist. List each broken link with its source file.

## Step 5 — Report
Output:
```
## Repo Health Report — [date]

**Orphaned docs:** [list or "none"]
**Stale docs:** [list or "none"]
**Stale plan:** [flag or "none"]
**Broken links:** [list or "none"]

**Action queue:**
- [ ] [specific fix needed]
```
