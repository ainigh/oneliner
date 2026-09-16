/* patterns: a pattern is a component with state. One view repaints every one of them, the same way. */
Weave.library.patterns = {};
Weave.library.patterns.focusReaders = {};
Weave.library.patterns.focusReaders.name = { read: Weave.library.attributes.name, select: value => Weave.library.query.attributeSelector(Weave.library.browser.keywords.name, value) };
Weave.library.patterns.focusReaders.id = { read: Weave.library.attributes.attribute(Weave.library.browser.keywords.id), select: value => Weave.library.query.attributeSelector(Weave.library.browser.keywords.id, value) };
Weave.library.patterns.focusReaders.key = { read: Weave.library.attributes.data(Weave.library.elements.keyName), select: value => Weave.library.query.dataSelector(Weave.library.elements.keyName, value) };
Weave.library.patterns.focusValue = (row, el) => Weave.library.control.guard(value => !Weave.library.predicates.isEmpty(value))(row.read(el));
Weave.library.patterns.focusSelectorRow = el => row => Weave.library.control.maybe(row.select)(Weave.library.patterns.focusValue(row, el));
Weave.library.patterns.focusSelectorFor = el => Weave.library.composition.first(Weave.library.composition.compact(Weave.library.composition.values(Weave.library.patterns.focusReaders).map(Weave.library.patterns.focusSelectorRow(el))));
Weave.library.patterns.focusSelector = () => Weave.library.control.maybe(Weave.library.patterns.focusSelectorFor)(Weave.library.query.focused());
Weave.library.patterns.restoreFocus = (handle, selector) => Weave.library.control.maybe(found => Weave.library.control.maybe(Weave.library.browser.focus)(Weave.library.query.oneWithin(found)(handle.element)))(selector);
Weave.library.patterns.paint = handle => Weave.library.elements.morphInner([handle.render(handle.state, handle.update)])(handle.element);
Weave.library.patterns.painted = (handle, selector) => (Weave.library.patterns.paint(handle), Weave.library.patterns.restoreFocus(handle, selector), handle);
Weave.library.patterns.repaint = handle => Weave.library.patterns.painted(handle, Weave.library.patterns.focusSelector());
Weave.library.patterns.merged = (handle, changes) => Object.assign(handle, { state: Weave.library.composition.merge(handle.state, changes) });
Weave.library.patterns.updater = handle => change => Weave.library.patterns.repaint(Weave.library.patterns.merged(handle, change(handle.state)));
Weave.library.patterns.wired = handle => Object.assign(handle, { update: Weave.library.patterns.updater(handle) });
Weave.library.patterns.view = (render, state) => Weave.library.patterns.holding(Weave.library.patterns.repaint(Weave.library.patterns.wired({ element: Weave.library.components.holder({}), render, state })), Weave.library.composition.noop);
Weave.library.patterns.mount = host => handle => (Weave.library.components.installStyles(), Weave.library.elements.append([handle.element])(host), handle);

/* labels: the only place a word the reader sees is written. One row, one word, every pattern. */
Weave.library.patterns.labels = {};
Weave.library.patterns.labels.add = 'Add';
Weave.library.patterns.labels.remove = 'Remove';
Weave.library.patterns.labels.next = 'Next';
Weave.library.patterns.labels.back = 'Back';
Weave.library.patterns.labels.send = 'Send';
Weave.library.patterns.labels.message = 'Message';
Weave.library.patterns.labels.theme = 'Theme';
Weave.library.patterns.labels.task = 'Task';
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
Weave.library.patterns.querySpec = (state, update) => ({ name: Weave.library.patterns.queryField, label: Weave.library.patterns.labels.search, placeholder: Weave.library.patterns.labels.search, value: state.query, onEdit: Weave.library.patterns.queryHandler(update) });
Weave.library.patterns.queryBox = (state, update) => Weave.library.components.searchBox(Weave.library.patterns.querySpec(state, update));
Weave.library.patterns.oneFieldForm = (submit, label, name, onSubmit) => Weave.library.components.form({ submit, fields: [Weave.library.components.field({ label, name })], onSubmit });
Weave.library.patterns.splitView = (chooser, pane) => Weave.library.components.split({ children: [Weave.library.components.rail({ children: [chooser] }), Weave.library.components.panel({ children: [pane] })] });
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
Weave.library.patterns.todoForm = (state, update) => Weave.library.patterns.oneFieldForm(Weave.library.patterns.labels.add, Weave.library.patterns.labels.task, Weave.library.patterns.taskField, Weave.library.patterns.todoAdd(state, update));
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
Weave.library.patterns.boardLaneHead = (spec, state, update, column) => Weave.library.components.spread({ children: [Weave.library.components.subtitle({ text: column.label }), Weave.library.components.tag({ text: String(Weave.library.patterns.boardCards(spec, state, update, column).length) })] });
Weave.library.patterns.boardLaneBody = (spec, state, update, column) => Weave.library.control.either(cards => cards.length > 0, cards => Weave.library.components.stack({ children: cards }), Weave.library.patterns.emptyNote)(Weave.library.patterns.boardCards(spec, state, update, column));
Weave.library.patterns.boardColumnParts = (spec, state, update, column) => [Weave.library.patterns.boardLaneHead(spec, state, update, column), Weave.library.patterns.boardLaneBody(spec, state, update, column)];
Weave.library.patterns.boardColumn = (spec, state, update) => column => Weave.library.components.panel({ data: { key: column.key }, ref: Weave.library.patterns.boardLane(state, update, column), children: Weave.library.patterns.boardColumnParts(spec, state, update, column) });
Weave.library.patterns.boardBody = spec => (state, update) => Weave.library.components.panels({ children: spec.columns.map(Weave.library.patterns.boardColumn(spec, state, update)) });
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
Weave.library.patterns.detailItem = (state, update) => item => ({ key: item[Weave.library.patterns.idKey], label: item.label, aria: { selected: String(item[Weave.library.patterns.idKey] === state.chosen) }, onAction: Weave.library.patterns.detailPick(update, item) });
Weave.library.patterns.detailChosen = (spec, state) => Weave.library.control.nullable(state.items.find(item => item[Weave.library.patterns.idKey] === state.chosen));
Weave.library.patterns.detailPane = (spec, state) => Weave.library.control.either(Weave.library.predicates.isDefined, spec.detail, Weave.library.patterns.emptyNote)(Weave.library.patterns.detailChosen(spec, state));
Weave.library.patterns.detailMenu = (state, update) => Weave.library.components.menu({ items: state.items.map(Weave.library.patterns.detailItem(state, update)) });
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
Weave.library.patterns.wizardTrail = (spec, state) => Weave.library.components.steps({ label: Weave.library.components.titleOf(spec), active: state.step, items: spec.steps.map(Weave.library.components.titleOf) });
Weave.library.patterns.wizardPane = (spec, state) => Weave.library.components.stack({ children: Weave.library.patterns.wizardStep(spec, state).body });
Weave.library.patterns.wizardParts = (spec, state, update) => [Weave.library.patterns.titleOf(Weave.library.patterns.wizardStep(spec, state)), Weave.library.patterns.wizardTrail(spec, state), Weave.library.patterns.wizardPane(spec, state), Weave.library.patterns.wizardNav(spec, state, update)];
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
Weave.library.patterns.chatSide = (spec, message) => Weave.library.control.either(() => message.from === spec.author, () => Weave.library.components.markNames.side.own, () => Weave.library.components.markNames.side.their)(message);
Weave.library.patterns.chatBubble = spec => message => Weave.library.components.bubble({ side: Weave.library.patterns.chatSide(spec, message), children: [Weave.library.components.note({ text: message.from }), Weave.library.components.text({ text: message.text })] });
Weave.library.patterns.chatLog = (spec, state) => Weave.library.components.scroller({ children: [Weave.library.components.stack({ children: state.messages.map(Weave.library.patterns.chatBubble(spec)) })] });
Weave.library.patterns.chatNew = (spec, values) => ({ from: spec.author, text: values[Weave.library.patterns.messageField] });
Weave.library.patterns.chatSend = (spec, state, update) => values => update(() => ({ messages: state.messages.concat([Weave.library.patterns.chatNew(spec, values)]) }));
Weave.library.patterns.chatComposer = (spec, state, update) => Weave.library.patterns.oneFieldForm(Weave.library.patterns.labels.send, Weave.library.patterns.labels.message, Weave.library.patterns.messageField, Weave.library.patterns.chatSend(spec, state, update));
Weave.library.patterns.chatParts = (spec, state, update) => [Weave.library.patterns.titleOf(spec), Weave.library.patterns.chatLog(spec, state), Weave.library.patterns.chatComposer(spec, state, update)];
Weave.library.patterns.chatBody = spec => (state, update) => Weave.library.components.panel({ children: Weave.library.patterns.chatParts(spec, state, update) });
Weave.library.patterns.chatState = spec => ({ messages: Weave.library.control.defaultTo([])(spec.messages) });
Weave.library.patterns.chat = spec => Weave.library.patterns.view(Weave.library.patterns.chatBody(spec), Weave.library.patterns.chatState(spec));

/* explorer: a tree beside a detail pane, so a hierarchy reuses the same chooser as a flat list. */
Weave.library.patterns.explorerPick = (update, node) => () => update(() => ({ chosen: node }));
Weave.library.patterns.explorerNode = (state, update) => node => Weave.library.composition.merge(node, { onAction: Weave.library.patterns.explorerPick(update, node), aria: { selected: String(node === state.chosen) }, children: Weave.library.patterns.explorerKids(state, update, node) });
Weave.library.patterns.explorerKids = (state, update, node) => Weave.library.control.maybe(kids => kids.map(Weave.library.patterns.explorerNode(state, update)))(node.children);
Weave.library.patterns.explorerTree = (spec, state, update) => Weave.library.components.tree({ nodes: spec.nodes.map(Weave.library.patterns.explorerNode(state, update)) });
Weave.library.patterns.explorerPane = (spec, state) => Weave.library.control.either(Weave.library.predicates.isDefined, spec.detail, Weave.library.patterns.emptyNote)(state.chosen);
Weave.library.patterns.explorerBody = spec => (state, update) => Weave.library.patterns.splitView(Weave.library.patterns.explorerTree(spec, state, update), Weave.library.patterns.explorerPane(spec, state));
Weave.library.patterns.explorerState = spec => ({ chosen: Weave.library.composition.first(spec.nodes) });
Weave.library.patterns.explorer = spec => Weave.library.patterns.view(Weave.library.patterns.explorerBody(spec), Weave.library.patterns.explorerState(spec));

/* dashboard: stat tiles above panels the caller fills with any other pattern or component. */
Weave.library.patterns.themeButton = () => Weave.library.components.actionButton({ label: Weave.library.patterns.labels.theme, size: Weave.library.components.markNames.size.small, onAction: Weave.library.components.toggleTheme });
Weave.library.patterns.dashboardHead = spec => Weave.library.components.pageHeader({ children: [Weave.library.patterns.titleOf(spec), Weave.library.patterns.themeButton()] });
Weave.library.patterns.dashboardTiles = spec => Weave.library.components.tiles({ children: spec.stats.map(Weave.library.components.statTile) });
Weave.library.patterns.dashboardPanel = panel => Weave.library.components.panel({ children: [Weave.library.components.sectionLabel({ text: Weave.library.components.titleOf(panel) }), panel.body] });
Weave.library.patterns.dashboardPanels = spec => Weave.library.components.panels({ children: spec.panels.map(Weave.library.patterns.dashboardPanel) });
Weave.library.patterns.dashboardParts = spec => [Weave.library.patterns.dashboardHead(spec), Weave.library.patterns.dashboardTiles(spec), Weave.library.patterns.dashboardPanels(spec)];
Weave.library.patterns.dashboardBody = spec => () => Weave.library.components.page({ children: Weave.library.patterns.dashboardParts(spec) });
Weave.library.patterns.dashboard = spec => Weave.library.patterns.view(Weave.library.patterns.dashboardBody(spec), Weave.library.patterns.wizardState());

/* defaults: the only place a pattern's default measurement is written. One row, one default. */
Weave.library.patterns.defaults = {};
Weave.library.patterns.defaults.overscan = 4;
Weave.library.patterns.defaults.timeout = 4000;
Weave.library.patterns.defaults.rowHeight = 32;
Weave.library.patterns.defaults.listHeight = 320;

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
Weave.library.patterns.virtualRowExtra = (spec, item) => Weave.library.control.defaultTo({})(Weave.library.control.maybe(make => make(item))(spec.rowSpec));
Weave.library.patterns.virtualRowStyles = height => Weave.library.composition.merge(Weave.library.patterns.virtualHeight(height), { [Weave.library.browser.properties.overflow]: Weave.library.components.values.clip });
Weave.library.patterns.virtualRowBase = (spec, state, item, index) => ({ children: [spec.row(item)], styles: Weave.library.patterns.virtualRowStyles(spec.rowHeight), data: Weave.library.patterns.virtualRowKey(spec, state, item, index) });
Weave.library.patterns.virtualRowSpec = (spec, state, item, index) => Weave.library.composition.mergeDeep(Weave.library.patterns.virtualRowBase(spec, state, item, index), Weave.library.patterns.virtualRowExtra(spec, item));
Weave.library.patterns.virtualRow = (spec, state) => (item, index) => Weave.library.components.listRow(Weave.library.patterns.virtualRowSpec(spec, state, item, index));
Weave.library.patterns.virtualRows = (spec, state) => Weave.library.patterns.virtualSlice(spec, state).map(Weave.library.patterns.virtualRow(spec, state));
Weave.library.patterns.virtualChildren = (spec, state) => [Weave.library.patterns.virtualSpacerBox(spec, state)].concat(Weave.library.patterns.virtualRows(spec, state));
Weave.library.patterns.virtualInnerSpec = (spec, state) => ({ styles: Weave.library.patterns.virtualHeight(Weave.library.patterns.virtualTotal(spec)), data: Weave.library.patterns.virtualInnerData(), children: Weave.library.patterns.virtualChildren(spec, state) });
Weave.library.patterns.virtualInnerBox = (spec, state) => Weave.library.components.view(Weave.library.patterns.virtualInnerSpec(spec, state));
Weave.library.patterns.virtualUpdater = update => Weave.library.timing.throttleFrame(offset => update(() => ({ offset })));
Weave.library.patterns.virtualScrolled = throttled => event => throttled(Weave.library.browser.scrollTopOf(Weave.library.events.currentTarget(event)));
Weave.library.patterns.virtualListener = update => Weave.library.patterns.virtualScrolled(Weave.library.patterns.virtualUpdater(update));
Weave.library.patterns.virtualRestore = state => el => Weave.library.browser.setScrollTop(el, state.offset);
Weave.library.patterns.virtualSized = spec => Weave.library.composition.merge({ rowHeight: Weave.library.patterns.defaults.rowHeight, height: Weave.library.patterns.defaults.listHeight }, spec);
Weave.library.patterns.virtualMetrics = (spec, state) => Weave.library.composition.merge(spec, { height: Weave.library.control.defaultTo(spec.height)(state.height), items: Weave.library.control.defaultTo(spec.items)(state.items) });
Weave.library.patterns.virtualOverflow = { [Weave.library.browser.properties.overflow]: Weave.library.components.values.auto };
Weave.library.patterns.virtualFilled = { flexGrow: 1, minHeight: 0, [Weave.library.browser.properties.overflow]: Weave.library.components.values.auto };
Weave.library.patterns.virtualFixed = spec => Weave.library.composition.merge(Weave.library.patterns.virtualHeight(spec.height), Weave.library.patterns.virtualOverflow);
Weave.library.patterns.virtualStyles = spec => Weave.library.control.either(() => spec.fill === true, () => Weave.library.patterns.virtualFilled, () => Weave.library.patterns.virtualFixed(spec))(spec);
Weave.library.patterns.virtualRef = (spec, state, update) => el => Weave.library.patterns.virtualRestore(state)(el);
Weave.library.patterns.virtualBoxPart = (spec, state, update) => ({ ref: Weave.library.patterns.virtualRef(spec, state, update), children: [Weave.library.patterns.virtualInnerBox(spec, state)] });
Weave.library.patterns.virtualBoxHead = (spec, update) => ({ styles: Weave.library.patterns.virtualStyles(spec), data: Weave.library.patterns.virtualScrollerData(), onScroll: Weave.library.patterns.virtualListener(update) });
Weave.library.patterns.virtualBoxSpec = (spec, state, update) => Weave.library.composition.merge(Weave.library.patterns.virtualBoxHead(spec, update), Weave.library.patterns.virtualBoxPart(spec, state, update));
Weave.library.patterns.virtualBox = (spec, state, update) => Weave.library.components.scroller(Weave.library.patterns.virtualBoxSpec(spec, state, update));
Weave.library.patterns.virtualState = () => ({ offset: 0 });
Weave.library.patterns.virtualBody = spec => (state, update) => Weave.library.patterns.virtualBox(Weave.library.patterns.virtualMetrics(spec, state), state, update);
Weave.library.patterns.virtualShow = handle => items => handle.update(() => ({ items, offset: 0 }));
Weave.library.patterns.virtualHandle = handle => Object.assign(handle, { show: Weave.library.patterns.virtualShow(handle) });
Weave.library.patterns.virtualScrollerOf = handle => Weave.library.query.oneWithin(Weave.library.query.dataSelector(Weave.library.elements.keyName, Weave.library.patterns.virtualScrollerKey))(handle.element);
Weave.library.patterns.virtualHeightTo = (handle, height) => Weave.library.control.when(() => height !== handle.state.height, () => handle.update(() => ({ height })))(height);
Weave.library.patterns.virtualMeasure = handle => () => Weave.library.control.maybe(box => Weave.library.patterns.virtualHeightTo(handle, Weave.library.style.outerHeight(box)))(Weave.library.patterns.virtualScrollerOf(handle));
Weave.library.patterns.virtualWatch = handle => Weave.library.patterns.holding(handle, Weave.library.observers.onResize(Weave.library.patterns.virtualMeasure(handle))(Weave.library.patterns.virtualScrollerOf(handle)));
Weave.library.patterns.virtualFill = (spec, handle) => Weave.library.control.either(() => spec.fill === true, () => Weave.library.patterns.virtualWatch(handle), Weave.library.composition.identity)(handle);
Weave.library.patterns.virtualList = spec => Weave.library.patterns.virtualFill(spec, Weave.library.patterns.virtualHandle(Weave.library.patterns.view(Weave.library.patterns.virtualBody(Weave.library.patterns.virtualSized(spec)), Weave.library.patterns.virtualState())));

/* virtualGrid: the search box of the data grid over a virtual list, so no query ever draws the whole table. */
Weave.library.patterns.labelClass = 'sectionLabel';
Weave.library.patterns.virtualCell = row => column => Weave.library.components.truncate({ cell: Weave.library.components.markNames.cell.grow, text: String(Weave.library.components.cellValue(row, column)) });
Weave.library.patterns.virtualHeadCell = column => Weave.library.components.truncate({ cell: Weave.library.components.markNames.cell.grow, text: column.label, classes: [Weave.library.components.classOf(Weave.library.patterns.labelClass)] });
Weave.library.patterns.virtualGridHead = spec => Weave.library.components.dataRow({ children: spec.columns.map(Weave.library.patterns.virtualHeadCell) });
Weave.library.patterns.virtualGridRow = spec => row => Weave.library.components.dataRow({ children: spec.columns.map(Weave.library.patterns.virtualCell(row)) });
Weave.library.patterns.virtualGridSpec = (spec, state) => Weave.library.composition.merge(Weave.library.patterns.virtualMetrics(spec, state), { items: Weave.library.patterns.gridFound(spec, state), row: Weave.library.patterns.virtualGridRow(spec) });
Weave.library.patterns.virtualGridList = (spec, state, update) => Weave.library.patterns.virtualBox(Weave.library.patterns.virtualGridSpec(spec, state), state, update);
Weave.library.patterns.virtualGridParts = (spec, state, update) => [Weave.library.patterns.titleOf(spec), Weave.library.patterns.queryBox(state, update), Weave.library.patterns.virtualGridHead(spec), Weave.library.patterns.virtualGridList(spec, state, update)];
Weave.library.patterns.virtualGridBody = spec => (state, update) => Weave.library.components.panel({ children: Weave.library.patterns.virtualGridParts(spec, state, update) });
Weave.library.patterns.virtualGridState = () => Weave.library.composition.merge(Weave.library.patterns.queryState(), Weave.library.patterns.virtualState());
Weave.library.patterns.virtualGrid = spec => Weave.library.patterns.view(Weave.library.patterns.virtualGridBody(Weave.library.patterns.virtualSized(spec)), Weave.library.patterns.virtualGridState());
/* calendar: a month you can step through and pick a day from, with that day's events under the grid. */
Weave.library.patterns.labels.previousMonth = 'Previous month';
Weave.library.patterns.labels.nextMonth = 'Next month';
Weave.library.patterns.labels.today = 'Today';
Weave.library.patterns.calendarKey = date => Weave.library.dates.iso(date);
Weave.library.patterns.calendarMonth = spec => Weave.library.control.defaultTo(Weave.library.dates.today())(spec.date);
Weave.library.patterns.calendarState = spec => ({ month: Weave.library.patterns.calendarMonth(spec), chosen: Weave.library.patterns.calendarKey(Weave.library.patterns.calendarMonth(spec)) });
Weave.library.patterns.calendarEvents = spec => Weave.library.control.defaultTo([])(spec.events);
Weave.library.patterns.calendarOn = (spec, key) => Weave.library.patterns.calendarEvents(spec).filter(event => event.date === key);
Weave.library.patterns.calendarNotify = (spec, key) => Weave.library.control.maybe(announce => announce(key, Weave.library.patterns.calendarOn(spec, key)))(spec.onPick);
Weave.library.patterns.calendarPick = (spec, update, key) => () => (Weave.library.patterns.calendarNotify(spec, key), update(() => ({ chosen: key })));
Weave.library.patterns.calendarDayLabel = date => String(Weave.library.dates.parts(date).day);
Weave.library.patterns.calendarMarks = (state, date) => ({ here: Weave.library.dates.isToday(date), chosen: Weave.library.patterns.calendarKey(date) === state.chosen });
Weave.library.patterns.calendarFace = date => ({ label: Weave.library.patterns.calendarDayLabel(date), key: Weave.library.patterns.calendarKey(date) });
Weave.library.patterns.calendarAction = (spec, update, date) => ({ onAction: Weave.library.patterns.calendarPick(spec, update, Weave.library.patterns.calendarKey(date)) });
Weave.library.patterns.calendarDaySpec = (spec, state, update, date) => Weave.library.composition.mergeAll([Weave.library.patterns.calendarMarks(state, date), Weave.library.patterns.calendarFace(date), Weave.library.patterns.calendarAction(spec, update, date)]);
Weave.library.patterns.calendarDay = (spec, state, update, date) => Weave.library.components.dayButton(Weave.library.patterns.calendarDaySpec(spec, state, update, date));
Weave.library.patterns.calendarCount = (spec, key) => Weave.library.control.guard(total => total > 0)(Weave.library.patterns.calendarOn(spec, key).length);
Weave.library.patterns.calendarTally = (spec, key) => Weave.library.control.maybe(total => Weave.library.components.badge({ count: total }))(Weave.library.patterns.calendarCount(spec, key));
Weave.library.patterns.calendarCellParts = (spec, state, update, date) => [Weave.library.patterns.calendarDay(spec, state, update, date), Weave.library.patterns.calendarTally(spec, Weave.library.patterns.calendarKey(date))];
Weave.library.patterns.calendarCell = (spec, state, update) => date => Weave.library.components.stack({ children: Weave.library.composition.compact(Weave.library.patterns.calendarCellParts(spec, state, update, date)), data: { key: Weave.library.patterns.calendarKey(date) } });
Weave.library.patterns.calendarWeek = state => Weave.library.composition.first(Weave.library.dates.monthGrid(state.month));
Weave.library.patterns.calendarColumn = (spec, state, update) => (date, index) => ({ key: index, label: Weave.library.formatting.weekdayName(date), format: Weave.library.patterns.calendarCell(spec, state, update) });
Weave.library.patterns.calendarColumns = (spec, state, update) => Weave.library.patterns.calendarWeek(state).map(Weave.library.patterns.calendarColumn(spec, state, update));
Weave.library.patterns.calendarGrid = (spec, state, update) => Weave.library.components.table({ columns: Weave.library.patterns.calendarColumns(spec, state, update), rows: Weave.library.dates.monthGrid(state.month) });
Weave.library.patterns.calendarShift = (state, update, count) => () => update(() => ({ month: Weave.library.dates.add(Weave.library.dates.names.month, count)(state.month) }));
Weave.library.patterns.calendarSteps = [[Weave.library.patterns.labels.previousMonth, Weave.library.patterns.stepBack], [Weave.library.patterns.labels.nextMonth, Weave.library.patterns.stepForward]];
Weave.library.patterns.calendarStep = (state, update) => ([label, count]) => Weave.library.components.actionButton({ label, onAction: Weave.library.patterns.calendarShift(state, update, count) });
Weave.library.patterns.calendarNow = () => ({ month: Weave.library.dates.today(), chosen: Weave.library.patterns.calendarKey(Weave.library.dates.today()) });
Weave.library.patterns.calendarToday = update => Weave.library.components.actionButton({ label: Weave.library.patterns.labels.today, onAction: () => update(Weave.library.patterns.calendarNow) });
Weave.library.patterns.calendarBar = (state, update) => Weave.library.components.toolbar({ items: Weave.library.patterns.calendarSteps.map(Weave.library.patterns.calendarStep(state, update)).concat([Weave.library.patterns.calendarToday(update)]) });
Weave.library.patterns.calendarHeading = state => Weave.library.components.subtitle({ text: Weave.library.formatting.monthName(state.month) });
Weave.library.patterns.calendarEntry = event => Weave.library.components.item({ children: [Weave.library.components.subtitle({ text: event.label }), Weave.library.components.note({ text: event.note })] });
Weave.library.patterns.calendarList = (spec, state) => Weave.library.patterns.listOrEmpty(Weave.library.patterns.calendarOn(spec, state.chosen).map(Weave.library.patterns.calendarEntry));
Weave.library.patterns.calendarHead = (spec, state, update) => [Weave.library.patterns.titleOf(spec), Weave.library.patterns.calendarBar(state, update), Weave.library.patterns.calendarHeading(state)];
Weave.library.patterns.calendarParts = (spec, state, update) => Weave.library.patterns.calendarHead(spec, state, update).concat([Weave.library.patterns.calendarGrid(spec, state, update), Weave.library.patterns.calendarList(spec, state)]);
Weave.library.patterns.calendarBody = spec => (state, update) => Weave.library.components.panel({ children: Weave.library.patterns.calendarParts(spec, state, update) });
Weave.library.patterns.calendar = spec => Weave.library.patterns.view(Weave.library.patterns.calendarBody(spec), Weave.library.patterns.calendarState(spec));

/* notifications: a toast stack. The handle carries push, and every toast expires on its own. */
Weave.library.patterns.notificationTimeout = spec => Weave.library.control.defaultTo(Weave.library.patterns.defaults.timeout)(spec.timeout);
Weave.library.patterns.notificationRow = (message, tone, action) => Weave.library.patterns.withId({ message, tone, action });
Weave.library.patterns.notificationCancel = row => Weave.library.control.maybe(cancel => cancel())(row.cancel);
Weave.library.patterns.notificationDrop = (update, row) => () => (Weave.library.patterns.notificationCancel(row), update(state => ({ toasts: Weave.library.patterns.without(state.toasts, row) })));
Weave.library.patterns.notificationRun = (update, row, action) => () => (Weave.library.patterns.notificationDrop(update, row)(), action.onAction());
Weave.library.patterns.notificationAction = (update, row) => Weave.library.control.maybe(action => Weave.library.composition.merge(action, { onAction: Weave.library.patterns.notificationRun(update, row, action) }))(row.action);
Weave.library.patterns.notificationAlert = (update, row) => Weave.library.components.alert({ tone: row.tone, title: row.message, action: Weave.library.patterns.notificationAction(update, row), onClose: Weave.library.patterns.notificationDrop(update, row) });
Weave.library.patterns.notificationToast = update => row => Weave.library.components.toastSlot({ children: [Weave.library.patterns.notificationAlert(update, row)], data: { [Weave.library.elements.keyName]: row[Weave.library.patterns.idKey] } });
Weave.library.patterns.notificationList = (state, update) => Weave.library.components.stack({ children: state.toasts.map(Weave.library.patterns.notificationToast(update)) });
Weave.library.patterns.notificationExpire = (handle, spec, row) => Object.assign(row, { cancel: Weave.library.timing.after(Weave.library.patterns.notificationTimeout(spec), Weave.library.patterns.notificationDrop(handle.update, row)) });
Weave.library.patterns.notificationAdd = (handle, spec, row) => (handle.update(state => ({ toasts: state.toasts.concat([row]) })), Weave.library.patterns.notificationExpire(handle, spec, row), handle);
Weave.library.patterns.notificationPush = (handle, spec) => (message, tone, action) => Weave.library.patterns.notificationAdd(handle, spec, Weave.library.patterns.notificationRow(message, tone, action));
Weave.library.patterns.notificationState = () => ({ toasts: [] });
Weave.library.patterns.notificationSweep = handle => () => handle.state.toasts.forEach(Weave.library.patterns.notificationCancel);
Weave.library.patterns.notificationHandle = (spec, handle) => Weave.library.patterns.holding(Object.assign(handle, { push: Weave.library.patterns.notificationPush(handle, spec) }), Weave.library.patterns.notificationSweep(handle));
Weave.library.patterns.notificationPin = handle => Weave.library.composition.tap(() => Weave.library.elements.appendTo(Weave.library.overlays.toastHost())(handle.element))(handle);
Weave.library.patterns.notifications = (spec = {}) => Weave.library.patterns.notificationPin(Weave.library.patterns.notificationHandle(spec, Weave.library.patterns.view(Weave.library.patterns.notificationList, Weave.library.patterns.notificationState())));
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
Weave.library.patterns.mergeState = (holder, changes) => Weave.library.patterns.showState(holder, Weave.library.composition.merge(holder.state, changes));
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
Weave.library.patterns.maybeTitle = spec => Weave.library.control.maybe(text => Weave.library.components.title({ text }))(spec.title);
Weave.library.patterns.resourceParts = (spec, state, update) => Weave.library.composition.compact([Weave.library.patterns.maybeTitle(spec), Weave.library.patterns.paneFor(spec, state, update)]);
Weave.library.patterns.resourceBody = spec => (state, update) => Weave.library.components.panel({ children: Weave.library.patterns.resourceParts(spec, state, update) });
Weave.library.patterns.resourceState = () => ({ phase: Weave.library.patterns.phases.loading });
Weave.library.patterns.started = (spec, handle) => (Weave.library.patterns.request(spec, Weave.library.patterns.updaterOf(handle)), handle);
Weave.library.patterns.resource = spec => Weave.library.patterns.started(spec, Weave.library.patterns.view(Weave.library.patterns.resourceBody(spec), Weave.library.patterns.resourceState()));

/* address: one piece of state kept in the page's address, so a view can be linked to and the back button means something. */
Weave.library.patterns.addressQuery = () => Weave.library.composition.parseQueryString(Weave.library.navigation.hashValue());
Weave.library.patterns.addressValue = name => Weave.library.patterns.addressQuery()[name];
Weave.library.patterns.writeAddress = (name, value) => Weave.library.navigation.setHash(Weave.library.composition.queryString(Weave.library.composition.merge(Weave.library.patterns.addressQuery(), { [name]: value })));
Weave.library.patterns.addressed = (name, holder) => (Weave.library.patterns.writeAddress(name, holder.state[name]), holder);
Weave.library.patterns.showFromAddress = (name, holder) => Weave.library.control.maybe(value => Weave.library.patterns.mergeState(holder, { [name]: value }))(Weave.library.patterns.addressValue(name));
Weave.library.patterns.addressChanges = (name, holder) => Weave.library.navigation.onHashChange(() => Weave.library.patterns.showFromAddress(name, holder));
Weave.library.patterns.addressSaving = (name, update) => change => Weave.library.patterns.addressed(name, update(change));
Weave.library.patterns.addressWired = (name, holder, update) => Object.assign(holder, { update: Weave.library.patterns.addressSaving(name, update) });
Weave.library.patterns.readAddress = (name, holder) => (Weave.library.patterns.showFromAddress(name, holder), holder);
Weave.library.patterns.linkTo = name => holder => Weave.library.patterns.holding(Weave.library.patterns.addressWired(name, Weave.library.patterns.readAddress(name, holder), holder.update), Weave.library.patterns.addressChanges(name, holder));

/* entryForm: the form component with the validators wired to it. A field carries its own rules, and a rule that fails shows the message that already sits beside it. */
Weave.library.patterns.rulesOf = spec => Weave.library.composition.fromPairs(spec.fields.map(field => [field.name, Weave.library.control.defaultTo({})(field.rules)]));
Weave.library.patterns.problemsOf = (spec, values) => Weave.library.composition.fromPairs(spec.fields.map(field => [field.name, Weave.library.forms.checkControl(values, Weave.library.patterns.rulesOf(spec))(field.name)]));
Weave.library.patterns.isClean = errors => Weave.library.composition.values(errors).every(list => list.length === 0);
Weave.library.patterns.fieldProblems = (state, field) => Weave.library.control.defaultTo([])(state.errors[field.name]);
Weave.library.patterns.fieldNotes = (state, field) => Weave.library.patterns.fieldProblems(state, field).map(message => Weave.library.components.fieldError({ text: message }));
Weave.library.patterns.fieldInvalid = (state, field) => ({ invalid: String(Weave.library.patterns.fieldProblems(state, field).length > 0) });
Weave.library.patterns.fieldControl = (state, field) => Weave.library.components.field({ label: field.label, name: field.name, type: field.type, value: state.values[field.name], aria: Weave.library.patterns.fieldInvalid(state, field) });
Weave.library.patterns.fieldParts = (state, field) => [Weave.library.patterns.fieldControl(state, field)].concat(Weave.library.patterns.fieldNotes(state, field));
Weave.library.patterns.entryField = state => field => Weave.library.components.stack({ data: { key: field.name }, children: Weave.library.patterns.fieldParts(state, field) });
Weave.library.patterns.accepted = (spec, values) => Weave.library.control.defaultTo(Weave.library.composition.noop)(spec.onSubmit)(values);
Weave.library.patterns.reported = (spec, values, errors) => (Weave.library.control.when(() => Weave.library.patterns.isClean(errors), () => Weave.library.patterns.accepted(spec, values))(values), { values, errors });
Weave.library.patterns.checked = (spec, values) => Weave.library.patterns.reported(spec, values, Weave.library.patterns.problemsOf(spec, values));
Weave.library.patterns.firstProblem = errors => Weave.library.composition.first(Weave.library.composition.pairs(errors).filter(([ignored, list]) => list.length > 0));
Weave.library.patterns.focusNamed = (handle, name) => Weave.library.control.maybe(Weave.library.browser.focus)(Weave.library.query.oneWithin(Weave.library.query.attributeSelector(Weave.library.browser.keywords.name, name))(handle.element));
Weave.library.patterns.focusProblem = handle => Weave.library.control.maybe(row => Weave.library.patterns.focusNamed(handle, Weave.library.composition.first(row)))(Weave.library.patterns.firstProblem(handle.state.errors));
Weave.library.patterns.entrySubmit = (spec, update) => values => Weave.library.patterns.focusProblem(update(() => Weave.library.patterns.checked(spec, values)));
Weave.library.patterns.entryFields = (spec, state) => spec.fields.map(Weave.library.patterns.entryField(state));
Weave.library.patterns.entryBody = (spec, state, update) => Weave.library.components.form({ submit: spec.submit, fields: Weave.library.patterns.entryFields(spec, state), onSubmit: Weave.library.patterns.entrySubmit(spec, update) });
Weave.library.patterns.entryParts = (spec, state, update) => [Weave.library.patterns.titleOf(spec), Weave.library.patterns.entryBody(spec, state, update)];
Weave.library.patterns.entryPanel = spec => (state, update) => Weave.library.components.panel({ children: Weave.library.patterns.entryParts(spec, state, update) });
Weave.library.patterns.entryState = spec => ({ values: Weave.library.control.defaultTo({})(spec.values), errors: {} });
Weave.library.patterns.entryForm = spec => Weave.library.patterns.view(Weave.library.patterns.entryPanel(spec), Weave.library.patterns.entryState(spec));

/* layers: a dialog, a drawer and a sheet as patterns. Body and actions may be values or functions of close. */
Weave.library.patterns.labels.confirm = 'Confirm';
Weave.library.patterns.labels.cancel = 'Cancel';
Weave.library.patterns.actionsKey = 'actions';
Weave.library.patterns.heldState = spec => ({ spec, handle: undefined });
Weave.library.patterns.heldClose = state => Weave.library.control.maybe(handle => handle.close())(state.handle);
Weave.library.patterns.layerCloser = state => () => Weave.library.patterns.heldClose(state);
Weave.library.patterns.layerValue = (state, key) => Weave.library.control.either(Weave.library.predicates.isFunction, make => make(Weave.library.patterns.layerCloser(state)), Weave.library.composition.identity)(state.spec[key]);
Weave.library.patterns.layerList = (state, key) => Weave.library.composition.compact(Weave.library.composition.listOf(Weave.library.control.defaultTo([])(Weave.library.patterns.layerValue(state, key))));
Weave.library.patterns.layerHeader = state => Weave.library.components.spread({ children: [Weave.library.components.subtitle({ text: Weave.library.components.titleOf(state.spec) }), Weave.library.patterns.layerCloseButton(state)] });
Weave.library.patterns.layerCloseButton = state => Weave.library.components.actionButton({ label: Weave.library.components.closeLabel, size: Weave.library.patterns.smallSize(), onAction: Weave.library.patterns.layerCloser(state) });
Weave.library.patterns.smallSize = () => Weave.library.composition.first(Weave.library.composition.keys(Weave.library.components.sizes));
Weave.library.patterns.layerActions = state => Weave.library.patterns.actionsFrom(Weave.library.patterns.layerList(state, Weave.library.patterns.actionsKey));
Weave.library.patterns.actionsFrom = rows => Weave.library.control.either(list => list.length > 0, list => [Weave.library.components.actions({ children: list.map(Weave.library.components.actionButton) })], () => [])(rows);
Weave.library.patterns.layerBody = state => [Weave.library.patterns.layerHeader(state)].concat(Weave.library.patterns.layerList(state, Weave.library.components.bodyKey), Weave.library.patterns.layerActions(state));
Weave.library.patterns.layerSpec = state => ({ title: Weave.library.components.titleOf(state.spec), body: Weave.library.patterns.layerBody(state), onClose: state.spec.onClose });
Weave.library.patterns.layerOpen = (open, state) => Object.assign(state, { handle: open(Weave.library.patterns.layerSpec(state)) }).handle;
Weave.library.patterns.dialog = spec => Weave.library.patterns.layerOpen(Weave.library.overlays.dialog, Weave.library.patterns.heldState(spec));
Weave.library.patterns.drawer = spec => Weave.library.patterns.layerOpen(Weave.library.overlays.drawer, Weave.library.patterns.heldState(spec));
Weave.library.patterns.sheet = spec => Weave.library.patterns.layerOpen(Weave.library.overlays.sheet, Weave.library.patterns.heldState(spec));

/* confirm: the dialog above with two actions and a promise, so a caller awaits an answer instead of wiring one. */
Weave.library.patterns.confirmLabel = (spec, key) => Weave.library.control.defaultTo(Weave.library.patterns.labels[key])(spec[key]);
Weave.library.patterns.confirmAnswer = (handle, close, answer) => () => (handle.resolve(answer), close());
Weave.library.patterns.confirmCancel = (spec, handle, close) => ({ label: Weave.library.patterns.confirmLabel(spec, Weave.library.patterns.cancelKey), onAction: Weave.library.patterns.confirmAnswer(handle, close, false) });
Weave.library.patterns.confirmAccept = (spec, handle, close) => ({ label: Weave.library.patterns.confirmLabel(spec, Weave.library.patterns.confirmKey), variant: Weave.library.components.defaultVariant(), onAction: Weave.library.patterns.confirmAnswer(handle, close, true) });
Weave.library.patterns.confirmActions = (spec, handle) => close => [Weave.library.patterns.confirmCancel(spec, handle, close), Weave.library.patterns.confirmAccept(spec, handle, close)];
Weave.library.patterns.cancelKey = 'cancel';
Weave.library.patterns.confirmKey = 'confirm';
Weave.library.patterns.confirmBody = spec => [Weave.library.components.note({ text: Weave.library.components.noteOf(spec) })];
Weave.library.patterns.confirmChanges = (spec, handle) => ({ body: Weave.library.patterns.confirmBody(spec), actions: Weave.library.patterns.confirmActions(spec, handle), onClose: Weave.library.patterns.confirmAnswer(handle, Weave.library.composition.noop, false) });
Weave.library.patterns.confirmSpec = (spec, handle) => Weave.library.composition.merge(spec, Weave.library.patterns.confirmChanges(spec, handle));
Weave.library.patterns.confirmWith = (spec, handle) => Weave.library.composition.tap(() => Weave.library.patterns.dialog(Weave.library.patterns.confirmSpec(spec, handle)))(handle.promise);
Weave.library.patterns.confirm = spec => Weave.library.patterns.confirmWith(spec, Weave.library.composition.deferred());

/* menus: a popover of menu items hung off a button. Choosing one closes the popover before it runs. */
Weave.library.patterns.menuChoose = (state, item) => () => (Weave.library.patterns.heldClose(state), Weave.library.control.maybe(run => run())(item.onAction));
Weave.library.patterns.menuRow = state => item => Weave.library.composition.merge(item, { onAction: Weave.library.patterns.menuChoose(state, item) });
Weave.library.patterns.menuBody = state => [Weave.library.components.menu({ items: state.spec.items.map(Weave.library.patterns.menuRow(state)) })];
Weave.library.patterns.menuOpen = (anchor, state) => Object.assign(state, { handle: Weave.library.overlays.popover(anchor, { body: Weave.library.patterns.menuBody(state), onClose: state.spec.onClose }) }).handle;
Weave.library.patterns.menu = (anchor, spec) => Weave.library.patterns.menuOpen(anchor, Weave.library.patterns.heldState(spec));
Weave.library.patterns.menuAt = spec => event => Weave.library.patterns.menu(Weave.library.browser.currentTargetOf(event), spec);

/* shortcuts: one row per key, bound to the document and held back while the reader is typing. */
Weave.library.patterns.shortcutStep = handler => event => Weave.library.control.unless(() => Weave.library.interaction.isTyping(), () => handler(event))(event);
Weave.library.patterns.shortcutBind = ([combo, handler]) => Weave.library.interaction.shortcut(combo, Weave.library.patterns.shortcutStep(handler))(Weave.library.browser.document());
Weave.library.patterns.shortcuts = map => Weave.library.events.combine(Weave.library.composition.pairs(map).map(Weave.library.patterns.shortcutBind));
