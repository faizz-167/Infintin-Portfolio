# Phase 03 — Static Content Layer & Claim Gating

**Status:** COMPLETED
**Depends on:** Phase 00 (00.2), Phase 01
**Outputs:** `data/*.ts`, `components/ui/ClaimText.tsx`, `scripts/check-claims.mjs`

## Objective

Model all site content as typed, local TypeScript data (no CMS, API or database), with PRD-mandated gating so unverified claims can never reach production by accident.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 03.1 | Define content types in `data/types.ts` | COMPLETED |
| 03.2 | Claims register in `data/claims.ts` + `ClaimText` renderer | COMPLETED |
| 03.3 | Company, navigation, contact data | COMPLETED |
| 03.4 | Product data: FCU Double Shaft Motor + specs + FAQ | COMPLETED |
| 03.5 | Parts data for the explorer (`data/parts/fcu-double-shaft.ts`) | COMPLETED |
| 03.6 | Capabilities, project, process (11 stages, ownership, current stage) | COMPLETED |
| 03.7 | Team and recognition/support data | COMPLETED |
| 03.8 | Pending-claims report script | COMPLETED |

## Execution plan

### 03.1 Types
1. `Claim`, `ClaimStatus`, `ClaimQualifier` (`architecture.md` §7).
2. `Product` (slug, name claim, overview, status, application, specs: `SpecRow[]`, features, controller, faq, modelRef, posterRefs, cta).
3. `SpecRow` (label, value claim | `"withheld"`, unit, qualifier, testCondition?).
4. `PartSpec` (`architecture.md` §5.3), `Capability`, `ProcessStage` (id, name, owner: internal | external | shared | unconfirmed, state: complete | current | upcoming), `TeamMember`, `Recognition` (kind: award | support | grant), `NavItem`, `ContactChannel`.
5. Use `as const satisfies` so ids are literal unions and typos fail typecheck.

### 03.2 Claims
1. Enter every row from `content-guardrails.md` §2.
2. `ClaimText` (server component): production renders `approved` only, returns fallback (or nothing) otherwise; development renders `pending` with a dashed outline and "pending approval" note.
3. Helper `getClaim(id)` throws at build time for unknown ids.

### 03.3 – 03.7 Data files
1. Populate from the content inventory. Every unverified field references a claim id rather than raw text.
2. Process: the 11 PRD stages in order; `Laboratory testing` = `current`; ownership `unconfirmed` for 3D modelling & simulation until resolved.
3. Recognition is support/recognition only; no `partner` kind exists in the type.
4. Team entries default to `pending`; photos optional.
5. Legacy EV products: only if the client chooses "archive", as `status: "archived-rnd"`, never in the product journey.

### 03.8 Report
1. `scripts/check-claims.mjs` lists pending/withheld claims referenced by pages; runs as `npm run claims:report`.

## Validation criteria

- [x] All content used by pages comes from `data/`; no hard-coded copy in section components (spot check + grep for long string literals in `components/sections`). *`components/sections` is still empty; re-check in Phases 08–10.*
- [x] A production build renders no `pending` or `withheld` claim text. `npm run claims:check` searches prerendered HTML/RSC and client chunks (server bundles hold the register by design) against `/system/claims`, a noindex page that builds in production, with a positive control for the approved sample.
- [x] Invalid claim or part id fails `npm run typecheck`.
- [x] `claims:report` prints the full pending list.
- [x] Status.md updated.

## Outcome (2026-10-13)

- `ModelNodeName` and `MaterialPresetId` are hand-written literal unions until Phase 04 emits `GLTFResult`; Phase 05 swaps `ModelNodeName` for `keyof GLTFResult["nodes"]`.
- `SpecRow` has no `qualifier`: provenance lives on the claim so a figure and its qualifier are approved together.
- `PartSpec.explode` offsets are optional overrides (defaults come from centroids, architecture §5.3); only `order` is required.
- FAQ answers, project fields and team name/role are claims of their own (drafted, pending). `Copy = string | ClaimRef` is used where editorial copy and claims mix (capabilities).
- Legacy EV and AHU content not modelled: client has not chosen "archive" (open questions 9, 13).
- `ClaimText` never renders `withheld`, even in development (shows the fallback plus a marker).
