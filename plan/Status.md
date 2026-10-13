# Infintin Redesign — Status

**Last updated:** 2026-10-13
**Current phase:** 01 in progress (01.2, 01.6 blocked on two manual file operations)
**Overall:** 1 / 12 active phases completed (Phase 12 deferred)

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
| 01 | Project foundation | [phase-01-foundation.md](phase-01-foundation.md) | 00.3 | IN_PROGRESS | 4 / 6 |
| 02 | Global design system | [phase-02-design-system.md](phase-02-design-system.md) | 00, 01 | NOT_STARTED | 0 / 9 |
| 03 | Static content layer & claim gating | [phase-03-content-layer.md](phase-03-content-layer.md) | 00.2, 01 | NOT_STARTED | 0 / 8 |
| 04 | 3D asset pipeline, materials & lighting | [phase-04-3d-pipeline.md](phase-04-3d-pipeline.md) | 00.4, 01 | NOT_STARTED | 0 / 8 |
| 05 | 3D core: canvas, stage, model, quality | [phase-05-3d-core.md](phase-05-3d-core.md) | 02, 04 | NOT_STARTED | 0 / 8 |
| 06 | Product explorer | [phase-06-product-explorer.md](phase-06-product-explorer.md) | 03.5, 05 | NOT_STARTED | 0 / 9 |
| 07 | Site shell & motion primitives | [phase-07-shell-motion.md](phase-07-shell-motion.md) | 02, 03 | NOT_STARTED | 0 / 9 |
| 08 | Home: Hero & Blueprint | [phase-08-home-hero.md](phase-08-home-hero.md) | 05, 06.2, 07 | NOT_STARTED | 0 / 6 |
| 09 | Home: remaining scenes | [phase-09-home-scenes.md](phase-09-home-scenes.md) | 06, 08 | NOT_STARTED | 0 / 9 |
| 10 | Product route & contact page (UI) | [phase-10-product-contact.md](phase-10-product-contact.md) | 03, 06, 07 | NOT_STARTED | 0 / 7 |
| 11 | A11y, responsive, performance, SEO, launch QA | [phase-11-quality-launch.md](phase-11-quality-launch.md) | 08, 09, 10 | NOT_STARTED | 0 / 8 |
| 12 | Enquiry delivery integration | [phase-12-enquiry-delivery.md](phase-12-enquiry-delivery.md) | 10.7 + client | DEFERRED | 0 / 5 |

Parallelisable after Phase 01: 02, 03 and 04 can run side by side; 07 can start once 02 and 03 are done, in parallel with 05–06.

## In progress

Phase 01: 01.2 (move model source) and 01.6 (delete starter SVGs) wait on manual file operations.

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
