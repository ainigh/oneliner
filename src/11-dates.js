/* dates: calendar arithmetic over the Date values the browser layer hands out. No locale lives here. */
Weave.library.dates = {};
Weave.library.dates.today = () => Weave.library.browser.currentDate();
Weave.library.dates.milliseconds = date => Weave.library.browser.dateTimeValue(date);
Weave.library.dates.isValid = date => Weave.library.browser.isValidDate(date);
Weave.library.dates.none = () => null;
Weave.library.dates.parts = date => Weave.library.composition.mapValues(read => read(date))(Weave.library.browser.dateReaders);
Weave.library.dates.from = parts => Weave.library.browser.dateFromParts(parts.year, parts.month, parts.day, parts.hours, parts.minutes);

/* units: how many milliseconds each unit of time is worth. Month and year are not here on purpose. */
Weave.library.dates.units = {};
Weave.library.dates.units.second = 1000;
Weave.library.dates.units.minute = 60000;
Weave.library.dates.units.hour = 3600000;
Weave.library.dates.units.day = 86400000;
Weave.library.dates.units.week = 604800000;

/* spans: every unit a relative phrase may name, smallest first, month and year approximated. */
Weave.library.dates.spans = {};
Weave.library.dates.spans.second = Weave.library.dates.units.second;
Weave.library.dates.spans.minute = Weave.library.dates.units.minute;
Weave.library.dates.spans.hour = Weave.library.dates.units.hour;
Weave.library.dates.spans.day = Weave.library.dates.units.day;
Weave.library.dates.spans.week = Weave.library.dates.units.week;
Weave.library.dates.spans.month = 2629800000;
Weave.library.dates.spans.year = 31557600000;

/* names: the unit keys spelled once, so no other line in the library writes a unit name. */
Weave.library.dates.names = {};
Weave.library.dates.names.day = 'day';
Weave.library.dates.names.week = 'week';
Weave.library.dates.names.month = 'month';
Weave.library.dates.names.year = 'year';

/* marks: the punctuation an ISO date is written with. */
Weave.library.dates.marks = {};
Weave.library.dates.marks.separator = '-';

/* adders: the two units a millisecond count cannot express. Every other unit shifts by its span. */
Weave.library.dates.monthsInYear = 12;
Weave.library.dates.lastDayOf = (year, month) => Weave.library.browser.dateReaders.day(Weave.library.browser.dateFromParts(year, month + 1, 0));
Weave.library.dates.clampedDate = (year, month, day) => Weave.library.browser.dateFromParts(year, month, Math.min(day, Weave.library.dates.lastDayOf(year, month)));
Weave.library.dates.shiftMonths = (count, date) => Weave.library.dates.clampedDate(Weave.library.browser.dateReaders.year(date), Weave.library.browser.dateReaders.month(date) + count, Weave.library.browser.dateReaders.day(date));
Weave.library.dates.adders = {};
Weave.library.dates.adders.month = (count, date) => Weave.library.dates.shiftMonths(count, date);
Weave.library.dates.adders.year = (count, date) => Weave.library.dates.shiftMonths(count * Weave.library.dates.monthsInYear, date);
Weave.library.dates.addSpan = unit => (count, date) => Weave.library.browser.createDate(Weave.library.dates.milliseconds(date) + count * Weave.library.dates.units[unit]);
Weave.library.dates.adderFor = unit => Weave.library.control.selectByKey(Weave.library.dates.adders, Weave.library.dates.addSpan(unit))(unit);
Weave.library.dates.add = (unit, count) => date => Weave.library.dates.adderFor(unit)(count, date);

/* starts: one row per unit, each mapping a date to the first moment of the unit it falls in. */
Weave.library.dates.firstDay = 1;
Weave.library.dates.firstMonth = 0;
Weave.library.dates.weekLength = 7;
Weave.library.dates.mondayShift = 6;
Weave.library.dates.weekdayIndex = date => (Weave.library.browser.dateReaders.weekday(date) + Weave.library.dates.mondayShift) % Weave.library.dates.weekLength;
Weave.library.dates.starts = {};
Weave.library.dates.starts.day = date => Weave.library.browser.dateFromParts(Weave.library.browser.dateReaders.year(date), Weave.library.browser.dateReaders.month(date), Weave.library.browser.dateReaders.day(date));
Weave.library.dates.starts.week = date => Weave.library.dates.starts.day(Weave.library.dates.add(Weave.library.dates.names.day, -Weave.library.dates.weekdayIndex(date))(date));
Weave.library.dates.starts.month = date => Weave.library.browser.dateFromParts(Weave.library.browser.dateReaders.year(date), Weave.library.browser.dateReaders.month(date), Weave.library.dates.firstDay);
Weave.library.dates.starts.year = date => Weave.library.browser.dateFromParts(Weave.library.browser.dateReaders.year(date), Weave.library.dates.firstMonth, Weave.library.dates.firstDay);
Weave.library.dates.startOf = unit => date => Weave.library.dates.starts[unit](date);
Weave.library.dates.lastMoment = 1;
Weave.library.dates.nextStart = (unit, date) => Weave.library.dates.startOf(unit)(Weave.library.dates.add(unit, 1)(date));
Weave.library.dates.endOf = unit => date => Weave.library.browser.createDate(Weave.library.dates.milliseconds(Weave.library.dates.nextStart(unit, date)) - Weave.library.dates.lastMoment);
Weave.library.dates.daysInMonth = date => Weave.library.browser.dateReaders.day(Weave.library.dates.endOf(Weave.library.dates.names.month)(date));

/* text: an ISO day is the one written form this layer knows, and the one form it parses back. */
Weave.library.dates.zero = '0';
Weave.library.dates.yearSize = 4;
Weave.library.dates.partSize = 2;
Weave.library.dates.monthSize = 7;
Weave.library.dates.pad = (value, size) => String(value).padStart(size, Weave.library.dates.zero);
Weave.library.dates.twoDigits = value => Weave.library.dates.pad(value, Weave.library.dates.partSize);
Weave.library.dates.isoParts = date => [Weave.library.dates.pad(Weave.library.browser.dateReaders.year(date), Weave.library.dates.yearSize), Weave.library.dates.twoDigits(Weave.library.browser.dateReaders.month(date) + 1), Weave.library.dates.twoDigits(Weave.library.browser.dateReaders.day(date))];
Weave.library.dates.iso = date => Weave.library.dates.isoParts(date).join(Weave.library.dates.marks.separator);
Weave.library.dates.monthKey = date => Weave.library.dates.iso(date).slice(0, Weave.library.dates.monthSize);
Weave.library.dates.isoPattern = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2})?)?$/;
Weave.library.dates.isIsoText = text => Weave.library.control.and(Weave.library.predicates.isString(text), Weave.library.dates.isoPattern.test(String(text)));
Weave.library.dates.numbersIn = text => Weave.library.control.defaultTo([])(text.match(/\d+/g)).map(Number);
Weave.library.dates.fromNumbers = ([year, month, day, hours, minutes]) => Weave.library.browser.dateFromParts(year, month - 1, day, hours, minutes);
Weave.library.dates.validOrNull = date => Weave.library.control.either(Weave.library.dates.isValid, Weave.library.composition.identity, Weave.library.dates.none)(date);
Weave.library.dates.parsed = text => Weave.library.dates.validOrNull(Weave.library.dates.fromNumbers(Weave.library.dates.numbersIn(text)));
Weave.library.dates.parse = text => Weave.library.control.either(Weave.library.dates.isIsoText, Weave.library.dates.parsed, Weave.library.dates.none)(text);

/* comparisons: every question one date can be asked about another, answered through the written form. */
Weave.library.dates.isSameDay = (a, b) => Weave.library.dates.iso(a) === Weave.library.dates.iso(b);
Weave.library.dates.isSameMonth = (a, b) => Weave.library.dates.monthKey(a) === Weave.library.dates.monthKey(b);
Weave.library.dates.isToday = date => Weave.library.dates.isSameDay(date, Weave.library.dates.today());
Weave.library.dates.isBefore = (a, b) => Weave.library.dates.milliseconds(a) < Weave.library.dates.milliseconds(b);
Weave.library.dates.isAfter = (a, b) => Weave.library.dates.milliseconds(a) > Weave.library.dates.milliseconds(b);
Weave.library.dates.diff = unit => (a, b) => Math.round((Weave.library.dates.milliseconds(b) - Weave.library.dates.milliseconds(a)) / Weave.library.dates.spans[unit]);

/* grids: a week and a month laid out as plain arrays of days, built by range and chunk, never a loop. */
Weave.library.dates.gridLength = 42;
Weave.library.dates.dayAfter = (start, count) => Weave.library.browser.dateFromParts(Weave.library.browser.dateReaders.year(start), Weave.library.browser.dateReaders.month(start), Weave.library.browser.dateReaders.day(start) + count);
Weave.library.dates.daysFrom = (start, count) => Weave.library.composition.range(count).map(index => Weave.library.dates.dayAfter(start, index));
Weave.library.dates.weekdays = date => Weave.library.dates.daysFrom(Weave.library.dates.startOf(Weave.library.dates.names.week)(date), Weave.library.dates.weekLength);
Weave.library.dates.gridStart = date => Weave.library.dates.startOf(Weave.library.dates.names.week)(Weave.library.dates.startOf(Weave.library.dates.names.month)(date));
Weave.library.dates.gridDays = date => Weave.library.dates.daysFrom(Weave.library.dates.gridStart(date), Weave.library.dates.gridLength);
Weave.library.dates.monthGrid = date => Weave.library.composition.chunk(Weave.library.dates.weekLength)(Weave.library.dates.gridDays(date));
