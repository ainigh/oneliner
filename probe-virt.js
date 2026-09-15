const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', {runScripts:'outside-only', pretendToBeVisual:true});
const w = dom.window, d = w.document;
const W = w.eval(require('fs').readFileSync('dist/weave.js','utf8') + '\nWeave;');
const L = W.library;
// instrument: is the element the ref sees attached?
const origRef = L.patterns.virtualRef;
L.patterns.virtualRef = (spec, state, update) => el => { console.log('  ref fires: el connected?', el.isConnected, 'outerHeight=', L.style.outerHeight(el), 'state.height=', state.height); return origRef(spec,state,update)(el); };
// pretend the pane is 800px tall once attached
const realOuter = L.style.outerHeight;
L.style.outerHeight = el => (el.isConnected ? 800 : realOuter(el));
const items = L.composition.range(500).map(i => ({id:i+1, label:'row '+(i+1)}));
console.log('== virtualList fill:true ==');
const h = L.patterns.virtualList({ items, fill: true, row: item => L.elements.div({text:item.label}) });
L.patterns.mount(d.body)(h);
console.log('after mount: state.height =', h.state.height, 'rows in DOM =', d.querySelectorAll('.weave-list-row').length);
h.update(() => ({}));
console.log('after a forced repaint: state.height =', h.state.height, 'rows =', d.querySelectorAll('.weave-list-row').length);
console.log('scroller connected?', d.querySelector('[data-key=virtualScroller]').isConnected);
console.log('== show() with a shorter list while scrolled ==');
const sc = d.querySelector('[data-key=virtualScroller]');
h.update(() => ({ offset: 3000 }));
console.log('offset 3000 -> first row text:', d.querySelector('.weave-list-row').textContent, 'spacer height:', d.querySelector('[data-key=virtualSpacer]').style.height);
h.show(items.slice(0,5));
console.log('after show(5 items): offset =', h.state.offset, 'rows =', d.querySelectorAll('.weave-list-row').length, 'spacer h =', d.querySelector('[data-key=virtualSpacer]').style.height, 'inner h =', d.querySelector('[data-key=virtualInner]').style.height);
console.log('scroller node identity preserved:', sc === d.querySelector('[data-key=virtualScroller]'));
