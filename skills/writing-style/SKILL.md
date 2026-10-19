---
name: writing-style
description: Apply plain, direct prose (Google Developer Documentation Style Guide) to any agent-authored text, such as briefs, project status, outreach drafts, reports, plans, docs and PR descriptions. Use whenever writing or editing prose meant for a human reader, not code. Do not use for commit messages or code comments (those follow their own conventions).
---

## Why this exists

Agent-authored prose tends toward "Claude-lish": hedged, over-qualified, first-person-plural ("we'll want to..."), title-cased headings, and passive constructions that hide who's doing what. This skill is a checklist to catch that before it ships, sourced from Google's developer documentation style guide (developers.google.com/style/highlights) — not invented rules.

## Rules to apply

**Voice & grammar**
- Second person ("you"), not first person plural ("we") — the reader is doing the thing, not us.
- Active voice: name who does the action. "Claude built the skill," not "the skill was built."
- Put the condition before the instruction: "If X, do Y" — not "Do Y if X."

**Tone**
- Conversational and direct, not frivolous. Say the finding, then the reason — skip throat-clearing ("It's worth noting that...", "I think it's important to...").
- No pre-announcing future work as if it's decided ("this will eventually...") — state what's true now, flag what's planned as planned.

**Capitalization & formatting**
- Sentence case for headings ("Open loops still live", not "Open Loops Still Live").
- Code-related terms (file names, commands, flags) in code font.
- Serial (Oxford) commas in lists.

**Lists**
- Numbered lists only for sequential procedures (do step 1, then step 2).
- Bulleted lists for anything non-sequential (a set of findings, options, open items).

**Dates**
- Always unambiguous: `YYYY-MM-DD`, never "8/9" or "next Tuesday" without an absolute date attached.

## Where it matters most

- Outreach drafts (speakers, partners, investors): second person, active voice, and specific link text directly affect response rates.
- Plans and status logs: watch for passive voice ("was decided" → name who decided).
- Briefs and reports: keep headings in sentence case and dates absolute.

## In the bbqos vault

- Daily briefs (`01-Daily/*.md`): already largely conversational; check headings stay sentence-case and dates stay absolute.
- Project `ACTIVE_PLAN.md` files: watch for passive voice in Status Log entries ("was decided" → name who decided).
- Outreach drafts (LP Forum, VIP outreach): highest-value target, since second person, active voice, and specific link text all directly affect response rates.

## Anti-pattern check

Before finishing a piece of writing, scan for these and fix on sight:
- "We" where "you" (reader-facing) or a named actor (internal reporting) belongs.
- Title Case headings.
- A passive sentence where the actor is knowable — rewrite active.
- Vague link text ("click here", "see this") — replace with the actual destination's name.
