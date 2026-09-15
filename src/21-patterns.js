/* patterns: a pattern is a component with state. One view repaints every one of them, the same way. */
Weave.library.patterns = {};
Weave.library.patterns.nameOfFocus = () => Weave.library.control.maybe(Weave.library.attributes.name)(Weave.library.query.focused());
Weave.library.patterns.namedControl = (handle, name) => Weave.library.query.oneWithin(Weave.library.query.attributeSelector(Weave.library.browser.keywords.name, name))(handle.element);
Weave.library.patterns.restoreFocus = (handle, name) => Weave.library.control.maybe(found => Weave.library.control.maybe(Weave.library.browser.focus)(Weave.library.patterns.namedControl(handle, found)))(name);
Weave.library.patterns.paint = handle => Weave.library.elements.morphInner([handle.render(handle.state, handle.update)])(handle.element);
Weave.library.patterns.painted = (handle, name) => (Weave.library.patterns.paint(handle), Weave.library.patterns.restoreFocus(handle, name), handle);
Weave.library.patterns.repaint = handle => Weave.library.patterns.painted(handle, Weave.library.patterns.nameOfFocus());
Weave.library.patterns.merged = (handle, changes) => Object.assign(handle, { state: Weave.library.composition.merge(handle.state, changes) });
Weave.library.patterns.updater = handle => change => Weave.library.patterns.repaint(Weave.library.patterns.merged(handle, change(handle.state)));
Weave.library.patterns.wired = handle => Object.assign(handle, { update: Weave.library.patterns.updater(handle) });
Weave.library.patterns.view = (render, state) => Weave.library.patterns.repaint(Weave.library.patterns.wired({ element: Weave.library.components.view({}), render, state }));
Weave.library.patterns.mount = host => handle => (Weave.library.components.installStyles(), Weave.library.elements.append([handle.element])(host), handle);

/* labels: the only place a word the reader sees is written. One row, one word, every pattern. */
Weave.library.patterns.labels = {};
Weave.library.patterns.labels.add = 'Add';
Weave.library.patterns.labels.remove = 'Remove';
Weave.library.patterns.labels.next = 'Next';
Weave.library.patterns.labels.back = 'Back';
Weave.library.patterns.labels.send = 'Send';
Weave.library.patterns.labels.search = 'Search';
Weave.library.patterns.labels.left = 'Move left';
Weave.library.patterns.labels.right = 'Move right';
Weave.library.patterns.labels.empty = 'Nothing to show';
Weave.library.patterns.labels.hint = 'Add something, or widen the search';
Weave.library.patterns.labels.loading = 'Loading';
Weave.library.patterns.labels.failed = 'That did not load';
Weave.library.patterns.labels.retry = 'Try again';

/* shared: the helpers every pattern below reuses, so no two patterns solve the same problem twice. */
Weave.library.patterns.idKey = 'id';
Weave.library.patterns.idPrefix = 'weave-id-';
Weave.library.patterns.identify = () => Weave.library.composition.randomId(Weave.library.patterns.idPrefix);
Weave.library.patterns.withId = row => Weave.library.composition.merge({ [Weave.library.patterns.idKey]: Weave.library.patterns.identify() }, row);
Weave.library.patterns.rowsOf = spec => Weave.library.control.defaultTo([])(spec.items).map(Weave.library.patterns.withId);
Weave.library.patterns.wordsOf = row => Weave.library.composition.values(row).filter(Weave.library.predicates.isString).join(Weave.library.browser.keywords.space).toLowerCase();
Weave.library.patterns.matches = query => row => Weave.library.patterns.wordsOf(row).includes(query.toLowerCase());
Weave.library.patterns.search = (query, rows) => Weave.library.control.either(Weave.library.predicates.isEmpty, () => rows, () => rows.filter(Weave.library.patterns.matches(query)))(query);
Weave.library.patterns.emptyNote = () => Weave.library.components.emptyState({ title: Weave.library.patterns.labels.empty, note: Weave.library.patterns.labels.hint });
Weave.library.patterns.listOrEmpty = children => Weave.library.control.either(Weave.library.predicates.isEmptyArray, Weave.library.patterns.emptyNote, () => Weave.library.components.itemList({ children }))(children);
Weave.library.patterns.queryField = 'query';
Weave.library.patterns.queryState = () => ({ query: Weave.library.browser.keywords.empty, page: 0 });
Weave.library.patterns.queryHandler = update => event => update(() => ({ query: Weave.library.events.valueOfTarget(event), page: 0 }));
Weave.library.patterns.queryBox = (state, update) => Weave.library.components.searchBox({ name: Weave.library.patterns.queryField, placeholder: Weave.library.patterns.labels.search, value: state.query, onEdit: Weave.library.patterns.queryHandler(update) });
Weave.library.patterns.oneFieldForm = (label, name, onSubmit) => Weave.library.components.form({ submit: label, fields: [Weave.library.components.field({ label, name })], onSubmit });
Weave.library.patterns.splitView = (chooser, pane) => Weave.library.components.row({ children: [Weave.library.components.rail({ children: [chooser] }), Weave.library.components.panel({ children: [pane] })] });
Weave.library.patterns.stepBack = -1;
Weave.library.patterns.stepForward = 1;
Weave.library.patterns.stepper = (count, step) => index => Weave.library.composition.clamp(0, count - 1)(index + step);
Weave.library.patterns.sameId = row => other => row[Weave.library.patterns.idKey] === other[Weave.library.patterns.idKey];
Weave.library.patterns.replaced = (rows, row, change) => rows.map(other => Weave.library.control.either(Weave.library.patterns.sameId(row), () => Weave.library.composition.merge(other, change(other)), Weave.library.composition.identity)(other));
Weave.library.patterns.without = (rows, row) => rows.filter(other => !Weave.library.patterns.sameId(row)(other));
Weave.library.patterns.titleOf = spec => Weave.library.components.title({ text: Weave.library.components.titleOf(spec) });

/* todoList: a list you can add to, tick off, filter and empty. The filters are a table. */
Weave.library.patterns.todoFilters = {};
Weave.library.patterns.todoFilters.all = Weave.library.composition.always;
Weave.library.patterns.todoFilters.open = item => item.done !== true;
Weave.library.patterns.todoFilters.done = item => item.done === true;
Weave.library.patterns.defaultFilter = 'all';
Weave.library.patterns.taskField = 'task';
Weave.library.patterns.todoVisible = state => state.items.filter(Weave.library.patterns.todoFilters[state.filter]);
Weave.library.patterns.todoFlip = other => ({ done: other.done !== true });
Weave.library.patterns.todoToggle = (state, update, item) => () => update(() => ({ items: Weave.library.patterns.replaced(state.items, item, Weave.library.patterns.todoFlip) }));
Weave.library.patterns.todoDrop = (state, update, item) => () => update(() => ({ items: Weave.library.patterns.without(state.items, item) }));
Weave.library.patterns.todoCheck = (state, update, item) => Weave.library.components.checkField({ label: item.label, checked: item.done, onChoose: Weave.library.patterns.todoToggle(state, update, item) });
Weave.library.patterns.todoRemove = (state, update, item) => Weave.library.components.actionButton({ label: Weave.library.patterns.labels.remove, onAction: Weave.library.patterns.todoDrop(state, update, item) });
Weave.library.patterns.todoRow = (state, update) => item => Weave.library.components.item({ children: [Weave.library.components.spread({ children: [Weave.library.patterns.todoCheck(state, update, item), Weave.library.patterns.todoRemove(state, update, item)] })] });
Weave.library.patterns.todoNew = values => ({ label: values[Weave.library.patterns.taskField], done: false });
Weave.library.patterns.todoAdd = (state, update) => values => update(() => ({ items: state.items.concat([Weave.library.patterns.withId(Weave.library.patterns.todoNew(values))]) }));
Weave.library.patterns.todoForm = (state, update) => Weave.library.patterns.oneFieldForm(Weave.library.patterns.labels.add, Weave.library.patterns.taskField, Weave.library.patterns.todoAdd(state, update));
Weave.library.patterns.todoTab = update => name => ({ key: name, label: Weave.library.composition.capitalize(name), onAction: () => update(() => ({ filter: name })) });
Weave.library.patterns.todoTabs = (state, update) => Weave.library.components.tabs({ active: state.filter, items: Weave.library.composition.keys(Weave.library.patterns.todoFilters).map(Weave.library.patterns.todoTab(update)) });
Weave.library.patterns.todoItems = (state, update) => Weave.library.patterns.listOrEmpty(Weave.library.patterns.todoVisible(state).map(Weave.library.patterns.todoRow(state, update)));
Weave.library.patterns.todoParts = (spec, state, update) => [Weave.library.patterns.titleOf(spec), Weave.library.patterns.todoForm(state, update), Weave.library.patterns.todoTabs(state, update), Weave.library.patterns.todoItems(state, update)];
Weave.library.patterns.todoBody = spec => (state, update) => Weave.library.components.panel({ children: Weave.library.patterns.todoParts(spec, state, update) });
Weave.library.patterns.todoState = spec => ({ items: Weave.library.patterns.rowsOf(spec), filter: Weave.library.patterns.defaultFilter });
Weave.library.patterns.todoList = spec => Weave.library.patterns.view(Weave.library.patterns.todoBody(spec), Weave.library.patterns.todoState(spec));

/* board: cards in columns, moved by the arrow buttons or by dragging a card onto a lane. The columns are the caller's table. */
Weave.library.patterns.columnKey = 'column';
Weave.library.patterns.overKey = 'over';
Weave.library.patterns.boardKeys = spec => spec.columns.map(column => column.key);
Weave.library.patterns.boardIndex = (spec, card) => Weave.library.patterns.boardKeys(spec).indexOf(card[Weave.library.patterns.columnKey]);
Weave.library.patterns.boardTarget = (spec, card, step) => Weave.library.patterns.boardKeys(spec)[Weave.library.patterns.stepper(spec.columns.length, step)(Weave.library.patterns.boardIndex(spec, card))];
Weave.library.patterns.boardChange = (spec, card, step) => () => ({ [Weave.library.patterns.columnKey]: Weave.library.patterns.boardTarget(spec, card, step) });
Weave.library.patterns.boardShift = (spec, state, update, card, step) => () => update(() => ({ cards: Weave.library.patterns.replaced(state.cards, card, Weave.library.patterns.boardChange(spec, card, step)) }));
Weave.library.patterns.boardMove = (spec, state, update, card) => ([label, step]) => Weave.library.components.actionButton({ label, onAction: Weave.library.patterns.boardShift(spec, state, update, card, step) });
Weave.library.patterns.boardSteps = [[Weave.library.patterns.labels.left, Weave.library.patterns.stepBack], [Weave.library.patterns.labels.right, Weave.library.patterns.stepForward]];
Weave.library.patterns.boardMoves = (spec, state, update, card) => Weave.library.components.toolbar({ items: Weave.library.patterns.boardSteps.map(Weave.library.patterns.boardMove(spec, state, update, card)) });
Weave.library.patterns.boardGrip = card => el => Weave.library.interaction.dragSource({ identifier: card[Weave.library.patterns.idKey] })(el);
Weave.library.patterns.boardCardParts = (spec, state, update, card) => [Weave.library.components.subtitle({ text: card.label }), Weave.library.components.note({ text: card.note }), Weave.library.patterns.boardMoves(spec, state, update, card)];
Weave.library.patterns.boardCard = (spec, state, update) => card => Weave.library.components.card({ data: { key: card[Weave.library.patterns.idKey] }, ref: Weave.library.patterns.boardGrip(card), children: Weave.library.patterns.boardCardParts(spec, state, update, card) });
Weave.library.patterns.boardCards = (spec, state, update, column) => state.cards.filter(card => card[Weave.library.patterns.columnKey] === column.key).map(Weave.library.patterns.boardCard(spec, state, update));
Weave.library.patterns.boardLanded = column => () => ({ [Weave.library.patterns.columnKey]: column.key });
Weave.library.patterns.boardMoved = (state, column, identifier) => Weave.library.patterns.replaced(state.cards, { [Weave.library.patterns.idKey]: identifier }, Weave.library.patterns.boardLanded(column));
Weave.library.patterns.boardDropped = (state, update, column) => event => update(() => ({ cards: Weave.library.patterns.boardMoved(state, column, Weave.library.interaction.droppedData(Weave.library.events.preventDefault(event))) }));
Weave.library.patterns.boardOver = value => event => Weave.library.attributes.setData(Weave.library.patterns.overKey, value)(Weave.library.browser.currentTargetOf(event));
Weave.library.patterns.boardEnter = Weave.library.patterns.boardOver(Weave.library.browser.keywords.true);
Weave.library.patterns.boardLeave = Weave.library.patterns.boardOver(Weave.library.browser.keywords.false);
Weave.library.patterns.boardDropOptions = (state, update, column) => ({ onEnter: Weave.library.patterns.boardEnter, onLeave: Weave.library.patterns.boardLeave, onDrop: Weave.library.patterns.boardDropped(state, update, column) });
Weave.library.patterns.boardLane = (state, update, column) => el => Weave.library.interaction.droppable(Weave.library.patterns.boardDropOptions(state, update, column))(el);
Weave.library.patterns.boardColumnParts = (spec, state, update, column) => [Weave.library.components.subtitle({ text: column.label }), Weave.library.components.stack({ children: Weave.library.patterns.boardCards(spec, state, update, column) })];
Weave.library.patterns.boardColumn = (spec, state, update) => column => Weave.library.components.panel({ data: { key: column.key }, ref: Weave.library.patterns.boardLane(state, update, column), children: Weave.library.patterns.boardColumnParts(spec, state, update, column) });
Weave.library.patterns.boardBody = spec => (state, update) => Weave.library.components.tiles({ children: spec.columns.map(Weave.library.patterns.boardColumn(spec, state, update)) });
Weave.library.patterns.boardState = spec => ({ cards: Weave.library.control.defaultTo([])(spec.cards).map(Weave.library.patterns.withId) });
Weave.library.patterns.board = spec => Weave.library.patterns.view(Weave.library.patterns.boardBody(spec), Weave.library.patterns.boardState(spec));

/* dataGrid: search, sort and page over the caller's rows, using the one table component. */
Weave.library.patterns.gridFound = (spec, state) => Weave.library.patterns.search(state.query, spec.rows);
Weave.library.patterns.gridOrder = (spec, state) => Weave.library.composition.sortBy(row => row[state.sort])(Weave.library.patterns.gridFound(spec, state));
Weave.library.patterns.gridSorted = (spec, state) => Weave.library.control.either(() => Weave.library.predicates.isDefined(state.sort), () => Weave.library.patterns.gridOrder(spec, state), () => Weave.library.patterns.gridFound(spec, state))(state);
Weave.library.patterns.gridStart = (spec, state) => state.page * spec.pageSize;
Weave.library.patterns.gridRows = (spec, state) => Weave.library.patterns.gridSorted(spec, state).slice(Weave.library.patterns.gridStart(spec, state), Weave.library.patterns.gridStart(spec, state) + spec.pageSize);
Weave.library.patterns.gridPages = (spec, state) => Math.max(1, Math.ceil(Weave.library.patterns.gridFound(spec, state).length / spec.pageSize));
Weave.library.patterns.gridColumn = update => column => Weave.library.composition.merge(column, { onAction: () => update(() => ({ sort: column.key, page: 0 })) });
Weave.library.patterns.gridTable = (spec, state, update) => Weave.library.components.table({ columns: spec.columns.map(Weave.library.patterns.gridColumn(update)), rows: Weave.library.patterns.gridRows(spec, state) });
Weave.library.patterns.gridPager = (spec, state, update) => Weave.library.components.pagination({ pages: Weave.library.patterns.gridPages(spec, state), page: state.page + 1, label: Weave.library.components.titleOf(spec), onGo: page => update(() => ({ page: page - 1 })) });
Weave.library.patterns.gridParts = (spec, state, update) => [Weave.library.patterns.titleOf(spec), Weave.library.patterns.queryBox(state, update), Weave.library.patterns.gridTable(spec, state, update), Weave.library.patterns.gridPager(spec, state, update)];
Weave.library.patterns.gridBody = spec => (state, update) => Weave.library.components.panel({ children: Weave.library.patterns.gridParts(spec, state, update) });
Weave.library.patterns.dataGrid = spec => Weave.library.patterns.view(Weave.library.patterns.gridBody(spec), Weave.library.patterns.queryState());

/* masterDetail: a chooser beside a detail pane. The caller says how one item is drawn. */
Weave.library.patterns.detailPick = (update, item) => () => update(() => ({ chosen: item[Weave.library.patterns.idKey] }));
Weave.library.patterns.detailItem = update => item => ({ key: item[Weave.library.patterns.idKey], label: item.label, onAction: Weave.library.patterns.detailPick(update, item) });
Weave.library.patterns.detailChosen = (spec, state) => Weave.library.control.nullable(state.items.find(item => item[Weave.library.patterns.idKey] === state.chosen));
Weave.library.patterns.detailPane = (spec, state) => Weave.library.control.either(Weave.library.predicates.isDefined, spec.detail, Weave.library.patterns.emptyNote)(Weave.library.patterns.detailChosen(spec, state));
Weave.library.patterns.detailMenu = (state, update) => Weave.library.components.menu({ items: state.items.map(Weave.library.patterns.detailItem(update)) });
Weave.library.patterns.detailBody = spec => (state, update) => Weave.library.patterns.splitView(Weave.library.patterns.detailMenu(state, update), Weave.library.patterns.detailPane(spec, state));
Weave.library.patterns.detailState = spec => Weave.library.patterns.detailFirst(Weave.library.patterns.rowsOf(spec));
Weave.library.patterns.detailFirst = items => ({ items, chosen: Weave.library.control.reach(Weave.library.composition.first(items), Weave.library.patterns.idKey) });
Weave.library.patterns.masterDetail = spec => Weave.library.patterns.view(Weave.library.patterns.detailBody(spec), Weave.library.patterns.detailState(spec));

/* wizard: one step at a time, with the steps the caller supplies. */
Weave.library.patterns.wizardStep = (spec, state) => spec.steps[state.step];
Weave.library.patterns.wizardGo = (spec, state, update, step) => () => update(() => ({ step: Weave.library.patterns.stepper(spec.steps.length, step)(state.step) }));
Weave.library.patterns.wizardMove = (spec, state, update) => ([label, step]) => Weave.library.components.actionButton({ label, onAction: Weave.library.patterns.wizardGo(spec, state, update, step) });
Weave.library.patterns.wizardSteps = [[Weave.library.patterns.labels.back, Weave.library.patterns.stepBack], [Weave.library.patterns.labels.next, Weave.library.patterns.stepForward]];
Weave.library.patterns.wizardNav = (spec, state, update) => Weave.library.components.toolbar({ items: Weave.library.patterns.wizardSteps.map(Weave.library.patterns.wizardMove(spec, state, update)) });
Weave.library.patterns.wizardTrail = spec => Weave.library.components.breadcrumb({ label: Weave.library.components.titleOf(spec), items: spec.steps.map(step => ({ label: Weave.library.components.titleOf(step) })) });
Weave.library.patterns.wizardPane = (spec, state) => Weave.library.components.stack({ children: Weave.library.patterns.wizardStep(spec, state).body });
Weave.library.patterns.wizardParts = (spec, state, update) => [Weave.library.patterns.titleOf(Weave.library.patterns.wizardStep(spec, state)), Weave.library.patterns.wizardTrail(spec), Weave.library.patterns.wizardPane(spec, state), Weave.library.patterns.wizardNav(spec, state, update)];
Weave.library.patterns.wizardBody = spec => (state, update) => Weave.library.components.panel({ children: Weave.library.patterns.wizardParts(spec, state, update) });
Weave.library.patterns.wizardState = () => ({ step: 0 });
Weave.library.patterns.wizard = spec => Weave.library.patterns.view(Weave.library.patterns.wizardBody(spec), Weave.library.patterns.wizardState());

/* commandPalette: a search box over a list of commands, and nothing else. */
Weave.library.patterns.paletteItems = (spec, state) => Weave.library.patterns.search(state.query, spec.commands);
Weave.library.patterns.paletteMenu = (spec, state) => Weave.library.components.menu({ items: Weave.library.patterns.paletteItems(spec, state) });
Weave.library.patterns.paletteResults = (spec, state) => Weave.library.control.either(() => Weave.library.patterns.paletteItems(spec, state).length > 0, () => Weave.library.patterns.paletteMenu(spec, state), Weave.library.patterns.emptyNote)(state);
Weave.library.patterns.paletteBody = spec => (state, update) => Weave.library.components.panel({ children: [Weave.library.patterns.queryBox(state, update), Weave.library.patterns.paletteResults(spec, state)] });
Weave.library.patterns.commandPalette = spec => Weave.library.patterns.view(Weave.library.patterns.paletteBody(spec), Weave.library.patterns.queryState());

/* chat: a log and a composer. The composer is the one form component, again. */
Weave.library.patterns.messageField = 'message';
Weave.library.patterns.chatBubble = message => Weave.library.components.card({ children: [Weave.library.components.note({ text: message.from }), Weave.library.components.subtitle({ text: message.text })] });
Weave.library.patterns.chatLog = state => Weave.library.components.scroller({ children: [Weave.library.components.stack({ children: state.messages.map(Weave.library.patterns.chatBubble) })] });
Weave.library.patterns.chatNew = (spec, values) => ({ from: spec.author, text: values[Weave.library.patterns.messageField] });
Weave.library.patterns.chatSend = (spec, state, update) => values => update(() => ({ messages: state.messages.concat([Weave.library.patterns.chatNew(spec, values)]) }));
Weave.library.patterns.chatComposer = (spec, state, update) => Weave.library.patterns.oneFieldForm(Weave.library.patterns.labels.send, Weave.library.patterns.messageField, Weave.library.patterns.chatSend(spec, state, update));
Weave.library.patterns.chatParts = (spec, state, update) => [Weave.library.patterns.titleOf(spec), Weave.library.patterns.chatLog(state), Weave.library.patterns.chatComposer(spec, state, update)];
Weave.library.patterns.chatBody = spec => (state, update) => Weave.library.components.panel({ children: Weave.library.patterns.chatParts(spec, state, update) });
Weave.library.patterns.chatState = spec => ({ messages: Weave.library.control.defaultTo([])(spec.messages) });
Weave.library.patterns.chat = spec => Weave.library.patterns.view(Weave.library.patterns.chatBody(spec), Weave.library.patterns.chatState(spec));

/* explorer: a tree beside a detail pane, so a hierarchy reuses the same chooser as a flat list. */
Weave.library.patterns.explorerPick = (update, node) => () => update(() => ({ chosen: node }));
Weave.library.patterns.explorerNode = update => node => Weave.library.composition.merge(node, { onAction: Weave.library.patterns.explorerPick(update, node), children: Weave.library.patterns.explorerKids(update, node) });
Weave.library.patterns.explorerKids = (update, node) => Weave.library.control.maybe(kids => kids.map(Weave.library.patterns.explorerNode(update)))(node.children);
Weave.library.patterns.explorerTree = (spec, update) => Weave.library.components.tree({ nodes: spec.nodes.map(Weave.library.patterns.explorerNode(update)) });
Weave.library.patterns.explorerPane = (spec, state) => Weave.library.control.either(Weave.library.predicates.isDefined, spec.detail, Weave.library.patterns.emptyNote)(state.chosen);
Weave.library.patterns.explorerBody = spec => (state, update) => Weave.library.patterns.splitView(Weave.library.patterns.explorerTree(spec, update), Weave.library.patterns.explorerPane(spec, state));
Weave.library.patterns.explorer = spec => Weave.library.patterns.view(Weave.library.patterns.explorerBody(spec), Weave.library.patterns.wizardState());

/* dashboard: stat tiles above panels the caller fills with any other pattern or component. */
Weave.library.patterns.dashboardTiles = spec => Weave.library.components.tiles({ children: spec.stats.map(Weave.library.components.statTile) });
Weave.library.patterns.dashboardPanel = panel => Weave.library.components.panel({ children: [Weave.library.components.subtitle({ text: Weave.library.components.titleOf(panel) }), panel.body] });
Weave.library.patterns.dashboardPanels = spec => Weave.library.components.tiles({ children: spec.panels.map(Weave.library.patterns.dashboardPanel) });
Weave.library.patterns.dashboardParts = spec => [Weave.library.patterns.titleOf(spec), Weave.library.patterns.dashboardTiles(spec), Weave.library.patterns.dashboardPanels(spec)];
Weave.library.patterns.dashboardBody = spec => () => Weave.library.components.stack({ children: Weave.library.patterns.dashboardParts(spec) });
Weave.library.patterns.dashboard = spec => Weave.library.patterns.view(Weave.library.patterns.dashboardBody(spec), Weave.library.patterns.wizardState());

/* defaults: the only place a pattern's default measurement is written. One row, one default. */
Weave.library.patterns.defaults = {};
Weave.library.patterns.defaults.overscan = 4;

/* virtualList: only the rows the window can show exist. A spacer above them keeps the scrollbar honest. */
Weave.library.patterns.virtualInnerKey = 'virtualInner';
Weave.library.patterns.virtualSpacerKey = 'virtualSpacer';
Weave.library.patterns.virtualScrollerKey = 'virtualScroller';
Weave.library.patterns.virtualKeyFor = key => ({ [Weave.library.elements.keyName]: key });
Weave.library.patterns.virtualInnerData = () => Weave.library.patterns.virtualKeyFor(Weave.library.patterns.virtualInnerKey);
Weave.library.patterns.virtualSpacerData = () => Weave.library.patterns.virtualKeyFor(Weave.library.patterns.virtualSpacerKey);
Weave.library.patterns.virtualScrollerData = () => Weave.library.patterns.virtualKeyFor(Weave.library.patterns.virtualScrollerKey);
Weave.library.patterns.virtualHeight = value => ({ [Weave.library.browser.properties.height]: value });
Weave.library.patterns.virtualOverscan = spec => Weave.library.control.defaultTo(Weave.library.patterns.defaults.overscan)(spec.overscan);
Weave.library.patterns.virtualWindow = spec => Math.ceil(spec.height / spec.rowHeight) + 2 * Weave.library.patterns.virtualOverscan(spec);
Weave.library.patterns.virtualFirst = (spec, state) => Weave.library.composition.clamp(0, spec.items.length)(Math.floor(state.offset / spec.rowHeight) - Weave.library.patterns.virtualOverscan(spec));
Weave.library.patterns.virtualSlice = (spec, state) => spec.items.slice(Weave.library.patterns.virtualFirst(spec, state), Weave.library.patterns.virtualFirst(spec, state) + Weave.library.patterns.virtualWindow(spec));
Weave.library.patterns.virtualTotal = spec => spec.items.length * spec.rowHeight;
Weave.library.patterns.virtualLead = (spec, state) => Weave.library.patterns.virtualFirst(spec, state) * spec.rowHeight;
Weave.library.patterns.virtualSpacerBox = (spec, state) => Weave.library.components.view({ styles: Weave.library.patterns.virtualHeight(Weave.library.patterns.virtualLead(spec, state)), data: Weave.library.patterns.virtualSpacerData() });
Weave.library.patterns.virtualIdOf = (item, index) => Weave.library.control.defaultTo(index)(item[Weave.library.patterns.idKey]);
Weave.library.patterns.virtualRowKey = (spec, state, item, index) => Weave.library.patterns.virtualKeyFor(Weave.library.patterns.virtualIdOf(item, Weave.library.patterns.virtualFirst(spec, state) + index));
Weave.library.patterns.virtualRow = (spec, state) => (item, index) => Weave.library.components.listRow({ children: [spec.row(item)], styles: Weave.library.patterns.virtualHeight(spec.rowHeight), data: Weave.library.patterns.virtualRowKey(spec, state, item, index) });
Weave.library.patterns.virtualRows = (spec, state) => Weave.library.patterns.virtualSlice(spec, state).map(Weave.library.patterns.virtualRow(spec, state));
Weave.library.patterns.virtualChildren = (spec, state) => [Weave.library.patterns.virtualSpacerBox(spec, state)].concat(Weave.library.patterns.virtualRows(spec, state));
Weave.library.patterns.virtualInnerSpec = (spec, state) => ({ styles: Weave.library.patterns.virtualHeight(Weave.library.patterns.virtualTotal(spec)), data: Weave.library.patterns.virtualInnerData(), children: Weave.library.patterns.virtualChildren(spec, state) });
Weave.library.patterns.virtualInnerBox = (spec, state) => Weave.library.components.view(Weave.library.patterns.virtualInnerSpec(spec, state));
Weave.library.patterns.virtualUpdater = update => Weave.library.timing.throttleFrame(offset => update(() => ({ offset })));
Weave.library.patterns.virtualScrolled = throttled => event => throttled(Weave.library.browser.scrollTopOf(Weave.library.events.currentTarget(event)));
Weave.library.patterns.virtualListener = update => Weave.library.patterns.virtualScrolled(Weave.library.patterns.virtualUpdater(update));
Weave.library.patterns.virtualRestore = state => el => Weave.library.browser.setScrollTop(el, state.offset);
Weave.library.patterns.virtualStyles = spec => Weave.library.composition.merge(Weave.library.patterns.virtualHeight(spec.height), { [Weave.library.browser.properties.overflow]: Weave.library.components.values.auto });
Weave.library.patterns.virtualBoxPart = (spec, state) => ({ ref: Weave.library.patterns.virtualRestore(state), children: [Weave.library.patterns.virtualInnerBox(spec, state)] });
Weave.library.patterns.virtualBoxHead = (spec, update) => ({ styles: Weave.library.patterns.virtualStyles(spec), data: Weave.library.patterns.virtualScrollerData(), onScroll: Weave.library.patterns.virtualListener(update) });
Weave.library.patterns.virtualBoxSpec = (spec, state, update) => Weave.library.composition.merge(Weave.library.patterns.virtualBoxHead(spec, update), Weave.library.patterns.virtualBoxPart(spec, state));
Weave.library.patterns.virtualBox = (spec, state, update) => Weave.library.components.scroller(Weave.library.patterns.virtualBoxSpec(spec, state, update));
Weave.library.patterns.virtualState = () => ({ offset: 0 });
Weave.library.patterns.virtualBody = spec => (state, update) => Weave.library.patterns.virtualBox(spec, state, update);
Weave.library.patterns.virtualList = spec => Weave.library.patterns.view(Weave.library.patterns.virtualBody(spec), Weave.library.patterns.virtualState());

/* virtualGrid: the search box of the data grid over a virtual list, so no query ever draws the whole table. */
Weave.library.patterns.virtualCell = row => column => Weave.library.components.note({ text: String(Weave.library.components.cellValue(row, column)) });
Weave.library.patterns.virtualGridRow = spec => row => Weave.library.components.row({ children: spec.columns.map(Weave.library.patterns.virtualCell(row)) });
Weave.library.patterns.virtualGridSpec = (spec, state) => Weave.library.composition.merge(spec, { items: Weave.library.patterns.gridFound(spec, state), row: Weave.library.patterns.virtualGridRow(spec) });
Weave.library.patterns.virtualGridList = (spec, state, update) => Weave.library.patterns.virtualBox(Weave.library.patterns.virtualGridSpec(spec, state), state, update);
Weave.library.patterns.virtualGridParts = (spec, state, update) => [Weave.library.patterns.titleOf(spec), Weave.library.patterns.queryBox(state, update), Weave.library.patterns.virtualGridList(spec, state, update)];
Weave.library.patterns.virtualGridBody = spec => (state, update) => Weave.library.components.panel({ children: Weave.library.patterns.virtualGridParts(spec, state, update) });
Weave.library.patterns.virtualGridState = () => Weave.library.composition.merge(Weave.library.patterns.queryState(), Weave.library.patterns.virtualState());
Weave.library.patterns.virtualGrid = spec => Weave.library.patterns.view(Weave.library.patterns.virtualGridBody(spec), Weave.library.patterns.virtualGridState());
