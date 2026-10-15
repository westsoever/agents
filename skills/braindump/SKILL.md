---
name: braindump
description: Transform raw thoughts into structured knowledge with domain classification
allowed_tools: ["Read", "Write", "Edit", "Bash"]
---

# Braindump

When the user gives you a raw dump of thoughts, notes, or ideas:

## Step 1 — Read context
If present, skim `CLAUDE.md`, `AGENTS.md`, or `README.md` (first match) for project context. If none exist, skip — work from the conversation alone.

## Step 2 — Classify domains
Sort the input across these domains (use only what applies):
- **Strategy** — positioning, business model, competitive moves
- **Sales** — prospects, outreach, pipeline moves
- **Automation** — flow ideas, tool notes, client requirements
- **People** — contacts, relationships, observations
- **Learning** — frameworks, articles, ideas worth keeping
- **Operations** — process, admin, logistics

## Step 3 — Append to docs/braindump.md
Create `docs/` if it doesn't exist yet, and `docs/braindump.md` if it doesn't exist yet. Append a new dated heading (`## YYYY-MM-DD`) with one sub-heading per domain that has content this round. Don't scatter entries across other files — this is the single running capture log.

## Step 4 — Confirm
List what was appended and under which domain headings. Ask if anything needs deeper development.
