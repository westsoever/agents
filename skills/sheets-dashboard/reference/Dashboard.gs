/**
 * Dashboard template for a Google Sheet, built by Apps Script.
 *
 * Copy this into the project's Code.gs (or a second .gs file in the same Apps Script project; all files share one
 * global scope, so no name may be declared twice). Adapt the blocks marked ADAPT, then call makeDashboard(ss) at
 * the end of the function that refreshes the data, and add a menu item for buildDashboard.
 *
 * Shape:
 *   SOURCE tab (data, one row per record, headers in row 1; written by a script or pasted/imported by hand)
 *     -> CALC tab (hidden, formulas only): one row per record with keys and values (A:J), dropdown choices (L, M),
 *        and the small tables the charts read (O onward). It reads SOURCE by header name, never by position.
 *     -> DASH tab: KPI tiles, charts, and one section per picker (month, quarter) with a dropdown.
 * Every number is a formula, so new rows in SOURCE recompute everything without running the script again.
 * makeDashboard rebuilds DASH and CALC from scratch and keeps the dropdown choices.
 */

// ---------- ADAPT: names and columns ----------

const SOURCE = 'Data';       // the data tab
const DASH = 'Dashboard';
const CALC = 'DashCalc';     // hidden helper tab; one per dashboard, never edited by hand
const TITLE = 'Dashboard';
const TIME_COL = 'date';     // source header holding the record's date or timestamp (text or a real date)
// Source columns the value expressions below read. A missing one stops the build with a clear message.
const NEEDS = ['date', 'quantity', 'amount'];
// CALC columns D, E, F… : [CALC header, expression over source columns]. src('x') is the whole source column x.
// Keep it to 7 or fewer so the values stay inside D:J.
const VALUES = [
  ['quantity', src => src('quantity')],
  ['amount', src => src('amount')],
];
// Tiles: label, formula built from m.sum('<CALC column letter>') (the sum over the tile's rows), number format.
// Tiles reference each other by cell only through m.cell(i): the value cell of tile i in the same row.
const TILES = [
  { label: 'Amount', f: m => m.sum('E'), format: '#,##0' },
  { label: 'Quantity', f: m => m.sum('D'), format: '#,##0' },
  { label: 'Per unit', f: m => `IFERROR(${m.cell(0)}/${m.cell(1)},"")`, format: '0.00' },
];
// The value the overview's per-month chart and each section's per-day chart plot (a CALC column letter).
const CHART_VALUE = { col: 'E', label: 'Amount' };

// ---------- Layout (usually left alone) ----------

// One section per picker. key: the CALC column with the period key; list: where its dropdown choices are;
// daily: where its per-day table goes. top: the section's first row on DASH.
const SECTIONS = [
  { name: 'Month', top: 22, key: 'A', list: 'L', daily: ['X', 'Y'], hint: 'Pick a month.' },
  { name: 'Quarter', top: 41, key: 'B', list: 'M', daily: ['AA', 'AB'], hint: 'Pick a quarter.' },
];
const COLOR = { blue: '#4285f4', ink: '#202124', muted: '#5f6368', tile: '#f8f9fa', pick: '#e8f0fe' };

function buildDashboard() {
  const ss = SpreadsheetApp.getActive();
  try {
    makeDashboard(ss);
    ss.toast('Dashboard built.', TITLE, 5);
  } catch (e) {
    SpreadsheetApp.getUi().alert(TITLE + ': ' + e.message);
  }
}

function makeDashboard(ss) {
  const source = ss.getSheetByName(SOURCE);
  if (!source || source.getLastRow() < 2) throw new Error(`The ${SOURCE} tab is empty.`);
  const header = source.getRange(1, 1, 1, source.getLastColumn()).getValues()[0].map(String);
  const missing = NEEDS.filter(n => header.indexOf(n) < 0 || header.indexOf(n) >= 26);
  if (missing.length) throw new Error(`The ${SOURCE} tab needs these columns (within A to Z): ${missing.join(', ')}`);
  if (source.getMaxColumns() < 26) source.insertColumnsAfter(source.getMaxColumns(), 26 - source.getMaxColumns());

  // DASH first: CALC's formulas point at its dropdown cells, and a formula naming a missing tab stays #REF.
  let dash = ss.getSheetByName(DASH);
  const kept = SECTIONS.map(sec => (dash ? String(dash.getRange(sec.top, 2).getValue()) : ''));
  if (!dash) dash = ss.insertSheet(DASH, 0);
  dash.getCharts().forEach(c => dash.removeChart(c));
  const whole = dash.getRange(1, 1, dash.getMaxRows(), dash.getMaxColumns());
  whole.breakApart();
  whole.clearDataValidations();
  dash.clear();
  ensureSize(dash, 70, 12);

  const calc = ss.getSheetByName(CALC) || ss.insertSheet(CALC);
  calc.clear();
  // Array results need the rows to exist; leave room for the data to grow.
  ensureSize(calc, Math.max(20000, source.getLastRow() + 1000), 30);
  writeCalc(calc);
  SpreadsheetApp.flush(); // the dropdown choices are read back below

  layoutDashboard(dash, calc, kept);
  // insertSheet makes the new tab active: show DASH before hiding CALC.
  ss.setActiveSheet(dash);
  ss.moveActiveSheet(1);
  calc.hideSheet();
}

function writeCalc(calc) {
  const src = name => `INDEX(${SOURCE}!$A$2:$Z,0,MATCH("${name}",${SOURCE}!$A$1:$Z$1,0))`;
  const keep = `(${src(TIME_COL)}<>"")`;
  // A and B are built from the day in C with YEAR/MONTH, never TEXT (its codes follow the sheet's locale). The
  // month key carries its name: a bare "2026-10" in the dropdown cell is read as a date and matches nothing.
  const formulas = [
    '=ARRAYFORMULA(IF(C2:C="","",YEAR(C2:C)&"-"&RIGHT("0"&MONTH(C2:C),2)&" "&' +
      'MID("JanFebMarAprMayJunJulAugSepOctNovDec",MONTH(C2:C)*3-2,3)))',
    '=ARRAYFORMULA(IF(C2:C="","",YEAR(C2:C)&"-Q"&ROUNDUP(MONTH(C2:C)/3,0)))',
    // The timestamp is text ("2026-05-02T13:00:00") when a script wrote it, a date serial when Sheets parsed it.
    `=ARRAYFORMULA(LET(t,FILTER(${src(TIME_COL)},${keep}),` +
      'IF(ISNUMBER(t),INT(ROUND(t*24)/24),IFERROR(DATEVALUE(LEFT(t,10)),""))))',
    ...VALUES.map(([, expr]) => `=ARRAYFORMULA(FILTER(${expr(src)},${keep}))`),
  ];
  const headers = ['month', 'quarter', 'day', ...VALUES.map(v => v[0])];
  calc.getRange(1, 1, 1, headers.length).setValues([headers]);
  calc.getRange(2, 1, 1, formulas.length).setFormulas([formulas]);
  calc.getRange('C2:C').setNumberFormat('yyyy-mm-dd');

  // Dropdown choices, newest first.
  calc.getRange('L1:M1').setValues([['months', 'quarters']]);
  calc.getRange('L2:M2').setFormulas([['=SORT(UNIQUE(FILTER(A2:A,A2:A<>"")),1,FALSE)',
    '=SORT(UNIQUE(FILTER(B2:B,B2:B<>"")),1,FALSE)']]);

  // Overview: CHART_VALUE per month (O:P).
  const v = CHART_VALUE.col;
  calc.getRange('O1').setFormula(`=QUERY(A1:J,"select A, sum(${v}) where A <> '' group by A order by A ` +
    `label A 'Month', sum(${v}) '${CHART_VALUE.label}'",1)`);

  // Per section: CHART_VALUE per day, for the period picked in the section's dropdown.
  for (const sec of SECTIONS) {
    const where = `${sec.key} = '"&${DASH}!$B$${sec.top}&"'`;
    calc.getRange(sec.daily[0] + '1').setFormula(`=IFERROR(QUERY(A1:J,"select C, sum(${v}) where ${where} ` +
      `group by C order by C label C 'Day', sum(${v}) '${CHART_VALUE.label}'",1),"")`);
    // QUERY returns days as serial numbers (46296); the chart labels its axis with the cell format.
    calc.getRange(`${sec.daily[0]}2:${sec.daily[0]}`).setNumberFormat('d mmm');
  }
}

function layoutDashboard(dash, calc, kept) {
  dash.setHiddenGridlines(true);
  dash.setColumnWidths(1, 12, 90);
  dash.getRange(1, 1, dash.getMaxRows(), 12).setFontColor(COLOR.ink).setVerticalAlignment('middle');
  dash.getRange('A1').setValue(TITLE).setFontSize(18).setFontWeight('bold');
  dash.setRowHeight(1, 36);
  dash.getRange('A2').setFormula(`="Data "&TEXT(MIN(${CALC}!C2:C),"d mmm yyyy")&" to "&TEXT(MAX(${CALC}!C2:C),"d mmm yyyy")`)
    .setFontColor(COLOR.muted);

  tiles(dash, 4, `(${CALC}!A2:A<>"")`);
  chart(dash, Charts.ChartType.COLUMN, [calc.getRange('O1:O400'), calc.getRange('P1:P400')], 7, 1,
    { title: `${CHART_VALUE.label} per month`, colors: [COLOR.blue] }, 712);

  for (let i = 0; i < SECTIONS.length; i++) {
    const sec = SECTIONS[i];
    const r = sec.top;
    dash.getRange(r, 1).setValue(sec.name).setFontSize(14).setFontWeight('bold');
    dash.setRowHeight(r, 30);
    // Keep the earlier choice if it still exists, else the newest period. Text format before the value, so
    // Sheets stores the key as typed.
    const choices = calc.getRange(`${sec.list}2:${sec.list}500`).getValues().map(x => String(x[0])).filter(String);
    const pick = dash.getRange(r, 2, 1, 2).merge();
    pick.setDataValidation(SpreadsheetApp.newDataValidation()
      .requireValueInRange(calc.getRange(`${sec.list}2:${sec.list}500`), true).setAllowInvalid(false).build());
    pick.setNumberFormat('@').setValue(choices.indexOf(kept[i]) >= 0 ? kept[i] : (choices[0] || ''))
      .setBackground(COLOR.pick).setFontWeight('bold').setHorizontalAlignment('center');
    dash.getRange(r, 4).setValue(sec.hint).setFontColor(COLOR.muted);

    // Exact text match with FILTER: SUMIFS would read a key like 2026-10 as a date criterion.
    tiles(dash, r + 2, `(${CALC}!${sec.key}2:${sec.key}=$B$${r})`);
    chart(dash, Charts.ChartType.COLUMN, [calc.getRange(`${sec.daily[0]}1:${sec.daily[0]}120`),
      calc.getRange(`${sec.daily[1]}1:${sec.daily[1]}120`)], r + 5, 1,
      { title: `${CHART_VALUE.label} per day`, colors: [COLOR.blue] }, 712);
  }
}

/** Up to four tiles across A:L: a label row and a value row, each tile three columns wide. */
function tiles(dash, row, rows) {
  const v = row + 1;
  const m = {
    sum: c => `IFERROR(SUM(FILTER(${CALC}!${c}2:${c},${rows})),0)`,
    cell: i => `${columnLetter(1 + i * 3)}${v}`,
  };
  TILES.slice(0, 4).forEach((t, i) => {
    const c = 1 + i * 3;
    dash.getRange(row, c, 1, 2).merge().setValue(t.label).setFontColor(COLOR.muted).setFontSize(9);
    dash.getRange(v, c, 1, 2).merge().setFormula('=' + t.f(m)).setNumberFormat(t.format)
      .setFontSize(16).setFontWeight('bold').setHorizontalAlignment('left');
    dash.getRange(row, c, 2, 2).setBackground(COLOR.tile);
  });
  dash.setRowHeight(v, 34);
}

function chart(dash, type, ranges, row, col, options, width) {
  let b = dash.newChart().setChartType(type).setNumHeaders(1).setPosition(row, col, 4, 4)
    .setOption('width', width || 352).setOption('height', 260).setOption('legend', { position: 'none' });
  ranges.forEach(r => { b = b.addRange(r); });
  Object.keys(options).forEach(k => { b = b.setOption(k, options[k]); });
  dash.insertChart(b.build());
}

function ensureSize(sheet, rows, cols) {
  if (sheet.getMaxRows() < rows) sheet.insertRowsAfter(sheet.getMaxRows(), rows - sheet.getMaxRows());
  if (sheet.getMaxColumns() < cols) sheet.insertColumnsAfter(sheet.getMaxColumns(), cols - sheet.getMaxColumns());
}

function columnLetter(n) {
  let s = '';
  for (; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
}
