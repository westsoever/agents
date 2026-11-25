---
name: research-report
description: Turns research into a typeset PDF report (LaTeX, built with xelatex) in the house style of the Giving in Denmark and Tamari copycat-protection reports - draft label, open-questions box, answer first, numbered evidence sections, clickable [S1] citations, linked source list, optional project logo top right. Input is either the research in the current chat or a folder (or note) the owner points at. The research note is the only source of content; the template sets the form only. Use when the owner types /research-report, or asks to "make a report/PDF of this research", "turn this into a report like the Giving in Denmark one", "compile the research into a .tex/.pdf".
---

# /research-report

Makes a `.tex` and a `.pdf` from research, so the owner gets a report they can read, share or
print. `/research` (or `/hyperresearch`) produces the findings; this skill only typesets them.

```
/research-report                      # the research in this chat
/research-report <folder or note.md>  # research someone already wrote down
```

## The one rule: form from the template, content from the note

The owner likes the look of the earlier reports, but matching them must not change the findings.
Filling the template's slots (a "what this means" box, a section per question, a mapping table)
invites claims that exist only to make the report look like the other one. That happened once
(2026-11-25): a moat table got a "where Tamari stands" column the research never produced.

- **The research note is the single source of truth.** Every claim, number, quote, label and
  recommendation in the PDF must already be in the note. If writing the report gives you a new
  idea, add it to the note marked `(inferred)` and tell the owner, or leave it out.
- **Structure follows the research, not the template.** Use the note's sections and order. Leave
  out any template block the note has nothing for. Never add a table column, row, box or section
  to make the layout match an earlier report.
- **Tables only for figures the note already lists side by side.**
- **Shorten, don't strengthen.** Shortening for the page is fine; a stronger verb, a dropped
  caveat, or a lost evidence label is not. Keep every `(inferred)`, evidence level and
  "not read" note.

## 1. Find the source of truth

**From the chat.** If the research in this session was already written to a note, use that note.
Otherwise write the note first, in the `/research` result format (Answer first, Sharpened question,
Evidence, Alternative explanations and limits, Open questions, Sources, with `[S1]` keys), and save
it where the report will live (see step 2). Write only what this session found and cited; don't
search again. Corrections made later in the chat (e.g. "I only saw that source as a snippet")
go into the note.

**From a folder or file.**
- One file: that is the note.
- A folder: list it. The source of truth is the final write-up: a note with `type: research`
  frontmatter, or a file named like a synthesis or the report title (e.g. `05-synthesis.md`, or
  `Giving in Denmark - ....md`). Working files (`00-scope`, `01-...`, `interview-guide`) are
  background, not content. If there is no final write-up, or two candidates, ask the owner which
  one, with your guess. Don't merge working files into new findings yourself.

Read the note in full before writing anything.

## 2. Where the files go

- The report goes in a `report/` folder next to the note's `research/` folder, e.g.
  `~/cos/02-projects/<project>/research/<Title>.md` → `~/cos/02-projects/<project>/report/<slug>.tex`.
  If the note isn't in a `research/` folder, use `report/` beside it. If the owner names a place,
  use that.
- `<slug>`: short kebab-case of the title (`giving-in-denmark`, `copycat-protection`).
- If `<slug>.tex` exists and was built from the same note, update it. If it belongs to something
  else, add a qualifier to the name; never overwrite another report.
- Add a `Report:` line to the note pointing at the PDF.
- Never write into a repo whose pushes publish (e.g. a GitHub Pages site) unless asked.

## 3. Write the .tex

Copy `template.tex` from this skill folder to `report/<slug>.tex` and fill it. Everything between
`<< >>` is a placeholder; none may survive. Keep the preamble as it is apart from:

- **Colours.** Default teal. If the project has brand colours (a `brand.js`, brand kit, or the
  colours of its website), use a dark brand colour that reads as small text for `accent`, a pale
  tint of it for `soft`, its secondary text colour for `muted`, and its text colour for `ink`.
  Note where they came from in a comment.
- **Logo** (see below): only when the project has a logo design source.
- **Header comment:** title, build command and the note's path.

The parts, in order (drop any the note has nothing for):

1. Title block: `DRAFT FOR REVIEW | <date>`, title, subtitle, one line on who it is for and how
   to read the evidence labels.
2. Open questions for review: the note's open questions, as a box.
3. Answer first: the note's bullets, with numbers, sources and the confidence line.
4. Question and scope: the sharpened question, and the reframing if there was one.
5. Numbered evidence sections: one per evidence section in the note, with its heading and order.
   Each claim ends with `\src{Sx}` and an evidence level `\lvl{...}`; our own reasoning gets
   `\inferred`.
6. A recommendations or "what to do" section only if the note has one.
7. Alternative explanations and limits, Open questions.
8. Sources: one `\source{Sx}{citation; primary/secondary; level}{url}` per note source, same keys,
   then a "Not opened" line copied from the note.

LaTeX escaping: `%`, `&`, `$`, `#`, `_` need a backslash. Type `€` directly (Inter has it). Use
` ``quote'' ` for quotes and `--` for ranges.

## 4. Build

```bash
bash ~/.agents/skills/research-report/scripts/build.sh report/<slug>.tex
```

The script installs missing LaTeX packages into the user TeX tree (`tlmgr --usermode`, no sudo;
BasicTeX lacks `tcolorbox` and `xurl`), puts Inter (OFL) into `report/fonts/` from a cache, runs
xelatex twice and removes the aux files. Fix every error and overfull box it reports.

## 5. Check

1. **Look at it.** Render with `pdftoppm -r 70 -png report/<slug>.pdf /tmp/<slug>-p` and read
   every page image: title block, logo, boxes, tables, no text running into the margin, no
   stretched lines (rephrase a long `\texttt` or URL in running text). Delete the images after.
2. **Diff the content against the note.** Go section by section and list anything in the PDF that
   is not in the note: a claim, a number, a stronger word, a table cell, a dropped caveat. Fix
   each one in the PDF (or, if it belongs in the research, in the note first, marked inferred).
3. Check every `[Sx]` in the text has a source entry and every source is cited or listed as not
   opened.

## 6. Report back

Say where the `.tex`, `.pdf` and note are, the page count, what the diff check found and fixed,
and anything left open (placeholders the owner must decide, sources not read). Don't commit
unless the owner asks; in `~/cos`, the vault's own rules apply.

## Logo

Only from a design source: an SVG file, a brand config such as `brand.js`, or a font file. Never
trace a screenshot. If the owner asks for a logo and there is no source, ask for the file.

- **Mark:** `python3 -I scripts/svg2tikz.py mark.svg` (or `--d "<path data>"`, repeatable) prints
  `\fill[ink] ...;` lines with arcs converted to Beziers and y flipped. TikZ's own `svg.path`
  library draws the arcs the wrong way round, and `baseline={(0,y)}` misplaces the picture; use
  `x=1pt, y=1pt, scale=<height>/<viewBox height>, baseline={<height>pt*<y>/<viewBox height>}`
  as in the template comment.
- **Name in the brand font:** XeTeX can't read `.woff2`. Convert it with fontTools in a throwaway
  venv (`python3 -m venv /tmp/ft && /tmp/ft/bin/pip install fonttools brotli`), instance a
  variable font at the site's weight (`fontTools.varLib.instancer.instantiateVariableFont(f,
  {"wght": 600})`), save as `report/fonts/<Name>.ttf`, and copy the font's licence next to it.
- **Sizes and colour** from the site's CSS (mark height, gap, text size, colour), scaled to about
  14pt text. Put it top right through `\reportlogo`.

The Tamari copycat-protection report (`~/cos/02-projects/tamari/report/copycat-protection.tex`)
is a worked example with a logo; Giving in Denmark
(`~/git/westsoever/openoasis/report/giving-in-denmark.tex`) is one with data tables.
