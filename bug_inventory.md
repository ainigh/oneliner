# Bug inventory

Found by reading the source only. No tests were run. Each entry names the one place to fix, in the
project's own terms. Severity: **High** breaks a visible feature, **Medium** wrong in an edge a user
will hit, **Low** cosmetic, surprising, or a maintainability trap. "UI" entries are micro
improvements to the feel of the widgets rather than defects.

## Library: composition, control, predicates

| # | Sev | Where | What |
|---|---|---|---|
| 1 | Medium | `control.unfold`, `control.until` | Unbounded recursion. The comment on `control.constants` says every combinator respects the budget, but only `control.loop` does. A cyclic `step` (or a very deep `query.parents`) throws `RangeError` instead of `DepthError`. |
| 2 | Low | `control.unfoldFrom` | `collected.concat([next])` on every step is O(n²). Fine for parents/siblings, bad for anything long. |
| 3 | Medium | `control.fail` / `control.isError` | `fail` throws `new Error(message)` whose `.name` is `"Error"`, so `isError(row, caught)` is false for anything thrown by `fail` (e.g. `elements.rejectTag`). Only rejections that pass the plain row object (network, effects) match. Either set `name` on the thrown error or check `cause`. |
| 4 | Low | `control.retry` | Retries on every rejection, including `AbortError`. An aborted request is retried `count` times. |
| 5 | Low | `composition.kebabCase` | `kebabCase('Foo')` gives `-foo`; `startCase('helloWorld')` fine, but a leading capital yields a leading dash which then breaks `style.cssName`. |
| 6 | Low | `composition.template` | Raw `{{{key}}}` is substituted first, then `{{key}}`. A raw value containing `{{x}}` gets a second substitution pass. Do escaped first or use one regex. |
| 7 | Low | `composition.mergeDeep` | Arrays are concatenated, not replaced. `mergeDeep({classes:['a']}, {classes:['b']})` gives both. This is what makes `elements.build` defaults additive, but it surprises `network.merged` and any caller that expects override semantics. |
| 8 | Low | `predicates.isSelector` | Any string that fails to parse is "not a selector", but so is any string on a page with no `document` yet. Harmless, but `collections.from('<div>')` throws instead of building. |
| 9 | Low | `browser.functionType` vs `predicates.typeNames.isFunction` | The literal `'function'` is written twice (`browser.hasIdleCallback` uses one, `browser.hasMatchMedia` the other). Violates the one-literal rule; R12 misses it because they are in different buckets. |

## Library: elements, style, attributes, events, timing

| # | Sev | Where | What |
|---|---|---|---|
| 10 | **High** | `style.hide` | Calling `hide` on an element that is already hidden records `weaveDisplay = "none"`. The next `show` restores `"none"`, so the element can never be shown again. `rememberDisplay` must skip when the inline display is already `none`. Every `toggle`, `fadeToggle`, `slideToggle` and the patterns that hide on repaint can hit this. |
| 11 | Medium | `style.isShown` | Reads only the inline `display`. An element hidden by a stylesheet class reports as shown, so `toggle` hides it again instead of showing it. jQuery uses the computed value plus `offsetParent`. |
| 12 | Medium | `elements.morphProperties` | Copies `value` from the fresh element onto the live one on every repaint. A fresh spec has `value=""`, so anything the user is typing in a pattern's input is wiped by the next repaint unless the pattern threads the value back through the spec. Skip `value` when the live element is focused. |
| 13 | Medium | `elements.positionalCandidate` | An unkeyed child at index N is morphed into whatever node currently sits at N, including a keyed node that belongs later in the list. Mixed keyed/unkeyed lists steal each other's nodes and lose state. Only accept a positional candidate that is itself unkeyed. |
| 14 | Low | `elements.keyedCandidate` | Searches all children for a key match, including nodes already placed at an earlier index this pass. Duplicate keys move the same node twice. |
| 15 | Low | `elements.unwrap`, `elements.wrapNodes` | `unwrap` on a root element (`parentOf` is null) and `wrapAll` on an empty list both throw a raw TypeError. |
| 16 | Low | `elements.nodeRules.fromAnything` | A plain object with one unknown key (e.g. a typo `clases`) is not a spec, falls through to `identity`, and `appendChild` throws "parameter 1 is not of type Node". The `invalidSpec` error row exists but is never reached here. |
| 17 | Low | `attributes.booleanAttributes` | Table is labelled "attribute names" but `readonly = 'readOnly'` and `novalidate = 'noValidate'` are property names. `isBooleanAttribute('readonly')` is false; `setBooleanAttribute` happens to work only because HTML lowercases attribute names. |
| 18 | Low | `attributes.data` | Auto-parses JSON, so `data-zip="10001"` comes back as the number 10001 and `data-code="1e3"` as 1000. Leading-zero codes stay strings only because they fail to parse. Surprising for ids and postcodes. |
| 19 | Medium | `timing.debounce` | `flush` calls `f` with the last args but does not cancel the pending timer, so `f` runs twice. `cancel` should be called inside `flush`. |
| 20 | Low | `timing.throttle` | Leading-edge only. A scroll or resize handler never sees the final position. Most callers want a trailing call too. |
| 21 | Low | `events.once` | The recorded handler is the wrapper, so `events.off(type, originalHandler)` cannot remove a once listener. Record the original as `handler` and the wrapper as `listener`. |
| 22 | Low | `events.trigger` | Every custom event is `cancelable: true` and bubbles. Fine, but `dispatchEvent`'s boolean return (was it cancelled) is discarded, so callers cannot tell. |
| 23 | Low | `elements.setters` order | `text` and `html` are applied after `children`, so a spec with both silently drops the children. Document or reject. |

## Library: effects, network, forms, storage, navigation, interaction, accessibility

| # | Sev | Where | What |
|---|---|---|---|
| 24 | **High** | `effects.slideDown`, `effects.showAnimated` | `naturalHeight(el)` / `expanded(el)` is evaluated as an argument *before* `style.show(el)` runs, while the element is still `display:none`. `scrollHeight` is 0, so the slide animates 0px to 0px and the element pops in with no motion. Measure after showing. |
| 25 | Medium | `effects.defaults.fill = 'both'` | Every animation keeps `fill: both`, so finished animations persist in `getAnimations()`. `isAnimating` is true forever after the first effect, `whenAnimationEnds` resolves instantly, and a stale `height: 0px` from a `slideUp` can override a later inline style. Use `fill: 'forwards'` and `commitStyles()` + `cancel()`, or `fill: 'none'` with the end state written by hand. |
| 26 | Medium | `effects.transitionPart` | `options.duration` is read without a default, so `effects.cssTransition(['opacity'])` with no options throws. `optionsFrom` guards this elsewhere. |
| 27 | **High** | `network.parserNameFor` | Picks a parser by the first `mimeTypes` key whose value the Content-Type contains. `form` and `multipart` (and `identifier`) are in `mimeTypes` but not in `parsers`, so a `postForm` whose response is `application/x-www-form-urlencoded` throws "parsers[name] is not a function". Look up in `parsers` keys, not `mimeTypes` keys. |
| 28 | Medium | `network.timeout` | On timeout the promise rejects but the underlying fetch is not aborted; the request keeps running and its `afterReceive` hooks still fire. Pass the abort signal to `armTimeout`. |
| 29 | Medium | `network.submitForm` | A form with `method="get"` gets a `FormData` body, and `fetch` throws "Request with GET/HEAD method cannot have body". GET forms should serialise into the query. A form with no `action` fetches the literal URL `null`. |
| 30 | Low | `network.getJson` and friends | Bypass `parseByContentType` and call `response.json()` directly, so a 200 with an HTML body (login redirect) rejects with a bare `SyntaxError` instead of a typed error. |
| 31 | **High** | `forms.fill` for radio groups | `valueWriters.radio` sets `checked = Boolean(value)` on every radio of that name, ignoring each radio's own `value`. `fill({ colour: 'blue' })` checks whichever radio is last in the DOM. Compare `value` to the radio's value attribute. Checkboxes with a `value` attribute have the same problem. |
| 32 | Low | `forms.whileDisabled` | Disabling every control drops focus to `body`. After the promise settles the user has lost their place. Remember and restore `activeElement`. |
| 33 | Medium | `dates.adders` (day / week) | Day and week are added as milliseconds. Across a DST change a "day" is 23 or 25 hours, so `add('day', 1)` lands at 23:00 or 01:00 and `endOf('day')` on a fall-back day returns the *previous* day's last moment. Use `dayAfter` (calendar arithmetic) for day and week. |
| 34 | Low | `formatting.relative` | `Intl.RelativeTimeFormat` is built without `numeric: 'auto'`, so you get "in 0 seconds" and "1 day ago" instead of "now" and "yesterday". |
| 35 | Low | `storage.decode` | A value written by other code as a plain string (not JSON) reads back as `undefined`, and `has` reports false even though the key exists. |
| 36 | Medium | `navigation.linkHandler` | Intercepts every same-origin anchor click, including ctrl/cmd/shift/middle clicks, `target="_blank"`, `download`, and `href="#hash"`. Ctrl-click to open in a new tab is broken on any page with `interceptLinks`. Bail when the event is modified or the link has a target/download. |
| 37 | Low | `navigation.setQuery` | `replaceState` with only `?query` drops the current hash. |
| 38 | **High** | `interaction.draggable` | `translation` writes `translate(dx, dy)` from the *current* drag only. On the second drag `dx` restarts at 0, so the element snaps back to its original position the moment the pointer moves. Accumulate the previous offset into the state. |
| 39 | **High** | `interaction.sortable` | With no `handle`, delegates on `'*'`, so `item` is the deepest element under the pointer (a `span` inside the `li`), and `targetChild` is also the deepest element at the drop point. The reorder moves inner spans, not list items. Resolve both to the direct child of the list. |
| 40 | Medium | `interaction.draggable` | No `setPointerCapture`, no `touch-action: none`, no `preventDefault` on pointerdown. On touch the page scrolls instead of dragging, and a fast mouse leaving the window loses `pointerup`. |
| 41 | Low | `interaction.onLongPress` | Cancels on `pointerup` / `pointerleave` only. A touch that starts scrolling still fires the long press; add `pointermove` beyond a few px and `pointercancel`. |
| 42 | Low | `interaction.onOutsideClick` | Listens on `click`. If the inside click removes its target from the DOM (a delete button), `contains` is false at bubble time and the "outside" handler fires. Use `pointerdown` or check `composedPath()`. |
| 43 | Low | `interaction.lockScroll` | Sets `overflow: hidden` on body without compensating the scrollbar width; the page shifts sideways every time a modal opens. |
| 44 | Medium | `accessibility.announce` | Setting the same text twice does not re-announce (screen readers need a change). Also the live region is created once with the first politeness; a later `assertive` call reuses the `polite` region. Clear then set on the next frame, and keep one region per politeness. |
| 45 | Medium | `accessibility.rovingKeys` | Arrow handlers do not `preventDefault`, so arrowing through a menu also scrolls the page. No Home/End. `roving(options)` ignores `options`. |
| 46 | Low | `accessibility.trapFocus` | Only cycles when focus is already at an edge. If focus is on `body` (e.g. after the trigger was removed), Tab leaves the dialog. |
| 47 | Low | `accessibility.audit` | `query.walk(root)` excludes `root` itself, so auditing a single `<img>` finds nothing. |
| 48 | Low | `observers.onResize` | Built on `startIntersection`; works, but the name is wrong and `disconnect` drops every element on the same observer. |
