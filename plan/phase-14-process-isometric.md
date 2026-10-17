# Phase 14 — Isometric Process Board

**Status:** IN_PROGRESS
**Depends on:** Phases 07, 09
**Runs before:** Phase 11

## Objective

Rework the "From requirement to production" scene after the client's
reference video (`assets-src/prcess3d.mp4`): raised tiles on an isometric
grid floor, joined by a glowing trace that routes from tile to tile and lights
each one as it arrives, with a label chip beside each lit tile. Take the idea,
not the look: it stays inside the drawing-set language.

## What we keep from the reference

- Isometric floor with a faint grid, tiles raised off it with a visible side
  face and a soft reflection/shadow below.
- A single trace enters from the left and runs in right-angle bends (like a
  PCB trace) to each tile in order. The trace's head carries the glow.
- A tile lights when the trace reaches it; its label chip fades in beside it.
- Mono, uppercase, small-caps style labels in a pill.

## What changes for our theme

- **One accent, not a rainbow.** The reference gives every tile its own colour.
  Ours keeps stage meaning: complete tiles light in ink, the current stage
  (Laboratory testing) in copper with its "Current stage" label, upcoming
  tiles stay unlit with a dashed outline and the trace runs to them dashed.
  State is never colour alone (fill + outline style + label).
- **Numbers, not icons.** Each tile face carries its stage number (01–11) in
  `type-data`; no icon set is added.
- **Paper stays.** The scene keeps the paper sheet ground (client decision).
  "Glow" becomes a copper trace with a soft copper bloom on the floor under
  the current tile; complete tiles read as solid ink caps, not light.
- **Eleven stages, laid out wide.** Tiles step alternately along the two
  floor axes, so on screen they run left to right in a zigzag (one up, one
  down), like the reference. Generous spacing between tiles; the board is
  wider than the viewport (client revision, 2026-10-17).

## Motion

- Desktop, motion allowed: the scene pins (as today) and scroll scrubs the
  trace from the entry point to the last tile while the board travels
  horizontally, keeping the trace head in view; each tile lights as the trace
  head passes it. Scrubbing back reverses cleanly.
- Tiles press down slightly (a few px of side face) as they light, then settle;
  no bounce.
- Phones and reduced motion: no isometric board. The current vertical list
  stays, with tiles drawn flat; the line draws down the list on phones, and is
  fully drawn for reduced motion.
- No-JS: board shows its end state (all completed tiles lit, current in copper)
  and scrolls sideways on its own.

## Build constraints

- DOM + CSS 3D transforms for the floor and tiles, SVG for the trace. Labels
  stay real text in a flat layer over the board (positions projected from
  the board), readable by screen readers in stage order. No WebGL, no new
  package.
- Owner marks (`showOwners`) still appear under each label when enabled.

## Acceptance check

1. At 1440 × 900 on `/`, scrolling into Process pins the scene; the board
   travels right to left as the trace draws through all eleven tiles in
   order, and each label appears as its tile lights. Scrolling back unlights them in reverse.
2. Tiles 01–05 lit in ink, 06 lit in copper with "Current stage", 07–11
   unlit and dashed, with the trace dashed between them.
3. At 390 px and with reduced motion, the stages read top to bottom as a list,
   no isometric board.
4. Screen reader reads eleven stages in order with their state.
5. ≈60 fps through the scrub; CLS 0. Build, typecheck, lint, tests and
   claims:check pass.
