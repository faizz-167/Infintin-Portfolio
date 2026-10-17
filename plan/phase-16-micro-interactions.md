# Phase 16 — Micro-interactions

**Status:** IN_PROGRESS
**Depends on:** Phase 15 (committed first)
**Runs before:** Phase 11

## Objective

Some controls on the site respond to the pointer (buttons, text links, the
header links, the approach figure) and many do not. Give every control a
visitor can press, type into or hover a small, physical response, so the
site answers every action without adding decoration.

A micro-interaction here is feedback on something the visitor did. It is
never ambient: nothing moves when nobody is touching the page.

## Rules for every interaction

- Timing comes from the existing motion tokens: `instant` (120 ms) for
  press and hover, `quick` (240 ms) for anything that opens or draws. No new
  durations or curves; easing is `machine` going in and `settle` coming out.
- Transforms and opacity only. Nothing animates layout, so no control
  shifts its neighbours (CLS stays 0).
- Movement is a couple of pixels at most. No scale-up pops, no glow, no
  bounce or overshoot (design-direction §2 still applies).
- Reduced motion: state changes still show (colour, outline, tick, open or
  closed) but appear at once, without movement.
- Touch: hover-only effects are limited to devices that actually hover, so
  a tap never leaves a control stuck in its hover state.
- Keyboard focus gets the same feedback as hover, plus the focus outline.

## What gets feedback

1. **Press, everywhere.** Every button and link sinks 1 px while pressed
   and comes back up on release. One shared treatment, not per component.
2. **Focus outline, everywhere.** One consistent focus-visible outline
   (accent, square, offset from the control) on every focusable control,
   replacing any one-off outlines.
3. **Text fields and selects (enquiry form).** On focus the bottom rule
   draws in from the left in the accent colour; on blur it goes back. An
   invalid field's rule stays in the error colour. The select's chevron
   turns when its list opens.
4. **Checkboxes.** Checking draws the tick as a stroke; unchecking
   removes it at once.
5. **Disclosures (FAQ and similar).** The marker turns a quarter turn and
   the content fades and slides 4 px into place as it opens. Closing
   reverses.
6. **Product explorer.** Hovering a parts-list row already highlights the
   part in 3D; its balloon now highlights too, and hovering a balloon
   highlights its row. Pressing a row or a balloon gets the 1 px press.
7. **Contact channels.** Hovering or focusing a channel moves its arrow 2 px
   in the direction it points.
8. **Process board.** On desktop, hovering a reached tile (complete or
   current) lifts its cap 2 px and highlights its label. Upcoming tiles do
   not respond. This is pointer-only and decorative; the stage list stays
   the accessible reading.

## Out of scope

- Hero, Portfolio and the scroll scenes: already animated, unchanged.
- Cursor followers, magnetic buttons, sound, haptics.
- Anything new in the 3D canvas beyond the balloon/row link.
- No copy-to-clipboard control on contact channels (dropped by the client).
- No new package.

## Acceptance check

1. At 1440 × 900, every button and link on `/`, `/products/fcu-double-shaft`
   and `/contact` sinks 1 px on press and shows the same focus outline when
   tabbed to.
2. On `/contact`: focusing a field draws its rule in; an invalid field keeps
   the error rule; the select chevron turns; the checkbox tick draws;
   hovering a channel moves its arrow.
3. On the product page: FAQ items open with the turned marker and the
   content sliding in; hovering a parts-list row lights its balloon and the
   reverse.
4. On `/`, hovering a complete or current process tile lifts it; hovering
   an upcoming tile does nothing.
5. With reduced motion on, every state above still changes but nothing
   moves. On a touch device (390 px emulation), nothing is stuck in hover
   after a tap.
6. CLS 0 on all three pages. Build, typecheck, lint, tests and
   claims:check pass.
