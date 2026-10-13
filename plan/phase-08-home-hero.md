# Phase 08 — Home: Hero & Engineering Blueprint Scenes

**Status:** NOT_STARTED
**Depends on:** Phase 05, Phase 06 (06.2), Phase 07
**Outputs:** `components/sections/{Hero,Blueprint}.tsx`, scroll choreography for sheets 01–02

## Objective

Create the first impression: an immediately interactive, cinematic 3D moment of the real FCU Double Shaft Motor that makes the HVAC focus and prototype status clear on the first screen, followed by the Blueprint scene that explains why Infintin is building it.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 08.1 | Hero layout: shaft-axis composition, H1, lede, CTAs, status tag | NOT_STARTED |
| 08.2 | "Assembly lock" entrance (3D parts seat along shaft + headline machining) | NOT_STARTED |
| 08.3 | Hero interaction: drag-to-rotate, hint affordance, explode peek on hold | NOT_STARTED |
| 08.4 | Hero → Blueprint section sweep (Lab → Sheet) | NOT_STARTED |
| 08.5 | Blueprint scene: elevation line drawing aligned to 3D, positioning text | NOT_STARTED |
| 08.6 | Mobile + reduced-motion variants | NOT_STARTED |

## Execution plan

### 08.1 Hero layout (Lab environment)
1. Full viewport; the motor lies horizontally across the viewport on the shaft centreline, slightly cropped by both edges (broken grid).
2. H1 set in `display-xl` across two lines above the shaft, lines staggered across real column spans (not centred); on desktop the shaft line and front blower wheel overlap the last line (canvas layered above the DOM H1 only where the object overlaps), e.g. "Motors and controllers, engineered for fan coil units" (final copy from approved positioning claim). Lede in Source Serif below the shaft, max 60ch.
3. `StatusTag` "Prototype — under laboratory testing" next to the lede (PRD: status visible from first screen).
4. Primary CTA "Talk to engineering", secondary "Explore the FCU motor".
5. LCP = H1 text, rendered server-side; canvas fades in after.

### 08.2 Assembly lock
1. On model ready: start exploded along Z (parts at explode = 1, offscreen at edges), GSAP timeline drives `rig.explode` 1 → 0 over `duration.assembly` with `ease-machine`; each part seats in assembly order (shaft → rotor/magnet → stator/windings → mid cover → end covers → blower wheels → stand/clips).
2. Headline lines rise in sync; the final line's `wdth` tweens 75 → 112 as the last part seats.
3. Preloader: until the model is ready, the hero shows the motor's SVG elevation drawing being drawn (`DrawPath`, centre line first, then outline and construction lines), aligned to where the 3D will appear; the assembly sequence starts from that drawing.
4. If the model is not ready within ~2.5 s, keep the finished drawing, then cross to the assembled model (or poster on `poster` tier) without the sequence.

### 08.3 Interaction
1. Drag rotates the model (Phase 05.8); a small centre-line handle with "Drag to rotate" (sentence case) fades after first interaction.
2. Press-and-hold (or keyboard `E`) shows a partial explode peek; release reassembles.

### 08.4 – 08.5 Blueprint (Sheet environment)
1. Scroll pins the hero; camera moves to `elevation` shot while a section plane sweeps across, switching the environment to Sheet.
2. The 3D model hands off to an SVG elevation drawing aligned to the same screen position (drawn with `DrawPath`), with centre line and overall length dimension only if dimensions are approved; otherwise no dimension values.
3. Text column: the problem (HVAC OEMs sourcing EC motors and controllers from import markets) and Infintin's approach (application-specific design, local sourcing and manufacturing partners), from claims.

### 08.6 Variants
1. Mobile: motor rotated to diagonal framing to fit portrait; shorter pin (≤ 1 viewport); explode peek via a toggle button.
2. Reduced motion: assembled state, no pin, static elevation drawing, no sweep.

## Validation criteria

- [ ] First screen states HVAC/FCU focus, prototype status and both CTAs at 390 × 844 and 1440 × 900 without scrolling.
- [ ] LCP element is the H1; LCP < 2.5 s on throttled "Fast 4G" mobile profile.
- [ ] Assembly sequence completes ≤ 2 s after model ready and never blocks scrolling or CTA clicks.
- [ ] 3D model and SVG elevation align within 4 px at handoff on desktop.
- [ ] Reduced-motion and poster-tier variants verified.
- [ ] Status.md updated.
