# Phase 05 — 3D Core: Canvas, Stage, Model, Quality

**Status:** NOT_STARTED
**Depends on:** Phase 02, Phase 04
**Outputs:** `components/three/models/FcuDoubleShaft.tsx`, `components/three/{CanvasRoot,SceneView,LabStage,PartMesh,CameraRig,QualityTier,PosterFallback}.tsx`, `lib/store.ts`, `lib/quality.ts`

## Objective

Build the reusable 3D runtime: one persistent canvas shared by all scenes through drei `View`, a lit stage, a part-addressable product model, a damped camera rig, and automatic quality tiers with a non-WebGL fallback.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 05.1 | Zustand store: rig targets, explorer state, tier, visible views | NOT_STARTED |
| 05.2 | `CanvasRoot` (fixed, dynamic import, `frameloop="demand"`) + `SceneView` | NOT_STARTED |
| 05.3 | `LabStage` (environment rig, contact shadows, tone mapping) | NOT_STARTED |
| 05.4 | `FcuDoubleShaft` wrapper over gltfjsx output + `PartMesh` (assign presets, expose part refs) | NOT_STARTED |
| 05.5 | `CameraRig` (shot presets, maath damping, invalidate until settled) | NOT_STARTED |
| 05.6 | Quality detection, `PerformanceMonitor` step-down, `AdaptiveDpr` | NOT_STARTED |
| 05.7 | `PosterFallback` + WebGL failure boundary | NOT_STARTED |
| 05.8 | Drag-to-rotate with inertia (pointer + touch), wheel/pinch zoom limits | NOT_STARTED |

## Execution plan

1. **Store (05.1):** slices `rig` (shot id, progress values, explode amount, section t), `explorer` (see Phase 06), `quality` (tier), `views` (id → visible). Selectors only; no re-render of DOM on per-frame values.
2. **Canvas (05.2):** client component loaded via `next/dynamic({ ssr: false })` from the root layout; `position: fixed; inset: 0; pointer-events: none` with `eventSource` set to the document root so `View`s receive events. `SceneView` renders a DOM placeholder + `<View track={ref}>` and reports visibility via IntersectionObserver. Registration and observer live in effects so a page hidden by `<Activity>` unregisters its views (`architecture.md` §2.1). The `next/dynamic` call lives in a client wrapper (`ssr: false` is not allowed in Server Components).
3. **Stage (05.3):** consumes rig presets (Phase 04.4); `<Environment frames={1} resolution={256}>` with Lightformers; `ContactShadows frames={1}` re-baked only on explode change.
4. **Model (05.4):** wrapper `components/three/models/FcuDoubleShaft.tsx` uses the generated `GLTFResult` type and `useGLTF(url, true /* meshopt */)` with tier-based URL; preload high or low once tier is known. Renders parts declaratively from parts data using gltfjsx-extracted transforms. `PartMesh` maps slug → preset; registers `Object3D` refs in a part registry for explode/isolate/overlay. Wrap in `<Bvh>` for fast raycasts.
5. **Camera (05.5):** reads target shot from store; `easing.damp3`/`dampLookAt` per frame; calls `invalidate()` while delta > epsilon.
6. **Interaction (05.8):** custom rotation controller rotating the model group (not the camera) with inertia and damping; clamp polar angle; on touch, single-finger horizontal drag rotates while vertical drag scrolls the page (`touch-action: pan-y`); pinch zoom only inside the full explorer.
7. **Quality (05.6):** initial tier from `detectGPU`/device hints and `navigator.connection.saveData`; `PerformanceMonitor onDecline` steps down once and persists for the session.
8. **Fallback (05.7):** error boundary around the canvas; on WebGL failure or `poster` tier, `SceneView` renders the poster image with the same aspect and caption "Render of prototype assembly".

## Validation criteria

- [ ] One WebGL context for the whole site (`document.querySelectorAll("canvas").length === 1`) while 3+ views are mounted.
- [ ] Idle page renders 0 frames per second (Performance panel shows no rAF work from three when nothing moves).
- [ ] 60 fps on a mid-range laptop and ≥ 45 fps on a mid-range Android phone during rotate (record device and numbers in Status.md).
- [ ] Forcing WebGL off (`--disable-webgl`) shows posters and full content; no console errors.
- [ ] Drag-rotate works with mouse, touch and pen; page still scrolls vertically on touch.
- [ ] typecheck, lint, build pass. Status.md updated.
