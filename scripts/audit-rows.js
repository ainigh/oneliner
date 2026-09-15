#!/usr/bin/env node
/* audit-rows: remove each generated table row in turn and assert exactly its feature disappears. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const source = fs.readFileSync(path.join(__dirname, '..', 'dist', 'weave.js'), 'utf8');

function evaluate(text) {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.test/' });
  return dom.window.eval(text + '\nWeave;');
}

function reach(root, dotted) {
  return dotted.split('.').reduce((carried, key) => carried[key], root);
}

function capitalize(key) {
  return key.slice(0, 1).toUpperCase() + key.slice(1);
}

/* Each case names a table, the object its generator fills, and how a row key becomes the name or names it generates. */
const cases = [
  { table: 'Weave.library.elements.tags', target: 'library.elements', nameOf: key => key },
  { table: 'Weave.library.elements.svgTags', target: 'library.elements.svg', nameOf: key => key },
  { table: 'Weave.library.elements.inputTypes', target: 'library.elements.inputs', nameOf: key => key },
  { table: 'Weave.library.events.types', target: 'library.events.handlers', nameOf: key => key },
  { table: 'Weave.library.browser.httpMethods', target: 'library.network', nameOf: key => key },
  { table: 'Weave.library.effects.presets', target: 'library.effects', nameOf: key => key },
  { table: 'Weave.library.predicates.typeNames', target: 'library.predicates', nameOf: key => key },
  { table: 'Weave.library.predicates.instanceTests', target: 'library.predicates', nameOf: key => key },
  { table: 'Weave.library.browser.keyNames', target: 'library.interaction', nameOf: key => 'on' + key.slice(0, 1).toUpperCase() + key.slice(1) },
  { table: 'Weave.library.browser.dateParts', target: 'library.browser.dateReaders', nameOf: key => key },
  { table: 'Weave.library.components.blueprints', target: 'library.components', nameOf: key => key },
  { table: 'Weave.library.components.tokens', target: 'library.components.vars', nameOf: key => key },
  { table: 'Weave.library.components.interactive', target: 'library.components.stateRules', nameOf: (key, root) => ['focus' + capitalize(key)].concat(Object.keys(reach(root, 'library.components.disableable')).includes(key) ? ['off' + capitalize(key)] : []) },
  { table: 'Weave.library.components.pressable', target: 'library.components.stateRules', nameOf: key => ['pressed' + capitalize(key), 'hover' + capitalize(key)] },
  { table: 'Weave.library.components.states', target: 'library.components.stateNames', nameOf: key => key },
  { table: 'Weave.library.components.tones', target: 'library.components.toneNames', nameOf: key => key },
  { table: 'Weave.library.components.modifiers', target: 'library.components.markNames', nameOf: key => key },
];

const baseline = evaluate(source);
const lines = source.split('\n');
const failures = [];
let checked = 0;

cases.forEach(row => {
  const before = new Set(Object.keys(reach(baseline, row.target)));
  Object.keys(reach(baseline, row.table.replace(/^Weave\./, ''))).forEach(key => {
    const prefix = `${row.table}.${key} = `;
    const index = lines.findIndex(line => line.startsWith(prefix));
    if (index < 0) return;
    const trimmed = lines.slice(0, index).concat(lines.slice(index + 1)).join('\n');
    const after = new Set(Object.keys(reach(evaluate(trimmed), row.target)));
    const gone = [...before].filter(name => !after.has(name)).sort();
    const added = [...after].filter(name => !before.has(name));
    const expected = [row.nameOf(key, baseline)].flat().sort();
    checked += 1;
    if (gone.join(',') !== expected.join(',') || added.length > 0) {
      failures.push(`${row.table}.${key}: removed ${JSON.stringify(gone)} expected ${JSON.stringify(expected)}${added.length ? ` and added ${JSON.stringify(added)}` : ''}`);
    }
  });
});

console.log(`${checked - failures.length}/${checked} row removals behaved exactly as the table predicts`);
failures.forEach(text => console.log(`  FAIL ${text}`));
process.exit(failures.length === 0 ? 0 : 1);
