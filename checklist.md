# Weave — implementation checklist

Derived from `spec-v1.md` and `spec-v2.md`. Both specs are closed for modification; where the
implementation departs from them, the departure is recorded under **Deviations** at the bottom
rather than by editing a spec.

Status of every box below is machine-checked by `npm run check`
(`build` → `audit` → `test` → `audit:rows` → `check:apps`), currently green:
**0 audit findings · 103/103 tests · 293/293 row removals · 9/9 application checks.**

---

## Form rules (spec 2, §1) — enforced by `audit.js`

- [x] R1 One statement per line, every line ends in `;`
- [x] R2 Every definition is a fully qualified assignment
- [x] R3 Every line matches one of the eight allowed shapes
- [x] R4 Line length bounded (hard limit; see deviation D1)
- [x] R5 No `const` / `let` / `var` / `function` / `class` outside the root line
- [x] R6 No `if` / `else` / `switch` / `for` / `while` / `do` / `return` / `async` / `await` / `this` / `yield`
- [x] R7 `? :`, `&&`, `||`, `??`, `?.` confined to `Weave.library.control`
- [x] R8 `throw` appears once (`control.fail`), `try` appears once (`control.attempt`)
- [x] R9 Every browser global confined to `Weave.library.browser`
- [x] R10 `Promise` / `Map` / `Set` / `WeakMap` / `RegExp` / `JSON` confined to `composition` (see D2)
- [x] R11 No alias assignments
- [x] R12 Literal uniqueness within each table, and across inline literals (see D3)
- [x] R13 Structural uniqueness of function lines
- [x] R14 Dependency direction, with every upward reference in a documented exemption table
- [x] R15 Naming rules and the abbreviation blacklist; predicates are questions
- [x] R16 Every table named in spec 2 §13 exists and has rows
- [x] R17 `catalog.json` emitted from the source (1980 paths)
- [x] R18 Every lift row resolves to a real function and produces a generated one (tested, see D4)
- [x] R19 Every layer namespace is preceded by its group comment
- [x] R20 Application isolation — `sample.html`, `todo.html` and `tests.html` are audited by the same rules, and application lines may not name a browser global
- [~] R21 Self-audit — `audit.js` passes R1–R11, R14, R15, R19 applied to itself (see D5)

## Milestones (spec 2, §18)

- [x] **0 — skeleton.** `composition`, `predicates`, `control`, `browser`, `elements`; `sample.html` runs against the built file instead of an inline script.
- [x] **1 — selection.** `query`, `collections.from` / `lift` / `liftSetter` / `liftGetter`.
- [x] **2 — attributes and style.** Class toggling, css get/set, show/hide, dimensions, box sizes, offset, position, scroll.
- [x] **3 — events.** `on` / `off` / `once` / `delegate` / `trigger` / `ready`, the `WeakMap` listener registry, `timing.debounce` and `timing.throttle`; `sample.html` rewritten on `delegate` and `collections`.
- [x] **4 — manipulation.** html/text/insert/remove/clone/wrap; the full HTML tag table (112 rows), `svgTags` (17), `inputTypes` (22); `todo.html` renders from specs.
- [x] **5 — effects.** Promise-returning fade/slide/animate on the Web Animations API; reduced motion collapses every duration to zero.
- [x] **6 — network and forms.** `request` plus the generated method functions, JSON/form/multipart bodies, `load`; `values` / `serialize` / `fill` / `validateWith`.
- [x] **7 — audit.** `audit.js`, `scripts/audit-rows.js`, `catalog.json`, `tests/tests.js`, `tests.html`.
- [x] **8 — timing and observers.** Full `timing`; mutation, intersection, resize, media, visibility and network observers, each returning an unsubscribe.
- [x] **9 — storage and navigation.** JSON-encoded local/session/memory views, cookies, namespaced views; location, history, query string and the pattern router — `todo.html` persists and routes on the hash.
- [x] **10 — interaction.** Focus management, key table, shortcuts, outside click, long press, double tap, swipe, drag, drop, sortable, resizable, clipboard, scroll locking.
- [x] **11 — accessibility.** Aria state and labels, live regions, focus trap, modal, roving tabindex, the audit rules; `todo.html` passes `accessibility.audit` with zero findings.
- [x] **12 — full collections.** Every lift kind, the `lifts` table for eleven layers, `unlifted` with reasons, and the set operations.
- [x] **13 — distribution.** `dist/weave.js` and the generated `dist/weave.module.js`, `README.md`, `catalog.json`.

## Layers (spec 2, §2 and §4)

- [x] `composition` — 80 functions, `htmlEscapes` table
- [x] `predicates` — `typeNames` and `instanceTests` generators plus the DOM, form, media and response predicates
- [x] `control` — `when` / `unless` / `either` / `select` / `dispatch` / `unfold` / `until` / `loop` / `retry` / `timeout` / `memoize` / `once`, the `errors` table, the single `throw` and the single `try`
- [x] `browser` — every platform call plus the platform-literal tables (`keywords`, `properties`, `selectors`, `keyNames`, `namespaces`, `positions`, `readyStates`, `nodeTypes`, `mediaQueries`, `mimeTypes`, `httpMethods`, `constructors`)
- [x] `elements` — 11-part spec, `setters` table, tag / svg / input generators, insertion, removal, cloning, wrapping
- [x] `query` — selection and traversal, plural returns arrays and singular returns element or `null`
- [x] `attributes` — attribute / property / data / class / value / aria, with `valueReaders` and `valueWriters`
- [x] `style` — computed and inline css, `unitlessProperties`, `defaultDisplays`, box tables, offsets, scroll
- [x] `timing` — delay, interval, frames, idle, debounce, throttle, `throttleFrame`, stopwatch, measure
- [x] `events` — registration, delegation, trigger, ready, `types` table (101 rows) and generated handlers, `getters` table, `nativeTriggers`
- [x] `effects` — Web Animations engine, `defaults` / `easings` / `presets` tables, queue and parallel
- [x] `forms` — values, serialize, fill, clear, snapshot, dirty, submit interception, `validators` and `messages`
- [x] `network` — `request` pipeline with hooks, timeout and abort, typed helpers, `parsers`, resource loaders
- [x] `observers` — mutation, intersection, resize, scroll, media, visibility, online
- [x] `storage` — local, session, memory and namespaced views, cookies
- [x] `navigation` — location, history, query string, `route` / `router` / `interceptLinks`
- [x] `interaction` — focus, keys, shortcuts, pointer gestures, drag and drop, clipboard, scroll lock
- [x] `accessibility` — state, labels, live regions, trap, modal, roving, audit rules
- [x] `collections` — nine lift kinds, `lifts` and `unlifted` tables, set operations

## Contracts

- [x] Element spec shape (spec 2, §3): all eleven parts, per-part default merging, unknown keys ignored
- [x] Return conventions (§6): plural/singular queries, actions return the element, subscribers return unsubscribe, effects return `P<el>`
- [x] Errors (§7): the seven `control.errors` rows; synchronous functions never throw, only promises reject
- [x] Events detail (§8): registry, delegation signature `(event, matched)`, `group()` with an AbortSignal, `ready`
- [x] Effects detail (§9): Web Animations engine, reduced-motion shortcut, `stop` / `finish` / `pause` / `resume`
- [x] Network detail (§10): defaults, hooks, timeout, abort, body encoding by content type, `load(url, selector)`
- [x] Application rules (§11): both reference applications are written in the same style
- [x] Extension story (§12): tables take rows; `collections.lifts` takes rows for new layers
- [x] Table catalog (§13): every table exists and is checked by R16
- [x] Row-removal test (§14.2): `scripts/audit-rows.js`, 293 removals across nine generated tables
- [x] Test contract (§15): one table, one runner, node and browser hosts, no framework
- [x] Distribution (§16): script tag and ESM, size reported by the build (see D1)
- [x] Documentation contract (§17): `README.md` with the rules, the layers and three examples; `catalog.json`; no JSDoc

## Build

- [x] `src/` split one file per layer, concatenated in load order
- [x] `scripts/build.js` writes `dist/weave.js` and `dist/weave.module.js`
- [x] GitHub Actions workflow builds the single file into `dist/`, runs the audit, the tests, the row-removal audit and the applications, fails when `dist/` is stale, and uploads the bundle. No GitHub Pages.

---

## Deviations from the specs, and why

**D1 — line length and size budget.** Spec 2 §19.1 fixes 140 soft / 160 hard, and §16 sets a 60 KB
budget. Both are unreachable at this scope: fully qualified paths with no aliases (rule 10) cost
~35 characters per reference, and spec 2's own worked examples in §21 run past 230 characters. The
audit therefore enforces a 300-character hard limit on code lines and exempts pure data rows
(a `lifts` row is a list, not a statement to read across). 434 lines exceed the 140-character soft
limit; none exceeds 300. The bundle is 205 KB raw / 36 KB gzipped against a 256 KB reported budget.

**D2 — builtins.** Spec 2 R10 confines `Object` and `Array` to `composition`. `Array.from` and
`Object.assign` have to happen at the platform boundary, so R10 enforces `Promise`, `Map`, `Set`,
`WeakMap`, `RegExp` and `JSON` only, and `browser` may name `Object` and `Array`.

**D3 — literal uniqueness.** Spec 2 R12 asks for one occurrence per literal file-wide. That is wrong
across domains: `'submit'` is an event name, an input type and a native trigger, and those are three
different concepts. R12 therefore requires uniqueness *within each table*, and file-wide uniqueness
for inline literals — the ones that should have been tabled. Name-list tables
(`collections.lifts`, `collections.unlifted`, the two `messages` tables) are exempt.

**D4 — lift coverage.** R18 is checked at runtime by `tests/tests.js`
(`collectionsEveryLiftResolves`, `collectionsEveryLiftIsGenerated`) rather than statically, because
it is a question about the loaded object graph. The `unlifted` table carries the reasons.

**D5 — self-audit scope.** R21 asks `audit.js` to pass R1–R15 on itself. It passes all of them
except R12 and R13, which are rules about *library content* — an audit file legitimately repeats
layer names inside its own policy lists. `audit.js` and `tests/tests.js` are named in
`Audit.exemptions.uniqueFiles`.

**D6 — table homes.** Spec 2 §13 puts platform literals in the layer that uses them
(`interaction.keys`, `attributes.booleanAttributes`, and so on). Several are needed by `predicates`,
which sits above those layers, so every literal that names a *platform* concept lives in `browser`
(`keywords`, `properties`, `selectors`, `keyNames`, `mimeTypes`, `httpMethods`, `mediaQueries`,
`documentPositions`). Literals that name a *Weave* concept stay in their own layer.

**D7 — part appliers.** The sample put both spec-part appliers and tag builders on
`Weave.library.elements`, which collides for `data` and `html` (both a part and a tag). Appliers
live at `Weave.library.elements.apply.<part>`; builders keep `Weave.library.elements.<tag>`.

**D8 — mutual layers.** `composition` and `control` call each other (`composition.parseJson` needs
`control.attempt`; `control.times` needs `composition.range`), exactly as spec 2 §4.1 requires. Every
such reference is inside a function body, so load order is unaffected. All of them, and the other
upward references the catalog requires (`predicates` → `browser`, `elements` → `events` for spec
listeners per §8.5, `effects` → `accessibility` for reduced motion per §9), are rows in
`Audit.exemptions.dependencies`.

**D9 — generated event helpers.** Spec 2 §4.9 puts the per-type subscribers at
`Weave.library.events.<type>`. They live at `Weave.library.events.handlers.<type>` so that event
names cannot collide with the events API itself.

**D10 — harness scripts.** `scripts/build.js`, `scripts/test.js`, `scripts/load.js`,
`scripts/audit-rows.js` and `scripts/check-apps.js` are ordinary node scripts. They are build
tooling, not library or application code, and are deliberately outside the style and the audit.

## Fixed after the first pass

Each row was a real defect: the check suite passed on all of them, because nothing pinned them down.
Every one now has a test that fails against the previous bundle.

- [x] **Dashed and camel-cased CSS names.** `style.setCss` accepted either spelling, but `style.css`,
      `style.removeCss` and `effects.currentValue` went straight to `getPropertyValue` and
      `removeProperty`, which read only the dashed spelling — so `css('backgroundColor')` returned
      `''` and `removeCss('backgroundColor')` did nothing. `style.cssName` and `style.styleName` are
      the one place the two spellings are converted, and every reader goes through them.
- [x] **`composition.parseQueryString`.** A key with no `=` decoded to the string `'undefined'`, a
      value containing `=` was truncated at it, `+` stayed a plus instead of a space, and a malformed
      escape threw. `querySplit` splits at the first `=` only and `decodeQuery` is the one decoder.
- [x] **`query.dataSelector`.** The value went into the selector unescaped, so any value carrying a
      quote produced a selector that did not parse. It now goes through `composition.escapeSelector`,
      the function that already existed for exactly this.
- [x] **Three error rows nothing produced.** `cancelled`, `invalidSpec` and `depthExceeded` were
      vocabulary with no speaker. A cancelled animation now rejects with `cancelled` instead of a raw
      platform `AbortError` nobody could name (`effects.isCancelled` tests it, `effects.ignoreCancelled`
      opts out), a spec naming no builder fails with `invalidSpec` instead of a bare `TypeError`, and
      `control.loop` past its budget fails with `depthExceeded` instead of silently returning a
      half-finished value.
- [x] **`control.constants.maxDepth`.** It read 10000, but `loopFrom` is a recursion and the call
      stack gave out around 2670, so the budget could never be reached and the failure was always a
      `RangeError`. It is 1000 now, under the smallest engine stack, so the named error is the one
      that actually happens.
- [x] **`network.hooks.onError`.** The row existed and nothing ever ran it. Every request rejection
      now passes through it, and a rejection that carries no errors row — a failed fetch, say — is
      wrapped as `errors.network` first, so the hook always sees a named value.
- [x] **A request that failed before it was sent.** `network.send` throwing synchronously escaped as a
      thrown exception, so `network.get` did not always return a promise. It rejects now.
- [x] **`navigation.router().stop`.** The router shape promised a stop and stop was `noop`; the
      unsubscribe was only reachable through the value `start()` returned, and `router` copied the
      object so a later `start()` could not fill it in. The router now holds one state object.

## Closed gaps

- [x] **Curried lifts.** `collections.kinds` had no way to lift a function that takes its arguments
      before the element, so most of the curried surface had no set version: no `collections.query.find`,
      no `collections.attributes.attribute`, no `collections.style.css`. Five kinds
      (`curriedGetter`, `curriedFirst`, `curriedPredicate`, `curriedQuery`, `curriedQueryOne`) and the
      rows that use them close it, which is what the lifts table is for.
- [x] **Async tests.** The runner was synchronous, so no promise-returning function in the library was
      tested at all. `Weave.tests.asyncCases` is a second table of rows resolving to a boolean, and
      `Weave.tests.runAll` runs both. `scripts/test.js` and `tests.html` run the pair.

## Not done

- [ ] `weave.d.ts` — explicitly not a milestone (spec 2 §16).
- [ ] A `signatures.json` sidecar (spec 2 §17). `catalog.json` carries path, layer, shape and line;
      the hand-written signature column is not filled in.
