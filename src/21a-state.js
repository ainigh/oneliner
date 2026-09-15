/* store: state that outlives a single pattern. Many handles watch one store, so two patterns can hold the same data without either owning it. */
Weave.library.patterns.storeFrom = holder => Object.assign(holder, { update: Weave.library.patterns.storeUpdater(holder), watch: Weave.library.patterns.storeWatcher(holder) });
Weave.library.patterns.store = value => Weave.library.patterns.storeFrom({ state: value, watchers: [] });
Weave.library.patterns.storeUpdater = holder => change => Weave.library.patterns.storeNotify(Weave.library.patterns.storeMerged(holder, change(holder.state)));
Weave.library.patterns.storeMerged = (holder, changes) => Object.assign(holder, { state: Weave.library.composition.merge(holder.state, changes) });
Weave.library.patterns.storeNotify = holder => (holder.watchers.forEach(watcher => watcher(holder.state)), holder);
Weave.library.patterns.storeWatcher = holder => watcher => (holder.watchers.push(watcher), () => Weave.library.patterns.storeForget(holder, watcher));
Weave.library.patterns.storeForget = (holder, watcher) => Object.assign(holder, { watchers: holder.watchers.filter(other => other !== watcher) });
Weave.library.patterns.followStore = (store, handle) => store.watch(state => Weave.library.patterns.repaint(Object.assign(handle, { state })));
Weave.library.patterns.joined = (store, handle) => Weave.library.patterns.holding(Object.assign(handle, { update: store.update }), Weave.library.patterns.followStore(store, handle));
Weave.library.patterns.connect = store => render => Weave.library.patterns.joined(store, Weave.library.patterns.view(render, store.state));

/* lifecycle: every subscription a pattern makes is held on its handle, so one call releases all of them and takes the element out of the page. */
Weave.library.patterns.releasesOf = handle => Weave.library.control.defaultTo([])(handle.releases);
Weave.library.patterns.holding = (handle, release) => Object.assign(handle, { releases: Weave.library.patterns.releasesOf(handle).concat([release]), stop: () => Weave.library.patterns.stop(handle) });
Weave.library.patterns.stop = handle => (Weave.library.patterns.releasesOf(handle).forEach(release => release()), Weave.library.patterns.detach(handle));
Weave.library.patterns.detach = handle => (Weave.library.events.offAll(handle.element), Weave.library.elements.remove(handle.element), Object.assign(handle, { releases: [] }));

/* history: one update at a time, remembered. Both directions are one row, so undo and redo can never drift apart. A handle or a store takes it, because both answer to state and update. */
Weave.library.patterns.stacks = {};
Weave.library.patterns.stacks.past = 'past';
Weave.library.patterns.stacks.future = 'future';
Weave.library.patterns.timeTravel = {};
Weave.library.patterns.timeTravel.undo = { from: Weave.library.patterns.stacks.past, to: Weave.library.patterns.stacks.future };
Weave.library.patterns.timeTravel.redo = { from: Weave.library.patterns.stacks.future, to: Weave.library.patterns.stacks.past };
Weave.library.patterns.emptyLog = () => Weave.library.composition.mapValues(Weave.library.composition.constant([]))(Weave.library.patterns.stacks);
Weave.library.patterns.popped = list => list.slice(0, -1);
Weave.library.patterns.isStore = holder => Weave.library.predicates.isDefined(holder.watchers);
Weave.library.patterns.storeShow = (holder, state) => Weave.library.patterns.storeNotify(Object.assign(holder, { state }));
Weave.library.patterns.showState = (holder, state) => Weave.library.control.either(Weave.library.patterns.isStore, () => Weave.library.patterns.storeShow(holder, state), () => Weave.library.patterns.repaint(Object.assign(holder, { state })))(holder);
Weave.library.patterns.rotated = (handle, log, row) => Object.assign(log, { [row.from]: Weave.library.patterns.popped(log[row.from]), [row.to]: log[row.to].concat([handle.state]) });
Weave.library.patterns.travelWith = (handle, log, row, target) => (Weave.library.patterns.rotated(handle, log, row), Weave.library.patterns.showState(handle, target));
Weave.library.patterns.travelTo = (handle, log, row) => Weave.library.patterns.travelWith(handle, log, row, Weave.library.composition.last(log[row.from]));
Weave.library.patterns.hasSteps = (log, row) => log[row.from].length > 0;
Weave.library.patterns.traveller = (handle, log) => row => () => Weave.library.control.when(() => Weave.library.patterns.hasSteps(log, row), () => Weave.library.patterns.travelTo(handle, log, row))(handle);
Weave.library.patterns.checker = log => row => () => Weave.library.patterns.hasSteps(log, row);
Weave.library.patterns.canPrefix = 'can';
Weave.library.patterns.canName = name => Weave.library.patterns.canPrefix + Weave.library.composition.capitalize(name);
Weave.library.patterns.travellers = (handle, log) => Weave.library.composition.mapValues(Weave.library.patterns.traveller(handle, log))(Weave.library.patterns.timeTravel);
Weave.library.patterns.checkers = log => Weave.library.composition.mapKeys(Weave.library.patterns.canName)(Weave.library.composition.mapValues(Weave.library.patterns.checker(log))(Weave.library.patterns.timeTravel));
Weave.library.patterns.recorded = (handle, log, update) => Object.assign(handle, { history: log, update: Weave.library.patterns.recorder(handle, log, update) });
Weave.library.patterns.recorder = (handle, log, update) => change => (Weave.library.patterns.record(log, handle.state), update(change));
Weave.library.patterns.record = (log, state) => Object.assign(log, { past: log.past.concat([state]), future: [] });
Weave.library.patterns.withHistory = handle => Weave.library.patterns.historyWired(handle, Weave.library.patterns.emptyLog(), handle.update);
Weave.library.patterns.historyWired = (handle, log, update) => Object.assign(Weave.library.patterns.recorded(handle, log, update), Weave.library.patterns.travellers(handle, log), Weave.library.patterns.checkers(log));

/* persistence: the same state, next visit. One key, one storage view, and a restore that shows itself through the same path every other change takes. */
Weave.library.patterns.saved = (view, key, holder) => (view.set(key, holder.state), holder);
Weave.library.patterns.saving = (view, key, update) => change => Weave.library.patterns.saved(view, key, update(change));
Weave.library.patterns.reloaded = (view, key, holder) => Weave.library.control.maybe(state => Weave.library.patterns.showState(holder, state))(view.get(key));
Weave.library.patterns.persistWired = (view, key, holder, update) => Object.assign(holder, { update: Weave.library.patterns.saving(view, key, update) });
Weave.library.patterns.persistIn = (view, key) => holder => (Weave.library.patterns.reloaded(view, key, holder), Weave.library.patterns.persistWired(view, key, holder, holder.update));
Weave.library.patterns.persist = key => holder => Weave.library.patterns.persistIn(Weave.library.storage.local, key)(holder);
Weave.library.patterns.forgetIn = (view, key) => view.remove(key);
Weave.library.patterns.forget = key => Weave.library.patterns.forgetIn(Weave.library.storage.local, key);
