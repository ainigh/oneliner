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

/* resource: a pattern whose state is a request. Loading, failed and loaded are three rows of one table, so no application writes that branch again. */
Weave.library.patterns.phases = {};
Weave.library.patterns.phases.loading = 'loading';
Weave.library.patterns.phases.failed = 'failed';
Weave.library.patterns.phases.ready = 'ready';
Weave.library.patterns.updaterOf = handle => change => handle.update(change);
Weave.library.patterns.resolvedInto = update => value => update(() => ({ phase: Weave.library.patterns.phases.ready, value }));
Weave.library.patterns.failedInto = update => reason => update(() => ({ phase: Weave.library.patterns.phases.failed, reason }));
Weave.library.patterns.request = (spec, update) => Weave.library.control.recover(Weave.library.control.after(spec.load())(Weave.library.patterns.resolvedInto(update)))(Weave.library.patterns.failedInto(update));
Weave.library.patterns.reload = (spec, update) => (update(() => ({ phase: Weave.library.patterns.phases.loading })), Weave.library.patterns.request(spec, update));
Weave.library.patterns.reloader = (spec, update) => () => Weave.library.patterns.reload(spec, update);
Weave.library.patterns.busyNote = () => Weave.library.components.note({ text: Weave.library.patterns.labels.loading });
Weave.library.patterns.retryButton = retry => Weave.library.components.actionButton({ label: Weave.library.patterns.labels.retry, onAction: retry });
Weave.library.patterns.failedNote = (reason, retry) => Weave.library.components.stack({ children: [Weave.library.components.note({ text: Weave.library.patterns.labels.failed }), Weave.library.patterns.retryButton(retry)] });

/* panes: one row per phase, so which render a state gets is a lookup and never a branch. */
Weave.library.patterns.panes = {};
Weave.library.patterns.panes.loading = (spec, state, update) => Weave.library.control.defaultTo(Weave.library.patterns.busyNote)(spec.loading)(state, update);
Weave.library.patterns.panes.failed = (spec, state, update) => Weave.library.control.defaultTo(Weave.library.patterns.failedNote)(spec.failed)(state.reason, Weave.library.patterns.reloader(spec, update));
Weave.library.patterns.panes.ready = (spec, state, update) => spec.ready(state.value, Weave.library.patterns.reloader(spec, update));
Weave.library.patterns.paneFor = (spec, state, update) => Weave.library.control.selectByKey(Weave.library.patterns.panes, Weave.library.patterns.panes.loading)(state.phase)(spec, state, update);
Weave.library.patterns.resourceParts = (spec, state, update) => [Weave.library.patterns.titleOf(spec), Weave.library.patterns.paneFor(spec, state, update)];
Weave.library.patterns.resourceBody = spec => (state, update) => Weave.library.components.panel({ children: Weave.library.patterns.resourceParts(spec, state, update) });
Weave.library.patterns.resourceState = () => ({ phase: Weave.library.patterns.phases.loading });
Weave.library.patterns.started = (spec, handle) => (Weave.library.patterns.request(spec, Weave.library.patterns.updaterOf(handle)), handle);
Weave.library.patterns.resource = spec => Weave.library.patterns.started(spec, Weave.library.patterns.view(Weave.library.patterns.resourceBody(spec), Weave.library.patterns.resourceState()));
