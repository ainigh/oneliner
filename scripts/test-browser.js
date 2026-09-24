#!/usr/bin/env node
/* test-browser: run tests.html in a real Chromium through Playwright and report what the page shows. jsdom passes what a browser fails (computed style on a detached node, an odd navigator.language), so this is the second host of the test contract. */
const path = require('path');
const { chromium } = require('playwright');

const page = 'file://' + path.join(__dirname, '..', 'tests.html');
const selector = '#output.pass, #output.fail';
chromium.launch().then(browser => browser.newPage().then(tab => tab.goto(page).then(() => tab.waitForSelector(selector, { timeout: 60000 })).then(() => tab.textContent('#output')).then(text => {
  console.log(text);
  return browser.close().then(() => process.exit(text.includes('FAIL') ? 1 : 0));
})));
