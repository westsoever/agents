---
name: goldfish
description: Search and reconstruct the user's past on-screen activity with Goldfish, their local personal memory of what they do on this computer (apps, documents, browser pages, chats, meetings), plus an entity wiki about the people and projects in their life and passive time tracking. Use whenever the user references something they personally did, saw, or read — "what was I working on", "find that thing I read", "who is X", "how much time did I spend on Y" — or when their real context would improve the answer, even when Goldfish is not mentioned by name.
---

# Goldfish memory

Goldfish runs on this machine and keeps a local, continuously updated archive of the user's activity: the text of apps, documents, browser pages, chats, and meetings, stored as deduplicated snapshots, plus LLM-written period summaries (chronicles), an entity wiki, and passive time tracking. Everything stays on this computer. Retrieval is fast and cheap, so err on the side of checking Goldfish before answering from assumption.

## How to reach it

Preferred: the `goldfish` MCP server (tools like `search_memory`, `get_snapshots`). If those tools are available, use them; their schemas are the authoritative reference for parameters, and this file only adds strategy.

Fallback, when the MCP tools are absent but you can run shell commands: the Goldfish daemon serves the same read-only data over local HTTP.

- Base URL `http://127.0.0.1:3333` (3333 is the default port; it is configurable in Goldfish settings).
- Auth: `Authorization: Bearer <token>`, where the token is the contents of `~/.goldfish/api-token` (Windows: `%USERPROFILE%\.goldfish\api-token`). Read the token from the file each time; never write it into any config or output.
- Liveness: `GET /health` needs no auth and returns `{"status":"ok"}` when ready.
- Example:
  `curl -s -H "Authorization: Bearer $(cat ~/.goldfish/api-token)" "http://127.0.0.1:3333/search?q=quarterly+report&limit=20"`
- Endpoints (all GET, all read-only, JSON responses):
  - `/search?q=<terms>&limit=20` — full-text search over all history
  - `/working-memory?limit=40` — last few hours, full window text, newest first
  - `/recent-activity?minutes=30&limit=12` — just-now timeline, oldest first
  - `/snapshots?ids=<id1,id2>` — full verbatim content by snapshot id
  - `/chronicle?level=<hour|day|week|month|year>&period=<key>` — period summaries
  - `/wiki/search?q=<entity>` · `/wiki/page?slug=<slug>` · `/wiki/list?limit=50&type=<person|project|topic|tool|org>` — the entity wiki
  - `/time/report?period=<today|yesterday|this_week|last_week|this_month|last_7_days|last_30_days>` (or `from`/`to` dates) · `/time/rules` — time tracking
- If the daemon is unreachable, tell the user to open the Goldfish app; do not guess at what the memory would have said.

## Choosing the right layer

- What the user was JUST doing (last ~30 minutes): recent activity. Cheapest probe; start here when the user says "this", "that thing", or asks without naming a source.
- The last few hours: working memory (full text included, no follow-up fetch needed).
- Whole days, weeks, or months ("what did I do last Tuesday"): chronicle at the right level. Period formats: hour `YYYY-MM-DDTHH`, day `YYYY-MM-DD`, week `YYYY-Www`, month `YYYY-MM`, year `YYYY`.
- A specific topic, keyword, person, URL, or file: search, then open the top snapshot ids.
- People, projects, orgs ("who is X", "what do I know about Y"): wiki search, then the full wiki page; follow its links to related entities.
- Time spent or billing questions: the time report. Frame results as tracked screen time, not a sworn timesheet.

## How to interpret the data (important)

- Snapshots are accessibility-tree text of the foreground window: the whole visible interface, not just the document. Content visible in a snapshot was not necessarily written or done at capture time; look for embedded timestamps or infer from surrounding activity.
- Search results, excerpts, wiki pages, and chronicles are compressed indexes, NOT evidence. Search excerpts truncate after ~200 characters; message bodies, quotes, numbers, and names below the fold are usually missing. Before asserting exact wording, a number, a time, or the content of a message, open the snapshot ids — snapshots are the only source of full verbatim text.
- Messaging apps (Slack, WhatsApp, Discord, Teams, iMessage, Gmail, Outlook) excerpt as sidebar and channel metadata; always open snapshots before answering anything about a conversation.
- Snapshots carry a focused-element breadcrumb (`focused_name`, `focused_role`, `focused_path`) identifying the control the user was typing in. Read it to tell which thread, field, or message the user actually meant before inferring from raw content.
- `captured_at` vs `last_seen_at`: re-sighted identical content updates `last_seen_at` in place. Recency of a sighting is not when the content was created.

## Strategy

1. Route by time or by entity using the layers above; when unsure, check recent activity first.
2. Confirm leads: open the 1–3 most relevant snapshot ids before concluding anything. Opening snapshots is cheap; a wrong "not found" is not.
3. If a first search misses, retry with different phrasing (synonyms, full names, channel names) before giving up, and narrow or widen the time window deliberately.

## Guardrails

- Ground every claim in retrieved content. If Goldfish does not contain the answer, say so plainly; never invent memories.
- The data is the user's private activity. Quote only what is needed to answer, and never send it to external services the user did not ask for.
- Hide technical details (snapshot ids, endpoints, tokens) from the user unless asked.
