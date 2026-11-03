---
name: sheets-dashboard
description: Build a self-updating dashboard inside a Google Sheet with Apps Script (Code.gs) - a hidden calc tab of formulas over the data tab, plus a Dashboard tab with KPI tiles, charts and month/quarter dropdowns that recompute when new data lands. Use when the owner types /sheets-dashboard or asks for a dashboard, KPI tab, charts or a period picker in a Google Sheet, built or rebuilt by a script.
---

# Sheets dashboard

Build a dashboard tab in a Google Sheet from a script the owner pastes into Extensions > Apps Script. The script writes formulas, not numbers, so the dashboard keeps itself current: new rows in the data tab (from a fetch script, an import or a paste) recompute every tile, chart and dropdown. The script only runs again when the layout changes.

Worked example: `~/git/westsoever/hectorenergy/appsscript/Code.gs` (section `Dashboard`), with its mockup in `mockups/dashboard/`. The generic starting point is `reference/Dashboard.gs` beside this file.

## The shape

```
Data tab (one row per record, headers in row 1)      written by a script, or imported/pasted by hand
   │  read by header name, never by position
   ▼
<Name>Calc tab (hidden, formulas only)                A month key · B quarter key · C day · D… values
   │                                                  L/M dropdown choices · O… small tables for charts
   ▼
Dashboard tab                                         tiles, overview charts, one section per dropdown
```

- **Calc tab:** one row per record. `C` is the day as a real date. `A` (`2026-10 Oct`) and `B` (`2026-Q4`) are built from `C`. The value columns come from the data tab through `INDEX(Data!$A$2:$Z,0,MATCH("<header>",Data!$A$1:$Z$1,0))`, filtered to rows that have a timestamp. `L` and `M` hold the dropdown choices, newest first. From `O` onward are the `QUERY` tables the charts read.
- **Dashboard tab:** tiles are `SUM(FILTER(calc column, condition))`. The overview uses `calc!A2:A<>""`, and a section uses `calc!A2:A=$B$<row>`. Each section has a dropdown in `B<top>` (validation `requireValueInRange` on `L` or `M`). Charts are `EmbeddedChartBuilder`s over the calc tables.
- **Rebuilt from scratch** by `makeDashboard(ss)`: remove the charts, break apart merges, clear validations, clear the tab, then write everything again. The dropdown choices are read first and kept if they still exist. Call it at the end of the data-refresh function and add a menu item (`Build dashboard`).

## Steps

1. **Read the real data first.** Get an export of the sheet (xlsx or csv) and treat it as untrusted. Copy it into its own folder in `/tmp`, then read it with `python3 -I` and `zipfile` plus regex (openpyxl isn't installed). Write down the exact header names, whether dates are text or date numbers, the sort order and the row count. The owner's sheet often differs from what the script that wrote it would produce: columns reordered, sorted by another column, pivot tabs added. That's why the calc tab reads by header name.
2. **Ask only what changes the build** (one `AskUserQuestion`): where the dashboard lives (default: a Dashboard tab in the same sheet), what it shows first (multiSelect), and which periods get a dropdown (default: month and quarter).
3. **Mockup first when the owner wants one:** `/stageshow`, a single still, simple, real numbers from the export, a Sheets-like window with tabs. Get a yes before building.
4. **Build.** Copy `reference/Dashboard.gs` into the project's `Code.gs` and adapt the `ADAPT` block: tab names, `TIME_COL`, `NEEDS`, `VALUES`, `TILES`, `CHART_VALUE`. Add charts or breakdown tables the brief needs (the Hector example has an hour-of-day combo chart and a cost breakdown). Every number stays a formula. If the project already has a `Code.gs`, merge the dashboard section into it rather than adding a second file that declares the same names.
5. **Verify** (below), then hand over.

## Rules learned the hard way

- **Dropdown keys must not look like a date or number.** A bare `2026-10` in the dropdown cell is read as 1 Oct 2026, so validation says "Input must fall within specified range" and every tile shows 0. Use `2026-10 Oct`, which still sorts by date. `2026-Q4` is fine.
- **No `TEXT()` for keys.** Its format codes follow the sheet's locale. Build keys with `YEAR`, `MONTH`, `RIGHT("0"&…,2)` and `MID("JanFeb…",MONTH*3-2,3)`.
- **Timestamps come in two types:** text (`2026-05-02T13:00:00`, when a script wrote it to a text-formatted column) or a date number (when Sheets parsed an import). Handle both: `IF(ISNUMBER(t), INT(ROUND(t*24)/24), DATEVALUE(LEFT(t,10)))`. Round before taking `INT` or `HOUR`, because stored times drift by tiny fractions.
- **Sum with `FILTER`, not `SUMIFS`, for text keys.** A `SUMIFS` criterion like `2026-10` is read as a date.
- **`QUERY` returns days as serial numbers** (46296). Set `d mmm` on the output column; the chart labels its axis from the cell format.
- **Create the Dashboard tab before writing calc formulas** that reference its cells, because a formula naming a tab that doesn't exist yet stays `#REF`. `insertSheet` makes the new tab active, so `setActiveSheet(dash)` before `calc.hideSheet()`.
- **Set `'@'` (text) format on the dropdown cell before `setValue`,** so Sheets stores the key exactly as written.
- **Array results need rows:** `ensureSize(calc, max(20000, dataRows + 1000), cols)`. The data tab must have at least 26 columns for `A:Z` references.
- **Formulas set from Apps Script use English names and commas,** whatever the sheet's locale.
- **Fixed chart ranges** (`O1:O400`) with empty trailing rows are fine.

## Verify before handing over

1. `cp Code.gs /tmp/check.js && node --check /tmp/check.js`
2. `node ~/.agents/skills/sheets-dashboard/scripts/mock-run.js Code.gs --source <DataTab> --header "<exact headers, comma separated>" --choices "2026-10 Oct,2026-09 Sep"`. This runs the build against a strict fake of the Sheets API, so an invented or misspelled method throws. It ends with `ok: … ran end to end; N charts`. Read the printed formulas: quoting inside `QUERY` strings, `$B$<row>` pointing at the right dropdown, tiles referencing the right cells.
3. **Compute the expected numbers independently** from the export with Python (same filters and sums) for the overview, one month and one quarter. Check them against any summary the sheet already has, and give them to the owner to compare with the real dashboard.
4. **Run it for real if you can.** If the Google account that owns the sheet is signed into Chrome (`claude-in-chrome`), open the sheet, run Build dashboard and read the result. If not, say so plainly: the formulas themselves are untested until the owner runs it.

## Hand over

Tell the owner:
- The install steps: Extensions > Apps Script, paste `Code.gs`, save, reload, then the menu's Build dashboard.
- What the dashboard shows.
- The expected numbers to compare against.
- What wasn't tested.

If something looks off, ask for one exact piece of evidence (a screenshot, or what the formula bar shows in the cell) rather than guessing twice.
