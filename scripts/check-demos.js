#!/usr/bin/env node
/* check-demos: open every demo in jsdom, drive it, and assert the pattern it is built from works. */
const path = require('path');
const { JSDOM } = require('jsdom');

const failures = [];
const root = path.join(__dirname, '..');

function open(file) {
  return JSDOM.fromFile(path.join(root, 'demos', file), { runScripts: 'dangerously', resources: 'usable', pretendToBeVisual: true })
    .then(dom => new Promise(resolve => setTimeout(() => resolve(dom), 120)));
}

function expect(name, ok, detail) {
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : ` — ${detail}`}`);
  if (!ok) failures.push(name);
}

function transfer(identifier) {
  const store = { data: {}, dropEffect: '' };
  store.setData = (type, value) => { store.data[type] = value; };
  store.getData = type => store.data[type];
  store.setData('application/x-weave-identifier', identifier);
  return store;
}

function drop(dom, element, identifier) {
  const event = new dom.window.Event('drop', { bubbles: true, cancelable: true });
  event.dataTransfer = transfer(identifier);
  element.dispatchEvent(event);
}

function count(dom, selector) {
  return dom.window.document.querySelectorAll(selector).length;
}

function fire(dom, element, type) {
  element.dispatchEvent(new dom.window.Event(type, { bubbles: true, cancelable: true }));
}

open('index.html').then(dom => {
  expect('index lists every demo, both flagships and the reference pages', count(dom, '.weave-card') === 23, `saw ${count(dom, '.weave-card')}`);
  expect('index installs one stylesheet', count(dom, 'head style') === 1, `saw ${count(dom, 'head style')}`);
  expect('index uses no hand written class', dom.window.document.body.innerHTML.includes('class="weave-'), 'no weave class found');
  return open('crm.html');
}).then(dom => {
  const document = dom.window.document;
  expect('crm shows its stat tiles', count(dom, '.weave-stat-tile') === 3, `saw ${count(dom, '.weave-stat-tile')}`);
  expect('crm pages the pipeline', count(dom, '.weave-table tbody tr') === 4, `saw ${count(dom, '.weave-table tbody tr')}`);
  const search = document.querySelector('input[name=query]');
  search.value = 'globex';
  fire(dom, search, 'input');
  expect('crm searches the pipeline', count(dom, '.weave-table tbody tr') === 1, `saw ${count(dom, '.weave-table tbody tr')}`);
  const profile = () => document.querySelector('.weave-rail + .weave-panel .weave-subtitle').textContent;
  document.querySelectorAll('.weave-menu .weave-button')[2].click();
  expect('crm switches the profile', profile() === 'Umbrella', profile());
  return open('board.html');
}).then(dom => {
  const document = dom.window.document;
  expect('board draws every lane', count(dom, '.weave-panels > .weave-panel') === 4, `saw ${count(dom, '.weave-panels > .weave-panel')}`);
  const lane = () => document.querySelectorAll('.weave-panels > .weave-panel')[0].querySelectorAll('.weave-card').length;
  const before = lane();
  document.querySelectorAll('.weave-panels > .weave-panel')[0].querySelectorAll('.weave-toolbar .weave-button')[1].click();
  expect('board moves a card right', lane() === before - 1, `${before} then ${lane()}`);
  const palette = document.querySelector('input[name=query]');
  palette.value = 'shipped';
  fire(dom, palette, 'input');
  expect('board filters its palette', count(dom, '.weave-menu li') === 1, `saw ${count(dom, '.weave-menu li')}`);
  document.querySelector('.weave-menu .weave-button').click();
  expect('board sweeps every card', document.querySelectorAll('.weave-panels > .weave-panel')[3].querySelectorAll('.weave-card').length === 5, 'sweep did not land');
  const lanes = () => [...document.querySelectorAll('.weave-panels > .weave-panel')].map(panel => panel.querySelectorAll('.weave-card').length);
  expect('board cards are drag sources', document.querySelector('.weave-card').getAttribute('draggable') === 'true', 'card carries no draggable attribute');
  drop(dom, document.querySelectorAll('.weave-panels > .weave-panel')[0], document.querySelectorAll('.weave-panels > .weave-panel')[3].querySelector('.weave-card').dataset.key);
  expect('board takes a dropped card', lanes()[0] === 1 && lanes()[3] === 4, `lanes are ${lanes()}`);
  return open('helpdesk.html');
}).then(dom => {
  const document = dom.window.document;
  expect('helpdesk lists the queue', count(dom, '.weave-menu li') === 3, `saw ${count(dom, '.weave-menu li')}`);
  expect('helpdesk opens the first thread', count(dom, '.weave-scroller .weave-bubble') === 2, `saw ${count(dom, '.weave-scroller .weave-bubble')}`);
  document.querySelector('input[name=message]').value = 'On it.';
  fire(dom, document.querySelector('form'), 'submit');
  expect('helpdesk sends a reply', count(dom, '.weave-scroller .weave-bubble') === 3, `saw ${count(dom, '.weave-scroller .weave-bubble')}`);
  document.querySelectorAll('.weave-menu .weave-button')[1].click();
  expect('helpdesk switches thread', count(dom, '.weave-scroller .weave-bubble') === 1, `saw ${count(dom, '.weave-scroller .weave-bubble')}`);
  return open('warehouse.html');
}).then(dom => {
  const document = dom.window.document;
  expect('warehouse pages the stock', count(dom, '.weave-table tbody tr') === 8, `saw ${count(dom, '.weave-table tbody tr')}`);
  expect('warehouse offers three pages', count(dom, '.weave-page-button') === 3, `saw ${count(dom, '.weave-page-button')}`);
  document.querySelectorAll('.weave-page-button')[2].click();
  expect('warehouse shows the last page', count(dom, '.weave-table tbody tr') === 7, `saw ${count(dom, '.weave-table tbody tr')}`);
  document.querySelectorAll('.weave-table-header')[3].click();
  expect('warehouse sorts on a header', document.querySelector('.weave-table tbody td:last-child').textContent === '0', document.querySelector('.weave-table tbody td:last-child').textContent);
  expect('warehouse windows the ledger', count(dom, '.weave-list-row') < 100, `saw ${count(dom, '.weave-list-row')}`);
  expect('warehouse scrolls the ledger', count(dom, '.weave-scroller') === 1, `saw ${count(dom, '.weave-scroller')}`);
  expect('warehouse starts the wizard', document.querySelector('.weave-steps').children.length === 3, 'no trail');
  return open('school.html');
}).then(dom => {
  const document = dom.window.document;
  expect('school draws the curriculum', count(dom, '.weave-tree') === 3, `saw ${count(dom, '.weave-tree')}`);
  document.querySelectorAll('.weave-tree .weave-button')[1].click();
  expect('school opens a topic', document.querySelector('.weave-rail + .weave-panel .weave-subtitle').textContent === 'Sets and maps', document.querySelector('.weave-rail + .weave-panel .weave-subtitle').textContent);
  const todo = document.querySelectorAll('.weave-item').length;
  document.querySelector('input[name=task]').value = 'Revise';
  fire(dom, document.querySelector('form'), 'submit');
  expect('school adds an assignment', document.querySelectorAll('.weave-item').length === todo + 1, `${todo} then ${document.querySelectorAll('.weave-item').length}`);
  return open('clinic.html');
}).then(dom => {
  const document = dom.window.document;
  expect('clinic shows the day', count(dom, '.weave-table tbody tr') === 4, `saw ${count(dom, '.weave-table tbody tr')}`);
  expect('clinic opens on the first step', document.querySelectorAll('.weave-panel .weave-title')[1].textContent === 'Who', document.querySelectorAll('.weave-panel .weave-title')[1].textContent);
  const next = [...document.querySelectorAll('.weave-toolbar .weave-button')].find(button => button.textContent === 'Next');
  next.click();
  expect('clinic steps forward', document.querySelectorAll('.weave-panel .weave-title')[1].textContent === 'Why', document.querySelectorAll('.weave-panel .weave-title')[1].textContent);
  expect('clinic renders a select', count(dom, '.weave-select-box option') === 3, `saw ${count(dom, '.weave-select-box option')}`);
  return open('agenda.html');
}).then(dom => {
  const document = dom.window.document;
  const month = () => document.querySelector('.weave-toolbar + .weave-subtitle').textContent;
  expect('agenda draws a whole month', count(dom, '.weave-day-button') === 42, `saw ${count(dom, '.weave-day-button')}`);
  expect('agenda prices a ticket', [...document.querySelectorAll('.weave-stat-tile')].some(tile => tile.textContent.includes('349')), 'no ticket price');
  expect('agenda counts down to the doors', [...document.querySelectorAll('.weave-stat-tile')].some(tile => tile.textContent.includes('in 3')), 'no countdown');
  const busy = [...document.querySelectorAll('.weave-day-button')].find(button => button.parentElement.querySelector('.weave-badge'));
  busy.click();
  expect('agenda lists the sessions of a day', count(dom, '.weave-panels .weave-list-row') === 2, `saw ${count(dom, '.weave-panels .weave-list-row')}`);
  const before = month();
  [...document.querySelectorAll('.weave-toolbar .weave-button')].find(button => button.textContent === 'Next month').click();
  expect('agenda steps to the next month', month() !== before, `${before} then ${month()}`);
  return open('tenants.html');
}).then(dom => {
  const document = dom.window.document;
  const tiles = () => [...document.querySelectorAll('.weave-stat-tile')].map(tile => tile.textContent);
  const tabFor = name => [...document.querySelectorAll('.weave-tab')].find(tab => tab.textContent === name);
  expect('tenants opens on a workspace', tiles()[0].includes('Team'), tiles()[0]);
  expect('tenants pages a long roster', count(dom, '.weave-table tbody tr') === 8, `saw ${count(dom, '.weave-table tbody tr')}`);
  expect('tenants warns when the seats run out', count(dom, '.weave-page .weave-alert') === 1 && document.querySelector('.weave-page .weave-alert').dataset.tone === 'danger', `saw ${count(dom, '.weave-page .weave-alert')} alerts`);
  const role = document.querySelector('.weave-table tbody .weave-select-box');
  role.value = 'guest';
  fire(dom, role, 'change');
  expect('tenants changes a role in place', document.querySelector('.weave-table tbody .weave-select-box').value === 'guest', document.querySelector('.weave-table tbody .weave-select-box').value);
  tabFor('Usage').click();
  expect('tenants meters every limit the plan sets', count(dom, '.weave-progress-bar') === 3, `saw ${count(dom, '.weave-progress-bar')}`);
  expect('tenants logs the change it just took', count(dom, '.weave-disclosure') === 1, `saw ${count(dom, '.weave-disclosure')}`);
  expect('tenants tones the meter that is over', document.querySelector('.weave-progress-bar').dataset.tone === 'danger', document.querySelector('.weave-progress-bar').dataset.tone);
  document.querySelector('.weave-page .weave-alert .weave-button').click();
  expect('tenants clears the warning by moving the plan up', count(dom, '.weave-page .weave-alert') === 0 && tiles()[0].includes('Scale'), tiles()[0]);
  tabFor('Settings').click();
  const flags = () => [...document.querySelectorAll('.weave-switch-control')];
  expect('tenants draws a switch per feature', flags().length === 3, `saw ${flags().length}`);
  expect('tenants starts with the export switched on', flags()[1].getAttribute('aria-checked') === 'true', flags()[1].getAttribute('aria-checked'));
  flags()[0].click();
  expect('tenants takes a switch', flags()[0].getAttribute('aria-checked') === 'true', flags()[0].getAttribute('aria-checked'));
  document.querySelector('.weave-page .weave-page-header .weave-button').click();
  expect('tenants offers every workspace in one popover', count(dom, '.weave-popover-box .weave-menu li') === 4, `saw ${count(dom, '.weave-popover-box .weave-menu li')}`);
  [...document.querySelectorAll('.weave-popover-box .weave-menu .weave-button')][3].click();
  expect('tenants switches the whole console over', tiles()[0].includes('Trial'), tiles()[0]);
  expect('tenants keeps each workspace to its own roster', count(dom, '.weave-table tbody tr') === 3, `saw ${count(dom, '.weave-table tbody tr')}`);
  const invite = document.querySelector('.weave-form');
  fire(dom, invite, 'submit');
  expect('tenants refuses an invitation with no address', count(dom, '.weave-field-error') === 2, `saw ${count(dom, '.weave-field-error')}`);
  document.querySelector('input[name=who]').value = 'Wren Ashby';
  document.querySelector('input[name=where]').value = 'wren@hooli.test';
  fire(dom, invite, 'submit');
  expect('tenants seats an invited teammate', count(dom, '.weave-table tbody tr') === 4, `saw ${count(dom, '.weave-table tbody tr')}`);
  document.querySelectorAll('.weave-table tbody .weave-button')[0].click();
  expect('tenants asks before it takes a seat back', count(dom, '.weave-dialog-box') === 1, `saw ${count(dom, '.weave-dialog-box')}`);
  [...document.querySelectorAll('.weave-dialog-box .weave-button')].find(button => button.textContent === 'Remove').click();
  return new Promise(resolve => setTimeout(() => resolve(dom), 40));
}).then(dom => {
  expect('tenants frees the seat once you confirm', count(dom, '.weave-table tbody tr') === 3, `saw ${count(dom, '.weave-table tbody tr')}`);
  expect('tenants leaves no overlay behind', count(dom, '.weave-dialog-box') === 0, `saw ${count(dom, '.weave-dialog-box')}`);
  return open('elements.html');
}).then(dom => {
  const document = dom.window.document;
  const names = dom.window.eval('Object.keys(Weave.application.draws)');
  const calls = dom.window.eval('Object.keys(Weave.application.calls)');
  const listed = dom.window.eval('Object.values(Weave.application.sections).flatMap(row => row.names)');
  expect('elements draws one card per element', count(dom, '.weave-card[data-key]') === names.length, `${count(dom, '.weave-card[data-key]')} cards for ${names.length} elements`);
  expect('elements prints the call under every card', count(dom, '.weave-card[data-key] > .weave-code') === names.length, `saw ${count(dom, '.weave-card[data-key] > .weave-code')}`);
  expect('elements documents every element it draws', names.every(name => calls.includes(name)), `missing ${names.filter(name => !calls.includes(name))}`);
  expect('elements files every element in a section', names.every(name => listed.includes(name)), `unfiled ${names.filter(name => !listed.includes(name))}`);
  expect('elements sections name nothing it does not draw', listed.every(name => names.includes(name)), `orphans ${listed.filter(name => !names.includes(name))}`);
  expect('elements counts itself in its own tile', document.querySelector('.weave-stat-tile').textContent.includes(String(names.length)), document.querySelector('.weave-stat-tile').textContent);
  expect('elements draws the new widgets it promises', count(dom, '.weave-navbar-box') === 1 && count(dom, '.weave-group-list') === 1 && count(dom, '.weave-terms-box') === 1 && count(dom, '.weave-callout-box') === 1 && count(dom, '.weave-code-listing-box') === 1 && count(dom, '.weave-diff-box') === 1 && count(dom, '.weave-dropzone-box') === 1, 'a Bootstrap shaped widget is missing');
  expect('elements uses no hand written class', !document.body.innerHTML.includes('class="weave-undefined'), 'an undefined class appeared');
  return open('patterns.html');
}).then(dom => {
  const document = dom.window.document;
  const names = dom.window.eval('Object.keys(Weave.application.draws)');
  expect('patterns prints the call under every card it runs', count(dom, '.weave-card[data-key] > .weave-code') === names.length, `${count(dom, '.weave-card[data-key] > .weave-code')} calls for ${names.length} patterns`);
  expect('patterns runs the virtual list without drawing two thousand rows', count(dom, '.weave-scroller .weave-list-row') < 60, `saw ${count(dom, '.weave-scroller .weave-list-row')}`);
  const carousel = () => document.querySelector('[data-key=carousel]');
  const slide = () => carousel().querySelector('.weave-strong').textContent;
  const before = slide();
  carousel().querySelectorAll('.weave-button-group-box .weave-button')[1].click();
  expect('patterns steps the carousel', slide() !== before, `${before} then ${slide()}`);
  const tabs = () => document.querySelector('[data-key=tabsView]');
  tabs().querySelectorAll('.weave-tab')[1].click();
  expect('patterns switches a tabbed pane', tabs().textContent.includes('only when the tab is opened'), tabs().textContent);
  const combo = () => document.querySelector('[data-key=combobox]');
  const query = combo().querySelector('input[name=query]');
  query.value = 'oslo';
  fire(dom, query, 'input');
  expect('patterns narrows the combobox', combo().querySelectorAll('.weave-menu li').length === 1, `saw ${combo().querySelectorAll('.weave-menu li').length}`);
  document.querySelector('[data-key=inlineEdit] .weave-row-button').click();
  expect('patterns opens an inline edit', count(dom, '[data-key=inlineEdit] .weave-control') === 1, 'no field opened');
  document.querySelector('[data-key=dialog] .weave-button').click();
  expect('patterns opens a dialog over the page', count(dom, '.weave-dialog-box') === 1, `saw ${count(dom, '.weave-dialog-box')}`);
  [...document.querySelectorAll('.weave-dialog-box .weave-button')].find(button => button.textContent === 'Close it').click();
  expect('patterns leaves no overlay behind', count(dom, '.weave-dialog-box') === 0, `saw ${count(dom, '.weave-dialog-box')}`);
  return open('account.html');
}).then(dom => {
  const document = dom.window.document;
  expect('account shows the gate while signed out', count(dom, '.weave-form') === 1 && document.querySelector('.weave-title').textContent === 'Sign in', document.querySelector('.weave-title').textContent);
  expect('account offers the other two screens', count(dom, '.weave-row > .weave-button[data-variant=link]') === 2, `saw ${count(dom, '.weave-row > .weave-button[data-variant=link]')}`);
  fire(dom, document.querySelector('.weave-form'), 'submit');
  expect('account refuses an empty sign in', count(dom, '.weave-field-error') === 4, `saw ${count(dom, '.weave-field-error')}`);
  document.querySelectorAll('.weave-row > .weave-button[data-variant=link]')[1].click();
  expect('account walks to the sign up screen', document.querySelector('.weave-title').textContent === 'Create an account', document.querySelector('.weave-title').textContent);
  expect('account meters the password it is about to take', count(dom, '.weave-progress-bar') === 1, `saw ${count(dom, '.weave-progress-bar')}`);
  document.querySelector('input[name=person]').value = 'Ana Ferreira';
  document.querySelector('input[name=email]').value = 'ana@acme.test';
  document.querySelector('input[name=password]').value = 'longenough1';
  document.querySelector('input[name=confirmation]').value = 'longenough1';
  fire(dom, document.querySelector('.weave-form'), 'submit');
  expect('account signs the new person in', document.body.textContent.includes('Signed in as Ana Ferreira'), document.querySelector('.weave-title').textContent);
  expect('account shows the desk behind the gate', count(dom, '.weave-tab') === 2, `saw ${count(dom, '.weave-tab')}`);
  document.querySelectorAll('.weave-tab')[1].click();
  expect('account opens the security tab', count(dom, '.weave-switch-control') === 1, `saw ${count(dom, '.weave-switch-control')}`);
  document.querySelector('.weave-spread > .weave-button').click();
  expect('account hangs the menu off the account button', count(dom, '.weave-popover-box .weave-menu li') === 1, `saw ${count(dom, '.weave-popover-box .weave-menu li')}`);
  document.querySelector('.weave-popover-box .weave-button').click();
  return new Promise(resolve => setTimeout(() => resolve(dom), 40));
}).then(dom => {
  const document = dom.window.document;
  expect('account puts the gate back on sign out', document.querySelector('.weave-title').textContent === 'Sign in', document.querySelector('.weave-title').textContent);
  return open('bank.html');
}).then(dom => {
  const document = dom.window.document;
  const tiles = () => [...document.querySelectorAll('.weave-stat-tile')].map(tile => tile.textContent);
  expect('bank totals what is held', tiles()[0].includes('£17,326.30'), tiles()[0]);
  expect('bank counts the card separately', tiles()[1].includes('£874.15'), tiles()[1]);
  expect('bank lists every account', count(dom, '.weave-group-row') === 3, `saw ${count(dom, '.weave-group-row')}`);
  expect('bank says where the money lives', count(dom, '.weave-terms-box .weave-definition') === 3, `saw ${count(dom, '.weave-terms-box .weave-definition')}`);
  document.querySelectorAll('.weave-tab')[1].click();
  expect('bank welds the currency to the amount', document.querySelector('.weave-input-group-box .weave-addon').textContent === '£', 'no addon');
  document.querySelector('.weave-button[data-variant=primary]').click();
  expect('bank asks before it sends anything', count(dom, '.weave-dialog-box') === 1, `saw ${count(dom, '.weave-dialog-box')}`);
  [...document.querySelectorAll('.weave-dialog-box .weave-button')].find(button => button.textContent === 'Confirm').click();
  return new Promise(resolve => setTimeout(() => resolve(dom), 40));
}).then(dom => {
  const document = dom.window.document;
  expect('bank says it went', count(dom, '.weave-toast-host .weave-alert') === 1, `saw ${count(dom, '.weave-toast-host .weave-alert')}`);
  document.querySelectorAll('.weave-tab')[2].click();
  expect('bank states the month as a table', count(dom, '.weave-table tbody tr') === 4, `saw ${count(dom, '.weave-table tbody tr')}`);
  expect('bank states the same lines as a timeline', count(dom, '.weave-timeline-row') === 4, `saw ${count(dom, '.weave-timeline-row')}`);
  return open('shop.html');
}).then(dom => {
  const document = dom.window.document;
  const tiles = () => count(dom, '.weave-tiles > .weave-card');
  expect('shop fills the shelf', tiles() === 6, `saw ${tiles()}`);
  expect('shop carries a navbar', count(dom, '.weave-navbar-box .weave-anchor') === 3, `saw ${count(dom, '.weave-navbar-box .weave-anchor')}`);
  expect('shop scores what it sells', count(dom, '.weave-rating-box') === 6, `saw ${count(dom, '.weave-rating-box')}`);
  [...document.querySelectorAll('.weave-row > .weave-button')].find(button => button.textContent === 'Choose').click();
  expect('shop offers every filter in a popover', count(dom, '.weave-popover-box .weave-menu li') === 3, `saw ${count(dom, '.weave-popover-box .weave-menu li')}`);
  document.querySelector('.weave-popover-box .weave-button').click();
  expect('shop narrows the shelf to the filter', tiles() === 3, `saw ${tiles()}`);
  expect('shop shows the filter it took as a chip', count(dom, '.weave-chip-box') === 1, `saw ${count(dom, '.weave-chip-box')}`);
  document.querySelector('.weave-card .weave-button[data-variant=primary]').click();
  expect('shop counts the basket in the bar', document.querySelector('.weave-spread > .weave-button').textContent === 'Basket (1)', document.querySelector('.weave-spread > .weave-button').textContent);
  document.querySelector('.weave-spread > .weave-button').click();
  expect('shop opens the basket as a sheet', count(dom, '.weave-sheet-box') === 1, `saw ${count(dom, '.weave-sheet-box')}`);
  expect('shop totals the basket', document.querySelector('.weave-sheet-box').textContent.includes('£6.40'), document.querySelector('.weave-sheet-box').textContent);
  [...document.querySelectorAll('.weave-sheet-box .weave-button')].find(button => button.textContent === 'Check out').click();
  return new Promise(resolve => setTimeout(() => resolve(dom), 40));
}).then(dom => {
  const document = dom.window.document;
  expect('shop empties the basket once it is paid for', document.querySelector('.weave-spread > .weave-button').textContent === 'Basket', document.querySelector('.weave-spread > .weave-button').textContent);
  expect('shop leaves no overlay behind', count(dom, '.weave-sheet-box') === 0, `saw ${count(dom, '.weave-sheet-box')}`);
  return open('tailor.html');
}).then(dom => {
  const document = dom.window.document;
  const groups = () => [...document.querySelectorAll('.weave-button-group-box')];
  const root = () => document.documentElement;
  expect('tailor offers one picker per table it drives', groups().length === 7, `saw ${groups().length}`);
  expect('tailor starts under the theme it says it does', root().getAttribute('data-theme') === 'light', root().getAttribute('data-theme'));
  groups()[0].querySelectorAll('.weave-button')[2].click();
  expect('tailor changes the theme on the document', root().getAttribute('data-theme') === 'contrast', root().getAttribute('data-theme'));
  groups()[1].querySelectorAll('.weave-button')[1].click();
  expect('tailor changes the density the same way', root().getAttribute('data-density') === 'roomy', root().getAttribute('data-density'));
  groups()[2].querySelectorAll('.weave-button')[2].click();
  expect('tailor spends a palette on the page itself', root().style.getPropertyValue('--weave-accent') === '#7c3aed', root().style.getPropertyValue('--weave-accent'));
  const card = () => document.querySelector('.weave-stack > .weave-card');
  groups()[3].querySelectorAll('.weave-button')[2].click();
  expect('tailor moves a modifier on one spec', card().dataset.gap === 'loose', card().dataset.gap);
  expect('tailor brands one panel on its own', document.querySelector('[style*="--weave-accent"]') !== null, 'no branded panel');
  return open('landing.html');
}).then(dom => {
  const document = dom.window.document;
  expect('landing leads with a hero', count(dom, '.weave-banner-box') === 1, `saw ${count(dom, '.weave-banner-box')}`);
  expect('landing gives each reason a column', count(dom, '.weave-column') === 3, `saw ${count(dom, '.weave-column')}`);
  expect('landing prices every plan', count(dom, '.weave-card[data-key]') === 3, `saw ${count(dom, '.weave-card[data-key]')}`);
  expect('landing marks the plan it wants chosen', count(dom, '.weave-card[data-key] .weave-pill') === 1, `saw ${count(dom, '.weave-card[data-key] .weave-pill')}`);
  expect('landing heads and foots its price cards', count(dom, '.weave-card-head') === 3 && count(dom, '.weave-card-foot') === 3, 'a card is missing a head or a foot');
  expect('landing quotes the people who said it', count(dom, '.weave-quote-box .weave-credit') === 2, `saw ${count(dom, '.weave-quote-box .weave-credit')}`);
  expect('landing answers every question it asks', count(dom, '.weave-disclosure') === 3, `saw ${count(dom, '.weave-disclosure')}`);
  document.querySelector('.weave-banner-box .weave-button').click();
  expect('landing answers its own call to action', count(dom, '.weave-toast-host .weave-alert') === 1, `saw ${count(dom, '.weave-toast-host .weave-alert')}`);
  return open('travel.html');
}).then(dom => {
  const document = dom.window.document;
  const values = () => [...document.querySelectorAll('.weave-definition')].map(node => node.textContent);
  const step = label => [...document.querySelectorAll('.weave-button-group-box .weave-button')].find(button => button.textContent === label).click();
  const from = document.querySelector('select[name=from]');
  from.value = 'York';
  fire(dom, from, 'change');
  expect('travel writes the station into the summary', values()[0] === 'York', values()[0]);
  step('Next');
  const day = document.querySelector('input[name=day]');
  expect('travel asks for the day with the control the platform has', day.getAttribute('type') === 'date', day.getAttribute('type'));
  day.value = '2026-10-01';
  fire(dom, day, 'input');
  expect('travel carries the day across', values()[2] === '2026-10-01', values()[2]);
  step('Next');
  expect('travel offers every train', count(dom, '.weave-group-row') === 3, `saw ${count(dom, '.weave-group-row')}`);
  document.querySelectorAll('.weave-group-row .weave-row-button')[1].click();
  expect('travel prices the train it was given', values()[7] === '£59.00', values()[7]);
  document.querySelectorAll('.weave-button-group-box .weave-button')[2].click();
  expect('travel reprices for the cabin', values()[7] === '£105.00', values()[7]);
  step('Next');
  const people = document.querySelector('input[name=people]');
  people.value = '2';
  fire(dom, people, 'input');
  expect('travel multiplies the fare by the people travelling', values()[7] === '£210.00', values()[7]);
  expect('travel marks exactly one step as current', count(dom, '.weave-step[aria-current=true]') === 1, `saw ${count(dom, '.weave-step[aria-current=true]')}`);
  [...document.querySelectorAll('.weave-button')].find(button => button.textContent === 'Book it').click();
  expect('travel asks before it books', count(dom, '.weave-dialog-box') === 1, `saw ${count(dom, '.weave-dialog-box')}`);
  [...document.querySelectorAll('.weave-dialog-box .weave-button')].find(button => button.textContent === 'Cancel').click();
  return open('signal.html');
}).then(dom => {
  const document = dom.window.document;
  const lines = () => count(dom, '.weave-chart-line');
  expect('signal draws one line per service', lines() === 3 + 4, `saw ${lines()}`);
  const points = () => document.querySelector('.weave-chart-plot .weave-chart-line').getAttribute('points').split(' ').length;
  expect('signal plots a week to begin with', points() === 7, `saw ${points()}`);
  document.querySelectorAll('.weave-button-group-box .weave-button')[1].click();
  expect('signal replots the fortnight on the same axis', points() === 14, `saw ${points()}`);
  expect('signal writes a tick under every point', count(dom, '.weave-axis-row .weave-axis-label') === 14, `saw ${count(dom, '.weave-axis-row .weave-axis-label')}`);
  document.querySelector('.weave-legend-button').click();
  expect('signal takes a series off the plot', lines() === 2 + 4, `saw ${lines()}`);
  expect('signal marks the series it has taken off', count(dom, '.weave-legend-button[aria-selected=false]') === 1, 'none marked');
  const survivor = () => document.querySelectorAll('.weave-chart-plot .weave-chart-line')[0].dataset.series;
  expect('signal leaves the survivors their own colour', survivor() === 'two', survivor());
  document.querySelector('.weave-legend-button').click();
  expect('signal puts the series back', lines() === 3 + 4, `saw ${lines()}`);
  expect('signal writes the number above every bar', count(dom, '.weave-bar-value') === 7, `saw ${count(dom, '.weave-bar-value')}`);
  const tallest = () => document.querySelectorAll('.weave-chart-bar')[2].style.height;
  expect('signal draws the worst day full height', tallest() === '100%', tallest());
  expect('signal ranks the busiest endpoints', count(dom, '.weave-rank-row') === 5, `saw ${count(dom, '.weave-rank-row')}`);
  expect('signal cuts the ring into one arc per region', count(dom, '.weave-ring-segment') === 4, `saw ${count(dom, '.weave-ring-segment')}`);
  expect('signal gives each region its own slot', document.querySelectorAll('.weave-ring-segment')[3].dataset.series === 'four', 'a slot was reused');
  expect('signal steps every heat cell off the one ramp', count(dom, '.weave-heat-cell[data-heat]') === 45, `saw ${count(dom, '.weave-heat-cell[data-heat]')}`);
  expect('signal says the same week in words', count(dom, '.weave-table tbody tr') === 7, `saw ${count(dom, '.weave-table tbody tr')}`);
  return open('handbook.html');
}).then(dom => {
  const document = dom.window.document;
  expect('handbook sets its chapter in one measured column', count(dom, '.weave-prose') === 1, `saw ${count(dom, '.weave-prose')}`);
  expect('handbook lists every chapter in its contents', count(dom, '.weave-contents-list li') === 4, `saw ${count(dom, '.weave-contents-list li')}`);
  expect('handbook marks the chapter being read', count(dom, '.weave-contents-list [aria-current=true]') === 1, `saw ${count(dom, '.weave-contents-list [aria-current=true]')}`);
  expect('handbook numbers every line of its listing', count(dom, '.weave-code-line') === 3, `saw ${count(dom, '.weave-code-line')}`);
  expect('handbook tones its callout from the chapter', document.querySelector('.weave-callout-box').dataset.tone === 'info', String(document.querySelector('.weave-callout-box').dataset.tone));
  expect('handbook holds the near end of the pager open', count(dom, '.weave-pager-gap') === 1, `saw ${count(dom, '.weave-pager-gap')}`);
  document.querySelectorAll('.weave-contents-list .weave-anchor')[2].click();
  return new Promise(resolve => setTimeout(() => resolve(dom), 40));
}).then(dom => {
  const document = dom.window.document;
  expect('handbook opens the chapter picked from the contents', document.querySelector('.weave-title').textContent === 'Changing the look', document.querySelector('.weave-title').textContent);
  expect('handbook retones the callout with the chapter', document.querySelector('.weave-callout-box').dataset.tone === 'warning', String(document.querySelector('.weave-callout-box').dataset.tone));
  expect('handbook offers both ends once the chapter has neighbours', count(dom, '.weave-pager-gap') === 0, `saw ${count(dom, '.weave-pager-gap')}`);
  [...document.querySelectorAll('.weave-pager-box .weave-anchor')][1].click();
  return new Promise(resolve => setTimeout(() => resolve(dom), 40));
}).then(dom => {
  const document = dom.window.document;
  expect('handbook walks on with the pager', document.querySelector('.weave-title').textContent === 'Shipping a change', document.querySelector('.weave-title').textContent);
  expect('handbook holds the far end of the pager open', count(dom, '.weave-pager-gap') === 1, `saw ${count(dom, '.weave-pager-gap')}`);
  expect('handbook passes its own accessibility audit', dom.window.eval('Weave.library.accessibility.audit(document.body).length') === 0, dom.window.eval('JSON.stringify(Weave.library.accessibility.audit(document.body).map(row => row.message))'));
  return open('review.html');
}).then(dom => {
  const document = dom.window.document;
  expect('review lists every changed file', count(dom, '.weave-row-button') === 4, `saw ${count(dom, '.weave-row-button')}`);
  expect('review counts what each file did to itself', count(dom, '.weave-row-button .weave-diff-stat-box') === 4, `saw ${count(dom, '.weave-row-button .weave-diff-stat-box')}`);
  expect('review adds the whole change up from those rows', document.querySelectorAll('.weave-stat-tile')[1].textContent.includes('25'), document.querySelectorAll('.weave-stat-tile')[1].textContent);
  expect('review marks every line of the diff with what it is', [...document.querySelectorAll('.weave-diff-row')].map(row => row.dataset.edit).join(',') === 'same,removed,added,same', [...document.querySelectorAll('.weave-diff-row')].map(row => row.dataset.edit).join(','));
  expect('review shows what was already said about the file', count(dom, '.weave-comment-box') === 1, `saw ${count(dom, '.weave-comment-box')}`);
  document.querySelectorAll('.weave-row-button')[1].click();
  return new Promise(resolve => setTimeout(() => resolve(dom), 40));
}).then(dom => {
  const document = dom.window.document;
  expect('review opens the file picked from the list', document.querySelector('.weave-diff-box .weave-code').textContent === 'src/22-components.js', document.querySelector('.weave-diff-box .weave-code').textContent);
  expect('review says when nothing has been said yet', count(dom, '.weave-empty-state') === 1, `saw ${count(dom, '.weave-empty-state')}`);
  document.querySelector('.weave-text-area').value = 'The wash belongs in the token table, not here.';
  fire(dom, document.querySelector('.weave-text-area'), 'input');
  [...document.querySelectorAll('.weave-button')].find(button => button.textContent === 'Comment').click();
  return new Promise(resolve => setTimeout(() => resolve(dom), 40));
}).then(dom => {
  const document = dom.window.document;
  expect('review posts the comment against the open file', count(dom, '.weave-comment-box') === 1, `saw ${count(dom, '.weave-comment-box')}`);
  expect('review says so in a toast', count(dom, '.weave-toast-host .weave-alert') === 1, `saw ${count(dom, '.weave-toast-host .weave-alert')}`);
  expect('review empties the box it was typed in', document.querySelector('.weave-text-area').value === '', document.querySelector('.weave-text-area').value);
  fire(dom, document.querySelector('.weave-dropzone-box'), 'dragenter');
  expect('review marks the target while a file is over it', document.querySelector('.weave-dropzone-box').dataset.over === 'true', String(document.querySelector('.weave-dropzone-box').dataset.over));
  drop(dom, document.querySelector('.weave-dropzone-box'), 'shot');
  return new Promise(resolve => setTimeout(() => resolve(dom), 40));
}).then(dom => {
  const document = dom.window.document;
  expect('review attaches a file dropped on the target', count(dom, '.weave-comment-box') === 2, `saw ${count(dom, '.weave-comment-box')}`);
  expect('review leaves the dropped mark off again', document.querySelector('.weave-dropzone-box').dataset.over !== 'true', String(document.querySelector('.weave-dropzone-box').dataset.over));
  document.querySelectorAll('.weave-row-button')[0].click();
  return new Promise(resolve => setTimeout(() => resolve(dom), 40));
}).then(dom => {
  expect('review keeps each conversation with its own file', count(dom, '.weave-comment-box') === 1, `saw ${count(dom, '.weave-comment-box')}`);
  expect('review passes its own accessibility audit', dom.window.eval('Weave.library.accessibility.audit(document.body).length') === 0, dom.window.eval('JSON.stringify(Weave.library.accessibility.audit(document.body).map(row => row.message))'));
  return open('kit.html');
}).then(dom => {
  const document = dom.window.document;
  const kit = dom.window.eval('Weave.kit');
  const tables = ['words', 'sizes', 'parts', 'notes', 'demoWords', 'samples'];
  const pieces = Object.keys(kit).filter(name => !tables.includes(name) && typeof kit[name] === 'function');
  const undocumented = pieces.filter(name => !kit.notes[name]);
  const unsampled = pieces.filter(name => typeof kit.samples[name] !== 'function');
  const orphaned = Object.keys(kit.notes).filter(name => typeof kit[name] !== 'function');
  expect('kit documents every piece it offers', undocumented.length === 0, `no note for ${undocumented}`);
  expect('kit draws every piece it offers', unsampled.length === 0, `no sample for ${unsampled}`);
  expect('kit notes nothing it does not offer', orphaned.length === 0, `no piece for ${orphaned}`);
  expect('kit gallery shows one card per piece', count(dom, '.weave-card') === pieces.length, `${count(dom, '.weave-card')} cards for ${pieces.length} pieces`);
  expect('kit gallery prints the call for each', count(dom, '.weave-code') === pieces.length, `saw ${count(dom, '.weave-code')}`);
  expect('kit counts itself in its own tile', document.querySelector('.weave-stat-tile').textContent.includes(String(pieces.length)), document.querySelector('.weave-stat-tile').textContent);
  expect('kit keeps its helpers out of the gallery', Object.keys(kit.parts).length > pieces.length / 2, `${Object.keys(kit.parts).length} helpers`);
  document.querySelector('[data-key=say] .weave-button').click();
  expect('kit raises a toast on its own host', count(dom, '.weave-toast-host .weave-alert') === 1, `saw ${count(dom, '.weave-toast-host .weave-alert')}`);
  document.querySelector('[data-key=askThen] .weave-button').click();
  expect('kit asks before it acts', count(dom, '.weave-dialog-box') === 1, `saw ${count(dom, '.weave-dialog-box')}`);
  [...document.querySelectorAll('.weave-dialog-box .weave-button')].find(button => button.textContent === 'Cancel').click();
  expect('kit does nothing when the answer is no', count(dom, '.weave-dialog-box') === 0, `saw ${count(dom, '.weave-dialog-box')}`);
  document.querySelector('[data-key=picker] .weave-button').click();
  expect('kit picker offers every choice', count(dom, '.weave-popover-box .weave-menu li') === 3, `saw ${count(dom, '.weave-popover-box .weave-menu li')}`);
  expect('kit picker marks the one in force', count(dom, '.weave-popover-box .weave-button[aria-selected=true]') === 1, 'none marked');
}).then(() => process.exit(failures.length === 0 ? 0 : 1)).catch(error => { console.error(error); process.exit(1); });
