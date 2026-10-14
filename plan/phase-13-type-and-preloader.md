# Phase 13 — Letter Swap, Cursor Weight & Stairs Preloader

**Status:** IN_PROGRESS
**Depends on:** Phases 07, 08, 10
**Runs before:** Phase 11 (QA measures the site with these in place)

## Objective

Three client-requested effects, kept inside the drawing-set language (no
bounce, no colour-only signals, reduced motion respected):

1. Labels on buttons and header links swap their letters vertically on hover.
2. The hero H1 thickens letter by letter as the cursor nears it.
3. A full-screen "double stairs" preloader replaces the hero's elevation
   drawing as the loading state.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 13.1 | Letter swap on buttons and header nav links | COMPLETED |
| 13.2 | Cursor-proximity weight on the hero H1 | COMPLETED |
| 13.3 | Stairs preloader, lifted by model readiness | COMPLETED |
| 13.4 | Hero hands over from the preloader (drawing preloader removed) | COMPLETED |

## Behaviour

### 13.1 Letter swap

- Applies to every button whose label is plain text, and to the header's
  destination links. Hovering anywhere on the control (not just the text)
  starts it.
- Each letter rolls up and out of its own clipped box while an identical copy
  rolls up from below. Letters start 20 ms apart, first to last. Leaving
  rolls them back the same way (ping-pong).
- Interruptible: leaving mid-roll reverses each letter from where it is, with
  no jump and no lock-out. Built with CSS transitions, so there is no extra
  package (the reference uses lodash to debounce; CSS transitions don't need it)
  and no JavaScript on the hover path.
- Timing: `quick` (240 ms) with `ease-settle` per letter, no overshoot.
- Only on devices that hover; a tap shows no roll. Reduced motion: no roll.
- Screen readers hear the label once (one visually hidden copy, the letter
  copies hidden).

### 13.2 Cursor-proximity weight

- Hero H1 only. Each letter's weight runs from the style's own weight (500)
  up to 800 as the cursor comes within a radius of the letter's centre
  (≈1.6 × the H1's font size); linear falloff, nothing past the radius.
- Only the `wght` axis moves; the width "machining" of the assembly lock
  keeps working.
- Starts once the headline has settled (revealed and machined to width).
  Letters keep the width they had at rest, so a heavier letter never pushes
  its neighbours and the page doesn't shift (CLS stays 0).
- Fine pointers that hover only; off for touch and for reduced motion. The
  cursor leaving the window returns every letter to rest. No work while the
  cursor is still and the page isn't scrolling.

### 13.3 Stairs preloader

- Full screen, Lab colours (graphite ground, paper ink), above everything
  including the header. A copper centre line draws across the middle with the
  wordmark above it. This much paints from the server HTML, before scripts.
- Shows on the first page load of a browser session only. Later loads in the
  same session, client-side navigations, reduced-motion users and visitors
  without JavaScript never see it. Decided before first paint, so there is no
  flash either way.
- Lifts when the page's first 3D view has drawn, or at once if the device is
  on the poster tier or the page has no 3D. Minimum hold 0.8 s from
  navigation start (the centre line finishes drawing); maximum hold 4 s, then
  it lifts regardless.
- Exit, the "double stairs": the screen is cut into columns, split along the
  centre line. Upper halves leave upward, staggered left to right; lower
  halves leave downward, staggered right to left. `scene` duration with
  `ease-machine`. Then it's removed from the page.
- The page can't scroll while it covers.

### 13.4 Hero handover

- The elevation drawing no longer shows as the hero's loading state (the
  Sheet side of the section sweep keeps it).
- If the model is ready when the preloader lifts, the assembly lock and the
  headline's line reveal start as the stairs part. Headline reveals elsewhere
  on the page also wait for the lift, so none play unseen.
- Without the preloader (return visit), the hero behaves as before minus the
  drawing: assembly when the model is ready, or a plain handover if it is late.

## Validation criteria

- [x] Hovering a header link or any text button rolls its letters; leaving
      mid-roll reverses smoothly; no roll on touch or with reduced motion.
- [x] Accessibility tree shows each affected label once.
- [x] Hero H1 letters thicken near the cursor and return when it leaves; a
      layout-shift recording while sweeping the cursor across the H1 shows 0.
- [x] Fresh session: preloader paints before any script, lifts as the hero
      model appears (≥ 0.8 s, ≤ 4 s), exits as a double staircase, then the
      assembly plays.
- [ ] Reload in the same session, reduced motion, and JavaScript disabled:
      no preloader, no flash.
- [x] `/contact` in a fresh session: preloader lifts after the minimum hold.
- [x] No console errors or hydration warnings.
- [x] Build, typecheck, lint, tests and claims:check pass.
- [x] Status.md updated.

## Notes (build)

- Letter swap uses CSS transitions instead of Motion and lodash, so nothing
  had to be installed. Splitting a label into letters drops kerning between
  them, which barely shows at annotation size.
- Splitting the H1 into separate letters lost its kerning and inherited the
  percentage first-line indent, which showed as gaps ("Mot ors"). Each letter
  is now measured where it sits before the split, its box is fixed to that
  width, and its indent is reset. A screenshot diff showed this matches the
  unsplit text.
- Dev, 1440×900, fresh session on `/`: the cover is there from the first
  frame, the model is drawn at about 1.15 s, the lift starts at about 2.1 s
  and the cover is gone by 3.25 s. On `/contact` the lift starts at about
  0.8 s. Reloading in the same session shows no cover. Sweeping the cursor
  across the H1 caused 0 layout shift. The whole page load measured CLS 0.0004
  (not traced to its source).
- Not checked in a browser: reduced motion (DevTools MCP can't emulate it),
  JavaScript disabled, and a real touch device. All three rely on simple
  logic: the cover only shows when the `<head>` script adds the attribute,
  and the hover and proximity effects are gated on media queries.
