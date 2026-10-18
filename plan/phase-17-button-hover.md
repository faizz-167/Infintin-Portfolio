# Phase 17 — Direction-aware button hover

**Status:** COMPLETED
**Depends on:** Phase 16 (committed first)
**Runs before:** Phase 11

## Objective

Today the ink fill on primary and secondary buttons always wipes up from the
baseline. Make it follow the pointer instead: the fill grows in from the edge
the pointer came in through, and when the pointer leaves it shrinks back out
through the edge it left by. The letter roll and the arrow nudge stay as
they are.

## Behaviour

- The entry edge is whichever of the four edges is nearest the entry point,
  measured relative to the button's size, so coming in through the side of a
  wide button counts as a side entry.
- The exit works the same way, based on where the pointer leaves.
- Timing and easing stay the same as today's wipe (`quick`, `settle`).
- Touch: no hover. A press still shows the fill at once, as today.
- Reduced motion: the fill cross-fades in and out, with no direction.
- The text variant's underline and the pressed toggle state are unchanged.

## Out of scope

- Other hover effects (header links, text links, process tiles).
- No new package.

## Acceptance check

1. At 1440 × 900, entering a primary or secondary button from the top,
   bottom, left and right grows the fill from that edge; leaving through a
   different edge shrinks it out through that edge.
2. With reduced motion on, the fill fades in and out with no movement.
3. With 390 px touch emulation, a tap shows the fill instantly and nothing
   stays filled afterwards.
4. Build, typecheck, lint, tests and claims:check pass.
