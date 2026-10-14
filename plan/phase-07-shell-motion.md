# Phase 07 — Site Shell & Motion Primitives

**Status:** COMPLETED
**Depends on:** Phase 02, Phase 03
**Outputs:** `components/layout/*`, `components/motion/{ScrollScene,SplitHeadline,DrawPath,Reveal,useMotionPreference}.tsx`

## Objective

Build the persistent frame of the drawing set (header, menu, sheet frame with title block, footer) and the reusable motion primitives every scene uses, each tied to one library per the ownership rule.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 07.1 | `SiteHeader` + `MenuOverlay` (Framer Motion), focus trap, Esc | COMPLETED |
| 07.2 | `SheetFrame` + live `TitleBlock` (current scene, sheet n of N, status) | COMPLETED |
| 07.3 | `SiteFooter` with CTA, contact channels, socials | COMPLETED |
| 07.4 | `ScrollScene` (GSAP + ScrollTrigger wrapper, matchMedia branches) | COMPLETED |
| 07.5 | `SplitHeadline` (SplitText mask wipe + Archivo width "machining") | COMPLETED |
| 07.6 | `DrawPath` (anime.js `createDrawable` line drawing, ticks after lines) | COMPLETED |
| 07.7 | `Reveal` (Framer Motion `whileInView`, minimal) + `useMotionPreference` | COMPLETED |
| 07.8 | Section-sweep environment transition (Sheet ↔ Lab) | COMPLETED |
| 07.9 | Route transitions with React `<ViewTransition>` (home ↔ product ↔ contact) | COMPLETED |

## Execution plan

1. **Header (07.1):** wordmark left, three destinations (Product, Engineering, Contact) + "Talk to engineering" primary button. Header ink adapts to current environment via `data-env` of the section under it. Menu on mobile: full-screen sheet, links staggered with `ease-settle`, focus trapped, scroll locked through Lenis `stop()`.
2. **Sheet frame (07.2):** hairline inset frame, desktop only; title block bottom-right updates when a scene's ScrollTrigger enters (scene metadata from data). Hidden on mobile to free space; the scene name moves into the header.
3. **ScrollScene (07.4):** props: `id`, `pin`, `scrub`, `build(tl, ctx)`; internally `useGSAP` scoped to a ref; `gsap.matchMedia` with `desktop`, `touch`, `reduce` conditions; in `reduce` builds no timeline and applies end state.
4. **SplitHeadline (07.5):** lines split by `SplitText` with `mask: "lines"`; lines rise from the baseline in sequence; optional `wdth` tween from 75 → 112 synced to a 3D event (assembly lock). Preserve accessible text (`aria-label` on parent, splits `aria-hidden`).
5. **DrawPath (07.6):** anime.js v4 `svg.createDrawable` on blueprint SVG paths; triggered by ScrollTrigger `onEnter` or scrubbed by progress.
6. **Section sweep (07.8):** a clip-path wipe of the incoming environment synchronised with the 3D `SectionPlane` passing through the model, so the 2D cut and 3D cut read as one gesture.
7. **Route transitions (07.9):** React `<ViewTransition>` + `addTransitionType` (no Framer Motion here; `architecture.md` §2.1): a short wipe along the shaft axis (≤ 480 ms) and a shared-element morph of the product name; canvas and header excluded from snapshots; reduced-motion recipe from the guide. Because routes are kept alive by `<Activity>`, rebuild ScrollTriggers and call `lenis.resize()` when a page becomes visible.

## Validation criteria

- [x] Menu and header fully keyboard-accessible; focus returns to trigger on close. Native modal `<dialog>`: focus starts inside, page behind is inert, Esc animates out, focus lands back on Menu (checked at 390 px).
- [x] Each motion primitive has a reduced-motion path rendering the final state. Checked with `matchMedia` forced to reduce: no splits, SVGs drawn, timelines at their end, no pins, no sweep clip, no Lenis. Route wipe becomes a 200 ms fade (CSS media query, not forced in the check).
- [x] No two libraries animate the same property of the same element. GSAP: scene timelines, split lines (`yPercent`, `fontStretch`), sweep clip and cut line. Motion: menu panel and items, `Reveal` wrapper, button press. anime.js: SVG strokes only. CSS view transitions: route snapshots only.
- [x] ScrollTriggers are reverted when a page is hidden by `<Activity>` and rebuilt when shown: 5 round trips between `/system/motion` (13) and `/system/motion/b` (1), counts identical every time.
- [x] Menu is closed when returning to a page via back/forward (opened on B, back to A closed, forward to B closed).
- [x] CLS < 0.05 with headline splitting: 0.00 on `/system/motion` (desktop trace, dev build).
- [x] Status.md updated.

## Notes from the build

- **Bench:** dev-only `/system/motion` and `/system/motion/b` (client decision); Phases 08–10 move the primitives onto real routes. Header links to `/products/…` and `/contact` 404 until then.
- **Sheets:** each `ScrollScene` with a `sheet` name registers itself; N is the count on the visible page, n is document order. The current sheet is the last one whose top has passed mid-viewport, so scroll jumps and non-sheet gaps land on the right one.
- **Header and frame ink** come from hit-testing the content under them (`useEnvUnder`), which respects the sweep clip and ignores pages hidden by Activity. The header is solid (ground colour + hairline). The frame line is one mid-grey because it spans both environments during a sweep.
- **Links:** every internal link goes through `RouteLink`, which tags the navigation `nav-forward`/`nav-back` from the route order home → product → contact. `TextLink` and `Button` use it. Browser back/forward has no type and swaps without a wipe (Next guide's default).
- **Menu motion** uses the `move`/`ui` springs, not `ease-settle` tweens: design-direction §7.2 puts menus on springs, which are interruptible.
- **Width machining** tweens from 75 to the headline style's own width (118 for display-xl), not a fixed 112, so the end state matches the static style and nothing shifts. Narrowing is per line, so a re-split on resize still measures the final width.
- **Section sweep:** the incoming scene is clipped open left to right while it scrolls from the bottom of the viewport to the top; a copper cut line rides the edge. With `viewId` it switches that view's section on and drives `t` with the sweep.
- **Socials:** typed list in `data/contact.ts`, empty; the footer hides it until the client supplies profiles.
- **Found, not fixed (Phase 09 needs a decision):** a scene view inside any `[data-env]` element is invisible, because `[data-env]` paints a background over the fixed canvas. Lab scenes with a live model will need the environment background painted another way. The bench shows the sweep-driven cut on a view placed outside the sweep.
