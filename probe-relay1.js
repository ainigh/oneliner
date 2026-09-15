const { JSDOM } = require('jsdom');
JSDOM.fromFile('apps/relay.html', {runScripts:'dangerously', resources:'usable', pretendToBeVisual:true}).then(dom => {
  const w = dom.window, d = w.document;
  setTimeout(() => {
    const W = w.eval('Weave'), A = W.application, L = W.library;
    const listPane = () => d.querySelector('[data-pane="list"]');
    const listRows = () => listPane().querySelectorAll('.weave-rowButton');
    console.log('panes:', d.querySelectorAll('.weave-pane').length, 'list rows:', listRows().length);
    console.log('count text:', listPane().querySelector('.weave-note').textContent);
    console.log('state:', JSON.stringify({folder:A.store.state.folder, chosen:A.store.state.chosen, checked:A.store.state.checked.length}));
    const first = listRows()[0];
    console.log('first row text:', JSON.stringify(first.textContent.slice(0,50)));
    first.dispatchEvent(new w.MouseEvent('click', {bubbles:true}));
    console.log('after click chosen =', A.store.state.chosen);
    console.log('first row aria-selected after click:', listRows()[0].getAttribute('aria-selected'));
    console.log('reader title:', (d.querySelector('[data-pane="main"] .weave-title')||{textContent:'<none>'}).textContent);
    const cb = listRows()[0].querySelector('input[type=checkbox]');
    console.log('checkbox found:', !!cb, 'checked:', cb && cb.checked);
    cb.checked = true; cb.dispatchEvent(new w.Event('change', {bubbles:true}));
    console.log('store.checked after toggle:', JSON.stringify(A.store.state.checked));
    const cb3 = listRows()[0].querySelector('input[type=checkbox]');
    console.log('checkbox reflects checked after repaint:', cb3.checked);
    // select-all checkbox in toolbar
    const tb = listPane().querySelector('.weave-toolbar');
    console.log('toolbar html snippet:', tb.innerHTML.slice(0,300));
    dom.window.close();
  }, 400);
}).catch(e=>{console.error('ERR',e);});
