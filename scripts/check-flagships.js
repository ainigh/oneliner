#!/usr/bin/env node
/* check-flagships: drive the two flagship applications in jsdom, the way a person would use them. */
const path = require('path');
const { JSDOM, ResourceLoader } = require('jsdom');

const root = path.join(__dirname, '..');
const failures = [];

/* the pages are served from an http origin, so history and hash routing behave as they do in a browser; every request is read from disk. */
const origin = 'http://weave.test/';
class DiskLoader extends ResourceLoader {
  fetch(url, options) { return super.fetch(url.startsWith(origin) ? 'file://' + path.join(root, url.slice(origin.length)) : url, options); }
}

function open(file, hash = '') {
  return JSDOM.fromFile(path.join(root, file), { url: origin + file + hash, runScripts: 'dangerously', resources: new DiskLoader(), pretendToBeVisual: true });
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
  const choose = target => { const el = typeof target === 'string' ? one(target) : target; el.checked = true; el.dispatchEvent(new dom.window.Event('change', { bubbles: true })); };
  const Weave = dom.window.eval('Weave');
  const audit = () => Weave.library.accessibility.audit(document.body).map(row => row.message);
  return { document, Weave, count, all, one, text, click, press, type, toggle, choose, audit };
}

open('apps/relay.html').then(settle).then(dom => {
  const it = driver(dom);
  expect('relay draws a three pane shell', it.count('.weave-shell') === 1 && it.count('.weave-pane') === 3, `${it.count('.weave-pane')} panes`);
  expect('relay windows twelve hundred threads', it.Weave.application.threads.length === 1200 && it.count('.weave-list-row') < 30, `${it.count('.weave-list-row')} rows in the document`);
  expect('relay lists every folder with a count', it.count('.weave-pane[data-pane=rail] .weave-row-button') === 5 && it.count('.weave-badge') === 5, `${it.count('.weave-badge')} badges`);

  const inboxRows = it.count('.weave-list-row');
  it.click(it.all('.weave-pane[data-pane=rail] .weave-row-button')[2]);
  expect('relay switches folder from the rail', it.Weave.application.store.state.folder === 'sent', it.Weave.application.store.state.folder);
  expect('relay writes the folder into the address', dom.window.location.hash === '#/f/sent', dom.window.location.hash);
  it.click(it.all('.weave-pane[data-pane=rail] .weave-row-button')[1]);
  const starred = it.Weave.application.visible(it.Weave.application.store.state);
  const everyStar = (it.Weave.application.store.state.threads || it.Weave.application.threads).filter(thread => thread.starred).length;
  expect('relay gathers every starred thread under Starred', starred.length === everyStar && starred.length > 0 && starred.every(thread => thread.starred), `${starred.filter(thread => thread.starred).length} starred of ${starred.length} shown, ${everyStar} starred in all`);
  it.click(it.all('.weave-pane[data-pane=rail] .weave-row-button')[0]);

  const firstRow = it.one('.weave-pane[data-pane=list] .weave-list-row');
  expect('relay keeps the row checkbox out of the row button', it.count('.weave-list-row .weave-row-button .weave-check-mark') === 0 && it.count('.weave-list-row > .weave-check-mark') > 0, `${it.count('.weave-list-row .weave-row-button .weave-check-mark')} checkboxes inside a button`);
  it.click(firstRow.querySelector('.weave-check-mark'));
  expect('relay ticks a row without opening it', it.Weave.application.store.state.chosen === undefined && it.Weave.application.store.state.checked.length === 1, `chosen ${it.Weave.application.store.state.chosen}, ${it.Weave.application.store.state.checked.length} checked`);
  it.click(it.one('.weave-pane[data-pane=list] .weave-list-row .weave-check-mark'));

  expect('relay opens nothing until asked', it.count('.weave-empty-state') === 1, it.text('.weave-empty-state'));
  it.click(it.one('.weave-pane[data-pane=list] .weave-list-row .weave-row-button'));
  expect('relay opens a thread into the reader', it.count('.weave-empty-state') === 0 && it.count('.weave-bubble') > 0, `${it.count('.weave-bubble')} messages`);
  expect('relay marks the opened thread read', it.Weave.application.threadById(it.Weave.application.store.state.chosen).unread === false, 'still unread');
  expect('relay records the read in the store', Array.isArray(it.Weave.application.store.state.threads) && it.Weave.application.store.state.threads.find(thread => thread.id === it.Weave.application.store.state.chosen).unread === false, 'the store holds no threads');

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
  const inboxBadge = () => it.all('.weave-pane[data-pane=rail] .weave-badge')[0].textContent;
  const unreadLeft = () => String(it.Weave.application.unreadIn(it.Weave.application.store.state, 'inbox'));
  expect('relay clears the selection once the move is made', it.Weave.application.store.state.checked.length === 0 && it.one('.weave-toolbar .weave-check-mark').checked === false, `${it.Weave.application.store.state.checked.length} still checked`);
  expect('relay redraws the list, the count and the badges after a move', it.count('.weave-pane[data-pane=list] .weave-list-row') === 0 && it.text('.weave-sticky .weave-note') === '0 threads' && inboxBadge() === unreadLeft(), `${it.count('.weave-pane[data-pane=list] .weave-list-row')} rows, ${it.text('.weave-sticky .weave-note')}, badge ${inboxBadge()}`);
  expect('relay offers an undo in a pinned toast', it.count('.weave-toast-host .weave-alert') === 1 && it.text('.weave-toast-host .weave-actions').includes('Undo'), it.text('.weave-toast-host'));
  it.click(it.all('.weave-toast-host .weave-button')[0]);
  expect('relay dismisses the toast when undo is taken', it.count('.weave-toast-host .weave-alert') === 0, `${it.count('.weave-toast-host .weave-alert')} left`);
  expect('relay puts the threads back on undo', it.Weave.application.visible(it.Weave.application.store.state).length === before && it.count('.weave-pane[data-pane=list] .weave-list-row') > 0 && inboxBadge() === unreadLeft(), `${it.Weave.application.visible(it.Weave.application.store.state).length} of ${before}, badge ${inboxBadge()}`);
  it.click(it.all('.weave-toolbar .weave-button')[0]);
  expect('relay moves nothing when nothing is ticked', it.Weave.application.visible(it.Weave.application.store.state).length === before && !it.text('.weave-toast-host').includes('threads moved'), it.text('.weave-toast-host'));

  it.toggle('.weave-toolbar .weave-check-mark');
  it.type('.weave-search-box', 'northwind');
  const narrowed = it.Weave.application.visible(it.Weave.application.store.state).length;
  expect('relay reflects only the shown threads in the header checkbox', it.one('.weave-toolbar .weave-check-mark').checked === true && it.one('.weave-toolbar .weave-check-mark').indeterminate === false, `checked ${it.one('.weave-toolbar .weave-check-mark').checked}, partial ${it.one('.weave-toolbar .weave-check-mark').indeterminate}`);
  it.click(it.all('.weave-toolbar .weave-button')[1]);
  it.type('.weave-search-box', '');
  expect('relay moves only the threads the search shows', it.Weave.application.visible(it.Weave.application.store.state).length === before - narrowed && it.text('.weave-toast-host').includes('threads moved: ' + narrowed), `${it.Weave.application.visible(it.Weave.application.store.state).length} left of ${before}, ${narrowed} shown`);
  it.click(it.all('.weave-toast-host .weave-button').find(button => button.textContent === 'Undo'));

  it.press('c');
  expect('relay opens compose over the page', it.count('.weave-dialog-box') === 1 && it.count('.weave-scrim') === 1, `${it.count('.weave-dialog-box')} dialogs`);
  expect('relay traps focus inside compose', it.one('.weave-dialog-box').contains(it.document.activeElement), String(it.document.activeElement && it.document.activeElement.className));
  it.click(it.one('.weave-dialog-box .weave-button[type=submit]'));
  expect('relay refuses to send an empty message', it.count('.weave-dialog-box') === 1 && it.count('.weave-dialog-box .weave-field-error') === 3, `${it.count('.weave-dialog-box')} dialogs, ${it.count('.weave-field-error')} problems`);
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
  it.Weave.application.palette();
  expect('relay opens the palette only once', it.count('.weave-dialog-box') === 1, `${it.count('.weave-dialog-box')} dialogs`);
  it.click(it.all('.weave-dialog-box .weave-menu .weave-button').find(button => button.textContent === 'Sent'));
  expect('relay closes the palette before a command runs', it.count('.weave-dialog-box') === 0 && it.Weave.application.store.state.folder === 'sent', `${it.count('.weave-dialog-box')} dialogs, folder ${it.Weave.application.store.state.folder}`);
  it.press('k', { ctrlKey: true });
  it.click(it.all('.weave-dialog-box .weave-menu .weave-button').find(button => button.textContent === 'Compose'));
  it.Weave.application.compose();
  expect('relay opens compose from the palette without stacking dialogs', it.count('.weave-dialog-box') === 1 && it.count('.weave-dialog-box input[name=to]') === 1, `${it.count('.weave-dialog-box')} dialogs`);
  it.press('Escape');
  expect('relay leaves nothing open after the palette and compose', it.count('.weave-dialog-box') === 0 && it.Weave.library.interaction.scrollLocks.depth === 0, `${it.count('.weave-dialog-box')} dialogs`);
  it.press('?', { shiftKey: true });
  expect('relay shows the keyboard sheet', it.count('.weave-sheet-box .weave-kbd') === 4, `${it.count('.weave-sheet-box .weave-kbd')} keys`);
  const caps = it.all('.weave-sheet-box .weave-kbd').map(keys => [...keys.querySelectorAll('kbd')].map(cap => cap.textContent).join(' '));
  expect('relay names the palette keys as they are pressed', caps.includes('Ctrl K') && !caps.some(words => words.includes('k2')), caps.join(' | '));
  it.press('Escape');

  expect('relay passes its own accessibility audit', it.audit().length === 0, JSON.stringify(it.audit()));
  expect('relay leaves no overlay behind', it.Weave.library.overlays.openCount() === 1, `${it.Weave.library.overlays.openCount()} children in the host`);
  expect('relay counts its threads in words a person reads', /^[\d,]+ threads$/.test(it.text('.weave-sticky .weave-note')), it.text('.weave-sticky .weave-note'));
  dom.window.location.hash = '#/f/spam';
  return settle(dom, 100);
}).then(dom => {
  const it = driver(dom);
  expect('relay opens the folder the address names', it.Weave.application.store.state.folder === 'spam', it.Weave.application.store.state.folder);
  return open('apps/relay.html', '#/f/archive').then(settle);
}).then(dom => {
  const it = driver(dom);
  expect('relay starts in the folder a link names', it.Weave.application.store.state.folder === 'archive' && it.one('.weave-pane[data-pane=rail] .weave-row-button[aria-selected=true]').textContent.startsWith('Archive'), it.Weave.application.store.state.folder);
  return open('apps/pantry.html').then(settle);
}).then(dom => {
  const it = driver(dom);
  expect('pantry draws a bounded page, not a shell', it.count('.weave-page') === 1 && it.count('.weave-shell') === 0, `${it.count('.weave-page')} pages`);
  expect('pantry finishes loading into real tiles', it.count('.weave-skeleton') === 0 && it.count('.weave-card .weave-media') === 3, `${it.count('.weave-card')} cards`);
  expect('pantry prices in the reader\u2019s currency', it.text('.weave-card .weave-strong').startsWith('\u00a3'), it.text('.weave-card .weave-strong'));
  expect('pantry offers a thumb bar', it.count('.weave-tab-bar') === 1, `${it.count('.weave-tab-bar')} bars`);

  it.click(it.all('.weave-tabs .weave-tab')[1]);
  expect('pantry switches category from the tabs', it.Weave.application.store.state.category === 'mains', it.Weave.application.store.state.category);
  expect('pantry redraws the menu for the new category', it.text('.weave-card .weave-subtitle') === 'Confit duck leg', it.text('.weave-card .weave-subtitle'));

  it.click(it.one('.weave-card .weave-button'));
  expect('pantry opens the dish over the page', it.count('.weave-dialog-box') === 1, `${it.count('.weave-dialog-box')} dialogs`);
  expect('pantry asks both questions as radio sets', it.count('.weave-dialog-box .weave-choices') === 2 && it.count('.weave-dialog-box input[type=radio]') === 5, `${it.count('.weave-dialog-box input[type=radio]')} radios`);
  const firstTotal = it.text('.weave-dialog-box .weave-value');
  it.choose(it.all('.weave-dialog-box input[type=radio]')[1]);
  expect('pantry reprices as the reader changes their mind', it.text('.weave-dialog-box .weave-value') !== firstTotal, `${firstTotal} then ${it.text('.weave-dialog-box .weave-value')}`);
  it.click(it.all('.weave-dialog-box .weave-actions .weave-button').pop());
  expect('pantry adds the dish and closes', it.count('.weave-dialog-box') === 0 && it.Weave.application.store.state.lines.length === 1, `${it.Weave.application.store.state.lines.length} lines`);
  expect('pantry counts the order in the header', it.text('.weave-badge') === '1', it.text('.weave-badge'));
  expect('pantry says so in a pinned toast', it.text('.weave-toast-host').includes('Added'), it.text('.weave-toast-host'));

  const watchers = it.Weave.application.store.watchers.length;
  it.click(it.all('.weave-page-header .weave-button')[0]);
  expect('pantry opens the basket over the page', it.count('.weave-drawer-box, .weave-sheet-box') === 1, `${it.count('.weave-drawer-box')} drawers`);
  expect('pantry totals the basket', it.text('.weave-drawer-box .weave-value').startsWith('\u00a3'), it.text('.weave-drawer-box .weave-value'));
  it.click(it.one('.weave-drawer-box .weave-button[type=submit]'));
  expect('pantry refuses an unaddressed order', it.Weave.application.store.state.stage === -1 && it.count('.weave-field-error') === 3, `${it.count('.weave-field-error')} problems`);
  expect('pantry marks the failing field and takes the focus there', it.one('.weave-drawer-box input[name=diner]').getAttribute('aria-invalid') === 'true' && it.document.activeElement.getAttribute('name') === 'diner', String(it.document.activeElement.getAttribute('name')));
  it.type('.weave-drawer-box input[name=diner]', 'Ada Okonkwo');
  it.type('.weave-drawer-box input[name=phone]', '020 7946 0100');
  it.type('.weave-drawer-box input[name=address]', '12 Rosewood Terrace');
  it.click(it.all('.weave-drawer-box .weave-button').find(button => button.textContent === 'Remove'));
  expect('pantry keeps what the diner typed while the basket changes', it.one('.weave-drawer-box input[name=diner]').value === 'Ada Okonkwo', JSON.stringify(it.one('.weave-drawer-box input[name=diner]').value));
  expect('pantry empties the basket back to an empty state', it.count('.weave-drawer-box .weave-empty-state') === 1, `${it.count('.weave-empty-state')} empty states`);
  it.click(it.one('.weave-drawer-box .weave-button[type=submit]'));
  expect('pantry says so when an empty basket is ordered', it.Weave.application.store.state.stage === -1 && it.text('.weave-toast-host').includes('nothing to order'), it.text('.weave-toast-host'));
  it.press('Escape');
  expect('pantry closes the basket on escape', it.count('.weave-drawer-box') === 0 && it.Weave.library.interaction.scrollLocks.depth === 0, `depth ${it.Weave.library.interaction.scrollLocks.depth}`);
  expect('pantry stops watching the store once the basket closes', it.Weave.application.store.watchers.length === watchers, `${it.Weave.application.store.watchers.length} watchers, ${watchers} before`);

  const order = () => {
    it.click(it.one('.weave-card .weave-button'));
    it.click(it.all('.weave-dialog-box .weave-actions .weave-button').pop());
    it.click(it.all('.weave-page-header .weave-button')[0]);
    it.type('.weave-drawer-box input[name=diner]', 'Ada Okonkwo');
    it.type('.weave-drawer-box input[name=phone]', '020 7946 0100');
    it.type('.weave-drawer-box input[name=address]', '12 Rosewood Terrace');
    it.click(it.one('.weave-drawer-box .weave-button[type=submit]'));
  };
  const stages = [];
  it.Weave.application.store.watch(state => state.stage < 0 || stages[stages.length - 1] === state.stage || stages.push(state.stage));
  order();
  expect('pantry accepts a complete order', it.Weave.application.store.state.stage === 0, String(it.Weave.application.store.state.stage));
  expect('pantry keeps who and where the order is for', it.text('.weave-page').includes('12 Rosewood Terrace'), JSON.stringify(it.Weave.application.store.state.order));
  expect('pantry empties and closes the basket once the order is placed', it.Weave.application.store.state.lines.length === 0 && it.count('.weave-drawer-box, .weave-sheet-box') === 0 && it.Weave.library.interaction.scrollLocks.depth === 0, `${it.Weave.application.store.state.lines.length} lines, ${it.count('.weave-drawer-box')} drawers`);
  expect('pantry lets go of the basket it placed from', it.Weave.application.store.watchers.length === watchers + 1, `${it.Weave.application.store.watchers.length} watchers, ${watchers + 1} expected`);
  order();
  expect('pantry refuses a second order while the first is on its way', it.Weave.application.store.state.stage === 0 && it.Weave.application.store.state.lines.length === 1 && it.text('.weave-toast-host').includes('still on its way'), `stage ${it.Weave.application.store.state.stage}, ${it.Weave.application.store.state.lines.length} lines`);
  it.press('Escape');
  dom.stages = stages;
  return settle(dom, 400);
}).then(dom => {
  const it = driver(dom);
  expect('pantry walks the order through its stages', it.Weave.application.store.state.stage > 0, String(it.Weave.application.store.state.stage));
  expect('pantry runs one delivery at a time', dom.stages.join() === '0,1,2,3', dom.stages.join());
  expect('pantry marks exactly one step as current', it.count('.weave-step[aria-current=true]') === 1, `${it.count('.weave-step[aria-current=true]')} current steps`);
  expect('pantry passes its own accessibility audit', it.audit().length === 0, JSON.stringify(it.audit()));
  return null;
}).then(() => process.exit(failures.length === 0 ? 0 : 1)).catch(error => { console.error(error); process.exit(1); });
