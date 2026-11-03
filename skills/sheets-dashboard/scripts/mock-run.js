#!/usr/bin/env node
// Runs an Apps Script dashboard build against a strict fake of SpreadsheetApp and prints every value, formula
// and chart option it writes. A method the fake doesn't know throws, which catches misspelled or invented API
// calls before the code reaches a real sheet. It does not evaluate formulas: check those by reading the output.
//
//   node mock-run.js <Code.gs> --source Data --header "date,quantity,amount" [--entry makeDashboard] [--choices "2026-10 Oct,2026-09 Sep"]
//
// Exit 0 and a printout = the script ran end to end. Grep the printout for the formulas you need to eyeball.
const fs = require('fs');
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : dflt; };
const file = args[0];
if (!file || !fs.existsSync(file)) { console.error('usage: node mock-run.js <Code.gs> --source <tab> --header "a,b,c"'); process.exit(2); }
const sourceName = opt('source', 'Data');
const header = opt('header', '').split(',').map(s => s.trim());
const entry = opt('entry', 'makeDashboard');
const choices = opt('choices', 'KEY-1,KEY-2').split(',').map(s => [s]).concat([['']]);

const log = [];
const strict = (name, methods) => new Proxy({}, { get(_, k) {
  if (k === 'then' || typeof k === 'symbol') return undefined;
  if (!(k in methods)) throw new Error(`${name}.${String(k)} is not a known method (or not in this fake: add it if it is real)`);
  return methods[k];
}});

function range(sheet, a1) {
  const self = strict('Range', {
    setValue: v => { log.push(`${sheet.name}!${a1} = ${JSON.stringify(v)}`); return self; },
    setValues: v => { log.push(`${sheet.name}!${a1} = ${JSON.stringify(v)}`); return self; },
    setFormula: f => { log.push(`${sheet.name}!${a1} := ${f}`); return self; },
    setFormulas: f => { f.forEach((row, r) => row.forEach((x, i) => log.push(`${sheet.name}!${a1}[${r},${i}] := ${x}`))); return self; },
    getValue: () => '',
    getValues: () => (sheet.name === sourceName ? [header] : choices),
    getA1Notation: () => a1,
    merge: () => self, breakApart: () => self, clearDataValidations: () => self, setDataValidation: () => self,
    clear: () => self, clearContent: () => self, clearFormat: () => self,
    setNumberFormat: () => self, setFontSize: () => self, setFontWeight: () => self, setFontColor: () => self,
    setFontStyle: () => self, setBackground: () => self, setHorizontalAlignment: () => self,
    setVerticalAlignment: () => self, setWrap: () => self,
    setBorder: (...a) => { if (a.length !== 6 && a.length !== 8) throw new Error('setBorder takes 6 or 8 arguments'); return self; },
  });
  return self;
}

function sheet(name) {
  const s = { name };
  const self = strict('Sheet', {
    getName: () => name,
    getRange: (...a) => range(s, a.join(',')),
    getLastRow: () => 5000, getLastColumn: () => Math.max(header.length, 1),
    getMaxRows: () => 1000, getMaxColumns: () => 26,
    insertRowsAfter: () => self, insertColumnsAfter: () => self,
    clear: () => self, clearContents: () => self, getCharts: () => [], removeChart: () => {},
    setHiddenGridlines: () => self, setColumnWidth: () => self, setColumnWidths: () => self,
    setRowHeight: () => self, setRowHeights: () => self, setFrozenRows: () => self,
    hideSheet: () => self, showSheet: () => self,
    newChart: () => {
      const b = strict('EmbeddedChartBuilder', {
        setChartType: () => b, setNumHeaders: () => b, addRange: () => b, build: () => ({}),
        setPosition: (...a) => { if (a.length !== 4) throw new Error('setPosition takes 4 arguments'); return b; },
        setOption: (k, v) => { log.push(`  chart ${k} = ${JSON.stringify(v)}`); return b; },
      });
      return b;
    },
    insertChart: () => { log.push(`${name}: chart inserted`); },
  });
  return self;
}

const sheets = { [sourceName]: sheet(sourceName) };
const ss = strict('Spreadsheet', {
  getSheetByName: n => sheets[n] || null,
  insertSheet: n => (sheets[n] = sheet(n)),
  setActiveSheet: () => {}, moveActiveSheet: () => {}, toast: () => {},
});
const dv = strict('DataValidationBuilder', {
  requireValueInRange: () => dv, requireValueInList: () => dv, setAllowInvalid: () => dv, build: () => ({}),
});
global.SpreadsheetApp = {
  getActive: () => ss, getActiveSpreadsheet: () => ss, flush: () => {}, newDataValidation: () => dv,
  getUi: () => ({ alert: m => { throw new Error('ALERT ' + m); } }),
};
global.Charts = { ChartType: { COLUMN: 'COLUMN', BAR: 'BAR', LINE: 'LINE', COMBO: 'COMBO', PIE: 'PIE', AREA: 'AREA' } };

// Apps Script top-level const/let/function declarations become globals; eval in this scope does the same here.
eval(fs.readFileSync(file, 'utf8') + `\n;${entry}(SpreadsheetApp.getActive());`);
console.log(log.join('\n'));
console.log(`\nok: ${entry} ran end to end; ${log.filter(l => l.endsWith('chart inserted')).length} charts`);
