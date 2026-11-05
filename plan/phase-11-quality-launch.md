# Phase 11 — Accessibility, Responsive, Performance, SEO & Launch QA

**Status:** IN_PROGRESS
**Depends on:** Phases 08, 09, 10
**Outputs:** `app/{sitemap,robots,opengraph-image}.ts(x)`, JSON-LD, QA report `plan/spec/qa-report.md`

## Objective

Make the experience production-ready: excellent on desktop and mobile, accessible, reduced-motion aware, fast on lower-powered devices, correctly indexed, and compliant with every PRD acceptance criterion.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 11.1 | Accessibility audit (axe, keyboard, screen reader, contrast, focus) | IN_PROGRESS (NVDA/VoiceOver owed) |
| 11.2 | Reduced-motion and poster-tier full walkthrough | COMPLETED |
| 11.3 | Responsive QA: 360, 390, 768, 1024, 1440, 1920; iOS Safari, Android Chrome, Firefox, Safari | IN_PROGRESS (widths done in Chrome; devices and other browsers owed) |
| 11.4 | Performance: bundle split, model preload strategy, GPU profiling, Lighthouse | BLOCKED (JS budget and first-load LCP fail; decision needed) |
| 11.5 | SEO: metadata, canonical, sitemap, robots, OG images, JSON-LD (Organization, Product only if accurate) | COMPLETED (domain still a placeholder) |
| 11.6 | Content QA against claims register and PRD §13 acceptance criteria | BLOCKED (client) |
| 11.7 | Legacy URL redirects (if old EV pages are retired) | IN_PROGRESS (Search Console owed) |
| 11.8 | Error, 404 and offline-asset states | COMPLETED |

## Execution plan

1. **A11y (11.1):** axe on every route and explorer state; keyboard-only run of full journey; NVDA + VoiceOver pass; verify `prefers-contrast` doesn't break; alt text for posters/photos.
2. **Motion (11.2):** OS reduced motion on: no pins, no scrub, no camera moves, instant states, Lenis off.
3. **Responsive (11.3):** real devices where possible (one iPhone, one mid-range Android); check touch rotate vs scroll conflict, safe-area insets, landscape phones.
4. **Performance (11.4):** budget: initial JS (excluding three chunk and `noModule` polyfills) < 230 KB gzip (raised from 150 on 2026-11-05: React DOM + the Next runtime alone are ≈127 KB); three/R3F chunk lazy after first paint; model fetched with `fetchpriority` low until hero needs it; Lighthouse mobile Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100; LCP < 2.5 s, CLS < 0.05, INP < 200 ms; GPU memory stable after 10 explorer state cycles (heap snapshot).
5. **SEO (11.5):** titles/descriptions aligned to HVAC motors, FCU motors, motor controllers; canonical per route; sitemap of live routes only; OG images from posters.
6. **Content (11.6):** run `claims:report`; tick each PRD §13 criterion in `qa-report.md` with evidence.
7. **Redirects (11.7):** the current site is a single page with anchors only (`content-inventory.md`), so no redirects are expected. Check Google Search Console / `site:` results for any other indexed URLs before closing.

## Known issues going in

Found in a design review on 2026-11-05 (production build, 1440 × 900, `/`, product page, `/contact`). Fix or close each one inside the subtask named.

- **11.3 — Title block covers content.** The fixed sheet title block (bottom right) sits over page content on every route: the hero's "Explore the FCU motor" button and the Engineering "Our approach" paragraph on `/`, parts-list item 13 on the product page, the "Add technical details" row on `/contact`. Content must never sit under it, at any breakpoint.
- **11.3 — Labels escape their frame.** The "Render of prototype assembly" caption hangs outside the sheet frame on the home hero (left edge) and sits on the top frame line at the start of Engineering. The "Project spotlight · active development" label also sits on the frame line. Each caption stays inside the view or scene it belongs to.
- **11.6 — "Talk to engineering" three times on one screen.** On the Inquiry screen it is the header CTA, the secondary button and the footer headline. Propose one alternative for the client; client-blocked until approved.
- **11.6 — Repeated spec placeholder.** The product spec table shows "Contact engineering for current technical details" in five consecutive rows. Proposal: an em dash per empty row and one note under the table. Client-blocked until approved.
- **11.6 — Project headline in Title Case.** "Development of an Indigenous Motor for Fan Coil Unit Application" is the only headline not in sentence case. It is approved claim text, so the case change needs the client.
- **11.4 — npm audit.** `npm ci` reports 4 moderate findings. Review them; don't `audit fix --force` without asking.

## Validation criteria

- [x] Every item under "Known issues going in" fixed, or listed as client-blocked in `qa-report.md`.

- [ ] All budgets in 11.4 met (numbers recorded in `qa-report.md`). Recorded; initial JS on `/` (230.5 KB vs 230) and first-load LCP fail, Lighthouse Performance not measured.
- [x] axe: zero serious/critical issues; full keyboard journey possible.
- [ ] Every PRD §13 acceptance criterion marked pass with evidence, or explicitly listed as client-blocked. All marked; "performance checks" fails with 11.4.
- [ ] No console errors or warnings on any route in production build. No errors; one R3F `THREE.Clock` deprecation warning remains.
- [x] Status.md updated.
