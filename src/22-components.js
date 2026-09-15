/* components: one function per widget, one spec in, one element out. No widget names a tag or a class. */
Weave.library.components = {};

/* parts: the only place a component chooses an element builder. Every widget names a part, never a tag. */
Weave.library.components.parts = {};
Weave.library.components.parts.box = Weave.library.elements.div;
Weave.library.components.parts.inline = Weave.library.elements.span;
Weave.library.components.parts.emphasis = Weave.library.elements.strong;
Weave.library.components.parts.paragraph = Weave.library.elements.p;
Weave.library.components.parts.heading = Weave.library.elements.h2;
Weave.library.components.parts.subheading = Weave.library.elements.h3;
Weave.library.components.parts.section = Weave.library.elements.section;
Weave.library.components.parts.article = Weave.library.elements.article;
Weave.library.components.parts.header = Weave.library.elements.header;
Weave.library.components.parts.footer = Weave.library.elements.footer;
Weave.library.components.parts.sidebar = Weave.library.elements.aside;
Weave.library.components.parts.navigation = Weave.library.elements.nav;
Weave.library.components.parts.main = Weave.library.elements.main;
Weave.library.components.parts.list = Weave.library.elements.ul;
Weave.library.components.parts.listItem = Weave.library.elements.li;
Weave.library.components.parts.button = Weave.library.elements.button;
Weave.library.components.parts.link = Weave.library.elements.a;
Weave.library.components.parts.picture = Weave.library.elements.img;
Weave.library.components.parts.grid = Weave.library.elements.table;
Weave.library.components.parts.gridHead = Weave.library.elements.thead;
Weave.library.components.parts.gridBody = Weave.library.elements.tbody;
Weave.library.components.parts.gridRow = Weave.library.elements.tr;
Weave.library.components.parts.gridCell = Weave.library.elements.td;
Weave.library.components.parts.gridHeader = Weave.library.elements.th;
Weave.library.components.parts.form = Weave.library.elements.form;
Weave.library.components.parts.label = Weave.library.elements.label;
Weave.library.components.parts.entry = Weave.library.elements.input;
Weave.library.components.parts.area = Weave.library.elements.textarea;
Weave.library.components.parts.choice = Weave.library.elements.select;
Weave.library.components.parts.option = Weave.library.elements.option;
Weave.library.components.parts.dialog = Weave.library.elements.dialog;
Weave.library.components.parts.details = Weave.library.elements.details;
Weave.library.components.parts.summary = Weave.library.elements.summary;
Weave.library.components.parts.meter = Weave.library.elements.progress;
Weave.library.components.parts.moment = Weave.library.elements.time;
Weave.library.components.parts.checkbox = Weave.library.elements.inputs.checkbox;
Weave.library.components.parts.search = Weave.library.elements.inputs.search;

/* naming: a component key is its class. One prefix, one rule, and no class string anywhere else. */
Weave.library.components.classPrefix = 'weave-';
Weave.library.components.classOf = name => Weave.library.components.classPrefix + Weave.library.composition.kebabCase(name);

/* handlers: the only place a spec key becomes a listener. Adding a row adds the key to every widget. */
Weave.library.components.handlers = {};
Weave.library.components.handlers.onAction = Weave.library.events.types.click;
Weave.library.components.handlers.onEdit = Weave.library.events.types.input;
Weave.library.components.handlers.onChoose = Weave.library.events.types.change;
Weave.library.components.handlers.onSend = Weave.library.events.types.submit;
Weave.library.components.handlers.onPress = Weave.library.events.types.keydown;
Weave.library.components.handlers.onEnter = Weave.library.events.types.mouseenter;
Weave.library.components.handlers.onLeave = Weave.library.events.types.mouseleave;
Weave.library.components.handlers.onOpen = Weave.library.events.types.toggle;
Weave.library.components.handlers.onScroll = Weave.library.events.types.scroll;
Weave.library.components.handlerRows = spec => Weave.library.composition.pairs(Weave.library.components.handlers).filter(([key]) => Weave.library.predicates.isDefined(spec[key]));
Weave.library.components.listenersFor = spec => Weave.library.composition.fromPairs(Weave.library.components.handlerRows(spec).map(([key, type]) => [type, spec[key]]));

/* build: the one place a component spec becomes an element spec. Class, listeners and parts in one pass. */
Weave.library.components.baseSpec = (name, spec) => ({ classes: [Weave.library.components.classOf(name)], listeners: Weave.library.components.listenersFor(spec) });
Weave.library.components.build = (make, name, spec) => make(Weave.library.components.decorate(name, Weave.library.control.defaultTo({})(spec)));
Weave.library.components.decorate = (name, spec) => Weave.library.composition.mergeDeep(Weave.library.components.baseSpec(name, spec), spec);
Weave.library.components.fromBlueprint = (make, name) => (spec = {}) => Weave.library.components.build(make, name, spec);
Weave.library.components.textOf = (spec, key) => Weave.library.control.defaultTo(Weave.library.browser.keywords.empty)(spec[key]);
Weave.library.components.childrenOf = (spec, key) => Weave.library.composition.compact(Weave.library.composition.listOf(Weave.library.control.defaultTo([])(spec[key])));

/* blueprints: one row per plain container. The key is the class, the value is the part it is made of. */
Weave.library.components.blueprints = {};
Weave.library.components.blueprints.view = Weave.library.components.parts.box;
Weave.library.components.blueprints.page = Weave.library.components.parts.main;
Weave.library.components.blueprints.panel = Weave.library.components.parts.section;
Weave.library.components.blueprints.stack = Weave.library.components.parts.box;
Weave.library.components.blueprints.row = Weave.library.components.parts.box;
Weave.library.components.blueprints.spread = Weave.library.components.parts.box;
Weave.library.components.blueprints.tiles = Weave.library.components.parts.box;
Weave.library.components.blueprints.scroller = Weave.library.components.parts.box;
Weave.library.components.blueprints.divider = Weave.library.components.parts.box;
Weave.library.components.blueprints.card = Weave.library.components.parts.article;
Weave.library.components.blueprints.title = Weave.library.components.parts.heading;
Weave.library.components.blueprints.subtitle = Weave.library.components.parts.subheading;
Weave.library.components.blueprints.note = Weave.library.components.parts.paragraph;
Weave.library.components.blueprints.value = Weave.library.components.parts.emphasis;
Weave.library.components.blueprints.tag = Weave.library.components.parts.inline;
Weave.library.components.blueprints.pill = Weave.library.components.parts.inline;
Weave.library.components.blueprints.button = Weave.library.components.parts.button;
Weave.library.components.blueprints.anchor = Weave.library.components.parts.link;
Weave.library.components.blueprints.avatar = Weave.library.components.parts.inline;
Weave.library.components.blueprints.itemList = Weave.library.components.parts.list;
Weave.library.components.blueprints.item = Weave.library.components.parts.listItem;
Weave.library.components.blueprints.pageHeader = Weave.library.components.parts.header;
Weave.library.components.blueprints.pageFooter = Weave.library.components.parts.footer;
Weave.library.components.blueprints.rail = Weave.library.components.parts.sidebar;
Weave.library.components.blueprints.body = Weave.library.components.parts.main;
Weave.library.components.blueprints.timestamp = Weave.library.components.parts.moment;
Weave.library.components.blueprints.listRow = Weave.library.components.parts.box;
Weave.library.composition.defineEach(Weave.library.components, Weave.library.components.fromBlueprint)(Weave.library.components.blueprints);

/* text and status: the small widgets every other one is assembled from. */
Weave.library.components.icon = spec => Weave.library.components.build(Weave.library.components.parts.inline, 'icon', { text: Weave.library.components.textOf(spec, Weave.library.components.glyphKey), aria: { hidden: Weave.library.browser.keywords.true } });
Weave.library.components.glyphKey = 'glyph';
Weave.library.components.initials = text => Weave.library.composition.words(text).map(word => word.slice(0, 1).toUpperCase()).slice(0, 2).join(Weave.library.browser.keywords.empty);
Weave.library.components.portrait = spec => Weave.library.components.avatar({ text: Weave.library.components.initials(Weave.library.components.textOf(spec, Weave.library.components.nameKey)), aria: { label: spec.name } });
Weave.library.components.nameKey = 'name';
Weave.library.components.statTile = spec => Weave.library.components.build(Weave.library.components.parts.article, 'statTile', { children: [Weave.library.components.note({ text: spec.label }), Weave.library.components.value({ text: String(spec.value) })] });
Weave.library.components.emptyBody = spec => [Weave.library.components.subtitle({ text: Weave.library.components.titleOf(spec) }), Weave.library.components.note({ text: Weave.library.components.noteOf(spec) })];
Weave.library.components.emptyState = spec => Weave.library.components.build(Weave.library.components.parts.box, 'emptyState', { children: Weave.library.components.emptyBody(spec) });
Weave.library.components.titleKey = 'title';
Weave.library.components.titleOf = spec => Weave.library.components.textOf(spec, Weave.library.components.titleKey);
Weave.library.components.roleAttribute = role => ({ [Weave.library.browser.keywords.role]: role });
Weave.library.components.namedAttribute = spec => ({ [Weave.library.browser.keywords.name]: spec.name });
Weave.library.components.noteKey = 'note';
Weave.library.components.noteOf = spec => Weave.library.components.textOf(spec, Weave.library.components.noteKey);
Weave.library.components.toast = spec => Weave.library.components.build(Weave.library.components.parts.box, 'toast', { text: spec.message, attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.status) });
Weave.library.components.progressBar = spec => Weave.library.components.build(Weave.library.components.parts.meter, 'progressBar', { attributes: { [Weave.library.browser.keywords.value]: spec.value, max: spec.total } });

/* controls: every interactive leaf. The type table already exists, so a field never spells a type. */
Weave.library.components.placeholderAttribute = 'placeholder';
Weave.library.components.typeOf = spec => Weave.library.control.defaultTo(Weave.library.elements.inputTypes.text)(spec.type);
Weave.library.components.entryAttributes = spec => ({ [Weave.library.browser.keywords.type]: Weave.library.components.typeOf(spec), [Weave.library.components.placeholderAttribute]: spec.placeholder, [Weave.library.browser.keywords.value]: spec.value });
Weave.library.components.controlAttributes = spec => Weave.library.composition.merge(Weave.library.components.namedAttribute(spec), Weave.library.components.entryAttributes(spec));
Weave.library.components.controlSpec = spec => ({ attributes: Weave.library.components.controlAttributes(spec), onEdit: spec.onEdit, onChoose: spec.onChoose, onPress: spec.onPress, aria: Weave.library.components.labelAria(spec) });
Weave.library.components.control = spec => Weave.library.components.build(Weave.library.components.parts.entry, 'control', Weave.library.components.controlSpec(spec));
Weave.library.components.fieldLabel = spec => Weave.library.components.build(Weave.library.components.parts.inline, 'fieldLabel', { text: Weave.library.components.textOf(spec, Weave.library.components.labelKey) });
Weave.library.components.labelKey = 'label';
Weave.library.components.field = spec => Weave.library.components.build(Weave.library.components.parts.label, 'field', { children: [Weave.library.components.fieldLabel(spec), Weave.library.components.control(spec)] });
Weave.library.components.textAreaSpec = spec => ({ text: Weave.library.components.textOf(spec, Weave.library.browser.keywords.value), attributes: Weave.library.components.namedAttribute(spec), onEdit: spec.onEdit, aria: Weave.library.components.labelAria(spec) });
Weave.library.components.textArea = spec => Weave.library.components.build(Weave.library.components.parts.area, 'textArea', Weave.library.components.textAreaSpec(spec));
Weave.library.components.optionLabel = value => Weave.library.control.defaultTo(String(value))(value.label);
Weave.library.components.optionValue = value => Weave.library.control.defaultTo(String(value))(value.value);
Weave.library.components.optionFor = value => Weave.library.components.build(Weave.library.components.parts.option, 'option', { text: Weave.library.components.optionLabel(value), attributes: { [Weave.library.browser.keywords.value]: Weave.library.components.optionValue(value) } });
Weave.library.components.selectValue = spec => el => Weave.library.control.maybe(chosen => Weave.library.attributes.setValue(chosen)(el))(spec.value);
Weave.library.components.labelMark = label => ({ label });
Weave.library.components.labelAria = spec => Weave.library.control.defaultTo({})(Weave.library.control.maybe(Weave.library.components.labelMark)(spec.label));
Weave.library.components.selectSpec = spec => ({ children: spec.options.map(Weave.library.components.optionFor), attributes: Weave.library.components.namedAttribute(spec), onChoose: spec.onChoose, ref: Weave.library.components.selectValue(spec), aria: Weave.library.components.labelAria(spec) });
Weave.library.components.selectBox = spec => Weave.library.components.build(Weave.library.components.parts.choice, 'selectBox', Weave.library.components.selectSpec(spec));
Weave.library.components.checkMark = spec => Weave.library.components.build(Weave.library.components.parts.checkbox, 'checkMark', { properties: { [Weave.library.attributes.booleanAttributes.checked]: Weave.library.control.defaultTo(false)(spec.checked) }, onChoose: spec.onChoose });
Weave.library.components.checkField = spec => Weave.library.components.build(Weave.library.components.parts.label, 'checkField', { children: [Weave.library.components.checkMark(spec), Weave.library.components.fieldLabel(spec)] });
Weave.library.components.searchAttributes = spec => Weave.library.composition.merge(Weave.library.components.namedAttribute(spec), { [Weave.library.components.placeholderAttribute]: spec.placeholder, [Weave.library.browser.keywords.value]: spec.value });
Weave.library.components.searchBox = spec => Weave.library.components.build(Weave.library.components.parts.search, 'searchBox', { attributes: Weave.library.components.searchAttributes(spec), onEdit: spec.onEdit, aria: Weave.library.components.labelAria(spec) });

/* groups: a widget that arranges other widgets. Each names one part and one class, nothing else. */
Weave.library.components.toolbar = spec => Weave.library.components.build(Weave.library.components.parts.box, 'toolbar', { children: Weave.library.components.childrenOf(spec, Weave.library.components.itemsKey) });
Weave.library.components.itemsKey = 'items';
Weave.library.components.actionButton = item => Weave.library.components.button({ text: item.label, onAction: item.onAction, attributes: { [Weave.library.browser.keywords.title]: item.hint }, data: Weave.library.components.variantData(item) });
Weave.library.components.actionBar = spec => Weave.library.components.toolbar({ items: spec.actions.map(Weave.library.components.actionButton) });
Weave.library.components.menuItem = item => Weave.library.components.item({ children: [Weave.library.components.actionButton(item)], attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.menuitem) });
Weave.library.components.menu = spec => Weave.library.components.build(Weave.library.components.parts.list, 'menu', { children: spec.items.map(Weave.library.components.menuItem), attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.menu) });
Weave.library.components.isActive = (spec, item) => String(spec.active === item.key);
Weave.library.components.tabSpec = (spec, item) => ({ text: item.label, onAction: item.onAction, attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.tab), aria: { selected: Weave.library.components.isActive(spec, item) } });
Weave.library.components.tab = spec => item => Weave.library.components.build(Weave.library.components.parts.button, 'tab', Weave.library.components.tabSpec(spec, item));
Weave.library.components.tabs = spec => Weave.library.components.build(Weave.library.components.parts.navigation, 'tabs', { children: spec.items.map(Weave.library.components.tab(spec)), attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.tablist) });
Weave.library.components.crumb = item => Weave.library.components.anchor({ text: item.label, attributes: { [Weave.library.browser.keywords.href]: Weave.library.control.defaultTo(Weave.library.components.hashHref)(item.href) }, onAction: item.onAction });
Weave.library.components.hashHref = '#';
Weave.library.components.breadcrumb = spec => Weave.library.components.build(Weave.library.components.parts.navigation, 'breadcrumb', { children: spec.items.map(Weave.library.components.crumb), aria: { label: spec.label } });
Weave.library.components.disclosureSummary = spec => Weave.library.components.build(Weave.library.components.parts.summary, 'disclosureSummary', { text: Weave.library.components.titleOf(spec) });
Weave.library.components.disclosureBody = spec => Weave.library.components.stack({ children: Weave.library.components.childrenOf(spec, Weave.library.components.bodyKey) });
Weave.library.components.bodyKey = 'body';
Weave.library.components.openValue = spec => Weave.library.control.guard(Weave.library.composition.identity)(spec.open);
Weave.library.components.openAttribute = spec => ({ [Weave.library.attributes.booleanAttributes.open]: Weave.library.components.openValue(spec) });
Weave.library.components.disclosureSpec = spec => ({ children: [Weave.library.components.disclosureSummary(spec), Weave.library.components.disclosureBody(spec)], attributes: Weave.library.components.openAttribute(spec), onOpen: spec.onOpen });
Weave.library.components.disclosure = spec => Weave.library.components.build(Weave.library.components.parts.details, 'disclosure', Weave.library.components.disclosureSpec(spec));
Weave.library.components.accordion = spec => Weave.library.components.build(Weave.library.components.parts.box, 'accordion', { children: spec.sections.map(Weave.library.components.disclosure) });
Weave.library.components.treeLabel = node => Weave.library.components.actionButton({ label: node.label, onAction: node.onAction });
Weave.library.components.treeBranch = node => Weave.library.control.maybe(nodes => Weave.library.components.tree({ nodes }))(node.children);
Weave.library.components.treeNode = node => Weave.library.components.item({ children: Weave.library.composition.compact([Weave.library.components.treeLabel(node), Weave.library.components.treeBranch(node)]) });
Weave.library.components.tree = spec => Weave.library.components.build(Weave.library.components.parts.list, 'tree', { children: spec.nodes.map(Weave.library.components.treeNode) });

/* table: one table function, driven by a column table the caller supplies. */
Weave.library.components.cellValue = (row, column) => Weave.library.control.defaultTo(Weave.library.composition.identity)(column.format)(row[column.key], row);
Weave.library.components.headerCell = column => Weave.library.components.build(Weave.library.components.parts.gridHeader, 'tableHeader', { text: column.label, onAction: column.onAction });
Weave.library.components.bodyCell = row => column => Weave.library.components.build(Weave.library.components.parts.gridCell, 'tableCell', { children: [Weave.library.components.cellValue(row, column)] });
Weave.library.components.tableRow = children => Weave.library.components.build(Weave.library.components.parts.gridRow, 'tableRow', { children });
Weave.library.components.headerRow = columns => Weave.library.components.tableRow(columns.map(Weave.library.components.headerCell));
Weave.library.components.bodyRow = columns => row => Weave.library.components.tableRow(columns.map(Weave.library.components.bodyCell(row)));
Weave.library.components.tableHead = columns => Weave.library.components.build(Weave.library.components.parts.gridHead, 'tableHead', { children: [Weave.library.components.headerRow(columns)] });
Weave.library.components.tableBody = spec => Weave.library.components.build(Weave.library.components.parts.gridBody, 'tableBody', { children: spec.rows.map(Weave.library.components.bodyRow(spec.columns)) });
Weave.library.components.table = spec => Weave.library.components.build(Weave.library.components.parts.grid, 'table', { children: [Weave.library.components.tableHead(spec.columns), Weave.library.components.tableBody(spec)] });

/* pages: a form, a dialog and a pager. The last widgets before a pattern starts composing them. */
Weave.library.components.submitAttributes = { [Weave.library.browser.keywords.type]: Weave.library.elements.inputTypes.submit };
Weave.library.components.primaryData = () => Weave.library.components.variantData({ variant: Weave.library.components.defaultVariant() });
Weave.library.components.submitButton = spec => Weave.library.components.button({ text: Weave.library.components.textOf(spec, Weave.library.components.submitKey), attributes: Weave.library.components.submitAttributes, data: Weave.library.components.primaryData() });
Weave.library.components.submitKey = 'submit';
Weave.library.components.formBody = spec => Weave.library.components.childrenOf(spec, Weave.library.components.fieldsKey).concat([Weave.library.components.submitButton(spec)]);
Weave.library.components.fieldsKey = 'fields';
Weave.library.components.form = spec => Weave.library.components.build(Weave.library.components.parts.form, 'form', { children: Weave.library.components.formBody(spec), onSend: Weave.library.components.submitHandler(spec) });
Weave.library.components.submitHandler = spec => event => Weave.library.control.defaultTo(Weave.library.composition.noop)(spec.onSubmit)(Weave.library.forms.values(Weave.library.browser.currentTargetOf(event)), Weave.library.browser.preventDefault(event));
Weave.library.components.closeButton = spec => Weave.library.components.actionButton({ label: Weave.library.components.closeLabel, onAction: spec.onClose });
Weave.library.components.dialogHeader = spec => Weave.library.components.spread({ children: [Weave.library.components.title({ text: Weave.library.components.titleOf(spec) }), Weave.library.components.closeButton(spec)] });
Weave.library.components.closeLabel = 'Close';
Weave.library.components.modalAttributes = spec => Weave.library.composition.merge(Weave.library.components.openAttribute(spec), Weave.library.components.roleAttribute(Weave.library.accessibility.roles.dialog));
Weave.library.components.modalSpec = spec => ({ children: [Weave.library.components.dialogHeader(spec), Weave.library.components.disclosureBody(spec)], attributes: Weave.library.components.modalAttributes(spec) });
Weave.library.components.modal = spec => Weave.library.components.build(Weave.library.components.parts.dialog, 'modal', Weave.library.components.modalSpec(spec));
Weave.library.components.pageButton = spec => page => Weave.library.components.build(Weave.library.components.parts.button, 'pageButton', { text: String(page), onAction: () => spec.onGo(page), aria: { current: String(page === spec.page) } });
Weave.library.components.pageNumbers = spec => Weave.library.composition.range(spec.pages).map(index => index + 1);
Weave.library.components.pagination = spec => Weave.library.components.build(Weave.library.components.parts.navigation, 'pagination', { children: Weave.library.components.pageNumbers(spec).map(Weave.library.components.pageButton(spec)), aria: { label: spec.label } });

/* tokens: the only place a dimension, a colour or a duration is written. Emitted as custom properties. */
Weave.library.components.tokens = {};
Weave.library.components.tokens.space = '8px';
Weave.library.components.tokens.spaceTight = '4px';
Weave.library.components.tokens.spaceLoose = '16px';
Weave.library.components.tokens.spaceWide = '24px';
Weave.library.components.tokens.radius = Weave.library.components.tokens.space;
Weave.library.components.tokens.radiusSmall = Weave.library.components.tokens.spaceTight;
Weave.library.components.tokens.line = '1px';
Weave.library.components.tokens.ink = '#111827';
Weave.library.components.tokens.muted = '#6b7280';
Weave.library.components.tokens.edge = '#d9dee5';
Weave.library.components.tokens.surface = '#ffffff';
Weave.library.components.tokens.sunken = '#f5f6f8';
Weave.library.components.tokens.accent = '#2563eb';
Weave.library.components.tokens.accentInk = Weave.library.components.tokens.surface;
Weave.library.components.tokens.danger = '#b00020';
Weave.library.components.tokens.font = 'system-ui, -apple-system, Segoe UI, sans-serif';
Weave.library.components.tokens.fontSize = '14px';
Weave.library.components.tokens.fontSizeLarge = '20px';
Weave.library.components.tokens.fontSizeSmall = '12px';
Weave.library.components.tokens.leading = '1.5';
Weave.library.components.tokens.shadow = '0 1px 2px rgba(17, 24, 39, 0.08)';
Weave.library.components.tokens.tileTrack = 'repeat(auto-fill, minmax(200px, 1fr))';
Weave.library.components.tokens.railWidth = '220px';
Weave.library.components.tokens.controlHeight = '32px';
Weave.library.components.tokens.dotSize = '10px';
Weave.library.components.tokens.toneInfo = Weave.library.components.tokens.accent;
Weave.library.components.tokens.toneSuccess = '#127a56';
Weave.library.components.tokens.toneWarning = '#8a5a00';
Weave.library.components.tokens.toneDanger = Weave.library.components.tokens.danger;
Weave.library.components.tokens.pulse = 'pulse 1s ease-in-out infinite alternate';
Weave.library.components.tokens.focusRing = '0 0 0 3px rgba(37, 99, 235, 0.35)';
Weave.library.components.tokens.press = 'translateY(1px)';
Weave.library.components.tokens.ease = 'all 120ms ease';
Weave.library.components.tokens.shadowLifted = '0 10px 30px rgba(17, 24, 39, 0.18)';
Weave.library.components.tokens.fontMono = 'ui-monospace, SFMono-Regular, Menlo, monospace';
Weave.library.components.tokens.compactWidth = '640px';
Weave.library.components.tokens.pageWidth = '1100px';
Weave.library.components.variablePrefix = '--weave-';
Weave.library.components.variableName = name => Weave.library.components.variablePrefix + Weave.library.composition.kebabCase(name);
Weave.library.components.variableOpen = 'var(';
Weave.library.components.variableUse = (value, name) => Weave.library.components.variableOpen + Weave.library.components.variableName(name) + Weave.library.composition.closeParen;
Weave.library.components.vars = {};
Weave.library.composition.defineEach(Weave.library.components.vars, Weave.library.components.variableUse)(Weave.library.components.tokens);

/* values: the only place a bare css keyword is written. One row, one keyword. */
Weave.library.components.values = {};
Weave.library.components.values.flex = 'flex';
Weave.library.components.values.grid = 'grid';
Weave.library.components.values.block = 'block';
Weave.library.components.values.inlineFlex = 'inline-flex';
Weave.library.components.values.column = 'column';
Weave.library.components.values.wrap = 'wrap';
Weave.library.components.values.center = 'center';
Weave.library.components.values.between = 'space-between';
Weave.library.components.values.pointer = 'pointer';
Weave.library.components.values.auto = 'auto';
Weave.library.components.values.full = '100%';
Weave.library.components.values.collapse = 'collapse';
Weave.library.components.values.left = 'left';
Weave.library.components.values.none = 'none';
Weave.library.components.values.zero = '0';
Weave.library.components.values.bold = '600';
Weave.library.components.values.solid = ' solid ';
Weave.library.components.values.transparent = 'transparent';
Weave.library.components.values.faded = '0.4';
Weave.library.components.values.one = '1';
Weave.library.components.values.opaque = Weave.library.components.values.one;
Weave.library.components.values.grow = Weave.library.components.values.one;
Weave.library.components.values.notAllowed = 'not-allowed';
Weave.library.components.values.start = 'flex-start';
Weave.library.components.hairline = Weave.library.components.vars.line + Weave.library.components.values.solid + Weave.library.components.vars.edge;
Weave.library.components.accentLine = Weave.library.components.vars.line + Weave.library.components.values.solid + Weave.library.components.vars.accent;

/* rules: the only place a component look is written. One row per class, values are token references. */
Weave.library.components.rules = {};
Weave.library.components.rules.page = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceLoose, padding: Weave.library.components.vars.spaceLoose, maxWidth: Weave.library.components.vars.pageWidth, margin: Weave.library.components.values.auto };
Weave.library.components.rules.view = { fontFamily: Weave.library.components.vars.font, fontSize: Weave.library.components.vars.fontSize, lineHeight: Weave.library.components.vars.leading, color: Weave.library.components.vars.ink };
Weave.library.components.rules.panel = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.space, padding: Weave.library.components.vars.spaceLoose, background: Weave.library.components.vars.surface, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radius, flexGrow: Weave.library.components.values.grow };
Weave.library.components.rules.stack = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.space };
Weave.library.components.rules.row = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.space, alignItems: Weave.library.components.values.center, flexWrap: Weave.library.components.values.wrap };
Weave.library.components.rules.spread = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.space, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.between };
Weave.library.components.rules.tiles = { display: Weave.library.components.values.grid, gap: Weave.library.components.vars.spaceLoose, gridTemplateColumns: Weave.library.components.vars.tileTrack };
Weave.library.components.rules.scroller = { overflow: Weave.library.components.values.auto, maxHeight: Weave.library.components.values.full };
Weave.library.components.rules.divider = { borderTop: Weave.library.components.hairline, margin: Weave.library.components.vars.space };
Weave.library.components.rules.card = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight, padding: Weave.library.components.vars.spaceLoose, background: Weave.library.components.vars.surface, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radius, boxShadow: Weave.library.components.vars.shadow };
Weave.library.components.rules.title = { margin: Weave.library.components.vars.spaceTight, fontSize: Weave.library.components.vars.fontSizeLarge };
Weave.library.components.rules.subtitle = { margin: Weave.library.components.vars.spaceTight, fontSize: Weave.library.components.vars.fontSize };
Weave.library.components.rules.note = { margin: Weave.library.components.vars.spaceTight, color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.value = { fontSize: Weave.library.components.vars.fontSizeLarge, fontWeight: Weave.library.components.values.bold };
Weave.library.components.rules.tag = { display: Weave.library.components.values.inlineFlex, padding: Weave.library.components.vars.spaceTight, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.sunken, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.pill = { display: Weave.library.components.values.inlineFlex, padding: Weave.library.components.vars.spaceTight, borderRadius: Weave.library.components.vars.radius, background: Weave.library.components.vars.accent, color: Weave.library.components.vars.accentInk, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.avatar = { display: Weave.library.components.values.inlineFlex, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.center, width: Weave.library.components.vars.controlHeight, height: Weave.library.components.vars.controlHeight, borderRadius: Weave.library.components.values.full, background: Weave.library.components.vars.sunken, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.button = { minHeight: Weave.library.components.vars.controlHeight, padding: Weave.library.components.vars.space, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.surface, color: Weave.library.components.vars.ink, cursor: Weave.library.components.values.pointer, fontFamily: Weave.library.components.vars.font, fontSize: Weave.library.components.vars.fontSize };
Weave.library.components.rules.anchor = { color: Weave.library.components.vars.accent };
Weave.library.components.rules.itemList = { listStyle: Weave.library.components.values.none, margin: Weave.library.components.values.zero, padding: Weave.library.components.values.zero, display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.field = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.fieldLabel = { color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.control = { minHeight: Weave.library.components.vars.controlHeight, padding: Weave.library.components.vars.space, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radiusSmall, fontFamily: Weave.library.components.vars.font, fontSize: Weave.library.components.vars.fontSize };
Weave.library.components.rules.textArea = { padding: Weave.library.components.vars.space, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radiusSmall, fontFamily: Weave.library.components.vars.font };
Weave.library.components.rules.selectBox = { minHeight: Weave.library.components.vars.controlHeight, padding: Weave.library.components.vars.spaceTight, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radiusSmall, fontFamily: Weave.library.components.vars.font };
Weave.library.components.rules.searchBox = { minHeight: Weave.library.components.vars.controlHeight, padding: Weave.library.components.vars.space, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radius, fontFamily: Weave.library.components.vars.font, width: Weave.library.components.values.full };
Weave.library.components.rules.checkField = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceTight, alignItems: Weave.library.components.values.center };
Weave.library.components.rules.table = { width: Weave.library.components.values.full, borderCollapse: Weave.library.components.values.collapse, fontSize: Weave.library.components.vars.fontSize };
Weave.library.components.rules.tableHeader = { textAlign: Weave.library.components.values.left, padding: Weave.library.components.vars.space, borderBottom: Weave.library.components.hairline, color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.tableCell = { padding: Weave.library.components.vars.space, borderBottom: Weave.library.components.hairline };
Weave.library.components.rules.toolbar = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceTight, flexWrap: Weave.library.components.values.wrap, alignItems: Weave.library.components.values.center };
Weave.library.components.rules.menu = { listStyle: Weave.library.components.values.none, margin: Weave.library.components.values.zero, padding: Weave.library.components.vars.spaceTight, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radius, background: Weave.library.components.vars.surface, boxShadow: Weave.library.components.vars.shadow };
Weave.library.components.rules.tabs = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceTight, borderBottom: Weave.library.components.hairline };
Weave.library.components.rules.tab = { padding: Weave.library.components.vars.space, border: Weave.library.components.values.none, background: Weave.library.components.values.transparent, cursor: Weave.library.components.values.pointer, fontFamily: Weave.library.components.vars.font, fontSize: Weave.library.components.vars.fontSize };
Weave.library.components.rules.breadcrumb = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.space, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.tree = { listStyle: Weave.library.components.values.none, margin: Weave.library.components.values.zero, paddingLeft: Weave.library.components.vars.spaceLoose };
Weave.library.components.rules.disclosure = { border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radiusSmall, padding: Weave.library.components.vars.space };
Weave.library.components.rules.disclosureSummary = { cursor: Weave.library.components.values.pointer, fontWeight: Weave.library.components.values.bold };
Weave.library.components.rules.accordion = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.modal = { border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radius, padding: Weave.library.components.vars.spaceWide, boxShadow: Weave.library.components.vars.shadowLifted };
Weave.library.components.rules.toast = { padding: Weave.library.components.vars.space, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.sunken, border: Weave.library.components.hairline };
Weave.library.components.rules.statTile = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight, padding: Weave.library.components.vars.spaceLoose, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radius, background: Weave.library.components.vars.surface };
Weave.library.components.rules.emptyState = { padding: Weave.library.components.vars.spaceWide, textAlign: Weave.library.components.values.center, color: Weave.library.components.vars.muted };
Weave.library.components.rules.pagination = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.pageButton = { minWidth: Weave.library.components.vars.controlHeight, minHeight: Weave.library.components.vars.controlHeight, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.surface, cursor: Weave.library.components.values.pointer };
Weave.library.components.rules.rail = { width: Weave.library.components.vars.railWidth, display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.space };
Weave.library.components.rules.pageHeader = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.between, gap: Weave.library.components.vars.space, paddingBottom: Weave.library.components.vars.space, borderBottom: Weave.library.components.hairline };
Weave.library.components.rules.pageFooter = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.between, gap: Weave.library.components.vars.space, paddingTop: Weave.library.components.vars.space, borderTop: Weave.library.components.hairline, color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.body = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceLoose, flexGrow: Weave.library.components.values.grow };
Weave.library.components.rules.listRow = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, gap: Weave.library.components.vars.space };
Weave.library.components.rules.timestamp = { color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };

/* states: the only place a pseudo class or a state attribute is written. One row, one selector suffix. */
Weave.library.components.states = {};
Weave.library.components.states.hover = ':hover';
Weave.library.components.states.chosen = '[aria-selected="true"]';
Weave.library.components.states.here = '[aria-current="true"]';
Weave.library.components.states.over = '[data-over="true"]';
Weave.library.components.stateRules = {};
Weave.library.components.stateRules.tabChosen = { name: 'tab', state: 'chosen', style: { borderBottom: Weave.library.components.accentLine, color: Weave.library.components.vars.accent } };
Weave.library.components.stateRules.pageHere = { name: 'pageButton', state: 'here', style: { background: Weave.library.components.vars.accent, color: Weave.library.components.vars.accentInk } };
Weave.library.components.stateRules.cardHover = { name: 'card', state: 'hover', style: { boxShadow: Weave.library.components.vars.shadowLifted, borderColor: Weave.library.components.vars.edge } };
Weave.library.components.stateRules.panelOver = { name: 'panel', state: 'over', style: { borderColor: Weave.library.components.vars.accent, background: Weave.library.components.vars.sunken } };

/* stylesheet: one generator turns the three tables above into the one sheet the page installs. */
Weave.library.components.declaration = ([property, value]) => Weave.library.composition.kebabCase(property) + ': ' + value + ';';
Weave.library.components.declarations = style => Weave.library.composition.pairs(style).map(Weave.library.components.declaration).join(Weave.library.browser.keywords.space);
Weave.library.components.blockFor = (selector, style) => selector + ' { ' + Weave.library.components.declarations(style) + ' }';
Weave.library.components.classSelector = name => Weave.library.browser.keywords.dot + Weave.library.components.classOf(name);
Weave.library.components.ruleText = ([name, style]) => Weave.library.components.blockFor(Weave.library.components.classSelector(name), style);
Weave.library.components.stateSelector = row => Weave.library.components.classSelector(row.name) + Weave.library.components.states[row.state];
Weave.library.components.stateText = row => Weave.library.components.blockFor(Weave.library.components.stateSelector(row), row.style);
Weave.library.components.rootSelector = ':root';
Weave.library.components.tokenStyle = () => Weave.library.composition.mapKeys(Weave.library.components.variableName)(Weave.library.components.tokens);
Weave.library.components.rootText = () => Weave.library.components.blockFor(Weave.library.components.rootSelector, Weave.library.components.tokenStyle());
Weave.library.components.ruleTexts = () => Weave.library.composition.pairs(Weave.library.components.rules).map(Weave.library.components.ruleText);
Weave.library.components.stateTexts = () => Weave.library.composition.values(Weave.library.components.stateRules).map(Weave.library.components.stateText);
Weave.library.components.styleText = () => [Weave.library.components.rootText()].concat(Weave.library.components.ruleTexts(), Weave.library.components.stateTexts(), Weave.library.components.extraTexts()).join('\n');
Weave.library.components.addStyleSheet = () => Weave.library.elements.append([Weave.library.elements.style({ text: Weave.library.components.styleText() })])(Weave.library.browser.head());
Weave.library.components.installStyles = Weave.library.control.once(Weave.library.components.addStyleSheet);

/* calendar day: the one piece a month grid needs, plus the state names its two rules are keyed by. */
Weave.library.components.stateNames = {};
Weave.library.components.stateNames.chosen = 'chosen';
Weave.library.components.stateNames.here = 'here';
Weave.library.components.dayName = 'dayButton';
Weave.library.components.dayMarks = spec => ({ current: String(spec.here === true), selected: String(spec.chosen === true) });
Weave.library.components.daySpec = spec => ({ text: spec.label, onAction: spec.onAction, aria: Weave.library.components.dayMarks(spec), data: { key: spec.key } });
Weave.library.components.dayButton = spec => Weave.library.components.build(Weave.library.components.parts.button, Weave.library.components.dayName, Weave.library.components.daySpec(spec));
Weave.library.components.rules.dayButton = { width: Weave.library.components.values.full, minHeight: Weave.library.components.vars.controlHeight, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.surface, color: Weave.library.components.vars.ink, cursor: Weave.library.components.values.pointer, fontFamily: Weave.library.components.vars.font, fontSize: Weave.library.components.vars.fontSize };
Weave.library.components.stateRules.dayChosen = { name: Weave.library.components.dayName, state: Weave.library.components.stateNames.chosen, style: { background: Weave.library.components.vars.accent, color: Weave.library.components.vars.accentInk } };
Weave.library.components.stateRules.dayHere = { name: Weave.library.components.dayName, state: Weave.library.components.stateNames.here, style: { borderColor: Weave.library.components.vars.accent, fontWeight: Weave.library.components.values.bold } };
/* themes: one row per theme, each a table of token overrides. A theme row may only name token keys. */
Weave.library.components.themes = {};
Weave.library.components.themes.dark = { ink: '#e8ecf3', muted: '#9aa4b2', edge: '#2b3442', surface: '#0f1722', sunken: '#172130', accent: '#7aa2ff', accentInk: '#0b1220', shadow: '0 1px 2px rgba(0, 0, 0, 0.5)', shadowLifted: '0 10px 30px rgba(0, 0, 0, 0.6)', focusRing: '0 0 0 3px rgba(122, 162, 255, 0.45)' };

/* themeNames: the only place a theme name is written. Every theme call takes a row from here. */
Weave.library.components.themeNames = {};
Weave.library.components.themeNames.dark = 'dark';
Weave.library.components.themeNames.light = 'light';

/* theming: the attribute, the two selectors it feeds and the three calls a page uses to switch. */
Weave.library.components.themeAttribute = 'data-theme';
Weave.library.components.themeSelector = name => Weave.library.components.rootSelector + Weave.library.query.attributeSelector(Weave.library.components.themeAttribute, name);
Weave.library.components.themeStyle = overrides => Weave.library.composition.mapKeys(Weave.library.components.variableName)(overrides);
Weave.library.components.themeText = ([name, overrides]) => Weave.library.components.blockFor(Weave.library.components.themeSelector(name), Weave.library.components.themeStyle(overrides));
Weave.library.components.themeTexts = () => Weave.library.composition.pairs(Weave.library.components.themes).map(Weave.library.components.themeText);
Weave.library.components.notOpen = ':not(';
Weave.library.components.braceOpen = '{';
Weave.library.components.braceClose = '}';
Weave.library.components.mediaOpen = '@media ';
Weave.library.components.mediaText = (query, body) => Weave.library.components.mediaOpen + query + Weave.library.components.braceOpen + body + Weave.library.components.braceClose;
Weave.library.components.schemeSelector = () => Weave.library.components.rootSelector + Weave.library.components.notOpen + Weave.library.query.attributeSelector(Weave.library.components.themeAttribute, Weave.library.components.themeNames.light) + Weave.library.composition.closeParen;
Weave.library.components.schemeBlock = () => Weave.library.components.blockFor(Weave.library.components.schemeSelector(), Weave.library.components.themeStyle(Weave.library.components.themes.dark));
Weave.library.components.schemeText = () => Weave.library.components.mediaText(Weave.library.browser.mediaQueries.darkScheme, Weave.library.components.schemeBlock());
Weave.library.components.setTheme = name => Weave.library.attributes.setAttribute(Weave.library.components.themeAttribute, name)(Weave.library.browser.documentElement());
Weave.library.components.theme = () => Weave.library.attributes.attribute(Weave.library.components.themeAttribute)(Weave.library.browser.documentElement());
Weave.library.components.nextTheme = current => Weave.library.control.either(() => current === Weave.library.components.themeNames.dark, () => Weave.library.components.themeNames.light, () => Weave.library.components.themeNames.dark)(current);
Weave.library.components.toggleTheme = () => Weave.library.components.setTheme(Weave.library.components.nextTheme(Weave.library.components.theme()));
Weave.library.components.schemeName = isDark => Weave.library.control.either(Weave.library.composition.identity, () => Weave.library.components.themeNames.dark, () => Weave.library.components.themeNames.light)(isDark);
Weave.library.components.schemeTheme = isDark => Weave.library.components.setTheme(Weave.library.components.schemeName(isDark));
Weave.library.components.followScheme = () => Weave.library.observers.onColorScheme(Weave.library.components.schemeTheme);

/* keyframes: the only place an animation timeline is written. One row per name, one block per row. */
Weave.library.components.keyframes = {};
Weave.library.components.keyframes.pulse = { from: { opacity: Weave.library.components.values.faded }, to: { opacity: Weave.library.components.values.opaque } };
Weave.library.components.keyframesOpen = '@keyframes ';
Weave.library.components.stopText = ([stop, style]) => Weave.library.components.blockFor(stop, style);
Weave.library.components.stopsText = frames => Weave.library.composition.pairs(frames).map(Weave.library.components.stopText).join(Weave.library.browser.keywords.space);
Weave.library.components.keyframesText = ([name, frames]) => Weave.library.components.keyframesOpen + name + Weave.library.components.braceOpen + Weave.library.components.stopsText(frames) + Weave.library.components.braceClose;
Weave.library.components.keyframesTexts = () => Weave.library.composition.pairs(Weave.library.components.keyframes).map(Weave.library.components.keyframesText);

/* tones: one row per tone, holding the colour it spends. A tone is a data attribute, never a class. */
Weave.library.components.tones = {};
Weave.library.components.tones.info = Weave.library.components.vars.toneInfo;
Weave.library.components.tones.success = Weave.library.components.vars.toneSuccess;
Weave.library.components.tones.warning = Weave.library.components.vars.toneWarning;
Weave.library.components.tones.danger = Weave.library.components.vars.toneDanger;

/* toneRules: one row per toned class, saying how that class spends the tone colour it is given. */
Weave.library.components.toneRules = {};
Weave.library.components.toneRules.alert = colour => ({ borderColor: colour, color: colour });
Weave.library.components.toneRules.statusDot = colour => ({ background: colour });
Weave.library.components.toneKey = 'tone';
Weave.library.components.defaultTone = () => Weave.library.composition.first(Weave.library.composition.keys(Weave.library.components.tones));
Weave.library.components.toneOf = spec => Weave.library.control.defaultTo(Weave.library.components.defaultTone())(spec.tone);
Weave.library.components.toneData = spec => ({ [Weave.library.components.toneKey]: Weave.library.components.toneOf(spec) });
Weave.library.components.toneSelector = tone => Weave.library.query.dataSelector(Weave.library.components.toneKey, tone);
Weave.library.components.toneBlock = ([name, style]) => ([tone, colour]) => Weave.library.components.blockFor(Weave.library.components.classSelector(name) + Weave.library.components.toneSelector(tone), style(colour));
Weave.library.components.toneTexts = () => Weave.library.composition.pairs(Weave.library.components.toneRules).flatMap(row => Weave.library.composition.pairs(Weave.library.components.tones).map(Weave.library.components.toneBlock(row)));

/* parts, second wave: the builders the widgets below name, one row each, tags still written once. */
Weave.library.components.parts.keyCap = Weave.library.elements.kbd;
Weave.library.components.parts.slider = Weave.library.elements.inputs.range;

/* feedback: the widgets that say what just happened. Every one carries its tone as a data attribute. */
Weave.library.components.textKey = 'text';
Weave.library.components.alertClose = spec => Weave.library.control.maybe(() => Weave.library.components.closeButton(spec))(spec.onClose);
Weave.library.components.alertTitle = spec => Weave.library.components.subtitle({ text: Weave.library.components.titleOf(spec) });
Weave.library.components.alertNote = spec => Weave.library.components.note({ text: Weave.library.components.textOf(spec, Weave.library.components.textKey) });
Weave.library.components.alertBody = spec => Weave.library.composition.compact([Weave.library.components.alertTitle(spec), Weave.library.components.alertNote(spec), Weave.library.components.alertClose(spec)]);
Weave.library.components.alertSpec = spec => Weave.library.composition.mergeDeep(spec, { children: Weave.library.components.alertBody(spec), data: Weave.library.components.toneData(spec), attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.alert) });
Weave.library.components.alert = spec => Weave.library.components.build(Weave.library.components.parts.box, 'alert', Weave.library.components.alertSpec(spec));
Weave.library.components.statusDot = spec => Weave.library.components.build(Weave.library.components.parts.inline, 'statusDot', { data: Weave.library.components.toneData(spec), attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.status) });
Weave.library.components.countKey = 'count';
Weave.library.components.countText = spec => String(Weave.library.components.textOf(spec, Weave.library.components.countKey));
Weave.library.components.badge = spec => Weave.library.components.build(Weave.library.components.parts.inline, 'badge', { text: Weave.library.components.countText(spec), attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.status) });
Weave.library.components.keysKey = 'keys';
Weave.library.components.keyCap = key => Weave.library.components.build(Weave.library.components.parts.keyCap, 'keyCap', { text: key });
Weave.library.components.kbd = spec => Weave.library.components.build(Weave.library.components.parts.inline, 'kbd', { children: Weave.library.components.childrenOf(spec, Weave.library.components.keysKey).map(Weave.library.components.keyCap) });
Weave.library.components.linesKey = 'lines';
Weave.library.components.skeletonLine = () => Weave.library.components.build(Weave.library.components.parts.box, 'skeletonLine', {});
Weave.library.components.skeletonLines = spec => Weave.library.control.times(Weave.library.control.defaultTo(1)(spec.lines))(Weave.library.components.skeletonLine);
Weave.library.components.skeleton = spec => Weave.library.components.build(Weave.library.components.parts.box, 'skeleton', { children: Weave.library.components.skeletonLines(spec), aria: { busy: Weave.library.browser.keywords.true } });
Weave.library.components.namesKey = 'names';
Weave.library.components.avatarFor = name => Weave.library.components.portrait({ name });
Weave.library.components.avatarGroup = spec => Weave.library.components.build(Weave.library.components.parts.box, 'avatarGroup', { children: Weave.library.components.childrenOf(spec, Weave.library.components.namesKey).map(Weave.library.components.avatarFor) });

/* controls, second wave: a switch, a slider and a stepper, each still one spec in and one element out. */
Weave.library.components.checkedValue = spec => String(Weave.library.control.defaultTo(false)(spec.checked));
Weave.library.components.switchAria = spec => ({ checked: Weave.library.components.checkedValue(spec), label: spec.label });
Weave.library.components.switchSpec = spec => ({ attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.switch), aria: Weave.library.components.switchAria(spec), onAction: spec.onChoose });
Weave.library.components.switchControl = spec => Weave.library.components.build(Weave.library.components.parts.button, 'switchControl', Weave.library.components.switchSpec(spec));
Weave.library.components.switchField = spec => Weave.library.components.build(Weave.library.components.parts.box, 'switchField', { children: [Weave.library.components.fieldLabel(spec), Weave.library.components.switchControl(spec)] });
Weave.library.components.rangeAttributes = spec => ({ min: spec.min, max: spec.max, step: spec.step, [Weave.library.browser.keywords.value]: spec.value });
Weave.library.components.sliderAttributes = spec => Weave.library.composition.merge(Weave.library.components.namedAttribute(spec), Weave.library.components.rangeAttributes(spec));
Weave.library.components.sliderControl = spec => Weave.library.components.build(Weave.library.components.parts.slider, 'sliderControl', { attributes: Weave.library.components.sliderAttributes(spec), onEdit: spec.onEdit });
Weave.library.components.sliderField = spec => Weave.library.components.build(Weave.library.components.parts.label, 'sliderField', { children: [Weave.library.components.fieldLabel(spec), Weave.library.components.sliderControl(spec)] });
Weave.library.components.stepperSteps = {};
Weave.library.components.stepperSteps.decrement = { label: 'Less', step: -1 };
Weave.library.components.stepperSteps.increment = { label: 'More', step: 1 };
Weave.library.components.stepperValue = spec => Weave.library.control.defaultTo(spec.min)(spec.value);
Weave.library.components.stepperNext = (spec, step) => Weave.library.composition.clamp(spec.min, spec.max)(Weave.library.components.stepperValue(spec) + step);
Weave.library.components.stepperMove = spec => row => Weave.library.components.actionButton({ label: row.label, onAction: () => spec.onChange(Weave.library.components.stepperNext(spec, row.step)) });
Weave.library.components.stepperControl = spec => Weave.library.components.control(Weave.library.composition.merge(spec, { type: Weave.library.elements.inputTypes.number, value: Weave.library.components.stepperValue(spec) }));
Weave.library.components.stepperRow = spec => [Weave.library.components.stepperMove(spec)(Weave.library.components.stepperSteps.decrement), Weave.library.components.stepperControl(spec), Weave.library.components.stepperMove(spec)(Weave.library.components.stepperSteps.increment)];
Weave.library.components.stepperField = spec => Weave.library.components.build(Weave.library.components.parts.box, 'stepperField', { children: [Weave.library.components.fieldLabel(spec), Weave.library.components.row({ children: Weave.library.components.stepperRow(spec) })] });

/* disclosure widgets: a dropdown and a tooltip, both assembled from parts that already exist. */
Weave.library.components.dropdownSummary = spec => Weave.library.components.disclosureSummary({ title: spec.label });
Weave.library.components.dropdown = spec => Weave.library.components.build(Weave.library.components.parts.details, 'dropdown', { children: [Weave.library.components.dropdownSummary(spec), Weave.library.components.menu(spec)] });
Weave.library.components.tooltipPrefix = 'weave-tip-';
Weave.library.components.tooltipId = () => Weave.library.composition.randomId(Weave.library.components.tooltipPrefix);
Weave.library.components.hintKey = 'hint';
Weave.library.components.tooltipNoteAttributes = id => Weave.library.composition.merge(Weave.library.components.roleAttribute(Weave.library.accessibility.roles.tooltip), { [Weave.library.browser.keywords.id]: id });
Weave.library.components.tooltipNoteSpec = (spec, id) => ({ text: Weave.library.components.textOf(spec, Weave.library.components.hintKey), attributes: Weave.library.components.tooltipNoteAttributes(id), styles: Weave.library.accessibility.visuallyHidden });
Weave.library.components.tooltipNote = (spec, id) => Weave.library.components.build(Weave.library.components.parts.inline, 'tooltipNote', Weave.library.components.tooltipNoteSpec(spec, id));
Weave.library.components.tooltipTarget = (spec, id) => Weave.library.components.build(Weave.library.components.parts.inline, 'tooltipTarget', { text: Weave.library.components.textOf(spec, Weave.library.components.textKey), aria: { [Weave.library.accessibility.states.describedby]: id } });
Weave.library.components.tooltipParts = (spec, id) => [Weave.library.components.tooltipTarget(spec, id), Weave.library.components.tooltipNote(spec, id)];
Weave.library.components.tooltip = spec => Weave.library.components.build(Weave.library.components.parts.inline, 'tooltip', { children: Weave.library.components.tooltipParts(spec, Weave.library.components.tooltipId()) });

/* rules, second wave: one row per class added above, values still token references and nothing else. */
Weave.library.components.rules.alert = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight, padding: Weave.library.components.vars.spaceLoose, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radius, background: Weave.library.components.vars.surface };
Weave.library.components.rules.statusDot = { display: Weave.library.components.values.inlineFlex, width: Weave.library.components.vars.dotSize, height: Weave.library.components.vars.dotSize, borderRadius: Weave.library.components.values.full, background: Weave.library.components.vars.muted };
Weave.library.components.rules.badge = { display: Weave.library.components.values.inlineFlex, justifyContent: Weave.library.components.values.center, minWidth: Weave.library.components.vars.spaceLoose, padding: Weave.library.components.vars.spaceTight, borderRadius: Weave.library.components.values.full, background: Weave.library.components.vars.accent, color: Weave.library.components.vars.accentInk, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.kbd = { display: Weave.library.components.values.inlineFlex, gap: Weave.library.components.vars.spaceTight, alignItems: Weave.library.components.values.center };
Weave.library.components.rules.keyCap = { padding: Weave.library.components.vars.spaceTight, border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.sunken, fontSize: Weave.library.components.vars.fontSizeSmall, fontFamily: Weave.library.components.vars.fontMono };
Weave.library.components.rules.skeleton = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.skeletonLine = { height: Weave.library.components.vars.space, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.sunken, animation: Weave.library.components.vars.pulse };
Weave.library.components.rules.avatarGroup = { display: Weave.library.components.values.inlineFlex, gap: Weave.library.components.vars.spaceTight, alignItems: Weave.library.components.values.center };
Weave.library.components.rules.switchField = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceTight, alignItems: Weave.library.components.values.center };
Weave.library.components.rules.switchControl = { width: Weave.library.components.vars.spaceWide, height: Weave.library.components.vars.spaceLoose, border: Weave.library.components.hairline, borderRadius: Weave.library.components.values.full, background: Weave.library.components.vars.sunken, cursor: Weave.library.components.values.pointer };
Weave.library.components.rules.sliderField = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.sliderControl = { width: Weave.library.components.values.full };
Weave.library.components.rules.stepperField = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.dropdown = { border: Weave.library.components.hairline, borderRadius: Weave.library.components.vars.radiusSmall, padding: Weave.library.components.vars.space };
Weave.library.components.rules.tooltip = { display: Weave.library.components.values.inlineFlex, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.tooltipTarget = { borderBottom: Weave.library.components.hairline, cursor: Weave.library.components.values.pointer };

/* interactive: the only place a class that behaves like a control is named. Focus, rest and ease follow. */
Weave.library.components.interactive = {};
Weave.library.components.interactive.button = 'button';
Weave.library.components.interactive.control = 'control';
Weave.library.components.interactive.textArea = 'textArea';
Weave.library.components.interactive.selectBox = 'selectBox';
Weave.library.components.interactive.searchBox = 'searchBox';
Weave.library.components.interactive.tab = 'tab';
Weave.library.components.interactive.pageButton = 'pageButton';
Weave.library.components.interactive.dayButton = Weave.library.components.dayName;
Weave.library.components.interactive.switchControl = 'switchControl';
Weave.library.components.interactive.sliderControl = 'sliderControl';
Weave.library.components.interactive.disclosureSummary = 'disclosureSummary';
Weave.library.components.interactive.anchor = 'anchor';

/* pressable: the interactive classes that answer a pointer by moving. One row, one class already named. */
Weave.library.components.pressable = {};
Weave.library.components.pressable.button = Weave.library.components.interactive.button;
Weave.library.components.pressable.tab = Weave.library.components.interactive.tab;
Weave.library.components.pressable.pageButton = Weave.library.components.interactive.pageButton;
Weave.library.components.pressable.dayButton = Weave.library.components.interactive.dayButton;
Weave.library.components.pressable.switchControl = Weave.library.components.interactive.switchControl;

/* state styles: one style per state, generated onto every class the two tables above name. */
Weave.library.components.states.focus = ':focus-visible';
Weave.library.components.states.off = ':disabled';
Weave.library.components.states.pressed = ':active';
Weave.library.components.stateNames.focus = 'focus';
Weave.library.components.stateNames.off = 'off';
Weave.library.components.stateNames.pressed = 'pressed';
Weave.library.components.stateNames.hover = 'hover';
Weave.library.components.focusStyle = { outline: Weave.library.components.accentLine, outlineOffset: Weave.library.components.vars.line, boxShadow: Weave.library.components.vars.focusRing };
Weave.library.components.offStyle = { opacity: Weave.library.components.values.faded, cursor: Weave.library.components.values.notAllowed };
Weave.library.components.pressedStyle = { transform: Weave.library.components.vars.press };
Weave.library.components.hoverStyle = { borderColor: Weave.library.components.vars.accent, color: Weave.library.components.vars.accent };
Weave.library.components.focusRule = name => ({ name, state: Weave.library.components.stateNames.focus, style: Weave.library.components.focusStyle });
Weave.library.components.offRule = name => ({ name, state: Weave.library.components.stateNames.off, style: Weave.library.components.offStyle });
Weave.library.components.pressedRule = name => ({ name, state: Weave.library.components.stateNames.pressed, style: Weave.library.components.pressedStyle });
Weave.library.components.hoverRule = name => ({ name, state: Weave.library.components.stateNames.hover, style: Weave.library.components.hoverStyle });
Weave.library.composition.defineEachPrefixed(Weave.library.components.stateRules, Weave.library.components.stateNames.focus, Weave.library.components.focusRule)(Weave.library.components.interactive);
Weave.library.composition.defineEachPrefixed(Weave.library.components.stateRules, Weave.library.components.stateNames.off, Weave.library.components.offRule)(Weave.library.components.interactive);
Weave.library.composition.defineEachPrefixed(Weave.library.components.stateRules, Weave.library.components.stateNames.pressed, Weave.library.components.pressedRule)(Weave.library.components.pressable);
Weave.library.composition.defineEachPrefixed(Weave.library.components.stateRules, Weave.library.components.stateNames.hover, Weave.library.components.hoverRule)(Weave.library.components.pressable);

/* ease: one block over every interactive class, emitted only for a reader who has not asked for less motion. */
Weave.library.components.selectorJoin = ', ';
Weave.library.components.easeStyle = { transition: Weave.library.components.vars.ease };
Weave.library.components.interactiveSelector = () => Weave.library.composition.values(Weave.library.components.interactive).map(Weave.library.components.classSelector).join(Weave.library.components.selectorJoin);
Weave.library.components.easeBlock = () => Weave.library.components.blockFor(Weave.library.components.interactiveSelector(), Weave.library.components.easeStyle);
Weave.library.components.easeTexts = () => [Weave.library.components.mediaText(Weave.library.browser.mediaQueries.steadyMotion, Weave.library.components.easeBlock())];

/* breakpoints: the only place a viewport width query is written. One row per named viewport. */
Weave.library.components.breakpoints = {};
Weave.library.components.breakpoints.compact = Weave.library.browser.upToWidth(Weave.library.components.tokens.compactWidth);

/* mediaRules: the only place a rule that applies under a query is written. One row per query, keyed by class. */
Weave.library.components.mediaRules = {};
Weave.library.components.mediaRules.compact = { query: Weave.library.components.breakpoints.compact, rules: { rail: { width: Weave.library.components.values.full }, tiles: { gridTemplateColumns: Weave.library.components.values.full }, pageHeader: { flexWrap: Weave.library.components.values.wrap, alignItems: Weave.library.components.values.start }, panel: { padding: Weave.library.components.vars.space }, table: { fontSize: Weave.library.components.vars.fontSizeSmall }, modal: { padding: Weave.library.components.vars.spaceLoose }, page: { padding: Weave.library.components.vars.space } } };
Weave.library.components.mediaRules.calm = { query: Weave.library.browser.mediaQueries.reducedMotion, rules: { skeletonLine: { animation: Weave.library.components.values.none } } };
Weave.library.components.mediaRules.paper = { query: Weave.library.browser.mediaQueries.print, rules: { toolbar: { display: Weave.library.components.values.none }, pagination: { display: Weave.library.components.values.none }, card: { boxShadow: Weave.library.components.values.none } } };
Weave.library.components.mediaBody = rules => Weave.library.composition.pairs(rules).map(Weave.library.components.ruleText).join(Weave.library.browser.keywords.space);
Weave.library.components.mediaRuleText = row => Weave.library.components.mediaText(row.query, Weave.library.components.mediaBody(row.rules));
Weave.library.components.mediaTexts = () => Weave.library.composition.values(Weave.library.components.mediaRules).map(Weave.library.components.mediaRuleText);

/* variants: one row per button intent, each an override of the neutral. A variant is a data attribute, never a class. */
Weave.library.components.variants = {};
Weave.library.components.variants.primary = { background: Weave.library.components.vars.accent, borderColor: Weave.library.components.vars.accent, color: Weave.library.components.vars.accentInk };
Weave.library.components.variants.quiet = { background: Weave.library.components.values.transparent, borderColor: Weave.library.components.values.transparent, color: Weave.library.components.vars.muted };
Weave.library.components.variants.grave = { background: Weave.library.components.vars.danger, borderColor: Weave.library.components.vars.danger, color: Weave.library.components.vars.accentInk };
Weave.library.components.variantKey = 'variant';
Weave.library.components.defaultVariant = () => Weave.library.composition.first(Weave.library.composition.keys(Weave.library.components.variants));
Weave.library.components.variantSelector = variant => Weave.library.query.dataSelector(Weave.library.components.variantKey, variant);
Weave.library.components.variantMark = variant => ({ [Weave.library.components.variantKey]: variant });
Weave.library.components.variantData = spec => Weave.library.control.defaultTo({})(Weave.library.control.maybe(Weave.library.components.variantMark)(spec.variant));
Weave.library.components.buttonSelector = () => Weave.library.components.classSelector(Weave.library.components.interactive.button);
Weave.library.components.variantText = ([variant, style]) => Weave.library.components.blockFor(Weave.library.components.buttonSelector() + Weave.library.components.variantSelector(variant), style);
Weave.library.components.variantTexts = () => Weave.library.composition.pairs(Weave.library.components.variants).map(Weave.library.components.variantText);
Weave.library.components.liftStyle = { boxShadow: Weave.library.components.vars.shadowLifted };
Weave.library.components.variantHoverStyle = style => Weave.library.composition.merge(style, Weave.library.components.liftStyle);
Weave.library.components.variantHoverText = ([variant, style]) => Weave.library.components.blockFor(Weave.library.components.buttonSelector() + Weave.library.components.variantSelector(variant) + Weave.library.components.states.hover, Weave.library.components.variantHoverStyle(style));
Weave.library.components.variantHoverTexts = () => Weave.library.composition.pairs(Weave.library.components.variants).map(Weave.library.components.variantHoverText);

/* brand: token overrides set on one element, so a section can differ without a theme and without a rule. */
Weave.library.components.applyToken = element => ([name, value]) => Weave.library.style.setCssVariable(Weave.library.components.variableName(name), value)(element);
Weave.library.components.applyTokens = overrides => element => Weave.library.composition.tap(() => Weave.library.composition.eachPair(Weave.library.components.applyToken(element))(overrides))(element);

/* hosts: the only place a rule on the document itself is written. One row per host selector. */
Weave.library.components.hostSelectors = {};
Weave.library.components.hostSelectors.ground = 'body';
Weave.library.components.hostRules = {};
Weave.library.components.hostRules.ground = { margin: Weave.library.components.values.zero, padding: Weave.library.components.vars.spaceLoose, background: Weave.library.components.vars.sunken, color: Weave.library.components.vars.ink, fontFamily: Weave.library.components.vars.font, fontSize: Weave.library.components.vars.fontSize, lineHeight: Weave.library.components.vars.leading };
Weave.library.components.hostText = ([name, style]) => Weave.library.components.blockFor(Weave.library.components.hostSelectors[name], style);
Weave.library.components.hostTexts = () => Weave.library.composition.pairs(Weave.library.components.hostRules).map(Weave.library.components.hostText);

/* sheetExtras: the only place the blocks after the plain rules are listed. One row, one block maker. */
Weave.library.components.schemeTexts = () => [Weave.library.components.schemeText()];
Weave.library.components.sheetExtras = {};
Weave.library.components.sheetExtras.hosts = Weave.library.components.hostTexts;
Weave.library.components.sheetExtras.themes = Weave.library.components.themeTexts;
Weave.library.components.sheetExtras.scheme = Weave.library.components.schemeTexts;
Weave.library.components.sheetExtras.ease = Weave.library.components.easeTexts;
Weave.library.components.sheetExtras.tones = Weave.library.components.toneTexts;
Weave.library.components.sheetExtras.variants = Weave.library.components.variantTexts;
Weave.library.components.sheetExtras.variantHovers = Weave.library.components.variantHoverTexts;
Weave.library.components.sheetExtras.keyframes = Weave.library.components.keyframesTexts;
Weave.library.components.sheetExtras.media = Weave.library.components.mediaTexts;
Weave.library.components.extraTexts = () => Weave.library.composition.values(Weave.library.components.sheetExtras).flatMap(make => make());
