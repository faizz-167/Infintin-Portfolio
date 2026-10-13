# Phase 01 — Project Foundation

**Status:** COMPLETED (2026-10-13)
**Depends on:** Phase 00 (00.3)
**Outputs:** dependencies installed, directory skeleton, smooth-scroll + GSAP runtime, fonts, base layout

## Objective

Turn the Create Next App starter into the skeleton defined in `architecture.md`: dependencies, folders, fonts, providers, and a working Lenis ↔ GSAP ScrollTrigger integration, with typecheck, lint and build green.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 01.1 | Install and pin dependencies | COMPLETED |
| 01.2 | Create directory skeleton and path aliases | COMPLETED |
| 01.3 | Replace starter fonts with Archivo + Source Serif 4 (variable) | COMPLETED |
| 01.4 | GSAP registration module + Lenis `SmoothScroll` provider | COMPLETED |
| 01.5 | Root layout: providers, metadata base, skip link, landmarks | COMPLETED |
| 01.6 | Scripts (`typecheck`, `models:optimize`); remove starter assets | COMPLETED |

## Execution plan

### 01.1 Dependencies
1. `npm i three @react-three/fiber @react-three/drei @react-three/postprocessing maath zustand gsap @gsap/react lenis motion animejs`
2. `npm i -D @types/three @gltf-transform/cli @gltf-transform/core @gltf-transform/functions @gltf-transform/extensions meshoptimizer gltfjsx`
3. Confirm the R3F major supports React 19.3. Record exact versions in the `Status.md` decision log.

### 01.2 Skeleton
1. Create `components/{ui,layout,motion,three,explorer,sections}`, `data/`, `design/`, `lib/`, `scripts/`, `public/models`, `public/posters`.
2. Configure the `@/*` alias in `tsconfig.json` (check the existing config first).
3. Move `final_assembly-v1/` to a non-public `assets-src/fcu-double-shaft/` folder, unchanged. Decide with client: commit source (or Git LFS) vs `.gitignore`.

### 01.3 Fonts
1. `next/font/google`: Archivo with `axes: ["wdth"]` → `--font-archivo`; Source Serif 4 with `axes: ["opsz"]`, normal + italic → `--font-serif`. Verify the axis API against `13-fonts.md`.
2. Remove Geist imports and the `font-family: Arial` rule.

### 01.4 Scroll runtime
1. `lib/gsap.ts` (client): register `ScrollTrigger`, `SplitText`, `useGSAP` once.
2. `components/motion/SmoothScroll.tsx`: Lenis with `autoRaf: false`, wired to ScrollTrigger and the GSAP ticker (`architecture.md` §6); expose the instance via context; destroy on unmount.
3. Skip Lenis when `prefers-reduced-motion: reduce`; native scroll remains.
4. Route in-page anchor links through `lenis.scrollTo`.

### 01.5 Root layout
1. `app/layout.tsx`: `lang="en-IN"`, font variables, `metadataBase` (placeholder until domain confirmed), title template, skip-to-content link, providers, `<main id="content">`.
2. Temporary `app/page.tsx` with three tall sections and one pinned ScrollTrigger section to prove the integration.

### 01.6 Scripts & cleanup
1. Add `"typecheck": "tsc --noEmit"` and `"models:optimize": "node scripts/optimize-models.mjs"`.
2. Delete starter SVGs in `public/`.

## Validation criteria

- [x] `npm run typecheck`, `npm run lint`, `npm run build` pass with zero errors.
- [x] Dev server: test page scrolls smoothly; the pinned section pins/unpins correctly, including after window resize.
- [x] With OS reduced motion on, Lenis is not instantiated and scrolling is native.
- [x] Fonts load as variable files; `wdth` and `opsz` respond in DevTools.
- [x] No Geist references remain (`grep -ri geist app components` is empty).
- [x] Status.md updated with installed versions.

## Notes (2026-10-13)

- 01.2.3: model source moved by hand, committed, then renamed to `assets-src/fcu-double-shaft/` with `git mv`. Committed to the repo (2.3 MB, no LFS).
- 01.6.2: starter SVGs deleted by hand.
- In-page anchors use Lenis's built-in `anchors: true` option, which routes `#hash` clicks through `lenis.scrollTo`.
- The Source Serif CSS variable is `--font-source-serif`, not `--font-serif`, because Tailwind's `--font-serif` theme token would otherwise reference itself.
- Reduced-motion check done by stubbing `matchMedia` in the page (DevTools MCP cannot emulate the media feature): no Lenis instance, native scroll.
- `models:optimize` points at `scripts/optimize-models.mjs`, which Phase 04 writes; running it now fails loudly.
- `npm audit`: 7 high-severity advisories, all in dev-only model tooling (`gltfjsx`, `@gltf-transform/cli` via `sharp`, `micromatch`, `braces`). `sharp`'s install script was blocked by npm's `allowScripts`; the model has no textures, so Phase 04 should not need it.
