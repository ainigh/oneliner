#!/usr/bin/env node
/* check-flagships: drive the two flagship applications in jsdom, the way a person would use them. */
const path = require('path');
const { JSDOM } = require('jsdom');

const root = path.join(__dirname, '..');
const failures = [];

function open(file) {
  return JSDOM.fromFile(path.join(root, file), { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true });
}

function settle(dom, ms = 800) {
  return new Promise(resolve => setTimeout(() => resolve(dom), ms));
}

function expect(name, ok, detail) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : ` — ${detail}`}`);
  if (!ok) failures.push(name);
}

function driver(dom) {
  const document = dom.window.document;
  const count = selector => document.querySelectorAll(selector).length;
  const all = selector => [...document.querySelectorAll(selector)];
  const one = selector => document.querySelector(selector);
  const text = selector => (one(selector) || { textContent: '' }).textContent;
  const click = target => (typeof target === 'string' ? one(target) : target).dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true }));
  const press = (key, options = {}) => document.dispatchEvent(new dom.window.KeyboardEvent('keydown', Object.assign({ key, bubbles: true }, options)));
  const type = (selector, value) => { const el = one(selector); el.value = value; el.dispatchEvent(new dom.window.Event('input', { bubbles: true })); };
  const toggle = selector => { const el = one(selector); el.checked = !el.checked; el.dispatchEvent(new dom.window.Event('change', { bubbles: true })); };
  const Weave = dom.window.eval('Weave');
  const audit = () => Weave.library.accessibility.audit(document.body).map(row => row.message);
  return { document, Weave, count, all, one, text, click, press, type, toggle, audit };
}

open('apps/relay.html').then(settle).then(dom => {
  const it = driver(dom);
  expect('relay draws a three pane shell', it.count('.weave-shell') === 1 && it.count('.weave-pane') === 3, `${it.count('.weave-pane')} panes`);
  expect('relay windows twelve hundred threads', it.Weave.application.threads.length === 1200 && it.count('.weave-list-row') < 30, `${it.count('.weave-list-row')} rows in the document`);
  expect('relay lists every folder with a count', it.count('.weave-pane[data-pane=rail] .weave-row-button') === 5 && it.count('.weave-badge') === 5, `${it.count('.weave-badge')} badges`);

  const inboxRows = it.count('.weave-list-row');
  it.click(it.all('.weave-pane[data-pane=rail] .weave-row-button')[2]);
  expect('relay switches folder from the rail', it.Weave.application.store.state.folder === 'sent', it.Weave.application.store.state.folder);
  it.click(it.all('.weave-pane[data-pane=rail] .weave-row-button')[0]);

  expect('relay opens nothing until asked', it.count('.weave-empty-state') === 1, it.text('.weave-empty-state'));
  it.click(it.one('.weave-pane[data-pane=list] .weave-list-row .weave-row-button'));
  expect('relay opens a thread into the reader', it.count('.weave-empty-state') === 0 && it.count('.weave-card') > 0, `${it.count('.weave-card')} messages`);
  expect('relay marks the opened thread read', it.Weave.application.threadById(it.Weave.application.store.state.chosen).unread === false, 'still unread');

  const firstChosen = it.Weave.application.store.state.chosen;
  it.press('j');
  expect('relay walks the list with j', it.Weave.application.store.state.chosen !== firstChosen, `still ${firstChosen}`);
  it.press('k');
  expect('relay walks back with k', it.Weave.application.store.state.chosen === firstChosen, String(it.Weave.application.store.state.chosen));

  const before = it.Weave.application.visible(it.Weave.application.store.state).length;
  it.type('.weave-search-box', 'northwind');
  expect('relay filters the folder as you type', it.Weave.application.visible(it.Weave.application.store.state).length < before, `${before} then ${it.Weave.application.visible(it.Weave.application.store.state).length}`);
  it.type('.weave-search-box', '');
  expect('relay restores the folder when the query clears', it.Weave.application.visible(it.Weave.application.store.state).length === before, String(before));

  it.toggle('.weave-toolbar .weave-check-mark');
  expect('relay checks every visible thread at once', it.Weave.application.store.state.checked.length === before, `${it.Weave.application.store.state.checked.length} of ${before}`);
  const archived = it.Weave.application.store.state.checked.length;
  it.click(it.all('.weave-toolbar .weave-button')[0]);
  expect('relay moves the checked threads', it.Weave.application.visible(it.Weave.application.store.state).length === before - archived, String(it.Weave.application.visible(it.Weave.application.store.state).length));
  expect('relay offers an undo in a pinned toast', it.count('.weave-toast-host .weave-alert') === 1 && it.text('.weave-toast-host .weave-actions').includes('Undo'), it.text('.weave-toast-host'));
  it.click(it.all('.weave-toast-host .weave-button')[0]);
  expect('relay dismisses the toast when undo is taken', it.count('.weave-toast-host .weave-alert') === 0, `${it.count('.weave-toast-host .weave-alert')} left`);

  it.press('c');
  expect('relay opens compose over the page', it.count('.weave-dialog-box') === 1 && it.count('.weave-scrim') === 1, `${it.count('.weave-dialog-box')} dialogs`);
  expect('relay traps focus inside compose', it.one('.weave-dialog-box').contains(it.document.activeElement), String(it.document.activeElement && it.document.activeElement.className));
  it.click(it.one('.weave-dialog-box .weave-button[type=submit]'));
  expect('relay refuses to send an empty message', it.count('.weave-dialog-box') === 1 && it.count('.weave-dialog-box .weave-note') > 0, 'the dialog closed');
  it.type('.weave-dialog-box input[name=to]', 'ada@example.com');
  it.type('.weave-dialog-box input[name=subject]', 'Lunch on Friday');
  it.type('.weave-dialog-box input[name=body]', 'One o clock?');
  it.click(it.one('.weave-dialog-box .weave-button[type=submit]'));
  expect('relay sends a valid message and says so', it.count('.weave-dialog-box') === 0 && it.text('.weave-toast-host').includes('Lunch on Friday'), it.text('.weave-toast-host'));

  it.press('c');
  it.press('Escape');
  expect('relay closes compose on escape', it.count('.weave-dialog-box') === 0 && it.count('.weave-scrim') === 0, 'a layer survived escape');
  expect('relay leaves the page scrollable afterwards', it.Weave.library.interaction.scrollLocks.depth === 0, String(it.Weave.library.interaction.scrollLocks.depth));

  it.press('k', { ctrlKey: true });
  expect('relay opens the command palette', it.count('.weave-dialog-box .weave-menu') === 1, `${it.count('.weave-dialog-box')} dialogs`);
  it.press('Escape');
  it.press('?');
  expect('relay shows the keyboard sheet', it.count('.weave-sheet-box .weave-kbd') === 4, `${it.count('.weave-sheet-box .weave-kbd')} keys`);
  it.press('Escape');

  expect('relay passes its own accessibility audit', it.audit().length === 0, JSON.stringify(it.audit()));
  expect('relay leaves no overlay behind', it.Weave.library.overlays.openCount() === 1, `${it.Weave.library.overlays.openCount()} children in the host`);
  return null;
}).then(() => process.exit(failures.length === 0 ? 0 : 1)).catch(error => { console.error(error); process.exit(1); });
