# Phase 11 — Accessibility, Responsive, Performance, SEO & Launch QA

**Status:** NOT_STARTED
**Depends on:** Phases 08, 09, 10
**Outputs:** `app/{sitemap,robots,opengraph-image}.ts(x)`, JSON-LD, QA report `plan/spec/qa-report.md`

## Objective

Make the experience production-ready: excellent on desktop and mobile, accessible, reduced-motion aware, fast on lower-powered devices, correctly indexed, and compliant with every PRD acceptance criterion.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 11.1 | Accessibility audit (axe, keyboard, screen reader, contrast, focus) | NOT_STARTED |
| 11.2 | Reduced-motion and poster-tier full walkthrough | NOT_STARTED |
| 11.3 | Responsive QA: 360, 390, 768, 1024, 1440, 1920; iOS Safari, Android Chrome, Firefox, Safari | NOT_STARTED |
| 11.4 | Performance: bundle split, model preload strategy, GPU profiling, Lighthouse | NOT_STARTED |
| 11.5 | SEO: metadata, canonical, sitemap, robots, OG images, JSON-LD (Organization, Product only if accurate) | NOT_STARTED |
| 11.6 | Content QA against claims register and PRD §13 acceptance criteria | NOT_STARTED |
| 11.7 | Legacy URL redirects (if old EV pages are retired) | NOT_STARTED |
| 11.8 | Error, 404 and offline-asset states | NOT_STARTED |

## Execution plan

1. **A11y (11.1):** axe on every route and explorer state; keyboard-only run of full journey; NVDA + VoiceOver pass; verify `prefers-contrast` doesn't break; alt text for posters/photos.
2. **Motion (11.2):** OS reduced motion on: no pins, no scrub, no camera moves, instant states, Lenis off.
3. **Responsive (11.3):** real devices where possible (one iPhone, one mid-range Android); check touch rotate vs scroll conflict, safe-area insets, landscape phones.
4. **Performance (11.4):** budget: initial JS (excluding three chunk) < 150 KB gzip; three/R3F chunk lazy after first paint; model fetched with `fetchpriority` low until hero needs it; Lighthouse mobile Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100; LCP < 2.5 s, CLS < 0.05, INP < 200 ms; GPU memory stable after 10 explorer state cycles (heap snapshot).
5. **SEO (11.5):** titles/descriptions aligned to HVAC motors, FCU motors, motor controllers; canonical per route; sitemap of live routes only; OG images from posters.
6. **Content (11.6):** run `claims:report`; tick each PRD §13 criterion in `qa-report.md` with evidence.
7. **Redirects (11.7):** the current site is a single page with anchors only (`content-inventory.md`), so no redirects are expected. Check Google Search Console / `site:` results for any other indexed URLs before closing.

## Validation criteria

- [ ] All budgets in 11.4 met (numbers recorded in `qa-report.md`).
- [ ] axe: zero serious/critical issues; full keyboard journey possible.
- [ ] Every PRD §13 acceptance criterion marked pass with evidence, or explicitly listed as client-blocked.
- [ ] No console errors or warnings on any route in production build.
- [ ] Status.md updated.
