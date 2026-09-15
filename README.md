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

## The layers

`composition` → `predicates` → `control` → `browser` → `elements` → `query` → `attributes` → `style` →
`events` → `timing` → `dates` → `formatting` → `effects` → `forms` → `network` → `observers` →
`storage` → `navigation` → `interaction` → `accessibility` → `collections` → `components` →
`patterns`, then `application`.

`browser` is the only layer that names a global — `Date` and `Intl` included, which is why `dates`
does calendar arithmetic with no locale in it and `formatting` does locale with no arithmetic in it.
`collections` lifts every layer below it. `components` turns one spec into one element. `patterns`
gives a component state. An application composes patterns and holds data — nothing else.

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
`statusDot` — are built from those same containers and never reach past them.

A pattern is a component with state. Every one returns the same handle, `{ element, state, update }`,
and every one repaints through `patterns.view`:

```js
Weave.library.patterns.mount(host)(Weave.library.patterns.todoList({ title: 'Tasks', items }));
Weave.library.patterns.mount(host)(Weave.library.patterns.board({ columns: lanes, cards }));
Weave.library.patterns.dataGrid({ title: 'Stock', pageSize: 8, columns, rows });
Weave.library.patterns.masterDetail({ items, detail: person => Weave.library.components.note({ text: person.bio }) });
```

The set is `todoList`, `board`, `dataGrid`, `masterDetail`, `wizard`, `commandPalette`, `chat`,
`explorer`, `dashboard`, `calendar`, `virtualList`, `virtualGrid`, `resource`, `entryForm` and
`notifications`. A pattern only ever composes components and other patterns, so a fix to
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

## Styling

There is no stylesheet file. `components.tokens` holds every dimension, colour and duration;
`components.rules` holds one row per class, whose values may only be token references;
`components.states` holds the only pseudo-classes in the system. `components.styleText()` renders
the sheet and `components.installStyles()` injects it once, however many patterns are mounted.

A theme is a row of token overrides. `components.themes.dark` is one, and the sheet carries a block
per theme plus a `prefers-color-scheme` block scoped so the operating system wins unless the page
has chosen. `components.setTheme(name)`, `components.toggleTheme()` and `components.followScheme()`
are the runtime side; the last returns its unsubscribe. `components.tones` maps a tone name to a
colour token and `components.toneRules` says how a class spends it, so `alert`, `statusDot` and
anything else toned share one palette. `components.keyframes` is the only place an animation is
written.

To restyle the whole system, change tokens. To restyle one widget, change its row. To restyle every
widget at night, change one theme row.

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
| `src/*.js` | One file per layer, in load order. This is the source you edit. |
| `dist/weave.js` | The single-file bundle, built by `scripts/build.js`. Never edited by hand. |
| `dist/weave.module.js` | The generated ESM wrapper. |
| `audit.js` | The style checker, written in the style it enforces and audited by itself. |
| `catalog.json` | Every path in the bundle, emitted by the audit. |
| `tests/tests.js` | One table row per test case, in the same style. `cases` are synchronous, `asyncCases` resolve to a boolean. |
| `tests.html` | The browser half of the test contract. |
| `sample.html`, `todo.html`, `studio.html` | The reference applications, written against the library directly. |
| `demos/*.html` | Seven domain applications, written only against patterns. |
| `scripts/` | The build and check harness — ordinary node scripts, deliberately outside the style. |

## Commands

```
npm run build       # src/ → dist/weave.js and dist/weave.module.js
npm run audit       # the style rules, plus catalog.json
npm test            # both test tables, in node with jsdom
npm run audit:rows  # remove each table row, assert exactly its feature disappears
npm run check:apps  # drive sample.html, todo.html, studio.html and tests.html in jsdom
npm run check:demos # drive all seven demo applications in jsdom
npm run check       # all of the above
```

## The demos

`demos/index.html` links seven applications in seven domains. Each one exists to put the patterns
under load in a different shape, and each is short because the patterns do the work:

| Demo | Domain | What it exercises |
|---|---|---|
| `crm.html` | sales | dashboard, data grid and master detail over one dataset |
| `board.html` | engineering | a kanban board you can drag a card across, driven by a command palette |
| `helpdesk.html` | support | a ticket queue whose detail pane is a live chat |
| `warehouse.html` | logistics | sorting and paging over 23 rows, a 2,000 row virtual ledger, plus a booking wizard |
| `school.html` | education | a curriculum tree beside its reading, and a todo list |
| `clinic.html` | healthcare | a day schedule and a three step intake form |
| `agenda.html` | conferences | a calendar of sessions, with prices and a countdown |

None of them contains a tag name, a class, a colour or a dimension. `check:demos` drives all seven.

## Extending

There is no plugin API. Extending Weave means adding lines: a row to a table
(`Weave.library.elements.tags.myWidget = {...}` adds a builder) or a new layer that honours the
dependency direction — `dates` and `formatting` went in between `timing` and `effects` that way,
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
