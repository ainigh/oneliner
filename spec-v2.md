
# Weave — Specification (draft 2)

Draft 2 supersedes draft 1 (`spec-v1.md`). Everything in draft 1 still holds unless this document says otherwise. Draft 2 adds: a resolved answer for every draft-1 open decision, a complete per-layer API catalog, a catalog of every table the library is generated from, an exhaustive jQuery coverage map, the layers beyond jQuery (forms, timing, observers, storage, navigation, interaction, accessibility), the audit script contract, the test contract, and the distribution contract.

Nothing in this document is implemented yet. The document is the contract the implementation will be audited against.

---

## 0. Vocabulary

| Term | Meaning |
|---|---|
| **oneliner** | The coding style described in section 1. Non-negotiable. |
| **line** | One statement, one `;`, one assignment to a fully qualified `Weave.*` path. |
| **layer** | A direct child of `Weave.library` (or `Weave.application`). |
| **group** | A named sub-object of a layer used only to hold a table or a family (`Weave.library.elements.setters`). |
| **table** | A plain object whose keys are names and whose values are data. Tables are the only place literals that name browser concepts may appear. |
| **row** | One key/value pair of a table. Adding a row adds a feature; deleting a row deletes it. |
| **generator** | A `defineEach(target, make)(table)` line that turns a table into functions. |
| **reducer** | A function `(el, [key, value]) => el` used with `reduce` over table pairs. |
| **setter** | A curried function `spec => el => el`. Data first, element last, so setters pipe. |
| **getter** | A function `el => value`. Element first. Never mutates. |
| **action** | A function `el => el` or `(el, arg) => el`. Mutates the element, returns it. |
| **collection** | A plain JavaScript array of elements. Never a wrapper object. |
| **lift** | Turning a single-element function into one that maps over a collection. |
| **spec** | The one-object description of an element (section 3). |

---

## 1. Form rules (how every line looks)

Rules 1–9 are unchanged from draft 1 and restated here so this document stands alone. Rules 10 onward are new.

1. **One statement per line.** Every line ends in `;`.
2. **Every definition is a fully qualified assignment**: `Weave.<layer>.<group>.<name> = ...;`. No `const`, `let`, `var`, `function`, `class` declarations. The single exception is the root line `const Weave = {};`.
3. **Every function is a one-liner arrow function.** Soft limit 140 characters, hard limit 160 (audit fails). Too long means split into more named one-liners, never wrap.
4. **No local variables.** Intermediate values become named functions. Default parameters (`(spec = {}) =>`) are allowed and are the only way to give a value a name inside a function.
5. **No `if`, `switch`, `for`, `for..of`, `for..in`, `while`, `do`.** Branching only through `Weave.library.control.*`. Iteration only through `map` / `reduce` / `forEach` / `filter` / `some` / `every` / `find` / `flatMap`, or through recursion via `Weave.library.control.unfold` and `Weave.library.control.until`.
6. **Every name is a full English word or phrase.** It reads as a sentence at the call site. Predicates start with `is` / `has` / `can`. Actions are verbs. Getters are nouns or `<noun>Of`. Builders are nouns. Tables are plural nouns. No abbreviations (`attribute`, not `attr`; `element`, not `el`, in names; parameter names may be short since they never appear at a call site).
7. **Tables before code.** Any place where two lines would differ only by a literal is replaced by a table plus one generator line.
8. **Every browser-concept literal appears exactly once.** Tag names, event names, attribute names, CSS property names, storage keys, HTTP methods, MIME types, ARIA roles, key names. They live in tables (section 13).
9. **Comments:** one block comment per group, stating the group's contract. No per-function comments. The name is the comment.
10. **No aliases.** No `const lib = Weave.library;` anywhere, including `Weave.application`. Every call site spells the full path. This is what makes `grep` a complete reference tool.
11. **The ternary `?:` appears only in `Weave.library.control`.** The short-circuit operators `&&`, `||`, `??`, `?.` count as branching and are likewise confined to `Weave.library.control`. Other layers reach branching by calling a control combinator.
12. **`throw` appears exactly once**, in `Weave.library.control.fail`. **`try` appears exactly once**, in `Weave.library.control.attempt`. Both are one physical line. No other layer throws or catches.
13. **No `async` / `await`.** Asynchrony is expressed with Promise chains (`.then`, `.catch`, `.finally`) which are ordinary one-liner calls. `Promise` is named only in `Weave.library.composition` (constructors, `resolve`, `reject`, `all`, `race`).
14. **No `this`.** Every function is an arrow function; handlers receive the element as an argument or read `event.currentTarget` through `Weave.library.events.targetOf`.
15. **No `new` outside `Weave.library.browser` and `Weave.library.composition`.** `new` in the browser layer wraps constructors (`CustomEvent`, `URL`, `FormData`, `IntersectionObserver`, `AbortController`, `URLSearchParams`). `new` in composition is limited to `Promise` and `Map` / `Set`.
16. **Arguments are never mutated except elements.** Objects and arrays passed in are treated as immutable; new ones are returned. Elements are the deliberate exception: actions mutate them and return the same element.
17. **Argument order:** the element is the last argument of setters (curried, so `setter(data)(el)`) and the first argument of getters and actions (`getter(el)`, `action(el, arg)`). Reducers take `(el, pair)`.
18. **Every function returns something useful.** Actions return the element. Setters return the element. Builders return the element. Getters return the value. Event registration returns an unsubscribe function. Effects return a Promise of the element. Network calls return a Promise.
19. **Numbers are unitless at API boundaries.** Pixel strings are produced only by `Weave.library.composition.pixels`; parsed only by `Weave.library.composition.number`.
20. **No global side effects at load time** except building the `Weave` tree. Nothing touches the DOM until `Weave.application` calls something.

### 1.1 The eight allowed line shapes

Every line in `weave.js` matches exactly one of these. The audit script (section 14) rejects any other shape.

| # | Shape | Example |
|---|---|---|
| A | Root | `const Weave = {};` |
| B | Namespace | `Weave.library.query = {};` |
| C | Table row | `Weave.library.elements.tags.button = { attributes: { type: 'button' } };` |
| D | Function | `Weave.library.composition.pixels = n => n + 'px';` |
| E | Derived value | `Weave.library.elements.parts = Object.keys(Weave.library.elements.setters);` |
| F | Generator call | `Weave.library.composition.defineEach(Weave.library.elements, Weave.library.elements.build)(Weave.library.elements.tags);` |
| G | Group comment | `/* query: selection and traversal. Returns arrays, never wrappers. */` |
| H | Application state | `Weave.application.count = 0;` (allowed only under `Weave.application`) |

---

## 2. Layer rules (what may go where)

```
Weave
  .library
    .composition    pure functions on values and functions; no browser, no branching, no mutation
    .predicates     functions returning boolean; nothing else
    .control        branching, looping, error and promise combinators; the only place `? : && || ?? throw try` live
    .browser        thin wrappers around every global; the only place globals are named
    .elements       element specs, builders, setters, insertion, removal, cloning, wrapping; generated from tables
    .query          selection and traversal; returns arrays or a single element per section 6
    .attributes     attribute / property / data / class / value helpers
    .style          css get/set, visibility, dimensions, position, scroll
    .events         on / off / once / delegate / trigger / ready; event object helpers
    .effects        fade / slide / animate via CSS transitions and Web Animations; promise-returning
    .forms          serialize, values, fill, reset, validity, submit interception
    .network        fetch wrappers with JSON, form, text, blob bodies; load into element; abort and timeout
    .timing         debounce, throttle, delay, frame, idle, interval; all cancellable
    .observers      mutation, intersection, resize, media-query, visibility observers; all return unsubscribe
    .storage        localStorage, sessionStorage, cookies, JSON-encoded
    .navigation     location, history, hash, query string, a tiny hash/path router
    .interaction    focus management, keyboard tables, pointer and drag, clipboard, scroll-into-view
    .accessibility  aria helpers, live regions, focus trap, reduced-motion awareness
    .collections    lifted versions of every single-element function; set operations
  .application      user code; may call only Weave.library.*
```

### 2.1 Dependency direction

A layer may call only layers listed **above** it. `collections` is last inside the library because it lifts functions from every other layer. `application` may call any `Weave.library.*` path and nothing else.

### 2.2 The browser boundary

`Weave.library.browser` is the only layer that may name any of:

`document`, `window`, `globalThis`, `navigator`, `location`, `history`, `localStorage`, `sessionStorage`, `fetch`, `Element`, `Node`, `NodeList`, `HTMLElement`, `Text`, `DocumentFragment`, `Event`, `CustomEvent`, `KeyboardEvent`, `MouseEvent`, `PointerEvent`, `FormData`, `URL`, `URLSearchParams`, `AbortController`, `MutationObserver`, `IntersectionObserver`, `ResizeObserver`, `requestAnimationFrame`, `cancelAnimationFrame`, `requestIdleCallback`, `setTimeout`, `clearTimeout`, `setInterval`, `clearInterval`, `getComputedStyle`, `matchMedia`, `innerWidth`, `innerHeight`, `scrollX`, `scrollY`, `performance`, `crypto`, `structuredClone`, `DOMParser`, `Blob`, `File`, `Response`, `Headers`, `Request`.

Every browser function is a one-liner that does one call and returns either the result or the element. No browser function calls another layer except `composition` (for `pixels`, `pairs`) and `predicates`.

### 2.3 What `composition` may name

`Object`, `Array`, `Math`, `JSON`, `String`, `Number`, `Boolean`, `Promise`, `Map`, `Set`, `Symbol`, `Date`, `RegExp`, `encodeURIComponent`, `decodeURIComponent`. No DOM.

---

## 3. Element spec shape

Every builder takes one spec object. Each key is a **part**; each part has exactly one row in `Weave.library.elements.setters`. Parts are applied in table order.

```
{
  attributes: { name: value },        setAttribute; value `null` removes
  properties: { name: value },        el[name] = value  (checked, value, disabled, innerHTML …)
  styles:     { property: value },    el.style[property] = value; numbers get 'px' unless in the unitless table
  classes:    ['a', 'b'],             classList.add
  data:       { key: value },         dataset[key] = value
  aria:       { label: 'Close' },     setAttribute('aria-' + key, value)
  listeners:  { event: handler },     addEventListener; handler receives the native event
  children:   [node | string | spec], appended in order; strings become text nodes; specs become elements via `Weave.library.elements.fromSpec`
  text:       'string',               textContent (mutually exclusive with html and children; last one wins by table order)
  html:       '<b>trusted</b>',       innerHTML; caller is responsible for trust
  ref:        fn                      called with the finished element; for capturing handles in application code
}
```

Rules:
- Tag defaults live in `Weave.library.elements.tags` and share the same shape. Defaults merge **per part**: `merge(defaults[part], spec[part])`. For array parts (`classes`, `children`) merge is concatenation.
- A spec may carry a `tag` key when built through `Weave.library.elements.fromSpec` (the generic builder); named builders ignore it.
- Unknown keys are ignored silently. The audit test page checks this.
- The order of the `setters` table is the order of application. `ref` is last by definition.

---

## 4. API catalog

Signature notation: `name(args) -> return`. Curried setters are written `name(data)(el)`. `el` is always an `Element`; `nodes` is an array of elements; `fn` is a function; `sel` is a CSS selector string; `unsubscribe` is a zero-argument function that undoes the call; `P<x>` is a Promise of x.

Every function listed here is a required deliverable of the milestone that owns its layer (section 18). A function not in this catalog is not in the library.

### 4.1 `Weave.library.composition`

| Name | Signature | Notes |
|---|---|---|
| `identity` | `x -> x` | |
| `constant` | `x -> () -> x` | |
| `pipe` | `(...fns) -> x -> y` | Left to right |
| `compose` | `(...fns) -> x -> y` | Right to left |
| `curry2` | `f -> a -> b -> f(a, b)` | Only arities 2 and 3 are provided; more is a smell |
| `curry3` | `f -> a -> b -> c -> f(a, b, c)` | |
| `flip` | `f -> (a, b) -> f(b, a)` | Turns getters into setters and back |
| `apply` | `(f, args) -> f(...args)` | |
| `tap` | `f -> x -> (f(x), x)` | Side effect, returns input |
| `pairs` | `obj -> [[k, v]]` | `Object.entries` |
| `fromPairs` | `[[k, v]] -> obj` | `Object.fromEntries` |
| `keys` | `obj -> [k]` | |
| `values` | `obj -> [v]` | |
| `merge` | `(a, b) -> obj` | Shallow, right wins |
| `mergeDeep` | `(a, b) -> obj` | Recursive for plain objects; arrays concatenate |
| `mergeAll` | `[objs] -> obj` | `reduce(merge, {})` |
| `pick` | `[keys] -> obj -> obj` | |
| `omit` | `[keys] -> obj -> obj` | |
| `mapValues` | `f -> obj -> obj` | |
| `mapKeys` | `f -> obj -> obj` | |
| `eachPair` | `f -> obj -> undefined` | `pairs(obj).forEach(f)` |
| `defineEach` | `(target, make) -> table -> undefined` | The generator. `target[k] = make(v, k)` per row |
| `defineEachPrefixed` | `(target, prefix, make) -> table -> undefined` | `target[prefix + capitalize(k)]` |
| `flatten` | `[[x]] -> [x]` | One level |
| `unique` | `[x] -> [x]` | Preserves first occurrence order |
| `compact` | `[x] -> [x]` | Drops `null` and `undefined` only |
| `toArray` | `iterable -> [x]` | `Array.from` |
| `range` | `n -> [0..n-1]` | |
| `zip` | `([a], [b]) -> [[a, b]]` | |
| `first` | `[x] -> x` | `undefined` on empty |
| `last` | `[x] -> x` | |
| `rest` | `[x] -> [x]` | |
| `chunk` | `n -> [x] -> [[x]]` | |
| `groupBy` | `f -> [x] -> obj` | |
| `sortBy` | `f -> [x] -> [x]` | Stable, non-mutating |
| `difference` | `([a], [b]) -> [a]` | |
| `intersection` | `([a], [b]) -> [a]` | |
| `union` | `([a], [b]) -> [a]` | |
| `words` | `string -> [string]` | Splits on whitespace, drops empties |
| `trim` | `string -> string` | |
| `capitalize` | `string -> string` | |
| `camelCase` | `string -> string` | `background-color` → `backgroundColor` |
| `kebabCase` | `string -> string` | Reverse |
| `pixels` | `number -> string` | `n + 'px'` |
| `number` | `string -> number` | `parseFloat`; `NaN` becomes `0` via control |
| `clamp` | `(low, high) -> n -> n` | |
| `random` | `n -> integer in [0, n)` | |
| `randomId` | `prefix -> string` | Uses `crypto` through browser; composition only formats |
| `json` | `x -> string` | `JSON.stringify` |
| `parseJson` | `string -> x` | Never throws; returns `undefined` on failure through `control.attempt` |
| `encode` | `string -> string` | `encodeURIComponent` |
| `decode` | `string -> string` | |
| `queryString` | `obj -> string` | `a=1&b=2`, encoded, arrays repeat the key |
| `parseQueryString` | `string -> obj` | Repeated keys become arrays |
| `escapeHtml` | `string -> string` | The five characters `& < > " '` via a table |
| `escapeSelector` | `string -> string` | `CSS.escape` semantics, implemented in composition |
| `template` | `string -> obj -> string` | `{{key}}` substitution, HTML-escaped; `{{{key}}}` raw |
| `resolved` | `x -> P<x>` | |
| `rejected` | `reason -> P<never>` | |
| `all` | `[P<x>] -> P<[x]>` | |
| `race` | `[P<x>] -> P<x>` | |
| `then` | `f -> p -> P<y>` | Curried so it pipes |
| `deferred` | `() -> { promise, resolve, reject }` | The one place `new Promise` appears |
| `now` | `() -> number` | `Date.now` |
| `noop` | `() -> undefined` | |
| `always` | `() -> true` | |
| `never` | `() -> false` | |

### 4.2 `Weave.library.predicates`

Every function returns a boolean. No exceptions, no `undefined`.

| Name | Test |
|---|---|
| `isString`, `isNumber`, `isBoolean`, `isFunction`, `isSymbol` | `typeof` |
| `isArray` | `Array.isArray` |
| `isObject` | Non-null `typeof 'object'` |
| `isPlainObject` | Prototype is `Object.prototype` or `null` |
| `isEmptyObject` | No own keys |
| `isEmptyArray` | Length zero |
| `isEmpty` | Either of the above, or empty string |
| `isNil` | `null` or `undefined` |
| `isDefined` | Not nil |
| `isNumeric` | Finite number or numeric string |
| `isInteger` | |
| `isPromise` | Has a `then` function |
| `isIterable` | Has `Symbol.iterator` |
| `isElement` | `instanceof Element` |
| `isText` | `instanceof Text` |
| `isNode` | `instanceof Node` |
| `isFragment` | `instanceof DocumentFragment` |
| `isDocument` | |
| `isWindow` | |
| `isNodeList` | `NodeList` or `HTMLCollection` |
| `isSpec` | Plain object whose keys are all parts (or `tag`) |
| `isSelector` | String that parses as a selector without throwing (via `control.attempt`) |
| `isEvent` | `instanceof Event` |
| `isConnected` | `el.isConnected` |
| `isVisible` | Has layout boxes and not `visibility: hidden` |
| `isHidden` | Negation |
| `isDisabled` | `disabled` property or attribute |
| `isChecked` | |
| `isSelected` | |
| `isFocused` | `document.activeElement === el` |
| `isFocusable` | Matches the focusable-selector table |
| `isFormControl` | `input`, `select`, `textarea`, `button` |
| `isMultiSelect` | |
| `isCheckable` | `checkbox` or `radio` |
| `isFileInput` | |
| `isSubmitButton` | |
| `isInViewport` | Bounding rect intersects viewport |
| `matches` | `sel -> el -> boolean` (curried, for filters) |
| `contains` | `(parent, child) -> boolean` |
| `hasClass` | `name -> el -> boolean` |
| `hasAttribute` | `name -> el -> boolean` |
| `hasData` | `key -> el -> boolean` |
| `hasChildren` | |
| `hasParent` | |
| `isSameNode` | `(a, b)` |
| `isBefore` | `(a, b)` document order |
| `isAfter` | |
| `isUnitless` | `cssProperty -> boolean` (from the unitless table) |
| `isBooleanAttribute` | From the boolean-attribute table |
| `isVoidTag` | From the void-tag table |
| `isKey` | `name -> event -> boolean` (from key table) |
| `isModified` | Event has ctrl, meta, alt, or shift |
| `isLeftButton`, `isRightButton`, `isMiddleButton` | |
| `isTouch` | Pointer type |
| `isReducedMotion` | `prefers-reduced-motion` media |
| `isDarkScheme` | `prefers-color-scheme` media |
| `isOnline` | `navigator.onLine` |
| `isSecure` | `location.protocol` |
| `isSameOrigin` | `url -> boolean` |
| `isOk` | `response -> response.ok` |
| `isJsonResponse` | Content-type table |
| `not` | `pred -> x -> boolean` |
| `both` | `(p, q) -> x -> boolean` |
| `either` | `(p, q) -> x -> boolean` |
| `all` | `[preds] -> x -> boolean` |
| `any` | `[preds] -> x -> boolean` |

### 4.3 `Weave.library.control`

The only layer with `? :`, `&&`, `||`, `??`, `?.`, `throw`, `try`.

| Name | Signature | Behaviour |
|---|---|---|
| `when` | `(test, f) -> x -> x'` | `test(x) ? f(x) : x` |
| `unless` | `(test, f) -> x -> x'` | |
| `either` | `(test, f, g) -> x -> y` | if/else |
| `select` | `[[test, f]] -> x -> y` | First matching row; the `switch` replacement |
| `selectByKey` | `(table, fallback) -> key -> value` | Table lookup with default |
| `dispatch` | `(table, fallback) -> key -> (...args) -> value` | Table of functions keyed by string |
| `defaultTo` | `fallback -> x -> x'` | `??` |
| `orElse` | `fallback -> x -> x'` | `\|\|` |
| `andThen` | `f -> x -> y` | `x && f(x)` |
| `maybe` | `f -> x -> y` | `f` only if `isDefined(x)`, else `undefined` |
| `guard` | `test -> x -> x` | Returns `x` or `undefined` |
| `fail` | `message -> never` | The single `throw` |
| `attempt` | `(f, onError) -> x -> y` | The single `try`; `onError(error, x)` |
| `attemptOr` | `(f, fallback) -> x -> y` | `attempt` with constant fallback |
| `unfold` | `step -> seed -> [x]` | Recursion until `step` returns nil; the `while` replacement for walks |
| `until` | `(test, step) -> seed -> x` | Recursion until `test` passes; the `while` replacement for searches |
| `times` | `n -> f -> [y]` | `range(n).map(f)` |
| `loop` | `(test, body) -> seed -> x` | Iterate `body` while `test`; recursive; bounded by a depth limit from the constants table |
| `after` | `promise -> f -> P<y>` | `promise.then(f)` |
| `recover` | `promise -> f -> P<y>` | `promise.catch(f)` |
| `finally` | `promise -> f -> P<x>` | |
| `sequence` | `[() -> P<x>] -> P<[x]>` | Serial, not parallel |
| `retry` | `(times, f) -> P<x>` | Re-invokes on rejection |
| `timeout` | `(ms, promise) -> P<x>` | Rejects with the timeout error from the errors table |
| `memoize` | `f -> f'` | Single-argument, `Map` backed |
| `once` | `f -> f'` | First call only |
| `spread` | `f -> args -> f(...args)` | |
| `nullable` | `x -> x` | Turns `undefined` into `null` so callers have one nil |

### 4.4 `Weave.library.browser`

Every function is one native call. This is the complete surface the rest of the library may use to reach the platform. Names mirror the platform name plus a verb.

**Document and creation**

| Name | Signature |
|---|---|
| `document` | `() -> document` |
| `body`, `head`, `documentElement`, `activeElement` | `() -> el` |
| `createElement` | `tag -> el` |
| `createElementNamespaced` | `(namespace, tag) -> el` (SVG, MathML) |
| `createText` | `string -> Text` |
| `createFragment` | `() -> DocumentFragment` |
| `createRange` | `() -> Range` |
| `parseHtml` | `string -> DocumentFragment` (via `template` element) |
| `parseDocument` | `(string, mime) -> Document` (`DOMParser`) |
| `importNode` | `(node, deep) -> node` |
| `adoptNode` | |

**Selection**

| Name | Signature |
|---|---|
| `querySelector` | `(root, sel) -> el or null` |
| `querySelectorAll` | `(root, sel) -> [el]` (already `Array.from`) |
| `getElementById` | `id -> el or null` |
| `matches` | `(el, sel) -> boolean` |
| `closest` | `(el, sel) -> el or null` |
| `elementFromPoint` | `(x, y) -> el or null` |

**Tree**

| Name | Signature |
|---|---|
| `parentOf` | `el -> el or null` (`parentElement`) |
| `childrenOf` | `el -> [el]` |
| `childNodesOf` | `el -> [node]` |
| `firstChildOf`, `lastChildOf`, `nextSiblingOf`, `previousSiblingOf` | `el -> el or null` (element variants) |
| `appendChild` | `(el, child) -> el` |
| `prependChild` | `(el, child) -> el` |
| `insertBefore` | `(reference, node) -> reference` |
| `insertAfter` | `(reference, node) -> reference` |
| `replaceChild` | `(old, replacement) -> replacement` |
| `removeChild` | `el -> el` (`el.remove()`) |
| `cloneNode` | `(el, deep) -> el` |
| `contains` | `(parent, node) -> boolean` |
| `compareDocumentPosition` | `(a, b) -> number` |
| `isConnected` | `el -> boolean` |
| `ownerDocumentOf` | |

**Content**

| Name | Signature |
|---|---|
| `textContentOf` / `setTextContent` | |
| `innerHtmlOf` / `setInnerHtml` | |
| `outerHtmlOf` | |
| `insertAdjacentHtml` | `(el, position, html) -> el` |
| `insertAdjacentElement` | `(el, position, node) -> el` |

**Attributes and properties**

| Name | Signature |
|---|---|
| `getAttribute` | `(el, name) -> string or null` |
| `setAttribute` | `(el, [name, value]) -> el` (reducer) |
| `removeAttribute` | `(el, name) -> el` |
| `hasAttribute` | `(el, name) -> boolean` |
| `attributeNamesOf` | `el -> [name]` |
| `toggleAttribute` | `(el, name, force) -> el` |
| `getProperty` | `(el, name) -> value` |
| `setProperty` | `(el, [name, value]) -> el` (reducer) |
| `deleteProperty` | |
| `datasetOf` | `el -> DOMStringMap` |
| `setDataset` | `(el, [key, value]) -> el` |
| `deleteDataset` | |
| `classListOf` | `el -> DOMTokenList` |
| `addClass`, `removeClass`, `toggleClass`, `replaceClass`, `containsClass` | Direct `classList` calls |
| `tagNameOf` | `el -> lower-case string` |
| `idOf` | |

**Style and geometry**

| Name | Signature |
|---|---|
| `styleOf` | `el -> CSSStyleDeclaration` (inline) |
| `setStyle` | `(el, [property, value]) -> el` (reducer) |
| `removeStyle` | `(el, property) -> el` |
| `computedStyleOf` | `el -> CSSStyleDeclaration` |
| `computedValueOf` | `(el, property) -> string` |
| `setCssVariable` / `cssVariableOf` | Custom properties |
| `boundingRectOf` | `el -> DOMRect` |
| `clientRectsOf` | |
| `offsetWidthOf`, `offsetHeightOf`, `offsetLeftOf`, `offsetTopOf`, `offsetParentOf` | |
| `clientWidthOf`, `clientHeightOf`, `clientLeftOf`, `clientTopOf` | |
| `scrollWidthOf`, `scrollHeightOf`, `scrollLeftOf`, `scrollTopOf` | |
| `setScrollLeft`, `setScrollTop` | |
| `scrollTo` | `(el, options) -> el` |
| `scrollIntoView` | `(el, options) -> el` |
| `viewportWidth`, `viewportHeight` | `() -> number` |
| `pageScrollX`, `pageScrollY` | `() -> number` |
| `scrollWindowTo` | |
| `devicePixelRatio` | |
| `matchMedia` | `query -> MediaQueryList` |

**Events**

| Name | Signature |
|---|---|
| `addListener` | `(el, [type, handler]) -> el` (reducer; the sample's signature) |
| `addListenerWithOptions` | `(el, type, handler, options) -> el` |
| `removeListener` | `(el, type, handler, options) -> el` |
| `dispatch` | `(el, event) -> boolean` |
| `createEvent` | `(type, init) -> CustomEvent` |
| `createKeyboardEvent`, `createMouseEvent`, `createPointerEvent` | |
| `preventDefault`, `stopPropagation`, `stopImmediatePropagation` | `event -> event` |
| `targetOf`, `currentTargetOf`, `relatedTargetOf`, `typeOf`, `detailOf`, `keyOf`, `codeOf`, `buttonOf`, `pointerTypeOf`, `clientXOf`, `clientYOf`, `pageXOf`, `pageYOf`, `deltaYOf`, `timeStampOf`, `isDefaultPrevented` | Event getters |
| `readyState` | `() -> string` |
| `createAbortController` | `() -> AbortController` |
| `abort` | `controller -> controller` |
| `signalOf` | `controller -> AbortSignal` |

**Focus and selection**

| Name | Signature |
|---|---|
| `focus`, `blur`, `click`, `select` | `el -> el` |
| `setSelectionRange` | |
| `selectionOf` | `() -> Selection` |

**Forms**

| Name | Signature |
|---|---|
| `formDataOf` | `form -> FormData` |
| `formDataEntries` | `FormData -> [[k, v]]` |
| `elementsOf` | `form -> [el]` |
| `submit`, `requestSubmit`, `reset` | `form -> form` |
| `checkValidity`, `reportValidity`, `setCustomValidity`, `validityOf`, `validationMessageOf` | |
| `filesOf` | `input -> [File]` |
| `selectedOptionsOf` | `select -> [option]` |

**Timing and frames**

| Name | Signature |
|---|---|
| `setTimeout` | `(fn, ms) -> id` |
| `clearTimeout` | |
| `setInterval`, `clearInterval` | |
| `requestFrame`, `cancelFrame` | |
| `requestIdle`, `cancelIdle` | Falls back to `setTimeout` through control |
| `now` | `performance.now` |

**Observers**

| Name | Signature |
|---|---|
| `createMutationObserver`, `createIntersectionObserver`, `createResizeObserver` | `(callback, options) -> observer` |
| `observe` | `(observer, el, options) -> observer` |
| `unobserve`, `disconnect` | |

**Animation**

| Name | Signature |
|---|---|
| `animate` | `(el, keyframes, options) -> Animation` |
| `animationsOf` | `el -> [Animation]` |
| `finished` | `animation -> P<Animation>` |
| `cancelAnimation`, `finishAnimation`, `pauseAnimation`, `playAnimation` | |

**Network**

| Name | Signature |
|---|---|
| `fetch` | `(url, init) -> P<Response>` |
| `responseJson`, `responseText`, `responseBlob`, `responseFormData`, `responseArrayBuffer` | `response -> P<x>` |
| `statusOf`, `okOf`, `headersOf`, `headerOf`, `urlOf` | |
| `createHeaders`, `createFormData`, `createBlob`, `createUrl`, `createSearchParams` | |
| `beacon` | `(url, data) -> boolean` |

**Storage, location, history, navigator, clipboard**

| Name | Signature |
|---|---|
| `localStorageGet`, `localStorageSet`, `localStorageRemove`, `localStorageClear`, `localStorageKeys` | |
| `sessionStorageGet`, `sessionStorageSet`, `sessionStorageRemove`, `sessionStorageClear`, `sessionStorageKeys` | |
| `cookieString`, `setCookieString` | Raw `document.cookie` |
| `location` | `() -> Location` |
| `href`, `pathname`, `search`, `hash`, `origin`, `protocol`, `host` | `() -> string` |
| `assign`, `replace`, `reload`, `setHash` | |
| `pushState`, `replaceState`, `back`, `forward`, `go`, `stateOf`, `historyLength` | |
| `userAgent`, `language`, `languages`, `onLine`, `platform`, `hardwareConcurrency`, `maxTouchPoints` | |
| `writeClipboardText`, `readClipboardText` | `-> P<x>` |
| `randomValues` | `n -> Uint8Array` |
| `randomUuid` | `() -> string` |
| `title`, `setTitle` | |
| `visibilityState` | |
| `structuredClone` | |

**Namespaces and constants exposed as tables**

| Table | Rows |
|---|---|
| `Weave.library.browser.namespaces` | `svg`, `mathml`, `xhtml`, `xlink` |
| `Weave.library.browser.positions` | `beforebegin`, `afterbegin`, `beforeend`, `afterend` |
| `Weave.library.browser.readyStates` | `loading`, `interactive`, `complete` |
| `Weave.library.browser.nodeTypes` | `element`, `text`, `comment`, `document`, `fragment` |

### 4.5 `Weave.library.elements`

Builders, setters, insertion, removal, cloning, wrapping.

| Name | Signature | Notes |
|---|---|---|
| `setters` | table | One reducer per part (section 3) |
| `parts` | derived | `keys(setters)` |
| `attributes`, `properties`, `styles`, `classes`, `data`, `aria`, `listeners`, `children`, `text`, `html`, `ref` | `value -> el -> el` | Generated from `setters` via `applyAll` |
| `applyAll` | `reducer -> value -> el -> el` | |
| `applyPart`, `steps`, `assemble`, `build` | as in the sample | |
| `tags` | table | Every HTML5 tag (section 13.1) with defaults |
| `div`, `span`, … one per tag | `(spec = {}) -> el` | Generated from `tags` |
| `svgTags` | table | `svg`, `path`, `circle`, `rect`, `line`, `polyline`, `polygon`, `g`, `text`, `use`, `defs`, `symbol`, `clipPath`, `mask`, `linearGradient`, `radialGradient`, `stop` |
| `svg`, `path`, … | `(spec = {}) -> el` | Generated with the SVG namespace; builders live under `Weave.library.elements.svg` group to avoid the `text` name clash |
| `fromSpec` | `spec -> el` | Reads `spec.tag`; falls back to `div` |
| `fromHtml` | `string -> [node]` | Parses one or more nodes |
| `fromHtmlOne` | `string -> el` | First element of the parse |
| `toNode` | `x -> node` | string → text; spec → element; node → node; array → fragment |
| `toFragment` | `[x] -> DocumentFragment` | |
| `textOf` / `setText` | `el -> string` / `string -> el -> el` | `.text()` |
| `htmlOf` / `setHtml` | | `.html()` |
| `outerHtmlOf` | | |
| `append` | `[x] -> el -> el` | Accepts nodes, strings, specs, arrays |
| `prepend` | `[x] -> el -> el` | |
| `before` | `[x] -> el -> el` | |
| `after` | `[x] -> el -> el` | |
| `appendTo` | `target -> el -> el` | Returns the moved element |
| `prependTo`, `insertBefore`, `insertAfter` | `target -> el -> el` | |
| `replaceWith` | `x -> el -> el'` | Returns the replacement |
| `replaceAll` | `target -> el -> el` | |
| `remove` | `el -> el` | Detaches, removes nothing else (listeners die with the element per platform) |
| `detach` | `el -> el` | Alias-free: same as remove; provided for the coverage map only as `remove` |
| `empty` | `el -> el` | |
| `clone` | `el -> el` | Deep, no listeners |
| `cloneWithListeners` | `el -> el` | Re-applies listeners recorded by `events` (section 8.5) |
| `wrap` | `wrapper -> el -> el` | `wrapper` is a spec, node, or html string; returns the original element |
| `wrapAll` | `wrapper -> nodes -> wrapper` | |
| `wrapInner` | `wrapper -> el -> el` | |
| `unwrap` | `el -> el` | |
| `insertionPositions` | table | Maps `append`/`prepend`/`before`/`after` to `positions` rows |
| `voidTags` | table | For `outerHtml` serialization and `isVoidTag` |

### 4.6 `Weave.library.query`

Return convention: functions named with a plural noun return arrays; functions named with a singular noun return one element or `null`. (Draft-1 open decision 3, resolved in section 19.)

| Name | Signature | jQuery |
|---|---|---|
| `all` | `sel -> [el]` | `$(sel)` |
| `allWithin` | `sel -> root -> [el]` | `.find` |
| `one` | `sel -> el or null` | |
| `oneWithin` | `sel -> root -> el or null` | |
| `byId` | `id -> el or null` | `$('#id')` |
| `byClass` | `name -> [el]` | |
| `byTag` | `name -> [el]` | |
| `byName` | `name -> [el]` | Form controls |
| `byData` | `(key, value) -> [el]` | |
| `find` | `sel -> el -> [el]` | `.find` (per element) |
| `findOne` | `sel -> el -> el or null` | |
| `closest` | `sel -> el -> el or null` | `.closest` |
| `parent` | `el -> el or null` | `.parent` |
| `parents` | `el -> [el]` | `.parents`, nearest first |
| `parentsUntil` | `sel -> el -> [el]` | |
| `parentsMatching` | `sel -> el -> [el]` | `.parents(sel)` |
| `children` | `el -> [el]` | `.children` |
| `childrenMatching` | `sel -> el -> [el]` | |
| `contents` | `el -> [node]` | `.contents` includes text nodes |
| `firstChild`, `lastChild` | `el -> el or null` | |
| `siblings` | `el -> [el]` | `.siblings` |
| `next`, `previous` | `el -> el or null` | `.next`, `.prev` |
| `nextAll`, `previousAll` | `el -> [el]` | |
| `nextUntil`, `previousUntil` | `sel -> el -> [el]` | |
| `nextMatching`, `previousMatching` | `sel -> el -> el or null` | `.next(sel)` |
| `offsetParent` | `el -> el` | |
| `root` | `el -> Document` | Owner document |
| `indexOf` | `el -> number` | `.index()` among siblings |
| `indexWithin` | `(nodes, el) -> number` | `.index(el)` |
| `has` | `sel -> el -> boolean` | Descendant exists |
| `descendantsMatching` | `pred -> el -> [el]` | Walks the tree with a predicate instead of a selector |
| `walk` | `el -> [el]` | Depth-first list of every descendant |
| `fromPoint` | `(x, y) -> el or null` | |
| `focused` | `() -> el or null` | |
| `formOf` | `control -> form or null` | |
| `labelsOf` | `control -> [label]` | |

### 4.7 `Weave.library.attributes`

| Name | Signature | jQuery |
|---|---|---|
| `attribute` | `name -> el -> string or null` | `.attr(name)` |
| `setAttribute` | `(name, value) -> el -> el` | `.attr(name, value)` |
| `setAttributes` | `obj -> el -> el` | `.attr(obj)` |
| `removeAttribute` | `name -> el -> el` | `.removeAttr` |
| `removeAttributes` | `[names] -> el -> el` | |
| `toggleAttribute` | `(name, force) -> el -> el` | |
| `attributes` | `el -> obj` | Every attribute as an object |
| `booleanAttribute` | `name -> el -> boolean` | Uses the boolean-attribute table |
| `setBooleanAttribute` | `(name, on) -> el -> el` | Adds or removes |
| `property` | `name -> el -> value` | `.prop(name)` |
| `setProperty` | `(name, value) -> el -> el` | |
| `setProperties` | `obj -> el -> el` | |
| `removeProperty` | `name -> el -> el` | `.removeProp` |
| `data` | `key -> el -> value` | `.data(key)`; reads `dataset`, JSON-decodes when parseable |
| `setData` | `(key, value) -> el -> el` | JSON-encodes non-strings |
| `setDataAll` | `obj -> el -> el` | |
| `removeData` | `key -> el -> el` | |
| `dataAll` | `el -> obj` | `.data()` |
| `classes` | `el -> [string]` | |
| `addClass` | `names -> el -> el` | String (space separated) or array |
| `removeClass` | `names -> el -> el` | |
| `toggleClass` | `(names, force) -> el -> el` | |
| `replaceClass` | `(old, replacement) -> el -> el` | |
| `setClasses` | `[names] -> el -> el` | Replaces all |
| `hasClass` | `name -> el -> boolean` | Re-exported from predicates for the coverage map; single definition lives in predicates |
| `value` | `el -> string or [string] or boolean` | `.val()`; multi-select → array; checkbox → checked boolean via the value-readers table |
| `setValue` | `value -> el -> el` | Table-driven per control type |
| `id` / `setId` | | |
| `name` / `setName` | | |
| `tagName` | `el -> string` | |
| `aria` | `key -> el -> string or null` | |
| `setAria` | `(key, value) -> el -> el` | |
| `setAriaAll` | `obj -> el -> el` | |
| `role` / `setRole` | | |
| `valueReaders` | table | `checkbox`, `radio`, `select-multiple`, `select-one`, `file`, default |
| `valueWriters` | table | Same keys |
| `booleanAttributes` | table | `checked`, `disabled`, `selected`, `readonly`, `required`, `multiple`, `hidden`, `open`, `autofocus`, `autoplay`, `controls`, `loop`, `muted`, `novalidate`, `inert` |

### 4.8 `Weave.library.style`

| Name | Signature | jQuery |
|---|---|---|
| `css` | `property -> el -> string` | `.css(name)` computed |
| `setCss` | `(property, value) -> el -> el` | Numbers → `px` unless unitless |
| `setCssAll` | `obj -> el -> el` | `.css(obj)` |
| `removeCss` | `property -> el -> el` | |
| `cssAll` | `[properties] -> el -> obj` | `.css([..])` |
| `inlineCss` | `property -> el -> string` | |
| `cssVariable` / `setCssVariable` | | |
| `show` | `el -> el` | Restores previous display or the default-display table value |
| `hide` | `el -> el` | Records current display in `data` then sets `none` |
| `toggle` | `(force) -> el -> el` | |
| `isShown` | `el -> boolean` | |
| `defaultDisplays` | table | `div: block`, `span: inline`, `table: table`, `tr: table-row`, `td: table-cell`, `li: list-item`, … |
| `width`, `height` | `el -> number` | Content box (`.width()`) |
| `innerWidth`, `innerHeight` | `el -> number` | Padding box |
| `outerWidth`, `outerHeight` | `el -> number` | Border box |
| `outerWidthWithMargin`, `outerHeightWithMargin` | `el -> number` | `.outerWidth(true)` |
| `setWidth`, `setHeight` | `number -> el -> el` | |
| `dimensions` | `el -> { width, height }` | |
| `boxSides` | table | `top`, `right`, `bottom`, `left` |
| `boxParts` | table | `padding`, `border`, `margin` with the computed-property names |
| `boxSize` | `(part, side) -> el -> number` | Generated: `paddingTop`, `borderLeft`, `marginBottom`, … |
| `offset` | `el -> { top, left }` | Relative to document |
| `setOffset` | `{ top, left } -> el -> el` | |
| `position` | `el -> { top, left }` | Relative to offset parent |
| `rect` | `el -> { top, left, width, height, right, bottom }` | Viewport-relative plain object |
| `scrollTop`, `scrollLeft` | `el -> number` | |
| `setScrollTop`, `setScrollLeft` | `number -> el -> el` | |
| `scrollIntoView` | `options -> el -> el` | |
| `pageScroll` | `() -> { x, y }` | |
| `scrollPageTo` | `{ x, y, smooth } -> undefined` | |
| `viewport` | `() -> { width, height }` | |
| `unitlessProperties` | table | `opacity`, `zIndex`, `fontWeight`, `lineHeight`, `flex`, `flexGrow`, `flexShrink`, `order`, `orphans`, `widows`, `zoom`, `columnCount`, `fillOpacity`, `strokeOpacity`, `animationIterationCount`, `gridRow`, `gridColumn`, `tabSize` |
| `toCssValue` | `(property, value) -> string` | Applies `pixels` unless unitless |
| `matchesMedia` | `query -> boolean` | |

### 4.9 `Weave.library.events`

| Name | Signature | jQuery |
|---|---|---|
| `on` | `(type, handler) -> el -> unsubscribe` | `.on(type, fn)` |
| `onWithOptions` | `(type, handler, options) -> el -> unsubscribe` | `capture`, `passive`, `once`, `signal` |
| `onAll` | `obj -> el -> unsubscribe` | `.on({ click: f, keyup: g })` |
| `onTypes` | `([types], handler) -> el -> unsubscribe` | `.on('a b', fn)` |
| `off` | `(type, handler) -> el -> el` | `.off` |
| `offAll` | `el -> el` | Removes every listener registered through Weave (section 8.5) |
| `once` | `(type, handler) -> el -> unsubscribe` | `.one` |
| `delegate` | `(type, sel, handler) -> el -> unsubscribe` | `.on(type, sel, fn)`; handler receives `(event, matchedElement)` |
| `delegateAll` | `obj -> el -> unsubscribe` | Keyed by `'click .selector'` strings, split by a composition function |
| `trigger` | `(type, detail) -> el -> el` | `.trigger`; bubbles, cancelable |
| `triggerNative` | `type -> el -> el` | Calls `el.click()`, `el.focus()`, `el.submit()` from the native-triggers table |
| `dispatchEvent` | `event -> el -> boolean` | Returns `!defaultPrevented` |
| `ready` | `fn -> undefined` | `$(fn)`; runs now if state is already interactive |
| `loaded` | `fn -> undefined` | Window load |
| `beforeUnload` | `fn -> unsubscribe` | |
| `unsubscribeAll` | `[unsubscribe] -> undefined` | |
| `withSignal` | `controller -> options` | Builds options carrying an AbortSignal so a group of listeners is removed by one `abort` |
| `group` | `() -> { options, dispose }` | The namespaced-events replacement |
| `hover` | `(enter, leave) -> el -> unsubscribe` | `.hover` |
| `preventDefault`, `stopPropagation`, `stop` | `event -> event` | `stop` does both |
| `prevented` | `handler -> handler'` | Wraps a handler to `preventDefault` first |
| `target`, `currentTarget`, `relatedTarget`, `detail`, `type`, `key`, `code`, `button`, `clientX`, `clientY`, `pageX`, `pageY`, `deltaY`, `timeStamp`, `pointerType`, `modifiers` | `event -> value` | The event object helpers; `modifiers` returns `{ ctrl, meta, alt, shift }` |
| `targetMatching` | `sel -> event -> el or null` | `closest` from the target |
| `valueOfTarget` | `event -> string` | For input handlers |
| `types` | table | Every standard event name grouped (section 13.2) |
| `click`, `dblclick`, `input`, `change`, `submit`, `keydown`, `keyup`, `focus`, `blur`, `mouseenter`, … one per row | `handler -> el -> unsubscribe` | Generated from `types`: `Weave.library.events.on(type)` partially applied |
| `nativeTriggers` | table | `click`, `focus`, `blur`, `submit`, `reset`, `select` |
| `keyboard` | group | See `interaction` for key tables; `events.onKey` lives here: `(key, handler) -> el -> unsubscribe` |
| `throttled`, `debounced` | `(ms, handler) -> handler'` | Composed from `timing`; provided here so `on('scroll', throttled(100, f))` reads well |

### 4.10 `Weave.library.effects`

All effects return `P<el>` resolved when the effect completes, or when it is cancelled (rejected with the cancelled error from the errors table). Reduced motion (via `accessibility`) makes every effect complete immediately.

| Name | Signature | jQuery |
|---|---|---|
| `defaults` | table | `duration: 300`, `easing: 'ease'`, `fill: 'both'` |
| `easings` | table | `linear`, `ease`, `easeIn`, `easeOut`, `easeInOut`, `swing` → CSS timing functions |
| `animate` | `(keyframes, options) -> el -> P<el>` | Web Animations; `keyframes` is `obj` or `[obj]` |
| `transition` | `(styles, options) -> el -> P<el>` | Sets a CSS transition, applies styles, resolves on `transitionend` or timeout |
| `fadeIn`, `fadeOut`, `fadeToggle` | `(options) -> el -> P<el>` | Opacity, then `show`/`hide` |
| `fadeTo` | `(opacity, options) -> el -> P<el>` | |
| `slideDown`, `slideUp`, `slideToggle` | `(options) -> el -> P<el>` | Height from/to `0` with `overflow: hidden` |
| `showAnimated`, `hideAnimated`, `toggleAnimated` | `(options) -> el -> P<el>` | `.show(duration)` family: width, height, opacity together |
| `pulse`, `shake`, `flash` | `(options) -> el -> P<el>` | Small preset table `Weave.library.effects.presets`; each preset is keyframes plus options |
| `presets` | table | The rows above |
| `stop` | `el -> el` | Cancels every running animation (`.stop(true)`) |
| `finish` | `el -> el` | Jumps every running animation to its end |
| `pause`, `resume` | `el -> el` | |
| `isAnimating` | `el -> boolean` | |
| `queue` | `[el -> P<el>] -> el -> P<el>` | Runs effects in sequence (`.queue`) |
| `delay` | `ms -> el -> P<el>` | `.delay` |
| `parallel` | `[el -> P<el>] -> el -> P<el>` | |
| `whenTransitionEnds` | `el -> P<el>` | |
| `whenAnimationEnds` | `el -> P<el>` | |
| `cssTransition` | `(properties, options) -> string` | Builds the `transition` shorthand string |
| `toKeyframes` | `styles -> [obj]` | From current computed to target |

### 4.11 `Weave.library.forms`

| Name | Signature | jQuery |
|---|---|---|
| `values` | `form -> obj` | Named controls → values; repeated names → arrays; unchecked boxes omitted |
| `serialize` | `form -> string` | `.serialize()` query string |
| `serializeArray` | `form -> [{ name, value }]` | `.serializeArray()` |
| `formData` | `form -> FormData` | |
| `fill` | `obj -> form -> form` | Sets every named control from the object |
| `clear` | `form -> form` | Empties every control |
| `reset` | `form -> form` | |
| `controls` | `form -> [el]` | Submittable elements only |
| `controlsNamed` | `name -> form -> [el]` | |
| `control` | `name -> form -> el or null` | |
| `submittable` | table | Selector rows: `input:not([type=submit],[type=button],[type=reset],[type=file],[disabled])`, `select:not([disabled])`, `textarea:not([disabled])` |
| `isValid` | `form -> boolean` | |
| `report` | `form -> boolean` | `reportValidity` |
| `invalidControls` | `form -> [el]` | |
| `validationMessage` | `el -> string` | |
| `setCustomValidity` | `message -> el -> el` | |
| `validateWith` | `(rules) -> form -> [{ el, message }]` | `rules` is `{ name: [(value) -> string or ''] }`; table of validators |
| `validators` | table | `required`, `minLength`, `maxLength`, `pattern`, `email`, `number`, `min`, `max`, `matches` — each `param -> value -> message or ''` |
| `messages` | table | Default message strings for each validator |
| `onSubmit` | `handler -> form -> unsubscribe` | Prevents default, passes `(values, form, event)` |
| `onSubmitAsync` | `handler -> form -> unsubscribe` | Disables controls while the returned promise is pending |
| `onChange` | `handler -> form -> unsubscribe` | Delegated `input` and `change` |
| `disable`, `enable` | `form -> form` | Every control |
| `focusFirstInvalid` | `form -> form` | |
| `dirty` | `form -> boolean` | Compares to snapshot in data |
| `snapshot` | `form -> form` | Records current values for `dirty` |

### 4.12 `Weave.library.network`

All calls return Promises. Non-2xx responses **reject** with an error object from the errors table carrying `status`, `url`, and `body` (parsed by content type).

| Name | Signature | jQuery |
|---|---|---|
| `defaults` | table | `credentials: 'same-origin'`, `headers: {}`, `timeout: 30000` |
| `methods` | table | `get`, `post`, `put`, `patch`, `delete`, `head`, `options` |
| `contentTypes` | table | `json`, `form`, `multipart`, `text`, `html` → MIME strings |
| `request` | `(url, options) -> P<Response>` | `$.ajax`: merges defaults, applies timeout and abort, rejects on `!ok` |
| `get`, `post`, `put`, `patch`, `delete`, `head` | `(url, options) -> P<Response>` | Generated from `methods` |
| `getJson` | `(url, options) -> P<x>` | `$.getJSON` |
| `postJson`, `putJson`, `patchJson` | `(url, body, options) -> P<x>` | JSON body and header |
| `getText` | `(url, options) -> P<string>` | |
| `getHtml` | `(url, options) -> P<[node]>` | Parsed |
| `getBlob` | | |
| `postForm` | `(url, formOrObject, options) -> P<x>` | `application/x-www-form-urlencoded` |
| `postMultipart` | `(url, formOrFormData, options) -> P<x>` | |
| `submitForm` | `options -> form -> P<x>` | Uses the form's own `action` and `method` |
| `load` | `(url, sel) -> el -> P<el>` | `.load(url selector)`: replaces the element's children with the fetched fragment |
| `loadInto` | `url -> el -> P<el>` | Without selector |
| `parseByContentType` | `response -> P<x>` | Dispatch table on the content-type prefix |
| `parsers` | table | `json`, `text`, `html`, `blob`, `formData` |
| `withTimeout` | `ms -> options -> options` | Adds an AbortSignal |
| `abortable` | `() -> { options, abort }` | |
| `withHeaders`, `withQuery`, `withBody`, `withCredentials` | `x -> options -> options` | Option builders that pipe |
| `url` | `(base, query) -> string` | Appends a query string safely |
| `error` | `response -> error` | Builds the rejection value |
| `isNetworkError`, `isHttpError`, `isTimeoutError`, `isAbortError` | `error -> boolean` | |
| `retrying` | `(times, fn) -> fn'` | Retries idempotent requests |
| `script` | `url -> P<el>` | `$.getScript`: appends a script element, resolves on load |
| `stylesheet` | `url -> P<el>` | Same for `link` |
| `image` | `url -> P<el>` | Preload an image |
| `beacon` | `(url, data) -> boolean` | |
| `poll` | `(ms, fn) -> unsubscribe` | Repeats a request on an interval, stops when hidden |
| `hooks` | group | `beforeSend`, `afterReceive`, `onError` arrays; `$.ajaxSetup` / `ajaxPrefilter` replacement; each is a list of functions `options -> options` |

### 4.13 `Weave.library.timing`

Everything returns a cancel function or a Promise, never a raw id.

| Name | Signature |
|---|---|
| `delay` | `ms -> P<undefined>` |
| `after` | `(ms, fn) -> cancel` |
| `every` | `(ms, fn) -> cancel` |
| `frame` | `() -> P<timestamp>` |
| `nextFrame` | `fn -> cancel` |
| `eachFrame` | `fn -> cancel` (`fn(timestamp, elapsed)`) |
| `idle` | `fn -> cancel` |
| `debounce` | `(ms, fn) -> fn'` with `fn'.cancel` and `fn'.flush` |
| `debounceLeading` | `(ms, fn) -> fn'` |
| `throttle` | `(ms, fn) -> fn'` |
| `throttleFrame` | `fn -> fn'` (one call per animation frame) |
| `defer` | `fn -> cancel` (microtask via resolved promise) |
| `timeoutPromise` | `(ms, promise) -> P<x>` |
| `stopwatch` | `() -> () -> elapsedMs` |
| `measure` | `(label, fn) -> fn'` (wraps with `performance.mark`/`measure`) |
| `raf` is **not** a name | Full words only |

### 4.14 `Weave.library.observers`

Every function returns an `unsubscribe`.

| Name | Signature |
|---|---|
| `onMutation` | `(options, handler) -> el -> unsubscribe`; handler receives `[MutationRecord]` |
| `onChildren` | `handler -> el -> unsubscribe` (childList, subtree false) |
| `onSubtree` | `handler -> el -> unsubscribe` |
| `onAttributes` | `([names], handler) -> el -> unsubscribe` |
| `onText` | `handler -> el -> unsubscribe` |
| `onAdded` | `(sel, handler) -> root -> unsubscribe` — fires for matching elements added anywhere under root, including existing ones |
| `onRemoved` | `(sel, handler) -> root -> unsubscribe` |
| `onIntersect` | `(options, handler) -> el -> unsubscribe`; handler receives `(entry)` |
| `onEnterViewport`, `onLeaveViewport` | `handler -> el -> unsubscribe` |
| `onceVisible` | `el -> P<el>` |
| `lazy` | `(handler) -> el -> unsubscribe` — runs once on first intersection then unsubscribes |
| `onResize` | `handler -> el -> unsubscribe`; handler receives `({ width, height })` |
| `onWindowResize` | `handler -> unsubscribe` (throttled to frames) |
| `onScroll` | `handler -> el -> unsubscribe` (passive) |
| `onWindowScroll` | `handler -> unsubscribe` |
| `onMedia` | `(query, handler) -> unsubscribe`; fires immediately with current state |
| `onReducedMotion`, `onColorScheme` | `handler -> unsubscribe` |
| `onVisibility` | `handler -> unsubscribe` (page visibility) |
| `onOnline`, `onOffline` | `handler -> unsubscribe` |
| `onFocusChange` | `handler -> unsubscribe` (document-level focusin/out) |
| `mutationOptions` | table: `children`, `subtree`, `attributes`, `text`, `all` |
| `mediaQueries` | table: `reducedMotion`, `darkScheme`, `lightScheme`, `hover`, `coarsePointer`, `print` |

### 4.15 `Weave.library.storage`

Values are JSON-encoded on write and decoded on read. Missing keys read as `undefined`. Every function is wrapped in `control.attemptOr` because storage throws in private modes.

| Name | Signature |
|---|---|
| `local`, `session` | groups, each generated from one table of operations |
| `local.get` | `key -> value` |
| `local.set` | `(key, value) -> value` |
| `local.remove` | `key -> undefined` |
| `local.clear` | `() -> undefined` |
| `local.keys` | `() -> [key]` |
| `local.has` | `key -> boolean` |
| `local.update` | `(key, fn) -> value` |
| `local.getOr` | `(key, fallback) -> value` |
| `session.*` | Same rows |
| `onChange` | `handler -> unsubscribe` (`storage` event, cross-tab) |
| `cookie` | `name -> string or undefined` |
| `cookies` | `() -> obj` |
| `setCookie` | `(name, value, options) -> undefined`; options from the cookie-options table |
| `removeCookie` | `name -> undefined` |
| `cookieOptions` | table: `path`, `domain`, `maxAge`, `expires`, `secure`, `sameSite` → serializer per row |
| `namespaced` | `prefix -> { get, set, remove, keys }` — prefixed views of `local` |
| `memory` | group: same interface on a `Map`, for tests and fallbacks |

### 4.16 `Weave.library.navigation`

| Name | Signature |
|---|---|
| `href`, `path`, `search`, `hash`, `origin`, `host` | `() -> string` |
| `query` | `() -> obj` (parsed search) |
| `queryValue` | `key -> string or undefined` |
| `setQuery` | `obj -> undefined` (replaceState) |
| `hashValue` | `() -> string` without `#` |
| `setHash` | `string -> undefined` |
| `onHashChange` | `handler -> unsubscribe` |
| `onPopState` | `handler -> unsubscribe` |
| `push` | `(url, state) -> undefined` |
| `replace` | `(url, state) -> undefined` |
| `state` | `() -> x` |
| `back`, `forward` | `() -> undefined` |
| `go` | `n -> undefined` |
| `navigate` | `url -> undefined` (full load) |
| `reload` | `() -> undefined` |
| `url` | `string -> URL parts object` (parse) |
| `buildUrl` | `{ path, query, hash } -> string` |
| `isActive` | `path -> boolean` |
| `route` | `pattern -> path -> params or null` (`/users/:id` → `{ id }`) |
| `router` | `routes -> { start, stop, go }` — `routes` is a table `{ pattern: handler }`; listens to popstate or hashchange per the `mode` option; `start` dispatches the current location |
| `interceptLinks` | `router -> root -> unsubscribe` — delegated click on same-origin anchors |
| `scrollRestoration` | `mode -> undefined` |
| `title` / `setTitle` | |

### 4.17 `Weave.library.interaction`

| Name | Signature |
|---|---|
| `focus`, `blur` | `el -> el` |
| `focusFirst` | `root -> el or null` (first focusable) |
| `focusLast` | `root -> el or null` |
| `focusables` | `root -> [el]` |
| `focusableSelector` | table row joined: `a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex]`, `[contenteditable]`, `summary`, `iframe`, `audio[controls]`, `video[controls]` each `:not([disabled]):not([tabindex="-1"])` |
| `restoreFocus` | `() -> () -> undefined` (captures active element, returns restorer) |
| `keys` | table: `enter`, `escape`, `space`, `tab`, `arrowUp`, `arrowDown`, `arrowLeft`, `arrowRight`, `home`, `end`, `pageUp`, `pageDown`, `backspace`, `delete` → `event.key` strings |
| `onKey` | `(keyName, handler) -> el -> unsubscribe` |
| `onKeys` | `obj -> el -> unsubscribe` (`{ escape: close, enter: submit }`) |
| `onEnter`, `onEscape`, `onArrow*` | Generated from `keys` |
| `shortcut` | `(combo, handler) -> el -> unsubscribe` (`'ctrl+shift+k'`, parsed by composition) |
| `modifierNames` | table: `ctrl`, `meta`, `alt`, `shift`, `mod` (meta on Mac, ctrl elsewhere) |
| `onOutsideClick` | `handler -> el -> unsubscribe` |
| `onLongPress` | `(ms, handler) -> el -> unsubscribe` |
| `onDoubleTap` | |
| `onSwipe` | `handler -> el -> unsubscribe`; handler receives `direction` from the directions table |
| `directions` | table: `up`, `down`, `left`, `right` |
| `draggable` | `options -> el -> unsubscribe` — pointer-based; options `{ axis, bounds, handle, onStart, onMove, onEnd }`; moves via `transform` |
| `droppable` | `options -> el -> unsubscribe` — `{ accept, onEnter, onLeave, onDrop }` |
| `sortable` | `options -> list -> unsubscribe` — reorders children by pointer drag |
| `resizable` | `options -> el -> unsubscribe` |
| `copyText` | `string -> P<boolean>` |
| `pasteText` | `() -> P<string>` |
| `copyFrom` | `el -> P<boolean>` (text content or value) |
| `selectText` | `el -> el` (selects contents or input range) |
| `scrollTo` | `(options) -> el -> P<el>` (resolves on `scrollend` or timeout) |
| `scrollToTop` | `() -> P<undefined>` |
| `lockScroll`, `unlockScroll` | `() -> undefined` (body overflow with scrollbar compensation) |
| `disable`, `enable` | `el -> el` (`disabled` attribute and `aria-disabled`) |
| `inert`, `uninert` | `el -> el` |
| `preventContextMenu` | `el -> unsubscribe` |
| `pointerPosition` | `event -> { x, y }` |
| `relativePosition` | `event -> el -> { x, y }` |

### 4.18 `Weave.library.accessibility`

| Name | Signature |
|---|---|
| `roles` | table of ARIA role strings used by the library (`dialog`, `alert`, `status`, `button`, `tab`, `tabpanel`, `tablist`, `menu`, `menuitem`, `listbox`, `option`, `tooltip`, `progressbar`) |
| `states` | table: `expanded`, `selected`, `checked`, `pressed`, `hidden`, `disabled`, `busy`, `current`, `invalid` |
| `setState` | `(state, value) -> el -> el` (`aria-` prefix from one place) |
| `state` | `state -> el -> string` |
| `expand`, `collapse`, `toggleExpanded` | `el -> el` (state plus `hidden` on the controlled element via `aria-controls`) |
| `controlledBy` | `el -> el or null` |
| `controls` | `el -> [el]` |
| `labelledBy`, `describedBy` | `el -> [el]` |
| `label` | `el -> string` (computed from `aria-label`, `aria-labelledby`, `<label>`, `title`, text) |
| `setLabel` | `string -> el -> el` |
| `hideFromTree`, `showInTree` | `el -> el` (`aria-hidden`) |
| `liveRegion` | `politeness -> el` (creates or returns the singleton region) |
| `announce` | `(message, politeness) -> undefined` |
| `politeness` | table: `polite`, `assertive` |
| `trapFocus` | `el -> unsubscribe` (cycles Tab inside; restores on release) |
| `modal` | `el -> unsubscribe` (trap + inert siblings + escape + restore) |
| `reducedMotion` | `() -> boolean` |
| `onReducedMotion` | `handler -> unsubscribe` |
| `skipLink` | `targetId -> el` (builds the standard skip link) |
| `visuallyHidden` | table row: the standard CSS for screen-reader-only content |
| `hideVisually` | `el -> el` |
| `tabbable` | `root -> [el]` (focusables with tabindex ≥ 0 in tab order) |
| `roving` | `options -> list -> unsubscribe` (roving tabindex with arrow keys; for toolbars, tabs, menus) |
| `audit` | `root -> [{ el, rule, message }]` — runs the small rules table: images without alt, buttons without label, inputs without label, duplicate ids, positive tabindex, missing lang |
| `auditRules` | table of `el -> message or ''` |

### 4.19 `Weave.library.collections`

Draft-1 section 5 unchanged in spirit; expanded here.

| Name | Signature | Notes |
|---|---|---|
| `lift` | `f -> nodes -> nodes` | For actions `el -> el`; maps and returns the array |
| `liftSetter` | `f -> data -> nodes -> nodes` | For curried setters `data -> el -> el` |
| `liftGetter` | `f -> nodes -> [value]` | For getters `el -> value` |
| `liftFirst` | `f -> nodes -> value` | Getter on the first element only (jQuery getter semantics) |
| `liftPredicate` | `p -> nodes -> boolean` | `every` |
| `liftQuery` | `f -> nodes -> nodes` | For `el -> [el]`: flatMap then unique, document order |
| `liftQueryOne` | `f -> nodes -> nodes` | For `el -> el or null`: map then compact then unique |
| `liftEffect` | `f -> nodes -> P<nodes>` | `all` over the promises |
| `liftSubscriber` | `f -> nodes -> unsubscribe` | Combines unsubscribes |
| `lifts` | table | Which layer functions get which lift; rows are `{ layer, name, kind }`; generated into `Weave.library.collections.<layer>.<name>` |
| `kinds` | table | `action`, `setter`, `getter`, `first`, `predicate`, `query`, `queryOne`, `effect`, `subscriber` → lift function |
| `from` | `x -> nodes` | Normalises selector, element, NodeList, array, null to an array |
| `each` | `f -> nodes -> nodes` | `.each` (f receives `(el, index)`) |
| `map` | `f -> nodes -> [x]` | `.map` (flattened, compacted as jQuery does) |
| `filter` | `selOrPred -> nodes -> nodes` | `.filter` |
| `not` | `selOrPred -> nodes -> nodes` | `.not` |
| `is` | `selOrPred -> nodes -> boolean` | `.is` (any) |
| `has` | `sel -> nodes -> nodes` | `.has` |
| `add` | `x -> nodes -> nodes` | `.add`, unique, document order |
| `eq` | `n -> nodes -> nodes` | Negative allowed |
| `at` | `n -> nodes -> el or undefined` | `.get(n)` |
| `first`, `last` | `nodes -> nodes` | Single-element arrays |
| `firstElement`, `lastElement` | `nodes -> el or undefined` | |
| `slice` | `(start, end) -> nodes -> nodes` | |
| `even`, `odd` | `nodes -> nodes` | |
| `index` | `el -> nodes -> number` | |
| `unique` | `nodes -> nodes` | `$.uniqueSort` |
| `sortByDocument` | `nodes -> nodes` | |
| `toArray` | `nodes -> nodes` | Identity, for the coverage map |
| `length` | `nodes -> number` | |
| `isEmpty` | `nodes -> boolean` | |
| `wrapAll` | `wrapper -> nodes -> wrapper` | Delegates to elements |
| `remove` | `nodes -> nodes` | Lifted, listed for clarity |
| `text` | `nodes -> string` | Concatenated (jQuery semantics) |
| `html` | `nodes -> string` | First only |

Semantics:
- A collection is always an array. Never a wrapper object. Never `this`.
- Empty collections are fine everywhere: actions return `[]`, getters return `[]`, `liftFirst` returns `undefined`, effects resolve `[]`.
- Chaining is `pipe`: `Weave.library.composition.pipe(Weave.library.collections.attributes.addClass('on'), Weave.library.collections.style.show)(nodes)`.
- Every single-element function in every layer has exactly one row in `lifts` or is explicitly listed in `Weave.library.collections.unlifted` with a reason (for example `ready`, which takes no element).

---

## 5. Naming catalog

Prefixes and suffixes are fixed so a reader can guess the name.

| Pattern | Meaning | Example |
|---|---|---|
| `is<X>` / `has<X>` / `can<X>` | Predicate | `isVisible` |
| `<noun>` | Getter | `width`, `attribute` |
| `<noun>Of` | Getter in the browser layer (avoids clashing with the higher-layer getter) | `textContentOf` |
| `set<Noun>` | Setter (curried) | `setAttribute` |
| `set<Noun>All` | Setter taking an object | `setDataAll` |
| `remove<Noun>` | Remover | `removeClass` |
| `toggle<Noun>` | Toggle | `toggleClass` |
| `on<Event>` | Subscribe; returns unsubscribe | `onResize` |
| `once<Event>` / `when<Event>Ends` | Promise of one occurrence | `whenTransitionEnds` |
| `<verb>` | Action | `remove`, `focus`, `append` |
| `<verb>To` / `<verb>Into` | Action whose argument is the target | `appendTo`, `loadInto` |
| `<noun>s` | Table | `tags`, `types`, `easings` |
| `lift<Kind>` | Lift | `liftGetter` |
| `with<Noun>` | Option builder that pipes | `withHeaders` |
| `from<Source>` | Converter | `fromSpec`, `fromHtml` |
| `to<Target>` | Converter | `toNode`, `toCssValue` |
| `default<Noun>s` / `defaults` | Defaults table | `defaultDisplays` |

Forbidden names: any abbreviation (`attr`, `el`, `fn`, `cb`, `evt`, `raf`, `req`, `res`, `btn`, `msg`, `idx`, `len`, `ctx`, `obj` as a function name), any single letter, any name ending in a number, any name containing an underscore, `$`.

---

## 6. Return conventions (draft-1 open decision 3, resolved)

| Function class | Returns |
|---|---|
| Plural query (`all`, `parents`, `children`) | Array, possibly empty |
| Singular query (`one`, `parent`, `closest`, `next`) | Element or `null` (never `undefined`) |
| Action / setter / builder | The element acted on |
| Insertion that moves (`appendTo`) | The moved element |
| `replaceWith` | The replacement |
| Getter | The value; `null` for missing attributes; `undefined` for missing data or storage keys; `0` for dimensions of detached elements |
| Predicate | Boolean |
| Subscriber (`on*`, observers, `draggable`) | Zero-argument unsubscribe function |
| Effect | `P<el>` |
| Network | `P<parsed body>` for typed helpers, `P<Response>` for `request` and the method functions |
| Timing | Cancel function or Promise |
| Collection version of any of the above | Per section 4.19 kinds |

---

## 7. Errors

| Row in `Weave.library.control.errors` | Raised by | Shape |
|---|---|---|
| `timeout` | `control.timeout`, `network.request` | `{ name: 'TimeoutError', message, ms }` |
| `abort` | `network` when the signal fires | `{ name: 'AbortError', message }` |
| `http` | `network.request` on `!ok` | `{ name: 'HttpError', message, status, url, body }` |
| `network` | `fetch` rejection | `{ name: 'NetworkError', message, cause }` |
| `cancelled` | `effects.stop` | `{ name: 'CancelledError', message }` |
| `invalidSpec` | `elements.fromSpec` with no tag and no default | `{ name: 'InvalidSpecError', message, spec }` |
| `depthExceeded` | `control.loop` | `{ name: 'DepthError', message, depth }` |

Errors are plain objects built by `Weave.library.control.error(row, details)`. They are never `Error` instances except where the platform demands it (the single `throw` in `fail` wraps the object in `Error` with `cause`). Synchronous library functions never throw; they return `null`/`undefined`/`[]`. Only Promises reject.

---

## 8. Events detail

### 8.1 Registration

`on(type, handler)(el)` calls `addListener` and returns `() => removeListener(el, type, handler)`. That returned function is the only handle the caller needs. There are no jQuery namespaces; grouping is done with `Weave.library.events.group()` which hands out an `options` object carrying one AbortSignal and a `dispose` function that aborts it.

### 8.2 Delegation

`delegate(type, sel, handler)(root)` registers one listener on `root`. On each event it computes `Weave.library.events.targetMatching(sel)(event)` and, when non-null and contained in `root`, calls `handler(event, matched)`. The listener does not use `this`.

### 8.3 Handler signature

Every handler receives the native event first. Delegated handlers receive `(event, matched)`. Form handlers receive `(values, form, event)`. Key handlers receive `(event, keyName)`. There is no wrapped event object; the helpers in section 4.9 read what jQuery's event object exposed.

### 8.4 Trigger

`trigger(type, detail)(el)` creates a `CustomEvent` with `{ bubbles: true, cancelable: true, detail }` and dispatches it. For native activation (`click`, `focus`, `submit`) use `triggerNative`, driven by the native-triggers table, because synthetic events do not perform default actions.

### 8.5 Listener registry

To support `offAll` and `cloneWithListeners`, `events.on` records `[type, handler, options]` into a `WeakMap` keyed by element, held in `Weave.library.events.registry`. `WeakMap` is named in `composition` only. Listeners registered directly through `browser.addListener` (for example by spec `listeners`) are routed through `events.on` in milestone 3 so the registry is complete.

### 8.6 Ready

`ready(fn)`: if `browser.readyState()` is not `loading`, call `fn` on the next microtask; otherwise register `DOMContentLoaded`. Only one literal `'DOMContentLoaded'` exists, in the `types` table.

---

## 9. Effects detail

- Primary engine is the Web Animations API through `browser.animate`. Fallback (when `animate` is absent) is CSS transitions through `effects.transition`. The choice is a single `control.either` in `effects.engine`.
- `fadeIn` reads current display; if hidden, sets display from `defaultDisplays` with opacity `0`, then animates to `1`.
- `slideDown` measures target height while `visibility: hidden`, then animates `height` from `0` with `overflow: hidden`, and clears inline height on completion.
- Reduced motion (section 4.18) forces `duration: 0`; the promise still resolves asynchronously so callers see consistent timing.
- `stop` cancels through `browser.cancelAnimation` for every animation on the element and rejects their promises with the `cancelled` error. `finish` calls `finishAnimation`.
- Running effects on an element are tracked by the platform (`animationsOf`), not by a Weave-side queue. `queue` composes promises; it does not store state.

---

## 10. Network detail

- `request(url, options)` pipes `hooks.beforeSend` over the options, merges `defaults`, builds the AbortSignal from `timeout`, calls `browser.fetch`, pipes `hooks.afterReceive` over the response, then `control.either(isOk, identity, rejectWithHttpError)`.
- Bodies: plain object plus `contentTypes.json` → `JSON.stringify`; `FormData` → untouched, no content-type header; `URLSearchParams` or `contentTypes.form` → `queryString`; string → untouched.
- `load(url, sel)(el)` fetches HTML, parses with `elements.fromHtml`, selects `sel` inside the fragment when provided, and replaces `el`'s children. Scripts inside the fragment are not executed (differs from jQuery; documented).
- No JSONP. No XML. No global ajax events; `hooks` replace them.

---

## 11. Application layer rules

1. Application code is written in the same oneliner style. Same audit applies.
2. Application state lives in named `Weave.application.*` values (shape H). Mutation of those values is allowed only inside functions named `set<Noun>` or `update<Noun>` in the application layer.
3. Application code names only `Weave.library.*` and `Weave.application.*`. The audit fails on any bare global.
4. The sample page (`sample.html`) is the first application and is rewritten at milestone 3 to use `query`, `events.delegate`, and `collections`.
5. A second reference application, `todo.html`, is added at milestone 4: list rendering from specs, form handling, storage persistence, hash routing for filters. It exists to prove that the style scales past one button.

---

## 12. Plugins and extension

There is no plugin API. Extending Weave means adding lines. Third-party code adds rows to tables (`Weave.library.elements.tags.myWidget = {...}`) or adds functions under a new layer `Weave.library.<name>` after `collections` in load order, honouring the dependency rule. `Weave.library.collections.lifts` accepts rows for new layers so lifting extends too.

---

## 13. Table catalog

Every table in the library, where it lives, what a row looks like, and what the generator produces. This is the section that makes rule 8 checkable: each literal in the left column exists only in the named table.

### 13.1 `Weave.library.elements.tags`

Row: `tagName: { defaults per part }`. Generator: a builder per tag.

Full HTML living-standard list (rows with non-empty defaults noted):

`a`, `abbr`, `address`, `area`, `article`, `aside`, `audio`, `b`, `base`, `bdi`, `bdo`, `blockquote`, `body`, `br`, `button` `{ attributes: { type: 'button' } }`, `canvas`, `caption`, `cite`, `code`, `col`, `colgroup`, `data`, `datalist`, `dd`, `del`, `details`, `dfn`, `dialog`, `div`, `dl`, `dt`, `em`, `embed`, `fieldset`, `figcaption`, `figure`, `footer`, `form` `{ attributes: { novalidate: '' } }` (open decision 20.4), `h1`…`h6`, `head`, `header`, `hgroup`, `hr`, `html`, `i`, `iframe`, `img` `{ attributes: { alt: '' } }`, `input` `{ attributes: { type: 'text' } }`, `ins`, `kbd`, `label`, `legend`, `li`, `link`, `main`, `map`, `mark`, `menu`, `meta`, `meter`, `nav`, `noscript`, `object`, `ol`, `optgroup`, `option`, `output`, `p`, `picture`, `pre`, `progress`, `q`, `rp`, `rt`, `ruby`, `s`, `samp`, `script`, `search`, `section`, `select`, `slot`, `small`, `source`, `span`, `strong`, `style`, `sub`, `summary`, `sup`, `table`, `tbody`, `td`, `template`, `textarea`, `tfoot`, `th`, `thead`, `time`, `title`, `tr`, `track`, `u`, `ul`, `var`, `video`, `wbr`.

Void tags (`Weave.library.elements.voidTags`): `area`, `base`, `br`, `col`, `embed`, `hr`, `img`, `input`, `link`, `meta`, `source`, `track`, `wbr`.

Input types (`Weave.library.elements.inputTypes`): generator produces `Weave.library.elements.inputs.<type>` builders: `text`, `password`, `email`, `number`, `tel`, `url`, `search`, `date`, `time`, `datetimeLocal`, `month`, `week`, `color`, `range`, `checkbox`, `radio`, `file`, `hidden`, `submit`, `reset`, `button`, `image`.

### 13.2 `Weave.library.events.types`

Row: `name: 'domEventName'`. Generator: `Weave.library.events.<name>` subscribe helper.

| Group | Rows |
|---|---|
| mouse | `click`, `dblclick`, `mousedown`, `mouseup`, `mousemove`, `mouseenter`, `mouseleave`, `mouseover`, `mouseout`, `contextmenu`, `wheel` |
| pointer | `pointerdown`, `pointerup`, `pointermove`, `pointerenter`, `pointerleave`, `pointerover`, `pointerout`, `pointercancel`, `gotpointercapture`, `lostpointercapture` |
| touch | `touchstart`, `touchend`, `touchmove`, `touchcancel` |
| keyboard | `keydown`, `keyup`, `keypress` (deprecated, kept for coverage) |
| focus | `focus`, `blur`, `focusin`, `focusout` |
| form | `input`, `change`, `submit`, `reset`, `invalid`, `select`, `beforeinput` |
| clipboard | `copy`, `cut`, `paste` |
| drag | `drag`, `dragstart`, `dragend`, `dragenter`, `dragleave`, `dragover`, `drop` |
| media | `play`, `pause`, `ended`, `timeupdate`, `volumechange`, `loadedmetadata`, `loadeddata`, `canplay`, `canplaythrough`, `seeking`, `seeked`, `durationchange`, `ratechange`, `stalled`, `waiting` |
| resource | `load`, `error`, `abort`, `loadstart`, `progress`, `loadend` |
| view | `scroll`, `scrollend`, `resize`, `fullscreenchange`, `visibilitychange` |
| animation | `animationstart`, `animationend`, `animationiteration`, `animationcancel`, `transitionstart`, `transitionend`, `transitionrun`, `transitioncancel` |
| document | `domContentLoaded: 'DOMContentLoaded'`, `readystatechange`, `beforeunload`, `unload`, `pagehide`, `pageshow`, `hashchange`, `popstate`, `storage`, `online`, `offline`, `languagechange` |
| details | `toggle`, `cancel`, `close` |
| composition | `compositionstart`, `compositionupdate`, `compositionend` |

### 13.3 Other tables (one line each)

| Table | Layer | Row shape | Produces |
|---|---|---|---|
| `setters` | elements | `part: reducer` | Part setters |
| `insertionPositions` | elements | `verb: positionRow` | `append`/`prepend`/`before`/`after` |
| `svgTags` | elements | `tag: defaults` | SVG builders |
| `inputTypes` | elements | `name: 'type'` | Input builders |
| `valueReaders`, `valueWriters` | attributes | `controlType: fn` | `value`, `setValue` dispatch |
| `booleanAttributes` | attributes | `name: true` | `isBooleanAttribute` |
| `unitlessProperties` | style | `property: true` | `isUnitless` |
| `defaultDisplays` | style | `tag: display` | `show` |
| `boxSides`, `boxParts` | style | `name: cssFragment` | `boxSize` family |
| `nativeTriggers` | events | `type: browserAction` | `triggerNative` |
| `easings`, `presets`, `defaults` | effects | | |
| `submittable`, `validators`, `messages` | forms | | |
| `methods`, `contentTypes`, `parsers`, `defaults` | network | | Method functions, parsers |
| `mutationOptions`, `mediaQueries` | observers | | |
| `cookieOptions` | storage | `option: serializer` | `setCookie` |
| `operations` | storage | `name: storageCall` | `local.*`, `session.*` |
| `keys`, `modifierNames`, `directions`, `focusableSelector` | interaction | | Key helpers |
| `roles`, `states`, `politeness`, `auditRules`, `visuallyHidden` | accessibility | | |
| `lifts`, `kinds`, `unlifted` | collections | | The whole collections layer |
| `errors` | control | `name: { name, message }` | `error` builder |
| `constants` | control | `maxDepth: 10000` | Recursion bound |
| `namespaces`, `positions`, `readyStates`, `nodeTypes` | browser | | |
| `htmlEscapes` | composition | `char: entity` | `escapeHtml` |

---

## 14. Redundancy and style audit

The audit is a node script, `audit.js`, written in the oneliner style, that audits itself as well as `weave.js` and every `*.html` application file. Milestone 7. It exits non-zero on the first failing rule and prints `file:line: rule: detail`.

### 14.1 Rules

| # | Rule | Check |
|---|---|---|
| R1 | One statement per line | Each non-blank, non-comment line ends with `;` and contains exactly one top-level `=` outside string literals and arrow bodies |
| R2 | Fully qualified | Each statement starts with `const Weave` (once) or `Weave.` |
| R3 | Line shape | Each line matches one of the eight shapes in section 1.1 |
| R4 | Line length | ≤ 160 characters hard; a warning list for > 140 |
| R5 | No declarations | Tokens `const`, `let`, `var`, `function`, `class` appear only on the root line |
| R6 | No statements | Tokens `if`, `else`, `switch`, `case`, `for`, `while`, `do`, `return`, `async`, `await`, `this`, `yield` do not appear outside string literals |
| R7 | Branching confined | `?`, `&&`, `\|\|`, `??`, `?.` appear only in lines whose path starts with `Weave.library.control` |
| R8 | Throw and try confined | `throw` appears once, on `Weave.library.control.fail`; `try` appears once, on `Weave.library.control.attempt` |
| R9 | Globals confined | Every identifier in the browser-globals list of section 2.2 appears only in lines whose path starts with `Weave.library.browser` |
| R10 | Builtins confined | `Promise`, `Map`, `Set`, `WeakMap`, `JSON`, `Math`, `Object`, `Array` appear only under `Weave.library.composition` (and `Object.keys` in shape E lines) |
| R11 | No aliases | No line assigns a `Weave.*` path to another path without a call or literal (`Weave.a.b = Weave.c.d;` is forbidden; `Weave.a.b = Weave.c.d(x);` is fine) |
| R12 | Literal uniqueness | Every string literal that matches a row value in any table (section 13) appears exactly once in the file |
| R13 | Structural uniqueness | After replacing string and number literals with `_` and the assigned path with `_`, no two lines are identical |
| R14 | Dependency direction | For each line under layer L, every `Weave.library.X` reference has X at or above L in the layer order |
| R15 | Naming | Every assigned leaf name matches `^[a-z][a-zA-Z0-9]*$`, contains no entry from the abbreviation blacklist, and predicates start with `is`/`has`/`can` |
| R16 | Table coverage | Every table listed in section 13 exists and has at least one row |
| R17 | Catalog coverage | Every name in section 4 exists at its path (the catalog is exported by the audit as a JSON list checked into the repo) |
| R18 | Lift coverage | Every function under a lifted layer has a row in `lifts` or `unlifted` |
| R19 | Group comments | Every namespace line (shape B) is immediately preceded by a group comment (shape G) |
| R20 | Application isolation | Under `Weave.application`, every identifier that is not a parameter, a literal, or `Weave.*` is rejected |
| R21 | Self-audit | `audit.js` passes rules R1–R15 applied to itself with `Audit` as its root |

### 14.2 Removal test

A second script, `audit-rows.js`, removes each table row in turn (in memory), reloads the library in jsdom, and asserts that exactly the functions generated from that row disappeared and nothing else changed. This mechanically checks draft-1 section 6's last bullet.

---

## 15. Test contract

- Tests run in a real browser page (`tests.html`) and in node with jsdom (`tests.js`). Both consume one test table, `Weave.tests.cases`, written in the oneliner style: each row is `name: () => boolean`.
- A tiny runner, `Weave.tests.run`, maps the table, prints failures, and returns the count. No test framework.
- Every catalog function has at least one row. The audit (R17) cross-checks the catalog against `Weave.tests.cases` keys, which are the catalog paths.
- Effects tests use `duration: 0`. Network tests stub `Weave.library.browser.fetch` by assigning the path (allowed in tests only; the audit skips `tests.js`'s stubbing lines by shape H rule under a `Weave.tests` root).
- Storage tests use `Weave.library.storage.memory`.

---

## 16. Distribution

- One file, `weave.js`, no build step, no minifier required. Loads with a plain `<script>` tag and defines the global `Weave`.
- An ESM wrapper `weave.module.js` contains two lines: an import of the script's text is not possible without a bundler, so the wrapper is generated by the audit script (`--emit-module`) by appending `export default Weave;` after the root line replaced with `export const Weave = {};`. Generated, never edited.
- Size budget: 60 KB unminified for milestone 7. Reported by the audit.
- Browser baseline: evergreen browsers that ship Web Animations, `scrollend`, `IntersectionObserver`, `ResizeObserver`, `AbortController`, `structuredClone`, `crypto.randomUUID`. No polyfills, no shims, no feature sniffing except the single `effects.engine` decision and `requestIdle` fallback.
- No TypeScript. A `weave.d.ts` may be generated later from the catalog; it is not a milestone.

---

## 17. Documentation contract

- The catalog (section 4) is the reference. The audit emits it as `catalog.json` `[{ path, signature, layer, kind, lifted }]` from the source plus a sidecar `signatures.json` that the implementer fills in row by row.
- `README.md` contains: the ten form rules in one screen, the layer list, three examples (build, query and delegate, fetch and render), and the sentence "grep is the documentation".
- No JSDoc. Group comments only.

---

## 18. Milestones (revised)

| # | Deliverable | Layers | Done when |
|---|---|---|---|
| 0 | `weave.js` skeleton | root, `composition`, `predicates`, `control`, `browser`, `elements` (sample subset) | `sample.html` runs against `weave.js` instead of an inline script |
| 1 | Selection | `query`, `collections` (`lift`, `liftSetter`, `liftGetter`, `from`) | `Weave.library.query.all('button')` returns an array; `Weave.library.collections.elements.styles({...})(nodes)` works |
| 2 | Attributes and style | `attributes`, `style` | Class toggling, css get/set, show/hide, dimensions, offset, scroll |
| 3 | Events | `events`, listener registry, `timing` (`debounce`, `throttle` only) | on/off/once/delegate/trigger/ready; `sample.html` rewritten with delegate and collections |
| 4 | Manipulation | `elements` complete; full `tags`, `svgTags`, `inputTypes` tables; `todo.html` | html/text/insert/remove/clone/wrap; todo app renders from specs |
| 5 | Effects | `effects`, `accessibility.reducedMotion` | fade/slide/animate promise-returning; reduced motion honoured |
| 6 | Network and forms | `network`, `forms` | getJson/postJson/load; serialize/values/fill/validate; todo app saves to a stub endpoint |
| 7 | Audit | `audit.js`, `audit-rows.js`, `catalog.json`, `tests.js`, `tests.html` | All rules R1–R21 pass; row-removal test passes; size under budget |
| 8 | Timing and observers | `timing` complete, `observers` | lazy images, resize-aware layout, media-query hooks in `todo.html` |
| 9 | Storage and navigation | `storage`, `navigation` | todo persists; hash router drives filters; cookies helper |
| 10 | Interaction | `interaction` | keyboard shortcuts, drag to reorder in `todo.html`, clipboard |
| 11 | Accessibility | `accessibility` complete | focus trap, live announcements, roving tabindex, audit rules; `todo.html` passes `accessibility.audit` |
| 12 | Full collections | every `lifts` row | R18 passes; every catalog function lifted or listed unlifted |
| 13 | Distribution | `weave.module.js`, `README.md`, `catalog.json` | Loads as script and as module; README examples run |

Milestones 0–7 match draft 1 (with 6 widened to include forms). Milestones 8–13 are new.

---

## 19. Draft-1 open decisions, resolved

| # | Question | Decision | Why |
|---|---|---|---|
| 1 | Soft line limit 120 or 140? | **140 soft, 160 hard.** | Fully qualified paths are long; 120 forces splits that add names without adding meaning. 160 is where diffs stop being readable side by side. |
| 2 | Alias policy? | **No aliases anywhere, including application code.** | The whole style bets on grep. One alias breaks "every call site spells the path". |
| 3 | Arrays always, or single element for `first`? | **Plural names return arrays; singular names return element or `null`.** `query.all` / `query.one`, `parents` / `parent`. Collections-layer functions always return arrays. | Callers choose by name, no runtime check needed, and `null` (never `undefined`) gives one nil for `control.maybe`. |
| 4 | Does `browser` own `localStorage` / `history`? | **Yes. `browser` owns every global.** Higher layers (`storage`, `navigation`) add meaning; `browser` adds nothing but a name. | One boundary is auditable; two are not. |

---

## 20. New open decisions

1. **`?.` and `??` in non-control layers.** Rule 11 bans them. This will make `control.maybe` and `control.defaultTo` the most called functions in the library. Accept, or allow `??` everywhere as a "value" operator rather than a "branch"? Recommendation: keep the ban until milestone 3 and revisit with real line counts.
2. **Spec part `html` versus `children`.** Both mutate the same slot. Keep both (jQuery parity) or drop `html` from specs and keep only `elements.setHtml`? Recommendation: keep both; table order makes the precedence explicit.
3. **Listener registry cost.** The `WeakMap` in 8.5 exists only for `offAll` and `cloneWithListeners`. Drop both and the registry? Recommendation: keep; `offAll` is the escape hatch that replaces jQuery namespaces for people who never learn `group()`.
4. **`form` tag default `novalidate`.** Adding it makes `forms.validateWith` the only validation path, which is consistent, but surprises people expecting native bubbles. Recommendation: no default; leave it to the spec author.
5. **Numbers in `styles`.** Auto-`px` for numbers is convenient and jQuery-compatible, but it is a hidden rule. Alternative: require `pixels()` at the call site. Recommendation: auto-`px` with the unitless table, because it is one table and one function.
6. **SVG builder namespace.** `Weave.library.elements.svg.text` vs the HTML `text` part name. Recommendation: builders under `Weave.library.elements.svg.*` as written in 4.5; the HTML `text` part stays.
7. **Router in core.** `navigation.router` is the largest non-DOM thing here. Keep in `weave.js` or split to `weave.router.js` as the first "extension by adding lines"? Recommendation: keep; it is under thirty lines in this style and proves the extension story.
8. **Test style.** Should tests also be oneliners (one `name: () => boolean` per line) or is a normal test file acceptable? Recommendation: oneliners; tests that break the style would be the first place readers see an exception.
9. **`Weave.application` mutation rule** (section 11.2). Enforce in the audit (R20 extension) or leave as convention? Recommendation: enforce; it is a one-regex rule.
10. **Depth limit for `control.loop`.** `10000` in `constants`. Too low for `walk` on huge documents? Recommendation: `walk` uses `querySelectorAll('*')`, not recursion, so the limit only guards true loops; keep it.

---

## 21. Worked examples (target call sites)

These are what application code should look like once every milestone lands. They are not implementation.

```
/* Build */
Weave.application.card = item => Weave.library.elements.article({ classes: ['card'], children: [Weave.library.elements.h2({ text: item.title }), Weave.library.elements.p({ text: item.body })] });

/* Query and delegate */
Weave.application.onRemoveClick = (event, button) => Weave.library.elements.remove(Weave.library.query.closest('.card')(button));
Weave.application.bindList = list => Weave.library.events.delegate('click', '.remove', Weave.application.onRemoveClick)(list);

/* Fetch and render */
Weave.application.renderItems = items => Weave.library.elements.append(items.map(Weave.application.card))(Weave.library.query.one('#list'));
Weave.application.loadItems = () => Weave.library.control.after(Weave.library.network.getJson('/api/items'))(Weave.application.renderItems);

/* Collections */
Weave.application.highlightAll = () => Weave.library.collections.attributes.addClass('on')(Weave.library.query.all('.card'));

/* Effects */
Weave.application.dismiss = card => Weave.library.control.after(Weave.library.effects.fadeOut()(card))(Weave.library.elements.remove);

/* Forms */
Weave.application.onSave = (values, form) => Weave.library.network.postJson('/api/items', values);
Weave.application.bindForm = form => Weave.library.forms.onSubmitAsync(Weave.application.onSave)(form);

/* Storage and navigation */
Weave.application.saveFilter = filter => Weave.library.storage.local.set('filter', filter);
Weave.application.routes = { '/': Weave.application.showAll, '/active': Weave.application.showActive, '/done': Weave.application.showDone };
Weave.application.router = Weave.library.navigation.router(Weave.application.routes);

/* Accessibility */
Weave.application.openDialog = dialog => Weave.library.accessibility.modal(dialog);
```

---

## 22. Out of scope (deliberately)

| Not covered | Reason |
|---|---|
| `$.Deferred`, `$.Callbacks`, `$.when` | Promises and `composition.all` |
| `$.proxy` | Arrow functions |
| `$.parseXML`, XML ajax | Not a DOM-library concern in 2026 |
| JSONP, `$.getScript` with cross-origin eval | Security; `network.script` covers the same-origin case by tag |
| `$.support`, browser sniffing, IE shims | Evergreen baseline |
| `.live`, `.die`, `.bind`, `.unbind`, `.andSelf`, `.toggle(fn, fn)` | Removed from jQuery itself |
| `$.fx.off`, `$.fx.interval` | Reduced motion and the `defaults` table |
| `.animate` with jQuery's step/progress callbacks | Web Animations API events |
| Virtual DOM, components, state management, templating beyond `composition.template` | Different library |
| Node.js DOM usage | Tests only, through jsdom |
| CSS-in-JS, stylesheet generation | Use `style` elements via `elements.style({ text })` if needed |
| Internationalisation, dates, numbers formatting | `Intl` is available to applications directly |
| Web Components registration | Out of scope for draft 2; candidate for a later layer |
| Server-side rendering | Not applicable |

---

## 23. Full jQuery coverage map (exhaustive)

Status: **W** covered with a Weave name, **P** partial or renamed with a semantic difference, **—** out of scope (section 22).

### Core and utilities

| jQuery | Status | Weave |
|---|---|---|
| `$(selector)` | W | `query.all` |
| `$(element)`, `$(array)`, `$(nodeList)` | W | `collections.from` |
| `$(html)` | W | `elements.fromHtml` |
| `$(fn)` | W | `events.ready` |
| `$.holdReady` | — | |
| `$.noConflict` | — | There is only `Weave` |
| `$.when` | W | `composition.all` |
| `$.extend` | W | `composition.merge`, `mergeDeep`, `mergeAll` |
| `$.fn.extend` | — | Section 12 |
| `$.each` | W | `composition.eachPair`, `Array.prototype.forEach` |
| `$.map` | W | `Array.prototype.map`, `composition.mapValues` |
| `$.grep` | W | `Array.prototype.filter` |
| `$.merge` | W | `composition.union` / spread |
| `$.makeArray` | W | `composition.toArray` |
| `$.inArray` | W | `Array.prototype.indexOf` |
| `$.unique`, `$.uniqueSort` | W | `collections.unique` |
| `$.trim` | W | `composition.trim` |
| `$.type` | — | `predicates.*` |
| `$.isArray`, `$.isFunction`, `$.isPlainObject`, `$.isEmptyObject`, `$.isNumeric`, `$.isWindow` | W | `predicates.*` |
| `$.isXMLDoc` | — | |
| `$.now` | W | `composition.now` |
| `$.parseHTML` | W | `elements.fromHtml` |
| `$.parseJSON` | W | `composition.parseJson` |
| `$.parseXML` | — | |
| `$.proxy` | — | |
| `$.contains` | W | `predicates.contains` |
| `$.data`, `$.hasData`, `$.removeData` | W | `attributes.data`, `predicates.hasData`, `attributes.removeData` |
| `$.globalEval` | — | |
| `$.noop` | W | `composition.noop` |
| `$.error` | W | `control.fail` |
| `$.support` | — | |
| `$.escapeSelector` | W | `composition.escapeSelector` |
| `$.htmlPrefilter` | — | |
| `$.readyException` | — | |
| `$.cssHooks` | — | `style.toCssValue` is the only hook |
| `$.cssNumber` | W | `style.unitlessProperties` |
| `$.speed`, `$.fx.*` | P | `effects.defaults`, `effects.easings` |
| `$.Callbacks`, `$.Deferred` | — | |
| `$.queue`, `$.dequeue`, `.queue`, `.dequeue`, `.clearQueue` | P | `effects.queue`; no named queues |
| `$.param` | W | `composition.queryString` |
| `.promise` | W | Effects already return promises |
| `.pushStack`, `.end`, `.selector`, `.context`, `$.fn.jquery` | — | No wrapper object |

### Traversal

| jQuery | Status | Weave |
|---|---|---|
| `.add` | W | `collections.add` |
| `.addBack`, `.andSelf` | — | Use `composition.union` explicitly |
| `.children` | W | `query.children`, `childrenMatching` |
| `.closest` | W | `query.closest` |
| `.contents` | W | `query.contents` |
| `.each` | W | `collections.each` |
| `.eq` | W | `collections.eq` |
| `.even`, `.odd` | W | `collections.even`, `odd` |
| `.filter` | W | `collections.filter` |
| `.find` | W | `query.find`, `allWithin` |
| `.first`, `.last` | W | `collections.first`, `last` |
| `.has` | W | `collections.has`, `query.has` |
| `.is` | W | `collections.is`, `predicates.matches` |
| `.map` | W | `collections.map` |
| `.next`, `.nextAll`, `.nextUntil` | W | `query.next`, `nextAll`, `nextUntil` |
| `.not` | W | `collections.not` |
| `.offsetParent` | W | `query.offsetParent` |
| `.parent`, `.parents`, `.parentsUntil` | W | `query.parent`, `parents`, `parentsUntil` |
| `.prev`, `.prevAll`, `.prevUntil` | W | `query.previous`, `previousAll`, `previousUntil` |
| `.siblings` | W | `query.siblings` |
| `.slice` | W | `collections.slice` |
| `.get`, `.toArray`, `.length`, `.index` | W | `collections.at`, `toArray`, `length`, `index` |

### Attributes and data

| jQuery | Status | Weave |
|---|---|---|
| `.attr` | W | `attributes.attribute`, `setAttribute`, `setAttributes` |
| `.removeAttr` | W | `attributes.removeAttribute` |
| `.prop`, `.removeProp` | W | `attributes.property`, `setProperty`, `removeProperty` |
| `.addClass`, `.removeClass`, `.toggleClass`, `.hasClass` | W | `attributes.*`, `predicates.hasClass` |
| `.val` | W | `attributes.value`, `setValue` |
| `.data`, `.removeData` | W | `attributes.data`, `setData`, `removeData`, `dataAll` |

### CSS and dimensions

| jQuery | Status | Weave |
|---|---|---|
| `.css` | W | `style.css`, `setCss`, `setCssAll`, `cssAll` |
| `.height`, `.width` | W | `style.height`, `width`, `setHeight`, `setWidth` |
| `.innerHeight`, `.innerWidth` | W | `style.innerHeight`, `innerWidth` |
| `.outerHeight`, `.outerWidth` | W | `style.outerHeight`, `outerWidth`, `*WithMargin` |
| `.offset` | W | `style.offset`, `setOffset` |
| `.position` | W | `style.position` |
| `.scrollLeft`, `.scrollTop` | W | `style.scrollLeft`, `scrollTop`, setters |
| `.show`, `.hide`, `.toggle` | W | `style.show`, `hide`, `toggle`; animated forms in `effects` |

### Manipulation

| jQuery | Status | Weave |
|---|---|---|
| `.after`, `.before` | W | `elements.after`, `before` |
| `.append`, `.prepend` | W | `elements.append`, `prepend` |
| `.appendTo`, `.prependTo` | W | `elements.appendTo`, `prependTo` |
| `.insertAfter`, `.insertBefore` | W | `elements.insertAfter`, `insertBefore` |
| `.clone` | W | `elements.clone`, `cloneWithListeners` |
| `.detach` | P | `elements.remove` (listeners survive on the element anyway) |
| `.empty` | W | `elements.empty` |
| `.html` | W | `elements.htmlOf`, `setHtml` |
| `.text` | W | `elements.textOf`, `setText` |
| `.remove` | W | `elements.remove` |
| `.replaceAll`, `.replaceWith` | W | `elements.replaceAll`, `replaceWith` |
| `.unwrap`, `.wrap`, `.wrapAll`, `.wrapInner` | W | `elements.*` |

### Events

| jQuery | Status | Weave |
|---|---|---|
| `.on`, `.off`, `.one` | W | `events.on`, `off`, `once`, `onAll`, `onTypes` |
| `.on(type, selector, fn)`, `.delegate`, `.undelegate` | W | `events.delegate`, unsubscribe |
| `.bind`, `.unbind`, `.live`, `.die` | — | |
| `.trigger` | W | `events.trigger`, `triggerNative` |
| `.triggerHandler` | P | `events.dispatchEvent` with `bubbles: false` |
| `.ready` | W | `events.ready` |
| `.hover` | W | `events.hover` |
| `.toggle(fn, fn)` | — | |
| `.blur`, `.change`, `.click`, `.dblclick`, `.focus`, `.focusin`, `.focusout`, `.keydown`, `.keypress`, `.keyup`, `.mousedown`, `.mouseenter`, `.mouseleave`, `.mousemove`, `.mouseout`, `.mouseover`, `.mouseup`, `.contextmenu`, `.resize`, `.scroll`, `.select`, `.submit` | W | Generated from `events.types` as subscribers; triggering uses `triggerNative` |
| `.error`, `.load`, `.unload` (event shorthands) | W | `events.types` rows `error`, `load`, `unload` |
| `event.currentTarget`, `.target`, `.relatedTarget`, `.delegateTarget` | W | `events.currentTarget`, `target`, `relatedTarget`; delegated handlers receive the matched element |
| `event.data` | — | Closures |
| `event.namespace` | — | `events.group` |
| `event.pageX`, `.pageY`, `.which`, `.metaKey`, `.timeStamp`, `.type` | W | `events.pageX`, `pageY`, `key`/`button`, `modifiers`, `timeStamp`, `type` |
| `event.preventDefault`, `.stopPropagation`, `.stopImmediatePropagation`, `.isDefaultPrevented`, `.isPropagationStopped`, `.isImmediatePropagationStopped` | W/P | `events.preventDefault`, `stopPropagation`, `stop`; `browser.isDefaultPrevented`; the two `isPropagation*` have no native equivalent and are omitted |
| `event.result` | — | |
| `$.Event` | W | `browser.createEvent` |

### Effects

| jQuery | Status | Weave |
|---|---|---|
| `.animate` | W | `effects.animate`, `transition` |
| `.delay` | W | `effects.delay` |
| `.fadeIn`, `.fadeOut`, `.fadeTo`, `.fadeToggle` | W | `effects.*` |
| `.slideDown`, `.slideUp`, `.slideToggle` | W | `effects.*` |
| `.show(d)`, `.hide(d)`, `.toggle(d)` | W | `effects.showAnimated`, `hideAnimated`, `toggleAnimated` |
| `.stop`, `.finish` | W | `effects.stop`, `finish` |
| `.queue`, `.dequeue`, `.clearQueue` | P | `effects.queue`, `stop` |

### Ajax and forms

| jQuery | Status | Weave |
|---|---|---|
| `$.ajax` | W | `network.request` |
| `$.get`, `$.post` | W | `network.get`, `post` |
| `$.getJSON` | W | `network.getJson` |
| `$.getScript` | P | `network.script` (tag injection, no eval) |
| `$.ajaxSetup`, `$.ajaxPrefilter`, `$.ajaxTransport` | P | `network.defaults`, `network.hooks` |
| `.ajaxStart`, `.ajaxSend`, `.ajaxSuccess`, `.ajaxError`, `.ajaxComplete`, `.ajaxStop` | P | `network.hooks` (per-call, not global events) |
| `.load` | W | `network.load`, `loadInto` |
| `.serialize`, `.serializeArray` | W | `forms.serialize`, `serializeArray` |
| `$.param` | W | `composition.queryString` |

---

## 24. Change log

| Draft | Change |
|---|---|
| 1 | Form rules, layers, spec shape, coverage sketch, collection semantics, redundancy tests, seven milestones, four open questions |
| 2 | Vocabulary; form rules 10–20 and the eight line shapes; eight new layers; browser boundary list; API catalog for nineteen layers; naming catalog; return conventions; error table; events, effects, network detail; application rules; extension policy; table catalog including full tag and event lists; twenty-one audit rules and the row-removal test; test contract; distribution; documentation; fourteen milestones; draft-1 decisions resolved; ten new open decisions; worked examples; out-of-scope list; exhaustive jQuery map |
