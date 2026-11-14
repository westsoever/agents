---
name: twinton-docs
description: Write or update Twinton's internal documentation (manuals, how-tos, runbooks, tool and system pages) in the Twinton vault, in ASD-STE100 (Simplified Technical English), so each note fits the vault's PARA structure, frontmatter schema, Maps and index, and lands on main only as far as the user asked. Use this whenever the user asks to write, add, update or document something "in the vault", "into the Twinton vault", "in the Twinton docs", "under 04-Resources/…", or wants a manual, instructions, a runbook or a how-to for a Twinton tool, system, process or repo, e.g. "write a manual for the gateway setup into the vault", "document how to run the miso app", "turn this README into a how-to in the vault". Also use it when a local doc (README, docs/*.md, a spec, this conversation) should become a vault note. For TechBBQ's GitBook use gitbook-docs instead.
---

# Twinton docs

Turn a request like "write a manual for X into the vault" into a note that looks like it was always there: in the right PARA folder, with valid frontmatter, linked from its Map and the index, written in Simplified Technical English, and on `main` only as far as the user asked.

The vault is the git repo at `~/git/twintontech/twinton-vault` (remote `twintontech/twinton-vault`). It is private and opens in Obsidian. The miso app's vault space shows the same files. This skill lives in a public repo, so it holds the method only. All facts come from the vault itself.

## Why this order matters

The vault is a tree of PARA folders, held together by Maps of Content, `index.md` and `log.md`. Most bad vault writes come from skipping orientation: a note lands at the root or in the wrong folder, it duplicates a note that already exists, it has no frontmatter, or no Map links to it, so nobody finds it. Nothing is final until it is pushed to `main`. Other sessions and the other founders also push to the vault, so the push is the one step to take deliberately.

## Workflow

### 1. Locate the target (read-only)
- `cd ~/git/twintontech/twinton-vault`, `git fetch`, and run `git status`. Uncommitted files that you did not write belong to another session. Leave them alone.
- Read `AGENTS.md` (folder map and hard rules), `index.md` (page catalog) and `07-Maps/Home.md` (entry point). They win over this skill where they differ.
- Map the user's words to a real folder. Match loosely (case, spaces and dashes often differ between the request and the folder name), then confirm with `ls`. Defaults when the user names no place:
  - A manual or how-to for a tool, system or repo goes in `04-Resources/<topic>/`, next to other notes on that topic. If no topic folder fits, use `04-Resources/Manuals/`.
  - A procedure that belongs to one active project goes in `02-Projects/<project>/`.
  - A recurring company procedure with no end date (for example, onboarding a pilot customer) goes in `03-Areas/<area>/`.
  - Never write to the vault root, `08-Archive/` or `.miso/`.
- Search before writing: `rg -il "<topic>" --glob '*.md' --glob '!.miso/**'` and the filenames in `index.md`. If a note on the topic exists, update that note instead of adding a second one.

### 2. Learn the local style
Read one or two sibling notes in the target folder (or, in an empty folder, the nearest notes of the same `type`). Note the heading levels, the `Map:` line under the title, the one-line summary or italic status line, and how they use tables and lists. Match their layout. The wording follows the STE rules in step 3, and those rules win over the neighbours' tone.

### 3. Draft from the source of truth
Write from the real material the user pointed at: the repo's README, `AGENTS.md`, `docs/*.md`, scripts, a spec, or the current conversation. Run `--help` or read the script when a command is in doubt. Do not invent features, flags or paths. For a manual, the useful shape is usually:
- what it is, in one line;
- who uses it and when;
- before you start (access, keys, what must run first);
- the procedure, as numbered steps;
- how to check that it worked;
- what to do when it fails (symptom, cause, fix);
- where the code, config and owners are.

**Frontmatter.** Open every new note with the YAML block from `00-Inbox/frontmatter.md`. That file is the only copy of the schema: read it, do not copy it into other places. Always set `title`, `type`, `created` and `updated` (ISO 8601 UTC, `YYYY-MM-DDTHH:MM:SSZ`). Use `type: runbook` for step-by-step procedures, `reference` for "what this tool is and where it lives", and `spec` for how something must work. Put the source files in `sources`. Quote any `title` or `description` value that contains a colon (`description: "Setup: build and run"`); an unquoted colon breaks the YAML. Add a `status/draft` or `status/mature` tag. Move `updated` forward on every substantive edit.

**Map line.** Under the title, add `Map: [[Home]]` (or the more specific Map, if one covers the topic), the same as the sibling notes.

**Confidentiality.** The vault is private, so internal hosts, ports and paths are fine. Never write a secret value: name the variable and the file (`EXAMPLE_API_TOKEN` in the root `.env`) instead. Do not copy TechBBQ material into the vault; TechBBQ work stays in `bbqos` and GitBook. Mark anything that is a proposal, not a decision, as a draft ("Nothing is agreed until it says so").

**Write in ASD-STE100 (Simplified Technical English).** Every manual and instruction in the vault follows this standard, so a reader who is not a native English speaker, or who is in a hurry, understands it the first time. The rules that matter most:
- Write instructions as short imperative sentences, one action per sentence: "Open the settings page." Use at most 20 words in an instruction and 25 in a description.
- Put a warning or caution before the step it applies to, not after. Write it as `> **Warning:** …` or `> **Caution:** …`. Obsidian callouts (`> [!warning]`) show as raw text in the miso vault space.
- Use numbered lists for steps that must happen in order.
- Use the active voice and simple tenses. Avoid the passive ("the file is saved by the app") and avoid -ing forms as verbs ("is running").
- Keep the articles (the, a). Do not drop them to save space, and repeat the noun when a pronoun could point to two things.
- Give each thing one name and keep it. Do not switch between "app", "tool" and "program" for the same thing. Keep real product, menu, command and file names exactly as the interface or repo shows them, in backticks for commands and paths.
- Choose the simplest common word ("use", not "utilize"; "start", not "commence"). No idioms or figurative language.
- Keep each paragraph to one topic and at most six sentences.

STE is an English standard. If the sibling notes are in Danish, keep the Danish and apply the same spirit (short, active, one action per sentence), and say in your report that the note is not formal STE.

"Mirror the structure" requests (for example, a set of manuals that follows a repo's `docs/` tree) mean copying the folder tree and titles first, then filling in the content. Create the overview note first and link each child note from it.

### 4. Write and wire the note in
1. Write the note at its path. When you edit an existing note, edit its text in place instead of retyping it, so links and sections you did not touch survive.
2. Link the note from its Map: add a bullet with a one-line description under the right heading in `07-Maps/Home.md` (or the more specific Map). Add a heading if no heading fits.
3. Add a row to the right table in `index.md`.
4. Append one row to `log.md`: `| YYYY-MM-DD | <what you added or changed> |`. Never edit past rows.
5. Link to other notes as `[[Note name]]` or `[[Note name|label]]`. The target must exist: the miso vault space shows a link with no matching file as plain text. Images and other files go in the same folder as the note, or in an `assets/` folder next to it, embedded as `![[file.png]]`.

### 5. Read it back
Read the note again from disk and check:
- the frontmatter is valid YAML with `title`, `type`, `created` and `updated`: `python3 -c "import sys,yaml;print(yaml.safe_load(open(sys.argv[1]).read().split('---')[1]))" <note>`;
- every `[[link]]` matches a filename in the vault (`find . -name '<target>.md' -not -path './.miso/*'`);
- the Markdown is plain GFM (headings, lists, tables), with no escaped headings or broken tables;
- the Map, `index.md` and `log.md` entries exist;
- the sentences follow the STE rules (no long sentences, no passive voice, one action per step);
- `git diff` shows no secret values.

Fix the problems before you continue.

### 6. Commit and push only as far as the user asked
Decide from the request:
- **Push to `main`** when the user asked to put, write or add it into the vault ("write a manual for X into the vault", "document it in the vault"). Their instruction is the go-ahead; do not ask again. Push after the read-back passes.
- **Leave it on a branch** when the user asked for a draft, a proposal or a review, or when anything in step 1 was a guess, such as an unclear folder or a possible duplicate. Commit to `docs/<slug>`, push the branch, and open a pull request with `gh pr create`. Report it and say what needs their eye.

For both:
1. `git fetch`, then integrate with `git pull --rebase`. Never force-push, and never reset away commits you did not make.
2. Stage explicit paths only (the note, its assets, the Map, `index.md`, `log.md`). Never `git add -A`.
3. Commit with a message that says what changed, for example "Add gateway setup manual to 04-Resources".
4. After the push to `main`, confirm that `git log HEAD..origin/main` is empty.

If the rebase reports a conflict in `index.md`, `log.md` or a Map, keep both sides' lines. If the conflict is in the note itself, stop and say so; do not resolve it blindly.

## Reporting back
Name things by title and path: the note's title, its folder, the Map that links to it, and whether it is on `main` or on a branch with an open pull request. If you created a folder or chose the `type` yourself, say so. One short paragraph is enough, for example: "Added 'Gateway setup' to 04-Resources/Manuals as a runbook, linked from Home and index.md; it's pushed to main."
