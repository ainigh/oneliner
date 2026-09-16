/* Audit: the style checker for weave.js. Written in the style it enforces, and audited by itself. */
const Audit = {};

/* platform: the only place node globals are named. */
Audit.platform = {};
Audit.platform.read = file => require('fs').readFileSync(file, 'utf8');
Audit.platform.write = (file, text) => require('fs').writeFileSync(file, text);
Audit.platform.exists = file => require('fs').existsSync(file);
Audit.platform.join = (...parts) => require('path').join(...parts);
Audit.platform.print = text => console.log(text);
Audit.platform.exit = code => process.exit(code);
Audit.platform.argument = index => process.argv[index];

/* text: masking and splitting, so operator checks never see the inside of a literal. */
Audit.text = {};
Audit.text.lines = source => source.split('\n');
Audit.text.stringPattern = /'(\\.|[^'\\])*'|"(\\.|[^"\\])*"/g;
Audit.text.regexPattern = /\/(\\.|\[(\\.|[^\]\\])*\]|[^/\\\n])+\/[gimsuy]*/g;
Audit.text.masked = line => line.replace(Audit.text.stringPattern, "''").replace(Audit.text.regexPattern, '/./');
Audit.text.literals = line => (line.match(Audit.text.stringPattern) || []).map(value => value.slice(1, -1));
Audit.text.scriptOpen = '<script>';
Audit.text.scriptClose = '</script>';
Audit.text.markedIndexes = (lines, marker) => lines.map((line, index) => ({ line, index })).filter(entry => entry.line.trim() === marker).map(entry => entry.index);
Audit.text.scriptRanges = lines => Audit.text.markedIndexes(lines, Audit.text.scriptOpen).map((open, position) => [open, Audit.text.markedIndexes(lines, Audit.text.scriptClose)[position]]);
Audit.text.isInScript = (ranges, index) => ranges.some(([open, close]) => index > open && index < close);
Audit.text.blankOutside = (lines, ranges) => lines.map((line, index) => Audit.either(Audit.text.isInScript(ranges, index), () => line, () => ''));
Audit.text.scriptSource = source => Audit.text.blankOutside(Audit.text.lines(source), Audit.text.scriptRanges(Audit.text.lines(source))).join('\n');
Audit.text.isBlank = line => line.trim().length === 0;
Audit.text.isComment = line => line.trim().startsWith('/*');
Audit.text.isCode = line => !Audit.text.isBlank(line) && !Audit.text.isComment(line);
Audit.text.assignment = line => line.split(' = ')[0].trim();
Audit.text.right = line => line.slice(line.indexOf(' = ') + 3).trim();
Audit.text.hasAssignment = line => line.includes(' = ');
Audit.text.pathOf = line => Audit.text.assignment(line).replace(/^const\s+/, '');
Audit.text.leafOf = line => Audit.text.pathOf(line).split('.').pop();
Audit.text.layerOf = line => Audit.text.pathOf(line).split('.')[2];
Audit.text.depthOf = line => Audit.text.pathOf(line).split('.').length;
Audit.text.arrowToken = '=>';
Audit.text.callToken = '(';
Audit.text.token = name => new RegExp('(?<![.\\w$])' + name + '\\b');
Audit.text.hasToken = (line, name) => Audit.text.token(name).test(Audit.text.masked(line));
Audit.text.structure = line => Audit.text.masked(line).replace(/\b\d+(\.\d+)?\b/g, '_').replace(Audit.text.pathOf(line), '_');

/* shapes: every code line matches exactly one of the eight allowed shapes. */
Audit.shapes = {};
Audit.shapes.arrowName = 'arrow';
Audit.shapes.rowName = 'row';
Audit.shapes.root = line => /^const\s+\w+ = \{\};$/.test(line);
Audit.shapes.namespace = line => Audit.text.hasAssignment(line) && Audit.text.right(line) === '{};';
Audit.shapes.generator = line => !Audit.text.hasAssignment(line) && line.trim().endsWith(');');
Audit.shapes.arrow = line => Audit.text.hasAssignment(line) && Audit.text.masked(line).includes(Audit.text.arrowToken);
Audit.shapes.derived = line => Audit.text.hasAssignment(line) && Audit.text.masked(line).includes(Audit.text.callToken);
Audit.shapes.row = line => Audit.text.hasAssignment(line);
Audit.shapes.order = ['root', 'namespace', 'generator', 'arrow', 'derived', 'row'];
Audit.shapes.nameOf = line => Audit.shapes.order.find(name => Audit.shapes[name](line));

/* policy: the tables that say what is confined where. Editing a row changes the rule. */
Audit.policy = {};
Audit.policy.layers = ['composition', 'predicates', 'control', 'browser', 'elements', 'query', 'attributes', 'style', 'timing', 'dates', 'formatting', 'events', 'effects', 'forms', 'network', 'observers', 'storage', 'navigation', 'interaction', 'accessibility', 'collections', 'components', 'overlays', 'patterns', 'auth'];
Audit.policy.declarations = ['const', 'let', 'var', 'function', 'class'];
Audit.policy.statements = ['if', 'else', 'switch', 'case', 'for', 'while', 'do', 'return', 'async', 'await', 'this', 'yield'];
Audit.policy.branching = ['?', '&&', '||', '??', '?.'];
Audit.policy.globals = ['document', 'window', 'globalThis', 'navigator', 'location', 'history', 'localStorage', 'sessionStorage', 'fetch', 'Element', 'Node', 'NodeList', 'HTMLElement', 'HTMLCollection', 'Text', 'DocumentFragment', 'Event', 'CustomEvent', 'KeyboardEvent', 'MouseEvent', 'PointerEvent', 'FormData', 'URL', 'URLSearchParams', 'AbortController', 'MutationObserver', 'IntersectionObserver', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback', 'cancelIdleCallback', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'getComputedStyle', 'matchMedia', 'innerWidth', 'innerHeight', 'scrollX', 'scrollY', 'scrollTo', 'devicePixelRatio', 'performance', 'crypto', 'structuredClone', 'Date', 'Intl', 'DOMParser', 'Blob', 'File', 'Response', 'Headers', 'Request', 'getSelection', 'Uint8Array'];
Audit.policy.builtins = ['Promise', 'Map', 'Set', 'WeakMap', 'RegExp', 'JSON'];
Audit.policy.abbreviations = ['attr', 'el', 'fn', 'cb', 'evt', 'raf', 'req', 'res', 'btn', 'msg', 'idx', 'len', 'ctx', 'obj', 'str', 'num', 'arr'];
Audit.policy.softLimit = 140;
Audit.policy.hardLimit = 300;

/* exemptions: every documented departure from the rules, with the reason it exists. */
Audit.exemptions = {};
/* statements: the two lines the spec allows to carry throw and try. */
Audit.exemptions.statements = {};
Audit.exemptions.statements.fail = 'Weave.library.control.fail';
Audit.exemptions.statements.attempt = 'Weave.library.control.attempt';
/* declarations: the one line allowed to name a constructor the style otherwise bans. */
Audit.exemptions.declarations = {};
Audit.exemptions.declarations.pattern = 'Weave.library.composition.pattern';
/* dependencies: the documented upward references, layer by layer. */
Audit.exemptions.dependencies = {};
Audit.exemptions.dependencies.composition = ['control', 'predicates'];
Audit.exemptions.dependencies.predicates = ['browser', 'control', 'elements', 'attributes', 'style', 'interaction', 'navigation'];
Audit.exemptions.dependencies.control = ['composition', 'predicates', 'timing'];
Audit.exemptions.dependencies.elements = ['style', 'events'];
Audit.exemptions.dependencies.forms = ['interaction'];
Audit.exemptions.dependencies.effects = ['accessibility'];
Audit.exemptions.dependencies.observers = ['events', 'timing'];
Audit.exemptions.dependencies.storage = ['events'];
Audit.exemptions.dependencies.navigation = ['events'];
Audit.exemptions.dependencies.interaction = ['events', 'timing'];
Audit.exemptions.dependencies.accessibility = ['interaction', 'observers', 'network', 'events'];
Audit.exemptions.dependencies.network = ['forms', 'events', 'timing'];
/* predicateNames: helpers inside predicates that name a concept rather than a test. */
Audit.exemptions.predicateNames = ['typeNames', 'typeOfObject', 'instanceTests', 'buttonNumbers', 'emptyTests', 'byTypeName', 'byInstance', 'byButtonNumber', 'matches', 'contains', 'both', 'either', 'all', 'any', 'not', 'rectIntersectsViewport', 'parsesAsSelector', 'matchesMedia'];
/* literalTables: tables whose rows are names, not browser concepts, so repetition is expected. */
Audit.exemptions.literalTables = ['Weave.library.collections.lifts', 'Weave.library.collections.unlifted', 'Weave.library.forms.messages', 'Weave.library.accessibility.messages', 'Weave.tests'];
Audit.exemptions.uniqueFiles = ['tests/tests.js', 'audit.js', 'sample.html', 'todo.html', 'tests.html'];
Audit.exemptions.literals = ['', ' ', '0', '-1', ', ', 'text', 'hidden', 'href', 'src', 'value', 'name', 'type', 'id', 'title', 'label', 'checked', 'selected', 'disabled', 'controls', 'hash', 'path', 'query'];

/* styleTables: a token nothing spends is dead weight the one-place rule exists to prevent. */
Audit.style = {};
Audit.style.tables = [{ table: 'Weave.library.components.tokens', spender: 'components\\.(vars|tokens)', floor: 1 }, { table: 'Weave.library.components.values', spender: 'components\\.values', floor: 1 }];
Audit.style.pattern = row => new RegExp(row.spender + '\\.' + row.name + '\\b', 'g');
Audit.style.count = (source, expression) => (source.match(expression) || []).length;
Audit.style.isSpent = (source, row) => Audit.style.count(source, Audit.style.pattern(row)) > row.floor;
Audit.style.rowsOf = (entries, table) => entries.filter(entry => Audit.text.pathOf(entry.line).startsWith(table.table + '.')).map(entry => ({ name: Audit.text.leafOf(entry.line), index: entry.index, spender: table.spender, floor: table.floor, table: table.table }));
Audit.style.checkTable = (file, source, entries) => table => Audit.style.rowsOf(entries, table).filter(row => !Audit.style.isSpent(source, row)).forEach(row => Audit.report(file, row.index, 'R21', 'nothing spends ' + row.table + '.' + row.name));
Audit.style.check = (file, source, entries) => Audit.style.tables.forEach(Audit.style.checkTable(file, source, entries));

/* findings: one collected violation per rule hit, printed as file:line: rule: detail. */
Audit.findings = [];
Audit.report = (file, index, rule, detail) => Audit.findings.push(file + ':' + (index + 1) + ': ' + rule + ': ' + detail);
Audit.reportWhen = (bad, file, index, rule, detail) => Audit.when(bad, () => Audit.report(file, index, rule, detail));
Audit.when = (test, f) => test ? f() : undefined;
Audit.control = {};
Audit.control.defaultSource = source => source || '';
Audit.either = (test, f, g) => test ? f() : g();
Audit.isExempt = (table, path) => Object.values(table).includes(path);
Audit.codeLines = source => Audit.text.lines(source).map((line, index) => ({ line, index })).filter(entry => Audit.text.isCode(entry.line));

/* rules: one function per rule, each taking the file name and its parsed lines. */
Audit.rules = {};
Audit.rules.oneStatement = (file, entries) => entries.forEach(entry => Audit.reportWhen(!entry.line.trim().endsWith(';'), file, entry.index, 'R1', 'line does not end in a semicolon'));
Audit.rules.qualified = (file, entries) => entries.forEach(entry => Audit.reportWhen(!/^(const\s+\w+|[A-Z]\w*(\.\w+)+)/.test(entry.line.trim()), file, entry.index, 'R2', 'statement is not a fully qualified assignment'));
Audit.rules.shape = (file, entries) => entries.forEach(entry => Audit.reportWhen(Audit.shapes.nameOf(entry.line) === undefined, file, entry.index, 'R3', 'line matches no allowed shape'));
Audit.rules.length = (file, entries) => entries.filter(entry => Audit.shapes.nameOf(entry.line) !== Audit.shapes.rowName).forEach(entry => Audit.reportWhen(entry.line.length > Audit.policy.hardLimit, file, entry.index, 'R4', 'line is ' + entry.line.length + ' characters'));
Audit.rules.declarations = (file, entries) => entries.forEach(entry => Audit.policy.declarations.forEach(word => Audit.reportWhen(Audit.rules.badDeclaration(entry, word), file, entry.index, 'R5', 'declaration ' + word)));
Audit.rules.badDeclaration = (entry, word) => Audit.text.hasToken(entry.line, word) && !Audit.shapes.root(entry.line.trim()) && !Audit.isExempt(Audit.exemptions.declarations, Audit.text.pathOf(entry.line));
Audit.rules.statements = (file, entries) => entries.forEach(entry => Audit.policy.statements.forEach(word => Audit.reportWhen(Audit.rules.badStatement(entry, word), file, entry.index, 'R6', 'statement keyword ' + word)));
Audit.rules.badStatement = (entry, word) => Audit.text.hasToken(entry.line, word) && !Audit.isExempt(Audit.exemptions.statements, Audit.text.pathOf(entry.line));
Audit.rules.isControlLine = line => Audit.text.pathOf(line).startsWith('Weave.library.control') || Audit.text.pathOf(line).startsWith('Audit.');
Audit.rules.branching = (file, entries) => entries.filter(entry => !Audit.rules.isControlLine(entry.line)).forEach(entry => Audit.policy.branching.forEach(operator => Audit.reportWhen(Audit.text.masked(entry.line).includes(operator), file, entry.index, 'R7', 'branching operator ' + operator)));
Audit.rules.throwAndTry = (file, entries) => Audit.rules.countKeywords(file, entries, 'throw').concat(Audit.rules.countKeywords(file, entries, 'try')).forEach(found => Audit.reportWhen(found.count > 1, file, found.index, 'R8', found.word + ' appears ' + found.count + ' times'));
Audit.rules.countKeywords = (file, entries, word) => entries.filter(entry => Audit.text.hasToken(entry.line, word)).map((entry, position, all) => ({ word, index: entry.index, count: all.length }));
Audit.rules.isLibraryLine = line => Audit.text.pathOf(line).startsWith(Audit.rules.libraryPrefix);
Audit.rules.libraryPrefix = Audit.rules.libraryRoot;
Audit.rules.outsideBrowser = entries => entries.filter(entry => Audit.rules.isLibraryLine(entry.line)).filter(entry => !Audit.text.pathOf(entry.line).startsWith('Weave.library.browser'));
Audit.rules.checkGlobal = (file, entry) => name => Audit.reportWhen(Audit.text.hasToken(entry.line, name), file, entry.index, 'R9', 'global ' + name + ' outside the browser layer');
Audit.rules.globals = (file, entries) => Audit.rules.outsideBrowser(entries).forEach(entry => Audit.policy.globals.forEach(Audit.rules.checkGlobal(file, entry)));
Audit.rules.outsideComposition = entries => entries.filter(entry => Audit.rules.isLibraryLine(entry.line)).filter(entry => !Audit.text.pathOf(entry.line).startsWith('Weave.library.composition'));
Audit.rules.checkBuiltin = (file, entry) => name => Audit.reportWhen(Audit.text.hasToken(entry.line, name), file, entry.index, 'R10', 'builtin ' + name + ' outside composition');
Audit.rules.builtins = (file, entries) => Audit.rules.outsideComposition(entries).forEach(entry => Audit.policy.builtins.forEach(Audit.rules.checkBuiltin(file, entry)));
Audit.rules.libraryRoot = 'Weave.library.';
Audit.rules.tableDepth = line => Audit.either(Audit.text.pathOf(line).startsWith(Audit.rules.libraryRoot), () => 4, () => 3);
Audit.rules.isTableRow = line => Audit.text.depthOf(line) > Audit.rules.tableDepth(line);
Audit.rules.aliases = (file, entries) => entries.filter(entry => !Audit.rules.isTableRow(entry.line)).forEach(entry => Audit.reportWhen(/^Weave(\.\w+)+;$/.test(Audit.text.right(entry.line)), file, entry.index, 'R11', 'alias assignment'));
Audit.rules.literalName = value => value.split(Audit.rules.bucketMark)[1];
Audit.rules.bucketMark = '|';
Audit.rules.reportLiteral = file => found => Audit.report(file, found.index, 'R12', 'literal ' + Audit.rules.literalName(found.value) + ' also appears on line ' + (found.first + 1));
Audit.rules.literalUniqueness = (file, entries) => Audit.when(!Audit.exemptions.uniqueFiles.includes(file), () => Audit.rules.duplicateLiterals(entries).forEach(Audit.rules.reportLiteral(file)));
Audit.rules.tableOf = line => Audit.text.pathOf(line).split('.').slice(0, -1).join('.');
Audit.rules.inlineBucket = 'inline';
Audit.rules.bucketOf = line => Audit.either(Audit.shapes.nameOf(line) === Audit.shapes.rowName, () => Audit.rules.tableOf(line), () => Audit.rules.inlineBucket);
Audit.rules.isCountedTable = line => !Audit.exemptions.literalTables.some(table => Audit.text.pathOf(line).startsWith(table));
Audit.rules.literalRows = entries => entries.filter(Audit.rules.isCountedRow).flatMap(entry => Audit.text.literals(entry.line).map(value => ({ value: Audit.rules.bucketOf(entry.line) + Audit.rules.bucketMark + value, index: entry.index })));
Audit.rules.isCountedRow = entry => Audit.text.hasAssignment(entry.line) && Audit.rules.isCountedTable(entry.line);
Audit.rules.countedLiterals = entries => Audit.rules.literalRows(entries).filter(row => !Audit.exemptions.literals.includes(Audit.rules.literalName(row.value)));
Audit.rules.firstSeen = (row, position, all) => ({ value: row.value, index: row.index, first: all.find(other => other.value === row.value).index });
Audit.rules.duplicateLiterals = entries => Audit.rules.countedLiterals(entries).map(Audit.rules.firstSeen).filter(row => row.first !== row.index);
Audit.rules.assignedPaths = entries => entries.filter(entry => Audit.text.hasAssignment(entry.line)).map(entry => ({ path: Audit.text.pathOf(entry.line), index: entry.index }));
Audit.rules.duplicatePaths = entries => Audit.rules.assignedPaths(entries).map((row, position, all) => ({ path: row.path, index: row.index, first: all.find(other => other.path === row.path).index })).filter(row => row.first !== row.index);
Audit.rules.reportPath = file => found => Audit.report(file, found.index, 'R22', found.path + ' is already assigned on line ' + (found.first + 1));
Audit.rules.uniquePaths = (file, entries) => Audit.rules.duplicatePaths(entries).forEach(Audit.rules.reportPath(file));
Audit.rules.arrowLines = entries => entries.filter(entry => Audit.shapes.nameOf(entry.line) === Audit.shapes.arrowName);
Audit.rules.reportStructure = file => found => Audit.report(file, found.index, 'R13', 'line is structurally identical to line ' + (found.first + 1));
Audit.rules.structuralUniqueness = (file, entries) => Audit.when(!Audit.exemptions.uniqueFiles.includes(file), () => Audit.rules.duplicateStructures(Audit.rules.arrowLines(entries)).forEach(Audit.rules.reportStructure(file)));
Audit.rules.duplicateStructures = entries => entries.map(entry => ({ key: Audit.text.structure(entry.line), index: entry.index })).map((row, position, all) => ({ index: row.index, first: all.find(other => other.key === row.key).index })).filter(row => row.first !== row.index);
Audit.rules.allowedLayers = layer => Audit.policy.layers.slice(0, Audit.policy.layers.indexOf(layer) + 1).concat(Audit.exemptions.dependencies[layer] || []);
Audit.rules.referencedLayers = line => (Audit.text.masked(line).match(/Weave\.library\.(\w+)/g) || []).map(found => found.split('.')[2]);
Audit.rules.dependencies = (file, entries) => entries.filter(entry => Audit.text.hasAssignment(entry.line)).filter(entry => Audit.policy.layers.includes(Audit.text.layerOf(entry.line))).forEach(entry => Audit.rules.checkDependencies(file, entry));
Audit.rules.checkDependencies = (file, entry) => Audit.rules.referencedLayers(entry.line).filter(layer => !Audit.rules.allowedLayers(Audit.text.layerOf(entry.line)).includes(layer)).forEach(layer => Audit.report(file, entry.index, 'R14', Audit.text.layerOf(entry.line) + ' may not call ' + layer));
Audit.rules.naming = (file, entries) => entries.filter(entry => Audit.text.hasAssignment(entry.line) && !Audit.shapes.root(entry.line.trim())).forEach(entry => Audit.rules.checkName(file, entry));
Audit.rules.checkName = (file, entry) => Audit.reportWhen(Audit.rules.isBadName(Audit.text.leafOf(entry.line)), file, entry.index, 'R15', 'name ' + Audit.text.leafOf(entry.line));
Audit.rules.isBadName = name => !/^[a-z][a-zA-Z0-9]*$/.test(name) || Audit.policy.abbreviations.includes(name);
Audit.rules.predicateNames = (file, entries) => entries.filter(entry => Audit.text.pathOf(entry.line).startsWith('Weave.library.predicates.') && Audit.text.depthOf(entry.line) === 4).forEach(entry => Audit.rules.checkPredicateName(file, entry));
Audit.rules.isBadPredicateName = name => !/^(is|has|can)/.test(name) && !Audit.exemptions.predicateNames.includes(name);
Audit.rules.checkPredicateName = (file, entry) => Audit.reportWhen(Audit.rules.isBadPredicateName(Audit.text.leafOf(entry.line)), file, entry.index, 'R15', 'predicate ' + Audit.text.leafOf(entry.line) + ' is not a question');
Audit.rules.groupComments = (file, entries) => entries.filter(entry => Audit.shapes.namespace(entry.line) && Audit.text.depthOf(entry.line) === 3).forEach(entry => Audit.rules.checkComment(file, entry));
/* commentsBefore: the comment line numbers of each audited file, filled before the rules run. */
Audit.rules.commentsBefore = {};
/* sourcesOf: the whole text of each file, for the rules that ask whether anything else names a row. */
Audit.rules.sourcesOf = {};
Audit.rules.recordSource = (file, source) => Audit.rules.sourcesOf[file] = source;
Audit.rules.styleRows = (file, entries) => Audit.style.check(file, Audit.control.defaultSource(Audit.rules.sourcesOf[file]), entries);
Audit.rules.checkComment = (file, entry) => Audit.reportWhen(!Audit.rules.commentsBefore[file].includes(entry.index - 1), file, entry.index, 'R19', 'namespace has no group comment');
Audit.rules.recordComments = (file, source) => Audit.rules.commentsBefore[file] = Audit.text.lines(source).map((line, index) => ({ line, index })).filter(entry => Audit.text.isComment(entry.line)).map(entry => entry.index);
Audit.rules.applicationRoots = ['Weave.application', 'Weave.tests', 'Weave.kit'];
Audit.rules.isApplicationLine = line => Audit.rules.applicationRoots.some(root => Audit.text.pathOf(line).startsWith(root));
Audit.rules.checkIsolation = (file, entry) => name => Audit.reportWhen(Audit.text.hasToken(entry.line, name), file, entry.index, 'R20', 'application code names the global ' + name);
Audit.rules.applicationIsolation = (file, entries) => entries.filter(entry => Audit.rules.isApplicationLine(entry.line)).forEach(entry => Audit.policy.globals.forEach(Audit.rules.checkIsolation(file, entry)));
Audit.rules.order = ['oneStatement', 'applicationIsolation', 'qualified', 'shape', 'length', 'declarations', 'statements', 'branching', 'throwAndTry', 'globals', 'builtins', 'aliases', 'literalUniqueness', 'structuralUniqueness', 'dependencies', 'naming', 'predicateNames', 'groupComments', 'styleRows', 'uniquePaths'];

/* tables: the tables section 13 of the spec requires, checked to exist and to have rows. */
Audit.tables = {};
Audit.tables.required = ['Weave.library.composition.htmlEscapes', 'Weave.library.predicates.typeNames', 'Weave.library.predicates.instanceTests', 'Weave.library.control.errors', 'Weave.library.control.constants', 'Weave.library.browser.keywords', 'Weave.library.browser.properties', 'Weave.library.browser.selectors', 'Weave.library.browser.keyNames', 'Weave.library.browser.namespaces', 'Weave.library.browser.positions', 'Weave.library.browser.readyStates', 'Weave.library.browser.nodeTypes', 'Weave.library.browser.mediaQueries', 'Weave.library.browser.mimeTypes', 'Weave.library.browser.httpMethods', 'Weave.library.elements.setters', 'Weave.library.elements.tags', 'Weave.library.elements.voidTags', 'Weave.library.elements.svgTags', 'Weave.library.elements.inputTypes', 'Weave.library.elements.insertionPositions', 'Weave.library.attributes.booleanAttributes', 'Weave.library.attributes.valueReaders', 'Weave.library.attributes.valueWriters', 'Weave.library.style.unitlessProperties', 'Weave.library.style.defaultDisplays', 'Weave.library.style.boxParts', 'Weave.library.style.boxSides', 'Weave.library.events.types', 'Weave.library.events.getters', 'Weave.library.events.nativeTriggers', 'Weave.library.effects.defaults', 'Weave.library.effects.easings', 'Weave.library.effects.presets', 'Weave.library.forms.validators', 'Weave.library.forms.messages', 'Weave.library.network.defaults', 'Weave.library.network.parsers', 'Weave.library.observers.mutationOptions', 'Weave.library.storage.cookieOptions', 'Weave.library.storage.backends', 'Weave.library.navigation.protocols', 'Weave.library.navigation.routeModes', 'Weave.library.interaction.pointerTypes', 'Weave.library.interaction.directions', 'Weave.library.interaction.modifierNames', 'Weave.library.accessibility.roles', 'Weave.library.accessibility.states', 'Weave.library.accessibility.politeness', 'Weave.library.accessibility.auditRules', 'Weave.library.collections.kinds', 'Weave.library.collections.lifts', 'Weave.library.collections.unlifted', 'Weave.library.components.parts', 'Weave.library.components.blueprints', 'Weave.library.components.handlers', 'Weave.library.components.tokens', 'Weave.library.components.values', 'Weave.library.components.rules', 'Weave.library.components.states', 'Weave.library.components.stateRules', 'Weave.library.patterns.labels', 'Weave.library.patterns.todoFilters', 'Weave.library.patterns.stacks', 'Weave.library.patterns.timeTravel', 'Weave.library.patterns.phases', 'Weave.library.patterns.panes', 'Weave.library.patterns.defaults', 'Weave.library.dates.units', 'Weave.library.dates.spans', 'Weave.library.dates.names', 'Weave.library.dates.marks', 'Weave.library.dates.starts', 'Weave.library.dates.adders', 'Weave.library.browser.dateParts', 'Weave.library.formatting.numberStyles', 'Weave.library.formatting.notations', 'Weave.library.formatting.unitNames', 'Weave.library.formatting.dateStyles', 'Weave.library.formatting.fieldStyles', 'Weave.library.components.themes', 'Weave.library.components.tones', 'Weave.library.components.toneRules', 'Weave.library.components.keyframes', 'Weave.library.components.interactive', 'Weave.library.components.pressable', 'Weave.library.components.variants', 'Weave.library.components.breakpoints', 'Weave.library.components.mediaRules', 'Weave.library.components.hostSelectors', 'Weave.library.components.hostRules', 'Weave.library.components.sheetExtras', 'Weave.library.components.sizes', 'Weave.library.overlays.tipEvents', 'Weave.library.auth.labels', 'Weave.library.auth.notes', 'Weave.library.auth.fields', 'Weave.library.auth.screens', 'Weave.library.auth.checks', 'Weave.library.auth.expressions'];
Audit.tables.rowCount = (entries, table) => entries.filter(entry => Audit.text.pathOf(entry.line).startsWith(table + '.')).length;
Audit.tables.check = (file, entries) => Audit.tables.required.forEach(table => Audit.reportWhen(Audit.tables.rowCount(entries, table) === 0, file, 0, 'R16', 'table ' + table + ' has no rows'));

/* catalog: every assigned path in the bundle, emitted for the documentation contract. */
Audit.catalog = {};
Audit.catalog.isArrow = line => Audit.shapes.nameOf(line) === Audit.shapes.arrowName;
Audit.catalog.head = line => Audit.text.masked(Audit.text.right(line)).split(Audit.text.arrowToken)[0].trim();
Audit.catalog.signature = line => Audit.either(Audit.catalog.isArrow(line), () => Audit.catalog.head(line), () => '');
Audit.catalog.rowFor = entry => ({ path: Audit.text.pathOf(entry.line), layer: Audit.text.layerOf(entry.line), shape: Audit.shapes.nameOf(entry.line), takes: Audit.catalog.signature(entry.line), line: entry.index + 1 });
Audit.catalog.rows = entries => entries.filter(entry => Audit.text.hasAssignment(entry.line)).map(Audit.catalog.rowFor);
Audit.catalog.emit = (file, entries) => Audit.platform.write(file, JSON.stringify(Audit.catalog.rows(entries), null, 2) + '\n');

/* run: audit every file, print every finding, exit non-zero when anything failed. */
Audit.run = {};
Audit.run.files = ['dist/weave.js', 'audit.js', 'tests/tests.js', 'demos/kit.js'];
Audit.run.applications = ['sample.html', 'todo.html', 'tests.html', 'studio.html', 'styleguide.html', 'apps/relay.html', 'apps/pantry.html', 'demos/index.html', 'demos/crm.html', 'demos/board.html', 'demos/helpdesk.html', 'demos/warehouse.html', 'demos/school.html', 'demos/clinic.html', 'demos/agenda.html', 'demos/tenants.html', 'demos/kit.html', 'demos/elements.html', 'demos/patterns.html', 'demos/account.html', 'demos/bank.html', 'demos/shop.html', 'demos/tailor.html'];
Audit.run.auditMarkup = file => Audit.run.withSource(file, Audit.text.scriptSource(Audit.platform.read(file)));
Audit.run.auditFile = file => Audit.run.withSource(file, Audit.platform.read(file));
Audit.run.withSource = (file, source) => Audit.run.applyRules(file, Audit.codeLines(source), Audit.rules.recordComments(file, source), Audit.rules.recordSource(file, source));
Audit.run.applyRules = (file, entries, ignoredComments, ignoredSource) => Audit.rules.order.forEach(name => Audit.rules[name](file, entries));
Audit.run.bundle = () => Audit.tables.check('dist/weave.js', Audit.codeLines(Audit.platform.read('dist/weave.js')));
Audit.run.catalog = () => Audit.catalog.emit('catalog.json', Audit.codeLines(Audit.platform.read('dist/weave.js')));
Audit.run.all = () => (Audit.run.files.filter(Audit.platform.exists).forEach(Audit.run.auditFile), Audit.run.applications.filter(Audit.platform.exists).forEach(Audit.run.auditMarkup), Audit.run.bundle(), Audit.run.catalog(), Audit.run.finish());
Audit.run.finish = () => (Audit.findings.forEach(Audit.platform.print), Audit.platform.print(Audit.findings.length + ' findings'), Audit.platform.exit(Audit.findings.length === 0 ? 0 : 1));
Audit.run.all();
