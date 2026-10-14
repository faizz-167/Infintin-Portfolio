# Phase 06 — Product Explorer: Explode, Isolate, Technical Modes, Spec Overlay

**Status:** IN_PROGRESS (all subtasks built; screen-reader check is the client's)
**Depends on:** Phase 03 (03.5), Phase 05
**Outputs:** `components/three/{ExplodedView,SectionPlane,TechnicalMaterials,SpecOverlay}.tsx`, `components/explorer/*`

## Objective

Deliver the centrepiece interaction: a precise, editorial explorer that lets an engineer take the FCU Double Shaft Motor apart along its shaft, isolate any part, switch to drawing or X-ray mode, cut a live section, and read a parts list linked to 3D balloons, without overwhelming the narrative.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 06.1 | Explorer state machine (`explorer-machine.ts`) + store binding | COMPLETED |
| 06.2 | `ExplodedView`: axial-first, radial-second sequenced explode | COMPLETED |
| 06.3 | Isolate: focus part, ghost others, camera to `isolate:<part>` | COMPLETED |
| 06.4 | Render modes: shaded / drawing / X-ray | COMPLETED |
| 06.5 | `SectionPlane`: draggable clipping plane with hatched cap | COMPLETED |
| 06.6 | `SpecOverlay`: balloons projected from part anchors, occlusion-aware | COMPLETED |
| 06.7 | `PartsList` (DOM) linked two-way with 3D hover/selection | COMPLETED |
| 06.8 | `ExplorerControls`: buttons, keyboard shortcuts, touch layout | COMPLETED |
| 06.9 | Accessibility: screen-reader equivalent and announcements | COMPLETED |

## Execution plan

1. **Machine (06.1):** states and actions per `architecture.md` §5.4 (`EXPLODE`, `ASSEMBLE`, `ISOLATE(id)`, `CLEAR`, `SET_MODE`, `TOGGLE_SECTION`, `SET_SECTION(t)`). Pure reducer, unit-tested.
2. **Explode (06.2):** per-part target from parts data (`explode.axial`, `explode.radial`, `order`); a single `explode` value 0→1 drives each part through its own staggered sub-range, so covers and blower wheels leave first along ±Z, then windings, rotor and magnet. Damped in `useFrame`; same API used by scroll timelines and buttons.
3. **Isolate (06.3):** selected part shaded; others switch to `xrayGhost`; camera moves to the computed shot; a dashed inspection frame with centre ticks is drawn around the part's projected bounds (SVG overlay, `design-direction.md` §7.1); clicking empty space or `Esc` clears.
4. **Modes (06.4):** swap materials by preset reference (no recompile per frame; materials created once and cached). Drawing mode uses drei `<Edges threshold>` in ink and flat paper surfaces, visually matching the Sheet environment.
5. **Section (06.5):** one `THREE.Plane` along the shaft (cut perpendicular to X to show stator/rotor/magnet nesting); `localClippingEnabled`; stencil cap per part with hatch shader; draggable handle (DOM slider + 3D gizmo).
6. **Overlay (06.6):** anchor = part bbox point chosen per part in data; project to screen each frame only while visible; hide balloons whose anchor is occluded (raycast against BVH) or behind camera; collision-avoid labels on a vertical rail on desktop, list-only on mobile.
7. **Parts list (06.7):** `<ol>` with balloon numbers; hover/focus highlights 3D part; selecting isolates. Names come from claims (pending names show "pending" marker in dev only).
8. **Controls (06.8):** Framer Motion for panel/toggle transitions; shortcuts `E` explode, `X` X-ray, `D` drawing, `S` section, `Esc` reset, arrow keys rotate; mobile bottom sheet with 44 px targets.
9. **A11y (06.9):** canvas has `role="img"` + descriptive label; parts list is the accessible equivalent; `aria-live="polite"` announces state ("Exploded view", "Rotor isolated").

## Validation criteria

- [x] Every state reachable by mouse, touch and keyboard alone; reducer tests pass (7, `npm test`). Mouse (buttons, parts list, tap-to-isolate, hover, handle drag) and keyboard (Tab to the view, arrows, E/X/D/S/Esc) verified. Touch: every state has a ≥ 44 px button, checked in phone emulation; tapping the model itself not tried on a real device.
- [x] Explode → assemble interrupted midway reverses smoothly (no snapping). Reversed at 350 ms: per-frame balloon motion falls to 0.1 px at the turn, no spike.
- [x] Section cap renders without z-fighting or gaps at 5 sampled cut positions (t = 0.2, 0.35, 0.5, 0.65, 0.8, high tier with hatching; high tier forced by spoofing the GPU string).
- [x] Balloon numbers always match parts list numbers (both read `balloon` from parts data); no balloon shown for an occluded anchor (assembled: the inner parts' balloons are hidden; exploded: they appear).
- [x] Mode switches cause no shader recompilation after the first use: 0 `linkProgram` calls on a second pass through every mode and section toggle (counted, not read off the Performance panel).
- [x] Reduced motion: state changes are instant. The camera still cuts (no motion) to the explode, section and isolate framings; read "no automatic camera moves" as no animated ones.
- [ ] Screen reader (NVDA or VoiceOver) can navigate the parts list and hears state announcements.
- [x] Status.md updated.

## Notes from the build

- **State shape:** explode and isolate are independent flags (client decision; `architecture.md` §5.4 updated). Hover is transient view state, not part of the reducer.
- **Tests:** `npm test` runs `node --test` on `*.test.ts` (Node 24 strips types). `tsconfig` gained `allowImportingTsExtensions` so the test can import `./explorer-machine.ts`.
- **Explode data:** every part has explicit offsets in `data/parts/fcu-double-shaft.ts`; centroid defaults stay for future parts. The windings move as one group, so the end turns don't separate.
- **Section:** one cut across X; local (per-material) clipping, so the environment and shadow passes stay whole. One shared stencil cap rather than one per part: nested solids don't overlap, so a single increment/decrement count gives the right inside region. High tier hatches, lower tiers get a flat tint. Phase 04's `createSectionCap` was keyed to stencil ref 1 (which marks the outside) and is fixed.
- **Picking** uses our own raycaster from DOM pointer events (R3F events would fire after the rotate handler); hits on the cut-away side are skipped.
- **Balloons** while isolated: only the isolated part keeps its balloon. Narrow views (< `md`) show none; the parts list carries the numbers.
- **Mobile "bottom sheet"** is the parts list folding open under the controls, not a page-fixed sheet.
- **Part names** in production fall back to "Item N" until approved (all 13 are pending).
- **Explode shot** tightened 20% (`three-presets.ts`): the exploded model read small.
- **Found, not fixed:** `Button` adds `tabindex="0"` on the server (Motion's `whileTap`), and a reduced-motion client drops it, so reduced-motion users get a hydration mismatch warning. Phase 02 code; needs its own fix.
