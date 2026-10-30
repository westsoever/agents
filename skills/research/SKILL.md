---
name: research
description: Researches a question properly. Before searching, it sharpens the question (type, scope, population or context, what counts as an answer, feasibility), using Megan Peters' method for developing good research questions (Nature Human Behaviour, 2025). Then it reads widely and closely with primary sources, and writes an answer-first result with linked evidence and open questions. In the COS vault it files the result as a research note in 04-Resources/Library/Research/. Use when the user says "research this", "look into", "find out whether", "what does the evidence say about", "dig into", "is it true that", or types /research.
---

# Research

Turns a loose question into a sharp one, answers it from sources, and says how sure the answer is. The method comes from Peters, M. A. K. (2025). How to develop good research questions. *Nature Human Behaviour* 9, 1759-1761. https://doi.org/10.1038/s41562-025-02292-5. Her four phases map onto steps 1 to 4 below, and her four traps are the checks in step 5.

Hard rules:
- **Never fabricate a source, quote, number, author, DOI or URL.** Cite only what you opened in this session. If you could not open a source, say "not read, cited from <where>".
- Primary sources first: the paper, dataset, spec, official docs, statute, or company filing. A news article or blog post about a paper is a pointer to the paper, not evidence.
- Give every source a date (published or last updated). Flag anything older than the field moves (for example, more than 2 years for AI tools, more than 10 for medicine) as possibly stale.
- Keep separate what a source states, what you infer, and what is unknown. Mark inference as `(inferred)`.
- Ask Lennert at most two questions, and only when the question is genuinely ambiguous and the answer would change what you search. Otherwise state the sharpened question and proceed.
- Health, legal and money questions: state the evidence level (review, trial, observational study, expert opinion, anecdote) for each key claim.

## 1. Sharpen the question (Peters phase 1: self-critical brainstorm)

Write a short "Sharpened question" block before any search:

- **Question:** one sentence, specific enough that you could tell when it is answered.
- **Type:** descriptive ("what happens / what do people do"), mechanistic ("how does X come about"), normative or comparative ("why X and not Y", "which is better for Z"), or a fact check. Do not force a falsifiable hypothesis when the question is descriptive (trap 1).
- **Scope:** population or context (who, where, which version, which time period), the key variables or options being compared, and what is out of scope.
- **What counts as an answer:** for example "a number with a range", "a ranked shortlist of 3 with trade-offs", "yes/no with the strongest study on each side".
- **Feasibility:** can public sources answer it in this session? If not, narrow it and say what you dropped.
- **Critique:** the one or two ways a sceptic would attack the question as phrased (vague term, hidden assumption, wrong comparison). Fix them in the question.

For intervention questions (health, training, nutrition), PICO helps with scope: population, intervention, comparison, outcome. This is a standard checklist, not part of Peters' method.

If the question is ambiguous in a way that changes the search, ask (max two questions, with your default answer stated). Otherwise print the block and continue.

## 2. Read wide (phase 2: build context and connections)

- Search with several phrasings, including the field's own terms. Use WebSearch, then WebFetch to open the actual sources.
- Read beyond the obvious field: include at least one adjacent discipline or angle when it could change the answer (trap 4, "hammer and nail").
- In the vault, check first what Lennert already has: `grep -ril "<key term>" 04-Resources 05-Knowledge 06-Wiki`. Link relevant notes rather than re-researching them.
- Tag each source **primary** (directly answers the sharpened question) or **secondary** (context, method, adjacent field), with a one-line reason.
- If a publisher page blocks the fetch, get metadata from Crossref (`curl -s https://api.crossref.org/works/<doi>`), PubMed, arXiv or Semantic Scholar, and look for an open copy. Do not guess the content.

## 3. Read close (phase 3: distil to the essence)

Re-read the primary sources. For each, note: what exactly they measured, in whom, how big the effect or finding is, and the main limitation. Then ask "what if they had done it differently?" (another population, control, measure, or time frame). This shows where the evidence stops and where the open questions are.

## 4. Answer (phase 4: the final product)

Decide the answer to the sharpened question given the evidence. List the plausible alternative explanations and confounds, and say which the evidence rules out and which it does not. Give a confidence level (high, medium, low) with one line of reason.

## 5. Check the traps

- **Attachment (trap 2):** if the reading shows the question was wrong, already settled, or not the useful one, say so and answer the better question instead. Do not force the original framing.
- **"Someone already did it" (trap 3):** if a source already answers it, say so plainly, then name what differs for Lennert's case (context, scale, date, population).
- **Hypothesis (trap 1)** and **hammer and nail (trap 4):** confirm the answer fits the question type from step 1 and did not default to one field's lens.

## 6. Write the result

Use this structure, in plain direct prose (see the `writing-style` skill):

```markdown
## Answer first
<2-5 bullets: the answer to the sharpened question, with the key numbers, and the confidence level.>

## Sharpened question
<the block from step 1, compact>

## Evidence
- <claim> — <source title>, <author/org>, <date>. <url or doi>. (primary|secondary; evidence level)

## Alternative explanations and limits
- <what the evidence does not rule out>

## Open questions
- <what is still unknown, and what would answer it>

## Sources
1. <full citation with link>
```

Outside the vault, print it in chat. Keep it as long as the question needs and no longer.

## 7. File it (only in the COS vault)

If the current directory has `04-Resources/Library/Research/`, also save the result as `04-Resources/Library/Research/<Title>.md`. Pick a descriptive title (topic plus what it answers). Check the name is free first; if it is taken, add a qualifier rather than overwrite.

```markdown
---
type: research
title: "<Title>"
status: to-read
source: in-session
created: <YYYY-MM-DD>
description: <one sentence with the answer, not the topic>
authors:
year:
venue:
url:
doi:
arxiv:
collection:
category:
---
# <Title>
Map: [[Areas and Resources]]
```

The `# Title` goes on the line directly after the closing `---`, then the `Map:` line, then the body from step 6. Fill `authors`, `year`, `venue`, `url` and `doi` only when the note centres on one paper; otherwise leave them empty. Add a `Related:` line with `[[wikilinks]]` to vault notes from step 2, and a `Task:` line if a backlog task asked for this research. Do not commit unless asked.

## 8. Report

In chat: the answer-first bullets, the note path (if filed), and the open questions. Say which sources you could not open.

## Research prompt template

Lennert can paste this into any Claude chat to get the same discipline without the skill:

```text
Research question: <your question>

Before you search:
1. Restate my question as one specific, answerable sentence. Say its type
   (descriptive, mechanistic, comparative, or fact check), the scope
   (who/where/when, which options), and what would count as an answer.
2. Name the weakest point in my question as phrased and fix it. Ask me at
   most two questions, only if the answer would change what you search;
   otherwise proceed.

Then:
3. Search widely, including one adjacent field. Prefer primary sources
   (papers, data, official docs). Give every source a date and a link.
   Never invent a citation; say so if you could not open a source.
4. Re-read the closest sources and note what they measured, in whom, how
   big the effect was, and the main limitation.
5. If my question turns out to be wrong or already answered, say so and
   answer the better question.

Output: answer first (with confidence: high/medium/low), then the evidence
with links, then alternative explanations, then open questions.
```
