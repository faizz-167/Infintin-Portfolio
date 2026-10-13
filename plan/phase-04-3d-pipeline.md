# Phase 04 — 3D Asset Pipeline, Materials & Lighting Presets

**Status:** IN_PROGRESS (all active subtasks done; awaiting commit, 04.7 deferred)
**Depends on:** Phase 00 (00.4), Phase 01
**Outputs:** `scripts/optimize-models.mjs`, `public/models/*.glb`, `components/three/models/generated/FcuDoubleShaft.gen.tsx`, `design/three-presets.ts`, `plan/spec/model-report.md`, `public/posters/*`

## Objective

Convert the CAD export into fast, web-ready, part-addressable models, and define the material, lighting, camera and quality presets that give the motor its "lab photograph" look.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 04.1 | Node rename map + optimisation script (meshopt, quantise, single buffer) | COMPLETED |
| 04.2 | LOD1 generation for low tier | COMPLETED |
| 04.3 | Material presets (product + technical modes) | COMPLETED |
| 04.4 | Lighting rigs: Sheet and Lab environments via Lightformers | COMPLETED |
| 04.5 | Camera shot presets (hero, explode, section, isolate per part) | COMPLETED |
| 04.6 | Quality tier definitions | COMPLETED |
| 04.7 | Pre-rendered poster stills for fallback | DEFERRED |
| 04.8 | gltfjsx codegen: typed R3F component + node-parity check | COMPLETED |

## Execution plan

### 04.1 Optimisation script
1. Mapping table (source → slug): `F&B cover-3` → `end-cover-front`, `F&B cover-2` → `end-cover-rear`, `mid cover-2` → `mid-cover`, `stator1-1` → `stator`, `coil assembly` → `windings` group with children `coil for max1-1` → `winding-slot`, `coil for max2-2` → `winding-end-front`, `coil for max3-2` → `winding-end-rear` (names fixed by `ModelNodeName` in `data/types.ts`), `rotor1-1` → `rotor`, `magnet-1` → `rotor-magnet`, `shaft-1` → `shaft`, `turbine-1/-2` → `blower-wheel-front/rear`, `new clip-6/-7` → `retaining-clip-front/rear`, `new stand-2` → `mounting-stand`. Front = +Z, confirmed from world bounds in `spec/model-audit.md` §3; final naming pending engineering.
2. gltf-transform pipeline: rename → remove `current camera` (store transform in presets) → `dedup` → `instance` mirrored duplicates if beneficial → `weld` → `prune` → merge buffers → `reorder` → `quantize` → `meshopt` → write `.glb`.
3. Never join meshes; part addressability is required.
4. Emit `model-report.md`: size, triangles per part, bbox per part.

### 04.2 LOD1
1. `simplify` per part: aggressive on windings and blower wheels (largest buffers), light on covers.
2. Target ≤ 20k triangles, < 250 KB. Visually compare silhouettes at mobile size.

### 04.3 Materials
1. `MeshPhysicalMaterial` presets in `design/three-presets.ts` (`design-direction.md` §8): colour, metalness, roughness, clearcoat, anisotropy where relevant.
2. Lamination stack detail on stator/rotor: small tiling procedural normal (generated texture or shader chunk); no large texture downloads. If textures are added later, use KTX2.
3. Technical presets: `drawingSurface` (flat paper + `Edges` in ink), `xrayGhost` (fresnel, transparent, depthWrite off), `sectionCap` (stencil cap with 45° hatch shader).
4. Part → preset map lives in parts data (Phase 03.5), not in components.

### 04.4 Lighting
1. Lab rig: dark ground, key softbox (large rect Lightformer, upper left), top strip, two thin rim strips behind; AgX tone mapping; exposure token.
2. Sheet rig: same layout, higher ambient, lower contrast so the model reads against the paper ground.
3. Rigs are data (positions, intensities, scales) consumed by one `LabStage` component.

### 04.5 Cameras
1. Shot presets: `hero` (three-quarter, low, long lens ~35° fov to flatten perspective like a technical photo), `elevation` (orthographic-like side view along X, used for blueprint alignment), `explode`, `section`, `isolate:<part>` (computed from part bbox).
2. Each shot = position, target, fov, plus mobile override.

### 04.6 Quality tiers
1. Encode the tier table from `architecture.md` §5.6 as data.

### 04.7 Posters
**Deferred to the end of Phase 05** (client, 2026-10-13): captured from the real `LabStage` via Chrome DevTools, no headless renderer package.

1. Render hero, exploded and section stills (headless three script or manual capture from the Phase 05 stage) at 1x/2x, AVIF + WebP, for `poster` tier and OG images. Label as renders.

### 04.8 gltfjsx codegen
1. Last step of `models:optimize`: run gltfjsx on the high-tier GLB with `--types --keepnames --keepgroups --root /models/` (see `architecture.md` §5.2a). Never `--transform`.
2. Output to `components/three/models/generated/FcuDoubleShaft.gen.tsx`; format with Biome; excluded from lint rules that conflict with generated code.
3. Node-parity check: assert that the LOD1 GLB has exactly the same node names as the high GLB; fail the script otherwise.
4. Write the `FcuDoubleShaft.tsx` wrapper skeleton in Phase 05.4 against the generated `GLTFResult` type.

## Validation criteria

- [x] `npm run models:optimize` is deterministic and produces both GLBs from the untouched source.
- [x] High GLB < 600 KB; LOD1 < 250 KB and ≤ 20k triangles; all 13 part slugs present as separate nodes in both.
- [x] Model loads with drei `useGLTF` + meshopt decoder without console errors.
- [x] Every part has a material preset; no source CAD materials are rendered.
- [x] Generated component typechecks; `GLTFResult["nodes"]` contains all part slugs; rerunning the script produces no diff.
- [x] Node-parity check passes for high and LOD1.
- [ ] `model-report.md` committed. Status.md updated.
