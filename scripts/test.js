#!/usr/bin/env node
/* test: run tests/tests.js against dist/weave.js inside jsdom and report failures. */
const fs = require('fs');
const path = require('path');
const load = require('./load.js');

const { Weave, window } = load();
window.Weave = Weave;
window.eval(fs.readFileSync(path.join(__dirname, '..', 'tests', 'tests.js'), 'utf8').replace('Weave.tests = {};', 'window.Weave.tests = {};'));
const result = Weave.tests.run();
console.log(`${result.total - result.failures.length}/${result.total} passed`);
result.failures.forEach(name => console.log(`  FAIL ${name}`));
process.exit(result.failures.length === 0 ? 0 : 1);
