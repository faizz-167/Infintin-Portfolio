# Phase 02 — Global Design System

**Status:** COMPLETED (2026-10-13)
**Depends on:** Phase 00 (00.1, 00.5), Phase 01
**Outputs:** `app/globals.css` tokens, `design/tokens.ts`, `components/ui/*`, dev-only `/system` specimen route

## Objective

Implement the design system from `design-direction.md` (refined by the reference study) as centralised tokens and reusable responsive primitives, so every later component is composed rather than hand-styled.

**Apple-design principles are folded in (client decision, 2026-10-13).** The look stays "The Drawing Set": paper/graphite palette (client grounds `#EDF4FE` / `#14151A`), single copper accent, Archivo + Source Serif 4, rules not cards, 0–2 px radii. What Apple's approach changes is how it behaves: instant response, interruptible spring motion, size-specific type tuning, restraint, and proper reduced-motion/contrast fallbacks. Where the two conflict, the design direction wins on look and the Apple principles win on feel.

## What Apple-design adds, and what it doesn't

Adopted:

- **Response.** Every control acknowledges a press on pointer-down (not on release), within one frame. No artificial delays on the input path; no 300 ms tap delay.
- **Interruptibility.** Any UI state change (menu, disclosure, tab, sheet, part selection) can be reversed mid-flight and continues from its current on-screen value, with no jump and no input lock-out.
- **Springs for UI state.** State changes are springs, not fixed-duration tweens. Default is critically damped (no overshoot), which matches the design direction's "firm, damped stops, no bounce".
- **Spatial consistency.** Things leave the way they came; menus and popovers grow from the control that opened them; reversible transitions use mirrored easing.
- **Type tuned by size.** Every text style has its own tracking and leading: negative tracking and tight leading on display sizes, near-zero tracking and comfortable leading on body, slightly positive tracking on small condensed labels. Sizes scale with the user's browser text size.
- **Craft.** Every spacing, timing and alignment value is a token that can be justified; nothing ad hoc in components.
- **Feedback kinds.** Status, completion, warning and error each have one consistent treatment (text + icon/hatch, never colour alone). Form fields validate inline, after the user leaves the field, not only on submit.
- **Accessibility beyond on/off.** Reduced motion swaps movement for short cross-fades (feedback stays, travel goes). Increased-contrast mode gets solid grounds and stronger rules.

Explicitly not adopted (conflicts with `design-direction.md` §2):

- Translucent/frosted materials, `backdrop-filter` chrome, glass layers. The header and sheet frame stay solid with hairline rules.
- Bounce/overshoot springs, including on flicks. The motor is a machine; everything seats with a hard, damped stop. (Apple ships ~0.8 damping for momentum gestures; we keep 1.0 everywhere.)
- System font (SF / `system-ui`) as the primary face. Archivo and Source Serif 4 stay; they already provide the optical sizing and width axes Apple's advice is aiming for.
- Rounded cards and pill buttons.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 02.1 | Colour tokens (Sheet + Lab environments) with contrast verification, incl. increased-contrast mode | COMPLETED |
| 02.2 | Type tokens: fluid rem-based scale, families, widths, optical sizes, per-size tracking and leading, numerals | COMPLETED |
| 02.3 | Spacing, grid, containers, breakpoints, z-index | COMPLETED |
| 02.4 | Borders, rules, radii, focus ring | COMPLETED |
| 02.5 | Motion tokens: springs for UI state, easings for scroll choreography and line draws, reduced-motion equivalents | COMPLETED |
| 02.6 | Primitives: Container, Grid, Rule, CentreLine, TextLink, Button | COMPLETED |
| 02.7 | Technical primitives: Annotation, Balloon, StatusTag, SpecTable, TitleBlock | COMPLETED |
| 02.8 | Form primitives: Field, Select, Checkbox, help/error text, inline validation display | COMPLETED |
| 02.9 | Specimen route `/system` (development only), including an interactive motion bench | COMPLETED |
| 02.10 | Update `design-direction.md` §4 and §7 to record the folded-in principles | COMPLETED |

## Execution plan

### 02.1 Colour
1. Define the palette from `design-direction.md` §3 under `@theme` (`--color-*`). Remove the starter `--background`/`--foreground` tokens.
2. Environment scoping: `[data-env="sheet"]` and `[data-env="lab"]` set semantic aliases (`--ink`, `--ink-muted`, `--ground`, `--rule`, `--accent`). A section switches environment with one attribute.
3. Check every text/ground pair (body, muted, copper on both grounds, status). Adjust values; record ratios in the specimen.
4. `prefers-contrast: more`: rules go from 18 % / 14 % alpha to solid, muted ink darkens (sheet) / lightens (lab) to ≥ 7:1 on body text.
5. No abrupt full-viewport brightness jumps: Sheet ↔ Lab changes are owned by scene choreography (later phases), never by a hard CSS swap on scroll.

### 02.2 Type
1. Fluid sizes with `clamp()` per token (`display-xl` … `data`), from 360 px to 1600 px viewport. Min and max in `rem`, so the browser's text-size setting scales them.
2. One `@utility` per text style setting family, `font-variation-settings` (`wdth`, `opsz`), weight, leading and tracking as one set:
   - display sizes: tracking −0.03 em (`display-xl`) to −0.015 em (`display-m`), leading 0.9–1.05;
   - `lede` / `body`: tracking 0, leading 1.4–1.5, `font-optical-sizing: auto` so Source Serif picks its cut from the rendered size;
   - `annotation` / `data` (condensed, small): tracking +0.01 to +0.02 em, leading 1.2–1.3.
3. Hierarchy uses weight + size + leading together; emphasis inside text uses weight, not colour.
4. `text-wrap: balance` on headings, `pretty` on body; body measure `max-inline-size: 68ch`.
5. `data` style: `tabular-nums slashed-zero`.
6. Spacing tied to type (paragraph gaps, label offsets) in `em`/`rem` so it scales with text size.

### 02.3 Space & grid
1. 8 px base scale (`--space-1` … `--space-12`, in `rem`) plus semantic `--space-margin` (min 16 px), `--space-gutter`, `--space-scene`.
2. Breakpoints `sm 480`, `md 768`, `lg 1024`, `xl 1440`, `2xl 1920`, mirrored in `design/tokens.ts` for `gsap.matchMedia`.
3. `Grid`: 4/6/12 columns, subgrid for cross-row alignment. `Container`: page width + margins.
4. z-index scale: canvas, content, overlay-annotations, header, menu, toast.

### 02.4 Borders & focus
1. Rule weights `hairline 1px`, `object 2px`; dashed long-short centre-line pattern (SVG).
2. Radii: `0` and `2px` only.
3. Focus ring: 2 px copper outline, 3 px offset, visible on both grounds and in increased-contrast mode. Shown for keyboard focus (`:focus-visible`), appears instantly (no transition).

### 02.5 Motion tokens
One definition in `design/tokens.ts`, exported in the shapes each library needs (Motion spring options, GSAP ease strings, CSS custom properties). Two families with separate jobs:

1. **Springs — UI state** (Motion / Framer Motion, `type: "spring"`, `bounce: 0`, i.e. critically damped). Expressed as Apple's two parameters, damping ratio and response:
   - `spring.press` — response 0.15 s: press/release feedback;
   - `spring.ui` — response 0.3 s: disclosures, tabs, menu, part selection;
   - `spring.move` — response 0.4 s: larger repositioning (sheets, panels).
   Springs always start from the current on-screen value and carry velocity through a re-target, so a reversed interaction never jumps or hits a "brick wall".
2. **Easings — authored choreography** (GSAP scroll scenes, line draws, scrubbed timelines, where the user's scroll *is* the interruption): keep `ease.machine | settle | draw` and `duration.instant | quick | base | scene | assembly` from `design-direction.md` §7. Each reversible easing has a mirrored counterpart for the return path.
3. **Pure CSS transitions** are allowed only for hover and colour changes (link underline redraw, button fill wipe), using `quick` + `settle` via custom properties; never for anything the user drags or toggles.
4. **Reduced motion:** a `useMotionPreference` hook and a CSS media block map every spring and travel to a ≤ 200 ms opacity cross-fade (or instant state change). Press feedback stays as a colour/ink change instead of a scale.
5. Only `transform` and `opacity` are animated in UI primitives.

### 02.6 – 02.8 Primitives
1. Typed components with variant maps; no new styling dependency unless justified.
2. `Button`: primary (copper), secondary (ink outline), text; sizes; link rendering. Pressed state on pointer-down (`spring.press` scale 0.98 + ink shift), released on pointer-up or cancelled by dragging off. Baseline fill wipe on hover. Disabled state. Min target 44 × 44 px; `touch-action: manipulation`.
3. `TextLink`: underline rule redrawn left to right on hover, retracts the same way it came on hover-out; external indicator.
4. `Balloon` + `Annotation`: SVG leader line, numbered circle, condensed label; accepts screen-space coordinates (used by `SpecOverlay` in Phase 06).
5. `StatusTag`: hatch swatch + text, never colour alone.
6. `SpecTable`: `<dl>` semantics, provenance note slot, "Contact engineering for current technical details" row for withheld values.
7. `TitleBlock`: sheet name, sheet n of N, status. This is the site's wayfinding answer to "where am I?".
8. Form primitives: always-visible labels; help and error text linked through `aria-describedby`; errors shown with icon + text; validation shown on blur and on submit, cleared as soon as the value becomes valid; no layout shift when an error appears.

### 02.9 Specimen
1. `/system` renders every token and primitive in both environments, with contrast ratios listed.
2. **Motion bench:** a disclosure and a toggle driven by each spring token, a slow-motion switch (0.25×) for frame-by-frame review, and the same controls under forced reduced motion.
3. Returns `notFound()` outside development.

### 02.10 Design direction update
1. `design-direction.md` §4: add the per-size tracking/leading rules and rem-based scaling.
2. `design-direction.md` §7: replace "springs for 3D damping only" with the two-family rule (springs for UI state, easings for choreography), add response/interruptibility/spatial-consistency rules and the reduced-motion and increased-contrast behaviour. Log the decision in `Status.md`.

## Validation criteria

- [x] All text colour pairs meet WCAG AA (4.5:1 body, 3:1 large text/UI) on both grounds; ≥ 7:1 body in increased-contrast mode; ratios listed in the specimen.
- [x] No raw hex or `cubic-bezier(` literals outside token files (`grep -rnE "#[0-9a-fA-F]{3,6}\b|cubic-bezier\(" components` empty).
- [x] Specimen correct at 360, 768, 1024, 1440, 1920 px; no horizontal scroll.
- [x] With browser text size at 200 %, specimen text scales and nothing overlaps or clips.
- [x] Buttons show their pressed state on pointer-down, before release.
- [x] Motion bench: toggling a disclosure rapidly mid-animation reverses smoothly from where it is, with no jump, no overshoot, and input never ignored.
- [x] With reduced motion on, no primitive translates or scales; state changes are cross-fades or instant.
- [x] Buttons, links and fields keyboard-operable with visible focus on both grounds.
- [x] Field errors appear on blur, clear when fixed, and cause no layout shift.
- [x] No translucency/`backdrop-filter`, no overshoot springs, no all-caps labels, eyebrow labels or single-word highlights in any primitive.
- [x] typecheck, lint, build pass. Status.md updated.

## Notes (2026-10-13)

- Contrast fixes: three palette values failed AA as proposed and were darkened: `lead` `#6B6C6A` → `#5E5F5D` (4.39 → 5.33 on vellum), `copper` `#B5542C` → `#9C4522` (4.09 → 5.31), sheet `status` `#C9A227` → `#8A6A0C` (2.01 → 4.21; the original value stays as `status-lit` on lab). Lab secondary ink is a new token, `lead-lit` `#A3A4A0`. All pairs pass on `/system`.
- Tailwind's default palette, type sizes, spacing multiplier, radii, eases and breakpoints are cleared in `globals.css`: only tokens exist, so a stray `text-lg` or `bg-red-500` simply generates nothing. Spacing tokens are named steps on an 8 px base (`p-1` = 8 px … `p-12` = 256 px), plus `margin`, `gutter`, `scene` and `target` (44 px).
- Springs are passed to Motion as stiffness/damping computed from Apple's response + damping ratio (ratio 1), not Motion's `bounce`/`duration`, whose defaults would add bounce.
- Reduced motion: Motion's own `reducedMotion` setting did not stop transform transitions in testing, so the reduced transition from `useMotionPreference` pins every transform value to instant and cross-fades opacity. Verified on the bench.
- GSAP eases are registered by name from the tokens via `CustomEase` (`machine`, `machine.return`, …).
- Display styles use `overflow-wrap: break-word`: at 360 px with 200 % browser text, single display words were wider than the screen.
- Reduced-motion and 200 % text checks were run by forcing the setting in-page (bench toggle; root font size 200 %), not via the OS.
- Dev server issue (fixed 2026-10-13): edits to `app/globals.css` never reached dev. Cause: `next.config.ts` ran CSS through `@tailwindcss/turbopack` via `turbopack.rules`; Turbopack does not support loaders that transform stylesheets. Replaced with the documented setup: `@tailwindcss/postcss` in `postcss.config.mjs`; `@tailwindcss/turbopack` uninstalled. Verified: a `globals.css` edit hot-updates the open page with no reload.
- Palette change (client, 2026-10-13, after completion): cream vellum replaced by cool paper `#EDF4FE`; graphite is `#14151A`. Token `vellum` renamed `paper`. Secondary inks re-tinted blue-grey: `lead` `#5A6170` (5.62:1 on paper), `lead-lit` `#A2A9B6` (7.71:1 on graphite), increased-contrast `#3F4552` / `#C8CED9`; `paper-deep` `#E0E9F5`, `graphite-raised` `#1C1E25`. Copper and status values unchanged (still pass). The earlier contrast-fix note above refers to the cream palette.
