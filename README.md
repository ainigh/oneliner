# Weave

A DOM library with jQuery's coverage, a component set and a pattern set on top of it, written so
that **every idea exists in exactly one place**.

`grep` is the documentation. Every definition is a fully qualified assignment on one line, so
`grep 'Weave.library.style.show' src/` finds the definition and every call site, and nothing else.

```html
<script src="dist/weave.js"></script>
```

## The one rule under all the others

Radical elimination of redundancy. Not "don't repeat yourself" as a habit — as the thing the whole
project is for. One place per idea, and the same discipline at every altitude:

- The string `'div'` is written once in the whole system, as a key in `elements.tags`. Nothing else
  spells a tag — `grep -rn "'div'" src/` returns nothing at all.
- A component never spells a tag either. It names a **part**, and `components.parts` is the one
  place a part chooses its builder. Change `parts.box` and every box in every widget changes.
- A component never spells a class. Its key **is** its class, through `components.classOf`.
- No dimension, colour or duration is written twice in the component system: `components.tokens` is
  the only place any of them exists, and every rule refers to a token, never a value. (The one
  literal style block left in the library is `accessibility.visuallyHidden`, which is a fixed
  platform recipe and must not be themeable.)
- A spec key becomes a DOM listener in exactly one place, `components.handlers`. Fix how a listener
  is attached and every widget in the system is fixed at once.
- A stateful pattern repaints in exactly one place, `patterns.view`. Focus survives a repaint
  because that one function restores it, not because nine patterns each remembered to.

The bet this makes is deliberate and it cuts both ways: **if any part breaks, it likely breaks
everything that depends on it.** A wrong `parts.box` is not a subtle bug in one screen; it is every
screen, loudly, in the first test that runs. That is the trade. You give up the blast radius of a
local mistake and you buy back the certainty that a fix is complete — there is no second place
holding the old behaviour, and no third place you forgot to look. The suite is built to collect on
that bet: `npm run audit:rows` deletes each table row in turn and asserts that exactly the feature
that row names disappears.

The audit enforces this rather than trusting it. R12 fails the build when a string literal appears
twice in the same bucket, and R13 fails it when two one-liners are structurally identical. Both
findings mean the same thing: *this belongs in a table.* Every table in the system was written
because the audit refused the alternative.

### Where to change one thing

| To change | Edit exactly | Nothing else |
|---|---|---|
| what tag a `div` component is | `components.parts.box` | — |
| the padding of every card | `components.tokens.space` | — |
| how a class name is spelled | `components.classOf` | — |
| how a spec key becomes a listener | `components.handlers` | — |
| what a button looks like | `components.rules.button` | — |
| how any stateful pattern repaints | `patterns.view` | — |
| how a repaint decides what to keep | `elements.morph` | — |
| the dark palette | `components.themes.dark` | — |
| what a tone colour is | `components.tokens.tone*` | — |
| how a class spends a tone | `components.toneRules` | — |
| what a pattern falls back on | `patterns.defaults` | — |
| what a modifier value does | the table `components.modifiers` names | — |
| how tight the whole system sits | `components.densities` | — |
| what a screen asks for on the way in | `auth.screens` | — |
| how a request's phase is drawn | `patterns.panes` | — |
| the word "Add" everywhere | `patterns.labels.add` | — |
| how an attribute selector is built | `query.attributeSelector` | — |
| which errors the library can produce | `control.errors` | — |

## The form rules, on one screen

1. One statement per line. Every line ends in `;`.
2. Every definition is a fully qualified assignment: `Weave.<layer>.<group>.<name> = ...;`. The only declaration in the library is `const Weave = {};`.
3. Every function is a one-liner arrow function. Too long means split into more named one-liners, never wrap.
4. No local variables. Intermediate values become named functions; default parameters are the one exception.
5. No `if`, `switch`, `for`, `while`, `do`. Branching goes through `Weave.library.control.*`; iteration through `map` / `reduce` / `filter` / `forEach` or `control.unfold` / `control.until`.
6. Full English words. Predicates start with `is` / `has` / `can`. Actions are verbs. Getters are nouns. Tables are plural nouns.
7. Tables before code. Two lines that differ only by a literal become a table plus one generator call.
8. Every browser-concept literal is written exactly once, in a table.
9. One group comment per group. No per-function comments — the name is the comment.
10. No aliases. Every call site spells the full path.
11. `? :`, `&&`, `||`, `??` and `?.` live only in `Weave.library.control`.
12. `throw` appears once (`control.fail`), `try` appears once (`control.attempt`).
13. No `async` / `await` — Promise chains only. 14. No `this`. 15. `new` only in `browser` and `composition`.
16. Nothing is written that nothing spends. A design token no rule references, or a CSS keyword nothing uses, is a build failure.

## The two flagship applications

`apps/relay.html` and `apps/pantry.html` are the proof that the library is usable, and the reason
most of it exists. They are as unlike each other as two applications can be, so that a capability
which only works by accident in one is caught by the other. Both are written only against
`Weave.library.*`, both are audited under the same rules as the library with no new exemptions, and
`scripts/check-flagships.js` drives both through fifty-one assertions.

| | Relay | Pantry |
|---|---|---|
| shape | a dense, keyboard-driven team inbox | thumb-first ordering from a kitchen |
| layout | a three pane shell, fixed to the viewport | a bounded page and a bar for the thumb |
| scale | twelve hundred threads, a few dozen rows in the document | twelve dishes, and skeletons before them |
| over the page | a compose dialog, a command palette, a help sheet | a dish dialog, a basket that is a sheet on a phone and a drawer on a desk |
| input | j, k, c, ?, ctrl+k, and a search that filters as you type | radio sets that reprice, a stepper, a validated checkout |
| feedback | a pinned toast carrying an undo | a step track that advances on its own |

`apps.md` says what each one had to be able to do. Every gap either of them uncovered is written
down in `checklist.md` beside the row that closed it.

## The layers

`composition` → `predicates` → `control` → `browser` → `elements` → `query` → `attributes` → `style` →
`events` → `timing` → `dates` → `formatting` → `effects` → `forms` → `network` → `observers` →
`storage` → `navigation` → `interaction` → `accessibility` → `collections` → `components` →
`overlays` → `patterns` → `auth`, then `application`.

`browser` is the only layer that names a global — `Date` and `Intl` included, which is why `dates`
does calendar arithmetic with no locale in it and `formatting` does locale with no arithmetic in it.
`collections` lifts every layer below it. `components` turns one spec into one element. `overlays`
is the only layer that positions anything, and the only one that puts a node above the page.
`patterns` gives a component state. `auth` is the one layer above them: the screens an application
shows before it shows anything else. An application composes patterns and holds data — nothing else.

## Components and patterns

A component is a function from one spec to one element. It is the whole widget, not a piece of one.

```js
Weave.library.components.table({ columns: [{ key: 'name', label: 'Name' }], rows: people });
Weave.library.components.field({ label: 'Email', name: 'email', type: 'email' });
Weave.library.components.tabs({ active: 'open', items: [{ key: 'open', label: 'Open', onAction: show }] });
```

Containers come from one table, so adding `blueprints.pill = parts.inline` adds
`components.pill(spec)` with its own class and its own row in the stylesheet. Composite widgets —
`table`, `menu`, `tabs`, `tree`, `form`, `modal`, `pagination`, `accordion`, `alert`, `dropdown`,
`tooltip`, `switchField`, `sliderField`, `stepperField`, `kbd`, `badge`, `skeleton`, `avatarGroup`,
`statusDot`, `navbar`, `listGroup`, `inputGroup`, `buttonGroup`, `segmented`, `spinner`,
`descriptions`, `quote`, `banner`, `rating`, `chip`, `timeline`, `passwordField`, `codeField` — are
built from those same containers and never reach past them. The chart widgets — `chart`, `legend`,
`sparkline`, `lineChart`, `axis`, `barChart`, `rankBars`, `donut`, `heatmap`, `heatScale` and
`trend` — are the same idea again: a reading in, an element out, with no caller ever naming a
colour. The written widgets — `prose`, `callout`, `contents`, `codeListing`, `pager`, `diff`,
`diffStat`, `comment`, `commentThread` and `dropzone` — carry a page of words and a page of diff
the same way.

The showcase widgets — a hero, features, plans, a window frame, a bento grid, a side rail, metrics,
area charts, gauges, funnels and more — are described under *The showcase wave* below.

`demos/elements.html` draws every one of them, live, with the call that draws it underneath.

A pattern is a component with state. Every one returns the same handle, `{ element, state, update }`,
and every one repaints through `patterns.view`:

```js
Weave.library.patterns.mount(host)(Weave.library.patterns.todoList({ title: 'Tasks', items }));
Weave.library.patterns.mount(host)(Weave.library.patterns.board({ columns: lanes, cards }));
Weave.library.patterns.dataGrid({ title: 'Stock', pageSize: 8, columns, rows });
Weave.library.patterns.masterDetail({ items, detail: person => Weave.library.components.note({ text: person.bio }) });
```

The set is `todoList`, `board`, `dataGrid`, `masterDetail`, `wizard`, `commandPalette`, `chat`,
`explorer`, `dashboard`, `calendar`, `virtualList`, `virtualGrid`, `resource`, `entryForm`,
`notifications`, `tabsView`, `carousel`, `combobox`, `inlineEdit`, `chipFilter`, `chartBoard` and
`passwordField` — `demos/patterns.html` runs all of them on one page. A pattern only ever composes components and other patterns, so a fix to
`components.table` lands in `dataGrid`, in `virtualGrid`, in `calendar`, in every demo that uses
one, and nowhere twice.

`update` takes a function of the current state, so a repaint can never read a stale one:

```js
Weave.application.close = handle => handle.update(state => ({ open: state.open.filter(isDone) }));
```

## A repaint keeps what still matches

`patterns.view` does not empty the host and rebuild it. It calls `elements.morph`, which patches the
live tree into the shape of a freshly rendered one and keeps every node that still matches: a caret
stays where it was, a scroll offset survives, an open `<details>` stays open. Give a repeated child
`data: { key }` and the key decides the match, so a reordered list moves its nodes instead of
rebuilding them. Listeners are rewired from the fresh tree every time — that is what keeps a handler
closing over current state, and it means a listener attached from outside the render does not
survive a repaint.

`elements.liveProperties` is the one place the properties the platform stops mirroring from
attributes — `value`, `checked`, `selected`, `disabled` — are named.

## State that outlives one pattern

Four decorators take a handle **or** a store, because both answer to `state` and `update`:

```js
Weave.application.store = Weave.library.patterns.persist('desk')(Weave.library.patterns.withHistory(Weave.library.patterns.store({ rows })));
Weave.application.queue = Weave.library.patterns.connect(Weave.application.store)(Weave.application.render);
```

| Decorator | What it adds |
|---|---|
| `patterns.store` / `patterns.connect` | one state many views watch, so two views of one dataset stop copying it |
| `patterns.withHistory` | `undo`, `redo`, `canUndo`, `canRedo` — two rows of `patterns.timeTravel`, one stack each way |
| `patterns.persistIn(view, key)` | writes state to any storage view on every update and shows what it finds on the way in; `persist(key)` is that against local storage |
| `patterns.linkTo(name)` | keeps one state key in the page address, so a view can be linked to |

### Composing patterns

A pattern owns its element. Build it once, put it on the page once, and let it repaint itself. A
pattern built **inside** another pattern's render is rebuilt on every repaint of the parent, which
throws away the state it was holding — so when two views need the same data, the answer is not to
nest them but to give them one store:

```js
Weave.application.shop = Weave.library.patterns.store({ rows: [], keys: [] });
Weave.application.shelf = () => Weave.library.patterns.connect(Weave.application.shop)(Weave.application.tiles).element;
Weave.application.bar = () => Weave.library.patterns.connect(Weave.application.shop)(Weave.application.count).element;
```

`demos/shop.html` is that shape with two views, and `demos/travel.html` is the same shape taken all
the way: one store holds the step as well as the booking, so the wizard and the summary beside it
are drawn by one connected render and cannot disagree.

`patterns.stop(handle)` releases every subscription the handle collected and takes its element out
of the page. `studio.html` is the reference application for all of it.

## Three patterns that were missing a rung

`patterns.resource` makes a request a state rather than a branch. `patterns.phases` names the three
phases and `patterns.panes` holds one render each, so a fourth phase is a row:

```js
Weave.library.patterns.resource({ title: 'Stock', load: () => Weave.library.network.getJson('/api/stock'), ready: rows => Weave.library.components.table({ columns, rows }) });
```

`patterns.entryForm` wires `forms.validators` to the form component, so a rule that fails shows the
message that already sits beside it in `forms.messages`, and a submit is refused while anything is
broken.

`patterns.virtualList` renders a fixed window — the visible rows plus twice `patterns.defaults.overscan`
— however many items there are, with a full-height inner box so the scrollbar stays honest and
`timing.throttleFrame` so a scroll storm repaints once per frame. `patterns.virtualGrid` is that
under a search box. `dataGrid` is unchanged and still the right answer when the caller wants pages.

## Signing in

`auth` is the layer above `patterns`: what every application needs before it can show anything
else. It is tables the whole way down.

```js
Weave.application.session = Weave.library.auth.session();
Weave.application.gate = () => Weave.library.auth.gate({ onDone: Weave.application.finished }).element;
Weave.application.finished = (screen, values) => Weave.library.auth.signIn(Weave.application.session)(values.email);
Weave.application.guard = () => Weave.library.auth.guard({ session: Weave.application.session, signedOut: Weave.application.gate, signedIn: Weave.application.desk });
```

| Table | What it is the only place for |
|---|---|
| `auth.labels` / `auth.notes` | every word an authentication screen shows |
| `auth.fields` | one row per field any screen asks for, with its rules beside it |
| `auth.screens` | what a screen asks for, what its button says, where a good submit goes next, what it links to |
| `auth.checks` | one row per thing a password can carry — the strength meter counts rows |
| `auth.names` / `auth.linkLabels` | the name of a screen, and the words it is linked to by |

Five rows make the whole path: sign up leads to verify, verify to reset, reset back to sign in, and
forgot joins it at verify. `auth.gates` is generated from `auth.screens`, so `auth.gates.signUp()`
opens the flow on that screen and a new screen is a row that brings its own opener with it —
`npm run audit:rows` deletes each row and checks exactly that opener disappears.

The rest of the layer is small because the patterns underneath it are not: `auth.session` is one
persisted store, `auth.guard` the one place an application asks whether to show itself or the gate,
`auth.strengthMeter` a progress bar toned by `auth.score`, and `auth.accountMenu` the button that
ends in sign out. `demos/account.html` is all of it on one page.

## Styling

There is no stylesheet file. The sheet is generated from tables, and `components.sheetExtras` is the
one place that says which blocks it carries and in what order. `components.styleText()` renders it;
`components.installStyles()` injects it once, however many patterns are mounted.

`styleguide.html` is the live reference: every section on it is generated from the table it
documents, so the page cannot drift from the system.

| Table | What it is the only place for | How you use it |
|---|---|---|
| `components.tokens` | every dimension, colour, duration and face | change one row, the whole system moves |
| `components.values` | every bare CSS keyword | referenced by rules, never written twice |
| `components.rules` | one row per class, values may only be token references | change one row, one widget moves |
| `components.hostRules` | the rules on the document itself, keyed by `components.hostSelectors` | the page ground, its type and its margin |
| `components.nestRules` | one row per class-inside-a-class pair | a panel inside a panel drops its frame; a menu item becomes a row |
| `components.themes` | one row of token overrides per theme | `setTheme`, `toggleTheme`, `followScheme` |
| `components.tones` / `toneRules` | a tone's colour, and how a class spends it | one palette for `alert`, `statusDot`, anything toned |
| `components.variants` | one row per button intent | `actionButton({ label, variant })` |
| `components.interactive` / `pressable` | the classes that behave like controls | hover, focus, press and rest are generated onto them |
| `components.states` / `stateRules` | the only pseudo-classes and state attributes | `:hover`, `:focus-visible`, `:active`, `:disabled`, `aria-selected`, … |
| `components.breakpoints` | the only viewport width queries | named once, spent by `mediaRules` |
| `components.mediaRules` | one row per query, rules keyed by class | the compact layout, reduced motion, print |
| `components.keyframes` | the only place an animation timeline is written | referenced by a token, spent by a rule |
| `components.modifiers` | every data attribute a spec may carry, and what each value does | `card({ pad: 'wide', shape: 'round' })` |
| `components.densities` | a theme for measurements rather than colours | `setDensity('snug')` |
| `components.presets` | a named palette spent on the page or on one subtree | `usePreset('ocean')` |
| `components.sheetExtras` | the blocks the sheet carries, in cascade order | a later row wins; the compact block is last |

A theme is a row of token overrides. `components.themes.dark` is one, and the sheet carries a block
per theme plus a `prefers-color-scheme` block scoped so the operating system wins unless the page
has chosen. `components.setTheme(name)`, `components.toggleTheme()` and `components.followScheme()`
are the runtime side; the last returns its unsubscribe.

Focus, hover, press and rest are not written per widget. `components.interactive` names the classes
that behave like controls and `components.pressable` the subset that answers a pointer; the four
state styles are generated onto every one of them, so a new control gets the whole set by adding one
row. The same table drives the transition, emitted inside a `prefers-reduced-motion: no-preference`
block, so motion is asked for rather than opted out of.

`components.applyTokens(overrides)(element)` sets the same custom properties on one element, so a
section can be branded without a theme and without a rule:

```js
Weave.application.brand = panel => Weave.library.components.applyTokens({ accent: '#7c3aed', radius: '14px' })(panel);
```

### Asking for a look by name

No page writes a class and no page writes a rule. What a page does instead is ask, on the spec it
was already writing:

```js
Weave.library.components.card({ pad: 'wide', gap: 'tight', shape: 'round', children });
Weave.library.components.table({ grid: 'bordered', columns, rows });
Weave.library.components.column({ span: 'twoThirds', children });
Weave.library.components.actionButton({ label: 'Send', variant: 'primary', size: 'small', width: 'full' });
Weave.library.components.tag({ text: 'late', tone: 'warning' });
```

Every one of those keys is a row of `components.modifiers`, and every value a row of the table that
row names. A modifier may name several classes at once and may reach one class inside the class it
marks — which is how a table look is one row rather than three. `components.markNames` carries every
value as a name, so an application asks for one by name and never by string.

`tone` is read off every spec, not only the specs that ask for it, and `components.toneSpends` is
the one place a way of spending a tone is written — seven of them, shared by every toned class. `soft`
and `wash` mix the tone into a tint with `color-mix`, so a tag, a chip or an alert carries its tone
as a quiet field of colour rather than an outline.

### Four ways to change how it all looks

| Reach for | When | What it is |
|---|---|---|
| `components.configure(overrides)` | before the sheet is written | moves a token for the whole system |
| `components.setTheme(name)` | at runtime | one row of colour overrides on the document |
| `components.setDensity(name)` | at runtime | the same idea for measurements: `snug`, `roomy` |
| `components.usePreset(name)` / `applyTokens(overrides)(element)` | per page or per subtree | a palette, with no theme and no rule behind it |

`demos/tailor.html` wires all four to the page you are reading, so the effect of a row is one click
away.

To restyle the whole system, change tokens. To restyle one widget, change its row. To restyle every
widget at night, change one theme row. To restyle one subtree, set tokens on it.

## Charts

A chart is a component like any other: a spec in, an element out. No page picks a colour, a height
or a scale — those are library tables, and a reading becomes a length in exactly one function.

```js
Weave.library.components.lineChart({ lines: [{ series: 'one', values: [8200, 8600, 9100] }], label: 'Requests a day' });
Weave.library.components.barChart({ items: [{ label: 'Mon', value: 42, reading: '42', series: 'one' }] });
Weave.library.components.donut({ items: regions, reading: '109,000', label: 'This week' });
Weave.library.components.heatmap({ items: days, label: 'Latency by hour' });
```

The palette is two tables. `components.seriesInks` holds five categorical slots in a fixed order,
and `components.heatSteps` holds one hue in five steps for the question that is only *how much*.
Both are modifier tables, so a mark asks for a slot by name (`series: 'two'`) and the stylesheet
carries the rule — there is no colour in any chart function, only `currentColor`, which each class
spends its own way: a line strokes it, a bar and a swatch fill it, a ring segment strokes an arc of
it.

Both palettes were chosen, not picked: the five light steps and the five dark ones clear the
colour-blind separation, chroma and lightness gates as an ordered set, and the **order itself** is
the safety mechanism, which is why `components.seriesAt` holds at the last slot rather than cycling.
Three of the light inks sit under 3:1 against white, so every chart that uses them ships visible
labels — `demos/signal.html` writes the number above each bar and repeats the whole week as a table
under the charts.

Colour follows the entity, never its rank. `patterns.chartBoard` takes the slot from a series'
position in the list it was *declared* in, so switching one series off in the legend never repaints
the survivors:

```js
Weave.library.patterns.chartBoard({ spans, lines: services, draw: view => Weave.library.components.lineChart({ lines: view.lines }) });
```

## The showcase wave

The widgets a product page and a live console reach for, added so that what a page can be built
from is as good as what the library can prove about itself. Every one is still a spec in and an
element out, still names parts and never tags, and still spends tokens and never values.

```js
Weave.library.components.hero({ eyebrow: 'New', title: 'Ship the screen,', highlight: 'not the stylesheet', actions, aside, wash: 'aurora' });
Weave.library.components.metric({ glyph: '💰', label: 'MRR', value: '$294K', text: '+5.4%', direction: 'up', tone: 'success', values });
Weave.library.components.areaChart({ lines, label: 'Revenue', plot: 'tall' });
Weave.library.components.bento({ children: [card({ tile: 'big', children }), feature({ tile: 'wide', glyph, title, note })] });
Weave.library.components.workspace({ nav: sideNav({ title, glyph, active, groups, footer }), children: [topBar({ title, actions }), page] });
```

| Group | Widgets |
|---|---|
| building a page | `hero`, `sectionIntro`, `eyebrow`, `highlight`, `feature`, `plan`, `checklist`, `testimonial`, `logoCloud`, `marquee`, `windowFrame`, `bento`, `labelDivider` |
| running an application | `workspace`, `sideNav`, `topBar`, `searchTrigger`, `iconButton`, `iconBadge`, `statusPill`, `person` |
| charts | `metric`, `areaChart`, `gauge`, `stackBar`, `funnel`, `calendarHeat` |

Seven modifiers came with them, each a table any spec can ask from by name:

| Modifier | Table | What it does |
|---|---|---|
| `surface` | `components.surfaces` | `raised`, `glass`, `tinted`, `flat`, `featured`, and `inverse`, which carries the dark theme's tokens onto one box so everything inside it follows |
| `wash` | `components.washes` | `aurora`, `sunrise`, `ocean`, and `midnight`, a dark field that also carries the dark tokens |
| `tile` | `components.bentoSpans` | `wide`, `tall`, `big` and `full` inside a `bento`; a phone stacks them all |
| `lay` | `components.lays` | `centre` for a hero's copy or a section intro |
| `plot` | `components.plotSizes` | `spark` and `tall` for an area or line chart |
| `hue` | `components.hues` | a portrait's tint, taken from its name, so the same person is always the same colour |
| `dot` | `components.windowDots` | the three dots on a window frame |

`areaChart` fades each fill from its own series colour: the gradient sits inside the series' own
group, so `currentColor` resolves to that series and no chart names a colour. `fit: true` measures
from just under the lowest reading instead of from nought, which is what a sparkline wants, and
`metric` asks for it. A chart that changes its reading glides to the new length, because
`components.glides` names the classes that move rather than jump and the sheet emits them only for
a reader who has not asked for less motion. Boxes rise into place once, on arrival.

`demos/orbit.html` is the whole wave running as one product.

## The written pages

Two shapes the dashboards never asked for: a page of prose, and a page of diff. Both are components
like any other, and both keep their colour and their measure in library tables.

```js
Weave.library.components.prose({ children: [title, paragraphs, callout, listing, pager] });
Weave.library.components.callout({ glyph: '📦', title: 'Worth knowing', tone: 'warning', body: [note] });
Weave.library.components.contents({ title: 'Chapters', active: 'install', items: chapters });
Weave.library.components.codeListing({ lines: ['npm run check'], caption: 'package.json' });
Weave.library.components.pager({ label: 'Between chapters', previous, next });
```

`contents` marks the section being read with `aria-current`, which is the same state row the
pagination buttons already answered to, so being *here* is written once. `pager` is given a row per
end and draws a `pagerGap` where it was given none, so a chapter with no neighbour on one side still
pushes its one link to the side it belongs on.

A diff is the same idea with a third table behind it. `components.editKinds` holds one row per thing
a line can be — `added`, `removed`, `same` — and it is a modifier table, so a row asks for a kind by
name and the stylesheet carries the wash and the stripe:

```js
Weave.library.components.diff({ title: 'src/22-components.js', label: 'The change', rows: lines });
Weave.library.components.diffStat({ added: 12, removed: 1 });
Weave.library.components.commentThread({ items: remarks, reply: [box, dropTarget] });
Weave.library.components.dropzone({ glyph: '🖼️', title: 'Drop a screenshot here', onDrop: attach });
```

Every line carries its number *and* its sign, because the two washes are the only part of the
reading that a colour-blind reader cannot see; `components.diffSigns` is the one place either sign
is written, and `diffStat` spends the same two rows, so a file list and a diff can never disagree
about which way is which. `dropzone` is the one widget that wires its own listeners: it marks itself
with the `over` state while a file is above it, clears the mark on drop, and then hands the event on.

`demos/handbook.html` and `demos/review.html` are those two pages, and every widget in this section
exists because one of them could not say something without it.

## Above the page

`overlays` is the layer between `components` and `patterns`, and the only place the system positions
anything. There is one host, appended once, and a z-index ladder inside it — scrim, drawer, dialog,
popover, toast, tip — so nothing in an application ever picks a number.

| Call | What opens |
|---|---|
| `patterns.dialog(spec)` | a centred layer over a scrim: focus trapped, escape closes it, the page keeps its scroll position and gets its scrollbar back |
| `patterns.drawer(spec)` / `patterns.sheet(spec)` | the same layer, against the side or the bottom edge |
| `patterns.confirm(spec)` | that dialog with two actions, answering a promise |
| `patterns.menu(anchor, spec)` / `patterns.menuAt(spec)` | a popover placed from the anchor's own rectangle, dismissed by a click away, escape or a scroll. At most one is open at a time |
| `patterns.notifications({})` | a toast host pinned to the corner; `push(message, tone, action)` can carry an undo |
| `overlays.tip(text)(element)` | a bubble that follows a target, on hover and on focus |
| `patterns.shortcuts(map)` | one row per key or combination, bound to the document and held back while the reader is typing |

A layer's `body` and `actions` may each be a value or a function of `close`, so an action can close
the thing it sits in without the caller holding a handle. Layers stack: the scroll lock counts, and
escape closes only the top one.

## Three examples

```js
/* Build */
Weave.application.card = item => Weave.library.elements.article({ classes: ['card'], children: [Weave.library.elements.h2({ text: item.title }), Weave.library.elements.p({ text: item.body })] });

/* Query and delegate */
Weave.application.onRemove = (event, button) => Weave.library.elements.remove(Weave.library.query.closest('.card')(button));
Weave.application.bindList = list => Weave.library.events.delegate(Weave.library.events.types.click, '.remove', Weave.application.onRemove)(list);

/* Fetch and render */
Weave.application.render = items => Weave.library.elements.append(items.map(Weave.application.card))(Weave.library.query.one('#list'));
Weave.application.load = () => Weave.library.control.after(Weave.library.network.getJson('/api/items'))(Weave.application.render);
```

## Layout

| Path | What it is |
|---|---|
| `src/*.js` | One file per layer, in load order, `25-auth.js` last. This is the source you edit. |
| `dist/weave.js` | The single-file bundle, built by `scripts/build.js`. Never edited by hand. |
| `dist/weave.module.js` | The generated ESM wrapper. |
| `audit.js` | The style checker, written in the style it enforces and audited by itself. |
| `catalog.json` | Every path in the bundle, emitted by the audit. |
| `tests/tests.js` | One table row per test case, in the same style. `cases` are synchronous, `asyncCases` resolve to a boolean. |
| `tests.html` | The browser half of the test contract. |
| `apps/*.html` | The two flagship applications. The reason most of the library exists. |
| `apps.md` | What each flagship had to be able to do. |
| `sample.html`, `todo.html`, `studio.html` | The reference applications, written against the library directly. |
| `styleguide.html` | The live reference for the styling system, generated from its own tables. |
| `demos/*.html` | The demo set: two catalogues of the library, and a domain application each. |
| `demos/kit.js` | The kit the demos share: application code, built only on the library. |
| `scripts/` | The build and check harness — ordinary node scripts, deliberately outside the style. |

## Commands

```
npm run build       # src/ → dist/weave.js and dist/weave.module.js
npm run audit       # the style rules, plus catalog.json
npm test            # both test tables, in node with jsdom
npm run audit:rows  # remove each table row, assert exactly its feature disappears
npm run check:apps  # drive sample.html, todo.html, studio.html, styleguide.html and tests.html in jsdom
npm run check:demos # drive every demo application in jsdom, and hold the kit to its contract
npm run check:flagships # drive Relay and Pantry the way a person would use them
npm run check       # all of the above
```

## The demos

`demos/index.html` links twenty-four pages: Orbit, the showcase; two catalogues of the library itself; and the rest
applications that put the patterns under load in a different shape. Each is short because the
patterns do the work:

| Demo | Domain | What it exercises |
|---|---|---|
| `crm.html` | sales | dashboard, data grid and master detail over one dataset |
| `board.html` | engineering | a kanban board you can drag a card across, driven by a command palette |
| `helpdesk.html` | support | a ticket queue whose detail pane is a live chat |
| `warehouse.html` | logistics | sorting and paging over 23 rows, a 2,000 row virtual ledger, plus a booking wizard |
| `school.html` | education | a curriculum tree beside its reading, and a todo list |
| `clinic.html` | healthcare | a day schedule and a three step intake form |
| `agenda.html` | conferences | a calendar of sessions, with prices and a countdown |
| `tenants.html` | multi-tenant SaaS | four customers in one console: a workspace switcher in a popover, per-plan limits, roles changed in place, and a confirm before a seat is taken back |
| `kit.html` | the kit itself | every shared piece, drawn live from the table that documents it |
| `elements.html` | the library itself | one card per widget, drawn live, with the call that draws it |
| `patterns.html` | the library itself | every stateful piece, running, beside the line that starts it |
| `tailor.html` | the styling system | theme, density, palette and modifiers wired to the page you are reading |
| `account.html` | signing in | the gate, the session behind it, the desk it lets you at, and sign out |
| `bank.html` | retail banking | accounts, a transfer that asks first, and a statement drawn twice from one set of rows |
| `shop.html` | retail | a storefront on one store: a navbar counting the basket, an offer carousel, chips that filter, a basket in a sheet |
| `orbit.html` | the showcase | a product command centre on one store: a rail and a top bar, a live desk of metrics, area charts, a gauge, a funnel and a deploy calendar, a sortable customer ledger, a launch page framed inside the product, settings that restyle the page, a palette and the keys to reach it all |
| `landing.html` | marketing | the shape every product site takes: a hero, three reasons, prices, quotes and questions |
| `signal.html` | service analytics | every chart the library draws: a line board whose legend switches a series off, bars with their own numbers, ranked bars, a ring, a heatmap, and the same week again as a table |
| `travel.html` | booking | four steps and a summary over one store, priced by cabin and by how many are travelling |
| `handbook.html` | documentation | prose in a measured column: a contents that marks where you are, callouts that carry a tone, numbered listings, and a pager that holds an end open when there is no chapter there |
| `review.html` | code review | four changed files, a diff that marks every line with what it is, the conversation hanging off the open file, and a target a screenshot can be dropped on |

None of them contains a tag name, a class, a colour or a dimension. `check:demos` drives all of them, and holds the two catalogues to their own contract: an element with no call, a section naming an element that does not exist, or an element filed in no section all fail the build.

## The kit

`Weave.library` is the library. `Weave.application` is one page. Between them sits `Weave.kit` —
the pieces the demos found themselves writing twice. It lives in `demos/kit.js`, is audited under
the same rules with no new exemptions, and is written only against `Weave.library.*`, exactly as a
demo is. The flagships do not use it: `apps.md` requires them to be written against the library
alone, so that a gap in the library cannot be papered over by a demo helper.

A piece earns its place by being needed twice. Each one carries a row in `Weave.kit.notes` saying
what it is for, and a row in `Weave.kit.samples` drawing it. Helpers nobody outside the file calls
live under `Weave.kit.parts` and stay out of the gallery.

`demos/kit.html` is that gallery, and it is generated from `Weave.kit.notes` — so a piece cannot
be added without a card appearing, and `check:demos` refuses a piece with no note, a note with no
piece, and a gallery whose card count has drifted from either. The gallery is a demo like the
others, and grows every time another demo finds something worth sharing.

## Extending

There is no plugin API. Extending Weave means adding lines: a row to a table
(`Weave.library.elements.tags.myWidget = {...}` adds a builder) or a new layer that honours the
dependency direction — `overlays` went in between `components` and `patterns` that way, `auth` went on top of `patterns`,
and `dates` and `formatting` between `timing` and `effects`,
each as one file, one row in the audit's layer list, and its tables in the audit's required list. `Weave.library.collections.lifts` takes rows for new layers,
so lifting extends too, and `Weave.library.collections.kinds` says how: a `curried*` kind lifts a
function that takes its arguments before the element, so `Weave.library.collections.query.find('.row')`
and `Weave.library.collections.style.css('display')` read the same way as their single-element twins.

## Failure

Every rejection and every throw carries a row from `Weave.library.control.errors`, so failures are
named rather than guessed at: `control.loop` past `control.constants.maxDepth` fails with
`depthExceeded`, a spec naming no builder fails with `invalidSpec`, a request that never reached the
network rejects with `network`, and an animation cut short by `effects.stop` rejects with `cancelled`
— `Weave.library.effects.ignoreCancelled` turns that back into a resolved promise when you do not
care. `Weave.library.control.isError(row, value)` is the one test; `network.hooks.onError` sees every
request rejection on its way out.
