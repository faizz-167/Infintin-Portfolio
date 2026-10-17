# Phase 15 — Portfolio Elevation Teaser

**Status:** IN_PROGRESS (built, awaiting client review)
**Depends on:** Phases 09, 10, 14 (committed first)
**Runs before:** Phase 11

## Objective

The home Portfolio scene (Sheet 03, Lab) currently repeats the product page:
explorer, Explode / X-ray toggles, balloons, parts list and spec table. Turn
it into a teaser that makes the visitor want the product page, and leave the
instruments to that page.

The scene becomes an **elevation**: the motor full-bleed and side-on along
its shaft centreline, the camera travelling the length of the shaft, and a
few approved facts called out on the part they describe. The scene ends with
the product's name and one link to the product page.

Reference study (inspo, 2026-10-17): automotive and hardware landing pages
(Rivian, Lucid, Bugatti) show the object large with a name and a single route
to its own page. We take that structure, not their look.

## What leaves the home page

- The Explode and X-ray toggles, the scroll-driven explode, the part balloons
  and the parts list.
- The spec table.
- Drag-to-rotate and the arrow-key rotation on this view.

All of these stay on `/products/[slug]`, unchanged.

## What the scene shows

- **The motor in elevation.** Side-on, shaft horizontal, filling the scene
  width edge to edge on the Lab ground. The shaft centreline is drawn as a
  thin construction line (long dash, dot) through the motor and out to both
  edges of the viewport, continuing the site's datum.
- **Three callouts**, each a leader line from a point on the motor to a short
  note set in `type-annotation`. Each note is anchored to a part the
  elevation actually shows (the model has no controller part):
  1. Application (fan coil units, 1 to 2 TR): on the front blower wheel.
  2. Power range (50 W to 250 W): on the mid cover, the motor body.
  3. Retrofit ("Retrofits into existing fan coil units"): on the mounting
     stand.
  Each note's text comes from its claim. A callout whose claim is not
  approved is not drawn; no placeholder. Status is not a callout: it belongs
  to the whole assembly, so it sits with the name in the close.
- **No dimension lines.** `product.dimensions` is pending. Dimension lines
  appear only once it is approved, and that is a separate change.
- **The close.** The product name in display type, the one-line overview
  (when approved), the status tag, and one primary link, "Open the product
  sheet", to the product page. "Talk to engineering" is already in the header,
  so it is not repeated here.

## Motion

- Desktop, motion allowed: the scene pins. Scroll moves the camera along the
  shaft from one blower wheel to the other at a fixed, slightly elevated
  side-on angle; the model does not rotate. Each callout draws its leader
  line and fades its note in as the camera reaches its part, and stays. The
  close (name, overview, link) comes in at the end of the travel. Scrolling
  back reverses cleanly.
- Phones: no pin. The motor sits whole in elevation across the width, the
  three notes are listed below it in shaft order, and the close follows.
- Reduced motion: no camera travel; the whole motor in elevation with every
  callout drawn and the close shown.
- Poster tier (no WebGL, Save-Data) and no-JS: a still of the same elevation
  with callouts drawn over it, and the close below. A new poster shot is
  needed if no existing still is side-on; it is rendered from the live stage
  like the others.

## Build constraints

- Same shared canvas and view as now; no new package.
- Callouts are real text in the DOM, positioned from projected points on the
  model, and read by screen readers in shaft order before the close.
- The scene is decorative to assistive tech except for the callout text and
  the close; it is no longer a focusable, rotatable image.
- Only approved claims are rendered (claims:check covers it).

## Acceptance check

1. At 1440 × 900 on `/`, scrolling into Portfolio pins the scene; the camera
   travels the length of the shaft with no rotation, the three callouts draw
   in order as their parts come into view, and the name, overview, status and
   "Open the product sheet" come in at the end. Scrolling back reverses.
2. No Explode, X-ray, balloons, parts list, spec table or drag on the home
   scene. The product page is unchanged.
3. Withholding the power-range claim removes that callout and leaves the
   others in place.
4. At 390 px: no pin; motor whole in elevation, notes listed below in shaft
   order, then the close. Reduced motion: whole motor, all callouts, no
   travel. Poster tier: still with callouts.
5. Screen reader reads the three notes in order (application, power range,
   retrofit), then the name, status and link. The link goes to `/products/fcu-double-shaft`.
6. ≈60 fps through the scrub; CLS 0. Build, typecheck, lint, tests and
   claims:check pass.
