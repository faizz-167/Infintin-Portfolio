# Infintin Redesign — Status

**Last updated:** 2026-10-14
**Current phase:** 13 in progress (inserted before 11); (05 device checks and 06 screen-reader check still open)
**Overall:** 8 / 12 active phases completed (Phase 12 deferred)

## Rules

- Status values: `NOT_STARTED`, `IN_PROGRESS`, `COMPLETED`, `BLOCKED`, `DEFERRED`.
- Before starting a subtask, mark it `IN_PROGRESS` in its phase file and here.
- After finishing, mark it `COMPLETED`.
- A phase becomes `COMPLETED` only when all its subtasks are `COMPLETED` **and** every validation criterion in the phase file is ticked.
- Update this file after any progress (subtask state, decision, blocker).

## Phases

| # | Phase | File | Depends on | Status | Subtasks done |
| --- | --- | --- | --- | --- | --- |
| 00 | Discovery, reference study & asset audit | [phase-00-discovery.md](phase-00-discovery.md) | — | COMPLETED | 5 / 5 |
| 01 | Project foundation | [phase-01-foundation.md](phase-01-foundation.md) | 00.3 | COMPLETED | 6 / 6 |
| 02 | Global design system | [phase-02-design-system.md](phase-02-design-system.md) | 00, 01 | COMPLETED | 10 / 10 |
| 03 | Static content layer & claim gating | [phase-03-content-layer.md](phase-03-content-layer.md) | 00.2, 01 | COMPLETED | 8 / 8 |
| 04 | 3D asset pipeline, materials & lighting | [phase-04-3d-pipeline.md](phase-04-3d-pipeline.md) | 00.4, 01 | COMPLETED | 7 / 7 (04.7 moved to 05) |
| 05 | 3D core: canvas, stage, model, quality | [phase-05-3d-core.md](phase-05-3d-core.md) | 02, 04 | IN_PROGRESS | 8 / 8 (device checks open) |
| 06 | Product explorer | [phase-06-product-explorer.md](phase-06-product-explorer.md) | 03.5, 05 | IN_PROGRESS | 9 / 9 (screen-reader check open) |
| 07 | Site shell & motion primitives | [phase-07-shell-motion.md](phase-07-shell-motion.md) | 02, 03 | COMPLETED | 9 / 9 |
| 08 | Home: Hero & Blueprint | [phase-08-home-hero.md](phase-08-home-hero.md) | 05, 06.2, 07 | COMPLETED | 6 / 6 |
| 09 | Home: remaining scenes | [phase-09-home-scenes.md](phase-09-home-scenes.md) | 06, 08 | COMPLETED | 9 / 9 |
| 10 | Product route & contact page (UI) | [phase-10-product-contact.md](phase-10-product-contact.md) | 03, 06, 07 | COMPLETED | 7 / 7 |
| 11 | A11y, responsive, performance, SEO, launch QA | [phase-11-quality-launch.md](phase-11-quality-launch.md) | 08, 09, 10 | NOT_STARTED | 0 / 8 |
| 12 | Enquiry delivery integration | [phase-12-enquiry-delivery.md](phase-12-enquiry-delivery.md) | 10.7 + client | DEFERRED | 0 / 5 |

Parallelisable after Phase 01: 02, 03 and 04 can run side by side; 07 can start once 02 and 03 are done, in parallel with 05–06.

## In progress

Phase 05 — 3D core. All subtasks built; open validation: fps on a mid-range Android phone, touch/pen drag on a real device, laptop rotate fps ≈53 (target 60).

Phase 06 — Product explorer. All subtasks built and checked on `/system/explorer`; open: NVDA or VoiceOver pass over the parts list and announcements.

Phase 07 — completed on the dev bench `/system/motion` (+ `/b`). Open for Phase 09: scene views are hidden under `[data-env]` backgrounds (see phase file notes).

## Blockers

None for Phases 00–11. Several claims and content items are pending client approval (see `spec/content-guardrails.md` §3); they do not block building because pending content is gated, but they block launch.

## Decision log

| Date | Decision | Source |
| --- | --- | --- |
| 2026-10-13 | PRD wins over the original brief: HVAC/FCU-first, prototype status shown, unverified claims gated. | Client |
| 2026-10-13 | Routes: cinematic single-scroll home + `/products/[slug]` + `/contact`. | Client |
| 2026-10-13 | Contact form delivery deferred; form UI built behind `EnquiryTransport`, never shows false success. | Client |
| 2026-10-13 | 3D source is `final_assembly-v1/final_assembly.gltf` (15 separate named meshes, 51,794 tris, 2.3 MB, no textures, no UVs, envelope ≈124 × 156 × 705 mm) — explode/isolate feasible; CAD materials replaced by presets. | Asset audit |
| 2026-10-13 | Design concept "The Drawing Set"; Archivo (wdth/wght) + Source Serif 4 (opsz); single copper accent; Sheet/Lab environments. Subject to Phase 00 refinement. | Proposal (`spec/design-direction.md`) |
| 2026-10-13 | One persistent R3F canvas with drei `View`s; meshopt-compressed GLB + LOD1; Lightformer environment (no HDR download). | Proposal (`spec/architecture.md`) |
| 2026-10-13 | Motion library ownership: Lenis = scroll input, GSAP = scroll choreography + headlines, Framer Motion = UI state, anime.js = SVG drawings, R3F/maath = per-frame 3D. | Proposal |
| 2026-10-13 | Use gltfjsx for model codegen (typed R3F component, `--types --keepnames --keepgroups`) on the gltf-transform/meshopt output. Never gltfjsx `--transform`: it joins meshes and uses Draco. Generated file is untouched build output; a hand-written wrapper maps parts data to nodes. | Client + plan |
| 2026-10-13 | Route transitions use React `<ViewTransition>` (built into React 19.3 + App Router) instead of Framer Motion; Framer Motion stays for in-page UI state. | Next 16 docs |
| 2026-10-13 | Reference-study additions: object crosses the hero H1 (shared depth); dashed inspection frame on isolate; motor staged on its stand with centre line and scale; horizontal travel for process timeline and axial explode; preloader is the motor's elevation drawing; live 3D kept on mobile. | Phase 00.1 (`spec/reference-study.md`) |
| 2026-10-13 | Assembly envelope ≈124 × 156 × 705 mm (corrected); no UVs in source, so finishes are procedural first. | Phase 00.4 (`spec/model-audit.md`) |
| 2026-10-13 | PRD is the source of truth over current-site content for all conflicts C1–C6. FCU power range confirmed 50 W to 250 W (`product.power-range` approved). Recognition list = PRD list (Startup TN, MSME dropped). | Client |
| 2026-10-13 | Phase 01 installed versions: next 16.4.0, react 19.3.0, three 0.186.1, @react-three/fiber 9.8.1 (peer react >=19 <19.4, OK), @react-three/drei 10.7.9, @react-three/postprocessing 3.2.0, maath 0.10.8, zustand 5.0.15, gsap 3.15.0, @gsap/react 2.1.2, lenis 1.3.26, motion 14.2.0, animejs 4.5.0; dev: @types/three 0.186.0, @gltf-transform/* 4.5.1, meshoptimizer 1.3.0, gltfjsx 6.5.3. | Phase 01.1 |
| 2026-10-13 | Model source lives at `assets-src/fcu-double-shaft/` and is committed (no LFS). | Client |
| 2026-10-13 | Apple-design principles folded into the Drawing Set: instant press response, interruptible critically damped springs for UI state, per-size tracking/leading, rem-based type, reduced-motion cross-fades, increased-contrast mode. No translucency, no system font, no bounce anywhere (including flicks). Phase 02 spec approved. | Client |
| 2026-10-13 | Palette tuned for AA: lead `#5E5F5D`, copper `#9C4522`, sheet status `#8A6A0C`; new `lead-lit` `#A3A4A0` for lab. Tailwind defaults cleared so tokens are the only styling path. | Phase 02 |
| 2026-10-13 | Sheet ground changed from cream vellum to cool paper `#EDF4FE`, graphite to `#14151A`; secondary inks re-tinted blue-grey (`lead` `#5A6170`, `lead-lit` `#A2A9B6`). Token `vellum` renamed `paper`. `reference-study.md` keeps the original values as a historical record. | Client |
| 2026-10-13 | Tailwind compiles via `@tailwindcss/postcss` (`postcss.config.mjs`); the `@tailwindcss/turbopack` loader rule is removed because Turbopack does not support CSS-transforming loaders (stale `globals.css` in dev). | Client |
| 2026-10-13 | Sheet ground changed to `#FAFAFA` (from `#EDF4FE`). `paper-deep` and the blue-grey secondary inks unchanged; all pairs still pass AA. | Client |
| 2026-10-13 | Light palette made neutral: `paper-deep` `#EDEDED`, `lead` `#5C5C5C`, increased-contrast `lead-strong` `#404040`. All 20 contrast pairs pass on `/system`. Lab-side inks unchanged. | Client |

| 2026-10-13 | Claim gating check searches rendered output and client chunks only, against a production-built noindex page `/system/claims`; server bundles hold the register by design. | Client |
| 2026-10-13 | Phase 04: 04.7 posters deferred to the end of Phase 05 (captured from the real `LabStage`, no headless renderer package). Model checks run on a dev-only `/system/model` page until Phase 05 replaces it. | Client |
| 2026-10-13 | Generated model component narrows `useGLTF` output with a runtime guard (`components/three/models/checkFcuModel.ts`: every part slug must be a Mesh) instead of `as GLTFResult`, which fails TS2352. No casts. | Client |
| 2026-10-13 | Part node names and material preset ids are literal unions in `data/types.ts` until Phase 04/05 generate them; winding meshes named `winding-slot`, `winding-end-front`, `winding-end-rear`. | Client |
| 2026-10-13 | Phase 05: initial tier from device hints only (no `detect-gpu`, which fetches benchmark tables from a CDN); runtime step-down via our own frame monitor, since drei `PerformanceMonitor` misreads `frameloop="demand"` idle time as low fps. | Client + Phase 05 |
| 2026-10-13 | Phase 05: explorer/explode/section store state deferred to Phase 06; zoom is a `SceneView` opt-in used only on the dev bench. Posters (04.7) captured from the live stage on `/system/model`. | Client |
| 2026-10-13 | Tier data lives in `design/quality-tiers.ts` (re-exported from `three-presets.ts`) so the root layout never bundles three.js. | Phase 05 |
| 2026-10-13 | Explorer state: explode and isolate are independent flags (isolate works assembled; clearing returns to the explode state). §5.4 updated. | Client |
| 2026-10-13 | Reducer tests run on `node --test` (no test runner package); `tsconfig` allows `.ts` import extensions. | Client |
| 2026-10-13 | Unapproved part names show as "Item N" in production. | Client |
| 2026-10-13 | `ProductExplorer` is a standalone component on dev-only `/system/explorer`; Phase 10 mounts it on the product route. | Client |
| 2026-10-13 | Section uses one shared stencil cap and per-material clipping; picking is our own raycast from DOM events. | Phase 06 |
| 2026-10-14 | Phase 07 tested on dev-only `/system/motion` and `/system/motion/b`; no stub product/contact routes. | Client |
| 2026-10-14 | Title block data comes from `ScrollScene` registration (name per scene, N = scenes on the page); no scenes data file until Phase 09. | Client |
| 2026-10-14 | Socials: empty typed list in `data/contact.ts`, footer hides it until the client supplies profiles. | Client |
| 2026-10-14 | `SectionSweep` drives a view's 3D section (`viewId`) as well as the 2D clip; Phase 09 tunes timing. | Client |
| 2026-10-14 | All internal links go through `RouteLink`, which derives `nav-forward`/`nav-back` from the route order home → product → contact. | Phase 07 |
| 2026-10-14 | Hero H1 copy is claim `home.headline`, approved as a placeholder; client supplies final copy. | Client |
| 2026-10-14 | Elevation drawing generated from the GLB (`npm run drawings:elevation`, hidden-line removal, no new package); typecheck ties it to the `elevation` shot. | Client |
| 2026-10-14 | Hero CTAs link to `/contact` and `/products/fcu-double-shaft`, which 404 until Phase 10. | Client |
| 2026-10-14 | Lab scenes with a live view set `data-ground="canvas"` so `[data-env]` stops painting over the canvas; the stage paints the ground. | Client |
| 2026-10-14 | The model never occludes the H1 (one fixed canvas under the page); the shaft passes behind the last lines. | Client |
| 2026-10-14 | Timelines drive explode progress directly via `lib/explodeDrive` (assembly lock, peek); `SceneView` gains `ownLoading` and `fixedShot`. | Phase 08 |
| 2026-10-14 | Home hero gets its own `home` shot: desktop as `hero`, phones roll the camera so the whole motor runs corner to corner. `hero.mobile` unchanged. Shots gain an optional `roll`. | Client |
| 2026-10-14 | Hero H1 is `display-l` from `lg` up so the headline sets in two lines at 1440; phones keep `display-xl`. | Client |
| 2026-10-14 | Explorer deep links: URL kept in sync with `replaceState` on every change, not only read on load. | Client |
| 2026-10-14 | While `contact.email` is pending, the not-connected form message offers copy only, no address. | Client |
| 2026-10-14 | Spec row label "Shaft" renamed "Output shafts" (collided with pending claim text in `claims:check`). | Phase 10 |
| 2026-10-14 | Claims approved per PRD: all except energy saving, payback, rare-earth wording, dimensions, converter efficiency and IP67 (pending), and "100% indigenously designed" (withheld; PRD §5 forbids absolute claims). 76 approved, 6 pending, 1 withheld. | Client |
| 2026-10-14 | Menu uses springs (§7.2) rather than `ease-settle` tweens; headline width machining ends at the style's own width, not a fixed 112. | Phase 07 |

## Open questions (client)

See `spec/content-guardrails.md` §3. Highest priority before Phase 03 content entry: rare-earth wording (model contains a magnet part; site uses three different terms), approved specs/dimensions, public part names, team degrees, recognition wording/logo permissions, AHU product status, legacy EV decision.

## Spec documents

- [spec/design-direction.md](spec/design-direction.md) — concept, colour, type, layout, motion, 3D look
- [spec/architecture.md](spec/architecture.md) — stack, structure, 3D/scroll architecture, tiers, gating
- [spec/content-guardrails.md](spec/content-guardrails.md) — brief vs PRD reconciliation, claims register, open questions
- [spec/reference-study.md](spec/reference-study.md) — principles from the four reference sites
- [spec/content-inventory.md](spec/content-inventory.md) — current infintin.in content, decisions, conflicts C1–C6
- [spec/model-audit.md](spec/model-audit.md) — CAD model parts, envelope, nesting, build implications

## Progress log

- 2026-10-13 — Implementation plan created (phases 00–12, three spec documents).
- 2026-10-13 — Plan updated: gltfjsx codegen added (architecture §5.2a, subtask 04.8, 05.4 reworded, Phase 01 dev dependency).
- 2026-10-13 — 00.4 completed: `spec/model-audit.md`. Corrected envelope to ≈124 × 156 × 705 mm (earlier figure ignored blower-wheel offsets); front/rear slug mapping fixed; clips renamed `retaining-clip-*`; no UVs in source.
- 2026-10-13 — 00.3 completed: findings in `spec/architecture.md` §2.1. Routes stay mounted under `<Activity>` (affects ScrollTrigger, Views, transient UI); route transitions move from Framer Motion to React `<ViewTransition>`; `ensureStatic = "navigation"` on all routes; `useSearchParams` readers wrapped in `Suspense`. Phase 05, 07, 10 plans updated.
- 2026-10-13 — 00.1 completed: `spec/reference-study.md` (4 sites at 1440 px, Mind Robotics also at 390 px; Lighthouse and 1024 px passes skipped as low value for principle extraction). 13 principles mapped to phases.
- 2026-10-13 — 00.2 completed: `spec/content-inventory.md`. Current site is a single anchor page (no legacy URLs to redirect). Six conflicts logged (C1–C6), incl. FCU power range 50–120 W on site vs 50–250 W in PRD. 17 new claim ids and 5 new client questions added to `content-guardrails.md`.
- 2026-10-13 — 00.5 completed: design direction §7.1 added; phases 06.3, 08.1, 08.2, 09.4, 11.7 updated with findings. **Phase 00 COMPLETED** — all 5 subtasks done, all validation criteria met.
- 2026-10-13 — Client decisions applied: conflicts C1–C6 resolved in favour of the PRD; `content-inventory.md`, `content-guardrails.md` updated.
- 2026-10-13 — Phase 01: 01.1, 01.3, 01.4, 01.5 completed; all validation checks pass. 01.2 (model move) and 01.6 (starter SVG deletion) blocked by the agent permission guard, need manual action.
- 2026-10-13 — **Phase 01 COMPLETED**: model renamed to `assets-src/fcu-double-shaft/`, starter SVGs removed. Phase 02 spec rewritten with Apple-design principles and approved; Phase 02 started.
- 2026-10-13 — **Phase 02 COMPLETED**: tokens, primitives, `/system` specimen with contrast table and motion bench; design-direction §3, §4, §7.2 updated.
- 2026-10-13 — Palette changed to cool paper `#EDF4FE` / graphite `#14151A`; secondary inks re-tuned; design-direction §1, §3, §6, §8 and phases 04/06 updated.
- 2026-10-13 — Dev CSS bug fixed: switched Tailwind to `@tailwindcss/postcss`, removed the `turbopack.rules` CSS loader; `globals.css` edits now hot-update in dev.
- 2026-10-13 — Light palette neutral: paper `#FAFAFA`, paper-deep `#EDEDED`, lead `#5C5C5C`, lead-strong `#404040`; contrast verified on `/system`.
- 2026-10-13 — **Phase 03 COMPLETED**: typed content in `data/`, 70-claim register (2 approved), `ClaimText`, `claims:report` and `claims:check`. Leak check not negatively tested (forcing a leak was blocked); typo ids fail typecheck.
- 2026-10-13 — Phase 04: 04.1–04.6 completed. High GLB 263 KB / 51,794 tris, LOD1 117 KB / 19,022 tris, deterministic, parity (names + transforms) checked. Presets in `design/three-presets.ts`; dev-only `/system/model` loads both GLBs with no console errors (only R3F's `THREE.Clock` deprecation warning). Lamination shader compiles but is hidden inside the housing until explode exists (Phase 06), so not yet judged by eye.
- 2026-10-13 — 04.8 completed: runtime guard replaces the cast; models:optimize deterministic, typecheck, lint, build and claims:check pass.
- 2026-10-13 — Phase 05: 05.1–05.8 built, plus 04.7 posters. One canvas with 4 views, 0 idle frames, no-WebGL posters, mouse drag with inertia, wheel zoom clamp, `<Activity>` hide/show all verified on `/system/model`. Rotate ≈53 fps on Intel Raptor Lake-P iGPU (1440×900, 1×). Android fps and real touch/pen drag not yet measured. Phase 04 marked COMPLETED.
- 2026-10-13 — Phase 06: 06.1–06.9 built. Verified on `/system/explorer`: reducer tests (7), explode/assemble with smooth interrupted reversal, isolate with ghosting, camera and inspection frame, shaded/drawing/X-ray with no shader relinks after first use, section with hatched cap at 5 cut positions and a draggable handle, occlusion-aware balloons on a rail, parts list linked both ways, keyboard shortcuts, reduced motion, phone layout. Screen-reader check pending (client). Found a pre-existing `Button` hydration mismatch for reduced-motion users (not fixed).
- 2026-10-14 — **Phase 07 COMPLETED**: header + menu, sheet frame with live title block, footer, `ScrollScene`, `SplitHeadline`, `DrawPath`, `Reveal`, `SectionSweep`, route wipe + product-name morph. Verified on `/system/motion`: stable trigger counts over 5 round trips, menu closed after back/forward, reduced-motion end states, CLS 0.00. Build, typecheck, lint, tests and claims:check pass. Found: scene views are hidden under `[data-env]` backgrounds (Phase 09 decision).
- 2026-10-14 — Phase 08: 08.1–08.5 built on `/`: assembly lock out of the generated elevation drawing, drag/hold/E peek, pinned elevation + section sweep into the Sheet with the drawing aligned to the 3D (≈1 px), Blueprint text. LCP = H1 (476 ms, Fast 4G + 4× CPU); sequence 1.51 s after model ready; poster and reduced-motion variants checked. Build, typecheck, lint, tests and claims:check pass. 08.6 open: phone framing.
- 2026-10-14 — **Phase 08 COMPLETED**: phone `home` shot (whole motor on a diagonal), "Drag to rotate" hint on phones, H1 two lines at 1440 (`display-l` from `lg`). Build, typecheck, lint, tests and claims:check pass. Real-device touch drag still unchecked.
- 2026-10-14 — Phase 09: 09.1–09.9 built on `/`: Portfolio (pinned scroll explode on desktop), Engineering (approach isolates, comparison, capabilities), Process (pinned horizontal travel), Project, Leadership, Recognition, Inquiry. Scenes without approved content are dropped in production (today: Project, Leadership, Recognition). Sweep reworked so live views show in Lab scenes. ≈59 fps full scroll, CLS 0. Build, typecheck, lint, tests and claims:check pass. Open: CTA targets (`/contact`, product route) arrive in Phase 10.
- 2026-10-14 — **Phase 10 COMPLETED**: `/products/fcu-double-shaft` (static, full-height explorer with URL-synced deep links, overview, spec sheet, controller, FAQ, CTAs) and `/contact` (channels, topics, enquiry form behind `EnquiryTransport`, not-connected transport). Unknown slug 404s. Keyboard-only form completion, error summary focus, preserved values and not-connected state checked on the production build; Lighthouse a11y 100 on both pages. Phase 09 CTA targets now resolve. Build, typecheck, lint, tests (11) and claims:check pass.
- 2026-10-14 — Phase 13 (inserted before 11, client request): letter swap on buttons and header links, cursor-proximity weight on the hero H1, stairs preloader on the first load of a session (lifts on model ready, held 0.8 s to 4 s, skipped for reduced motion). The hero elevation drawing is no longer the loading state; design-direction §7.1 revised. Build, typecheck, lint, tests (11) and claims:check pass. Reduced motion and no-JS were not checked in a browser.
