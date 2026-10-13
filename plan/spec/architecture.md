# Architecture & Technical Decisions

Status: proposed. Changes to this file are logged in `plan/Status.md` → Decision log.

## 1. Stack (existing + to add)

Already in repo: Next.js 16.4 (App Router, `cacheComponents: true`, `partialPrefetching: true`), React 19.3, Tailwind CSS 4 (via `@tailwindcss/turbopack`), TypeScript 5, Biome 2.4.

To add (versions pinned at install time, Phase 01):

| Package | Purpose | Owns |
| --- | --- | --- |
| `three`, `@types/three` | Renderer | — |
| `@react-three/fiber` (v9, React 19) | React renderer for three | 3D scene graph |
| `@react-three/drei` | `useGLTF` (+ meshopt), `View`, `Environment`/`Lightformer`, `ContactShadows`, `Edges`, `Html`, `PerformanceMonitor`, `AdaptiveDpr`, `Bvh` | 3D helpers |
| `@react-three/postprocessing` | N8AO + SMAA on high tier only | Post |
| `maath` | Critically damped easing for camera and parts | 3D physicality |
| `zustand` | Small shared store (scroll progress, explorer state, quality tier) | Cross-boundary state |
| `gsap`, `@gsap/react` | ScrollTrigger, SplitText, timelines, `matchMedia` | Scroll choreography, headline reveals |
| `lenis` | Smooth scroll | Scroll input |
| `motion` (Framer Motion, `motion/react`) | UI state transitions, layout animations, gestures | Component-level UI motion |
| `animejs` (v4) | SVG line drawing (`createDrawable`), stagger on blueprint/process diagrams | 2D technical drawings |
| `@gltf-transform/cli`, `@gltf-transform/functions`, `meshoptimizer` (dev) | Model optimisation script | Asset pipeline |
| `gltfjsx` (dev) | Generates the typed R3F component (`<FcuDoubleShaftModel />`) from the optimised GLB | Model codegen |

### Library ownership rule

Each motion library owns one domain to prevent overlap and conflicting writes to the same property:

- **Lenis** produces scroll. **GSAP ScrollTrigger** consumes it and drives scroll-linked timelines and pinning. GSAP also owns headline reveals (SplitText).
- **Framer Motion** owns discrete UI state: menu, explorer panel, toggles, form states, hover/press.
- **React `<ViewTransition>`** owns route transitions and shared-element morphs between routes (see §2.1).
- **anime.js** owns SVG drawings: blueprint line art, dimension lines, process diagram.
- **R3F `useFrame` + maath** owns every per-frame 3D value. GSAP never tweens three objects directly; it tweens plain numbers in the store ("rig targets"), which `useFrame` damps toward. This keeps 3D motion physical and interruptible.

## 2. Next.js 16 specifics (verify in `node_modules/next/dist/docs/` before coding)

Read before Phase 01: `01-getting-started/05-server-and-client-components.md`, `11-css.md`, `13-fonts.md`, `14-metadata-and-og-images.md`, `02-guides/lazy-loading.md`, `keeping-pages-static.md`, plus the `cacheComponents` docs.

- Pages and section shells are Server Components that read static data and render semantic HTML (SEO, no-JS baseline).
- Interactive islands (`"use client"`) are small: smooth-scroll provider, canvas root, explorer controls, motion wrappers.
- The WebGL canvas is loaded with `next/dynamic` (`ssr: false`) from a client component, after first paint. LCP is the headline text, never the canvas.
- All routes are statically rendered (`generateStaticParams` for product slugs).

### 2.1 Findings from the Next.js 16.4 docs (Phase 00.3, 2026-10-13)

1. **Routes are kept alive with React `<Activity>`** (`02-guides/preserving-ui-state.md`). With `cacheComponents: true`, navigating away hides the previous page with `display: none` instead of unmounting it; up to 3 routes are kept. Effects (including `useGSAP` cleanup) run on hide and re-run on show. Consequences:
   - `ScrollScene` must build its ScrollTriggers in effects so they are reverted when the page hides and rebuilt (with `ScrollTrigger.refresh()`) when it shows. Never create triggers outside effects.
   - `SceneView` must unregister its drei `View` and visibility flag in effect cleanup; a hidden page's placeholder has a zero rect and must not keep rendering.
   - Transient UI (menu, explorer bottom sheet, tooltips) resets in a `useLayoutEffect` cleanup; deliberate state (explorer view, form drafts) may persist. Explorer state is URL-derived (search params) on the product page, which resets correctly by design.
   - Enquiry form: drafts persist (good); a success/error message resets in a `useLayoutEffect` cleanup, per the guide's pattern.
   - Page-level global styles (e.g. `data-env` on `<html>` for header ink) must be owned by React state, not left behind by a hidden page.
   - Lenis is in the root layout (never hidden); call `lenis.resize()` and `ScrollTrigger.refresh()` on route show.
   - End-to-end tests must use visibility-aware selectors (`getByRole`).
2. **Route transitions: React `<ViewTransition>`** (`02-guides/view-transitions.md`) works in the App Router with no configuration on React 19.3, including `addTransitionType` for direction and a reduced-motion recipe. Use it for route changes and for a shared-element morph (portfolio product title → product page heading) instead of Framer Motion `AnimatePresence`. The fixed canvas and header get their own `viewTransitionName` with the animation suppressed so they are not snapshotted. Unsupported browsers simply navigate without animation.
3. **`next/dynamic` with `ssr: false` is only allowed inside a Client Component** (`02-guides/lazy-loading.md`). `CanvasRoot` is therefore imported by a small client wrapper, which the server root layout renders.
4. **`useSearchParams` in a prerendered route** client-renders the tree up to the nearest `<Suspense>` (`04-functions/use-search-params.md`). Explorer deep links and `/contact?type=` read params inside a component wrapped in `Suspense`, so the rest of the page stays in the static HTML. In development this does not suspend, so verify with a production build.
5. **`export const ensureStatic = "navigation"`** (route segment config) makes the build fail if a route can't be fully static. Use it on `/`, `/products/[slug]` and `/contact`; dynamic routes then require `generateStaticParams()`.
6. **Fonts:** `next/font/google` includes only `wght` for variable fonts unless `axes` is passed (`02-components/font.md`). Use `axes: ["wdth"]` for Archivo and `axes: ["opsz"]` for Source Serif 4.
7. `partialPrefetching: true` is already on. Product and contact links can use `<Link prefetch={true}>` because both routes are fully static.

## 3. Directory structure

```
app/
  layout.tsx                 fonts, metadata base, providers, sheet frame
  page.tsx                   home: scene sequence
  products/[slug]/page.tsx   full product explorer + specs + FAQ
  contact/page.tsx           technical inquiry
  not-found.tsx, sitemap.ts, robots.ts, opengraph-image.tsx
  globals.css                Tailwind import + @theme tokens
components/
  ui/        Button, TextLink, Container, Grid, Rule, CentreLine, Annotation,
             Balloon, StatusTag, SpecTable, TitleBlock, Field
  layout/    SiteHeader, MenuOverlay, SiteFooter, SheetFrame
  motion/    SmoothScroll, ScrollScene, SplitHeadline, DrawPath, Reveal, useMotionPreference
  three/models/generated/  gltfjsx output (never hand-edited, regenerated by script)
  three/models/            hand-written wrappers, e.g. FcuDoubleShaft.tsx
  three/     CanvasRoot, SceneView, LabStage, ProductModel, PartMesh, ExplodedView,
             SectionPlane, TechnicalMaterials, SpecOverlay, CameraRig, QualityTier, PosterFallback
  explorer/  ProductExplorer, ExplorerControls, PartsList, explorer-machine.ts
  sections/  Hero, Blueprint, Portfolio, TechnicalEdge, Process, Leadership, Ecosystem, Inquiry
data/
  types.ts, claims.ts, company.ts, navigation.ts, products.ts, parts/fcu-double-shaft.ts,
  capabilities.ts, project.ts, process.ts, team.ts, recognition.ts, faq.ts, contact.ts
design/
  tokens.ts                  JS-side tokens: easings, durations, breakpoints, z-index
  three-presets.ts           materials, lighting rigs, camera shots, quality tiers
lib/
  gsap.ts                    plugin registration (client-only)
  store.ts                   zustand store
  quality.ts                 GPU/device tier detection
scripts/
  optimize-models.mjs        gltf-transform pipeline, then gltfjsx codegen
public/models/
  fcu-double-shaft.glb       high tier
  fcu-double-shaft.lod1.glb  mobile/low tier
public/posters/              pre-rendered stills for no-WebGL / reduced-data
```

## 4. Design tokens: single source per domain

- CSS tokens (colour, type, spacing, radii, borders, shadows) live in `app/globals.css` under `@theme` so Tailwind utilities are generated from them.
- Motion and 3D tokens live in `design/tokens.ts` and `design/three-presets.ts`. Easings are mirrored into CSS custom properties from one definition (small generated block or a single hand-maintained table checked in Phase 02).
- No raw hex, px or cubic-bezier values in components. Biome + a grep check in validation enforce it.

## 5. 3D architecture

### 5.1 One canvas, many views

A single fixed `<Canvas>` lives in the root layout (`CanvasRoot`). Each scene that needs 3D renders a DOM placeholder and a drei `<View>` that tracks it. Benefits: one WebGL context, shared GPU resources (the model is uploaded once), no context loss on mobile, scenes can share the same model instance across sections.

- `frameloop="demand"`; `invalidate()` on scroll, interaction and while damping is unsettled.
- Views outside the viewport are not rendered (View handles scissor; plus IntersectionObserver flag in store).

### 5.2 Model pipeline (Phase 04)

Source: `final_assembly-v1/final_assembly.gltf` (glTF-Transform 4.2.1 export): 18 nodes, 15 meshes, 8 placeholder materials, 0 textures, ≈51.8k triangles, 15 external `.bin` buffers (2.3 MB), world envelope ≈124 × 156 × 705 mm with the shaft on Z, no UVs. Full audit: `spec/model-audit.md`.

`scripts/optimize-models.mjs`:
1. Read gltf → rename nodes to stable slugs using a mapping table (filenames contain spaces and `&`).
2. Drop the `current camera` node (capture its transform first as a candidate camera shot).
3. `dedup`, `weld`, `prune`, merge buffers to one, `reorder`, `quantize`.
4. Keep every part as a separate mesh (required for explode/isolate). Do not `join`.
5. Compress with `EXT_meshopt_compression` → `fcu-double-shaft.glb` (target < 600 KB).
6. `simplify` (ratio tuned per part, coils and turbines get the strongest reduction) → `fcu-double-shaft.lod1.glb` (target < 250 KB, ≤ 20k tris).
7. Emit a report (sizes, triangle counts per part, bounding boxes) into `plan/spec/model-report.md`.

Materials are not taken from the file. `PartMesh` assigns a material preset by part slug from `data/parts/fcu-double-shaft.ts`.

### 5.2a Component codegen with gltfjsx

After optimisation, the script runs gltfjsx on the high-tier GLB to generate a declarative, typed R3F component:

```bash
npx gltfjsx public/models/fcu-double-shaft.glb --types --keepnames --keepgroups \
  --precision 6 --root public --output components/three/models/generated/FcuDoubleShaft.gen.tsx
```

- `--root` is the filesystem directory the URL is computed from (`public` → `/models/…`). `--precision 6` because node transforms carry quantisation scales and sub-millimetre offsets; the default 3 digits misplaces nested parts. The script patches the output for React 19 types (no global `JSX`) and exports `GLTFResult`, failing if gltfjsx output changes shape.
- **Codegen only: never `--transform`.** gltfjsx's transform joins compatible meshes and palette-joins materials by default (which would destroy part addressability) and compresses with Draco. Optimisation stays in the gltf-transform step with meshopt.
- `--keepnames` keeps our slug names, so the generated `GLTFResult` type has `nodes["rotor"]`, `nodes["stator"]` etc. as literal keys. A renamed or missing part becomes a type error.
- `--keepgroups` preserves the `windings` group (3 coil meshes).
- No `--instance`: the mirrored pairs (covers, blower wheels, clips) explode in opposite directions, so each stays its own mesh. Instancing is reconsidered only if the audit shows a real benefit.
- The generated file is treated as build output: committed for review, never edited by hand, overwritten on regeneration.
- `components/three/models/FcuDoubleShaft.tsx` is the hand-written wrapper. It imports the generated `GLTFResult` type and `useGLTF` path, then renders each part from parts data as `<PartMesh id geometry={nodes[slug].geometry} position rotation />`, using the transforms gltfjsx extracted. This keeps the declarative, readable structure of gltfjsx while material presets, explode offsets, refs and event handlers come from data.
- LOD1 has identical node names, so the same wrapper renders it by switching the URL. A script check asserts that both GLBs expose the same node set.

### 5.3 Part data model

```ts
type PartId =
  | "end-cover-front" | "end-cover-rear" | "mid-cover"
  | "stator" | "windings" | "rotor" | "rotor-magnet" | "shaft"
  | "blower-wheel-front" | "blower-wheel-rear"
  | "retaining-clip-front" | "retaining-clip-rear" | "mounting-stand";

interface PartSpec {
  id: PartId;
  nodeNames: (keyof GLTFResult["nodes"])[]; // typed from gltfjsx output; windings = 3 coil meshes
  label: string;                // public name, approved via claims register
  balloon: number;              // parts-list item number
  material: MaterialPresetId;
  explode: { axial: number; radial: number; order: number }; // metres along shaft / outward, sequence
  description?: ClaimRef;       // gated text
  group: "housing" | "electromagnetic" | "rotating" | "air-moving" | "mounting";
}
```

Explode offsets default from each part's centroid relative to the assembly centre (computed once on load), overridden by data where the default reads badly.

### 5.4 Explorer state machine

States: `assembled` → `exploded` → `isolated(partId)`; orthogonal render mode: `shaded | drawing | xray`; orthogonal `section: off | on(t)`. Implemented as a small reducer in `explorer-machine.ts`, exposed through the store. UI controls (Framer Motion), keyboard shortcuts and scroll timelines all dispatch the same actions.

### 5.5 Lighting & materials strategy

- Environment: built from drei `<Environment>` + `<Lightformer>` panels (key softbox, top strip, two rim strips) rendered once into a cube map. No downloaded HDR → zero bytes, full art control, consistent across scenes.
- One shadow-casting directional light only on high tier; otherwise baked `ContactShadows` (`frames={1}`) under the motor, re-rendered only on explode.
- Tone mapping: AgX (fallback ACES), sRGB output, exposure token per environment (Sheet vs Lab).
- Presets in `design/three-presets.ts`: `castAluminium`, `siliconSteel`, `enamelCopper`, `polishedSteel`, `magnetCoated`, `polymerBlack`, `galvanisedSteel`, plus technical `drawingSurface`, `xrayGhost`, `sectionCap`.
- Section plane: `material.clippingPlanes` per part + stencil cap mesh with hatch shader.

### 5.6 Quality tiers & progressive enhancement

| Tier | Detection | Model | DPR | Shadows | Post | Extras |
| --- | --- | --- | --- | --- | --- | --- |
| `high` | desktop GPU tier ≥ 2 | full | ≤ 2 | directional + contact | N8AO + SMAA | section cap hatch |
| `mid` | default | full | ≤ 1.5 | contact (baked) | none | — |
| `low` | mobile / tier 1 / `PerformanceMonitor` decline | LOD1 | 1 | contact (baked) | none | edges off in shaded mode |
| `poster` | no WebGL2, `Save-Data`, or failure | — | — | — | — | pre-rendered stills + full HTML content |

`PerformanceMonitor` can only step down during a session, never oscillate.

## 6. Scroll & motion integration

```ts
// lib/gsap.ts (client)
gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
// SmoothScroll provider
const lenis = new Lenis({ autoRaf: false });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

- Each scene is a `ScrollScene` (client) that builds its timeline inside `useGSAP` with scoped selectors and cleans up automatically.
- 3D-linked timelines write progress to `store.rig.*`; `CameraRig`/`ExplodedView` damp toward it.
- `gsap.matchMedia()` branches: desktop / touch / `prefers-reduced-motion`. Reduced motion disables Lenis, scrub and pinning; scenes render their end state.
- Mobile: no long pins with heavy scrub; shorter scenes; 3D explorer uses explicit controls instead of scroll-driven explode.

## 7. Content gating (PRD compliance)

Every public statement that the PRD flags as unverified is a `Claim` in `data/claims.ts`:

```ts
type ClaimStatus = "approved" | "pending" | "withheld";
interface Claim { id: string; text: string; status: ClaimStatus; qualifier?: "target" | "estimate" | "simulated" | "lab-result"; source?: string; }
```

- `<ClaimText id>` renders only `approved` claims in production. In development it also renders `pending` with a visible "pending approval" marker so the layout can be designed with real copy.
- A build-time check lists every pending claim in use, so launch readiness is measurable.
- Fallback for withheld specifications: "Contact engineering for current technical details" path (PRD §8.2).

## 8. Contact form

UI, validation, accessible states and value preservation are built in Phase 10 behind an `EnquiryTransport` interface. The transport implementation (Server Action + email, third-party endpoint, or mailto) is **deferred** by client decision (Phase 12). Until then the form must not claim a message was sent; it offers the direct email path.
