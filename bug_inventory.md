# Bug inventory

Found by reading the source only. No tests were run. Each entry names the one place to fix, in the
project's own terms. Severity: **High** breaks a visible feature, **Medium** wrong in an edge a user
will hit, **Low** cosmetic, surprising, or a maintainability trap. "UI" entries are micro
improvements to the feel of the widgets rather than defects.

## Status

Because this list was written from reading alone, nothing in it was trusted until it was
reproduced. Every row marked **Fixed** was reproduced first — library rows against the built
bundle in Chromium or jsdom, application rows by driving the real page — then fixed, then re-run
to show the failure gone, and each fix since the second round carries a test or a flagship
assertion that fails on the old code. 76 and 80 were confirmed by inspection. Rows marked
**Not reproduced** or **Not changed** say why. Every **High** and every **Medium** row is now
fixed; 51 is fixed except for `aria-controls`, which the tabs spec gives nothing to point at.
Unmarked rows are still unverified readings of the source.

The fourth round, at the end of this file, went the other way: bug hunters drove the built bundle
and every page in jsdom and Chromium, and recorded only what they could make fail. Each of those
rows is fixed with a test or a page assertion that fails on the old code, or says why not.

## Library: composition, control, predicates

| # | Sev | Where | What |
|---|---|---|---|
| 1 | Medium | `control.unfold`, `control.until` | Unbounded recursion. The comment on `control.constants` says every combinator respects the budget, but only `control.loop` does. A cyclic `step` (or a very deep `query.parents`) throws `RangeError` instead of `DepthError`. | **Fixed:** `unfold` and `until` spend the same budget as `loop` and fail with `DepthError`; `query.nextAll` and `previousAll` slice the parent's children instead of recursing, so a 20000 row list still walks.
| 2 | Low | `control.unfoldFrom` | `collected.concat([next])` on every step is O(n²). Fine for parents/siblings, bad for anything long. | **Fixed:** `unfoldStep` pushes onto its own accumulator.
| 3 | Medium | `control.fail` / `control.isError` | `fail` throws `new Error(message)` whose `.name` is `"Error"`, so `isError(row, caught)` is false for anything thrown by `fail` (e.g. `elements.rejectTag`). Only rejections that pass the plain row object (network, effects) match. Either set `name` on the thrown error or check `cause`. | **Fixed:** `fail` copies the row onto the thrown error, so `isError` recognises it by name.
| 4 | Low | `control.retry` | Retries on every rejection, including `AbortError`. An aborted request is retried `count` times. | **Fixed:** `control.canRetry` stops at an `AbortError`, so an aborted request fails at once.
| 5 | Low | `composition.kebabCase` | `kebabCase('Foo')` gives `-foo`; `startCase('helloWorld')` fine, but a leading capital yields a leading dash which then breaks `style.cssName`. | **Not changed:** a leading capital is how a vendor prefix is spelled (`WebkitTransform` is `-webkit-transform`), which is exactly what `style.cssName` needs, and what jQuery does.
| 6 | Low | `composition.template` | Raw `{{{key}}}` is substituted first, then `{{key}}`. A raw value containing `{{x}}` gets a second substitution pass. Do escaped first or use one regex. | **Fixed:** `template` substitutes in one pass with one pattern (`templatePattern`), so a raw value is never read twice.
| 7 | Low | `composition.mergeDeep` | Arrays are concatenated, not replaced. `mergeDeep({classes:['a']}, {classes:['b']})` gives both. This is what makes `elements.build` defaults additive, but it surprises `network.merged` and any caller that expects override semantics. | **Not changed:** `elements.build` relies on additive arrays. The caller that suffered, request headers, no longer goes through `mergeDeep`: `network.withHeaders` merges header pairs, and accepts a `Headers` instance.
| 8 | Low | `predicates.isSelector` | Any string that fails to parse is "not a selector", but so is any string on a page with no `document` yet. Harmless, but `collections.from('<div>')` throws instead of building. |
| 9 | Low | `browser.functionType` vs `predicates.typeNames.isFunction` | The literal `'function'` is written twice (`browser.hasIdleCallback` uses one, `browser.hasMatchMedia` the other). Violates the one-literal rule; R12 misses it because they are in different buckets. | **Fixed:** `browser.functionType` is gone; every `typeof` check reads `predicates.typeNames.isFunction` (`fixFunctionTypeIsWrittenOnce`). |

## Library: elements, style, attributes, events, timing

| # | Sev | Where | What |
|---|---|---|---|
| 10 | **High** | `style.hide` | Calling `hide` on an element that is already hidden records `weaveDisplay = "none"`. The next `show` restores `"none"`, so the element can never be shown again. `rememberDisplay` must skip when the inline display is already `none`. Every `toggle`, `fadeToggle`, `slideToggle` and the patterns that hide on repaint can hit this. | **Fixed:** `style.rememberDisplay` records only when the element is shown.
| 11 | Medium | `style.isShown` | Reads only the inline `display`. An element hidden by a stylesheet class reports as shown, so `toggle` hides it again instead of showing it. jQuery uses the computed value plus `offsetParent`. | **Fixed:** `isShown` also reads the computed display, so `toggle` shows an element a stylesheet hid; `show` already restores the tag's default display.
| 12 | Medium | `elements.morphProperties` | Copies `value` from the fresh element onto the live one on every repaint. A fresh spec has `value=""`, so anything the user is typing in a pattern's input is wiped by the next repaint unless the pattern threads the value back through the spec. Skip `value` when the live element is focused. | **Not changed:** the morph treats the fresh spec as the source of truth for `value`, the way every pattern that holds an input already threads it back (`entryForm`, `queryBox`, `inlineEdit`). Skipping a focused input would break clearing a field after submit. The case the entry describes was a caller rebuilding a pattern inside a render, which is 73 and is fixed there.
| 13 | Medium | `elements.positionalCandidate` | An unkeyed child at index N is morphed into whatever node currently sits at N, including a keyed node that belongs later in the list. Mixed keyed/unkeyed lists steal each other's nodes and lose state. Only accept a positional candidate that is itself unkeyed. | **Not reproduced:** `isMatch` compares keys, and an unkeyed child's key is `null`, so a keyed node at that position is never accepted. In Chromium the keyed node kept its state after an unkeyed row was inserted before it.
| 14 | Low | `elements.keyedCandidate` | Searches all children for a key match, including nodes already placed at an earlier index this pass. Duplicate keys move the same node twice. | **Fixed:** `keyedCandidate` only searches the children from the current index on, so a node placed earlier this pass is never taken again (`fixMorphKeepsDuplicateKeys`). |
| 15 | Low | `elements.unwrap`, `elements.wrapNodes` | `unwrap` on a root element (`parentOf` is null) and `wrapAll` on an empty list both throw a raw TypeError. | **Fixed:** `unwrap` leaves a root and the body alone (`isUnwrappable`), `wrapAll([])` does nothing, and `wrapInner` on an empty element appends the wrapper.
| 16 | Low | `elements.nodeRules.fromAnything` | A plain object with one unknown key (e.g. a typo `clases`) is not a spec, falls through to `identity`, and `appendChild` throws "parameter 1 is not of type Node". The `invalidSpec` error row exists but is never reached here. | **Fixed:** a plain object that is not a spec fails with `InvalidSpecError` (`nodeRules.fromMisspelt`); nil and false children build nothing.
| 17 | Low | `attributes.booleanAttributes` | Table is labelled "attribute names" but `readonly = 'readOnly'` and `novalidate = 'noValidate'` are property names. `isBooleanAttribute('readonly')` is false; `setBooleanAttribute` happens to work only because HTML lowercases attribute names. | **Fixed:** the rows are the attribute names `readonly` and `novalidate` (`fixBooleanAttributesAreAttributeNames`). |
| 18 | Low | `attributes.data` | Auto-parses JSON, so `data-zip="10001"` comes back as the number 10001 and `data-code="1e3"` as 1000. Leading-zero codes stay strings only because they fail to parse. Surprising for ids and postcodes. | **Not changed:** data attributes are JSON by design, so `setDataAll` and `data` round-trip objects and numbers. A caller that wants the raw text reads `attributes.attribute`.
| 19 | Medium | `timing.debounce` | `flush` calls `f` with the last args but does not cancel the pending timer, so `f` runs twice. `cancel` should be called inside `flush`. | **Fixed:** `flush` cancels the pending timer first.
| 20 | Low | `timing.throttle` | Leading-edge only. A scroll or resize handler never sees the final position. Most callers want a trailing call too. | **Fixed:** `throttle` holds the last call and delivers it when the window closes.
| 21 | Low | `events.once` | The recorded handler is the wrapper, so `events.off(type, originalHandler)` cannot remove a once listener. Record the original as `handler` and the wrapper as `listener`. | **Fixed:** a once entry records the caller's handler and keeps the wrapper as `listener`, so `off` finds it; `copyListeners` copies it as a once listener.
| 22 | Low | `events.trigger` | Every custom event is `cancelable: true` and bubbles. Fine, but `dispatchEvent`'s boolean return (was it cancelled) is discarded, so callers cannot tell. | **Fixed:** `events.emit` returns whether the event went through; `trigger` stays chainable.
| 23 | Low | `elements.setters` order | `text` and `html` are applied after `children`, so a spec with both silently drops the children. Document or reject. |

## Library: effects, network, forms, storage, navigation, interaction, accessibility

| # | Sev | Where | What |
|---|---|---|---|
| 24 | **High** | `effects.slideDown`, `effects.showAnimated` | `naturalHeight(el)` / `expanded(el)` is evaluated as an argument *before* `style.show(el)` runs, while the element is still `display:none`. `scrollHeight` is 0, so the slide animates 0px to 0px and the element pops in with no motion. Measure after showing. | **Fixed:** `effects.afterShowing` shows the element before its frames are measured; `slideDown` and `showAnimated` both go through it.
| 25 | Medium | `effects.defaults.fill = 'both'` | Every animation keeps `fill: both`, so finished animations persist in `getAnimations()`. `isAnimating` is true forever after the first effect, `whenAnimationEnds` resolves instantly, and a stale `height: 0px` from a `slideUp` can override a later inline style. Use `fill: 'forwards'` and `commitStyles()` + `cancel()`, or `fill: 'none'` with the end state written by hand. | **Fixed:** `settle` cancels an effect once it finishes, and `transition` and `fadeTo` commit their end state first. Reproducing this found a worse bug under it: `animate` wrapped property-indexed keyframes in `listOf`, which the browser reads as one keyframe with an invalid value, so no fade, slide, `fadeTo` or preset had ever moved. The keyframes now pass through as given.
| 26 | Medium | `effects.transitionPart` | `options.duration` is read without a default, so `effects.cssTransition(['opacity'])` with no options throws. `optionsFrom` guards this elsewhere. | **Fixed:** `cssTransition` defaults its options.
| 27 | **High** | `network.parserNameFor` | Picks a parser by the first `mimeTypes` key whose value the Content-Type contains. `form` and `multipart` (and `identifier`) are in `mimeTypes` but not in `parsers`, so a `postForm` whose response is `application/x-www-form-urlencoded` throws "parsers[name] is not a function". Look up in `parsers` keys, not `mimeTypes` keys. | **Fixed:** `parserNameFor` picks only among parsers that have a mime type, so a form response falls back to text.
| 28 | Medium | `network.timeout` | On timeout the promise rejects but the underlying fetch is not aborted; the request keeps running and its `afterReceive` hooks still fire. Pass the abort signal to `armTimeout`. | **Fixed:** every request carries an abort signal, and `abortOnTimeout` aborts it when the timeout wins.
| 29 | Medium | `network.submitForm` | A form with `method="get"` gets a `FormData` body, and `fetch` throws "Request with GET/HEAD method cannot have body". GET forms should serialise into the query. A form with no `action` fetches the literal URL `null`. | **Fixed:** a GET or HEAD form sends its values as the query, and a form with no `action` targets the page.
| 30 | Low | `network.getJson` and friends | Bypass `parseByContentType` and call `response.json()` directly, so a 200 with an HTML body (login redirect) rejects with a bare `SyntaxError` instead of a typed error. | **Fixed:** typed JSON helpers read the body as text and reject a body that is not JSON with a `ParseError` row; an empty body (a 204) reads as `null`.
| 31 | **High** | `forms.fill` for radio groups | `valueWriters.radio` sets `checked = Boolean(value)` on every radio of that name, ignoring each radio's own `value`. `fill({ colour: 'blue' })` checks whichever radio is last in the DOM. Compare `value` to the radio's value attribute. Checkboxes with a `value` attribute have the same problem. | **Fixed:** `valueWriters.radio` compares the value against the radio's own.
| 32 | Low | `forms.whileDisabled` | Disabling every control drops focus to `body`. After the promise settles the user has lost their place. Remember and restore `activeElement`. | **Fixed:** `whileDisabled` gives the focus back when the form took it with it, and re-enables exactly the controls it disabled. Reproducing this found a worse bug: `forms.enable` queried with `:not([disabled])`, so every `onSubmitAsync` form stayed disabled after its first submit.
| 33 | Medium | `dates.adders` (day / week) | Day and week are added as milliseconds. Across a DST change a "day" is 23 or 25 hours, so `add('day', 1)` lands at 23:00 or 01:00 and `endOf('day')` on a fall-back day returns the *previous* day's last moment. Use `dayAfter` (calendar arithmetic) for day and week. | **Fixed:** `adders.day` and `adders.week` move by calendar days, and every adder keeps the time of day, which `add('month')` also dropped.
| 34 | Low | `formatting.relative` | `Intl.RelativeTimeFormat` is built without `numeric: 'auto'`, so you get "in 0 seconds" and "1 day ago" instead of "now" and "yesterday". | **Fixed:** relative times are formatted with `numeric: 'auto'` (`formatting.relativeOptions`).
| 35 | Low | `storage.decode` | A value written by other code as a plain string (not JSON) reads back as `undefined`, and `has` reports false even though the key exists. | **Fixed:** a value that is not JSON reads back as the string it is.
| 36 | Medium | `navigation.linkHandler` | Intercepts every same-origin anchor click, including ctrl/cmd/shift/middle clicks, `target="_blank"`, `download`, and `href="#hash"`. Ctrl-click to open in a new tab is broken on any page with `interceptLinks`. Bail when the event is modified or the link has a target/download. | **Fixed:** `isRoutable` leaves modified clicks, `target`, `download` and hash links to the browser.
| 37 | Low | `navigation.setQuery` | `replaceState` with only `?query` drops the current hash. | **Fixed:** `setQuery` keeps the hash.
| 38 | **High** | `interaction.draggable` | `translation` writes `translate(dx, dy)` from the *current* drag only. On the second drag `dx` restarts at 0, so the element snaps back to its original position the moment the pointer moves. Accumulate the previous offset into the state. | **Fixed:** `settleDrag` folds each finished drag into an offset the next one starts from.
| 39 | **High** | `interaction.sortable` | With no `handle`, delegates on `'*'`, so `item` is the deepest element under the pointer (a `span` inside the `li`), and `targetChild` is also the deepest element at the drop point. The reorder moves inner spans, not list items. Resolve both to the direct child of the list. | **Fixed:** `listChildOf` resolves both the pressed element and the drop target to the list's own child, and `placeBeside` drops after a later target.
| 40 | Medium | `interaction.draggable` | No `setPointerCapture`, no `touch-action: none`, no `preventDefault` on pointerdown. On touch the page scrolls instead of dragging, and a fast mouse leaving the window loses `pointerup`. | **Fixed:** a draggable sets `touch-action: none` and captures the pointer on pointerdown, so a touch drags instead of scrolling and the release is never lost. `preventDefault` on pointerdown is left out on purpose: it would stop the mouse events that move focus.
| 41 | Low | `interaction.onLongPress` | Cancels on `pointerup` / `pointerleave` only. A touch that starts scrolling still fires the long press; add `pointermove` beyond a few px and `pointercancel`. | **Fixed:** a long press is cancelled by `pointercancel` and by the pointer wandering past `longPressSlop`.
| 42 | Low | `interaction.onOutsideClick` | Listens on `click`. If the inside click removes its target from the DOM (a delete button), `contains` is false at bubble time and the "outside" handler fires. Use `pointerdown` or check `composedPath()`. | **Fixed:** `isInsideEvent` also reads the event's composed path, so a target removed by the click still counts as inside.
| 43 | Low | `interaction.lockScroll` | Sets `overflow: hidden` on body without compensating the scrollbar width; the page shifts sideways every time a modal opens. | **Fixed:** the lock pads the body by the scrollbar's width and restores the padding it found.
| 44 | Medium | `accessibility.announce` | Setting the same text twice does not re-announce (screen readers need a change). Also the live region is created once with the first politeness; a later `assertive` call reuses the `polite` region. Clear then set on the next frame, and keep one region per politeness. | **Fixed:** `announce` clears the region and speaks after a short delay, so the same message is read again, and each politeness has its own region.
| 45 | Medium | `accessibility.rovingKeys` | Arrow handlers do not `preventDefault`, so arrowing through a menu also scrolls the page. No Home/End. `roving(options)` ignores `options`. | **Fixed:** the roving keys prevent the page scrolling, and Home and End jump to the ends through the same clamp.
| 46 | Low | `accessibility.trapFocus` | Only cycles when focus is already at an edge. If focus is on `body` (e.g. after the trigger was removed), Tab leaves the dialog. | **Fixed:** Tab from outside the trap is pulled back to its first or last stop.
| 47 | Low | `accessibility.audit` | `query.walk(root)` excludes `root` itself, so auditing a single `<img>` finds nothing. | **Fixed:** `audit` checks the root as well as its descendants.
| 48 | Low | `observers.onResize` | Built on `startIntersection`; works, but the name is wrong and `disconnect` drops every element on the same observer. | **Fixed:** the helper is `observers.startObserving`. The second half did not reproduce: every `onResize` call owns its observer, so `disconnect` only drops its own element.

## Components: widgets, tokens and the stylesheet

| # | Sev | Where | What |
|---|---|---|---|
| 49 | **High** | `components.imageAttributes` | Reads `browser.keywords.src`, which does not exist. The table spells it `keywords.source`. The computed key is the string `"undefined"`, so every `components.image` renders `<img undefined="…">` with no `src` and nothing ever loads. One-word fix, and `grep 'keywords.src'` finds no other caller. | **Fixed:** The keyword is spelled `source`; `imageAttributes` spends it.
| 50 | Medium | `components.pagination` | Renders one button per page with no windowing. A grid of 5000 rows at 10 a page draws 500 buttons on every repaint. `pagerGap` exists but nothing uses it for an ellipsis. | **Fixed:** pagination shows the first, last and current ±1 pages, with a `pageGap` ellipsis between them.
| 51 | Medium | `components.tabs` | Follows the `tablist` / `tab` roles but wires no keyboard behaviour: no roving tabindex, no arrow keys, no `aria-controls` to the pane. `accessibility.roving` exists and is never used by the widget that most needs it. Same for `components.menu` and `components.steps`. | **Partly fixed:** tabs carry a roving tabindex and answer the arrow, Home and End keys. `aria-controls` is not set, because the tabs spec names no panel ids to point at.
| 52 | Medium | `components.chartShare` | Divides by `chartTop`, and `chartTop([])` is `Math.max()` which is `-Infinity`. A chart with no readings yields `NaN%` widths; a chart whose readings are all zero divides zero by zero. Guard the top before dividing. | **Fixed:** `chartShare` gives a top that is not positive a share of nothing.
| 53 | Low | `components.dialogHeader` | Always draws a Close button, but `closeButton` passes `onAction: spec.onClose`. With no `onClose` the handler table skips the key, so the modal shows a Close button that does nothing. | **Fixed:** `dialogHeader` reuses `alertClose`, which already drew the button only when there was something to close.
| 54 | Low | `components.ringShares` | Recomputes `chartSum` over every item inside a `map` over every item, so a donut is quadratic in its slice count. Same shape in `ringBefore`. | **Fixed:** a ring sums its shares once and starts each arc from a running sum.
| 55 | Low | `components.configure` | Assigns onto `tokens`, but `installStyles` is `control.once` and the sheet is a snapshot. Calling `configure` after the first widget renders silently does nothing. The comment says "before the sheet is written" — the code should enforce it or the call should re-emit. | **Fixed:** `configure` writes an installed sheet again from the new tokens.
| 56 | Low | `components.optionValue` / `optionLabel` | `defaultTo(String(value))(value.label)` evaluates `String(value)` on every call even when a label exists, and reads `.label` off whatever it is given. A `null` option throws rather than falling back. | **Fixed:** an option may be `null`, and its label is no longer stringified ahead of need.
| 57 | Low | `components.heatAt`, `seriesAt` | Both clamp with `Math.min` against the last index but neither guards a negative or `NaN` index, which reads back `undefined` and emits a `data-heat="undefined"` attribute that matches no rule. | **Fixed:** heat steps and series slots are clamped and guarded against `NaN`.
| 58 | Low | `components.tooltip` | Builds a fresh random id on every call, so a repaint gives the same tooltip a new id each time and any external `aria-describedby` pointing at it breaks. | **Fixed:** a tooltip's id is `spec.id` or a hash of its text, so it survives a repaint.

## Overlays and patterns

| # | Sev | Where | What |
|---|---|---|---|
| 59 | **High** | `overlays.watchScroll` | Closes the popover on any scroll event captured at the document, including scrolling *inside* the popover itself. Any popover with a scrollable list closes the moment the reader scrolls it. Ignore scrolls whose target is inside `state.box`. | **Fixed:** `watchScroll` reuses `outsideStep`, the containment guard `watchOutside` already had.
| 60 | Medium | `overlays.placeAt` | Position is computed once at open. Resizing the window, or the anchor moving, leaves the popover stranded. There is no reposition on resize and no `onResize` subscription. | **Fixed:** an open popover follows a window resize (`overlays.watchResize`).
| 61 | Medium | `patterns.restoreFocus` | Restores focus to a matching element but not the caret. `browser.focus` puts the cursor at the end of a text input, so a repaint while the reader is typing mid-string jumps the caret to the end. Save and restore `selectionStart`/`selectionEnd`. | **Not reproduced:** the morph keeps the focused input as the same node and only writes `value` when it differs, so in Chromium the caret stays where the reader left it. Nothing changed.
| 62 | **High** | `patterns.wordsOf` | Joins every string value of a row, which includes the `weave-id-…` that `withId` just added. So the query "weave" matches every row, and any query that happens to hit a base-36 id matches a row at random. Search over the caller's fields, not over the internal id. | **Fixed:** `wordsOf` omits the row id.
| 63 | Medium | `patterns.gridOrder` | Sorts ascending only. Pressing the same column header again re-sorts identically, so there is no way to reverse a grid. Keep a direction in state and flip it when the active column is pressed again. | **Fixed:** `gridSortBy` flips `descending` when the active column is pressed again, and `gridDirected` reverses the sorted rows.
| 64 | Medium | `patterns.persistIn` | Round-trips state through JSON. A `Date` in state (which `patterns.calendar` keeps in `state.month`) comes back as a string and every date call on it then throws. Persisting a calendar is broken as written. | **Fixed:** `storage.decode` revives the exact string `Date.toJSON` writes back into a `Date`, so a persisted calendar comes back whole.
| 65 | Medium | `patterns.linkTo` | Writes the hash on every update, which fires `hashchange`, which merges the same value back and repaints again. Every state change costs two repaints. Skip the write when the value is unchanged. | **Fixed:** `changedAddress` ignores a hash that already agrees with the state, so the pattern's own write no longer repaints it twice.
| 66 | Low | `patterns.record` | The undo log grows without a cap. A long session in a pattern with history holds every state it ever had. | **Fixed:** the undo log keeps at most `patterns.defaults.historyLimit` states.
| 67 | Low | `patterns.dashboard` | Uses `wizardState()` for its own state, so a dashboard carries a meaningless `step: 0`. Copy-paste, harmless, confusing. | **Fixed:** a dashboard has its own state.
| 68 | Low | `patterns.virtualRestore` | Writes `scrollTop` on every repaint, and a repaint is what a scroll causes. On touch this fights momentum scrolling. Only restore when the element's scroll position actually differs. | **Fixed:** `virtualRestore` writes the offset only when it differs.
| 69 | Low | `patterns.confirm` | Resolves the promise twice on the accept path: once with `true`, then again with `false` through `onClose`. The second is ignored, but the intent is unclear and one change to `deferred` would make it a bug. | **Fixed:** `confirm` settles once.
| 70 | Low | `auth.gate` | The password fields carry no `autocomplete` attribute, so password managers neither fill nor offer to save. `components.codeField` sets `autocomplete: one-time-code` and shows the pattern is available. | **Fixed:** the gate's fields carry `autocomplete` hints (`auth.fills`): `current-password` to sign in, `new-password` to sign up and reset.

## Demo and application pages

| # | Sev | Where | What |
|---|---|---|---|
| 71 | **High** | `apps/relay.html:107` | `listHandle` is built once with `row: threadRow(store.state)`, capturing the *initial* state. The row renderer therefore reads a frozen `chosen` and `checked` forever: selecting a thread never highlights its row, and ticking a checkbox never marks it. The renderer must read the live state at paint time. | **Fixed:** The row renderers read the live store state.
| 72 | **High** | `apps/relay.html:73` | `undoMove` builds a list of `{thread, folder}` and hands it to `restoreAll`, whose parameter is literally named `ignored` and which only clears `checked`. The Undo button on the "Archived 12 threads" toast does nothing. The threads stay moved. | **Fixed:** The move records each thread's folder before it changes, and `restoreAll` puts them back.
| 73 | Medium | `apps/pantry.html` | `basketBody` calls `checkoutForm()` on every store update, so a fresh `entryForm` pattern is built each time the basket changes. Anything typed into the checkout is wiped whenever a line is added or removed, and each discarded pattern is never `stop()`ped. | **Fixed:** the checkout is built once per opening, beside the connected basket view instead of inside its render, so a changing basket no longer wipes it.
| 74 | Medium | `apps/pantry.html` | `placeOrder = ignored => …` throws away the validated name, phone and address. The form validates, then the values go nowhere. | **Fixed:** the order keeps the name, phone and address, and the progress panel says who and where it is for.
| 75 | Medium | `apps/pantry.html` | `choiceView(draft)` mounts a pattern into the dialog body and nothing stops it when the dialog closes. Every dish opened leaks a live pattern. | **Fixed:** the dish dialog stops its view on close, and the basket stops its store watcher and its checkout, which had left one live watcher behind per opening.
| 76 | Medium | 16 of 23 pages | No `<meta name="viewport">`. Only `pantry`, `relay`, `handbook`, `kit`, `review`, `signal` and `tenants` have one. Every other demo renders at a 980px viewport on a phone and the library's own `compact` breakpoint never fires, so the responsive rules the system is built around are invisible on the devices they exist for. | **Fixed:** Every page carries a viewport tag now.
| 77 | Low | `demos/shop.html` | The combobox labelled "Jump to a shelf" has `onPick: take`, so choosing a search result silently adds the item to the basket instead of scrolling to it. | **Fixed:** picking a shelf focuses its card instead of buying it, and a toast says when the filters hide it.
| 78 | Low | `demos/bank.html` | The transfer form's three fields are never read. `askFirst` confirms and `paid` only cheers, so "Send it" sends nothing and reports success. | **Fixed:** the amount is required and above nothing; a confirmed payment comes off the balance, tops the statement and clears the form.
| 79 | Low | `apps/relay.html` | `markRead` mutates the thread object directly rather than going through the store, so the change is invisible to watchers until some other update repaints. | **Fixed:** opening a thread marks it read through the store.

## Build and CI

| # | Sev | Where | What |
|---|---|---|---|
| 80 | Medium | `.github/workflows/build.yml` | Runs build, audit, tests, row audit, `check-apps` and `check-demos`, but never `check-flagships`, which `package.json`'s own `check` script includes. The two flagship applications are the least covered code in the repository and the only checks they have do not run in CI. | **Fixed:** CI runs `check-flagships`.
| 81 | Low | `scripts/build.js` | The module build is `bundle.replace('const Weave = {};', 'export const Weave = {};')`, a first-occurrence string replace over the whole bundle. Today `00-root.js` sorts first so it lands correctly, but any earlier occurrence in a comment or string silently exports the wrong line. Anchor it to the start of the file instead. | **Fixed:** the module build exports the declaration in `00-root.js` itself and fails the build when it is not there.
| 82 | Low | `scripts/build.js` | Reports raw and gzipped size against a 600 KB raw budget, but the budget only fails on raw. Gzipped size is what ships and is unbudgeted. | **Fixed:** the gzipped size has its own budget (120 KB).

## Micro UI improvements

These are not defects. They are the small things that would make the widget set feel finished.

1. **Focus ring on the scrim.** Opening a dialog traps focus and calls `interaction.focusFirst`, which lands on the Close button. Focusing the dialog container instead means a screen reader announces the title before the first control. **Done:** a dialog now focuses its first field, and only falls back on the first control when it has none, so a form dialog is ready to type into and a palette's search box takes the keys.
2. **Toast stacking cap.** `patterns.notifications` appends without limit. Six toasts fill a phone screen. Cap the visible stack and collapse the rest into a count.
3. **Disabled submit while sending.** `forms.whileDisabled` disables every control, including the submit button, but nothing shows *why*. A `components.spinner` inside the submit button during the promise would say it.
4. **Empty state in the data grid.** `patterns.dataGrid` renders a headed table with zero rows when a search matches nothing. `patterns.emptyNote` already exists and every other pattern uses it.
5. **Table column alignment.** `components.tableCell` is always left aligned. A numeric column wants right alignment; a `align` key on the column row would spend the `aligns` table that already exists. **Done:** a column's `align` (start, centre or end) aligns its header and body cells.
6. **`aria-live` on the search result count.** Typing in `patterns.queryBox` silently changes the row count. `accessibility.announce` exists and would say "12 of 300" without any new machinery.
7. **Hover on rows, not just buttons.** `hoverRule` is generated over `pressable`, which excludes `groupRow` and `listRow`. A list row that responds to the pointer reads as clickable; one that does not reads as dead.
8. **A visible required mark.** `forms.validators.required` exists and `auth.fields` uses it, but `components.fieldLabel` never shows which fields are required until submission fails.
9. **`prefers-reduced-motion` on the ease block.** Already handled through `mediaRules.calm` and the `steadyMotion` query — but `tokens.press` (the 1px button nudge) still applies. Fold it into the same guard.
10. **Dark scheme for the media wash.** `themes.dark` overrides `mediaWash`, but the `@media (prefers-color-scheme: dark)` block applies the whole dark theme to `:root:not([data-theme="light"])`, so a page that explicitly asks for `data-theme="dusk"` gets dusk tokens plus the dark wash where dusk did not override one. Worth an explicit dusk value for every token dark sets. **Done, and worse than described:** the dark-scheme block outranked every explicit theme, so dusk and contrast rendered as dark on a dark OS. It now applies only to a root with no `data-theme`, and dusk carries its own washes, series, heat and tones.

## Round four: found by running, not reading

Every row here was found by executing the bundle or driving a page, and every one is fixed with a
test or a page assertion that fails on the old code unless it says otherwise.

### Core: composition, predicates, control, browser, elements, query, attributes, style

| Sev | Where | What | Status |
|---|---|---|---|
| **High** | `attributes.readerKind` | `<input type=email multiple>` and `<input type=file multiple>` went to the select reader, so `forms.values` threw on any such form. | **Fixed:** only `select-multiple` reads as a list. |
| **High** | `collections.elements.unwrap` | Unwrapping siblings unwrapped their grandparent too; `unwrap` on a child of `body` removed the body. | **Fixed:** `elements.unwrapAll` unwraps each distinct parent once and never the body. |
| **High** | `style.show` | Wrote `display` on a visible element, so a flex box became a block and a button lost `inline-block`. | **Fixed:** returns early when shown, and measures the tag's own default display. |
| Medium | `composition.compareValues` | Could not order `undefined` or `NaN`, so a grid column with an empty cell never sorted. | **Fixed:** they rank last. |
| Medium | `elements.setAttributePair` | `disabled: false` wrote `disabled="false"`, which disables. | **Fixed:** `false` removes the attribute (ARIA keeps the string). |
| Medium | `elements.nodeRules` | `null`, `undefined` or `false` children threw; a NodeList could not be appended. | **Fixed:** `fromNil` and `fromNodeList`. |
| Medium | `elements.builderFor` | Specs could not build SVG, and `in` let `toString` and `constructor` pass as tags. | **Fixed:** own keys of `tags`, then `svg`; an unknown tag names itself in the error. |
| Medium | `query.attributeSelector`, `composition.escapeSelector` | `byData('offset','-1')`, an empty value or a newline threw. | **Fixed:** values are quoted; escaping follows `CSS.escape`. |
| Medium | `predicates.isFocusable` | The enabled filter bound only to the last selector, so a disabled button was focusable. | **Fixed.** |
| Medium | `elements.setters` | `properties` ran before `children`, so a select's `value` found no options. | **Fixed:** properties run after the content. |
| Medium | `style.unitlessProperties`, `browser.setStyle` | `gridRowStart`, `aspectRatio`, `scale` and friends got `px`; `--custom` properties were ignored. | **Fixed.** |
| Medium | `attributes.ariaName` | `labelledBy` became `aria-labelled-by`; nil wrote `"null"`. | **Fixed:** names are lowercased, nil removes. |
| Medium | `composition.queryString` | Serialised `undefined` and `null`. | **Fixed:** nil is dropped, and `network.url` drops an empty query. |
| Low | `setters.data`, `decodeData` | Spec data did not round-trip objects; `'null'` read back as a string. | **Fixed.** |
| Low | `collectEntry`, `groupBy` | Inherited keys (`constructor`) leaked into accumulators. | **Fixed:** read through `control.ownValue`. |
| Low | `style.width`, `setOffset`, `elements.wrap` | Border-box width, offset inside a positioned parent, and a Node wrapper reused for every element. | **Fixed** to jQuery's behaviour. |
| Low | `isEmpty`, `chunk`, `isJsonResponse`, `armTimeout` | A filled Map read as empty; `chunk(0)` threw; `+json` was not JSON; an infinite timeout fired at once. | **Fixed.** |

### Events, timing, dates, formatting, effects, forms, network, storage, navigation

| Sev | Where | What | Status |
|---|---|---|---|
| **High** | `forms.whileDisabled` | Left every `onSubmitAsync` form disabled after its first submit (see 32). | **Fixed.** |
| **High** | `network.sendJson` | `postJson('/a', [1,2])` sent `1,2`; only plain objects were encoded. | **Fixed:** the body is always JSON. |
| Medium | `attributes.valueWriters.checkbox` | `fill({ tags: 'blue' })` ticked every box (31 had fixed only radios). | **Fixed:** a named value ticks the box with that value; a boolean ticks a lone box. |
| Medium | `navigation.router` | Hash mode `go()` wrote a path, every hash change dispatched twice, a query in the hash leaked into a parameter, and Relay passed the mode row where a name was expected. | **Fixed:** `routeModes` is one row per mode, and a router takes the row or its name. |
| Medium | `network.raceRequest` | A caller's own signal replaced the internal one, so a timeout no longer aborted the fetch. | **Fixed:** the caller's signal aborts the internal one. |
| Medium | `network.withHeaders` | A `Headers` instance was dropped; mixed-case names were sent twice; `getJson` sent `content-type` on a GET, forcing a preflight. | **Fixed.** |
| Medium | `storage.cookie` | One cookie with a bad `%` escape broke every read; a `Date` expiry was written in local time; `removeCookie` could not remove a cookie set with a path. | **Fixed.** |
| Medium | `dates.parse` | Accepted `2024-02-30` and rejected its own platform's `toISOString()` output. | **Fixed.** |
| Medium | `dates.diff` | Rounded, so a person born on 1 January was a year older in July. | **Fixed:** calendar units count whole units. |
| Medium | `network.load` | Dropped top-level matches. | **Fixed.** |
| Medium | `timing.debounce` | `flush` ran `f` again after the timer had fired, and with nothing pending. | **Fixed.** |
| Medium | `forms.checkRule` | `required: false` still required; an empty optional field failed its other rules. Relay, Pantry and Tenants had leaned on this, and now say `required` where they mean it. | **Fixed.** |
| Low | `storage.revive` | Any string that looked like a date came back a `Date`. | **Fixed:** dates are written as `{ "$date": … }`. |
| Low | `timing.throttleFrame`, `forms.onChange`, `events.copyListeners`, `effects.fadeIn`, `parserNameFor` | First call's arguments; two reports per checkbox click; a copied once listener removed the source's; `fadeIn` after `fadeTo` snapped back; `+json` parsed as text. | **Fixed.** |
| Low | `formatting.relativeIn` | Across a spring-forward change the next calendar day reads "in 23 hours". | **Not changed:** the distance is real elapsed time. |

### Interaction, accessibility, collections, overlays, auth

| Sev | Where | What | Status |
|---|---|---|---|
| **High** | `interaction.sortable` | A plain click on an item deleted it. | **Fixed.** |
| **High** | `interaction.matchesShortcut` | Shifted keys (`?`) and `space` never fired, so Relay's help sheet could not open from a keyboard. | **Fixed:** key names go through `browser.keyNames`; shift is ignored for a symbol. |
| **High** | `auth.screens.verify` | Signing up and verifying led to "Choose a new password". | **Fixed:** verify goes on to wherever the screen before it leads. |
| Medium | `interaction.isTyping` | A checkbox counted as typing; `<div contenteditable>` did not. | **Fixed.** |
| Medium | `interaction.focusables` | Hidden, `:disabled` and spare radio stops let Tab leave a dialog. | **Fixed.** |
| Medium | `draggable`, `resizable` | `onEnd` fired on every pointerup; a resize grew by padding and border each drag. | **Fixed.** |
| Medium | `collections.elements.clone` | Returned the originals. | **Fixed.** |
| Medium | `auth.fields.code`, `auth.gateMeter` | Any six characters verified; the strength meter ignored typing. | **Fixed.** |
| Medium | `accessibility.roving`, `modal` | Roving froze its items; one Escape closed every modal; closing a lower dialog moved focus behind the top one. | **Fixed:** modals are a stack. |
| Medium | `accessibility.labelSources` | A `<select>` or `<textarea>` was labelled by its own text, so the audit passed it. | **Fixed.** |
| Medium | `patterns.shortcutStep`, `accessibility.releaseWith` | Page shortcuts fired under an open dialog (typing `c` in Compose opened a second Compose), and a dialog focused its Close button. | **Fixed:** shortcuts wait while a modal is open, and a dialog focuses its first field. |
| Low | `collections` lifts | Empty collections passed every predicate; `parents` came back farthest first; `filter` threw on text nodes. | **Fixed.** |
| Low | `auth.session`, `overlays.tipShow`, `onDoubleTap` | Two sessions on one key disagreed; a tooltip outlived its target; a triple tap fired twice. | **Fixed.** |

### Components

| Sev | Where | What | Status |
|---|---|---|---|
| **High** | `components.schemeSelector` | On a dark OS, `data-theme="dusk"` and `"contrast"` rendered as dark. | **Fixed.** |
| **High** | `components.bodyCell` | A row missing a column key, or holding `null` or `false`, threw and the table never drew. | **Fixed.** |
| **High** | `themes.dusk` | Kept the light diff washes (1.1:1 contrast) and lacked series, heat and overlay values. | **Fixed.** |
| Medium | `themes.dark`, `themes.dusk` | Tone colours were never themed: about 2.5:1 on dark surfaces. | **Fixed:** every tone is at least 6.3:1. |
| Medium | hand-built widgets | `table({grid})`, `media({ratio})`, `badge({tone})` and a dozen more dropped the caller's modifiers. | **Fixed:** each goes through `keepMarks`. |
| Medium | `tokens.wideWidth` | The wide breakpoint made the page narrower. | **Fixed.** |
| Medium | `stepperNext` | One bound gave `NaN`; no `onChange` threw. | **Fixed.** |
| Medium | `components.tooltip` | Its note was hidden forever and its target could not be focused. | **Fixed.** |
| Medium | ARIA | `aria-selected` on buttons, `aria-label` on roleless graphics, an unnamed modal, an unreachable sortable header. | **Fixed:** `aria-pressed`, `role="img"`, the title names the modal, the header is a button with `aria-sort`. |
| Medium | `rules.pageButton` | Page numbers were black on a dark surface. | **Fixed.** |
| Medium | compact `rules.page`, `rules.shell` | The phone tab bar covered the last row; a three-pane shell was unusable at 375px. | **Fixed:** the page reserves the bar's height, and a shell snaps pane by pane. |
| Low | `nextTheme`, `dropdownSummary`, `choices` | The first toggle did nothing on a dark OS; a dropdown ignored its title; radios without a name did not group. | **Fixed.** |
| Low | `components.searchSpec`, `patterns.paletteBody` | A command palette ignored Enter. | **Fixed:** Enter runs the first match. |

### Patterns

| Sev | Where | What | Status |
|---|---|---|---|
| **High** | `patterns.paint` | The first click after `connect`, `withHistory`, `persist` or `linkTo` went to the unwrapped updater and was lost. | **Fixed:** handlers reach the updater late. |
| **High** | `patterns.linkTo` | Values came back from the hash as strings, so the grid's pager went to page "21". | **Fixed.** |
| Medium | `travelWith`, `linkTo` | Undo and redo bypassed persist and the address; Back could not return to the start. | **Fixed.** |
| Medium | `virtualShow`, `resource` | `show()` left a blank viewport; a slow reload overwrote a newer one. | **Fixed.** |
| Medium | `gridOrder` | Missing values, case and descending ties sorted wrongly. | **Fixed:** a collator, missing last, a flipped comparator. |
| Medium | `wordsOf`, `inlineEdit` | Search never matched numbers; editing dropped focus to the body. | **Fixed.** |
| Low | `chipFilter`, `chartBoard`, `tabsView`, `wizard`, `dataGrid`, `todo`, `chat`, `combobox`, `carousel` | A stopped popover kept driving; empty inputs crashed or added blank rows. | **Fixed.** |

### Applications and demos

| Sev | Where | What | Status |
|---|---|---|---|
| **High** | `apps/relay.html` | Archive and Report spam changed threads behind the store's back: nothing redrew, the selection stayed, and a second press moved them again. | **Fixed:** threads live in the store; a move clears the selection and Undo puts them back. |
| **High** | `apps/relay.html` | Select all, then search, then a bulk move moved the threads the search hid. | **Fixed:** a move takes only the ticked threads the search shows. |
| **High** | `demos/orbit.html` | The live tick wiped the Settings fields every 2.6s, and Save saved nothing. | **Fixed:** the fields are kept in the store and Save commits them. |
| **High** | `apps/relay.html`, library shell | At 375px the reader pane sat off screen, so a thread could not be read on a phone. | **Fixed:** the shell snaps pane by pane, and Relay brings the pane in use into view. |
| Medium | `apps/relay.html` | Ticking a row opened the thread (a checkbox inside a button); a palette command left the palette open or stacked dialogs; Starred was a random folder; the hash router was never started; the help sheet named the palette key "k2". | **Fixed.** |
| Medium | `apps/pantry.html` | Placing an order left the basket full and open; a second press ran two deliveries at once; an empty basket did nothing silently. | **Fixed.** |
| Medium | `demos/helpdesk.html` | A sent reply was lost on switching tickets, and Send did nothing after a switch. | **Fixed:** tickets live in a store. |
| Low | `demos/landing.html`, `patterns.boardMoves` | "Take the tour" did nothing; a board offered Move left on its first lane and Move right on its last. | **Fixed.** |

