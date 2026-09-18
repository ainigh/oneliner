# Bug inventory

Found by reading the source only. No tests were run. Each entry names the one place to fix, in the
project's own terms. Severity: **High** breaks a visible feature, **Medium** wrong in an edge a user
will hit, **Low** cosmetic, surprising, or a maintainability trap. "UI" entries are micro
improvements to the feel of the widgets rather than defects.

## Status

Because this list was written from reading alone, nothing in it was trusted until it was
reproduced. Entries 10, 19, 31, 49, 53, 59, 62, 71 and 72 were each reproduced — the library ones against the
built bundle, the two relay ones by driving the real page in a browser — then fixed, then
re-run to show the failure gone; 76 and 80 were confirmed by inspection. Those rows are
marked **Fixed** below. Everything else in this file is still an unverified reading of the
source and should be reproduced before it is acted on.

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
| 10 | **High** | `style.hide` | Calling `hide` on an element that is already hidden records `weaveDisplay = "none"`. The next `show` restores `"none"`, so the element can never be shown again. `rememberDisplay` must skip when the inline display is already `none`. Every `toggle`, `fadeToggle`, `slideToggle` and the patterns that hide on repaint can hit this. | **Fixed:** `style.rememberDisplay` records only when the element is shown.
| 11 | Medium | `style.isShown` | Reads only the inline `display`. An element hidden by a stylesheet class reports as shown, so `toggle` hides it again instead of showing it. jQuery uses the computed value plus `offsetParent`. |
| 12 | Medium | `elements.morphProperties` | Copies `value` from the fresh element onto the live one on every repaint. A fresh spec has `value=""`, so anything the user is typing in a pattern's input is wiped by the next repaint unless the pattern threads the value back through the spec. Skip `value` when the live element is focused. |
| 13 | Medium | `elements.positionalCandidate` | An unkeyed child at index N is morphed into whatever node currently sits at N, including a keyed node that belongs later in the list. Mixed keyed/unkeyed lists steal each other's nodes and lose state. Only accept a positional candidate that is itself unkeyed. |
| 14 | Low | `elements.keyedCandidate` | Searches all children for a key match, including nodes already placed at an earlier index this pass. Duplicate keys move the same node twice. |
| 15 | Low | `elements.unwrap`, `elements.wrapNodes` | `unwrap` on a root element (`parentOf` is null) and `wrapAll` on an empty list both throw a raw TypeError. |
| 16 | Low | `elements.nodeRules.fromAnything` | A plain object with one unknown key (e.g. a typo `clases`) is not a spec, falls through to `identity`, and `appendChild` throws "parameter 1 is not of type Node". The `invalidSpec` error row exists but is never reached here. |
| 17 | Low | `attributes.booleanAttributes` | Table is labelled "attribute names" but `readonly = 'readOnly'` and `novalidate = 'noValidate'` are property names. `isBooleanAttribute('readonly')` is false; `setBooleanAttribute` happens to work only because HTML lowercases attribute names. |
| 18 | Low | `attributes.data` | Auto-parses JSON, so `data-zip="10001"` comes back as the number 10001 and `data-code="1e3"` as 1000. Leading-zero codes stay strings only because they fail to parse. Surprising for ids and postcodes. |
| 19 | Medium | `timing.debounce` | `flush` calls `f` with the last args but does not cancel the pending timer, so `f` runs twice. `cancel` should be called inside `flush`. | **Fixed:** `flush` cancels the pending timer first.
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
| 31 | **High** | `forms.fill` for radio groups | `valueWriters.radio` sets `checked = Boolean(value)` on every radio of that name, ignoring each radio's own `value`. `fill({ colour: 'blue' })` checks whichever radio is last in the DOM. Compare `value` to the radio's value attribute. Checkboxes with a `value` attribute have the same problem. | **Fixed:** `valueWriters.radio` compares the value against the radio's own.
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

## Components: widgets, tokens and the stylesheet

| # | Sev | Where | What |
|---|---|---|---|
| 49 | **High** | `components.imageAttributes` | Reads `browser.keywords.src`, which does not exist. The table spells it `keywords.source`. The computed key is the string `"undefined"`, so every `components.image` renders `<img undefined="…">` with no `src` and nothing ever loads. One-word fix, and `grep 'keywords.src'` finds no other caller. | **Fixed:** The keyword is spelled `source`; `imageAttributes` spends it.
| 50 | Medium | `components.pagination` | Renders one button per page with no windowing. A grid of 5000 rows at 10 a page draws 500 buttons on every repaint. `pagerGap` exists but nothing uses it for an ellipsis. |
| 51 | Medium | `components.tabs` | Follows the `tablist` / `tab` roles but wires no keyboard behaviour: no roving tabindex, no arrow keys, no `aria-controls` to the pane. `accessibility.roving` exists and is never used by the widget that most needs it. Same for `components.menu` and `components.steps`. |
| 52 | Medium | `components.chartShare` | Divides by `chartTop`, and `chartTop([])` is `Math.max()` which is `-Infinity`. A chart with no readings yields `NaN%` widths; a chart whose readings are all zero divides zero by zero. Guard the top before dividing. |
| 53 | Low | `components.dialogHeader` | Always draws a Close button, but `closeButton` passes `onAction: spec.onClose`. With no `onClose` the handler table skips the key, so the modal shows a Close button that does nothing. | **Fixed:** `dialogHeader` reuses `alertClose`, which already drew the button only when there was something to close.
| 54 | Low | `components.ringShares` | Recomputes `chartSum` over every item inside a `map` over every item, so a donut is quadratic in its slice count. Same shape in `ringBefore`. |
| 55 | Low | `components.configure` | Assigns onto `tokens`, but `installStyles` is `control.once` and the sheet is a snapshot. Calling `configure` after the first widget renders silently does nothing. The comment says "before the sheet is written" — the code should enforce it or the call should re-emit. |
| 56 | Low | `components.optionValue` / `optionLabel` | `defaultTo(String(value))(value.label)` evaluates `String(value)` on every call even when a label exists, and reads `.label` off whatever it is given. A `null` option throws rather than falling back. |
| 57 | Low | `components.heatAt`, `seriesAt` | Both clamp with `Math.min` against the last index but neither guards a negative or `NaN` index, which reads back `undefined` and emits a `data-heat="undefined"` attribute that matches no rule. |
| 58 | Low | `components.tooltip` | Builds a fresh random id on every call, so a repaint gives the same tooltip a new id each time and any external `aria-describedby` pointing at it breaks. |

## Overlays and patterns

| # | Sev | Where | What |
|---|---|---|---|
| 59 | **High** | `overlays.watchScroll` | Closes the popover on any scroll event captured at the document, including scrolling *inside* the popover itself. Any popover with a scrollable list closes the moment the reader scrolls it. Ignore scrolls whose target is inside `state.box`. | **Fixed:** `watchScroll` reuses `outsideStep`, the containment guard `watchOutside` already had.
| 60 | Medium | `overlays.placeAt` | Position is computed once at open. Resizing the window, or the anchor moving, leaves the popover stranded. There is no reposition on resize and no `onResize` subscription. |
| 61 | Medium | `patterns.restoreFocus` | Restores focus to a matching element but not the caret. `browser.focus` puts the cursor at the end of a text input, so a repaint while the reader is typing mid-string jumps the caret to the end. Save and restore `selectionStart`/`selectionEnd`. |
| 62 | **High** | `patterns.wordsOf` | Joins every string value of a row, which includes the `weave-id-…` that `withId` just added. So the query "weave" matches every row, and any query that happens to hit a base-36 id matches a row at random. Search over the caller's fields, not over the internal id. | **Fixed:** `wordsOf` omits the row id.
| 63 | Medium | `patterns.gridOrder` | Sorts ascending only. Pressing the same column header again re-sorts identically, so there is no way to reverse a grid. Keep a direction in state and flip it when the active column is pressed again. |
| 64 | Medium | `patterns.persistIn` | Round-trips state through JSON. A `Date` in state (which `patterns.calendar` keeps in `state.month`) comes back as a string and every date call on it then throws. Persisting a calendar is broken as written. |
| 65 | Medium | `patterns.linkTo` | Writes the hash on every update, which fires `hashchange`, which merges the same value back and repaints again. Every state change costs two repaints. Skip the write when the value is unchanged. |
| 66 | Low | `patterns.record` | The undo log grows without a cap. A long session in a pattern with history holds every state it ever had. |
| 67 | Low | `patterns.dashboard` | Uses `wizardState()` for its own state, so a dashboard carries a meaningless `step: 0`. Copy-paste, harmless, confusing. |
| 68 | Low | `patterns.virtualRestore` | Writes `scrollTop` on every repaint, and a repaint is what a scroll causes. On touch this fights momentum scrolling. Only restore when the element's scroll position actually differs. |
| 69 | Low | `patterns.confirm` | Resolves the promise twice on the accept path: once with `true`, then again with `false` through `onClose`. The second is ignored, but the intent is unclear and one change to `deferred` would make it a bug. |
| 70 | Low | `auth.gate` | The password fields carry no `autocomplete` attribute, so password managers neither fill nor offer to save. `components.codeField` sets `autocomplete: one-time-code` and shows the pattern is available. |

## Demo and application pages

| # | Sev | Where | What |
|---|---|---|---|
| 71 | **High** | `apps/relay.html:107` | `listHandle` is built once with `row: threadRow(store.state)`, capturing the *initial* state. The row renderer therefore reads a frozen `chosen` and `checked` forever: selecting a thread never highlights its row, and ticking a checkbox never marks it. The renderer must read the live state at paint time. | **Fixed:** The row renderers read the live store state.
| 72 | **High** | `apps/relay.html:73` | `undoMove` builds a list of `{thread, folder}` and hands it to `restoreAll`, whose parameter is literally named `ignored` and which only clears `checked`. The Undo button on the "Archived 12 threads" toast does nothing. The threads stay moved. | **Fixed:** The move records each thread's folder before it changes, and `restoreAll` puts them back.
| 73 | Medium | `apps/pantry.html` | `basketBody` calls `checkoutForm()` on every store update, so a fresh `entryForm` pattern is built each time the basket changes. Anything typed into the checkout is wiped whenever a line is added or removed, and each discarded pattern is never `stop()`ped. |
| 74 | Medium | `apps/pantry.html` | `placeOrder = ignored => …` throws away the validated name, phone and address. The form validates, then the values go nowhere. |
| 75 | Medium | `apps/pantry.html` | `choiceView(draft)` mounts a pattern into the dialog body and nothing stops it when the dialog closes. Every dish opened leaks a live pattern. |
| 76 | Medium | 16 of 23 pages | No `<meta name="viewport">`. Only `pantry`, `relay`, `handbook`, `kit`, `review`, `signal` and `tenants` have one. Every other demo renders at a 980px viewport on a phone and the library's own `compact` breakpoint never fires, so the responsive rules the system is built around are invisible on the devices they exist for. | **Fixed:** Every page carries a viewport tag now.
| 77 | Low | `demos/shop.html` | The combobox labelled "Jump to a shelf" has `onPick: take`, so choosing a search result silently adds the item to the basket instead of scrolling to it. |
| 78 | Low | `demos/bank.html` | The transfer form's three fields are never read. `askFirst` confirms and `paid` only cheers, so "Send it" sends nothing and reports success. |
| 79 | Low | `apps/relay.html` | `markRead` mutates the thread object directly rather than going through the store, so the change is invisible to watchers until some other update repaints. |

## Build and CI

| # | Sev | Where | What |
|---|---|---|---|
| 80 | Medium | `.github/workflows/build.yml` | Runs build, audit, tests, row audit, `check-apps` and `check-demos`, but never `check-flagships`, which `package.json`'s own `check` script includes. The two flagship applications are the least covered code in the repository and the only checks they have do not run in CI. | **Fixed:** CI runs `check-flagships`.
| 81 | Low | `scripts/build.js` | The module build is `bundle.replace('const Weave = {};', 'export const Weave = {};')`, a first-occurrence string replace over the whole bundle. Today `00-root.js` sorts first so it lands correctly, but any earlier occurrence in a comment or string silently exports the wrong line. Anchor it to the start of the file instead. |
| 82 | Low | `scripts/build.js` | Reports raw and gzipped size against a 600 KB raw budget, but the budget only fails on raw. Gzipped size is what ships and is unbudgeted. |

## Micro UI improvements

These are not defects. They are the small things that would make the widget set feel finished.

1. **Focus ring on the scrim.** Opening a dialog traps focus and calls `interaction.focusFirst`, which lands on the Close button. Focusing the dialog container instead means a screen reader announces the title before the first control.
2. **Toast stacking cap.** `patterns.notifications` appends without limit. Six toasts fill a phone screen. Cap the visible stack and collapse the rest into a count.
3. **Disabled submit while sending.** `forms.whileDisabled` disables every control, including the submit button, but nothing shows *why*. A `components.spinner` inside the submit button during the promise would say it.
4. **Empty state in the data grid.** `patterns.dataGrid` renders a headed table with zero rows when a search matches nothing. `patterns.emptyNote` already exists and every other pattern uses it.
5. **Table column alignment.** `components.tableCell` is always left aligned. A numeric column wants right alignment; a `align` key on the column row would spend the `aligns` table that already exists.
6. **`aria-live` on the search result count.** Typing in `patterns.queryBox` silently changes the row count. `accessibility.announce` exists and would say "12 of 300" without any new machinery.
7. **Hover on rows, not just buttons.** `hoverRule` is generated over `pressable`, which excludes `groupRow` and `listRow`. A list row that responds to the pointer reads as clickable; one that does not reads as dead.
8. **A visible required mark.** `forms.validators.required` exists and `auth.fields` uses it, but `components.fieldLabel` never shows which fields are required until submission fails.
9. **`prefers-reduced-motion` on the ease block.** Already handled through `mediaRules.calm` and the `steadyMotion` query — but `tokens.press` (the 1px button nudge) still applies. Fold it into the same guard.
10. **Dark scheme for the media wash.** `themes.dark` overrides `mediaWash`, but the `@media (prefers-color-scheme: dark)` block applies the whole dark theme to `:root:not([data-theme="light"])`, so a page that explicitly asks for `data-theme="dusk"` gets dusk tokens plus the dark wash where dusk did not override one. Worth an explicit dusk value for every token dark sets.
