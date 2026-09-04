/* load: evaluate dist/weave.js inside a jsdom window and hand back the Weave root. */
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

module.exports = function load(html) {
  const dom = new JSDOM(html || '<!doctype html><html><body></body></html>', { pretendToBeVisual: true, runScripts: 'outside-only', url: 'https://example.test/' });
  const source = fs.readFileSync(path.join(__dirname, '..', 'dist', 'weave.js'), 'utf8');
  const Weave = dom.window.eval(source + '\nWeave;');
  return { Weave, window: dom.window, document: dom.window.document };
};
