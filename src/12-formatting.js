/* formatting: locale aware text for numbers, money, dates and lists. Nothing here spells a word. */
Weave.library.formatting = {};

/* locale: the one place a language tag is chosen. Set formatting.locale.name to override the browser. A tag Intl rejects (a posix or C locale reports one) falls back to the engine default rather than throwing from every formatter. */
Weave.library.formatting.locale = {};
Weave.library.formatting.locale.name = null;
Weave.library.formatting.localeName = () => Weave.library.formatting.validLocale(Weave.library.control.defaultTo(Weave.library.browser.language())(Weave.library.formatting.locale.name));
Weave.library.formatting.validLocale = name => Weave.library.control.attemptOr(Weave.library.browser.canonicalLocale, undefined)(name);

/* numberStyles, notations, unitNames: the Intl option words, each written exactly once. */
Weave.library.formatting.numberStyles = {};
Weave.library.formatting.numberStyles.currency = 'currency';
Weave.library.formatting.numberStyles.percent = 'percent';
Weave.library.formatting.numberStyles.unit = 'unit';
Weave.library.formatting.notations = {};
Weave.library.formatting.notations.compact = 'compact';
Weave.library.formatting.unitNames = {};
Weave.library.formatting.unitNames.kilometer = 'kilometer';
Weave.library.formatting.unitNames.liter = 'liter';
Weave.library.formatting.unitNames.megabyte = 'megabyte';
Weave.library.formatting.unitNames.hour = 'hour';

/* numbers: one formatter, and one named shape of options per way of reading a number. */
Weave.library.formatting.noFraction = 0;
Weave.library.formatting.number = options => value => Weave.library.browser.formatNumber(value, Weave.library.formatting.localeName(), options);
Weave.library.formatting.integer = value => Weave.library.formatting.number({ maximumFractionDigits: Weave.library.formatting.noFraction })(value);
Weave.library.formatting.decimal = places => value => Weave.library.formatting.number({ minimumFractionDigits: places, maximumFractionDigits: places })(value);
Weave.library.formatting.money = currency => value => Weave.library.formatting.number({ style: Weave.library.formatting.numberStyles.currency, currency })(value);
Weave.library.formatting.percent = value => Weave.library.formatting.number({ style: Weave.library.formatting.numberStyles.percent })(value);
Weave.library.formatting.compact = value => Weave.library.formatting.number({ notation: Weave.library.formatting.notations.compact })(value);
Weave.library.formatting.unit = name => value => Weave.library.formatting.number({ style: Weave.library.formatting.numberStyles.unit, unit: name })(value);

/* dateStyles and fieldStyles: the Intl date option words, again each written exactly once. */
Weave.library.formatting.dateStyles = {};
Weave.library.formatting.dateStyles.short = 'short';
Weave.library.formatting.dateStyles.medium = 'medium';
Weave.library.formatting.dateStyles.long = 'long';
Weave.library.formatting.dateStyles.full = 'full';
Weave.library.formatting.fieldStyles = {};
Weave.library.formatting.fieldStyles.numeric = 'numeric';
Weave.library.formatting.fieldStyles.twoDigit = '2-digit';
Weave.library.formatting.fieldStyles.abbreviated = 'short';
Weave.library.formatting.fieldStyles.spelled = 'long';

/* dates: one formatter, driven by the style tables, so no calendar word is ever written by hand. */
Weave.library.formatting.dateWith = options => date => Weave.library.browser.formatDate(date, Weave.library.formatting.localeName(), options);
Weave.library.formatting.date = style => date => Weave.library.formatting.dateWith({ dateStyle: Weave.library.formatting.dateStyles[style] })(date);
Weave.library.formatting.time = style => date => Weave.library.formatting.dateWith({ timeStyle: Weave.library.formatting.dateStyles[style] })(date);
Weave.library.formatting.dateTimeOptions = style => ({ dateStyle: Weave.library.formatting.dateStyles[style], timeStyle: Weave.library.formatting.dateStyles[style] });
Weave.library.formatting.dateTime = style => date => Weave.library.formatting.dateWith(Weave.library.formatting.dateTimeOptions(style))(date);
Weave.library.formatting.monthName = date => Weave.library.formatting.dateWith({ month: Weave.library.formatting.fieldStyles.spelled, year: Weave.library.formatting.fieldStyles.numeric })(date);
Weave.library.formatting.weekdayName = date => Weave.library.formatting.dateWith({ weekday: Weave.library.formatting.fieldStyles.abbreviated })(date);

/* relative: the largest span that fits the distance names the unit, so no English word is hard coded. */
Weave.library.formatting.spanNames = () => Weave.library.composition.keys(Weave.library.dates.spans);
Weave.library.formatting.fittingNames = distance => Weave.library.formatting.spanNames().filter(name => Weave.library.dates.spans[name] <= distance);
Weave.library.formatting.smallestName = () => Weave.library.composition.first(Weave.library.formatting.spanNames());
Weave.library.formatting.unitFor = distance => Weave.library.control.defaultTo(Weave.library.formatting.smallestName())(Weave.library.composition.last(Weave.library.formatting.fittingNames(distance)));
Weave.library.formatting.countIn = (difference, name) => Math.trunc(difference / Weave.library.dates.spans[name]);
Weave.library.formatting.relativeWith = (difference, name) => Weave.library.browser.formatRelative(Weave.library.formatting.countIn(difference, name), name, Weave.library.formatting.localeName());
Weave.library.formatting.relativeIn = difference => Weave.library.formatting.relativeWith(difference, Weave.library.formatting.unitFor(Math.abs(difference)));
Weave.library.formatting.relative = (date, base = Weave.library.dates.today()) => Weave.library.formatting.relativeIn(Weave.library.dates.milliseconds(date) - Weave.library.dates.milliseconds(base));

/* list: the platform joins the items, so no comma or conjunction is written anywhere. */
Weave.library.formatting.list = items => Weave.library.browser.formatList(items, Weave.library.formatting.localeName());
