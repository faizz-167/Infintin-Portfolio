# Phase 03 — Static Content Layer & Claim Gating

**Status:** NOT_STARTED
**Depends on:** Phase 00 (00.2), Phase 01
**Outputs:** `data/*.ts`, `components/ui/ClaimText.tsx`, `scripts/check-claims.mjs`

## Objective

Model all site content as typed, local TypeScript data (no CMS, API or database), with PRD-mandated gating so unverified claims can never reach production by accident.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 03.1 | Define content types in `data/types.ts` | NOT_STARTED |
| 03.2 | Claims register in `data/claims.ts` + `ClaimText` renderer | NOT_STARTED |
| 03.3 | Company, navigation, contact data | NOT_STARTED |
| 03.4 | Product data: FCU Double Shaft Motor + specs + FAQ | NOT_STARTED |
| 03.5 | Parts data for the explorer (`data/parts/fcu-double-shaft.ts`) | NOT_STARTED |
| 03.6 | Capabilities, project, process (11 stages, ownership, current stage) | NOT_STARTED |
| 03.7 | Team and recognition/support data | NOT_STARTED |
| 03.8 | Pending-claims report script | NOT_STARTED |

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

- [ ] All content used by pages comes from `data/`; no hard-coded copy in section components (spot check + grep for long string literals in `components/sections`).
- [ ] A production build renders no `pending` or `withheld` claim text (verify by searching the `.next` output for 3 pending strings, e.g. "Up to 60%").
- [ ] Invalid claim or part id fails `npm run typecheck`.
- [ ] `claims:report` prints the full pending list.
- [ ] Status.md updated.
