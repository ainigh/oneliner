/* overlays: everything that sits above the page. One host, one ladder, and a release for every open thing. */
Weave.library.overlays = {};
Weave.library.overlays.hostName = 'overlayHost';
Weave.library.overlays.hostSelector = () => Weave.library.components.classSelector(Weave.library.overlays.hostName);
Weave.library.overlays.makeHost = () => (Weave.library.components.installStyles(), Weave.library.elements.appendTo(Weave.library.browser.body())(Weave.library.components.overlayHost({})));
Weave.library.overlays.host = () => Weave.library.control.either(Weave.library.predicates.isDefined, Weave.library.composition.identity, Weave.library.overlays.makeHost)(Weave.library.query.one(Weave.library.overlays.hostSelector()));
Weave.library.overlays.mount = element => Weave.library.elements.appendTo(Weave.library.overlays.host())(element);
Weave.library.overlays.unmount = element => Weave.library.elements.remove(element);
Weave.library.overlays.openCount = () => Weave.library.query.children(Weave.library.overlays.host()).length;

/* layers: a scrim and a box, mounted together and released together. Only the box maker differs. */
Weave.library.overlays.layerState = spec => ({ spec, nodes: [], close: Weave.library.composition.noop });
Weave.library.overlays.layerAria = spec => ({ modal: Weave.library.browser.keywords.true, label: Weave.library.components.titleOf(spec) });
Weave.library.overlays.layerAttributes = () => Weave.library.components.roleAttribute(Weave.library.accessibility.roles.dialog);
Weave.library.overlays.layerBox = (make, spec) => make({ children: Weave.library.components.childrenOf(spec, Weave.library.components.bodyKey), attributes: Weave.library.overlays.layerAttributes(), aria: Weave.library.overlays.layerAria(spec) });
Weave.library.overlays.layerScrim = state => Weave.library.components.scrim({ onAction: () => Weave.library.overlays.layerClose(state) });
Weave.library.overlays.layerNodes = (make, spec, state) => [Weave.library.overlays.layerScrim(state), Weave.library.overlays.layerBox(make, spec)].map(Weave.library.overlays.mount);
Weave.library.overlays.layerBoxOf = state => Weave.library.composition.last(state.nodes);
Weave.library.overlays.layerFill = (state, make) => Object.assign(state, { nodes: Weave.library.overlays.layerNodes(make, state.spec, state) });
Weave.library.overlays.layerHold = state => Object.assign(state, { close: Weave.library.control.once(() => Weave.library.overlays.layerEnd(state)), release: Weave.library.accessibility.modal(Weave.library.overlays.layerBoxOf(state), () => Weave.library.overlays.layerClose(state)) });
Weave.library.overlays.layerEnd = state => (state.release(), state.nodes.forEach(Weave.library.overlays.unmount), Weave.library.control.maybe(done => done())(state.spec.onClose));
Weave.library.overlays.layerClose = state => state.close();
Weave.library.overlays.layerHandle = state => ({ element: Weave.library.overlays.layerBoxOf(state), close: state.close });
Weave.library.overlays.openLayer = (make, spec) => Weave.library.overlays.layerHandle(Weave.library.overlays.layerHold(Weave.library.overlays.layerFill(Weave.library.overlays.layerState(spec), make)));
Weave.library.overlays.dialog = spec => Weave.library.overlays.openLayer(Weave.library.components.dialogBox, spec);
Weave.library.overlays.drawer = spec => Weave.library.overlays.openLayer(Weave.library.components.drawerBox, spec);
Weave.library.overlays.sheet = spec => Weave.library.overlays.openLayer(Weave.library.components.sheetBox, spec);

/* anchoring: a popover is placed from the anchor's own rectangle, then clamped back onto the screen. */
Weave.library.overlays.gap = 4;
Weave.library.overlays.edge = 8;
Weave.library.overlays.anchorLeft = (rect, width) => Weave.library.composition.clamp(Weave.library.overlays.edge, Weave.library.overlays.rightLimit(width))(rect.left);
Weave.library.overlays.rightLimit = width => Math.max(Weave.library.overlays.edge, Weave.library.style.viewport().width - width - Weave.library.overlays.edge);
Weave.library.overlays.anchorTop = (rect, height) => Weave.library.control.either(() => Weave.library.overlays.fitsBelow(rect, height), () => rect.bottom + Weave.library.overlays.gap, () => Weave.library.overlays.aboveTop(rect, height))(rect);
Weave.library.overlays.fitsBelow = (rect, height) => rect.bottom + height + Weave.library.overlays.gap <= Weave.library.style.viewport().height;
Weave.library.overlays.aboveTop = (rect, height) => Math.max(Weave.library.overlays.edge, rect.top - height - Weave.library.overlays.gap);
Weave.library.overlays.placement = (rect, box) => ({ left: Weave.library.overlays.anchorLeft(rect, Weave.library.style.outerWidth(box)), top: Weave.library.overlays.anchorTop(rect, Weave.library.style.outerHeight(box)) });
Weave.library.overlays.placeAt = (box, anchor) => Weave.library.style.setCssAll(Weave.library.overlays.placement(Weave.library.style.rect(anchor), box))(box);

/* popovers: at most one is open at a time, and it goes when you click away, press escape or scroll. */
Weave.library.overlays.openPopovers = [];
Weave.library.overlays.closeAll = () => Weave.library.overlays.openPopovers.slice().forEach(state => state.close());
Weave.library.overlays.forget = state => Weave.library.overlays.openPopovers.splice(Weave.library.overlays.openPopovers.indexOf(state), 1);
Weave.library.overlays.remember = state => (Weave.library.overlays.openPopovers.push(state), state);
Weave.library.overlays.isOutside = (state, target) => Weave.library.control.and(!Weave.library.predicates.contains(state.box, target), !Weave.library.predicates.contains(state.anchor, target));
Weave.library.overlays.outsideStep = state => event => Weave.library.control.when(() => Weave.library.overlays.isOutside(state, Weave.library.browser.targetOf(event)), () => state.close())(event);
Weave.library.overlays.watchOutside = state => Weave.library.events.on(Weave.library.events.types.pointerdown, Weave.library.overlays.outsideStep(state))(Weave.library.browser.document());
Weave.library.overlays.watchEscape = state => Weave.library.interaction.onEscape(() => state.close())(Weave.library.browser.document());
Weave.library.overlays.popoverState = (anchor, box) => ({ anchor, box, close: Weave.library.composition.noop, releases: [] });
Weave.library.overlays.popoverHold = state => Object.assign(state, { close: Weave.library.control.once(() => Weave.library.overlays.popoverEnd(state)), releases: [Weave.library.overlays.watchOutside(state), Weave.library.overlays.watchEscape(state)] });
Weave.library.overlays.popoverEnd = state => (state.releases.forEach(release => release()), Weave.library.overlays.unmount(state.box), Weave.library.overlays.forget(state), Weave.library.overlays.popoverDone(state));
Weave.library.overlays.popoverDone = state => Weave.library.control.maybe(done => done())(state.onClose);
Weave.library.overlays.popoverBox = spec => Weave.library.components.popoverBox({ children: Weave.library.components.childrenOf(spec, Weave.library.components.bodyKey), attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.menu) });
Weave.library.overlays.popoverOpen = (anchor, spec) => Weave.library.overlays.popoverPlace(Weave.library.overlays.popoverState(anchor, Weave.library.overlays.mount(Weave.library.overlays.popoverBox(spec))), spec);
Weave.library.overlays.popoverPlace = (state, spec) => Weave.library.overlays.popoverReady(Object.assign(state, { onClose: spec.onClose }), Weave.library.overlays.placeAt(state.box, state.anchor));
Weave.library.overlays.popoverReady = (state, ignored) => Weave.library.overlays.popoverHandle(Weave.library.overlays.remember(Weave.library.overlays.popoverHold(state)));
Weave.library.overlays.popoverHandle = state => ({ element: state.box, close: state.close });
Weave.library.overlays.popover = (anchor, spec) => (Weave.library.overlays.closeAll(), Weave.library.overlays.popoverOpen(anchor, spec));

/* toasts: one pinned host, created on first use, so a notification is never laid out in the page. */
Weave.library.overlays.toastHostName = 'toastHost';
Weave.library.overlays.toastSelector = () => Weave.library.components.classSelector(Weave.library.overlays.toastHostName);
Weave.library.overlays.makeToastHost = () => Weave.library.overlays.mount(Weave.library.components.toastHost({ attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.status), aria: { live: Weave.library.accessibility.politeness.polite } }));
Weave.library.overlays.toastHost = () => Weave.library.control.either(Weave.library.predicates.isDefined, Weave.library.composition.identity, Weave.library.overlays.makeToastHost)(Weave.library.query.one(Weave.library.overlays.toastSelector()));
Weave.library.overlays.toastSlot = element => Weave.library.components.toastSlot({ children: [element] });
Weave.library.overlays.toast = element => Weave.library.elements.appendTo(Weave.library.overlays.toastHost())(Weave.library.overlays.toastSlot(element));

/* tips: a bubble that follows a target, shown on hover and on focus, removed on the matching pair. */
Weave.library.overlays.tipEvents = {};
Weave.library.overlays.tipEvents.show = [Weave.library.events.types.mouseenter, Weave.library.events.types.focusin];
Weave.library.overlays.tipEvents.hide = [Weave.library.events.types.mouseleave, Weave.library.events.types.focusout];
Weave.library.overlays.tipBubbleFor = text => Weave.library.components.tipBubble({ text, attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.tooltip) });
Weave.library.overlays.tipState = () => ({ bubble: undefined });
Weave.library.overlays.tipShow = (state, target, text) => Object.assign(state, { bubble: Weave.library.overlays.placeAt(Weave.library.overlays.mount(Weave.library.overlays.tipBubbleFor(text)), target) });
Weave.library.overlays.tipHide = state => (Weave.library.control.maybe(Weave.library.overlays.unmount)(state.bubble), Object.assign(state, { bubble: undefined }));
Weave.library.overlays.tipEnter = (state, text) => event => Weave.library.overlays.tipShow(state, Weave.library.browser.currentTargetOf(event), text);
Weave.library.overlays.tipLeave = state => () => Weave.library.overlays.tipHide(state);
Weave.library.overlays.tipShowBinders = (state, text) => Weave.library.overlays.tipEvents.show.map(type => Weave.library.events.on(type, Weave.library.overlays.tipEnter(state, text)));
Weave.library.overlays.tipHideBinders = state => Weave.library.overlays.tipEvents.hide.map(type => Weave.library.events.on(type, Weave.library.overlays.tipLeave(state)));
Weave.library.overlays.tipBinders = (state, text) => Weave.library.overlays.tipShowBinders(state, text).concat(Weave.library.overlays.tipHideBinders(state));
Weave.library.overlays.tipRelease = (state, releases) => () => (Weave.library.overlays.tipHide(state), releases.forEach(release => release()));
Weave.library.overlays.tipBind = (element, state, text) => Weave.library.overlays.tipRelease(state, Weave.library.overlays.tipBinders(state, text).map(bind => bind(element)));
Weave.library.overlays.tip = text => element => Weave.library.overlays.tipBind(element, Weave.library.overlays.tipState(), text);
