---
name: decision-flow
description: Turn a decision into a flow diagram of outcomes with probability ratings. Use when the user says "help me decide", "decision tree", "what happens if I choose", "what are my options for", "map out this decision", or types /decision-flow.
---

# /decision-flow

Turns one decision into a Mermaid flowchart: options, short and long-term outcomes, and a rating for each. Write nothing to disk unless the user says so.

## Steps

1. **Get the decision.** If the user gave none, ask for it in one line.
2. **Ask follow-up questions in one batch** (3 to 5, numbered, short). Cover what you cannot guess: the options they see, the deadline, what "success" means to them, constraints (money, time, people), and what they fear. Skip anything already answered. Wait for the answers.
3. **Build the options.** Use 2 to 4 options, including "do nothing" or "wait" when it is real. For each option give one short-term outcome (weeks to months) and 2 long-term outcomes (years) that follow from it. The long-term likelihoods under one short-term outcome add up to 100%.
4. **Rate.** For each option: probability of success (%), measured against the success the user named, and consistent with the best long-term outcome's likelihood. For each outcome: likelihood (%). Give a one-line basis for every number (a fact from the user, a base rate, or a plain guess, and say which).
5. **Draw the diagram** (rules below), then the table of numbers, then a one-line recommendation and the biggest unknown.
6. **Say the numbers are estimates**, not predictions.
7. **Offer** to save the result as a note in `~/cos/00-Inbox/`. Save only if the user says yes.

## Mermaid rules

- `flowchart TD`. One node per line.
- Quote every label: `A["text"]`. No quotes, brackets, `#`, `|` or `;` inside a label. Use `<br/>` for a line break.
- Node ids are plain letters or digits: `D`, `O1`, `O1a`.
- Decision `D`, options `O1..On` as `O1["Option name<br/>Success 60%"]`, outcomes as `O1a["Short term: text<br/>Likelihood 70%"]`.
- Edges: `D --> O1`, `O1 --> O1a`, `O1a --> O1b` and `O1a --> O1c` (short to long term).
- Style options with `classDef`: green for success above 60%, amber for 40 to 60%, red below 40.

## Output layout

1. The Mermaid block.
2. A table: option, success %, basis; then each outcome, likelihood %, basis.
3. Recommendation (one line) and biggest unknown (one line).
4. "These numbers are estimates from what you told me, not predictions."
