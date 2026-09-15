const { JSDOM } = require('jsdom');
JSDOM.fromFile('apps/relay.html', {runScripts:'dangerously', resources:'usable', pretendToBeVisual:true}).then(dom => {
  const w = dom.window, d = w.document;
  setTimeout(() => {
    const W = w.eval('Weave'), A = W.application, L = W.library;
    const lp = () => d.querySelector('[data-pane="list"]');
    const rows = () => [...lp().querySelectorAll('.weave-row-button')];
    const railBtn = label => [...d.querySelectorAll('[data-pane="rail"] .weave-row-button')].find(b=>b.getAttribute('aria-label')===label);
    const btn = label => [...d.querySelectorAll('.weave-button')].find(b=>b.textContent.trim()===label);
    const click = el => el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    const press = (key,opt={}) => d.dispatchEvent(new w.KeyboardEvent('keydown',Object.assign({key,bubbles:true},opt)));
    const audit = t => { const a=L.accessibility.audit(d.body).map(r=>r.message); console.log('  audit@'+t+':', a.length?JSON.stringify(a):'clean'); };
    const sc = () => d.querySelector('[data-key=virtualScroller]');
    console.log('== listener accumulation on the scroller ==');
    console.log('scroller records before:', L.events.recordsOf(sc()).length);
    for (let i=0;i<20;i++) A.store.update(()=>({})); 
    console.log('scroller records after 20 repaints:', L.events.recordsOf(sc()).length, 'same node:', sc()===sc());
    console.log('doc records:', L.events.recordsOf(d).length, 'body children:', d.body.children.length);
    console.log('== switch folder while threads are checked ==');
    const selAll = lp().querySelector('.weave-toolbar input[type=checkbox]');
    selAll.checked=true; selAll.dispatchEvent(new w.Event('change',{bubbles:true}));
    console.log('checked:', A.store.state.checked.length);
    click(railBtn('Starred'));
    console.log('after folder switch: folder=',A.store.state.folder,'checked=',A.store.state.checked.length,'rows=',rows().length);
    audit('folder switch');
    console.log('== search, select all, move ==');
    const box = lp().querySelector('input[type=search], .weave-search-box');
    console.log('search input tag:', box && box.tagName, box && box.type);
    box.value='pricing'; box.dispatchEvent(new w.Event('input',{bubbles:true}));
    console.log('after search: visible=',A.visible(A.store.state).length,'rows=',rows().length);
    const sel2 = lp().querySelector('.weave-toolbar input[type=checkbox]');
    sel2.checked=true; sel2.dispatchEvent(new w.Event('change',{bubbles:true}));
    console.log('checked after select-all under query:', A.store.state.checked.length);
    click(btn('Report spam'));
    console.log('after move: starred=',A.threads.filter(t=>t.folder==='starred').length,'rows shown=',rows().length,'handle items=',A.listHandle.state.items.length);
    audit('after move');
    console.log('== empty the folder, then act on it ==');
    A.store.update(()=>({query:'', checked:[]}));
    const all = lp().querySelector('.weave-toolbar input[type=checkbox]');
    all.checked=true; all.dispatchEvent(new w.Event('change',{bubbles:true}));
    click(btn('Archive'));
    A.store.update(()=>({})); // force refresh
    console.log('starred now:', A.threads.filter(t=>t.folder==='starred').length, 'rows:', rows().length, 'countText:', lp().querySelector('.weave-sticky .weave-note').textContent.slice(0,40));
    console.log('press j on empty folder...');
    try { press('j'); press('j'); press('k'); console.log('  survived, chosen =', A.store.state.chosen); } catch(e){ console.log('  THREW:', e.message); }
    audit('empty folder');
    console.log('== j past the end ==');
    click(railBtn('Inbox'));
    A.store.update(()=>({query:'zzzz-nothing'}));
    console.log('visible under impossible query:', A.visible(A.store.state).length, 'rows:', rows().length);
    try { press('j'); console.log('  j ok, chosen=',A.store.state.chosen);} catch(e){console.log('  THREW:',e.message);}
    audit('no results');
    dom.window.close();
  }, 400);
}).catch(e=>console.error(e));
