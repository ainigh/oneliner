# Weave — Specification (draft 1)

A small DOM library in the spirit of jQuery's coverage, written so that every idea exists in exactly one place.

## 1. Form rules (how every line looks)

1. One statement per line. Every line ends in `;`.
2. Every definition is a fully qualified assignment: `Weave.<layer>.<group>.<name> = ...;`. No `const`, `let`, `function` declarations except the single root `const Weave = {};`.
3. Every function is a one-liner arrow function. If it does not fit on one line (soft limit ~140 chars), it is split into more named one-liners, never wrapped across lines.
4. No local variables. Intermediate values become named functions.
5. No `if`, `switch`, `for`, `while`, `try`. Branching only through `Weave.library.control.*`; iteration only through `map` / `reduce` / `forEach` / `filter`.
6. Every name is a full English word or phrase that reads as a sentence at the call site: `Weave.library.browser.setAttribute`, not `W.b.attr`. Predicates start with `is`/`has`/`can`. Actions are verbs. Builders are nouns.
7. Tables before code. Any place where two lines differ only by a literal (a tag name, an event name, a setter) is replaced by a table object plus one `defineEach` call.
8. A literal string that identifies a browser concept (`'div'`, `'click'`, `'style'`, `'classList'`) appears in the source exactly once.
9. Comments: one line per group explaining the group's contract. No per-function comments; the name is the comment.

## 2. Layer rules (what may go where)

```
Weave
  .library
    .composition   pure functions on values and functions; no browser, no branching, no mutation
    .predicates    functions returning boolean; nothing else
    .control       branching and looping combinators; the only place `?` lives
    .browser       thin wrappers around document/window/Element; the only place they are named
    .elements      element specs, builders, and setters, generated from tables
    .query         selection and traversal (find, parents, children, siblings, closest)
    .attributes    attr / prop / data / class helpers
    .style         css get/set, show/hide, dimensions, position
    .events        on / off / once / delegate / trigger, plus the ready hook
    .effects       fade / slide / animate built on requestAnimationFrame or CSS transitions
    .network       fetch wrappers: getJson, postJson, load into element
    .collections   operations on lists of elements (the "$(...)" set semantics)
  .application     user code; may call only Weave.library.*
```

Dependency direction is strictly downward in this list: a layer may call layers above it, never below. `browser` is the only layer allowed to mention `document`, `window`, `Element`, `Node`, `Event`, `fetch`, `requestAnimationFrame`.

## 3. Element spec shape

Every builder takes one spec object. Each key is a "part" and each part has one setter row in `Weave.library.elements.setters`:

```
{ attributes: {k: v}, properties: {k: v}, styles: {k: v}, classes: [..],
  data: {k: v}, listeners: {event: fn}, children: [node|string|spec] }
```

Tag defaults live in `Weave.library.elements.tags` and share the same shape, so defaults merge per part.

## 4. jQuery coverage map

| jQuery idea | Weave home |
|---|---|
| `$('sel')`, `.find`, `.closest`, `.parent`, `.children`, `.siblings`, `.eq`, `.first`, `.last` | `query` |
| `.attr`, `.prop`, `.data`, `.addClass`, `.removeClass`, `.toggleClass`, `.hasClass`, `.val` | `attributes` |
| `.css`, `.show`, `.hide`, `.toggle`, `.width`, `.height`, `.offset`, `.position` | `style` |
| `.on`, `.off`, `.one`, delegated `.on`, `.trigger`, `$(fn)` ready | `events` |
| `.html`, `.text`, `.append`, `.prepend`, `.before`, `.after`, `.remove`, `.empty`, `.clone`, `.wrap` | `elements` |
| `.fadeIn`, `.fadeOut`, `.slideUp`, `.slideDown`, `.animate` | `effects` |
| `$.ajax`, `$.getJSON`, `.load` | `network` |
| `.each`, `.map`, `.filter`, `.not`, `.is`, `.add` | `collections` |
| `$.extend`, `$.each`, `$.map`, `$.grep`, `$.trim` | `composition` |
| `$.isFunction`, `$.isArray`, `$.isPlainObject`, `$.isEmptyObject` | `predicates` |

Deliberately not covered: `$.Deferred` (use Promises), `.serialize` (phase 2 if needed), browser-quirk shims.

## 5. Collection semantics

A "collection" is a plain array of elements. Every single-element function `f(el, ...)` gets a collection version automatically: `Weave.library.collections.lift(f)` maps it over the array and returns the array. Which functions get lifted is a table, not hand-written lines.

## 6. Redundancy tests (must hold at every milestone)

- Grep for any tag name, event name, or browser API name returns one line.
- No two lines are identical after replacing string/number literals with `_`.
- No function body exceeds one line.
- No token `document`, `window`, `fetch` appears outside `Weave.library.browser`.
- Removing a table row removes the feature; adding a row adds it, with no other edits.

## 7. Milestones

| # | Deliverable | Done when |
|---|---|---|
| 0 | `weave.js` skeleton: root, layer objects, `composition`, `predicates`, `control`, `browser`, `elements` (from sample) | Sample page runs against the file instead of inline script |
| 1 | `query` + `collections` + `lift` | `Weave.library.query.all('button')` returns array; lifted `styles` works on it |
| 2 | `attributes` + `style` | Class toggling, css get/set, show/hide, dimensions |
| 3 | `events` | on/off/once/delegate/trigger/ready; sample rewritten using delegate |
| 4 | Element manipulation (html/text/insert/remove/clone/wrap) | Tag table extended to full HTML5 list from one array |
| 5 | `effects` | fade/slide via CSS transitions, promise-returning |
| 6 | `network` | getJson/postJson/load |
| 7 | Redundancy audit script | A node script that enforces section 6 and fails on violation |

## 8. Open decisions

1. Soft line limit: 120 or 140 characters?
2. Alias policy: none at all, or allow `Weave.application` code a local `const lib = Weave.library;`?
3. Do `query` functions return arrays always (even for one match), or a single element for `first`?
4. Should `Weave.library.browser` also own `localStorage` / `history`, or leave those for a later layer?
