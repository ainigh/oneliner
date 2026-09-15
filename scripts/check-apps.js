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
  return new Promise(resolve => setTimeout(() => resolve(dom), 750));
}

/* tests.html runs the whole table in the browser host, including the async rows, so the harness waits for the run to finish rather than guessing how long it takes. */
function finished(dom) {
  const started = Date.now();
  return new Promise(resolve => {
    const timer = setInterval(() => {
      const running = dom.window.document.querySelector('#output').textContent === 'running…';
      if (!running || Date.now() - started > 10000) { clearInterval(timer); resolve(dom); }
    }, 20);
  });
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
  return open('studio.html').then(settle);
}).then(dom => {
  const document = dom.window.document;
  const Weave = dom.window.eval('Weave');
  Weave.application.reset();
  const count = () => document.querySelectorAll('.weave-card').length;
  const tally = () => [...document.querySelectorAll('.weave-stat-tile .weave-value')].map(node => node.textContent).join(',');
  expect('studio draws the queue once per submission', count() === 4, `saw ${count()}`);
  expect('studio tallies the same store in a second view', tally() === '1,2,1', tally());
  const first = document.querySelector('.weave-card .weave-button');
  const before = first.textContent;
  first.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  expect('studio judging repaints both views', tally() !== '1,2,1', tally());
  expect('studio keeps the card node across a repaint', document.querySelector('.weave-card .weave-button') === first, 'the card was rebuilt');
  Weave.application.store.undo();
  expect('studio steps back through history', document.querySelector('.weave-card .weave-button').textContent === before, document.querySelector('.weave-card .weave-button').textContent);
  expect('studio knows it can redo', Weave.application.store.canRedo() === true, 'redo was not offered');
  Weave.application.store.redo();
  expect('studio steps forward again', tally() !== '1,2,1', tally());
  const stored = Weave.library.storage.local.get('weave.studio.queue');
  expect('studio persists the store when the host allows it', stored === undefined || stored.rows.length === 4, JSON.stringify(stored));
  return open('tests.html').then(finished);
}).then(dom => {
  const text = dom.window.document.querySelector('#output').textContent;
  expect('tests.html runs the same table', /^\d+\/\d+ passed$/.test(text.split('\n')[0]) && !text.includes('FAIL'), text.slice(0, 200));
}).then(() => process.exit(failures.length === 0 ? 0 : 1)).catch(error => { console.error(error); process.exit(1); });
