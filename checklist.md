# Weave — implementation checklist

Derived from `spec-v1.md` and `spec-v2.md`. Both specs are closed for modification; where the
implementation departs from them, the departure is recorded under **Deviations** at the bottom
rather than by editing a spec.

Status of every box below is machine-checked by `npm run check`
(`build` → `audit` → `test` → `audit:rows` → `check:apps` → `check:demos` → `check:flagships`),
currently green: **0 audit findings · 340/340 tests · 450/450 row removals · 24/24 application
checks · 35/35 demo checks · 48/48 flagship checks · 3,443 catalog paths.**

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
- [x] R20 Application isolation — every `.html` application is audited by the same rules, and application lines may not name a browser global
- [x] R21 Every token is spent by a rule and every value by something — a styling row nothing references is a finding
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
- [x] `dates` — calendar arithmetic over `Date` values obtained through `browser`, including `monthGrid`
- [x] `formatting` — locale-aware number, money, percent, date, time, relative and list text through `Intl`
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
- [x] `components` — the widget set, the token, modifier and theme tables, and the one generated stylesheet
- [x] `overlays` — one host above the page, a z-index ladder inside it, and a release for every open thing
- [x] `patterns` — the stateful set, the keyed repaint, the state decorators and the layer patterns

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

## Components and patterns

Two layers after `collections`, both table driven, both audited under the same rules with no new
exemptions and no rule edits.

- [x] **`components`** — a function per widget, one spec in, one element out. `parts` is the only
      place a component chooses an element builder, so no widget names a tag. A component's key is
      its class, through `classOf`, so no widget names a class. `handlers` is the only place a spec
      key becomes a listener. `blueprints` generates every plain container from one row each;
      the composite widgets (`table`, `menu`, `tabs`, `tree`, `form`, `modal`, `accordion`,
      `pagination`, `disclosure`, `field`, `selectBox`, `checkField`, `searchBox`, `statTile`,
      `emptyState`, `toast`, `progressBar`, `breadcrumb`, `toolbar`) are built from those.
- [x] **Design tokens.** `tokens` is the only place a dimension, colour or duration is written;
      `values` the only place a bare CSS keyword is; `rules` carries one row per class whose values
      may only be token references; `states` the only pseudo-classes. `styleText` renders the sheet
      and `installStyles` injects it once. A test asserts every rule value is a known token.
- [x] **`patterns`** — `todoList`, `board`, `dataGrid`, `masterDetail`, `wizard`, `commandPalette`,
      `chat`, `explorer`, `dashboard`. Every one returns `{ element, state, update }` and repaints
      through the single `patterns.view`, which also restores focus across a repaint — so a search
      box that re-renders on every keystroke keeps the caret, once, for every pattern.
- [x] **Six demos** in six domains under `demos/`, plus a gallery. None contains a tag, a class, a
      colour or a dimension. `scripts/check-demos.js` drives all six with 27 assertions.
- [x] **Table contracts.** `components.blueprints` and `components.tokens` are rows in
      `scripts/audit-rows.js`, so deleting either kind of row is asserted to remove exactly the one
      component or the one custom property it names. 342 row removals, all as predicted.

The audit shaped both layers rather than reviewing them afterwards. R12 (a literal twice in one
bucket) and R13 (two structurally identical one-liners) failed the build repeatedly, and every one
of those failures was the same message: *this belongs in a table.* The one-field form shared by the
todo adder and the chat composer, the split view shared by `masterDetail` and `explorer`, the single
attribute-selector builder now shared by `query.dataSelector` and the focus restorer — all three
exist because the audit refused to let them be written twice.

## Gaps the demos uncovered — all five closed

Building six applications against the library found five things it could not do. Every one is fixed,
and each fix landed where the one-place rule said it had to.

- [x] **No date layer.** `Date` and `Intl` are rows in `Audit.policy.globals` now, so the rule that
      keeps platform names inside `browser` covers them. `composition.now` named `Date` and is gone;
      the epoch clock is `browser.timestamp()` (`browser.now()` was already the monotonic one).
      `dates` is a layer between `timing` and `formatting`: calendar arithmetic with no locale in it,
      including `monthGrid`, which is always six Monday-first weeks built from `range` and `chunk`.
- [x] **No number or date formatting.** `formatting` is the locale half, through `Intl`:
      `money`, `percent`, `compact`, `decimal`, `unit`, `date`/`time`/`dateTime`, `relative` and
      `list`. `crm.html`'s hand-written currency helper is gone, which also fixed a live bug: the
      helper was referenced one line before it was defined, so the Value column never formatted.
- [x] **The board cannot be dragged.** `interaction.draggable` (a pointer free-drag) and
      `interaction.droppable` (the HTML5 drop) were never a pair. `interaction.dragSource` is the
      missing partner, and `patterns.board` now moves a card by drag **and** by the arrow buttons,
      which stay because they are the keyboard path. A lane highlights through `components.states.over`.
- [x] **No virtualisation.** `patterns.virtualList` renders the visible rows plus twice
      `patterns.defaults.overscan`, however many items there are: 10,000 items put 18 rows in the
      document. `patterns.virtualGrid` is that under a search box. `dataGrid` still pages, on purpose.
- [x] **A pattern repaints wholesale.** `elements.morph` is the keyed reconciler, and
      `patterns.view` is one call to it, so every pattern in the system gained it at once. A caret,
      a scroll offset and an open `<details>` survive a repaint; a `data-key` decides what moves
      rather than what is rebuilt; twenty repaints of one form still leave one listener on it.

## Added on top of the closed gaps

- [x] **State that outlives one pattern.** `patterns.store` and `patterns.connect` let many views
      watch one state. `patterns.withHistory` adds undo and redo from one two-row table.
      `patterns.persistIn` writes to any storage view and reads back on the way in.
      `patterns.linkTo` keeps one state key in the page address. All four take a handle **or** a
      store, because both answer to `state` and `update`. `patterns.stop` releases what they held.
- [x] **Three patterns that were missing a rung.** `patterns.resource` makes a request a state, with
      one render per phase in `patterns.panes`. `patterns.entryForm` wires `forms.validators` to the
      form component, so a failing rule finally shows the message beside it. `patterns.calendar`
      draws a month from `dates.monthGrid` through the existing `table` component.
- [x] **Theming.** `components.themes` is one row of token overrides per theme, emitted as a block
      per theme plus a `prefers-color-scheme` block the page can override. `components.tones` and
      `components.toneRules` give `alert` and `statusDot` one palette; `components.keyframes` is the
      only place an animation is written.
- [x] **Eleven more components.** `alert`, `badge`, `statusDot`, `kbd`, `skeleton`, `avatarGroup`,
      `switchField`, `sliderField`, `stepperField`, `dropdown`, `tooltip` — each one a part, a class
      from its key, and a rules row of token references.
- [x] **A seventh demo and a third reference application.** `demos/agenda.html` puts the calendar,
      the money and the relative formatter under load. `studio.html` is the reference application for
      the state decorators: one store, two views that both repaint, undo across them, and the queue
      still there after a reload.

## Closed since

- [x] The signature column (spec 2 §17). It never needed writing by hand: every definition is one
      arrow on one line, so `catalog.json` now carries a `takes` field for every function among its
      3007 paths, read with the same masking the style rules use.

## Gaps the styling system had — all closed

Everything below went in as a table, so each one is a row to add rather than a rule to remember.

- [x] **No focus ring, no rest state, no press.** `components.states` held four selectors and every
      one of them was spent by a hand-written row, so a keyboard user saw whatever the browser gave
      them. `components.interactive` now names the classes that behave like controls and
      `components.pressable` the subset that answers a pointer; `focus`, `off`, `pressed` and `hover`
      are generated onto them from one style each, and `audit-rows` asserts that deleting one row of
      either table removes exactly the two state rules it named.
- [x] **Nothing was responsive.** `components.breakpoints` is the only place a width query is
      written, built from a token through `browser.upToWidth`, and `components.mediaRules` is one row
      per query with its rules keyed by class. Three rows: the compact viewport (the rail, the tiles,
      the page shell, the table and the modal all change shape), reduced motion, and print.
- [x] **Motion was not opt-in.** The transition over every interactive class is emitted inside a
      `prefers-reduced-motion: no-preference` block, so it is asked for rather than opted out of, and
      the `calm` media row stops the skeleton pulse for the same reader.
- [x] **A button had one look.** `components.variants` is one row per intent, spent as a data
      attribute exactly as a tone is, with a generated hover per variant so a filled button still
      answers the pointer. `actionButton` passes a variant through and `submitButton` is primary.
- [x] **No page shell and no ground.** `blueprints.page` plus `rules.page` is the centred, bounded
      column every demo was missing, and `components.hostRules` — keyed by `components.hostSelectors`
      — is the only place a rule on the document itself is written, so an application no longer needs
      a `<style>` block of its own to have a margin, a ground and a typeface.
- [x] **Tokens could only be changed globally.** `components.applyTokens(overrides)(element)` sets
      the same custom properties on one element, so a subtree can be branded without a theme.
- [x] **The sheet's shape was written in one long line.** `components.sheetExtras` is now the table
      that says which blocks the sheet carries and in what order.
- [x] **Five declarations in the sheet were invalid CSS**, so browsers had been dropping them all
      along, and no test could see it because jsdom does not lay out. `font: <family>` with no size
      is not a legal shorthand, so the library's typeface had never applied anywhere — it is
      `font-family` now, in all ten rules. `margin: none` and `padding: none` are not zero, so
      `itemList`, `menu` and `tree` kept the browser's list indent; `values.zero` is the zero.
      `flex-grow: 100%` is not a number, so `rules.body` never grew; `values.one` is written once and
      `values.opaque` and `values.grow` are its two names. `overflow: auto hidden` clipped the chat
      log vertically, which is the one direction a log scrolls. `rules.panel` grows too, which is
      what a detail pane beside a rail always wanted.
- [x] **A select, a search box and a text area could not be given a name.** All three now take
      `label` as an accessible name through `components.labelAria`, and so does `control`, which is
      what left the stepper's number input unlabelled. `styleguide.html` passes the library's own
      accessibility audit.
- [x] **`pageFooter` was a blueprint with no rule.** It has one.
- [x] **A live reference.** `styleguide.html` draws tokens, themes, variants, tones, states,
      breakpoints, scoped tokens and every widget — each section generated from the table it
      documents, so the page cannot drift. `check:apps` drives it with seven assertions.

## The flagship applications, and the twenty-six bugs they and a sweep of the library found

Two applications were built against the library to find out whether it could carry real work:
`apps/relay.html`, a dense keyboard-driven team inbox, and `apps/pantry.html`, thumb-first ordering
from a kitchen. `apps.md` states what each had to be able to do. Both are audited under the same
rules as the library with no new exemptions, and `scripts/check-flagships.js` drives them through
forty-eight assertions. Every gap is listed below with the row that closed it.

### What the applications could not say, so the library gained it

- [x] **Nothing sat above the page.** The whole sheet had zero `position` and zero `z-index`
      declarations. `src/23-overlays.js` is a new layer between `components` and `patterns`: one
      host, one z-index ladder, and a release for every open thing. Dialogs, drawers and sheets
      share one path; popovers anchor off a rectangle and close on a click away, escape or a
      scroll; toasts get a pinned host; tips are a visible bubble rather than a hidden note.
- [x] **`accessibility.modal` was wired into nothing, and half-broken.** Escape released the focus
      trap but left the escape listener attached, the page scroll locked and the element on screen.
      It now closes fully, takes an `onClose`, and leaves the decision to its owner so a stacked
      layer never closes the one beneath it. Scroll locks count, so a confirm over a dialog no
      longer leaves the page unscrollable.
- [x] **An application shell.** `shell` and `pane`, with the pane widths as a modifier table, so a
      three pane inbox needs no dimension in application code.
- [x] **A row you can click.** `rowButton`, in `interactive` and `pressable`, so it gets hover,
      focus, press and a selected state from the tables that already existed.
- [x] **One mechanism for data attributes.** `variants` and `sizes` were two copies of the same
      idea, and panes would have been a third. `components.modifiers` is one row per attribute and
      one emitter; `marksOf` runs in `baseSpec`, so every component picks up its marks from its own
      spec. `markNames` and `toneNames` let an application ask for a value by name.
- [x] **Virtual lists that change.** A virtual list could not be given new items, its rows could
      carry no marks of their own, and it forced the caller to write two dimensions. It now has
      `show`, a `rowSpec`, defaults for the row height and window, and a `fill` mode that takes its
      height from the box it was given.
- [x] **Media, choices, steps and a thumb bar.** A picture box that looks right before the picture
      arrives, a radio set that reports which value was chosen, a step track, and a tab bar that
      pins itself to the bottom of a phone.
- [x] **Forms that point at the problem.** A failing field now carries `aria-invalid`, shows its
      message in `fieldError`, and takes the focus.
- [x] **Alerts that carry an action**, so a toast can offer an undo, and checkboxes that can be
      half-checked, so a bulk selection can be partial.

### Bugs no test could have caught

jsdom does no layout, runs in UTC and never hovers, so none of these was visible from the suite.
Each is now pinned by a test row naming the exact condition that showed it.

- [x] **A month step overflowed instead of clamping.** 31 January plus a month was 3 March, so the
      calendar skipped February entirely; `endOf('month')` answered 28 days and `daysInMonth` was
      wrong for every long month. `dates.clampedDate` fixes all three at the root.
- [x] **A day step lost an hour across the daylight-saving fall back**, so `monthGrid` emitted one
      day twice — with a colliding `data-key`, which also confused the reconciler — and dropped
      another. Days now step in calendar days, not milliseconds.
- [x] **Hover was emitted after selection at equal specificity**, so hovering the current page or
      the selected day painted accent text on an accent ground. States are emitted in a decided
      order now, and selection wins.
- [x] **`announce()` appended a new live region on every call**, because `defaultTo` is eager —
      unbounded DOM growth and duplicate ids, which the library's own audit calls a violation.
- [x] **`events.once` never left the registry**, so `interaction.sortable` pinned a closure to the
      document for the life of the page.
- [x] **Every network request left an uncancelled thirty second timer**, and a toast's expiry
      outlived `stop()` and repainted a detached tree.
- [x] **A malformed percent-escape took the router down**; `decodeSafely` already existed.
- [x] **The URL parser and serialiser disagreed about the hash**, so `buildUrl(url(x))` double-hashed
      and hash routing missed.
- [x] **Five more styling bugs**: `:disabled` generated for anchors that cannot be disabled, a
      scroller whose only bound was an inert percentage, badge and switch rendered as ellipses
      rather than stadiums, a hover border the same colour as the resting one, and `resizable`
      sizing to the raw pointer delta while sliding away at the same time.
- [x] **Patterns built by `view()` had no `stop`**, though the lifecycle comment promised one.
- [x] **`predicates.isEmpty(null)` threw**, because `Object.keys(null)` does.
- [x] **`control.selectByKey` reached through to `Object.prototype`**, so a lookup for `valueOf` or
      `constructor` answered a function instead of the fallback. This is how the first flagship bug
      was found: `Weave.library.forms.valueOf` does not exist, and resolved to `Object.prototype.valueOf`.
- [x] **`patterns.restoreFocus` built the selector `[name=]`** whenever focus sat on anything
      without a name — a submit button, a row button, a div. That is not a valid selector, so every
      repaint threw. It now tries name, then id, then `data-key`.
- [x] **`browser.matchMedia` called the global unguarded**, so any host without it threw rather
      than degrading.
- [x] **A radio group could not say which value was chosen**: the event target only knows it is
      checked, so a choice group reported `true` for every option.
- [x] **Escape closed every open dialog at once**, and the sheet emitted the variant hover block
      before the variant it modifies.
- [x] **`patterns.queryBox` built a search box with no accessible name**, so `dataGrid`,
      `commandPalette` and `virtualGrid` each shipped an unlabelled control. All eighteen patterns
      now pass the library's own accessibility audit, and so do both flagships after every
      interaction the harness performs.

## The look pass — what a real browser said about the demos

Screenshots of every demo and both flagships, at 1440px, at 420px and in both themes, found
layout faults no unit test could see. Each one is closed by a row, never by a `<style>` block.

- [x] **Every dashboard was a column of 220px panels in a 1,440px window.** `tileTrack` used
      `auto-fill`, which keeps the empty tracks it creates. A new `panelTrack` row on `auto-fit`,
      and a `panels` class that spends it, gives the dashboard, the board and the flagships a
      grid that divides the width it has.
- [x] **Tables were clipped inside those panels**, because there was no width to clip to. The same
      row fixed it.
- [x] **`splitView` centred the chooser against the detail**, because it borrowed `row`, which
      centres. A `split` class starts both columns at the top, and the rail carries its own edge.
- [x] **The virtual grid drew its rows on top of one another.** A row with a fixed height had no
      `overflow`, so a wrapped cell spilled into the row beneath it. Rows now clip, cells truncate
      into a `dataRow` that fills its scroller, and a header row names the columns.
- [x] **A panel inside a panel drew two frames**, and a card inside a card drew two. `nestRules` is
      the new table for a rule about one class inside another — one row per pair, and it flattens
      a pattern nested in a dashboard panel or in a dialog.
- [x] **Every form control was white in the dark theme**, because `control`, `searchBox`,
      `selectBox` and `textArea` set a border but never a ground.
- [x] **The wizard's trail was a breadcrumb**, which says where you have been, not where you are.
      It is the `steps` progress track now, with exactly one step current.
- [x] **A tag or a pill stretched to its column** in any vertical stack. They hug their words now,
      and a tag keeps a column of its own in a dense list, as a timestamp does.
- [x] **A menu item was a button-shaped box**, not a row. One `nestRules` row makes menu and tree
      items full-width quiet rows, and the chosen one is tinted — in the queue, in the tree and in
      the list alike.
- [x] **The calendar's day counts knocked the weeks out of alignment**, because a table cell
      aligns on the baseline by default.
- [x] **An empty state was two lines of grey text.** It can lead with a glyph now, and the same
      `glyphMark` carries the gallery's icons.
- [x] **A search box with a label still looked empty**, because nothing became a placeholder.
- [x] **Relay's threads marched in step**: every folder held exactly eighty unread, because the
      generator was `index % n` all the way down. `composition.noise` is a deterministic
      one-dimensional hash; the inbox now has avatars, unread dots, stars, and counts that differ.
- [x] **Relay's reader was four identical cards.** It is a conversation: the snippet opens it,
      replies alternate sides, and the bubble knows whose side it is on — the same `side` mark the
      help desk chat uses.
- [x] **Pantry's photographs were 28px emoji in a grey box.** `glyphSize` and a `mediaWash`
      gradient, and on a phone the menu is two columns rather than one full-bleed tile per screen.
- [x] **The style guide listed colours as hex strings.** Each one is a swatch.

## Tenants — the eighth demo, and the gaps it found

A console one company runs for four customers. It was chosen because nothing else in the repository
had a workspace switcher, a plan with limits, or a question asked before a destructive act — and
because half the library had no demo at all. `patterns.menu`, `patterns.confirm`, `switchField`,
`sliderField`, `progressBar`, `alert`, `accordion` and `actionBar` were all unspent until now.

- [x] **`alert` read its second line from `text`, not `note`**, so a banner written the way every
      other component in the library is written came out with a title and nothing under it. It
      reads `noteOf` now, as `emptyState` and `confirm` already did.
- [x] **`progressBar` had no rule at all.** It is a `<progress>` element, so it also needed the two
      pseudo-elements a bar is actually drawn from — `states.track` and `states.filled` — and a
      `toneRules` row, so a meter over its limit runs red rather than accent.
- [x] **A switch did not look switched.** `switchControl` was a grey stadium with no knob and no
      checked state. It now has `states.on`, `states.knob` and `states.knobOn`: three suffixes, one
      knob that slides, and a label that sits at the far side of its row.
- [x] **A table wider than its panel spilled onto the page** at phone width. `tableBox` wraps every
      table in a sideways scroller, so a data grid clips at its panel edge instead.
- [x] **`actionButton` dropped the `aria` a caller gave it**, so a tree node or a menu row could
      never say it was the chosen one.

## Not done

- [ ] `weave.d.ts` — explicitly not a milestone (spec 2 §16).
