const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!doctype html><html><body></body></html>', {runScripts:'outside-only', pretendToBeVisual:true});
const W = dom.window.eval(require('fs').readFileSync('dist/weave.js','utf8') + '\nWeave;');
const L = W.library, C = L.components;
require('fs').writeFileSync('probe-sheet.css', C.styleText());
const rules = Object.keys(C.rules);
console.log('rule classes:', rules.length);
// media rule targets that have no base rule
Object.entries(C.mediaRules).forEach(([k,row]) => Object.keys(row.rules).forEach(name => { if (!rules.includes(name)) console.log('MEDIA rule targets missing class:', k, name); }));
// state rule targets
Object.values(C.stateRules).forEach(row => { if(!rules.includes(row.name)) console.log('STATE rule targets missing class:', row.name, row.state); });
// modifier targets
Object.entries(C.modifiers).forEach(([k,row]) => { if(!rules.includes(row.on)) console.log('MODIFIER targets missing class:', k, row.on); });
// interactive names without a rule
Object.values(C.interactive).forEach(n => { if(!rules.includes(n)) console.log('INTERACTIVE name with no base rule:', n); });
console.log('values.grow=',JSON.stringify(C.values.grow),'values.clip=',JSON.stringify(C.values.clip),'values.faded=',JSON.stringify(C.values.faded),'values.full=',JSON.stringify(C.values.full),'values.half=',JSON.stringify(C.values.half));
console.log('markNames:', JSON.stringify(C.markNames));
console.log('sheetExtras order:', Object.keys(C.sheetExtras).join(','));
console.log('stateNames order:', Object.keys(C.stateNames).join(','));
