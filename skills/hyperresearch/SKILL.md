---
name: hyperresearch
description: Rigorous verification pass on research. Either verifies an existing research note (path as argument) or runs the `research` skill first and then verifies its result. Checks that every quotation appears word for word in a source re-opened this session, re-opens each key source to confirm it says what the note claims, checks every DOI against Crossref for retractions and corrections, and counts reprints of one press release as one source. Outputs a verification table (claim, source, verdict confirmed / mismatch / unreachable / retracted) plus a fixed note or a list of fixes. Use when the user says "hyperresearch", "verify this research", "fact-check this note", "check the sources in", or types /hyperresearch.
---

# Hyperresearch

A verification pass on top of `research`. The three checks come from the open-source hyperresearch skill (its "quote-integrity" and source checks); the rest of that pipeline was not adopted because no independent test shows it beats normal research. See `04-Resources/Library/Research/hyperresearch - is there evidence it is a good research skill.md` in the COS vault.

## 0. Pick the mode

- **Argument is a note path** (or a note name in `04-Resources/Library/Research/`): verify that note.
- **Argument is a question:** run the `research` skill on it first (all its steps, but do not file yet), then verify the draft.
- **No argument:** ask which note or question.

Hard rule: a source counts as checked only if you opened it **in this session**. Never mark a claim confirmed from memory, from the note's own wording, or from a search snippet.

## 1. List what to check

Read the note and pull out:
- every text in quotation marks (including blockquotes) and the source it is attributed to;
- every **key claim**: the answer-first bullets, every number, and every claim the answer depends on, with the source cited for it;
- every DOI (also look for `doi.org/` links and the `doi:` frontmatter field).

Skip background sentences that the answer does not rest on. On a long note (more than about 15 key claims), split the sources across subagents, one source group each, and give each the claims and quotes for its sources.

## 2. Quote check

For each quotation, re-fetch the source (WebFetch, `curl -sL`, or `gh api` for GitHub) and search the text for it. Normalise only whitespace, curly vs straight quotes and dashes before matching.
- Found word for word: **confirmed**.
- Found with different words, or only the gist: **mismatch**. The fix is to paraphrase it and drop the quotation marks, or to replace it with the exact words.
- Source will not open (paywall, 403, dead link): **unreachable**. Try one other copy (arXiv, PubMed Central, Wayback `https://web.archive.org/web/2*/<url>`) before giving up.

## 3. Claim check

Re-open each source cited for a key claim and confirm it says that, with the same number, population, date and direction of effect.
- Says it: **confirmed**.
- Says something else, a weaker version, or a different number: **mismatch**, with one line on what the source actually says.
- Not openable: **unreachable** (and the note should say "not confirmed" next to the claim).
- A claim with no source at all: list it as **unsourced**.

## 4. Retraction and independence check

For each DOI:

```bash
curl -s "https://api.crossref.org/works/<doi>" | python3 -c 'import json,sys; m=json.load(sys.stdin)["message"]; print(m.get("title"), m.get("published",{}).get("date-parts")); [print(u.get("type"), u.get("DOI"), u.get("updated",{}).get("date-parts")) for u in m.get("updated-by",[])]'
```

No API key is needed. Send nothing personal: no `mailto`, no name or email in the User-Agent or URL. An `updated-by` entry with `type: retraction` (or `withdrawal`, `removal`) makes every claim resting on that paper **retracted**; `correction` or `expression_of_concern` stays confirmed but gets a note. A 404 from Crossref means the DOI may be wrong: check it.

Independence: when several cited sources are news articles or blogs that reproduce one press release or one study, count them as **one** source and say so. A news piece about a paper is a pointer, not a second source (same rule as `research`).

## 5. Report

Print a verification table:

```markdown
| # | Claim or quote (short) | Source | Verdict | Note |
|---|---|---|---|---|
| 1 | "…" | <title, url> | confirmed | |
| 2 | 72% reduction | <title, doi> | mismatch | source says 27% |
```

Verdicts: confirmed / mismatch / unreachable / retracted (plus unsourced for claims with no source). Then one line of totals, and the independent-source count if it differs from the citation count.

Then the fixes:
- **Note given as argument:** list each fix (quote to paraphrase, number to correct, claim to mark `(not confirmed)` or drop). Apply them only if the user asks, or if the note was written in this session.
- **Question mode:** apply the fixes to the draft, then file it as `research` step 7 says, with a `## Verification` section at the end holding the table and the date checked.

In the COS vault, research notes are in `04-Resources/Library/Research/`. Do not commit unless asked.
