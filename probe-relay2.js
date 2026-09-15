const { JSDOM } = require('jsdom');
JSDOM.fromFile('apps/relay.html', {runScripts:'dangerously', resources:'usable', pretendToBeVisual:true}).then(dom => {
  const w = dom.window, d = w.document;
  setTimeout(() => {
    const W = w.eval('Weave'), A = W.application;
    const listPane = d.querySelector('[data-pane="list"]');
    console.log('list pane children classes:', [...listPane.children].map(c=>c.className));
    console.log('handle element in doc:', d.contains(A.listHandle.element), 'class', A.listHandle.element.className);
    console.log('handle state:', JSON.stringify({offset:A.listHandle.state.offset, height:A.listHandle.state.height, items:(A.listHandle.state.items||[]).length}));
    console.log('scroller count:', d.querySelectorAll('[data-key="virtualScroller"]').length);
    const sc = d.querySelector('[data-key="virtualScroller"]');
    if (sc) { console.log('scroller inner children:', sc.firstChild.children.length); console.log('scroller html len', sc.innerHTML.length); }
    console.log('list-row count:', d.querySelectorAll('.weave-listRow').length, d.querySelectorAll('[class*=list]').length);
    console.log('all classes in list pane:', [...new Set([...listPane.querySelectorAll('*')].map(e=>e.className))].join(' | '));
    dom.window.close();
  }, 400);
}).catch(e=>console.error(e));
