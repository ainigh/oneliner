# Weave

A DOM library with jQuery's coverage, written so that **every idea exists in exactly one place**.

`grep` is the documentation. Every definition is a fully qualified assignment on one line, so
`grep 'Weave.library.style.show' src/` finds the definition and every call site, and nothing else.

```html
<script src="dist/weave.js"></script>
```

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
`interaction` → `accessibility` → `collections`, then `application`.

`browser` is the only layer that names a global. `collections` is last because it lifts every other layer.

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
| `tests/tests.js` | One table row per test case, in the same style. |
| `tests.html` | The browser half of the test contract. |
| `sample.html`, `todo.html` | The two reference applications. |
| `scripts/` | The build and check harness — ordinary node scripts, deliberately outside the style. |

## Commands

```
npm run build       # src/ → dist/weave.js and dist/weave.module.js
npm run audit       # the style rules, plus catalog.json
npm test            # the test table, in node with jsdom
npm run audit:rows  # remove each table row, assert exactly its feature disappears
npm run check:apps  # drive sample.html, todo.html and tests.html in jsdom
npm run check       # all of the above
```

## Extending

There is no plugin API. Extending Weave means adding lines: a row to a table
(`Weave.library.elements.tags.myWidget = {...}` adds a builder) or a new layer after `collections`
that honours the dependency direction. `Weave.library.collections.lifts` takes rows for new layers,
so lifting extends too.
