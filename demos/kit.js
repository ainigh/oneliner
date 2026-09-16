/* kit: the pieces every demo shares. Written only against Weave.library, in the same style, and documented by its own tables. */
Weave.kit = {};

/* words: the only place the kit writes a word a reader will see. One row, one word. */
Weave.kit.words = {};
Weave.kit.words.theme = 'Theme';
Weave.kit.words.of = ' of ';

/* sizes: the only place the kit writes a number of its own. */
Weave.kit.sizes = {};
Weave.kit.sizes.minorUnits = 100;
Weave.kit.sizes.noDecimals = 0;

/* parts: the helpers the pieces below are assembled from. Nothing outside this file calls one. */
Weave.kit.parts = {};
Weave.kit.parts.kidsOf = spec => Weave.library.control.defaultTo([])(spec.children);
Weave.kit.parts.lineOf = text => Weave.library.components.note({ text });
Weave.kit.parts.toolsOf = spec => Weave.library.composition.compact(Weave.library.control.defaultTo([])(spec.tools).concat([Weave.kit.themeSwitch()]));
Weave.kit.parts.bar = spec => Weave.library.components.pageHeader({ children: [Weave.library.components.display({ text: Weave.library.components.titleOf(spec) }), Weave.library.components.row({ children: Weave.kit.parts.toolsOf(spec) })] });
Weave.kit.parts.blurb = spec => Weave.library.control.maybe(Weave.kit.parts.lineOf)(spec.note);
Weave.kit.parts.shellParts = spec => Weave.library.composition.compact([Weave.kit.parts.bar(spec), Weave.kit.parts.blurb(spec)].concat(Weave.kit.parts.kidsOf(spec)));
Weave.kit.parts.personLines = spec => Weave.library.composition.compact([Weave.library.components.strong({ text: spec.name }), Weave.library.control.maybe(Weave.kit.parts.lineOf)(spec.note)]);
Weave.kit.parts.meterShow = spec => Weave.library.control.defaultTo(Weave.kit.whole)(spec.show);
Weave.kit.parts.meterReading = spec => Weave.kit.parts.meterShow(spec)(spec.used) + Weave.kit.words.of + Weave.kit.parts.meterShow(spec)(spec.limit);
Weave.kit.parts.meterHead = spec => Weave.library.components.spread({ children: [Weave.library.components.strong({ text: spec.label }), Weave.library.components.note({ text: Weave.kit.parts.meterReading(spec) })] });
Weave.kit.parts.meterTone = spec => Weave.library.control.either(() => spec.used > spec.limit, () => Weave.library.components.toneNames.danger, () => Weave.library.components.toneNames.info)(spec);
Weave.kit.parts.meterBar = spec => Weave.library.components.progressBar({ tone: Weave.kit.parts.meterTone(spec), value: spec.used, total: spec.limit });
Weave.kit.parts.meterFoot = spec => Weave.library.components.note({ text: Weave.library.control.defaultTo(Weave.kit.share(spec.used, spec.limit))(spec.note) });
Weave.kit.parts.chip = text => Weave.library.components.tag({ text });
Weave.kit.parts.moment = entry => ({ title: entry.words, body: [Weave.library.components.note({ text: Weave.library.formatting.dateTime(Weave.library.formatting.dateStyles.medium)(entry.at) })] });
Weave.kit.parts.pickRow = spec => item => ({ label: item.label, hint: item.hint, aria: { selected: String(item.key === spec.chosen) }, onAction: () => spec.onPick(item.key) });
Weave.kit.parts.pickRows = spec => Weave.library.control.defaultTo([])(spec.items).map(Weave.kit.parts.pickRow(spec));
Weave.kit.parts.chosenItem = spec => Weave.library.control.defaultTo([])(spec.items).find(item => item.key === spec.chosen);
Weave.kit.parts.labelKey = 'label';
Weave.kit.parts.readingTrend = spec => Weave.library.components.trend({ direction: spec.direction, tone: spec.tone, text: spec.text });
Weave.kit.parts.readingHead = spec => Weave.library.components.spread({ children: [Weave.library.components.note({ text: spec.label }), Weave.kit.parts.readingTrend(spec)] });
Weave.kit.parts.readingSpark = spec => Weave.library.components.sparkline({ values: spec.values, series: spec.series, label: spec.label });
Weave.kit.parts.readingParts = spec => [Weave.kit.parts.readingHead(spec), Weave.library.components.value({ text: String(spec.value) }), Weave.kit.parts.readingSpark(spec)];
Weave.kit.parts.answered = run => answer => Weave.library.control.when(() => answer, run)(answer);

/* the theme switch: every demo offers one, so no demo has to build one. */
Weave.kit.themeSwitch = () => Weave.library.components.actionButton({ label: Weave.kit.words.theme, size: Weave.library.components.markNames.size.small, onAction: Weave.library.components.toggleTheme });

/* the shell: a page under its own title, with the theme switch and whatever tools the demo adds beside it. */
Weave.kit.shell = spec => Weave.library.components.page({ children: Weave.kit.parts.shellParts(spec) });

/* counting: the three readings a demo asks for, each bound once so no demo formats a number by hand. */
Weave.kit.pence = currency => amount => Weave.library.formatting.money(currency)(amount / Weave.kit.sizes.minorUnits);
Weave.kit.whole = value => Weave.library.formatting.decimal(Weave.kit.sizes.noDecimals)(value);
Weave.kit.share = (part, whole) => Weave.library.formatting.percent(Weave.library.composition.clamp(0, 1)(part / whole));

/* person: a face beside a name, with a second line under it when there is one. */
Weave.kit.person = spec => Weave.library.components.listRow({ children: [Weave.library.components.portrait({ name: spec.name }), Weave.library.components.fill({ children: Weave.kit.parts.personLines(spec) })] });

/* pair: a quiet label with its value at the far side, the shape every summary line takes. */
Weave.kit.pair = spec => Weave.library.components.spread({ children: [Weave.library.components.note({ text: spec.label }), Weave.library.components.strong({ text: String(spec.value) })] });

/* meter: a labelled bar against a limit, which turns red the moment the limit is passed. */
Weave.kit.meter = spec => Weave.library.components.stack({ children: [Weave.kit.parts.meterHead(spec), Weave.kit.parts.meterBar(spec), Weave.kit.parts.meterFoot(spec)] });

/* nothing: an empty pane that leads with a glyph, so a screen with no rows still says something. */
Weave.kit.nothing = spec => Weave.library.components.emptyState({ glyph: spec.glyph, title: Weave.library.components.titleOf(spec), note: Weave.library.components.noteOf(spec) });

/* chips: a row of tags from a list of words, for the labels a record carries. */
Weave.kit.chips = spec => Weave.library.components.row({ children: Weave.library.control.defaultTo([])(spec.items).map(Weave.kit.parts.chip) });

/* timeline: what happened, newest first, each line opening onto when it happened. */
Weave.kit.timeline = spec => Weave.library.components.accordion({ sections: Weave.library.control.defaultTo([])(spec.entries).map(Weave.kit.parts.moment) });

/* section: a panel under a small label, the shape a dashboard panel already takes. */
Weave.kit.section = spec => Weave.library.components.panel({ children: [Weave.library.components.sectionLabel({ text: Weave.library.components.titleOf(spec) })].concat(Weave.kit.parts.kidsOf(spec)) });

/* saying so: one toast host for the whole page, so no demo makes its own. */
Weave.kit.toasts = Weave.library.patterns.notifications({});
Weave.kit.say = (message, tone) => Weave.kit.toasts.push(message, tone);
Weave.kit.cheer = message => Weave.kit.say(message, Weave.library.components.toneNames.success);

/* asking first: a confirm dialog, and the work that only happens on yes. */
Weave.kit.askThen = (spec, run) => Weave.library.composition.then(Weave.kit.parts.answered(run))(Weave.library.patterns.confirm(spec));

/* picker: a button that drops every choice into a popover and marks the one in force. */
Weave.kit.picker = spec => Weave.library.components.actionButton({ label: Weave.library.control.reach(Weave.kit.parts.chosenItem(spec), Weave.kit.parts.labelKey), onAction: Weave.library.patterns.menuAt({ items: Weave.kit.parts.pickRows(spec) }) });

/* reading: a headline number with the way it moved and the week behind it, the shape every console opens with. */
Weave.kit.reading = spec => Weave.library.components.panel({ children: Weave.kit.parts.readingParts(spec) });

/* notes: one row per piece above. Nothing may sit on Weave.kit without a row here and a sample below. */
Weave.kit.notes = {};
Weave.kit.notes.themeSwitch = 'The small button every demo carries, wired to the library theme.';
Weave.kit.notes.shell = 'A page under its title, with the theme switch and an optional blurb.';
Weave.kit.notes.pence = 'A currency bound once, taking minor units so nothing rounds twice.';
Weave.kit.notes.whole = 'A count with no decimal places, grouped for the reader locale.';
Weave.kit.notes.share = 'One number against another as a percentage, clamped to the whole.';
Weave.kit.notes.person = 'A face, a name, and a second line when the record has one.';
Weave.kit.notes.pair = 'A label on the left and its value on the right, on one line.';
Weave.kit.notes.meter = 'A bar against a limit, red once the limit is passed.';
Weave.kit.notes.nothing = 'An empty pane that leads with a glyph rather than grey text.';
Weave.kit.notes.chips = 'A row of tags, for the labels a record carries.';
Weave.kit.notes.timeline = 'Newest first, each line opening onto when it happened.';
Weave.kit.notes.section = 'A panel under a small uppercase label.';
Weave.kit.notes.say = 'A toast on the one host the kit keeps for the page.';
Weave.kit.notes.cheer = 'The same toast, already toned for good news.';
Weave.kit.notes.askThen = 'A confirm dialog, and the work that only runs on yes.';
Weave.kit.notes.reading = 'A headline number, the way it moved, and the week behind it.';
Weave.kit.notes.picker = 'A button that drops every choice into a popover.';

/* demoWords: the only place the samples below write a word, so a sample never carries a literal of its own. */
Weave.kit.demoWords = {};
Weave.kit.demoWords.currency = 'GBP';
Weave.kit.demoWords.amount = 249500;
Weave.kit.demoWords.count = 18402;
Weave.kit.demoWords.part = 37;
Weave.kit.demoWords.whole = 64;
Weave.kit.demoWords.who = 'Noor Al-Sayed';
Weave.kit.demoWords.what = 'Joined in March, on the platform team';
Weave.kit.demoWords.pairLabel = 'Outstanding balance';
Weave.kit.demoWords.pairValue = 'Nil';
Weave.kit.demoWords.meterLabel = 'Disk in use';
Weave.kit.demoWords.meterUsed = 940;
Weave.kit.demoWords.meterLimit = 800;
Weave.kit.demoWords.emptyGlyph = '🗂️';
Weave.kit.demoWords.emptyTitle = 'No files here yet';
Weave.kit.demoWords.emptyNote = 'Drop one in and it will be listed.';
Weave.kit.demoWords.tags = ['billing', 'urgent', 'europe'];
Weave.kit.demoWords.firstMoment = 'Plan moved to Scale';
Weave.kit.demoWords.secondMoment = 'Nightly export switched on';
Weave.kit.demoWords.sectionTitle = 'Billing';
Weave.kit.demoWords.sectionLine = 'Every panel in the gallery is one of these.';
Weave.kit.demoWords.sayButton = 'Raise a toast';
Weave.kit.demoWords.sayMessage = 'Saved. Nothing else changed.';
Weave.kit.demoWords.cheerButton = 'Raise a happy one';
Weave.kit.demoWords.cheerMessage = 'All four checks came back green.';
Weave.kit.demoWords.askButton = 'Delete the branch';
Weave.kit.demoWords.askTitle = 'Delete this branch?';
Weave.kit.demoWords.askNote = 'Nothing points at it any more, so nothing else changes.';
Weave.kit.demoWords.askDone = 'Branch deleted.';
Weave.kit.demoWords.shellTitle = 'A whole page';
Weave.kit.demoWords.shellNote = 'The blurb sits under the rule, where a demo explains itself.';
Weave.kit.demoWords.shellLine = 'Then the demo begins.';
Weave.kit.demoWords.readingLabel = 'Requests a day';
Weave.kit.demoWords.readingValue = 16800;
Weave.kit.demoWords.readingText = '+6.4%';
Weave.kit.demoWords.readingSpark = [8200, 8600, 9100, 8800, 9400, 6100, 5400];
Weave.kit.demoWords.regions = [{ key: 'eu', label: 'Europe' }, { key: 'us', label: 'North America' }, { key: 'apac', label: 'Asia Pacific' }];

/* the gallery's own state and the two specs its samples need, kept out of the sample rows themselves. */
Weave.kit.parts.picked = { key: Weave.library.composition.first(Weave.kit.demoWords.regions).key };
Weave.kit.parts.repick = key => Object.assign(Weave.kit.parts.picked, { key }).key;
Weave.kit.parts.sampleMoments = () => [Weave.kit.demoWords.firstMoment, Weave.kit.demoWords.secondMoment].map(words => ({ words, at: Weave.library.dates.today() }));
Weave.kit.parts.askSpec = () => ({ title: Weave.kit.demoWords.askTitle, note: Weave.kit.demoWords.askNote });

/* samples: one row per note, drawing that piece the way a demo would. The gallery walks the notes and asks here. */
Weave.kit.samples = {};
Weave.kit.samples.themeSwitch = () => Weave.kit.themeSwitch();
Weave.kit.samples.shell = () => Weave.kit.shell({ title: Weave.kit.demoWords.shellTitle, note: Weave.kit.demoWords.shellNote, children: [Weave.kit.parts.lineOf(Weave.kit.demoWords.shellLine)] });
Weave.kit.samples.pence = () => Weave.library.components.value({ text: Weave.kit.pence(Weave.kit.demoWords.currency)(Weave.kit.demoWords.amount) });
Weave.kit.samples.whole = () => Weave.library.components.value({ text: Weave.kit.whole(Weave.kit.demoWords.count) });
Weave.kit.samples.share = () => Weave.library.components.value({ text: Weave.kit.share(Weave.kit.demoWords.part, Weave.kit.demoWords.whole) });
Weave.kit.samples.person = () => Weave.kit.person({ name: Weave.kit.demoWords.who, note: Weave.kit.demoWords.what });
Weave.kit.samples.pair = () => Weave.kit.pair({ label: Weave.kit.demoWords.pairLabel, value: Weave.kit.demoWords.pairValue });
Weave.kit.samples.meter = () => Weave.kit.meter({ label: Weave.kit.demoWords.meterLabel, used: Weave.kit.demoWords.meterUsed, limit: Weave.kit.demoWords.meterLimit });
Weave.kit.samples.nothing = () => Weave.kit.nothing({ glyph: Weave.kit.demoWords.emptyGlyph, title: Weave.kit.demoWords.emptyTitle, note: Weave.kit.demoWords.emptyNote });
Weave.kit.samples.chips = () => Weave.kit.chips({ items: Weave.kit.demoWords.tags });
Weave.kit.samples.timeline = () => Weave.kit.timeline({ entries: Weave.kit.parts.sampleMoments() });
Weave.kit.samples.section = () => Weave.kit.section({ title: Weave.kit.demoWords.sectionTitle, children: [Weave.kit.parts.lineOf(Weave.kit.demoWords.sectionLine)] });
Weave.kit.samples.say = () => Weave.library.components.actionButton({ label: Weave.kit.demoWords.sayButton, onAction: () => Weave.kit.say(Weave.kit.demoWords.sayMessage, Weave.library.components.toneNames.info) });
Weave.kit.samples.cheer = () => Weave.library.components.actionButton({ label: Weave.kit.demoWords.cheerButton, onAction: () => Weave.kit.cheer(Weave.kit.demoWords.cheerMessage) });
Weave.kit.samples.askThen = () => Weave.library.components.actionButton({ label: Weave.kit.demoWords.askButton, onAction: () => Weave.kit.askThen(Weave.kit.parts.askSpec(), () => Weave.kit.cheer(Weave.kit.demoWords.askDone)) });
Weave.kit.samples.picker = () => Weave.kit.picker({ items: Weave.kit.demoWords.regions, chosen: Weave.kit.parts.picked.key, onPick: Weave.kit.parts.repick });
Weave.kit.parts.readingWay = () => ({ direction: Weave.library.components.trendNames.up, tone: Weave.library.components.toneNames.success, series: Weave.library.components.seriesNames.one });
Weave.kit.parts.readingSpec = () => Weave.library.composition.merge(Weave.kit.parts.readingWay(), { label: Weave.kit.demoWords.readingLabel, value: Weave.kit.whole(Weave.kit.demoWords.readingValue), text: Weave.kit.demoWords.readingText, values: Weave.kit.demoWords.readingSpark });
Weave.kit.samples.reading = () => Weave.kit.reading(Weave.kit.parts.readingSpec());
