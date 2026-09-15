const { JSDOM } = require('jsdom');
JSDOM.fromFile('apps/relay.html', {runScripts:'dangerously', resources:'usable', pretendToBeVisual:true}).then(dom => {
  const w = dom.window, d = w.document;
  setTimeout(() => {
    const W = w.eval('Weave'), A = W.application;
    const lp = () => d.querySelector('[data-pane="list"]');
    const rows = () => [...lp().querySelectorAll('.weave-row-button')];
    console.log('rows:', rows().length);
    const r0 = rows()[0];
    console.log('row0 aria-selected before:', r0.getAttribute('aria-selected'));
    r0.dispatchEvent(new w.MouseEvent('click', {bubbles:true}));
    console.log('chosen after click:', A.store.state.chosen);
    console.log('row0 aria-selected after:', rows()[0].getAttribute('aria-selected'));
    console.log('reader title:', (d.querySelector('[data-pane="main"] .weave-title')||{textContent:'<none>'}).textContent);
    const cb = rows()[0].querySelector('input[type=checkbox]');
    cb.checked = true; cb.dispatchEvent(new w.Event('change', {bubbles:true}));
    console.log('store.checked:', JSON.stringify(A.store.state.checked));
    console.log('row0 checkbox after repaint:', rows()[0].querySelector('input[type=checkbox]').checked);
    console.log('--- select all ---');
    const selAll = lp().querySelector('.weave-toolbar input[type=checkbox]');
    selAll.checked = true; selAll.dispatchEvent(new w.Event('change', {bubbles:true}));
    console.log('checked count after select-all:', A.store.state.checked.length);
    console.log('row0 checkbox now:', rows()[0].querySelector('input[type=checkbox]').checked);
    dom.window.close();
  }, 400);
}).catch(e=>console.error(e));
