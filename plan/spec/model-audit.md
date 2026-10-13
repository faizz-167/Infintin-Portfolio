# Model Audit — FCU Double Shaft Motor (`final_assembly-v1`)

Audited: 2026-10-13 (Phase 00.4). Source left untouched.

## 1. File

| Property | Value |
| --- | --- |
| File | `final_assembly-v1/final_assembly.gltf` + 15 external `.bin` buffers (one per mesh) |
| Generator | glTF-Transform v4.2.1 |
| Size | 2.3 MB total, uncompressed |
| Units / axes | Metres, Y up, shaft along Z, origin on the shaft axis at the centre of the stator |
| Scene | Root `final assembly` group (no transform) + `current camera` |
| Meshes / primitives | 15 / 15, all triangles (mode 4), each with its own material slot |
| Attributes | `POSITION`, `NORMAL` only. **No UVs, no textures, no animations** |
| Triangles | 51,794 total |
| Materials | 8 CAD placeholders (`color` × 6, `chromium plate`, `polished aluminum`), metalness 0, roughness 0.1–0.2. All will be replaced. |
| Filename hazards | Spaces and `&` in buffer and node names (`F&B cover-2.bin`) — renaming required |

## 2. Assembly envelope (world space)

**≈ 124 × 156 × 705 mm** (X × Y × Z).

- Z: 705 mm, driven by the two blower wheels (each 235 mm long, Ø124 mm) on either end of a 500 mm, Ø12 mm shaft. The shaft ends inside the blower wheels.
- Motor body (end cover to end cover): 131 mm long, Ø119 mm.
- Y: stand cradle reaches 94 mm below the axis; retaining clips reach 27 mm above it.

These are CAD envelope numbers, not approved specifications. Do not publish without approval (claims register `product.dimensions`).

## 3. Parts

World-space bounds in mm. "Twin" = identical vertex data to another part (same position hash).

| Source node | Proposed slug | Tris | Bounds X / Y / Z (mm) | Notes |
| --- | --- | --- | --- | --- |
| `F&B cover-3` | `end-cover-front` | 3,716 | ±59.5 / ±59.5 / 22.5 → 65.5 | Twin of `F&B cover-2` |
| `F&B cover-2` | `end-cover-rear` | 3,716 | ±59.5 / ±59.5 / −65.5 → −22.5 | Same mesh rotated 180° about Y |
| `mid cover-2` | `mid-cover` | 1,736 | ±52 / ±52 / ±32.5 | Housing sleeve around stator and end windings |
| `stator1-1` | `stator` | 1,444 | ±47.5 / ±47.5 / ±22.5 | Stack length 45 mm |
| `coil for max1-1` | `windings` → `winding-slot` | 1,056 | ±41 / ±41 / ±22.5 | Slot portion inside the stator |
| `coil for max2-2` | `windings` → `winding-end-front` | 11,032 | ±41 / ±41 / 22.5 → 32.9 | End turns; heaviest mesh |
| `coil for max3-2` | `windings` → `winding-end-rear` | 11,032 | ±41 / ±41 / −32.9 → −22.5 | End turns; mirror of max2 |
| `rotor1-1` | `rotor` | 2,276 | ±29 / ±29 / ±22.5 | |
| `magnet-1` | `rotor-magnet` | 1,248 | ±29.5 / ±29.5 / ±22.5 | Sits on the rotor surface (Ø59 vs rotor Ø58): surface-mounted magnet geometry |
| `shaft-1` | `shaft` | 104 | ±6 / ±6 / ±250 | Very low poly; smooth normals needed to read as round |
| `turbine-1` | `blower-wheel-front` | 5,072 | ±62 / ±62 / 117.5 → 352.5 | Twin of `turbine-2` |
| `turbine-2` | `blower-wheel-rear` | 5,072 | ±62 / ±62 / −352.5 → −117.5 | |
| `new clip-6` | `retaining-clip-front` | 532 | −51.2 → 53.2 / 1.9 → 27 / 45.5 → 65.5 | Twin of `new clip-7`; strap across the top of the end cover |
| `new clip-7` | `retaining-clip-rear` | 532 | −53.2 → 51.2 / 1.9 → 27 / −61.5 → −41.5 | |
| `new stand-2` | `mounting-stand` | 3,226 | ±50 / −94 → 0 / −61.5 → 65.5 | Cradle below the motor body |

"Front" = +Z by convention; engineering should confirm drive/non-drive end naming.

### Nesting (outside → in, along the radius at the stator)

`mid-cover` (Ø104) → `stator` (Ø95) → `windings` (Ø82) → air gap → `rotor-magnet` (Ø59) → `rotor` (Ø58) → `shaft` (Ø12).

None of the inner parts are visible in the assembled state. The explode must clear the end covers and mid cover before the stator, windings and rotor can be read; a section cut across X shows the whole radial stack at once.

## 4. Implications for the build

1. **Part addressability is good.** Every component is its own node, so explode, isolate, X-ray and the parts list are feasible without Blender work.
2. **Windings group.** Keep `coil assembly` as a group; treat its three children as one `windings` part in the parts list, but keep them separate so end turns can separate axially in the explode.
3. **Triangle budget.** The two end-winding meshes are 43% of all triangles. LOD1 should simplify them strongly (target ≈ 2–3k each); turbines next (≈ 2k each). Covers and stator need little reduction.
4. **Twins.** Covers, blower wheels and clips are identical meshes. `dedup` will share their geometry (smaller file) while nodes stay separate, which is what the opposite-direction explode needs. No `--instance` in gltfjsx.
5. **No UVs.** Image-based normal or roughness maps are not possible without UVs. Lamination lines, brushed and cast finishes must be procedural (triplanar or object-space shader chunks), or UVs must be generated in the pipeline. Phase 04.3 plans procedural first.
6. **Normals.** Exports have CAD-style hard-edged normals (vertex count 1.3–1.8× triangle count). Check silhouettes of the shaft and blower wheels; regenerate smooth normals on the shaft if it looks faceted.
7. **Camera.** The CAD `current camera` is orthographic (xmag 0.297, ymag 0.230) at (1.148, 0.230, 0.678) m looking at the assembly: a three-quarter view from the +X/+Z side, slightly above. Use it as the starting point for the `hero` and `elevation` shots; drop the node from the web GLB.
8. **Composition.** At 705 mm long × 124 mm across (≈ 5.7 : 1), the full assembly is very wide. Desktop hero framing works horizontally; on portrait phones, frame the motor body with the blower wheels cropped, or rotate the camera to a steep diagonal (Phase 08.6).
9. **Minor asymmetry.** Clips and stand are offset by ≈ 4 mm in Z (front clip 45.5 → 65.5, rear −61.5 → −41.5). Probably CAD placement; explode defaults computed from centroids will handle it.

## 5. Questions for engineering

1. Public names: are "end cover", "mid cover", "winding end turns", "rotor magnet", "blower wheel", "retaining clip" and "mounting stand" correct, and is "front" the drive end?
2. Is showing the internal rotor and magnet geometry acceptable from an IP point of view?
3. Can the overall envelope (≈ 124 × 156 × 705 mm with blower wheels) or the motor-body dimensions be published?
4. Are the blower wheels part of the product, or only shown for application context?
5. Is there a controller CAD model to add to the explorer?
6. Material and finish per part (cover casting, lamination grade, wheel material), for realistic rendering only — not to be published unless approved.
