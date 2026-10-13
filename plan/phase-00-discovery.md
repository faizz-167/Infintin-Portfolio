# Phase 00 — Discovery, Reference Study & Asset Audit

**Status:** COMPLETED (2026-10-13)
**Depends on:** —
**Outputs:** `plan/spec/reference-study.md`, `plan/spec/content-inventory.md`, `plan/spec/model-audit.md`, updates to `design-direction.md`

## Objective

Ground every later decision in evidence: extract principles (not assets) from the four reference sites, inventory the current infintin.in content against the PRD, read the Next.js 16 docs that change how we build, and audit the CAD model so the 3D explorer is designed around what the geometry actually supports.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 00.1 | Study reference sites with Chrome DevTools (principles only) | COMPLETED |
| 00.2 | Inventory current infintin.in content and map to PRD | COMPLETED |
| 00.3 | Read Next.js 16 docs relevant to this build | COMPLETED |
| 00.4 | Audit `final_assembly-v1` model (parts, scale, axes, topology) | COMPLETED |
| 00.5 | Refine design direction from findings; log decisions | COMPLETED |

## Execution plan

### 00.1 Reference study
1. For each of mindrobotics.com, litebox.ai, oryzo.ai, normalisboring.es, open in Chrome DevTools at 1440, 1024 and 390 px widths.
2. Capture per site: type families, sizes, leading, tracking (computed styles on h1, body, labels); grid (columns, margins, gutters); spacing rhythm; colour count and usage; border/rule treatment; button anatomy and states; navigation pattern; how 3D/product is introduced; scroll behaviour (pinning, scrub); transition timings and easings (Performance + Animations panels); responsive changes; Lighthouse snapshot.
3. Write each site as "principle → evidence → how Infintin applies it differently". Record what to avoid as well.
4. Do not save their screenshots, copy or assets into the repo.

### 00.2 Content inventory
1. Crawl infintin.in pages; list every piece of content (positioning, products, specs, founders, advisors, awards, contact, socials).
2. Tag each item: keep / rewrite for HVAC / archive (legacy EV) / drop, with PRD section reference.
3. Map each candidate public statement to a claim id in `content-guardrails.md`.

### 00.3 Next.js 16 docs
1. Read the files listed in `architecture.md` §2 from `node_modules/next/dist/docs/`.
2. Note API differences that affect: client islands under `cacheComponents`, `next/dynamic` with `ssr: false`, `next/font` variable axes, metadata/OG files, `LayoutProps`/`PageProps` helpers, static params.
3. Append findings to `architecture.md` §2.

### 00.4 Model audit
1. Load `final_assembly.gltf` in a scratch viewer (local three script or gltf.report). Confirm units (metres), up axis, shaft along Z, origin location.
2. For each of the 15 meshes: triangle count, bounding box, centroid, smooth vs faceted normals, inverted or duplicate geometry (F&B cover-2/-3, turbine-1/-2 and clip-6/-7 have identical buffer sizes: likely mirrored copies that can share geometry).
3. Identify parts nested inside others (magnet inside rotor, rotor inside stator, windings inside mid cover) to plan isolate and section views.
4. Record the `current camera` node transform as a candidate hero shot.
5. Write `model-audit.md` with the proposed slug mapping (`architecture.md` §5.3) and questions for engineering.

### 00.5 Consolidate
1. Update `design-direction.md` where findings change a decision (mark the change).
2. Log decisions in `Status.md`.

## Validation criteria

- [x] `reference-study.md` covers all 4 sites (typography, layout, colour, buttons, borders, nav, product presentation, motion, responsive), each tied to an explicit Infintin principle.
- [x] No third-party asset, copy or screenshot committed.
- [x] `content-inventory.md` lists every current-site item with a decision and claim id.
- [x] `model-audit.md` lists all 15 meshes with tri counts, bboxes, proposed slugs, duplicates and nesting notes.
- [x] Next.js doc findings appended to `architecture.md`.
- [x] Status.md updated.
