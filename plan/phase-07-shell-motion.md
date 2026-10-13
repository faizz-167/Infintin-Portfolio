# Phase 07 — Site Shell & Motion Primitives

**Status:** NOT_STARTED
**Depends on:** Phase 02, Phase 03
**Outputs:** `components/layout/*`, `components/motion/{ScrollScene,SplitHeadline,DrawPath,Reveal,useMotionPreference}.tsx`

## Objective

Build the persistent frame of the drawing set (header, menu, sheet frame with title block, footer) and the reusable motion primitives every scene uses, each tied to one library per the ownership rule.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 07.1 | `SiteHeader` + `MenuOverlay` (Framer Motion), focus trap, Esc | NOT_STARTED |
| 07.2 | `SheetFrame` + live `TitleBlock` (current scene, sheet n of N, status) | NOT_STARTED |
| 07.3 | `SiteFooter` with CTA, contact channels, socials | NOT_STARTED |
| 07.4 | `ScrollScene` (GSAP + ScrollTrigger wrapper, matchMedia branches) | NOT_STARTED |
| 07.5 | `SplitHeadline` (SplitText mask wipe + Archivo width "machining") | NOT_STARTED |
| 07.6 | `DrawPath` (anime.js `createDrawable` line drawing, ticks after lines) | NOT_STARTED |
| 07.7 | `Reveal` (Framer Motion `whileInView`, minimal) + `useMotionPreference` | NOT_STARTED |
| 07.8 | Section-sweep environment transition (Sheet ↔ Lab) | NOT_STARTED |
| 07.9 | Route transitions with React `<ViewTransition>` (home ↔ product ↔ contact) | NOT_STARTED |

## Execution plan

1. **Header (07.1):** wordmark left, three destinations (Product, Engineering, Contact) + "Talk to engineering" primary button. Header ink adapts to current environment via `data-env` of the section under it. Menu on mobile: full-screen sheet, links staggered with `ease-settle`, focus trapped, scroll locked through Lenis `stop()`.
2. **Sheet frame (07.2):** hairline inset frame, desktop only; title block bottom-right updates when a scene's ScrollTrigger enters (scene metadata from data). Hidden on mobile to free space; the scene name moves into the header.
3. **ScrollScene (07.4):** props: `id`, `pin`, `scrub`, `build(tl, ctx)`; internally `useGSAP` scoped to a ref; `gsap.matchMedia` with `desktop`, `touch`, `reduce` conditions; in `reduce` builds no timeline and applies end state.
4. **SplitHeadline (07.5):** lines split by `SplitText` with `mask: "lines"`; lines rise from the baseline in sequence; optional `wdth` tween from 75 → 112 synced to a 3D event (assembly lock). Preserve accessible text (`aria-label` on parent, splits `aria-hidden`).
5. **DrawPath (07.6):** anime.js v4 `svg.createDrawable` on blueprint SVG paths; triggered by ScrollTrigger `onEnter` or scrubbed by progress.
6. **Section sweep (07.8):** a clip-path wipe of the incoming environment synchronised with the 3D `SectionPlane` passing through the model, so the 2D cut and 3D cut read as one gesture.
7. **Route transitions (07.9):** React `<ViewTransition>` + `addTransitionType` (no Framer Motion here; `architecture.md` §2.1): a short wipe along the shaft axis (≤ 480 ms) and a shared-element morph of the product name; canvas and header excluded from snapshots; reduced-motion recipe from the guide. Because routes are kept alive by `<Activity>`, rebuild ScrollTriggers and call `lenis.resize()` when a page becomes visible.

## Validation criteria

- [ ] Menu and header fully keyboard-accessible; focus returns to trigger on close.
- [ ] Each motion primitive has a reduced-motion path rendering the final state.
- [ ] No two libraries animate the same property of the same element (code review against ownership rule).
- [ ] ScrollTriggers are reverted when a page is hidden by `<Activity>` and rebuilt when shown (no duplicate triggers after 5 navigations; check `ScrollTrigger.getAll().length`).
- [ ] Menu is closed when returning to a page via back/forward.
- [ ] CLS < 0.05 with headline splitting (fonts loaded before split; split on `document.fonts.ready`).
- [ ] Status.md updated.
