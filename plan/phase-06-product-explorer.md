# Phase 06 — Product Explorer: Explode, Isolate, Technical Modes, Spec Overlay

**Status:** NOT_STARTED
**Depends on:** Phase 03 (03.5), Phase 05
**Outputs:** `components/three/{ExplodedView,SectionPlane,TechnicalMaterials,SpecOverlay}.tsx`, `components/explorer/*`

## Objective

Deliver the centrepiece interaction: a precise, editorial explorer that lets an engineer take the FCU Double Shaft Motor apart along its shaft, isolate any part, switch to drawing or X-ray mode, cut a live section, and read a parts list linked to 3D balloons, without overwhelming the narrative.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 06.1 | Explorer state machine (`explorer-machine.ts`) + store binding | NOT_STARTED |
| 06.2 | `ExplodedView`: axial-first, radial-second sequenced explode | NOT_STARTED |
| 06.3 | Isolate: focus part, ghost others, camera to `isolate:<part>` | NOT_STARTED |
| 06.4 | Render modes: shaded / drawing / X-ray | NOT_STARTED |
| 06.5 | `SectionPlane`: draggable clipping plane with hatched cap | NOT_STARTED |
| 06.6 | `SpecOverlay`: balloons projected from part anchors, occlusion-aware | NOT_STARTED |
| 06.7 | `PartsList` (DOM) linked two-way with 3D hover/selection | NOT_STARTED |
| 06.8 | `ExplorerControls`: buttons, keyboard shortcuts, touch layout | NOT_STARTED |
| 06.9 | Accessibility: screen-reader equivalent and announcements | NOT_STARTED |

## Execution plan

1. **Machine (06.1):** states and actions per `architecture.md` §5.4 (`EXPLODE`, `ASSEMBLE`, `ISOLATE(id)`, `CLEAR`, `SET_MODE`, `TOGGLE_SECTION`, `SET_SECTION(t)`). Pure reducer, unit-tested.
2. **Explode (06.2):** per-part target from parts data (`explode.axial`, `explode.radial`, `order`); a single `explode` value 0→1 drives each part through its own staggered sub-range, so covers and blower wheels leave first along ±Z, then windings, rotor and magnet. Damped in `useFrame`; same API used by scroll timelines and buttons.
3. **Isolate (06.3):** selected part shaded; others switch to `xrayGhost`; camera moves to the computed shot; a dashed inspection frame with centre ticks is drawn around the part's projected bounds (SVG overlay, `design-direction.md` §7.1); clicking empty space or `Esc` clears.
4. **Modes (06.4):** swap materials by preset reference (no recompile per frame; materials created once and cached). Drawing mode uses drei `<Edges threshold>` in ink and flat vellum surfaces, visually matching the Sheet environment.
5. **Section (06.5):** one `THREE.Plane` along the shaft (cut perpendicular to X to show stator/rotor/magnet nesting); `localClippingEnabled`; stencil cap per part with hatch shader; draggable handle (DOM slider + 3D gizmo).
6. **Overlay (06.6):** anchor = part bbox point chosen per part in data; project to screen each frame only while visible; hide balloons whose anchor is occluded (raycast against BVH) or behind camera; collision-avoid labels on a vertical rail on desktop, list-only on mobile.
7. **Parts list (06.7):** `<ol>` with balloon numbers; hover/focus highlights 3D part; selecting isolates. Names come from claims (pending names show "pending" marker in dev only).
8. **Controls (06.8):** Framer Motion for panel/toggle transitions; shortcuts `E` explode, `X` X-ray, `D` drawing, `S` section, `Esc` reset, arrow keys rotate; mobile bottom sheet with 44 px targets.
9. **A11y (06.9):** canvas has `role="img"` + descriptive label; parts list is the accessible equivalent; `aria-live="polite"` announces state ("Exploded view", "Rotor isolated").

## Validation criteria

- [ ] Every state reachable by mouse, touch and keyboard alone; reducer tests pass.
- [ ] Explode → assemble interrupted midway reverses smoothly (no snapping).
- [ ] Section cap renders without z-fighting or gaps at 5 sampled cut positions.
- [ ] Balloon numbers always match parts list numbers; no balloon shown for an occluded anchor.
- [ ] Mode switches cause no shader recompilation hitch after the first use (Performance panel).
- [ ] Reduced motion: state changes are instant; no automatic camera moves.
- [ ] Screen reader (NVDA or VoiceOver) can navigate the parts list and hears state announcements.
- [ ] Status.md updated.
