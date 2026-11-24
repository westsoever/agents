---
name: lol
description: Lists of Lists. Use when the owner types /lol <goal>, asks for "a list of lists", "a lol for X", or to "boil this down" into a checklist. Turns a goal (typed, or a photo of a handwritten list) into a list of lists in the style of Adam Savage's "Every Tool's a Hammer": one top list, a sub-list under every item that isn't a single action, checkboxes with three states, and each branch boiled down to first principles until every leaf is a first physical action. Writes it to listsoflists.md in the repo that holds the work.
---

# /lol: Lists of Lists

`/lol <goal>` builds a list of lists for a goal and boils it down until the owner can start on
the first box today. The input can be a typed goal, a pasted list, or a photo of a handwritten one.

## The method (after "Every Tool's a Hammer")

Adam Savage runs every build from lists. What this skill takes from that:

- **A list of lists.** The goal is the top list. Any item that is more than one action gets its
  own list underneath. Keep going down until each leaf is something you could start right now.
- **Checkboxes, not strike-throughs.** A crossed-out item becomes hard to read, and you lose the
  record of what got done. Use boxes with three states (the owner draws them as empty, half and
  filled):
  - `[ ]` not started
  - `[/]` started, or partly done
  - `[x]` done
  Done items stay on the list. A page of filled boxes is the progress you can see.
- **The list carries the worry.** Everything goes on the list, so nothing has to be kept in your
  head. If it isn't on the list, it isn't part of the plan.
- **Rewrite, don't pile up.** When a list gets messy, write a clean version: carry over the open
  items, drop what no longer matters, keep the done ones as a short record.

## First principles: how to boil down

For each top-level item, before splitting it into steps:

1. **What is this for?** Write the outcome in one line, as a fact that will be true when it is
   done ("The dashboard shows ticket revenue for 2027 from Tito, in DKK"). Not an activity
   ("work on ticket sales").
2. **What must be true for that fact to hold?** List the conditions: the data exists, someone
   can reach it, it is kept up to date, the code reads it, someone checks it. Each condition is
   a sub-item.
3. **Question what was inherited.** Is this item still needed, or is it there because it was
   there before? Is there a simpler way to make the fact true? Cut or merge what doesn't serve
   the outcome, and say why in a few words.
4. **Split until each leaf passes these tests:**
   - one person, one sitting (under about two hours)
   - the first physical action is obvious (send the message, open the file, run the command)
   - it is clear when it is done
5. **Mark what blocks it.** `waiting: <person>` when someone else must act first, `decide:` when a
   choice is needed. A blocked leaf always has a sibling leaf that unblocks it ("ask Sadie for
   access", with the date asked).

## Steps

1. **Take in the goal.** For a photo of a handwritten list, transcribe it faithfully first: the
   owner's wording, their nesting, their box states. Leave out struck-through items but mention
   them under "Dropped". Mark words you can't read as `[?]`. Notes in the margin (like
   "change EUR → DKK") are items too.
2. **Ground it in the real system.** Before you boil down, look at what exists: the repo, the
   code, the data sources, the trackers. A leaf should name the real file, table, tool or person
   ("`PROGRAM_SOURCE` in `lib/program-source.ts` is null"), not a generic step. Read only as much
   as you need to make the leaves concrete. Don't start building.
3. **Write the list of lists** with the format below.
4. **Pick "Start here".** The one to three leaves that are unblocked, small, and unblock the most
   other items. Messages that start someone else's clock (asking for access) usually come first.
5. **Save it.** Write to `listsoflists.md` at the root of the repo that holds the work, as one
   `##` section per goal (create the file if needed; update the goal's section if it exists). If
   the goal has no repo, ask the owner where it lives. Don't commit or push unless the owner asks
   or the repo's rules say to.
6. **Report back** in a few lines: where the list is, "Start here", and the open questions. Don't
   paste the whole list into the chat.

## Format

```markdown
## <Goal>

Goal: <one line, the outcome as a fact>. Written <YYYY-MM-DD>, from <source: typed / photo>.

### Start here
- [ ] <leaf> (<why first>)

### <Top-level item>
Outcome: <one line>
- [ ] <condition>
  - [ ] <leaf>: <first action> (done when <...>)
  - [ ] waiting: <person>, asked <date>

### Dropped
- <item>: <why>

### Open questions
- <question for the owner>
```

## When the owner comes back to a list

- "Update the lol" / a new photo: change box states, add new items, rewrite if it got messy.
- "Boil down <item>": take that one item through the first-principles steps again, deeper.
- Keep the date line current ("Updated <YYYY-MM-DD>").
