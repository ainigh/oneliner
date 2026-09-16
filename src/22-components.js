/* components: one function per widget, one spec in, one element out. No widget names a tag or a class. */
Weave.library.components = {};

/* parts: the only place a component chooses an element builder. Every widget names a part, never a tag. */
Weave.library.components.parts = {};
Weave.library.components.parts.box = Weave.library.elements.div;
Weave.library.components.parts.inline = Weave.library.elements.span;
Weave.library.components.parts.code = Weave.library.elements.code;
Weave.library.components.parts.emphasis = Weave.library.elements.strong;
Weave.library.components.parts.paragraph = Weave.library.elements.p;
Weave.library.components.parts.display = Weave.library.elements.h1;
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
Weave.library.components.parts.radio = Weave.library.elements.inputs.radio;
Weave.library.components.parts.media = Weave.library.elements.figure;
Weave.library.components.parts.group = Weave.library.elements.fieldset;
Weave.library.components.parts.legend = Weave.library.elements.legend;
Weave.library.components.parts.search = Weave.library.elements.inputs.search;
Weave.library.components.parts.terms = Weave.library.elements.dl;
Weave.library.components.parts.term = Weave.library.elements.dt;
Weave.library.components.parts.definition = Weave.library.elements.dd;
Weave.library.components.parts.quote = Weave.library.elements.blockquote;
Weave.library.components.parts.credit = Weave.library.elements.figcaption;

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
Weave.library.components.baseSpec = (name, spec) => ({ classes: [Weave.library.components.classOf(name)], listeners: Weave.library.components.listenersFor(spec), data: Weave.library.components.marksOf(spec) });
Weave.library.components.build = (make, name, spec) => make(Weave.library.components.decorate(name, Weave.library.control.defaultTo({})(spec)));
Weave.library.components.decorate = (name, spec) => Weave.library.composition.mergeDeep(Weave.library.components.baseSpec(name, spec), spec);
Weave.library.components.fromBlueprint = (make, name) => (spec = {}) => Weave.library.components.build(make, name, spec);
Weave.library.components.textOf = (spec, key) => Weave.library.control.defaultTo(Weave.library.browser.keywords.empty)(spec[key]);
Weave.library.components.childrenOf = (spec, key) => Weave.library.composition.compact(Weave.library.composition.listOf(Weave.library.control.defaultTo([])(spec[key])));

/* blueprints: one row per plain container. The key is the class, the value is the part it is made of. */
Weave.library.components.blueprints = {};
Weave.library.components.blueprints.view = Weave.library.components.parts.box;
Weave.library.components.blueprints.holder = Weave.library.components.parts.box;
Weave.library.components.blueprints.page = Weave.library.components.parts.main;
Weave.library.components.blueprints.display = Weave.library.components.parts.display;
Weave.library.components.blueprints.truncate = Weave.library.components.parts.inline;
Weave.library.components.blueprints.fill = Weave.library.components.parts.box;
Weave.library.components.blueprints.sticky = Weave.library.components.parts.box;
Weave.library.components.blueprints.shell = Weave.library.components.parts.box;
Weave.library.components.blueprints.pane = Weave.library.components.parts.section;
Weave.library.components.blueprints.rowButton = Weave.library.components.parts.button;
Weave.library.components.blueprints.strong = Weave.library.components.parts.emphasis;
Weave.library.components.blueprints.tabBar = Weave.library.components.parts.navigation;
Weave.library.components.blueprints.choiceGroup = Weave.library.components.parts.group;
Weave.library.components.blueprints.choiceLegend = Weave.library.components.parts.legend;
Weave.library.components.blueprints.overlayHost = Weave.library.components.parts.box;
Weave.library.components.blueprints.scrim = Weave.library.components.parts.box;
Weave.library.components.blueprints.dialogBox = Weave.library.components.parts.section;
Weave.library.components.blueprints.drawerBox = Weave.library.components.parts.section;
Weave.library.components.blueprints.sheetBox = Weave.library.components.parts.section;
Weave.library.components.blueprints.popoverBox = Weave.library.components.parts.section;
Weave.library.components.blueprints.toastHost = Weave.library.components.parts.box;
Weave.library.components.blueprints.toastSlot = Weave.library.components.parts.box;
Weave.library.components.blueprints.actions = Weave.library.components.parts.box;
Weave.library.components.blueprints.tipBubble = Weave.library.components.parts.inline;
Weave.library.components.blueprints.panel = Weave.library.components.parts.section;
Weave.library.components.blueprints.stack = Weave.library.components.parts.box;
Weave.library.components.blueprints.row = Weave.library.components.parts.box;
Weave.library.components.blueprints.spread = Weave.library.components.parts.box;
Weave.library.components.blueprints.tiles = Weave.library.components.parts.box;
Weave.library.components.blueprints.panels = Weave.library.components.parts.box;
Weave.library.components.blueprints.split = Weave.library.components.parts.box;
Weave.library.components.blueprints.scroller = Weave.library.components.parts.box;
Weave.library.components.blueprints.divider = Weave.library.components.parts.box;
Weave.library.components.blueprints.card = Weave.library.components.parts.article;
Weave.library.components.blueprints.title = Weave.library.components.parts.heading;
Weave.library.components.blueprints.subtitle = Weave.library.components.parts.subheading;
Weave.library.components.blueprints.note = Weave.library.components.parts.paragraph;
Weave.library.components.blueprints.text = Weave.library.components.parts.paragraph;
Weave.library.components.blueprints.sectionLabel = Weave.library.components.parts.subheading;
Weave.library.components.blueprints.dataRow = Weave.library.components.parts.box;
Weave.library.components.blueprints.tableBox = Weave.library.components.parts.box;
Weave.library.components.blueprints.code = Weave.library.components.parts.code;
Weave.library.components.blueprints.glyphMark = Weave.library.components.parts.box;
Weave.library.components.blueprints.swatch = Weave.library.components.parts.inline;
Weave.library.components.blueprints.bubble = Weave.library.components.parts.article;
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
Weave.library.components.blueprints.columns = Weave.library.components.parts.box;
Weave.library.components.blueprints.column = Weave.library.components.parts.box;
Weave.library.components.blueprints.navbarBox = Weave.library.components.parts.navigation;
Weave.library.components.blueprints.brand = Weave.library.components.parts.emphasis;
Weave.library.components.blueprints.groupList = Weave.library.components.parts.list;
Weave.library.components.blueprints.groupRow = Weave.library.components.parts.listItem;
Weave.library.components.blueprints.inputGroupBox = Weave.library.components.parts.box;
Weave.library.components.blueprints.addon = Weave.library.components.parts.inline;
Weave.library.components.blueprints.buttonGroupBox = Weave.library.components.parts.box;
Weave.library.components.blueprints.spinnerMark = Weave.library.components.parts.inline;
Weave.library.components.blueprints.termsBox = Weave.library.components.parts.terms;
Weave.library.components.blueprints.term = Weave.library.components.parts.term;
Weave.library.components.blueprints.definition = Weave.library.components.parts.definition;
Weave.library.components.blueprints.quoteBox = Weave.library.components.parts.quote;
Weave.library.components.blueprints.credit = Weave.library.components.parts.credit;
Weave.library.components.blueprints.bannerBox = Weave.library.components.parts.section;
Weave.library.components.blueprints.cardHead = Weave.library.components.parts.header;
Weave.library.components.blueprints.cardFoot = Weave.library.components.parts.footer;
Weave.library.components.blueprints.hint = Weave.library.components.parts.inline;
Weave.library.components.blueprints.codeBox = Weave.library.components.parts.box;
Weave.library.components.blueprints.ratingBox = Weave.library.components.parts.inline;
Weave.library.components.blueprints.trackRow = Weave.library.components.parts.box;
Weave.library.components.blueprints.timelineList = Weave.library.components.parts.list;
Weave.library.components.blueprints.timelineRow = Weave.library.components.parts.listItem;
Weave.library.components.blueprints.chipBox = Weave.library.components.parts.inline;
Weave.library.composition.defineEach(Weave.library.components, Weave.library.components.fromBlueprint)(Weave.library.components.blueprints);
Weave.library.components.nameTable = table => Weave.library.composition.fromPairs(Weave.library.composition.keys(table).map(name => [name, name]));
Weave.library.components.classNames = Weave.library.components.nameTable(Weave.library.components.blueprints);

/* text and status: the small widgets every other one is assembled from. */
Weave.library.components.icon = spec => Weave.library.components.build(Weave.library.components.parts.inline, 'icon', { text: Weave.library.components.textOf(spec, Weave.library.components.glyphKey), aria: { hidden: Weave.library.browser.keywords.true } });
Weave.library.components.glyphKey = 'glyph';
Weave.library.components.initials = text => Weave.library.composition.words(text).map(word => word.slice(0, 1).toUpperCase()).slice(0, 2).join(Weave.library.browser.keywords.empty);
Weave.library.components.portrait = spec => Weave.library.components.avatar({ text: Weave.library.components.initials(Weave.library.components.textOf(spec, Weave.library.components.nameKey)), aria: { label: spec.name } });
Weave.library.components.nameKey = 'name';
Weave.library.components.statTile = spec => Weave.library.components.build(Weave.library.components.parts.article, 'statTile', { children: [Weave.library.components.note({ text: spec.label }), Weave.library.components.value({ text: String(spec.value) })] });
Weave.library.components.emptyGlyph = spec => Weave.library.control.maybe(glyph => Weave.library.components.glyphMark({ text: glyph }))(spec.glyph);
Weave.library.components.emptyBody = spec => Weave.library.composition.compact([Weave.library.components.emptyGlyph(spec), Weave.library.components.subtitle({ text: Weave.library.components.titleOf(spec) }), Weave.library.components.note({ text: Weave.library.components.noteOf(spec) })]);
Weave.library.components.emptyState = spec => Weave.library.components.build(Weave.library.components.parts.box, 'emptyState', { children: Weave.library.components.emptyBody(spec) });
Weave.library.components.titleKey = 'title';
Weave.library.components.titleOf = spec => Weave.library.components.textOf(spec, Weave.library.components.titleKey);
Weave.library.components.roleAttribute = role => ({ [Weave.library.browser.keywords.role]: role });
Weave.library.components.namedAttribute = spec => ({ [Weave.library.browser.keywords.name]: spec.name });
Weave.library.components.noteKey = 'note';
Weave.library.components.noteOf = spec => Weave.library.components.textOf(spec, Weave.library.components.noteKey);
Weave.library.components.toast = spec => Weave.library.components.build(Weave.library.components.parts.box, 'toast', { text: spec.message, attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.status) });
Weave.library.components.progressBar = spec => Weave.library.components.build(Weave.library.components.parts.meter, 'progressBar', { data: Weave.library.components.toneData(spec), attributes: { [Weave.library.browser.keywords.value]: spec.value, max: spec.total } });

/* controls: every interactive leaf. The type table already exists, so a field never spells a type. */
Weave.library.components.placeholderAttribute = 'placeholder';
Weave.library.components.typeOf = spec => Weave.library.control.defaultTo(Weave.library.elements.inputTypes.text)(spec.type);
Weave.library.components.entryAttributes = spec => ({ [Weave.library.browser.keywords.type]: Weave.library.components.typeOf(spec), [Weave.library.components.placeholderAttribute]: spec.placeholder, [Weave.library.browser.keywords.value]: spec.value });
Weave.library.components.controlAttributes = spec => Weave.library.composition.merge(Weave.library.components.namedAttribute(spec), Weave.library.components.entryAttributes(spec));
Weave.library.components.controlAria = spec => Weave.library.composition.merge(Weave.library.components.labelAria(spec), Weave.library.control.defaultTo({})(spec.aria));
Weave.library.components.controlSpec = spec => ({ attributes: Weave.library.components.controlAttributes(spec), onEdit: spec.onEdit, onChoose: spec.onChoose, onPress: spec.onPress, aria: Weave.library.components.controlAria(spec) });
Weave.library.components.control = spec => Weave.library.components.build(Weave.library.components.parts.entry, 'control', Weave.library.components.controlSpec(spec));
Weave.library.components.fieldLabel = spec => Weave.library.components.build(Weave.library.components.parts.inline, 'fieldLabel', { text: Weave.library.components.textOf(spec, Weave.library.components.labelKey) });
Weave.library.components.labelKey = 'label';
Weave.library.components.field = spec => Weave.library.components.build(Weave.library.components.parts.label, 'field', { children: Weave.library.components.fieldItems(spec) });
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
Weave.library.components.checkProperties = spec => ({ [Weave.library.attributes.booleanAttributes.checked]: Weave.library.control.defaultTo(false)(spec.checked), [Weave.library.attributes.booleanAttributes.indeterminate]: Weave.library.control.defaultTo(false)(spec.partial) });
Weave.library.components.checkMark = spec => Weave.library.components.build(Weave.library.components.parts.checkbox, 'checkMark', { properties: Weave.library.components.checkProperties(spec), onChoose: spec.onChoose, aria: Weave.library.components.labelAria(spec) });
Weave.library.components.checkField = spec => Weave.library.components.build(Weave.library.components.parts.label, 'checkField', { children: [Weave.library.components.checkMark(spec), Weave.library.components.fieldLabel(spec)] });
Weave.library.components.searchAttributes = spec => Weave.library.composition.merge(Weave.library.components.namedAttribute(spec), { [Weave.library.components.placeholderAttribute]: Weave.library.control.defaultTo(spec.label)(spec.placeholder), [Weave.library.browser.keywords.value]: spec.value });
Weave.library.components.searchBox = spec => Weave.library.components.build(Weave.library.components.parts.search, 'searchBox', { attributes: Weave.library.components.searchAttributes(spec), onEdit: spec.onEdit, aria: Weave.library.components.labelAria(spec) });

/* groups: a widget that arranges other widgets. Each names one part and one class, nothing else. */
Weave.library.components.toolbarName = 'toolbar';
Weave.library.components.toolbar = spec => Weave.library.components.build(Weave.library.components.parts.box, Weave.library.components.toolbarName, { children: Weave.library.components.childrenOf(spec, Weave.library.components.itemsKey) });
Weave.library.components.itemsKey = 'items';
Weave.library.components.actionSpec = item => ({ text: item.label, onAction: item.onAction, aria: item.aria, attributes: { [Weave.library.browser.keywords.title]: item.hint } });
Weave.library.components.actionButton = item => Weave.library.components.button(Weave.library.composition.merge(Weave.library.components.marksOf(item), Weave.library.components.actionSpec(item)));
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
Weave.library.components.treeLabel = node => Weave.library.components.actionButton({ label: node.label, aria: node.aria, onAction: node.onAction });
Weave.library.components.treeBranch = node => Weave.library.control.maybe(nodes => Weave.library.components.tree({ nodes }))(node.children);
Weave.library.components.treeNode = node => Weave.library.components.item({ children: Weave.library.composition.compact([Weave.library.components.treeLabel(node), Weave.library.components.treeBranch(node)]) });
Weave.library.components.tree = spec => Weave.library.components.build(Weave.library.components.parts.list, 'tree', { children: spec.nodes.map(Weave.library.components.treeNode) });

/* table: one table function, driven by a column table the caller supplies. */
Weave.library.components.cellValue = (row, column) => Weave.library.control.defaultTo(Weave.library.composition.identity)(column.format)(row[column.key], row);
Weave.library.components.headerCell = column => Weave.library.components.build(Weave.library.components.parts.gridHeader, 'tableHeader', { text: column.label, onAction: column.onAction });
Weave.library.components.cellName = 'tableCell';
Weave.library.components.bodyCell = row => column => Weave.library.components.build(Weave.library.components.parts.gridCell, Weave.library.components.cellName, { children: [Weave.library.components.cellValue(row, column)] });
Weave.library.components.tableRow = children => Weave.library.components.build(Weave.library.components.parts.gridRow, 'tableRow', { children });
Weave.library.components.headerRow = columns => Weave.library.components.tableRow(columns.map(Weave.library.components.headerCell));
Weave.library.components.bodyRow = columns => row => Weave.library.components.tableRow(columns.map(Weave.library.components.bodyCell(row)));
Weave.library.components.tableHead = columns => Weave.library.components.build(Weave.library.components.parts.gridHead, 'tableHead', { children: [Weave.library.components.headerRow(columns)] });
Weave.library.components.tableBody = spec => Weave.library.components.build(Weave.library.components.parts.gridBody, 'tableBody', { children: spec.rows.map(Weave.library.components.bodyRow(spec.columns)) });
Weave.library.components.tableName = 'table';
Weave.library.components.gridOf = spec => Weave.library.components.build(Weave.library.components.parts.grid, Weave.library.components.tableName, { children: [Weave.library.components.tableHead(spec.columns), Weave.library.components.tableBody(spec)] });
Weave.library.components.table = spec => Weave.library.components.tableBox({ children: [Weave.library.components.gridOf(spec)] });

/* pages: a form, a dialog and a pager. The last widgets before a pattern starts composing them. */
Weave.library.components.submitAttributes = { [Weave.library.browser.keywords.type]: Weave.library.elements.inputTypes.submit };
Weave.library.components.submitButton = spec => Weave.library.components.button({ text: Weave.library.components.textOf(spec, Weave.library.components.submitKey), attributes: Weave.library.components.submitAttributes, variant: Weave.library.components.defaultVariant() });
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
Weave.library.components.tokens.edge = '#e2e6ee';
Weave.library.components.tokens.surface = '#ffffff';
Weave.library.components.tokens.sunken = '#f4f6fa';
Weave.library.components.tokens.accent = '#2563eb';
Weave.library.components.tokens.accentInk = Weave.library.components.tokens.surface;
Weave.library.components.tokens.danger = '#b00020';
Weave.library.components.tokens.font = 'system-ui, -apple-system, Segoe UI, sans-serif';
Weave.library.components.tokens.fontSize = '14px';
Weave.library.components.tokens.fontSizeLarge = '20px';
Weave.library.components.tokens.fontSizeSmall = '12px';
Weave.library.components.tokens.leading = '1.5';
Weave.library.components.tokens.shadow = '0 1px 2px rgba(17, 24, 39, 0.05), 0 4px 10px rgba(17, 24, 39, 0.04)';
Weave.library.components.tokens.tileTrack = 'repeat(auto-fit, minmax(210px, 1fr))';
Weave.library.components.tokens.railWidth = '220px';
Weave.library.components.tokens.controlHeight = '32px';
Weave.library.components.tokens.dotSize = '10px';
Weave.library.components.tokens.toneInfo = Weave.library.components.tokens.accent;
Weave.library.components.tokens.toneSuccess = '#127a56';
Weave.library.components.tokens.toneWarning = '#8a5a00';
Weave.library.components.tokens.toneDanger = Weave.library.components.tokens.danger;
Weave.library.components.tokens.toneQuiet = Weave.library.components.tokens.muted;
Weave.library.components.tokens.pulse = 'pulse 1s ease-in-out infinite alternate';
Weave.library.components.tokens.focusRing = '0 0 0 3px rgba(37, 99, 235, 0.35)';
Weave.library.components.tokens.press = 'translateY(1px)';
Weave.library.components.tokens.ease = 'all 120ms ease';
Weave.library.components.tokens.shadowLifted = '0 10px 30px rgba(17, 24, 39, 0.18)';
Weave.library.components.tokens.fontMono = 'ui-monospace, SFMono-Regular, Menlo, monospace';
Weave.library.components.tokens.compactWidth = '640px';
Weave.library.components.tokens.pageWidth = '1240px';
Weave.library.components.tokens.listWidth = '560px';
Weave.library.components.tokens.fontSizeDisplay = '28px';
Weave.library.components.tokens.tracking = '-0.01em';
Weave.library.components.tokens.radiusLarge = '18px';
Weave.library.components.tokens.radiusRound = '999px';
Weave.library.components.tokens.controlHeightSmall = '26px';
Weave.library.components.tokens.controlHeightLarge = '40px';
Weave.library.components.tokens.accentSoft = '#eef4ff';
Weave.library.components.tokens.shadowOverlay = '0 24px 60px rgba(17, 24, 39, 0.28)';
Weave.library.components.tokens.scrim = 'rgba(17, 24, 39, 0.45)';
Weave.library.components.tokens.layerSticky = '5';
Weave.library.components.tokens.layerOverlay = '900';
Weave.library.components.tokens.layerScrim = '10';
Weave.library.components.tokens.layerDrawer = '20';
Weave.library.components.tokens.layerDialog = '30';
Weave.library.components.tokens.layerPopover = '40';
Weave.library.components.tokens.layerToast = '50';
Weave.library.components.tokens.layerTip = '60';
Weave.library.components.tokens.dialogWidth = 'min(560px, calc(100% - 32px))';
Weave.library.components.tokens.dialogMaxHeight = 'min(80vh, 720px)';
Weave.library.components.tokens.drawerWidth = 'min(400px, 100%)';
Weave.library.components.tokens.sheetMaxHeight = '82vh';
Weave.library.components.tokens.popoverWidth = '200px';
Weave.library.components.tokens.toastWidth = 'min(360px, calc(100vw - 32px))';
Weave.library.components.tokens.tipWidth = '240px';
Weave.library.components.tokens.centreShift = 'translate(-50%, -50%)';
Weave.library.components.tokens.mediaRatio = '4 / 3';
Weave.library.components.tokens.cellWidth = '132px';
Weave.library.components.tokens.panelTrack = 'repeat(auto-fit, minmax(264px, 1fr))';
Weave.library.components.tokens.padSnug = '6px 12px';
Weave.library.components.tokens.tagWidth = '58px';
Weave.library.components.tokens.switchWidth = '34px';
Weave.library.components.tokens.switchHeight = '19px';
Weave.library.components.tokens.knobSize = '13px';
Weave.library.components.tokens.knobInset = '2px';
Weave.library.components.tokens.compactTrack = 'repeat(auto-fit, minmax(148px, 1fr))';
Weave.library.components.tokens.stampWidth = '84px';
Weave.library.components.tokens.bubbleWidth = 'min(560px, 84%)';
Weave.library.components.tokens.trackingWide = '0.08em';
Weave.library.components.tokens.glyphSize = '64px';
Weave.library.components.tokens.mediaWash = 'linear-gradient(145deg, #fdf0e3, #ffe6ea 52%, #e7efff)';
Weave.library.components.tokens.accentSoftInk = '#1d4ed8';
Weave.library.components.variablePrefix = '--weave-';
Weave.library.components.variableName = name => Weave.library.components.variablePrefix + Weave.library.composition.kebabCase(name);
Weave.library.components.variableOpen = 'var(';
Weave.library.components.variableUse = (value, name) => Weave.library.components.variableOpen + Weave.library.components.variableName(name) + Weave.library.composition.closeParen;
Weave.library.components.vars = {};
Weave.library.components.tokens.columnTrack = 'repeat(12, minmax(0, 1fr))';
Weave.library.components.tokens.spanFull = 'span 12';
Weave.library.components.tokens.spanHalf = 'span 6';
Weave.library.components.tokens.spanThird = 'span 4';
Weave.library.components.tokens.spanTwoThirds = 'span 8';
Weave.library.components.tokens.spanQuarter = 'span 3';
Weave.library.components.tokens.spanThreeQuarters = 'span 9';
Weave.library.components.tokens.spinnerSize = Weave.library.components.tokens.spaceLoose;
Weave.library.components.tokens.spin = 'spin 700ms linear infinite';
Weave.library.components.tokens.turnStart = 'rotate(0turn)';
Weave.library.components.tokens.turnEnd = 'rotate(1turn)';
Weave.library.components.tokens.termTrack = 'auto 1fr';
Weave.library.components.tokens.trackingCode = '0.3em';
Weave.library.components.tokens.ratioWide = '16 / 9';
Weave.library.components.tokens.ratioSquare = '1 / 1';
Weave.library.components.tokens.ratioTall = '3 / 4';
Weave.library.components.tokens.wideWidth = '1100px';
Weave.library.components.tokens.gateWidth = '380px';
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
Weave.library.components.values.end = 'flex-end';
Weave.library.components.values.fixed = 'fixed';
Weave.library.components.values.absolute = 'absolute';
Weave.library.components.values.relative = 'relative';
Weave.library.components.values.sticky = 'sticky';
Weave.library.components.values.clip = 'hidden';
Weave.library.components.values.contents = 'contents';
Weave.library.components.values.half = '50%';
Weave.library.components.values.heavy = '700';
Weave.library.components.values.ellipsis = 'ellipsis';
Weave.library.components.values.nowrap = 'nowrap';
Weave.library.components.values.cover = 'cover';
Weave.library.components.values.stretch = 'stretch';
Weave.library.components.values.preWrap = 'pre-wrap';
Weave.library.components.values.uppercase = 'uppercase';
Weave.library.components.values.top = 'top';
Weave.library.components.values.right = 'right';
Weave.library.components.values.fit = 'fit-content';
Weave.library.components.values.inherited = 'currentColor';
Weave.library.components.values.blank = '""';
Weave.library.components.values.underline = 'underline';
Weave.library.components.values.inlineBlock = 'inline-block';
Weave.library.components.values.snapX = 'x mandatory';
Weave.library.components.borders = {};
Weave.library.components.borders.hairline = Weave.library.components.vars.line + Weave.library.components.values.solid + Weave.library.components.vars.edge;
Weave.library.components.borders.accentLine = Weave.library.components.vars.line + Weave.library.components.values.solid + Weave.library.components.vars.accent;
Weave.library.components.borders.spinnerRing = Weave.library.components.vars.line + Weave.library.components.values.solid + Weave.library.components.vars.muted;
Weave.library.components.borders.quoteEdge = Weave.library.components.vars.spaceTight + Weave.library.components.values.solid + Weave.library.components.vars.edge;

/* rules: the only place a component look is written. One row per class, values are token references. */
Weave.library.components.rules = {};
Weave.library.components.rules.page = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceLoose, padding: Weave.library.components.vars.spaceLoose, maxWidth: Weave.library.components.vars.pageWidth, margin: Weave.library.components.values.auto };
Weave.library.components.rules.holder = { display: Weave.library.components.values.contents };
Weave.library.components.rules.view = { fontFamily: Weave.library.components.vars.font, fontSize: Weave.library.components.vars.fontSize, lineHeight: Weave.library.components.vars.leading, color: Weave.library.components.vars.ink };
Weave.library.components.rules.panel = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.space, padding: Weave.library.components.vars.spaceLoose, background: Weave.library.components.vars.surface, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radius, flexGrow: Weave.library.components.values.grow };
Weave.library.components.rules.stack = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.space };
Weave.library.components.rules.row = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.space, alignItems: Weave.library.components.values.center, flexWrap: Weave.library.components.values.wrap };
Weave.library.components.rules.spread = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.space, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.between, flexWrap: Weave.library.components.values.wrap };
Weave.library.components.rules.tiles = { display: Weave.library.components.values.grid, gap: Weave.library.components.vars.spaceLoose, gridTemplateColumns: Weave.library.components.vars.tileTrack };
Weave.library.components.rules.panels = { display: Weave.library.components.values.grid, gap: Weave.library.components.vars.spaceLoose, gridTemplateColumns: Weave.library.components.vars.panelTrack, alignItems: Weave.library.components.values.stretch };
Weave.library.components.rules.split = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceLoose, alignItems: Weave.library.components.values.start };
Weave.library.components.rules.scroller = { overflow: Weave.library.components.values.auto, flexGrow: Weave.library.components.values.grow, minHeight: Weave.library.components.values.zero };
Weave.library.components.rules.divider = { borderTop: Weave.library.components.borders.hairline, margin: Weave.library.components.vars.space };
Weave.library.components.rules.card = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight, padding: Weave.library.components.vars.spaceLoose, background: Weave.library.components.vars.surface, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radius, boxShadow: Weave.library.components.vars.shadow };
Weave.library.components.rules.title = { margin: Weave.library.components.values.zero, fontSize: Weave.library.components.vars.fontSizeLarge, fontWeight: Weave.library.components.values.heavy, letterSpacing: Weave.library.components.vars.tracking };
Weave.library.components.rules.subtitle = { margin: Weave.library.components.values.zero, fontSize: Weave.library.components.vars.fontSize, fontWeight: Weave.library.components.values.heavy, letterSpacing: Weave.library.components.vars.tracking };
Weave.library.components.rules.note = { margin: Weave.library.components.values.zero, color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.text = { margin: Weave.library.components.values.zero, whiteSpace: Weave.library.components.values.preWrap };
Weave.library.components.rules.sectionLabel = { margin: Weave.library.components.values.zero, color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall, fontWeight: Weave.library.components.values.heavy, letterSpacing: Weave.library.components.vars.trackingWide, textTransform: Weave.library.components.values.uppercase };
Weave.library.components.rules.bubble = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight, padding: Weave.library.components.vars.padSnug, background: Weave.library.components.vars.sunken, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radius, maxWidth: Weave.library.components.vars.bubbleWidth, alignSelf: Weave.library.components.values.start };
Weave.library.components.rules.value = { fontSize: Weave.library.components.vars.fontSizeDisplay, fontWeight: Weave.library.components.values.heavy, letterSpacing: Weave.library.components.vars.tracking };
Weave.library.components.rules.tag = { display: Weave.library.components.values.inlineFlex, width: Weave.library.components.values.fit, justifyContent: Weave.library.components.values.center, minWidth: Weave.library.components.vars.tagWidth, padding: Weave.library.components.vars.spaceTight, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.sunken, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.pill = { display: Weave.library.components.values.inlineFlex, width: Weave.library.components.values.fit, padding: Weave.library.components.vars.spaceTight, borderRadius: Weave.library.components.vars.radius, background: Weave.library.components.vars.accent, color: Weave.library.components.vars.accentInk, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.avatar = { display: Weave.library.components.values.inlineFlex, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.center, width: Weave.library.components.vars.controlHeight, height: Weave.library.components.vars.controlHeight, borderRadius: Weave.library.components.values.full, background: Weave.library.components.vars.sunken, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.button = { minHeight: Weave.library.components.vars.controlHeight, padding: Weave.library.components.vars.padSnug, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.surface, color: Weave.library.components.vars.ink, cursor: Weave.library.components.values.pointer, fontFamily: Weave.library.components.vars.font, fontSize: Weave.library.components.vars.fontSize };
Weave.library.components.rules.anchor = { color: Weave.library.components.vars.accent, fontWeight: Weave.library.components.values.bold, textDecoration: Weave.library.components.values.none };
Weave.library.components.rules.itemList = { listStyle: Weave.library.components.values.none, margin: Weave.library.components.values.zero, padding: Weave.library.components.values.zero, display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.field = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.fieldLabel = { color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.control = { background: Weave.library.components.vars.surface, color: Weave.library.components.vars.ink, minHeight: Weave.library.components.vars.controlHeight, padding: Weave.library.components.vars.padSnug, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, fontFamily: Weave.library.components.vars.font, fontSize: Weave.library.components.vars.fontSize , maxWidth: Weave.library.components.values.full , minWidth: Weave.library.components.values.zero };
Weave.library.components.rules.textArea = { background: Weave.library.components.vars.surface, color: Weave.library.components.vars.ink, padding: Weave.library.components.vars.space, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, fontFamily: Weave.library.components.vars.font , maxWidth: Weave.library.components.values.full };
Weave.library.components.rules.selectBox = { background: Weave.library.components.vars.surface, color: Weave.library.components.vars.ink, minHeight: Weave.library.components.vars.controlHeight, padding: Weave.library.components.vars.padSnug, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, fontFamily: Weave.library.components.vars.font , maxWidth: Weave.library.components.values.full };
Weave.library.components.rules.searchBox = { background: Weave.library.components.vars.surface, color: Weave.library.components.vars.ink, minHeight: Weave.library.components.vars.controlHeight, padding: Weave.library.components.vars.padSnug, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radius, fontFamily: Weave.library.components.vars.font, width: Weave.library.components.values.full };
Weave.library.components.rules.checkField = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceTight, alignItems: Weave.library.components.values.center };
Weave.library.components.rules.table = { width: Weave.library.components.values.full, borderCollapse: Weave.library.components.values.collapse, fontSize: Weave.library.components.vars.fontSize };
Weave.library.components.rules.tableHeader = { textAlign: Weave.library.components.values.left, padding: Weave.library.components.vars.space, borderBottom: Weave.library.components.borders.hairline, color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.tableCell = { padding: Weave.library.components.vars.space, borderBottom: Weave.library.components.borders.hairline, verticalAlign: Weave.library.components.values.top };
Weave.library.components.rules.toolbar = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceTight, flexWrap: Weave.library.components.values.wrap, alignItems: Weave.library.components.values.center };
Weave.library.components.rules.menu = { listStyle: Weave.library.components.values.none, margin: Weave.library.components.values.zero, padding: Weave.library.components.vars.spaceTight, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radius, background: Weave.library.components.vars.surface, boxShadow: Weave.library.components.vars.shadow };
Weave.library.components.rules.tabs = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceTight, borderBottom: Weave.library.components.borders.hairline };
Weave.library.components.rules.tab = { padding: Weave.library.components.vars.space, border: Weave.library.components.values.none, background: Weave.library.components.values.transparent, cursor: Weave.library.components.values.pointer, fontFamily: Weave.library.components.vars.font, fontSize: Weave.library.components.vars.fontSize };
Weave.library.components.rules.breadcrumb = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.space, fontSize: Weave.library.components.vars.fontSizeSmall, flexWrap: Weave.library.components.values.wrap };
Weave.library.components.rules.tree = { listStyle: Weave.library.components.values.none, margin: Weave.library.components.values.zero, paddingLeft: Weave.library.components.vars.spaceLoose };
Weave.library.components.rules.disclosure = { border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, padding: Weave.library.components.vars.space };
Weave.library.components.rules.disclosureSummary = { cursor: Weave.library.components.values.pointer, fontWeight: Weave.library.components.values.bold };
Weave.library.components.rules.accordion = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.modal = { border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radius, padding: Weave.library.components.vars.spaceWide, boxShadow: Weave.library.components.vars.shadowLifted };
Weave.library.components.rules.toast = { padding: Weave.library.components.vars.space, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.sunken, border: Weave.library.components.borders.hairline };
Weave.library.components.rules.statTile = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight, padding: Weave.library.components.vars.spaceLoose, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radius, background: Weave.library.components.vars.surface };
Weave.library.components.rules.emptyState = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.center, gap: Weave.library.components.vars.spaceTight, padding: Weave.library.components.vars.spaceWide, textAlign: Weave.library.components.values.center, color: Weave.library.components.vars.muted };
Weave.library.components.rules.glyphMark = { fontSize: Weave.library.components.vars.glyphSize, lineHeight: Weave.library.components.values.one };
Weave.library.components.rules.progressBar = { display: Weave.library.components.values.block, width: Weave.library.components.values.full, height: Weave.library.components.vars.space, appearance: Weave.library.components.values.none, border: Weave.library.components.values.none, borderRadius: Weave.library.components.vars.radiusRound, background: Weave.library.components.vars.sunken, color: Weave.library.components.vars.accent };
Weave.library.components.rules.swatch = { display: Weave.library.components.values.inlineFlex, width: Weave.library.components.vars.controlHeightLarge, height: Weave.library.components.vars.controlHeight, borderRadius: Weave.library.components.vars.radiusSmall, border: Weave.library.components.borders.hairline };
Weave.library.components.rules.pagination = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.pageButton = { minWidth: Weave.library.components.vars.controlHeight, minHeight: Weave.library.components.vars.controlHeight, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.surface, cursor: Weave.library.components.values.pointer };
Weave.library.components.rules.rail = { width: Weave.library.components.vars.railWidth, borderRight: Weave.library.components.borders.hairline, paddingRight: Weave.library.components.vars.space, display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.space };
Weave.library.components.rules.pageHeader = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.between, gap: Weave.library.components.vars.space, paddingBottom: Weave.library.components.vars.space, borderBottom: Weave.library.components.borders.hairline };
Weave.library.components.rules.pageFooter = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.between, gap: Weave.library.components.vars.space, paddingTop: Weave.library.components.vars.space, borderTop: Weave.library.components.borders.hairline, color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.body = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceLoose, flexGrow: Weave.library.components.values.grow };
Weave.library.components.rules.listRow = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, gap: Weave.library.components.vars.space };
Weave.library.components.rules.code = { display: Weave.library.components.values.block, overflowX: Weave.library.components.values.auto, padding: Weave.library.components.vars.padSnug, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.sunken, color: Weave.library.components.vars.muted, fontFamily: Weave.library.components.vars.fontMono, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.tableBox = { overflowX: Weave.library.components.values.auto, minWidth: Weave.library.components.values.zero, maxWidth: Weave.library.components.values.full };
Weave.library.components.rules.dataRow = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, gap: Weave.library.components.vars.space, width: Weave.library.components.values.full, borderBottom: Weave.library.components.borders.hairline };
Weave.library.components.rules.timestamp = { color: Weave.library.components.vars.muted, minWidth: Weave.library.components.vars.stampWidth, textAlign: Weave.library.components.values.right, fontSize: Weave.library.components.vars.fontSizeSmall, whiteSpace: Weave.library.components.values.nowrap, flexShrink: Weave.library.components.values.zero };

/* states: the only place a pseudo class or a state attribute is written. One row, one selector suffix. */
Weave.library.components.states = {};
Weave.library.components.states.hover = ':hover';
Weave.library.components.states.focus = ':focus-visible';
Weave.library.components.states.pressed = ':active';
Weave.library.components.states.off = ':disabled';
Weave.library.components.states.invalid = '[aria-invalid="true"]';
Weave.library.components.states.chosen = '[aria-selected="true"]';
Weave.library.components.states.here = '[aria-current="true"]';
Weave.library.components.states.over = '[data-over="true"]';
Weave.library.components.states.track = '::-webkit-progress-bar';
Weave.library.components.states.filled = '::-webkit-progress-value';
Weave.library.components.states.on = '[aria-checked="true"]';
Weave.library.components.states.knob = '::after';
Weave.library.components.states.knobOn = '[aria-checked="true"]::after';

/* stateNames: the same states as names, in the order the sheet emits them. A later row wins the cascade. */
Weave.library.components.stateNames = {};
Weave.library.composition.defineEach(Weave.library.components.stateNames, (selector, name) => name)(Weave.library.components.states);
Weave.library.components.stateRank = row => Weave.library.composition.keys(Weave.library.components.stateNames).indexOf(row.state);
Weave.library.components.stateRules = {};
Weave.library.components.stateRules.tabChosen = { name: 'tab', state: 'chosen', style: { borderBottom: Weave.library.components.borders.accentLine, color: Weave.library.components.vars.accent } };
Weave.library.components.stateRules.pageHere = { name: 'pageButton', state: 'here', style: { background: Weave.library.components.vars.accent, color: Weave.library.components.vars.accentInk } };
Weave.library.components.stateRules.cardHover = { name: 'card', state: 'hover', style: { boxShadow: Weave.library.components.vars.shadowLifted } };
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
Weave.library.components.stateTexts = () => Weave.library.composition.sortBy(Weave.library.components.stateRank)(Weave.library.composition.values(Weave.library.components.stateRules)).map(Weave.library.components.stateText);
Weave.library.components.styleText = () => [Weave.library.components.rootText()].concat(Weave.library.components.ruleTexts(), Weave.library.components.stateTexts(), Weave.library.components.extraTexts()).join('\n');
Weave.library.components.addStyleSheet = () => Weave.library.elements.append([Weave.library.elements.style({ text: Weave.library.components.styleText() })])(Weave.library.browser.head());
Weave.library.components.installStyles = Weave.library.control.once(Weave.library.components.addStyleSheet);

/* calendar day: the one piece a month grid needs, keyed by the state names the sheet already owns. */
Weave.library.components.dayName = 'dayButton';
Weave.library.components.dayMarks = spec => ({ current: String(spec.here === true), selected: String(spec.chosen === true) });
Weave.library.components.daySpec = spec => ({ text: spec.label, onAction: spec.onAction, aria: Weave.library.components.dayMarks(spec), data: { key: spec.key } });
Weave.library.components.dayButton = spec => Weave.library.components.build(Weave.library.components.parts.button, Weave.library.components.dayName, Weave.library.components.daySpec(spec));
Weave.library.components.rules.dayButton = { width: Weave.library.components.values.full, minHeight: Weave.library.components.vars.controlHeight, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.surface, color: Weave.library.components.vars.ink, cursor: Weave.library.components.values.pointer, fontFamily: Weave.library.components.vars.font, fontSize: Weave.library.components.vars.fontSize };
Weave.library.components.stateRules.dayChosen = { name: Weave.library.components.dayName, state: Weave.library.components.stateNames.chosen, style: { background: Weave.library.components.vars.accent, color: Weave.library.components.vars.accentInk } };
Weave.library.components.stateRules.dayHere = { name: Weave.library.components.dayName, state: Weave.library.components.stateNames.here, style: { borderColor: Weave.library.components.vars.accent, fontWeight: Weave.library.components.values.bold } };
/* themes: one row per theme, each a table of token overrides. A theme row may only name token keys. */
Weave.library.components.themes = {};
Weave.library.components.themes.dark = { mediaWash: 'linear-gradient(145deg, #1d2836, #24202c 52%, #182234)', accentSoft: '#16233c', accentSoftInk: '#bcd0ff', ink: '#e8ecf3', muted: '#9aa4b2', edge: '#2b3442', surface: '#0f1722', sunken: '#172130', accent: '#7aa2ff', accentInk: '#0b1220', shadow: '0 1px 2px rgba(0, 0, 0, 0.5)', shadowLifted: '0 10px 30px rgba(0, 0, 0, 0.6)', focusRing: '0 0 0 3px rgba(122, 162, 255, 0.45)' };

/* themeNames: the only place a theme name is written. Every theme call takes a row from here. */
Weave.library.components.themeNames = {};
Weave.library.components.themeNames.dark = 'dark';
Weave.library.components.themeNames.light = 'light';
Weave.library.components.themeNames.contrast = 'contrast';
Weave.library.components.themeNames.dusk = 'dusk';

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
Weave.library.components.tones.quiet = Weave.library.components.vars.toneQuiet;

/* toneRules: one row per toned class, saying how that class spends the tone colour it is given. */
Weave.library.components.toneSpends = {};
Weave.library.components.toneSpends.outline = colour => ({ borderColor: colour, color: colour });
Weave.library.components.toneSpends.fill = colour => ({ background: colour });
Weave.library.components.toneSpends.ink = colour => ({ color: colour });
Weave.library.components.toneSpends.edge = colour => ({ borderLeftColor: colour });
Weave.library.components.toneSpends.cap = colour => ({ borderTopColor: colour });
Weave.library.components.toneRules = {};
Weave.library.components.toneRules.alert = Weave.library.components.toneSpends.outline;
Weave.library.components.toneRules.statusDot = Weave.library.components.toneSpends.fill;
Weave.library.components.toneRules.progressBar = Weave.library.components.toneSpends.ink;
Weave.library.components.toneKey = 'tone';
Weave.library.components.toneNames = {};
Weave.library.composition.defineEach(Weave.library.components.toneNames, (colour, name) => name)(Weave.library.components.tones);
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
Weave.library.components.alertNote = spec => Weave.library.components.note({ text: Weave.library.components.noteOf(spec) });
Weave.library.components.alertAction = spec => Weave.library.control.maybe(Weave.library.components.actionButton)(spec.action);
Weave.library.components.alertFooterRows = spec => Weave.library.composition.compact([Weave.library.components.alertAction(spec), Weave.library.components.alertClose(spec)]);
Weave.library.components.alertFooter = spec => Weave.library.control.either(rows => rows.length > 0, rows => Weave.library.components.actions({ children: rows }), Weave.library.composition.noop)(Weave.library.components.alertFooterRows(spec));
Weave.library.components.alertBody = spec => Weave.library.composition.compact([Weave.library.components.alertTitle(spec), Weave.library.components.alertNote(spec), Weave.library.components.alertFooter(spec)]);
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
Weave.library.components.rules.alert = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight, padding: Weave.library.components.vars.spaceLoose, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radius, background: Weave.library.components.vars.surface };
Weave.library.components.rules.statusDot = { display: Weave.library.components.values.inlineFlex, width: Weave.library.components.vars.dotSize, height: Weave.library.components.vars.dotSize, borderRadius: Weave.library.components.values.full, background: Weave.library.components.vars.muted };
Weave.library.components.rules.badge = { display: Weave.library.components.values.inlineFlex, width: Weave.library.components.values.fit, justifyContent: Weave.library.components.values.center, minWidth: Weave.library.components.vars.spaceLoose, padding: Weave.library.components.vars.spaceTight, borderRadius: Weave.library.components.vars.radiusRound, background: Weave.library.components.vars.accent, color: Weave.library.components.vars.accentInk, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.kbd = { display: Weave.library.components.values.inlineFlex, gap: Weave.library.components.vars.spaceTight, alignItems: Weave.library.components.values.center };
Weave.library.components.rules.keyCap = { padding: Weave.library.components.vars.spaceTight, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.sunken, fontSize: Weave.library.components.vars.fontSizeSmall, fontFamily: Weave.library.components.vars.fontMono };
Weave.library.components.rules.skeleton = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.skeletonLine = { height: Weave.library.components.vars.space, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.vars.sunken, animation: Weave.library.components.vars.pulse };
Weave.library.components.rules.avatarGroup = { display: Weave.library.components.values.inlineFlex, gap: Weave.library.components.vars.spaceTight, alignItems: Weave.library.components.values.center };
Weave.library.components.rules.switchField = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.space, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.between };
Weave.library.components.rules.switchControl = { position: Weave.library.components.values.relative, flexShrink: Weave.library.components.values.zero, width: Weave.library.components.vars.switchWidth, height: Weave.library.components.vars.switchHeight, padding: Weave.library.components.values.zero, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusRound, background: Weave.library.components.vars.sunken, cursor: Weave.library.components.values.pointer };
Weave.library.components.rules.sliderField = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.sliderControl = { width: Weave.library.components.values.full };
Weave.library.components.rules.stepperField = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.dropdown = { border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, padding: Weave.library.components.vars.space };
Weave.library.components.rules.tooltip = { display: Weave.library.components.values.inlineFlex, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.tooltipTarget = { borderBottom: Weave.library.components.borders.hairline, cursor: Weave.library.components.values.pointer };

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
Weave.library.components.interactive.rowButton = 'rowButton';

/* pressable: the interactive classes that answer a pointer by moving. One row, one class already named. */
Weave.library.components.pressable = {};
Weave.library.components.pressable.button = Weave.library.components.interactive.button;
Weave.library.components.pressable.tab = Weave.library.components.interactive.tab;
Weave.library.components.pressable.pageButton = Weave.library.components.interactive.pageButton;
Weave.library.components.pressable.dayButton = Weave.library.components.interactive.dayButton;
Weave.library.components.pressable.switchControl = Weave.library.components.interactive.switchControl;
Weave.library.components.pressable.rowButton = Weave.library.components.interactive.rowButton;
Weave.library.components.stateRules.linkHover = { name: Weave.library.components.interactive.anchor, state: Weave.library.components.stateNames.hover, style: { textDecoration: Weave.library.components.values.underline } };
Weave.library.components.progressName = 'progressBar';
Weave.library.components.switchName = 'switchControl';
Weave.library.components.stateRules.switchOn = { name: Weave.library.components.switchName, state: Weave.library.components.stateNames.on, style: { background: Weave.library.components.vars.accent, borderColor: Weave.library.components.vars.accent } };
Weave.library.components.stateRules.switchKnob = { name: Weave.library.components.switchName, state: Weave.library.components.stateNames.knob, style: { content: Weave.library.components.values.blank, position: Weave.library.components.values.absolute, top: Weave.library.components.vars.knobInset, left: Weave.library.components.vars.knobInset, width: Weave.library.components.vars.knobSize, height: Weave.library.components.vars.knobSize, borderRadius: Weave.library.components.values.full, background: Weave.library.components.vars.surface, boxShadow: Weave.library.components.vars.shadow } };
Weave.library.components.stateRules.switchKnobOn = { name: Weave.library.components.switchName, state: Weave.library.components.stateNames.knobOn, style: { left: Weave.library.components.values.auto, right: Weave.library.components.vars.knobInset } };
Weave.library.components.stateRules.progressTrack = { name: Weave.library.components.progressName, state: Weave.library.components.stateNames.track, style: { background: Weave.library.components.vars.sunken, borderRadius: Weave.library.components.vars.radiusRound } };
Weave.library.components.stateRules.progressFilled = { name: Weave.library.components.progressName, state: Weave.library.components.stateNames.filled, style: { background: Weave.library.components.values.inherited, borderRadius: Weave.library.components.vars.radiusRound } };
Weave.library.components.stateRules.buttonChosen = { name: Weave.library.components.interactive.button, state: Weave.library.components.stateNames.chosen, style: { background: Weave.library.components.vars.accentSoft, borderColor: Weave.library.components.vars.accentSoft, color: Weave.library.components.vars.accentSoftInk } };
Weave.library.components.stateRules.rowChosen = { name: Weave.library.components.interactive.rowButton, state: Weave.library.components.stateNames.chosen, style: { background: Weave.library.components.vars.accentSoft, color: Weave.library.components.vars.accentSoftInk } };

/* state styles: one style per state, generated onto every class the two tables above name. */
Weave.library.components.focusStyle = { outline: Weave.library.components.borders.accentLine, outlineOffset: Weave.library.components.vars.line, boxShadow: Weave.library.components.vars.focusRing };
Weave.library.components.offStyle = { opacity: Weave.library.components.values.faded, cursor: Weave.library.components.values.notAllowed };
Weave.library.components.pressedStyle = { transform: Weave.library.components.vars.press };
Weave.library.components.hoverStyle = { borderColor: Weave.library.components.vars.accent, background: Weave.library.components.vars.accentSoft };
Weave.library.components.focusRule = name => ({ name, state: Weave.library.components.stateNames.focus, style: Weave.library.components.focusStyle });
Weave.library.components.offRule = name => ({ name, state: Weave.library.components.stateNames.off, style: Weave.library.components.offStyle });
Weave.library.components.pressedRule = name => ({ name, state: Weave.library.components.stateNames.pressed, style: Weave.library.components.pressedStyle });
Weave.library.components.hoverRule = name => ({ name, state: Weave.library.components.stateNames.hover, style: Weave.library.components.hoverStyle });
Weave.library.composition.defineEachPrefixed(Weave.library.components.stateRules, Weave.library.components.stateNames.focus, Weave.library.components.focusRule)(Weave.library.components.interactive);
Weave.library.components.notDisableable = [Weave.library.components.interactive.anchor, Weave.library.components.interactive.disclosureSummary];
Weave.library.components.disableable = Weave.library.composition.omit(Weave.library.components.notDisableable)(Weave.library.components.interactive);
Weave.library.composition.defineEachPrefixed(Weave.library.components.stateRules, Weave.library.components.stateNames.off, Weave.library.components.offRule)(Weave.library.components.disableable);
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
Weave.library.components.mediaRules.compact = { query: Weave.library.components.breakpoints.compact, rules: { rail: { width: Weave.library.components.values.full, borderRight: Weave.library.components.values.none }, tiles: { gridTemplateColumns: Weave.library.components.vars.compactTrack }, pageHeader: { flexWrap: Weave.library.components.values.wrap, alignItems: Weave.library.components.values.start }, panel: { padding: Weave.library.components.vars.space }, panels: { gridTemplateColumns: Weave.library.components.values.full }, split: { flexDirection: Weave.library.components.values.column }, table: { fontSize: Weave.library.components.vars.fontSizeSmall }, modal: { padding: Weave.library.components.vars.spaceLoose }, page: { padding: Weave.library.components.vars.space } } };
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
Weave.library.components.defaultVariant = () => Weave.library.composition.first(Weave.library.composition.keys(Weave.library.components.variants));
Weave.library.components.buttonSelector = () => Weave.library.components.classSelector(Weave.library.components.interactive.button);
Weave.library.components.liftStyle = { boxShadow: Weave.library.components.vars.shadowLifted };
Weave.library.components.variantHoverStyle = style => Weave.library.composition.merge(style, Weave.library.components.liftStyle);
Weave.library.components.variantSelector = variant => Weave.library.components.buttonSelector() + Weave.library.components.markSelector(Weave.library.components.variantName, variant);
Weave.library.components.variantHoverText = ([variant, style]) => Weave.library.components.blockFor(Weave.library.components.variantSelector(variant) + Weave.library.components.states.hover, Weave.library.components.variantHoverStyle(style));
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


/* overlay rules: the only place the system positions anything. One host, and a ladder inside it. */
Weave.library.components.rules.overlayHost = { position: Weave.library.components.values.fixed, inset: Weave.library.components.values.zero, zIndex: Weave.library.components.vars.layerOverlay, pointerEvents: Weave.library.components.values.none };
Weave.library.components.rules.scrim = { position: Weave.library.components.values.fixed, inset: Weave.library.components.values.zero, background: Weave.library.components.vars.scrim, zIndex: Weave.library.components.vars.layerScrim, pointerEvents: Weave.library.components.values.auto };
Weave.library.components.rules.dialogBox = { position: Weave.library.components.values.fixed, left: Weave.library.components.values.half, top: Weave.library.components.values.half, transform: Weave.library.components.vars.centreShift, width: Weave.library.components.vars.dialogWidth, maxHeight: Weave.library.components.vars.dialogMaxHeight, overflowY: Weave.library.components.values.auto, zIndex: Weave.library.components.vars.layerDialog, pointerEvents: Weave.library.components.values.auto, background: Weave.library.components.vars.surface, borderRadius: Weave.library.components.vars.radiusLarge, boxShadow: Weave.library.components.vars.shadowOverlay, padding: Weave.library.components.vars.spaceWide, display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceLoose };
Weave.library.components.rules.drawerBox = { position: Weave.library.components.values.fixed, top: Weave.library.components.values.zero, right: Weave.library.components.values.zero, bottom: Weave.library.components.values.zero, width: Weave.library.components.vars.drawerWidth, zIndex: Weave.library.components.vars.layerDrawer, pointerEvents: Weave.library.components.values.auto, background: Weave.library.components.vars.surface, boxShadow: Weave.library.components.vars.shadowOverlay, padding: Weave.library.components.vars.spaceLoose, display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.space, overflowY: Weave.library.components.values.auto };
Weave.library.components.rules.sheetBox = { position: Weave.library.components.values.fixed, left: Weave.library.components.values.zero, right: Weave.library.components.values.zero, bottom: Weave.library.components.values.zero, maxHeight: Weave.library.components.vars.sheetMaxHeight, zIndex: Weave.library.components.vars.layerDrawer, pointerEvents: Weave.library.components.values.auto, background: Weave.library.components.vars.surface, borderTopLeftRadius: Weave.library.components.vars.radiusLarge, borderTopRightRadius: Weave.library.components.vars.radiusLarge, boxShadow: Weave.library.components.vars.shadowOverlay, padding: Weave.library.components.vars.spaceLoose, display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.space, overflowY: Weave.library.components.values.auto };
Weave.library.components.rules.popoverBox = { position: Weave.library.components.values.absolute, minWidth: Weave.library.components.vars.popoverWidth, zIndex: Weave.library.components.vars.layerPopover, pointerEvents: Weave.library.components.values.auto, background: Weave.library.components.vars.surface, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radius, boxShadow: Weave.library.components.vars.shadowOverlay, padding: Weave.library.components.vars.spaceTight, display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.toastHost = { position: Weave.library.components.values.fixed, right: Weave.library.components.vars.spaceLoose, bottom: Weave.library.components.vars.spaceLoose, width: Weave.library.components.vars.toastWidth, zIndex: Weave.library.components.vars.layerToast, pointerEvents: Weave.library.components.values.none, display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.space };
Weave.library.components.rules.toastSlot = { pointerEvents: Weave.library.components.values.auto };
Weave.library.components.rules.actions = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.space, justifyContent: Weave.library.components.values.end, flexWrap: Weave.library.components.values.wrap };
Weave.library.components.rules.tipBubble = { position: Weave.library.components.values.absolute, maxWidth: Weave.library.components.vars.tipWidth, zIndex: Weave.library.components.vars.layerTip, pointerEvents: Weave.library.components.values.none, background: Weave.library.components.vars.ink, color: Weave.library.components.vars.surface, padding: Weave.library.components.vars.spaceTight, borderRadius: Weave.library.components.vars.radiusSmall, fontSize: Weave.library.components.vars.fontSizeSmall, boxShadow: Weave.library.components.vars.shadowLifted };
Weave.library.components.rules.shell = { position: Weave.library.components.values.fixed, inset: Weave.library.components.values.zero, display: Weave.library.components.values.flex, background: Weave.library.components.vars.sunken, overflow: Weave.library.components.values.clip };
Weave.library.components.rules.pane = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, minWidth: Weave.library.components.values.zero, minHeight: Weave.library.components.values.zero, overflowY: Weave.library.components.values.auto, background: Weave.library.components.vars.surface, borderRight: Weave.library.components.borders.hairline, padding: Weave.library.components.vars.spaceLoose, gap: Weave.library.components.vars.space };
Weave.library.components.rules.rowButton = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, gap: Weave.library.components.vars.space, width: Weave.library.components.values.full, padding: Weave.library.components.vars.spaceTight, border: Weave.library.components.values.none, borderRadius: Weave.library.components.vars.radiusSmall, background: Weave.library.components.values.transparent, color: Weave.library.components.vars.ink, cursor: Weave.library.components.values.pointer, textAlign: Weave.library.components.values.left, fontFamily: Weave.library.components.vars.font, fontSize: Weave.library.components.vars.fontSize };
Weave.library.components.rules.strong = { fontWeight: Weave.library.components.values.heavy };
Weave.library.components.rules.sticky = { position: Weave.library.components.values.sticky, top: Weave.library.components.values.zero, zIndex: Weave.library.components.vars.layerSticky, background: Weave.library.components.vars.surface };

/* layout utilities: the three rules every dense list needs, so an application never writes them. */
Weave.library.components.rules.display = { margin: Weave.library.components.values.zero, fontSize: Weave.library.components.vars.fontSizeDisplay, fontWeight: Weave.library.components.values.heavy, letterSpacing: Weave.library.components.vars.tracking };
Weave.library.components.rules.truncate = { display: Weave.library.components.values.block, overflow: Weave.library.components.values.clip, textOverflow: Weave.library.components.values.ellipsis, whiteSpace: Weave.library.components.values.nowrap, minWidth: Weave.library.components.values.zero, flexShrink: Weave.library.components.values.grow };
Weave.library.components.rules.fill = { flexGrow: Weave.library.components.values.grow, minWidth: Weave.library.components.values.zero, display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };

/* sizes: one row per control size, spent as a data attribute exactly as a variant is. */
Weave.library.components.sizes = {};
Weave.library.components.sizes.small = { minHeight: Weave.library.components.vars.controlHeightSmall, padding: Weave.library.components.vars.spaceTight, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.sizes.large = { minHeight: Weave.library.components.vars.controlHeightLarge, padding: Weave.library.components.vars.spaceLoose, fontSize: Weave.library.components.vars.fontSizeLarge };

/* paneSizes: how wide each pane of an application shell is. One row per pane, spent as a data attribute. */
Weave.library.components.paneSizes = {};
Weave.library.components.paneSizes.rail = { width: Weave.library.components.vars.railWidth, flexShrink: Weave.library.components.values.zero };
Weave.library.components.paneSizes.list = { width: Weave.library.components.vars.listWidth, flexShrink: Weave.library.components.values.zero };
Weave.library.components.paneSizes.main = { flexGrow: Weave.library.components.values.grow };

/* modifiers: the only place a data attribute that restyles a class is named. One row per attribute. */
Weave.library.components.variantName = 'variant';
Weave.library.components.modifiers = {};
Weave.library.components.modifiers.variant = { on: Weave.library.components.interactive.button, styles: Weave.library.components.variants };
Weave.library.components.modifiers.size = { on: Weave.library.components.interactive.button, styles: Weave.library.components.sizes };
Weave.library.components.modifiers.pane = { on: 'pane', styles: Weave.library.components.paneSizes };
Weave.library.components.cellSizes = {};
Weave.library.components.cellSizes.fixed = { width: Weave.library.components.vars.cellWidth, flexShrink: Weave.library.components.values.zero };
Weave.library.components.cellSizes.grow = { flexGrow: Weave.library.components.values.grow, flexBasis: Weave.library.components.values.zero };
Weave.library.components.modifiers.cell = { on: 'truncate', styles: Weave.library.components.cellSizes };
Weave.library.components.bubbleSides = {};
Weave.library.components.bubbleSides.their = { alignSelf: Weave.library.components.values.start, background: Weave.library.components.vars.sunken };
Weave.library.components.bubbleSides.own = { alignSelf: Weave.library.components.values.end, background: Weave.library.components.vars.accentSoft, borderColor: Weave.library.components.vars.accentSoft };
Weave.library.components.modifiers.side = { on: 'bubble', styles: Weave.library.components.bubbleSides };
Weave.library.components.markSelector = (key, value) => Weave.library.query.dataSelector(key, value);
Weave.library.components.markTarget = row => Weave.library.control.defaultTo(Weave.library.browser.keywords.empty)(Weave.library.control.maybe(inner => Weave.library.browser.keywords.space + Weave.library.components.classSelector(inner))(row.within));
Weave.library.components.markHost = (row, key, value) => name => Weave.library.components.classSelector(name) + Weave.library.components.markSelector(key, value) + Weave.library.components.markTarget(row);
Weave.library.components.markSelectorFor = (row, key, value) => Weave.library.composition.listOf(row.on).map(Weave.library.components.markHost(row, key, value)).join(Weave.library.components.selectorJoin);
Weave.library.components.markBlock = (row, key) => ([value, style]) => Weave.library.components.blockFor(Weave.library.components.markSelectorFor(row, key, value), style);
Weave.library.components.markRow = ([key, row]) => Weave.library.composition.pairs(row.styles).map(Weave.library.components.markBlock(row, key));
Weave.library.components.markTexts = () => Weave.library.composition.pairs(Weave.library.components.modifiers).flatMap(Weave.library.components.markRow);
Weave.library.components.markData = key => spec => Weave.library.control.defaultTo({})(Weave.library.control.maybe(value => ({ [key]: value }))(spec[key]));
Weave.library.components.markKeys = () => Weave.library.composition.keys(Weave.library.components.modifiers).concat([Weave.library.components.toneKey]);
Weave.library.components.marksOf = spec => Weave.library.composition.mergeAll(Weave.library.components.markKeys().map(key => Weave.library.components.markData(key)(spec)));

/* markNames: every modifier value as a name, so an application asks for one by name and never by string. */
Weave.library.components.markNames = {};
/* modifiers, second wave: the spacing, alignment and shape a caller asks for by name on any spec. */
Weave.library.components.mediaName = 'media';
Weave.library.components.columnSpans = {};
Weave.library.components.columnSpans.full = { gridColumn: Weave.library.components.vars.spanFull };
Weave.library.components.columnSpans.half = { gridColumn: Weave.library.components.vars.spanHalf };
Weave.library.components.columnSpans.third = { gridColumn: Weave.library.components.vars.spanThird };
Weave.library.components.columnSpans.twoThirds = { gridColumn: Weave.library.components.vars.spanTwoThirds };
Weave.library.components.columnSpans.quarter = { gridColumn: Weave.library.components.vars.spanQuarter };
Weave.library.components.columnSpans.threeQuarters = { gridColumn: Weave.library.components.vars.spanThreeQuarters };
Weave.library.components.gaps = {};
Weave.library.components.gaps.none = { gap: Weave.library.components.values.zero };
Weave.library.components.gaps.tight = { gap: Weave.library.components.vars.spaceTight };
Weave.library.components.gaps.loose = { gap: Weave.library.components.vars.spaceWide };
Weave.library.components.aligns = {};
Weave.library.components.aligns.start = { alignItems: Weave.library.components.values.start };
Weave.library.components.aligns.centre = { alignItems: Weave.library.components.values.center };
Weave.library.components.aligns.end = { alignItems: Weave.library.components.values.end };
Weave.library.components.pads = {};
Weave.library.components.pads.none = { padding: Weave.library.components.values.zero };
Weave.library.components.pads.snug = { padding: Weave.library.components.vars.space };
Weave.library.components.pads.wide = { padding: Weave.library.components.vars.spaceWide };
Weave.library.components.shapes = {};
Weave.library.components.shapes.soft = { borderRadius: Weave.library.components.vars.radiusLarge };
Weave.library.components.shapes.pill = { borderRadius: Weave.library.components.vars.radiusRound };
Weave.library.components.shapes.square = { borderRadius: Weave.library.components.values.zero };
Weave.library.components.widths = {};
Weave.library.components.widths.full = { width: Weave.library.components.values.full };
Weave.library.components.widths.fit = { width: Weave.library.components.values.fit };
Weave.library.components.widths.wide = { maxWidth: Weave.library.components.vars.wideWidth };
Weave.library.components.widths.gate = { maxWidth: Weave.library.components.vars.gateWidth, marginLeft: Weave.library.components.values.auto, marginRight: Weave.library.components.values.auto };
Weave.library.components.ratios = {};
Weave.library.components.ratios.wide = { aspectRatio: Weave.library.components.vars.ratioWide };
Weave.library.components.ratios.square = { aspectRatio: Weave.library.components.vars.ratioSquare };
Weave.library.components.ratios.tall = { aspectRatio: Weave.library.components.vars.ratioTall };
Weave.library.components.cellLooks = {};
Weave.library.components.cellLooks.bordered = { border: Weave.library.components.borders.hairline };
Weave.library.components.cellLooks.snug = { padding: Weave.library.components.vars.spaceTight };
Weave.library.components.cellLooks.roomy = { padding: Weave.library.components.vars.spaceLoose };
Weave.library.components.spreadClasses = [Weave.library.components.classNames.stack, Weave.library.components.classNames.row, Weave.library.components.classNames.spread, Weave.library.components.classNames.tiles, Weave.library.components.classNames.columns, Weave.library.components.toolbarName, Weave.library.components.classNames.itemList];
Weave.library.components.boxClasses = [Weave.library.components.classNames.panel, Weave.library.components.classNames.card, Weave.library.components.classNames.page, Weave.library.components.classNames.pane, Weave.library.components.classNames.bannerBox];
Weave.library.components.controlClasses = [Weave.library.components.classNames.button, Weave.library.components.interactive.control, Weave.library.components.interactive.searchBox, Weave.library.components.interactive.selectBox, Weave.library.components.classNames.anchor, Weave.library.components.classNames.inputGroupBox, Weave.library.components.classNames.buttonGroupBox];
Weave.library.components.shapeClasses = [Weave.library.components.classNames.button, Weave.library.components.classNames.tag, Weave.library.components.classNames.avatar, Weave.library.components.classNames.card, Weave.library.components.classNames.panel, Weave.library.components.mediaName];
Weave.library.components.modifiers.gap = { on: Weave.library.components.spreadClasses, styles: Weave.library.components.gaps };
Weave.library.components.modifiers.align = { on: Weave.library.components.spreadClasses, styles: Weave.library.components.aligns };
Weave.library.components.modifiers.pad = { on: Weave.library.components.boxClasses, styles: Weave.library.components.pads };
Weave.library.components.modifiers.shape = { on: Weave.library.components.shapeClasses, styles: Weave.library.components.shapes };
Weave.library.components.modifiers.width = { on: Weave.library.components.controlClasses, styles: Weave.library.components.widths };
Weave.library.components.modifiers.ratio = { on: Weave.library.components.mediaName, styles: Weave.library.components.ratios };
Weave.library.components.modifiers.span = { on: Weave.library.components.classNames.column, styles: Weave.library.components.columnSpans };
Weave.library.components.modifiers.grid = { on: Weave.library.components.tableName, within: Weave.library.components.cellName, styles: Weave.library.components.cellLooks };

/* variants, second wave: the rest of the intents a button is ever asked for, each still one row of overrides. */
Weave.library.components.variants.soft = { background: Weave.library.components.vars.accentSoft, borderColor: Weave.library.components.vars.accentSoft, color: Weave.library.components.vars.accentSoftInk };
Weave.library.components.variants.outline = { background: Weave.library.components.values.transparent, borderColor: Weave.library.components.vars.accent, color: Weave.library.components.vars.accent };
Weave.library.components.variants.link = { background: Weave.library.components.values.transparent, borderColor: Weave.library.components.values.transparent, color: Weave.library.components.vars.accent, textDecoration: Weave.library.components.values.underline };
Weave.library.components.variants.good = { background: Weave.library.components.vars.toneSuccess, borderColor: Weave.library.components.vars.toneSuccess, color: Weave.library.components.vars.accentInk };
Weave.library.components.variants.warn = { background: Weave.library.components.vars.toneWarning, borderColor: Weave.library.components.vars.toneWarning, color: Weave.library.components.vars.accentInk };
Weave.library.composition.defineEach(Weave.library.components.markNames, row => Weave.library.components.nameTable(row.styles))(Weave.library.components.modifiers);

/* media: a picture box that looks right before, during and after the picture arrives. */
Weave.library.components.lazyLoading = 'lazy';
Weave.library.components.loadingAttribute = 'loading';
Weave.library.components.altAttribute = 'alt';
Weave.library.components.altText = spec => Weave.library.components.textOf(spec, Weave.library.components.altAttribute);
Weave.library.components.imageAttributes = spec => ({ [Weave.library.browser.keywords.src]: spec.src, [Weave.library.components.altAttribute]: Weave.library.components.altText(spec), [Weave.library.components.loadingAttribute]: Weave.library.components.lazyLoading });
Weave.library.components.image = spec => Weave.library.components.build(Weave.library.components.parts.picture, 'image', { attributes: Weave.library.components.imageAttributes(spec) });
Weave.library.components.mediaPicture = spec => Weave.library.control.maybe(() => Weave.library.components.image(spec))(spec.src);
Weave.library.components.mediaGlyph = spec => Weave.library.control.maybe(glyph => Weave.library.components.icon({ glyph }))(spec.glyph);
Weave.library.components.mediaParts = spec => Weave.library.composition.compact([Weave.library.components.mediaPicture(spec), Weave.library.components.mediaGlyph(spec)]);
Weave.library.components.media = spec => Weave.library.components.build(Weave.library.components.parts.media, Weave.library.components.mediaName, { children: Weave.library.components.mediaParts(spec), aria: Weave.library.components.labelAria(spec) });
Weave.library.components.rules.media = { position: Weave.library.components.values.relative, display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.center, aspectRatio: Weave.library.components.vars.mediaRatio, margin: Weave.library.components.values.zero, borderRadius: Weave.library.components.vars.radius, background: Weave.library.components.vars.mediaWash, overflow: Weave.library.components.values.clip, fontSize: Weave.library.components.vars.glyphSize };
Weave.library.components.rules.image = { width: Weave.library.components.values.full, height: Weave.library.components.values.full, objectFit: Weave.library.components.values.cover, display: Weave.library.components.values.block };

/* choices: one radio set, so a spec names a group of options and never a tag or an input type. */
Weave.library.components.radioAttributes = spec => ({ [Weave.library.browser.keywords.name]: spec.group, [Weave.library.browser.keywords.value]: spec.value });
Weave.library.components.radioProperties = spec => ({ [Weave.library.attributes.booleanAttributes.checked]: Weave.library.control.defaultTo(false)(spec.checked) });
Weave.library.components.radioMark = spec => Weave.library.components.build(Weave.library.components.parts.radio, 'radioMark', { attributes: Weave.library.components.radioAttributes(spec), properties: Weave.library.components.radioProperties(spec), onChoose: spec.onChoose });
Weave.library.components.choicePicked = (spec, option) => event => spec.onChoose(option.value, event);
Weave.library.components.choiceSpec = (spec, option) => Weave.library.composition.merge(option, { group: spec.name, checked: option.value === spec.value, onChoose: Weave.library.components.choicePicked(spec, option) });
Weave.library.components.choiceRow = (spec, option) => [Weave.library.components.radioMark(Weave.library.components.choiceSpec(spec, option)), Weave.library.components.fieldLabel(option), Weave.library.components.fill({}), Weave.library.components.note({ text: option.note })];
Weave.library.components.choiceField = spec => option => Weave.library.components.build(Weave.library.components.parts.label, 'choiceField', { children: Weave.library.components.choiceRow(spec, option) });
Weave.library.components.choiceParts = spec => [Weave.library.components.choiceLegend({ text: Weave.library.components.textOf(spec, Weave.library.components.labelKey) })].concat(spec.options.map(Weave.library.components.choiceField(spec)));
Weave.library.components.choices = spec => Weave.library.components.build(Weave.library.components.parts.group, 'choices', { children: Weave.library.components.choiceParts(spec) });
Weave.library.components.rules.choices = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight, border: Weave.library.components.values.none, margin: Weave.library.components.values.zero, padding: Weave.library.components.values.zero };
Weave.library.components.rules.choiceGroup = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight, border: Weave.library.components.values.none, padding: Weave.library.components.values.zero };
Weave.library.components.rules.choiceLegend = { color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall, padding: Weave.library.components.values.zero };
Weave.library.components.rules.choiceField = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, gap: Weave.library.components.vars.space, padding: Weave.library.components.vars.spaceTight, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, cursor: Weave.library.components.values.pointer };

/* steps: a track that says where in a sequence the reader is. The current step is the only marked one. */
Weave.library.components.stepDot = position => Weave.library.components.statusDot({ tone: Weave.library.components.stepTone(position) });
Weave.library.components.stepTone = position => Weave.library.control.either(() => position, () => Weave.library.components.toneNames.success, () => Weave.library.components.toneNames.info)(position);
Weave.library.components.stepSpec = (spec, label, index) => ({ children: [Weave.library.components.stepDot(index <= spec.active), Weave.library.components.note({ text: label })], aria: { current: String(index === spec.active) } });
Weave.library.components.stepItem = spec => (label, index) => Weave.library.components.build(Weave.library.components.parts.listItem, 'step', Weave.library.components.stepSpec(spec, label, index));
Weave.library.components.stepItems = spec => Weave.library.components.childrenOf(spec, Weave.library.components.itemsKey).map(Weave.library.components.stepItem(spec));
Weave.library.components.steps = spec => Weave.library.components.build(Weave.library.components.parts.list, 'steps', { children: Weave.library.components.stepItems(spec), aria: Weave.library.components.labelAria(spec) });
Weave.library.components.rules.steps = { listStyle: Weave.library.components.values.none, margin: Weave.library.components.values.zero, padding: Weave.library.components.values.zero, display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceLoose, flexWrap: Weave.library.components.values.wrap, alignItems: Weave.library.components.values.center };
Weave.library.components.rules.step = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, gap: Weave.library.components.vars.spaceTight, color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.tabBar = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceTight, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.between, padding: Weave.library.components.vars.spaceTight, background: Weave.library.components.vars.surface, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radius };
Weave.library.components.rules.fieldError = { color: Weave.library.components.vars.danger, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.errorSpec = spec => ({ text: Weave.library.components.textOf(spec, Weave.library.components.textKey), attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.alert) });
Weave.library.components.fieldError = spec => Weave.library.components.build(Weave.library.components.parts.inline, 'fieldError', Weave.library.components.errorSpec(spec));
Weave.library.components.stateRules.stepHere = { name: 'step', state: Weave.library.components.stateNames.here, style: { color: Weave.library.components.vars.ink, fontWeight: Weave.library.components.values.heavy } };
Weave.library.components.stateRules.controlInvalid = { name: Weave.library.components.interactive.control, state: Weave.library.components.stateNames.invalid, style: { borderColor: Weave.library.components.vars.danger } };
Weave.library.components.pinnedToBottom = { position: Weave.library.components.values.fixed, left: Weave.library.components.values.zero, right: Weave.library.components.values.zero, bottom: Weave.library.components.values.zero, zIndex: Weave.library.components.vars.layerSticky, borderRadius: Weave.library.components.values.zero };
Weave.library.components.mediaRules.compact.rules.tabBar = Weave.library.components.pinnedToBottom;

/* nestRules: the only place a rule about one class inside another is written. One row, one pair. */
Weave.library.components.nestRules = {};
Weave.library.components.nestRules.panelInPanel = { outers: ['panel', 'dialogBox', 'drawerBox', 'sheetBox'], inner: 'panel', style: { border: Weave.library.components.values.none, borderRadius: Weave.library.components.values.zero, padding: Weave.library.components.values.zero, background: Weave.library.components.values.transparent } };
Weave.library.components.quietRowStyle = { display: Weave.library.components.values.flex, width: Weave.library.components.values.full, justifyContent: Weave.library.components.values.start, borderColor: Weave.library.components.values.transparent };
Weave.library.components.nestRules.quietRows = { outers: ['menu', 'tree'], inner: 'button', style: Weave.library.components.quietRowStyle };
Weave.library.components.nestRules.cardInCard = { outers: ['card'], inner: 'card', style: { border: Weave.library.components.values.none, boxShadow: Weave.library.components.values.none, padding: Weave.library.components.values.zero, background: Weave.library.components.values.transparent } };
Weave.library.components.nestPair = row => outer => Weave.library.components.classSelector(outer) + Weave.library.browser.keywords.space + Weave.library.components.classSelector(row.inner);
Weave.library.components.nestSelector = row => row.outers.map(Weave.library.components.nestPair(row)).join(Weave.library.components.selectorJoin);
Weave.library.components.nestText = ([ignored, row]) => Weave.library.components.blockFor(Weave.library.components.nestSelector(row), row.style);
Weave.library.components.nestTexts = () => Weave.library.composition.pairs(Weave.library.components.nestRules).map(Weave.library.components.nestText);

/* densities: a theme for measurements rather than colours, switched by its own attribute the same way. */
Weave.library.components.densities = {};
Weave.library.components.densities.snug = { space: '6px', spaceTight: '3px', spaceLoose: '12px', spaceWide: '18px', controlHeight: '28px', fontSize: '13px', fontSizeSmall: '11px' };
Weave.library.components.densities.roomy = { space: '10px', spaceTight: '5px', spaceLoose: '20px', spaceWide: '32px', controlHeight: '40px', fontSize: '16px', fontSizeSmall: '14px' };
Weave.library.components.densityAttribute = 'data-density';
Weave.library.components.densitySelector = name => Weave.library.components.rootSelector + Weave.library.query.attributeSelector(Weave.library.components.densityAttribute, name);
Weave.library.components.densityText = ([name, overrides]) => Weave.library.components.blockFor(Weave.library.components.densitySelector(name), Weave.library.components.themeStyle(overrides));
Weave.library.components.densityTexts = () => Weave.library.composition.pairs(Weave.library.components.densities).map(Weave.library.components.densityText);
Weave.library.components.densityNames = Weave.library.components.nameTable(Weave.library.components.densities);
Weave.library.components.setDensity = name => Weave.library.attributes.setAttribute(Weave.library.components.densityAttribute, name)(Weave.library.browser.documentElement());

/* sheetExtras: the only place the blocks after the plain rules are listed. One row, one block maker. */
Weave.library.components.schemeTexts = () => [Weave.library.components.schemeText()];
Weave.library.components.sheetExtras = {};
Weave.library.components.sheetExtras.hosts = Weave.library.components.hostTexts;
Weave.library.components.sheetExtras.nests = Weave.library.components.nestTexts;
Weave.library.components.sheetExtras.themes = Weave.library.components.themeTexts;
Weave.library.components.sheetExtras.scheme = Weave.library.components.schemeTexts;
Weave.library.components.sheetExtras.ease = Weave.library.components.easeTexts;
Weave.library.components.sheetExtras.tones = Weave.library.components.toneTexts;
Weave.library.components.sheetExtras.marks = Weave.library.components.markTexts;
Weave.library.components.sheetExtras.variantHovers = Weave.library.components.variantHoverTexts;
Weave.library.components.sheetExtras.keyframes = Weave.library.components.keyframesTexts;
Weave.library.components.sheetExtras.densities = Weave.library.components.densityTexts;
Weave.library.components.sheetExtras.media = Weave.library.components.mediaTexts;
Weave.library.components.extraTexts = () => Weave.library.composition.values(Weave.library.components.sheetExtras).flatMap(make => make());

/* elements, third wave: the Bootstrap shaped pieces a page reaches for before it reaches for a pattern. */
Weave.library.components.rowsKey = 'rows';
Weave.library.components.actionsKey = 'actions';
Weave.library.components.busyLabel = 'Loading';
Weave.library.components.rowsOf = spec => Weave.library.components.childrenOf(spec, Weave.library.components.rowsKey);
Weave.library.components.itemsOf = spec => Weave.library.components.childrenOf(spec, Weave.library.components.itemsKey);
Weave.library.components.actionRow = spec => Weave.library.control.maybe(rows => Weave.library.components.row({ children: rows.map(Weave.library.components.actionButton) }))(spec.actions);
Weave.library.components.lineOf = row => Weave.library.control.maybe(words => Weave.library.components.note({ text: words }))(row.note);
Weave.library.components.headingOf = row => Weave.library.components.strong({ text: Weave.library.components.textOf(row, Weave.library.components.labelKey) });
Weave.library.components.twoLines = row => Weave.library.composition.compact([Weave.library.components.headingOf(row), Weave.library.components.lineOf(row)]);

/* grid: a twelve column track and the spans a caller names, so a layout never writes a width of its own. */
Weave.library.components.rules.columns = { display: Weave.library.components.values.grid, gap: Weave.library.components.vars.spaceLoose, gridTemplateColumns: Weave.library.components.vars.columnTrack };
Weave.library.components.rules.column = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.space, minWidth: Weave.library.components.values.zero, gridColumn: Weave.library.components.vars.spanFull };

/* navbar: a brand, the links beside it and whatever the page does on the far side. */
Weave.library.components.navbarBrand = spec => Weave.library.components.brand({ text: Weave.library.components.titleOf(spec) });
Weave.library.components.linkTarget = item => ({ [Weave.library.browser.keywords.href]: Weave.library.control.defaultTo(Weave.library.components.hashHref)(item.href) });
Weave.library.components.hereMark = item => ({ current: String(item.active === true) });
Weave.library.components.navLink = item => Weave.library.components.anchor({ text: item.label, attributes: Weave.library.components.linkTarget(item), onAction: item.onAction, aria: Weave.library.components.hereMark(item) });
Weave.library.components.navLinks = spec => Weave.library.components.row({ children: Weave.library.components.itemsOf(spec).map(Weave.library.components.navLink) });
Weave.library.components.navbarParts = spec => Weave.library.composition.compact([Weave.library.components.navbarBrand(spec), Weave.library.components.navLinks(spec), Weave.library.components.actionRow(spec)]);
Weave.library.components.navbar = spec => Weave.library.components.navbarBox({ children: Weave.library.components.navbarParts(spec), aria: { label: Weave.library.components.titleOf(spec) } });
Weave.library.components.rules.navbarBox = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, gap: Weave.library.components.vars.spaceLoose, padding: Weave.library.components.vars.space, background: Weave.library.components.vars.surface, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radius, flexWrap: Weave.library.components.values.wrap };
Weave.library.components.rules.brand = { fontSize: Weave.library.components.vars.fontSizeLarge, fontWeight: Weave.library.components.values.heavy, letterSpacing: Weave.library.components.vars.tracking };

/* listGroup: rows that look like one object. A row with an action is a button, a row without one is not. */
Weave.library.components.groupChoice = item => Weave.library.components.rowButton({ children: Weave.library.components.twoLines(item), onAction: item.onAction, aria: { selected: String(item.active === true) } });
Weave.library.components.groupLines = item => Weave.library.components.fill({ children: Weave.library.components.twoLines(item) });
Weave.library.components.groupContent = item => Weave.library.control.either(() => Weave.library.predicates.isFunction(item.onAction), () => Weave.library.components.groupChoice(item), () => Weave.library.components.groupLines(item))(item);
Weave.library.components.groupAside = item => Weave.library.composition.compact([Weave.library.components.groupContent(item), item.aside]);
Weave.library.components.groupItem = item => Weave.library.components.groupRow({ children: Weave.library.components.groupAside(item), data: { key: item.key } });
Weave.library.components.listGroup = spec => Weave.library.components.groupList({ children: Weave.library.components.itemsOf(spec).map(Weave.library.components.groupItem) });
Weave.library.components.rules.groupList = { listStyle: Weave.library.components.values.none, margin: Weave.library.components.values.zero, padding: Weave.library.components.values.zero, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radius, background: Weave.library.components.vars.surface, overflow: Weave.library.components.values.clip };
Weave.library.components.rules.groupRow = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, gap: Weave.library.components.vars.space, padding: Weave.library.components.vars.space, borderBottom: Weave.library.components.borders.hairline };

/* inputGroup: a control with a word welded to one or both ends, the way a price or a domain reads. */
Weave.library.components.addonOf = words => Weave.library.control.maybe(value => Weave.library.components.addon({ text: value }))(words);
Weave.library.components.inputGroupParts = spec => Weave.library.composition.compact([Weave.library.components.addonOf(spec.prefix), Weave.library.components.control(spec), Weave.library.components.addonOf(spec.suffix)]);
Weave.library.components.inputGroupRow = spec => Weave.library.components.inputGroupBox({ children: Weave.library.components.inputGroupParts(spec) });
Weave.library.components.inputGroup = spec => Weave.library.components.build(Weave.library.components.parts.label, 'inputGroup', { children: [Weave.library.components.fieldLabel(spec), Weave.library.components.inputGroupRow(spec)] });
Weave.library.components.rules.inputGroup = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.inputGroupBox = { maxWidth: Weave.library.components.values.full, display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.stretch, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, overflow: Weave.library.components.values.clip, background: Weave.library.components.vars.surface };
Weave.library.components.rules.addon = { display: Weave.library.components.values.inlineFlex, alignItems: Weave.library.components.values.center, padding: Weave.library.components.vars.padSnug, background: Weave.library.components.vars.sunken, color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall, whiteSpace: Weave.library.components.values.nowrap };

/* buttonGroup and segmented: buttons welded into one control, and the same control answering a choice. */
Weave.library.components.buttonGroup = spec => Weave.library.components.buttonGroupBox({ children: Weave.library.components.itemsOf(spec).map(Weave.library.components.actionButton) });
Weave.library.components.segmentPick = (spec, item) => () => spec.onPick(item.key);
Weave.library.components.segmentSpec = spec => item => Weave.library.composition.merge(item, { aria: { selected: String(item.key === spec.active) }, onAction: Weave.library.components.segmentPick(spec, item) });
Weave.library.components.segmented = spec => Weave.library.components.buttonGroup({ items: Weave.library.components.itemsOf(spec).map(Weave.library.components.segmentSpec(spec)) });
Weave.library.components.rules.buttonGroupBox = { display: Weave.library.components.values.inlineFlex, alignItems: Weave.library.components.values.center, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, overflow: Weave.library.components.values.clip, width: Weave.library.components.values.fit };

/* spinner: the one busy mark, so nothing in the system spells an animation twice. */
Weave.library.components.busyAria = spec => ({ label: Weave.library.control.defaultTo(Weave.library.components.busyLabel)(spec.label), busy: Weave.library.browser.keywords.true });
Weave.library.components.spinner = spec => Weave.library.components.spinnerMark({ aria: Weave.library.components.busyAria(spec), attributes: Weave.library.components.roleAttribute(Weave.library.accessibility.roles.status) });
Weave.library.components.keyframes.spin = { from: { transform: Weave.library.components.vars.turnStart }, to: { transform: Weave.library.components.vars.turnEnd } };
Weave.library.components.rules.spinnerMark = { display: Weave.library.components.values.inlineBlock, width: Weave.library.components.vars.spinnerSize, height: Weave.library.components.vars.spinnerSize, borderRadius: Weave.library.components.values.full, border: Weave.library.components.borders.spinnerRing, borderTopColor: Weave.library.components.vars.accent, animation: Weave.library.components.vars.spin };

/* descriptions: a table of label and value that is not a grid, the shape a summary pane takes. */
Weave.library.components.termOf = row => Weave.library.components.term({ text: row.label });
Weave.library.components.definitionOf = row => Weave.library.components.definition({ text: String(row.value) });
Weave.library.components.descriptionPair = row => [Weave.library.components.termOf(row), Weave.library.components.definitionOf(row)];
Weave.library.components.descriptions = spec => Weave.library.components.termsBox({ children: Weave.library.components.rowsOf(spec).flatMap(Weave.library.components.descriptionPair) });
Weave.library.components.rules.termsBox = { display: Weave.library.components.values.grid, gridTemplateColumns: Weave.library.components.vars.termTrack, gap: Weave.library.components.vars.spaceTight, margin: Weave.library.components.values.zero };
Weave.library.components.rules.term = { color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.definition = { margin: Weave.library.components.values.zero, fontWeight: Weave.library.components.values.bold };

/* quote: a line somebody said, with the person who said it under it. */
Weave.library.components.quoteCredit = spec => Weave.library.control.maybe(who => Weave.library.components.credit({ text: who }))(spec.who);
Weave.library.components.quoteParts = spec => Weave.library.composition.compact([Weave.library.components.text({ text: Weave.library.components.textOf(spec, Weave.library.components.textKey) }), Weave.library.components.quoteCredit(spec)]);
Weave.library.components.quote = spec => Weave.library.components.quoteBox({ children: Weave.library.components.quoteParts(spec) });
Weave.library.components.rules.quoteBox = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight, margin: Weave.library.components.values.zero, paddingLeft: Weave.library.components.vars.spaceLoose, borderLeft: Weave.library.components.borders.quoteEdge };
Weave.library.components.rules.credit = { color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };

/* banner: the loud strip at the top of a page, toned like everything else that speaks. */
Weave.library.components.bannerParts = spec => Weave.library.composition.compact([Weave.library.components.display({ text: Weave.library.components.titleOf(spec) }), Weave.library.components.note({ text: Weave.library.components.noteOf(spec) }), Weave.library.components.actionRow(spec)]);
Weave.library.components.banner = spec => Weave.library.components.bannerBox({ children: Weave.library.components.bannerParts(spec), data: Weave.library.components.toneData(spec) });
Weave.library.components.rules.bannerBox = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.space, padding: Weave.library.components.vars.spaceWide, borderRadius: Weave.library.components.vars.radiusLarge, background: Weave.library.components.vars.accentSoft, color: Weave.library.components.vars.accentSoftInk, borderLeft: Weave.library.components.borders.accentLine };

/* rating: a score out of the one count the system keeps, drawn from the two glyphs it keeps beside it. */
Weave.library.components.starCount = 5;
Weave.library.components.stars = {};
Weave.library.components.stars.on = '★';
Weave.library.components.stars.off = '☆';
Weave.library.components.starGlyph = isFilled => Weave.library.control.either(Weave.library.composition.identity, () => Weave.library.components.stars.on, () => Weave.library.components.stars.off)(isFilled);
Weave.library.components.starFor = spec => index => Weave.library.components.icon({ glyph: Weave.library.components.starGlyph(index < spec.value) });
Weave.library.components.ratingTotal = spec => Weave.library.control.defaultTo(Weave.library.components.starCount)(spec.total);
Weave.library.components.ratingLabel = spec => String(spec.value) + Weave.library.components.ratingJoin + String(Weave.library.components.ratingTotal(spec));
Weave.library.components.ratingJoin = ' of ';
Weave.library.components.rating = spec => Weave.library.components.ratingBox({ children: Weave.library.composition.range(Weave.library.components.ratingTotal(spec)).map(Weave.library.components.starFor(spec)), aria: { label: Weave.library.components.ratingLabel(spec) } });
Weave.library.components.rules.ratingBox = { display: Weave.library.components.values.inlineFlex, gap: Weave.library.components.vars.spaceTight, color: Weave.library.components.vars.toneWarning, letterSpacing: Weave.library.components.vars.tracking };

/* chip: a tag you can take off again, for the filters a reader has already chosen. */
Weave.library.components.chipClose = spec => Weave.library.control.maybe(run => Weave.library.components.actionButton({ label: Weave.library.components.closeLabel, size: Weave.library.components.markNames.size.small, variant: Weave.library.components.quietVariant(), onAction: run }))(spec.onRemove);
Weave.library.components.quietVariant = () => Weave.library.composition.keys(Weave.library.components.variants)[1];
Weave.library.components.chipParts = spec => Weave.library.composition.compact([Weave.library.components.tag({ text: Weave.library.components.textOf(spec, Weave.library.components.textKey) }), Weave.library.components.chipClose(spec)]);
Weave.library.components.chip = spec => Weave.library.components.chipBox({ children: Weave.library.components.chipParts(spec), data: Weave.library.components.toneData(spec) });
Weave.library.components.rules.chipBox = { display: Weave.library.components.values.inlineFlex, alignItems: Weave.library.components.values.center, gap: Weave.library.components.vars.spaceTight, padding: Weave.library.components.vars.spaceTight, borderRadius: Weave.library.components.vars.radiusRound, border: Weave.library.components.borders.hairline, background: Weave.library.components.vars.surface };

/* timeline: what happened and when, one row each, the time held to one side of the rail. */
Weave.library.components.momentParts = row => [Weave.library.components.timestamp({ text: row.when }), Weave.library.components.fill({ children: Weave.library.components.twoLines(row) })];
Weave.library.components.momentOf = row => Weave.library.components.timelineRow({ children: Weave.library.components.momentParts(row), data: { key: row.key } });
Weave.library.components.timeline = spec => Weave.library.components.timelineList({ children: Weave.library.components.itemsOf(spec).map(Weave.library.components.momentOf) });
Weave.library.components.rules.timelineList = { listStyle: Weave.library.components.values.none, margin: Weave.library.components.values.zero, padding: Weave.library.components.values.zero, display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.space };
Weave.library.components.rules.timelineRow = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.start, gap: Weave.library.components.vars.space, paddingLeft: Weave.library.components.vars.space, borderLeft: Weave.library.components.borders.hairline };

/* cards, second wave: the header and footer a card grows when it carries more than a paragraph. */
Weave.library.components.rules.cardHead = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.between, gap: Weave.library.components.vars.space, paddingBottom: Weave.library.components.vars.space, borderBottom: Weave.library.components.borders.hairline };
Weave.library.components.rules.cardFoot = { display: Weave.library.components.values.flex, alignItems: Weave.library.components.values.center, justifyContent: Weave.library.components.values.between, gap: Weave.library.components.vars.space, paddingTop: Weave.library.components.vars.space, borderTop: Weave.library.components.borders.hairline, color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.hint = { color: Weave.library.components.vars.muted, fontSize: Weave.library.components.vars.fontSizeSmall };
Weave.library.components.rules.trackRow = { display: Weave.library.components.values.flex, gap: Weave.library.components.vars.spaceLoose, overflowX: Weave.library.components.values.auto, scrollSnapType: Weave.library.components.values.snapX, paddingBottom: Weave.library.components.vars.spaceTight };

/* controls, third wave: the two fields every sign in screen needs, and the hint a field can carry. */
Weave.library.components.fieldHint = spec => Weave.library.control.maybe(words => Weave.library.components.hint({ text: words }))(spec.hint);
Weave.library.components.fieldItems = spec => Weave.library.composition.compact([Weave.library.components.fieldLabel(spec), Weave.library.components.control(spec), Weave.library.components.fieldHint(spec)]);
Weave.library.components.revealLabels = {};
Weave.library.components.revealLabels.shown = 'Hide';
Weave.library.components.revealLabels.hidden = 'Show';
Weave.library.components.revealLabel = spec => Weave.library.control.either(Weave.library.composition.identity, () => Weave.library.components.revealLabels.shown, () => Weave.library.components.revealLabels.hidden)(spec.shown);
Weave.library.components.passwordType = spec => Weave.library.control.either(Weave.library.composition.identity, () => Weave.library.elements.inputTypes.text, () => Weave.library.elements.inputTypes.password)(spec.shown);
Weave.library.components.passwordControl = spec => Weave.library.components.control(Weave.library.composition.merge(spec, { type: Weave.library.components.passwordType(spec) }));
Weave.library.components.revealButton = spec => Weave.library.control.maybe(run => Weave.library.components.actionButton({ label: Weave.library.components.revealLabel(spec), size: Weave.library.components.markNames.size.small, onAction: run }))(spec.onReveal);
Weave.library.components.passwordRow = spec => Weave.library.components.inputGroupBox({ children: Weave.library.composition.compact([Weave.library.components.passwordControl(spec), Weave.library.components.revealButton(spec)]) });
Weave.library.components.passwordParts = spec => Weave.library.composition.compact([Weave.library.components.fieldLabel(spec), Weave.library.components.passwordRow(spec), Weave.library.components.fieldHint(spec)]);
Weave.library.components.passwordField = spec => Weave.library.components.build(Weave.library.components.parts.label, 'passwordField', { children: Weave.library.components.passwordParts(spec) });
Weave.library.components.codeLength = 6;
Weave.library.components.codeHints = spec => ({ maxlength: String(Weave.library.control.defaultTo(Weave.library.components.codeLength)(spec.length)), inputmode: Weave.library.components.digits, autocomplete: Weave.library.components.oneTimeCode });
Weave.library.components.codeAttributes = spec => Weave.library.composition.mergeAll([Weave.library.components.namedAttribute(spec), { [Weave.library.browser.keywords.value]: spec.value }, Weave.library.components.codeHints(spec)]);
Weave.library.components.digits = 'numeric';
Weave.library.components.oneTimeCode = 'one-time-code';
Weave.library.components.codeEntry = spec => Weave.library.components.build(Weave.library.components.parts.entry, 'codeEntry', { attributes: Weave.library.components.codeAttributes(spec), onEdit: spec.onEdit, aria: Weave.library.components.labelAria(spec) });
Weave.library.components.codeParts = spec => Weave.library.composition.compact([Weave.library.components.fieldLabel(spec), Weave.library.components.codeEntry(spec), Weave.library.components.fieldHint(spec)]);
Weave.library.components.codeField = spec => Weave.library.components.build(Weave.library.components.parts.label, 'codeField', { children: Weave.library.components.codeParts(spec) });
Weave.library.components.rules.passwordField = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.codeField = { display: Weave.library.components.values.flex, flexDirection: Weave.library.components.values.column, gap: Weave.library.components.vars.spaceTight };
Weave.library.components.rules.codeEntry = { background: Weave.library.components.vars.surface, color: Weave.library.components.vars.ink, minHeight: Weave.library.components.vars.controlHeightLarge, padding: Weave.library.components.vars.padSnug, border: Weave.library.components.borders.hairline, borderRadius: Weave.library.components.vars.radiusSmall, fontFamily: Weave.library.components.vars.fontMono, fontSize: Weave.library.components.vars.fontSizeLarge, letterSpacing: Weave.library.components.vars.trackingCode, textAlign: Weave.library.components.values.center , maxWidth: Weave.library.components.values.full };
/* tones, second wave: every other class that can be handed a tone, and how each one spends it. */
Weave.library.components.toneRules.tag = Weave.library.components.toneSpends.outline;
Weave.library.components.toneRules.badge = Weave.library.components.toneSpends.fill;
Weave.library.components.toneRules.bannerBox = Weave.library.components.toneSpends.edge;
Weave.library.components.toneRules.chipBox = Weave.library.components.toneSpends.outline;
Weave.library.components.toneRules.spinnerMark = Weave.library.components.toneSpends.cap;
Weave.library.components.toneRules.timelineRow = Weave.library.components.toneSpends.edge;

/* states, second wave: the marks the new widgets answer to, each still one row against one class. */
Weave.library.components.stateRules.anchorHere = { name: Weave.library.components.interactive.anchor, state: Weave.library.components.stateNames.here, style: { textDecoration: Weave.library.components.values.underline } };

/* presets: a named palette, spent on the page or on one subtree, without writing a theme or a rule. */
Weave.library.components.presets = {};
Weave.library.components.presets.ocean = { accent: '#0e7490', accentSoft: '#cffafe', accentSoftInk: '#0b4f5e', radius: '10px' };
Weave.library.components.presets.forest = { accent: '#15803d', accentSoft: '#dcfce7', accentSoftInk: '#14532d', radius: '6px' };
Weave.library.components.presets.plum = { accent: '#7c3aed', accentSoft: '#ede9fe', accentSoftInk: '#4c1d95', radius: '14px' };
Weave.library.components.presets.ember = { accent: '#c2410c', accentSoft: '#ffedd5', accentSoftInk: '#7c2d12', radius: '4px' };
Weave.library.components.presetNames = Weave.library.components.nameTable(Weave.library.components.presets);
Weave.library.components.presetTokens = name => Weave.library.control.defaultTo({})(Weave.library.components.presets[name]);
Weave.library.components.applyPreset = name => element => Weave.library.components.applyTokens(Weave.library.components.presetTokens(name))(element);
Weave.library.components.usePreset = name => Weave.library.components.applyPreset(name)(Weave.library.browser.documentElement());

/* configure: the one way a page moves a token before the sheet is written, so no page edits the library. */
Weave.library.components.configure = overrides => Object.assign(Weave.library.components.tokens, overrides);

/* themes, second wave: two more rows, each still nothing but token overrides. */
Weave.library.components.themes.contrast = { ink: '#000000', muted: '#1f2937', edge: '#000000', surface: '#ffffff', sunken: '#f1f1f1', accent: '#0b3ea8', accentSoft: '#dbe6ff', accentSoftInk: '#062a75', shadow: '0 0 0 1px #000000', focusRing: '0 0 0 3px #0b3ea8' };
Weave.library.components.themes.dusk = { ink: '#f5e9d7', muted: '#b9a68c', edge: '#4a3b2c', surface: '#241c14', sunken: '#2f2519', accent: '#e0a458', accentInk: '#241c14', accentSoft: '#3b2d1c', accentSoftInk: '#f0c891', mediaWash: 'linear-gradient(145deg, #3b2d1c, #241c14)', shadow: '0 1px 2px rgba(0, 0, 0, 0.45)', shadowLifted: '0 10px 30px rgba(0, 0, 0, 0.55)', focusRing: '0 0 0 3px rgba(224, 164, 88, 0.45)' };

/* breakpoints, second wave: the wide viewport, and what the new pieces do on a narrow one. */
Weave.library.components.breakpoints.wide = Weave.library.browser.fromWidth(Weave.library.components.tokens.pageWidth);
Weave.library.components.mediaRules.roomier = { query: Weave.library.components.breakpoints.wide, rules: { page: { maxWidth: Weave.library.components.vars.wideWidth } } };
Weave.library.components.mediaRules.compact.rules.column = { gridColumn: Weave.library.components.vars.spanFull };
Weave.library.components.mediaRules.compact.rules.navbarBox = { flexDirection: Weave.library.components.values.column, alignItems: Weave.library.components.values.start };
Weave.library.components.mediaRules.compact.rules.termsBox = { gridTemplateColumns: Weave.library.components.values.full };
Weave.library.components.mediaRules.calm.rules.spinnerMark = { animation: Weave.library.components.values.none };
