---
name: meeting-capture
description: "Turns the calendar events Lennert attended into meeting notes in the COS vault (04-Resources/Library/Meetings/), so 'who did I meet this week?' can be answered from the vault and the People notes instead of the calendar. Run it in ~/cos. Reads Google Calendar for a day or range (default yesterday), keeps only real meetings he accepted or organised, skips ones that already have a note, links participants to existing People cards by their email: field or an unambiguous name, and writes one note per meeting in the vault's meeting layout. Dry run by default: it lists what it would write and writes nothing until the owner says 'write'. Never creates or edits People cards, never commits or pushes. Use when the owner says 'capture my meetings', 'meeting notes from the calendar', 'log yesterday's meetings', 'who did I meet this week, file it', or types /meeting-capture."
---

# Meeting capture

Turns attended calendar events into `type: meeting` notes in `04-Resources/Library/Meetings/`. Run it from the vault root (`~/cos`).

Hard rules:
- **Dry run unless the owner said "write".** A dry run reads the calendar and the vault and changes nothing. "Write" applies only to the list just shown.
- **Content comes only from the calendar event:** title, time, attendees, description or agenda. Don't invent what was said or decided. If there is no recording note, the note says so.
- **Never create or edit a People card or an org note.** Link to a card only when the match is certain (step 4). Otherwise write the name or address as plain text.
- **Never overwrite a note.** If the file name exists, the meeting already has a note: skip it.
- **Read only Lennert's own calendars:** the primary calendar, plus his personal calendar once he has connected it. `list_calendars` also returns colleagues' calendars. Never read those.
- **TechBBQ meetings are captured too** (owner's decision 2026-11-27), marked `workspace: techbbq` so they can move to `~/bbq/bbqos` later. This departs from `CRITICAL_FACTS.md` and `SOUL.md` ("cos is personal"); don't edit those files.
- No commit, no push. The owner reviews and commits.

## 1. Get the events

Load the tools with ToolSearch (`select:mcp__claude_ai_Google_Calendar__list_events,mcp__claude_ai_Google_Calendar__get_event`). Then call `list_events` with `startTime` and `endTime` as local times without an offset, `orderBy: startTime` and `pageSize: 250`. The range is the one the owner gave ("today", "this week", "since Monday", a date). If he gave none, use yesterday from 00:00 to 23:59. Follow `nextPageToken` until there are no more pages.

## 2. Keep only attended meetings

Go through the events in order. Each one is a **candidate** (TechBBQ ones marked) or a **skip** with a reason:

| Event | Result |
|---|---|
| `start.date` instead of `start.dateTime` (all-day) | skip: all-day |
| `eventType` other than `DEFAULT` (`FOCUS_TIME`, `OUT_OF_OFFICE`, `WORKING_LOCATION`, ...), or a title like "PEAK BLOCK", "Focus", "Deep work" | skip: focus or block |
| `status: cancelled` | skip: cancelled |
| `end` later than now | skip: not over yet |
| Lennert's own attendee entry (`self: true`) has `responseStatus: declined` | skip: declined |
| Lennert's entry has `needsAction` or `tentative` and he is not the organiser | skip: no response (list it, the owner may say it happened) |
| No attendee other than Lennert, after dropping group addresses (below) | skip: no other attendee |
| Lennert accepted, or `organizer.self: true` | candidate |

**Group addresses** are not people: drop them from the attendee list. They include mailing lists and shared mailboxes (`core@`, `calendar@`, `team@`, `info@`, an address whose `displayName` names a group such as "Volunteers" or "All staff") and project mailboxes (`<project>.app@`, `hello@`). Drop attendees with `resource: true` and attendees whose `responseStatus` is `declined` as well. If you are unsure, keep the address as plain text and never link it.

**TechBBQ:** if every remaining attendee other than Lennert has an `@techbbq.org` address, the meeting is TechBBQ work. It is a candidate like any other; its note gets `workspace: techbbq` (step 5). Leave that key out of every other note.

## 3. Skip meetings that already have a note

Read the frontmatter of every note in `04-Resources/Library/Meetings/`. A candidate already has a note if any of these is true:
- a note has `calendar_id:` equal to the event `id`;
- a note has the same `date:` and its `start`-`end` overlaps the event's time (Wispr recordings start a few minutes late and carry their own title, so a title check alone misses them);
- a note on the same date has a title that shares the main words of the event title ("Board Weekly" and "Board Weekly Meeting");
- the file `YYYY-MM-DD <title>.md` from step 5 already exists.

If one of these matches, skip the candidate with the reason "has a note: [[<note title>]]". If a match is only likely (same date, similar title, no time overlap), skip it and say so, so the owner can decide.

## 4. Link participants to People cards

For each remaining attendee, in this order:
1. **Email:** read `email:` from every card in `05-Knowledge/People/` (never `08-Archive/`). The key can be a scalar (`email: a@b.dk`), an inline list (`email: [a@b.dk]`) or a block list. Compare addresses case-insensitively. One card matches: link it. Several cards match: plain text, and flag it.
2. **Name:** only if the attendee has a `displayName`. Run `~/.polychef/cos-lookup/cos-lookup find "<displayName>"`. If exactly one `[person]` result under `05-Knowledge/People/` has that full name as its title or an alias in `Also appears as:`, link it. If the top result has a different name, or more than one card fits, use plain text. Don't derive a name from the email address (`abc@`, `firstname.x123@`): such matches are guesses.
3. **Otherwise** write the `displayName`, or else the address, as plain text. In the dry run only, you may add "possible card (unverified): [[X]]" when a card's first name or `Also appears as:` alias resembles the address, so the owner can add `email:` to that card. It is a hint, never a link, and never goes in the note.

Lennert himself is always the plain `Lennert`, first in the list. He has no card.

## 5. The note

File: `04-Resources/Library/Meetings/YYYY-MM-DD <title>.md`. Use the event title with `<>` turned into `-`, then `/ \ : | ? * < > "` removed and repeated spaces collapsed, as in the existing note "2026-10-30 Lennert - Thomas AI Workspace" ("Lennert <> Thomas : AI Workspace"). Write the event title unchanged in `title:` and `# `.

```markdown
---
type: meeting
title: "<event title>"
date: YYYY-MM-DD
start: YYYY-MM-DDTHH:MM:SS+01:00
end: YYYY-MM-DDTHH:MM:SS+01:00
source: google-calendar
calendar_id: <event id>
workspace: techbbq
participants:
  - Lennert
  - "[[Card Name]]"
  - plain name or address
created: <today>
tags:
  - "meeting"
  - "calendar"
---
# <event title>
Map: [[Areas and Resources]]

From the calendar invite: <organiser>, <time range>, <where: Meet link or location if set>. Participants are the invitees who did not decline; the calendar does not show who joined.

## Agenda
<the event description as plain text: strip HTML tags, keep lists and links. Leave out dial-in numbers, PINs and Meet boilerplate. If the description is empty, write "No agenda in the invite.">

## Notes
No recording note linked.
```

Rules for the layout (from `CLAUDE.md` and `05-Knowledge/cos-schema.md`):
- `# Title` goes on the line right after the closing `---`, with no blank line. `Map:` goes on its own line right after it.
- Links in frontmatter are quoted: `"[[Name]]"`. Plain names are not quoted unless YAML needs it.
- `start` and `end` keep the event's own offset.
- `source: google-calendar` and `calendar_id` are new to the vault. Older meeting notes came from Wispr Flow (`source: wispr-flow`, `wispr_id`, `url`).

**Optional: a recording note.** If a Wispr Flow, Granola or Claude Meetings note exists for the event (Wispr: `get_meeting_by_calendar_id` with the event id, or `search_meetings` by title and date), add its link to the frontmatter as `url:` and replace the `## Notes` line with at most 2 lines summarising it, with the source named ("Wispr Flow summary: ..."). Don't copy the transcript. Skip this step if those connectors are not loaded.

**The Map.** The vault's rule is that Maps link to their notes. In `07-Maps/Areas and Resources.md`, add each new note to the line that starts `- Meetings (in \`Library/Meetings/\`)` as `, [[<file name without .md>]]`. Show this edit in the plan too.

## 6. The plan (dry run) and the write

Always show the plan first:

```
Meeting capture, <range>. Dry run: nothing written.

Would write (N):
1. 2026-11-23 <file title>.md: Lennert, [[Card]], plain name, address
   (possible card for address: [[X]])
2. 2026-11-23 <file title>.md [techbbq]: ...

Skipped (N): <title> (<date>): <reason>, ...

Map: adds N links to the Meetings line in 07-Maps/Areas and Resources.md
```

Give participants only, never the agenda text, in the plan.

If the owner said "write", or says it now, write the notes in "Would write", then make the Map edit. Then run `git status --short` and list the new files. Don't stage, commit or push them.
