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
  expect('index lists every demo', count(dom, '.weave-card') === 7, `saw ${count(dom, '.weave-card')}`);
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
  expect('board draws every lane', count(dom, '.weave-tiles > .weave-panel') === 4, `saw ${count(dom, '.weave-tiles > .weave-panel')}`);
  const lane = () => document.querySelectorAll('.weave-tiles > .weave-panel')[0].querySelectorAll('.weave-card').length;
  const before = lane();
  document.querySelectorAll('.weave-tiles > .weave-panel')[0].querySelectorAll('.weave-toolbar .weave-button')[1].click();
  expect('board moves a card right', lane() === before - 1, `${before} then ${lane()}`);
  const palette = document.querySelector('input[name=query]');
  palette.value = 'shipped';
  fire(dom, palette, 'input');
  expect('board filters its palette', count(dom, '.weave-menu li') === 1, `saw ${count(dom, '.weave-menu li')}`);
  document.querySelector('.weave-menu .weave-button').click();
  expect('board sweeps every card', document.querySelectorAll('.weave-tiles > .weave-panel')[3].querySelectorAll('.weave-card').length === 5, 'sweep did not land');
  const lanes = () => [...document.querySelectorAll('.weave-tiles > .weave-panel')].map(panel => panel.querySelectorAll('.weave-card').length);
  expect('board cards are drag sources', document.querySelector('.weave-card').getAttribute('draggable') === 'true', 'card carries no draggable attribute');
  drop(dom, document.querySelectorAll('.weave-tiles > .weave-panel')[0], document.querySelectorAll('.weave-tiles > .weave-panel')[3].querySelector('.weave-card').dataset.key);
  expect('board takes a dropped card', lanes()[0] === 1 && lanes()[3] === 4, `lanes are ${lanes()}`);
  return open('helpdesk.html');
}).then(dom => {
  const document = dom.window.document;
  expect('helpdesk lists the queue', count(dom, '.weave-menu li') === 3, `saw ${count(dom, '.weave-menu li')}`);
  expect('helpdesk opens the first thread', count(dom, '.weave-scroller .weave-card') === 2, `saw ${count(dom, '.weave-scroller .weave-card')}`);
  document.querySelector('input[name=message]').value = 'On it.';
  fire(dom, document.querySelector('form'), 'submit');
  expect('helpdesk sends a reply', count(dom, '.weave-scroller .weave-card') === 3, `saw ${count(dom, '.weave-scroller .weave-card')}`);
  document.querySelectorAll('.weave-menu .weave-button')[1].click();
  expect('helpdesk switches thread', count(dom, '.weave-scroller .weave-card') === 1, `saw ${count(dom, '.weave-scroller .weave-card')}`);
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
  expect('warehouse starts the wizard', document.querySelector('.weave-breadcrumb').children.length === 3, 'no trail');
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
  const busy = [...document.querySelectorAll('.weave-day-button')].find(button => button.parentElement.querySelector('.weave-tag'));
  busy.click();
  expect('agenda lists the sessions of a day', count(dom, '.weave-item-list .weave-item') === 2, `saw ${count(dom, '.weave-item-list .weave-item')}`);
  const before = month();
  [...document.querySelectorAll('.weave-toolbar .weave-button')].find(button => button.textContent === 'Next month').click();
  expect('agenda steps to the next month', month() !== before, `${before} then ${month()}`);
}).then(() => process.exit(failures.length === 0 ? 0 : 1)).catch(error => { console.error(error); process.exit(1); });
