/* auth: the screens an application shows before it shows anything else, and the session they leave behind. */
Weave.library.auth = {};

/* labels: the only place a word an authentication screen shows is written. One row, one word. */
Weave.library.auth.labels = {};
Weave.library.auth.labels.signIn = 'Sign in';
Weave.library.auth.labels.signUp = 'Create an account';
Weave.library.auth.labels.signOut = 'Sign out';
Weave.library.auth.labels.forgot = 'Forgot your password?';
Weave.library.auth.labels.reset = 'Choose a new password';
Weave.library.auth.labels.verify = 'Enter your code';
Weave.library.auth.labels.verifySubmit = 'Verify';
Weave.library.auth.labels.sendLink = 'Send the reset code';
Weave.library.auth.labels.backToSignIn = 'Back to sign in';
Weave.library.auth.labels.email = 'Email';
Weave.library.auth.labels.password = 'Password';
Weave.library.auth.labels.confirmation = 'Confirm password';
Weave.library.auth.labels.person = 'Your name';
Weave.library.auth.labels.code = 'Verification code';
Weave.library.auth.labels.strength = 'Password strength';
Weave.library.auth.labels.signedInAs = 'Signed in as ';
Weave.library.auth.labels.account = 'Account';

/* notes: one line under each screen title, saying what the screen is about to do. */
Weave.library.auth.notes = {};
Weave.library.auth.notes.signIn = 'Welcome back. Your session is kept until you sign out.';
Weave.library.auth.notes.signUp = 'A code goes to your address before the account opens.';
Weave.library.auth.notes.forgot = 'Tell us the address and we will send a code to it.';
Weave.library.auth.notes.verify = 'Six digits, from the message that has just arrived.';
Weave.library.auth.notes.reset = 'Choose something long. The meter says how it is doing.';

/* fields: one row per field any screen asks for, holding its label, its type and the rules it must pass. */
Weave.library.auth.fields = {};
Weave.library.auth.fields.person = { name: 'person', label: Weave.library.auth.labels.person, rules: { required: true, minLength: 2 } };
Weave.library.auth.fields.email = { name: 'email', label: Weave.library.auth.labels.email, type: Weave.library.elements.inputTypes.email, rules: { required: true, email: true } };
Weave.library.auth.fields.password = { name: 'password', label: Weave.library.auth.labels.password, type: Weave.library.elements.inputTypes.password, rules: { required: true, minLength: 8 } };
Weave.library.auth.fields.confirmation = { name: 'confirmation', label: Weave.library.auth.labels.confirmation, type: Weave.library.elements.inputTypes.password, rules: { required: true, sameAs: Weave.library.auth.fields.password.name } };
Weave.library.auth.fields.code = { name: 'code', label: Weave.library.auth.labels.code, rules: { required: true, minLength: 6 } };

/* names: the only place a screen is named. Every row that points at a screen points at one of these. */
Weave.library.auth.names = {};
Weave.library.auth.names.signIn = 'signIn';
Weave.library.auth.names.signUp = 'signUp';
Weave.library.auth.names.forgot = 'forgot';
Weave.library.auth.names.verify = 'verify';
Weave.library.auth.names.reset = 'reset';

/* screens: one row per screen, naming what it asks for, what its button says, where it goes and what it links to. */
Weave.library.auth.screens = {};
Weave.library.auth.screens.signIn = { title: Weave.library.auth.labels.signIn, note: Weave.library.auth.notes.signIn, fields: [Weave.library.auth.fields.email, Weave.library.auth.fields.password], submit: Weave.library.auth.labels.signIn, links: [Weave.library.auth.names.forgot, Weave.library.auth.names.signUp] };
Weave.library.auth.screens.signUp = { title: Weave.library.auth.labels.signUp, note: Weave.library.auth.notes.signUp, fields: [Weave.library.auth.fields.person, Weave.library.auth.fields.email, Weave.library.auth.fields.password, Weave.library.auth.fields.confirmation], submit: Weave.library.auth.labels.signUp, meter: true, next: Weave.library.auth.names.verify, links: [Weave.library.auth.names.signIn] };
Weave.library.auth.screens.forgot = { title: Weave.library.auth.labels.forgot, note: Weave.library.auth.notes.forgot, fields: [Weave.library.auth.fields.email], submit: Weave.library.auth.labels.sendLink, next: Weave.library.auth.names.verify, links: [Weave.library.auth.names.signIn] };
Weave.library.auth.screens.verify = { title: Weave.library.auth.labels.verify, note: Weave.library.auth.notes.verify, fields: [Weave.library.auth.fields.code], submit: Weave.library.auth.labels.verifySubmit, code: true, next: Weave.library.auth.names.reset, links: [Weave.library.auth.names.signIn] };
Weave.library.auth.screens.reset = { title: Weave.library.auth.labels.reset, note: Weave.library.auth.notes.reset, fields: [Weave.library.auth.fields.password, Weave.library.auth.fields.confirmation], submit: Weave.library.auth.labels.reset, meter: true, next: Weave.library.auth.names.signIn, links: [Weave.library.auth.names.signIn] };

/* links: the words a screen is linked to by, which is its own title unless a row here says otherwise. */
Weave.library.auth.linkLabels = {};
Weave.library.auth.linkLabels.signIn = Weave.library.auth.labels.backToSignIn;
Weave.library.auth.screenOf = name => Weave.library.auth.screens[name];
Weave.library.auth.linkOf = name => Weave.library.control.defaultTo(Weave.library.components.titleOf(Weave.library.auth.screenOf(name)))(Weave.library.auth.linkLabels[name]);

/* strength: one row per thing a password can carry, so the meter counts rows and never runs a formula. */
Weave.library.auth.expressions = {};
Weave.library.auth.expressions.letter = /[a-z]/;
Weave.library.auth.expressions.capital = /[A-Z]/;
Weave.library.auth.expressions.digit = /[0-9]/;
Weave.library.auth.expressions.symbol = /[^a-zA-Z0-9]/;
Weave.library.auth.longEnough = 12;
Weave.library.auth.checks = {};
Weave.library.auth.checks.long = word => String(word).length >= Weave.library.auth.longEnough;
Weave.library.auth.checks.letter = word => Weave.library.auth.expressions.letter.test(String(word));
Weave.library.auth.checks.capital = word => Weave.library.auth.expressions.capital.test(String(word));
Weave.library.auth.checks.digit = word => Weave.library.auth.expressions.digit.test(String(word));
Weave.library.auth.checks.symbol = word => Weave.library.auth.expressions.symbol.test(String(word));
Weave.library.auth.checkCount = () => Weave.library.composition.keys(Weave.library.auth.checks).length;
Weave.library.auth.score = word => Weave.library.composition.values(Weave.library.auth.checks).filter(check => check(word)).length;
Weave.library.auth.strengthTones = [Weave.library.components.toneNames.danger, Weave.library.components.toneNames.danger, Weave.library.components.toneNames.warning, Weave.library.components.toneNames.warning, Weave.library.components.toneNames.success, Weave.library.components.toneNames.success];
Weave.library.auth.toneFor = word => Weave.library.auth.strengthTones[Weave.library.auth.score(word)];
Weave.library.auth.strengthBar = word => Weave.library.components.progressBar({ value: Weave.library.auth.score(word), total: Weave.library.auth.checkCount(), tone: Weave.library.auth.toneFor(word) });
Weave.library.auth.strengthMeter = word => Weave.library.components.stack({ children: [Weave.library.components.hint({ text: Weave.library.auth.labels.strength }), Weave.library.auth.strengthBar(word)] });

/* the gate: one pattern holding the screen, what has been typed and what was wrong with it. The screen moves before the caller is told, so a caller that takes the gate off the page is the last thing to happen. */
Weave.library.auth.gateState = spec => ({ screen: Weave.library.control.defaultTo(Weave.library.auth.names.signIn)(spec.screen), values: {}, errors: {} });
Weave.library.auth.gateScreen = state => Weave.library.auth.screenOf(state.screen);
Weave.library.auth.goTo = (update, name) => () => update(() => ({ screen: name, values: {}, errors: {} }));
Weave.library.auth.linkRow = update => name => ({ label: Weave.library.auth.linkOf(name), variant: Weave.library.auth.linkVariant, onAction: Weave.library.auth.goTo(update, name) });
Weave.library.auth.linkVariant = 'link';
Weave.library.auth.linkButton = update => name => Weave.library.components.actionButton(Weave.library.auth.linkRow(update)(name));
Weave.library.auth.linkBar = (state, update) => Weave.library.components.row({ children: Weave.library.auth.gateScreen(state).links.map(Weave.library.auth.linkButton(update)) });
Weave.library.auth.handled = (spec, state, values) => Weave.library.control.defaultTo(Weave.library.composition.noop)(spec.onDone)(state.screen, values);
Weave.library.auth.moved = state => ({ screen: Weave.library.control.defaultTo(state.screen)(Weave.library.auth.gateScreen(state).next), values: {}, errors: {} });
Weave.library.auth.accepted = (spec, state, update, values) => (update(() => Weave.library.auth.moved(state)), Weave.library.auth.handled(spec, state, values));
Weave.library.auth.refused = (update, values, errors) => update(() => ({ values, errors }));
Weave.library.auth.judged = (spec, state, update, values, errors) => Weave.library.control.either(() => Weave.library.patterns.isClean(errors), () => Weave.library.auth.accepted(spec, state, update, values), () => Weave.library.auth.refused(update, values, errors))(values);
Weave.library.auth.gateSubmit = (spec, state, update) => values => Weave.library.auth.judged(spec, state, update, values, Weave.library.patterns.problemsOf(Weave.library.auth.gateScreen(state), values));
Weave.library.auth.gateField = state => field => Weave.library.patterns.entryField(state)(field);
Weave.library.auth.gateFields = state => Weave.library.auth.gateScreen(state).fields.map(Weave.library.auth.gateField(state));
Weave.library.auth.typedPassword = state => Weave.library.control.defaultTo(Weave.library.browser.keywords.empty)(state.values[Weave.library.auth.fields.password.name]);
Weave.library.auth.gateMeter = state => Weave.library.control.maybe(() => Weave.library.auth.strengthMeter(Weave.library.auth.typedPassword(state)))(Weave.library.auth.gateScreen(state).meter);
Weave.library.auth.gateForm = (spec, state, update) => Weave.library.components.form({ submit: Weave.library.auth.gateScreen(state).submit, fields: Weave.library.auth.gateFields(state), onSubmit: Weave.library.auth.gateSubmit(spec, state, update) });
Weave.library.auth.gateTitle = state => Weave.library.components.title({ text: Weave.library.components.titleOf(Weave.library.auth.gateScreen(state)) });
Weave.library.auth.gateNote = state => Weave.library.components.note({ text: Weave.library.components.noteOf(Weave.library.auth.gateScreen(state)) });
Weave.library.auth.gateHead = state => Weave.library.components.stack({ children: [Weave.library.auth.gateTitle(state), Weave.library.auth.gateNote(state)] });
Weave.library.auth.gateParts = (spec, state, update) => Weave.library.composition.compact([Weave.library.auth.gateHead(state), Weave.library.auth.gateForm(spec, state, update), Weave.library.auth.gateMeter(state), Weave.library.auth.linkBar(state, update)]);
Weave.library.auth.gateBody = spec => (state, update) => Weave.library.components.panel({ width: Weave.library.components.markNames.width.gate, children: Weave.library.auth.gateParts(spec, state, update) });
Weave.library.auth.gate = spec => Weave.library.patterns.view(Weave.library.auth.gateBody(spec), Weave.library.auth.gateState(spec));
Weave.library.auth.gateAt = name => (spec = {}) => Weave.library.auth.gate(Weave.library.composition.merge(spec, { screen: name }));
Weave.library.auth.gates = {};
Weave.library.composition.defineEach(Weave.library.auth.gates, (row, name) => Weave.library.auth.gateAt(name))(Weave.library.auth.screens);

/* session: who is signed in, in one store, so every view of it agrees and a reload does not forget. */
Weave.library.auth.sessionKey = 'weave-session';
Weave.library.auth.personKey = 'person';
Weave.library.auth.emptySession = () => ({ [Weave.library.auth.personKey]: undefined });
Weave.library.auth.sessionIn = (view, key) => Weave.library.patterns.persistIn(view, key)(Weave.library.patterns.store(Weave.library.auth.emptySession()));
Weave.library.auth.session = (key = Weave.library.auth.sessionKey) => Weave.library.auth.sessionIn(Weave.library.storage.local, key);
Weave.library.auth.personOf = session => session.state[Weave.library.auth.personKey];
Weave.library.auth.isSignedIn = session => Weave.library.predicates.isDefined(Weave.library.auth.personOf(session));
Weave.library.auth.signIn = session => person => session.update(() => ({ [Weave.library.auth.personKey]: person }));
Weave.library.auth.signOut = session => () => session.update(Weave.library.auth.emptySession);
Weave.library.auth.forget = key => Weave.library.patterns.forget(Weave.library.control.defaultTo(Weave.library.auth.sessionKey)(key));

/* guard: the one place an application asks whether to show itself or the gate. */
Weave.library.auth.guardPane = (spec, state) => Weave.library.control.either(() => Weave.library.predicates.isDefined(state[Weave.library.auth.personKey]), () => spec.signedIn(state[Weave.library.auth.personKey]), () => spec.signedOut())(state);
Weave.library.auth.guardBody = spec => state => Weave.library.components.holder({ children: [Weave.library.auth.guardPane(spec, state)] });
Weave.library.auth.guard = spec => Weave.library.patterns.connect(spec.session)(Weave.library.auth.guardBody(spec));

/* accountMenu: the button every signed in page carries, with sign out as its last row. */
Weave.library.auth.accountRows = spec => Weave.library.control.defaultTo([])(spec.items).concat([{ label: Weave.library.auth.labels.signOut, onAction: spec.onSignOut }]);
Weave.library.auth.accountLabel = spec => Weave.library.control.defaultTo(Weave.library.auth.labels.account)(spec.person);
Weave.library.auth.accountMenu = spec => Weave.library.components.actionButton({ label: Weave.library.auth.accountLabel(spec), onAction: Weave.library.patterns.menuAt({ items: Weave.library.auth.accountRows(spec) }) });
Weave.library.auth.welcome = spec => Weave.library.components.note({ text: Weave.library.auth.labels.signedInAs + Weave.library.auth.accountLabel(spec) });
