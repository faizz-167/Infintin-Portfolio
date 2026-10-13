# Design Direction — "The Drawing Set"

Status: refined by the Phase 00 reference study (2026-10-13, see `reference-study.md` §5); frozen in Phase 02. Changes from the study are marked *(00.5)*.

## 1. Concept

The website is Infintin's **drawing set**: a sequence of engineering sheets for one real object, the FCU Double Shaft Motor. Every scene is a "sheet" with a purpose (assembly, section, parts list, process, title block). The 3D model is not decoration floating in space. It is the subject of the drawing, and the page behaves like the instruments an engineer uses to understand it: section cuts, exploded views, balloons, dimension lines, a title block and a revision state.

The motor's geometry dictates the composition. It is a long, symmetrical, double-shaft assembly (≈705 mm overall including the two blower wheels, a 500 mm shaft, ≈124 mm across) with a blower wheel at each end. That gives us a **horizontal datum**: the shaft centreline. The centreline is the site's recurring structural line. It runs through the hero, becomes the axis of the exploded view, becomes the timeline of the development process, and finally becomes the rule that underlines the inquiry form.

What makes it unmistakable:

- Wide, horizontal, symmetrical compositions built around a shaft axis, instead of the usual centred "object floating over gradient".
- Real engineering notation used only where it carries information: part balloons that reference a parts list, dimension lines with real (approved) values, section hatching where a cut is actually shown, a title block that shows sheet number and revision/status.
- Two alternating environments create the "cuts" between scenes:
  - **Sheet** (light): warm drafting-vellum ground, graphite ink, line drawings, editorial text.
  - **Lab** (dark): graphite ground, the physical rendered motor under controlled studio light.
  The transition between them is a scroll-driven section cut (a clipping plane sweeping across the viewport), not a fade.

## 2. Things we explicitly will not do

- *(00.5)* Every reference site uses pill buttons, all-caps micro labels or multi-colour accents. We use none of them.

- No gradients-as-background, glassmorphism, neon glows, bloom, particle fields, or floating blobs.
- No pill-shaped "cards" grids. Radii are near zero; structure comes from rules and alignment.
- No eyebrow labels above every section. No all-caps micro-labels. No single highlighted word in a different colour/weight.
- No "big number + small label" stat rows. Numbers appear only when approved and only with their test condition.
- No ambient auto-rotating object on a pedestal.
- No sequential numbering unless the content is sequential (development process) or referential (part balloons ↔ parts list).

## 3. Colour

Small, opinionated palette. One accent, taken from the object itself: enamelled copper winding wire.

| Token | Role | Proposed value |
| --- | --- | --- |
| `--color-vellum` | Sheet ground | `#ECEAE3` |
| `--color-vellum-deep` | Alternate sheet surface, table zebra | `#E2DFD6` |
| `--color-graphite` | Ink on sheet / lab ground | `#141517` |
| `--color-graphite-raised` | Lab surface, panels | `#1D1F22` |
| `--color-lead` | Secondary ink, construction lines | `#6B6C6A` |
| `--color-rule` | Hairlines on sheet | `rgb(20 21 23 / 0.18)` |
| `--color-rule-lab` | Hairlines on lab | `rgb(236 234 227 / 0.14)` |
| `--color-copper` | The only accent: active state, live annotations, primary CTA | `#B5542C` |
| `--color-copper-lit` | Copper on dark ground (contrast-tuned) | `#D9774A` |
| `--color-status` | Prototype / lab-testing status mark (always paired with text) | `#C9A227` |

Rules: copper is used for state (active part, current process stage, focus, primary action), never for decoration. All text combinations must meet WCAG AA; final values verified in Phase 02.

## 4. Typography

One strong family plus one text face.

- **Archivo (variable: `wght` 100–900, `wdth` 62–125)** — display, UI, annotations and numerals. Omnibus-Type grotesque with nineteenth-century industrial roots. The width axis is the key: expanded widths for display headlines; condensed widths for annotations, balloons and spec tables. Width changes are also a motion device: the hero headline "machines" from condensed to expanded as the assembly locks together.
- **Source Serif 4 (variable, `opsz` 8–60)** — long-form text: positioning, project narrative, bios, FAQ. Optical sizing lets body copy, pull quotes and captions each use the correct cut. The serif gives the "editorial report" voice that separates Infintin from the usual sans-only tech site.
- Numerals: Archivo with `font-variant-numeric: tabular-nums` and `slashed-zero` in specification contexts.

Loaded through `next/font/google` as variable fonts with explicit axes. If the client later licenses a commercial face, only the font tokens change.

Scale (fluid, `clamp()`, ratio ≈1.333 on mobile to ≈1.5 on desktop):

| Token | Use | Family / width |
| --- | --- | --- |
| `display-xl` | Hero statement | Archivo, wdth 112–125, wght 500, tight tracking (−0.03em), leading 0.9 |
| `display-l` | Scene titles | Archivo, wdth 100–112, wght 500 |
| `display-m` | Sub-scene titles | Archivo, wdth 100, wght 500 |
| `lede` | Section introductions | Source Serif 4, opsz 36, wght 380 |
| `body` | Text | Source Serif 4, opsz auto, 17–19px, leading 1.5, measure 60–72ch |
| `caption` | Figure captions | Source Serif 4 italic, opsz 10 |
| `annotation` | Callouts, balloons, table heads | Archivo, wdth 75, wght 500, sentence case, +0.01em |
| `data` | Spec values | Archivo, wdth 87, tabular figures |

Headlines are active elements: set in two or three deliberate lines, broken by meaning, aligned to the grid's left edge or to the shaft axis, revealed with mechanical timing (mask wipe along the baseline, or width-axis "machining").

## 5. Layout and grid

- 12-column grid on desktop, 6 on tablet, 4 on mobile. Gutter `--space-gutter`; page margin `--space-margin` (16 px minimum on phones).
- **Sheet frame**: a hairline frame with a title block in the corner (sheet name, sheet number of total, status). It is the only persistent chrome besides navigation, and it updates as scenes change. Sheet numbers are genuinely sequential.
- Tension: rigid 12-column text and tables against broken-grid moments where the 3D object crosses the frame, or where a headline bleeds past the margin on the shaft axis.
- Vertical rhythm on an 8 px base; scene padding uses large tokens (`--space-scene`), deliberate negative space.

## 6. Components (visual language)

- **Rules** carry structure: 1 px hairlines, a 2 px "object line" for emphasis, dashed "centre lines" (long-short) for axes.
- **Buttons**: rectangular, 0–2 px radius, hairline border. Primary = copper fill, vellum text. Secondary = ink outline. Hover: a fill wipes along the baseline; arrows translate along the shaft axis. Minimum 44×44 px target.
- **Links**: underline as a 1 px rule offset 0.2em; on hover the rule is redrawn left to right.
- **Annotations / balloons**: circle + leader line + condensed label, anchored to a 3D part in screen space. Number = parts-list item number.
- **Status tag**: hatched swatch + text ("Prototype — under laboratory testing"). Never colour alone.
- **Spec table**: two columns, hairline rows, values in `data` style, every value carries a provenance note (target / simulated / lab result) when relevant.

## 7. Motion language

- Character: precise, weighted, mechanical. Things move like machined parts: fast acceleration, firm, damped stops, no bounce, no elastic.
- Easings (tokens): `ease-machine` `cubic-bezier(0.7, 0, 0.2, 1)`, `ease-settle` `cubic-bezier(0.16, 1, 0.3, 1)`, `ease-draw` `cubic-bezier(0.45, 0, 0.15, 1)`; springs for 3D damping only (critically damped).
- Durations (tokens): `instant 120ms`, `quick 240ms`, `base 480ms`, `scene 900ms`, `assembly 1600ms`.
- Signature moves:
  1. **Assembly lock** — hero: parts arrive along the shaft axis in assembly order and seat with a hard stop; the headline machines in sync.
  2. **Section sweep** — scene transitions: a clipping plane sweeps across the lab/sheet boundary, revealing the motor's internals as it passes.
  3. **Line draw** — blueprint drawings and dimension lines draw in with `ease-draw`, ticks after lines.
  4. **Explode on axis** — exploded view moves parts along the shaft first, radial second.
- Reduced motion: all signature moves become instant state changes; no scrubbing camera; the explorer keeps its explicit controls.

### 7.1 Additions from the reference study *(00.5)*

- **Type and object share depth.** On desktop the shaft centre line and the front blower wheel cross the hero H1; the H1 stays in the DOM (LCP, accessibility) and the canvas layer is depth-ordered above it only where the object overlaps.
- **Selection is drawn.** Isolating a part draws a dashed inspection frame with centre ticks around its screen-space bounds, plus its balloon number. No glow, no outline shader.
- **Staged in context.** In Sheet scenes the motor rests on its mounting stand with a faint centre line and a length scale. Scale numbers only appear if dimensions are approved; otherwise ticks only.
- **Direction change = new chapter.** On desktop, the development-process timeline and the axial explode scrub travel horizontally along the centre line; everything else scrolls vertically.
- **Headlines staggered on the grid.** Display lines sit in different real column spans (e.g. line 1 at columns 1–8, line 2 at 4–12), never centred.
- **Pinned scenes have one stable caption**: the title block and the active parts-list entry. No floating step cards.
- **Preloader is a drawing.** While the model loads, the hero draws the motor's elevation (centre line, outline, construction lines); the 3D takes over from it when ready.
- **Mobile keeps the idea.** Live 3D (LOD1) and the staggered headline remain on phones; scenes get shorter, not replaced. Display type ≈0.42× at 360 px, body never below 17 px, margins never below 16 px.
- **UI vs scene timing.** UI transitions ≤ 240 ms with `ease-settle`; only scenes use `scene` / `assembly` durations. No spring overshoot anywhere.

## 8. 3D look

- Look of a well-lit product photograph in a lab, not a game render: neutral studio light, real-world PBR values, soft contact shadow, no coloured lights.
- Material presets (replace CAD placeholder materials): cast aluminium covers (bead-blasted, rough 0.45), silicon-steel laminations (dark grey, slight anisotropy stack lines), enamelled copper windings (physical material + clearcoat), polished steel shaft, magnet (neutral dark grey, coating finish — no material claim), black glass-filled polymer for clips and stand, blower wheels in galvanised steel.
- Technical modes share one visual language with the 2D sheets: **Drawing** (vellum-coloured flat surfaces + ink edges), **X-ray** (fresnel ghost + copper edges on the isolated part), **Section** (clipping plane with hatched cap).
