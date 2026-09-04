#!/usr/bin/env node
/* check-apps: load each html application in jsdom and assert it drives the real DOM. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const failures = [];

function open(file) {
  return JSDOM.fromFile(path.join(root, file), { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true });
}

function settle(dom) {
  return new Promise(resolve => setTimeout(() => resolve(dom), 250));
}

function expect(name, ok, detail) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : ` — ${detail}`}`);
  if (!ok) failures.push(name);
}

open('sample.html').then(settle).then(dom => {
  const document = dom.window.document;
  const first = document.querySelector('.spawned');
  expect('sample spawns a button', first !== null, 'no .spawned button');
  first.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  expect('sample delegate spawns another', document.querySelectorAll('.spawned').length === 2, `saw ${document.querySelectorAll('.spawned').length}`);
  return open('todo.html').then(settle);
}).then(dom => {
  const document = dom.window.document;
  const Weave = dom.window.eval('Weave');
  Weave.application.add('write the spec');
  Weave.application.add('build the thing');
  expect('todo renders items from specs', document.querySelectorAll('#list li').length === 2, `saw ${document.querySelectorAll('#list li').length}`);
  document.querySelector('#list li input').dispatchEvent(new dom.window.Event('change', { bubbles: true }));
  expect('todo toggles through delegation', document.querySelectorAll('#list li.done').length === 1, 'no done item');
  const stored = Weave.library.storage.local.get('weave.todo.items');
  expect('todo persists to storage when the host allows it', stored === undefined || stored.length === 2, JSON.stringify(stored));
  Weave.application.show('done')();
  expect('todo filters', document.querySelectorAll('#list li').length === 1, `saw ${document.querySelectorAll('#list li').length}`);
  document.querySelector('#list li button.remove').dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  expect('todo removes', Weave.application.items.length === 1, `saw ${Weave.application.items.length}`);
  expect('todo passes its own accessibility audit', Weave.library.accessibility.audit(document.body).length === 0, JSON.stringify(Weave.library.accessibility.audit(document.body).map(row => row.message)));
  return open('tests.html').then(settle);
}).then(dom => {
  const text = dom.window.document.querySelector('#output').textContent;
  expect('tests.html runs the same table', /^\d+\/\d+ passed$/.test(text.split('\n')[0]) && !text.includes('FAIL'), text.slice(0, 200));
}).then(() => process.exit(failures.length === 0 ? 0 : 1)).catch(error => { console.error(error); process.exit(1); });
