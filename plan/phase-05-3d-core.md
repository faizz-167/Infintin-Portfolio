# Phase 05 — 3D Core: Canvas, Stage, Model, Quality

**Status:** IN_PROGRESS (all subtasks built; fps on a real Android phone and touch/pen drag still to verify on device)
**Depends on:** Phase 02, Phase 04
**Outputs:** `components/three/models/FcuDoubleShaft.tsx`, `components/three/{CanvasRoot,SceneView,LabStage,PartMesh,CameraRig,QualityTier,PosterFallback}.tsx`, `lib/store.ts`, `lib/quality.ts`

## Objective

Build the reusable 3D runtime: one persistent canvas shared by all scenes through drei `View`, a lit stage, a part-addressable product model, a damped camera rig, and automatic quality tiers with a non-WebGL fallback.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 05.1 | Zustand store: rig targets, explorer state, tier, visible views | COMPLETED |
| 05.2 | `CanvasRoot` (fixed, dynamic import, `frameloop="demand"`) + `SceneView` | COMPLETED |
| 05.3 | `LabStage` (environment rig, contact shadows, tone mapping) | COMPLETED |
| 05.4 | `FcuDoubleShaft` wrapper over gltfjsx output + `PartMesh` (assign presets, expose part refs) | COMPLETED |
| 05.5 | `CameraRig` (shot presets, maath damping, invalidate until settled) | COMPLETED |
| 05.6 | Quality detection, `PerformanceMonitor` step-down, `AdaptiveDpr` | COMPLETED |
| 05.7 | `PosterFallback` + WebGL failure boundary | COMPLETED |
| 05.8 | Drag-to-rotate with inertia (pointer + touch), wheel/pinch zoom limits | COMPLETED |

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

- [x] One WebGL context for the whole site (`document.querySelectorAll("canvas").length === 1`) while 3+ views are mounted. (4 views on `/system/model`; the context also survives a route change and back.)
- [x] Idle page renders 0 frames per second. Measured by counting `drawElements` calls: 0 in 3 s idle, 0 after a flick settles, 0 while scrolling a page hidden by `<Activity>`. Not checked in the Performance panel.
- [ ] 60 fps on a mid-range laptop and ≥ 45 fps on a mid-range Android phone during rotate (record device and numbers in Status.md). Laptop: ≈53 fps (Intel Raptor Lake-P iGPU, 1440×900 at 1×, mid and high tier alike, synthetic drag) — below 60. Android: not measured.
- [x] Forcing WebGL off shows posters and full content; no console errors. Simulated by making `getContext("webgl*")` return null (the shared Chrome can't be relaunched with `--disable-webgl`).
- [ ] Drag-rotate works with mouse, touch and pen; page still scrolls vertically on touch. Mouse verified (drag, flick, settle). Touch and pen need a real device: synthetic events can't take pointer capture. `touch-action: pan-y` confirmed on the element.
- [x] typecheck, lint, build, claims:check pass. Status.md updated.

## Notes from the build

- **No explorer slice, explode amount or section t in the store.** Nothing in Phase 05 reads them; Phase 06 adds them with their consumers. Contact shadows re-bake when the environment changes, which is the only re-bake trigger for now.
- **Frame monitor is our own, not drei `PerformanceMonitor`.** drei's divides frames by wall time, so with `frameloop="demand"` an idle page reads as ~1 fps and would always step down. `QualityTier` only times back-to-back frames and steps down once if the median is under 40 fps.
- **Initial tier from device hints, no `detect-gpu`** (client decision): no WebGL2 / Save-Data / software renderer → poster; coarse pointer, < 4 GB or < 4 cores → low; NVIDIA/Radeon/Apple GPU → high; else mid.
- **Canvas behind the page.** `main` sits at `z-content` above the fixed canvas (`z-canvas`); a section must leave a view's placeholder unpainted for the 3D to show. DOM overlays inside a placeholder draw over the model.
- **three.js stays out of page bundles.** `SceneView` lazy-loads `SceneContent`; tier data moved to `design/quality-tiers.ts` (no three import) because Turbopack didn't tree-shake `three` out of `three-presets.ts`.
- **Tone mapping per view** is set in a frame callback that runs just before that view renders (children subscribe before drei's View container at the same priority).
- **Posters (04.7)** captured from the live high-tier stage at 2× on `/system/model`: `public/posters/fcu-double-shaft-{hero,elevation}-{lab,sheet}.webp`, 18–57 KB.
- **Caption "Render of prototype assembly"** is a plain string, not a claim: it restates the approved `product.status`. Move it to the register if the client wants it gated.
