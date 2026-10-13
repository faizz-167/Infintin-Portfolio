# Phase 09 — Home: Portfolio, Technical Edge, Process, Leadership, Ecosystem, Inquiry

**Status:** NOT_STARTED
**Depends on:** Phase 06, Phase 08
**Outputs:** `components/sections/{Portfolio,TechnicalEdge,Process,Leadership,Ecosystem,Inquiry}.tsx`, completed `app/page.tsx`

## Objective

Complete the home scene sequence (sheets 03–08), each a distinct "cut" with rhythmic continuity along the shaft centreline, moving qualified visitors from understanding to a technical inquiry.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 09.1 | Portfolio: FCU motor spotlight with embedded compact explorer | NOT_STARTED |
| 09.2 | Technical edge: engineering approach + qualitative comparison | NOT_STARTED |
| 09.3 | Engineering capabilities (within Technical edge or own sheet) | NOT_STARTED |
| 09.4 | Development process: 11-stage timeline on the shaft axis | NOT_STARTED |
| 09.5 | Project spotlight: "Development of an Indigenous Motor for Fan Coil Unit Application" | NOT_STARTED |
| 09.6 | Leadership | NOT_STARTED |
| 09.7 | Ecosystem: recognition & support | NOT_STARTED |
| 09.8 | Inquiry CTA scene | NOT_STARTED |
| 09.9 | Scene rhythm pass: transitions, spacing, sheet numbering, title block | NOT_STARTED |

## Execution plan

### 09.1 Portfolio (Lab)
1. Two-column: explorer view (assembled, drag, explode toggle, X-ray toggle) + `SpecTable` (power range, application, status; withheld rows show the contact-engineering fallback).
2. Scroll-scrubbed explode (desktop only) with balloons appearing as parts separate; parts list beside.
3. Link to `/products/fcu-double-shaft-motor` for the full explorer. Future products render from data only when approved (no empty slots).

### 09.2 – 09.3 Technical edge & capabilities (Sheet)
1. Engineering challenges and approach from the project data: magnet selection (approved wording only), low-core-loss laminations, copper fill factor, controller tuned on testbed data. Each pairs with a small 3D isolate of the relevant part (stator, windings, rotor) or an SVG detail drawing.
2. Comparison as a two-column qualitative table: "Typical imported EC motor supply" vs "Infintin approach" on supply chain, lead time, serviceability, application-specific design. No numbers unless approved with source.
3. Capabilities: motor design, motor control, power electronics, embedded systems, testing & validation, custom engineering, manufacturing coordination/DFM (partner involvement stated). Set as a typographic list on the grid, not cards.

### 09.4 Process (Sheet)
1. Horizontal timeline along the centre line (vertical on mobile), 11 numbered stages (sequential content justifies numbering). On desktop the scene pins and vertical scroll drives horizontal travel along the line (`design-direction.md` §7.1).
2. Current stage "Laboratory testing" marked in copper + text label; completed stages solid, upcoming dashed. Ownership (internal/external/unconfirmed) shown by line style with legend, hidden until the split is confirmed if the client prefers.
3. Line draws with `DrawPath` scrubbed by scroll; no stage is shown as complete unless data says so.

### 09.5 Project spotlight
1. Case-study layout: context, objective, challenges, approach, current status, next stage (approved milestones only). Explicit "active development project" note; no results section until results exist.

### 09.6 Leadership (Sheet)
1. Editorial bios in Source Serif with names in Archivo; portraits only if approved, treated in a consistent monochrome. Pending entries hidden in production.

### 09.7 Ecosystem (Lab)
1. Recognition and support as a precise register (year, programme, host, kind), logos only where permitted. Heading avoids "partners".

### 09.8 Inquiry CTA (Sheet)
1. Short statement + "Discuss a pilot" / "Talk to engineering" to `/contact` with enquiry type pre-selected via query param; direct email visible.
2. The shaft centre line terminates here as the rule under the CTA.

### 09.9 Rhythm pass
1. Review full scroll at 1440 and 390: alternating environments, sweep transitions, sheet numbers, spacing tokens, no two consecutive scenes with the same composition.

## Validation criteria

- [ ] Home order matches: Hero → Blueprint → Portfolio → Technical edge → Process/Project → Leadership → Ecosystem → Inquiry.
- [ ] Every CTA reaches `/contact` (or product page) and works without JavaScript.
- [ ] No pending/withheld claim visible in a production build; no numeric performance claim on the page.
- [ ] Numbering appears only in process stages and parts balloons.
- [ ] Full home scroll stays ≥ 55 fps on desktop reference machine; no layout shift during pins.
- [ ] Status.md updated.
