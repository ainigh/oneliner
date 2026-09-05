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
`timing` → `events` → `effects` → `forms` → `network` → `observers` → `storage` → `navigation` →
`interaction` → `accessibility` → `collections` → `components` → `patterns`, then `application`.

`browser` is the only layer that names a global. `collections` lifts every layer below it.
`components` turns one spec into one element. `patterns` gives a component state. An application
composes patterns and holds data — nothing else.

## Components and patterns

A component is a function from one spec to one element. It is the whole widget, not a piece of one.

```js
Weave.library.components.table({ columns: [{ key: 'name', label: 'Name' }], rows: people });
Weave.library.components.field({ label: 'Email', name: 'email', type: 'email' });
Weave.library.components.tabs({ active: 'open', items: [{ key: 'open', label: 'Open', onAction: show }] });
```

Containers come from one table, so adding `blueprints.badge = parts.inline` adds
`components.badge(spec)` with its own class and its own row in the stylesheet. Composite widgets —
`table`, `menu`, `tabs`, `tree`, `form`, `modal`, `pagination`, `accordion` — are built from those
same containers and never reach past them.

A pattern is a component with state. Every one returns the same handle, `{ element, state, update }`,
and every one repaints through `patterns.view`:

```js
Weave.library.patterns.mount(host)(Weave.library.patterns.todoList({ title: 'Tasks', items }));
Weave.library.patterns.mount(host)(Weave.library.patterns.board({ columns: lanes, cards }));
Weave.library.patterns.dataGrid({ title: 'Stock', pageSize: 8, columns, rows });
Weave.library.patterns.masterDetail({ items, detail: person => Weave.library.components.note({ text: person.bio }) });
```

The set is `todoList`, `board`, `dataGrid`, `masterDetail`, `wizard`, `commandPalette`, `chat`,
`explorer` and `dashboard`. A pattern only ever composes components and other patterns, so a fix to
`components.table` lands in `dataGrid`, in every demo that uses one, and nowhere twice.

`update` takes a function of the current state, so a repaint can never read a stale one:

```js
Weave.application.close = handle => handle.update(state => ({ open: state.open.filter(isDone) }));
```

## Styling

There is no stylesheet file. `components.tokens` holds every dimension, colour and duration;
`components.rules` holds one row per class, whose values may only be token references;
`components.states` holds the only pseudo-classes in the system. `components.styleText()` renders
the sheet and `components.installStyles()` injects it once, however many patterns are mounted.

To restyle the whole system, change tokens. To restyle one widget, change its row.

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
| `sample.html`, `todo.html` | The two reference applications, written against the library directly. |
| `demos/*.html` | Six domain applications, written only against patterns. |
| `scripts/` | The build and check harness — ordinary node scripts, deliberately outside the style. |

## Commands

```
npm run build       # src/ → dist/weave.js and dist/weave.module.js
npm run audit       # the style rules, plus catalog.json
npm test            # both test tables, in node with jsdom
npm run audit:rows  # remove each table row, assert exactly its feature disappears
npm run check:apps  # drive sample.html, todo.html and tests.html in jsdom
npm run check:demos # drive all six demo applications in jsdom
npm run check       # all of the above
```

## The demos

`demos/index.html` links six applications in six domains. Each one exists to put the patterns under
load in a different shape, and each is short because the patterns do the work:

| Demo | Domain | What it exercises |
|---|---|---|
| `crm.html` | sales | dashboard, data grid and master detail over one dataset |
| `board.html` | engineering | a kanban board driven by a command palette |
| `helpdesk.html` | support | a ticket queue whose detail pane is a live chat |
| `warehouse.html` | logistics | sorting and paging over 23 rows, plus a booking wizard |
| `school.html` | education | a curriculum tree beside its reading, and a todo list |
| `clinic.html` | healthcare | a day schedule and a three step intake form |

None of them contains a tag name, a class, a colour or a dimension. `check:demos` drives all six.

## Extending

There is no plugin API. Extending Weave means adding lines: a row to a table
(`Weave.library.elements.tags.myWidget = {...}` adds a builder) or a new layer after `collections`
that honours the dependency direction. `Weave.library.collections.lifts` takes rows for new layers,
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
