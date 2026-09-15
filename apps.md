# The two flagship applications

Weave is judged by whether real applications can be written in it, not by whether the library is
tidy. Two are built against it, chosen to be as unlike each other as possible, so that a capability
that only exists by accident in one is missed by the other.

Both are written **only** against `Weave.library.*`, both are audited under the same rules as the
library with **no new exemptions**, and both are driven by `scripts/check-flagships.js`.

## Relay — a team inbox

A dense, keyboard-driven desktop application. The shape of Gmail, Superhuman or Front.

| It must | Which forces |
|---|---|
| show thousands of threads without thousands of rows | `patterns.virtualList` under a live filter |
| open a compose window over the page | a real modal: top layer, scrim, focus trap, Escape, focus restored |
| hang a menu off a button without moving the page | an anchored popover with outside-dismiss and one-at-a-time |
| select many threads and act on all of them | a selection model, a bulk action bar, indeterminate checkboxes |
| say what it just did and let you take it back | a pinned toast host, an undo affordance, a timer that expires |
| answer the keyboard everywhere | a global key map as a table, plus a command palette |
| survive a reload and a shared link | the store, persistence, and routing with parameters |
| stay legible at 1,200 threads and at 380px | virtualisation and the compact breakpoint |

## Pantry — ordering from a kitchen

A mobile-first consumer application. The shape of Deliveroo, Uber Eats or a restaurant's own app.

| It must | Which forces |
|---|---|
| look good before any data arrives | skeletons, empty states, and a real loading phase |
| show food | an image component with an aspect box, a fallback, and lazy loading |
| customise an item before adding it | a dialog with grouped options, radio sets, and a live price |
| hold a cart that follows you | a bottom sheet on a phone and a side drawer on a desk |
| refuse a bad checkout, kindly | validators wired to the field that failed, focus sent to it |
| price things correctly | `formatting.money`, per-locale, never hand-rolled |
| show an order progressing | a stepped progress track driven by a timer |
| print a receipt | the print media rules |
| work thumb-first | a bottom tab bar, safe spacing, and targets big enough to hit |

## The rule for both

Whenever an application cannot say something, the answer is a row in a library table — never a
`<style>` block, never a class written by hand, never a tag named in application code. Every gap
either of them uncovers is recorded in `checklist.md` with the row that closed it.
