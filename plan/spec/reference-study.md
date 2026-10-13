# Reference Study — Principles, Not Patterns

Phase 00.1, 2026-10-13. Method: Chrome DevTools (computed styles, font, colour, radius, border and transition frequency counts across all elements, canvas/library detection, viewport screenshots at several scroll depths). Screenshots were kept in the session scratchpad only; nothing from these sites is committed or reused.

Coverage: all four sites at 1440 × 900 and at mobile width (Mind Robotics at 390 px; the other three at 500 px, the narrowest the DevTools browser window allowed). Lighthouse runs and 1024 px passes were not done; they add little to principle extraction and can be run later if needed.

---

## 1. Mind Robotics — mindrobotics.com

**Evidence**
- Single family (CentraNo2: 400/500/700). Hero display ≈80 px desktop with −0.04em tracking, word-by-word line breaks; one oversized word set at 360 px. Mobile H1 falls to 36 px. Body 20/30 px, short measure (≈ 45–55ch).
- Warm, near-paper ground (`#DBD7CA`, `#E8E5E0`) with a tinted ink (`rgb(6 26 30)`, a near-black teal) instead of pure black. One brand accent (teal) plus red and yellow used only inside illustrations.
- Real-time WebGL2 scenes (two canvases) rendered as **outlined line drawings**: flat fills, ink outlines, isometric camera. A `400lvh` sticky section scrubs a factory scene, with a small step card (title, two lines of text, progress pips) that updates per step.
- Pill buttons (fully rounded), 24 px bold labels. Easing almost everywhere: `cubic-bezier(0.645, 0.045, 0.355, 1)` (ease-in-out cubic) at 0.2 / 0.6 / 0.8 s.
- Built on Next.js + Turbopack. Gutter 24 px on mobile.

**Principles**
1. *3D can be drawn, not just rendered.* The toon/outline treatment makes the 3D read as an illustration of a system, which is closer to engineering communication than photorealism.
2. *Tint the ink.* A tinted near-black on a warm ground feels considered and less harsh than #000 on #fff.
3. *One easing, three durations.* A small motion vocabulary used consistently is what makes motion feel designed.
4. *A pinned scene needs a small, stable caption*, so the scrubbed 3D always has a fixed place where the meaning is stated.

**How Infintin applies it, differently**
- Our **Drawing mode** (ink edges on flat vellum surfaces) uses the same insight but in orthographic, technical-drawing language rather than playful isometric illustration. Lab mode keeps physical PBR, so we have both registers and the transition between them is the story.
- Graphite ink (`#141517`) on vellum (`#ECEAE3`) confirmed. Our accent is copper, used only for state.
- Our pinned explorer gets a caption slot as well: the **title block / parts-list entry**, not a floating card with pips.
- Avoid: pill buttons, playful rounded type, multi-colour illustration accents.

---

## 2. Litebox — litebox.ai

**Evidence**
- Pairing: RebondGrotesque 600 for display (88 px H1, −0.02em) and NeueMontreal 400/500 for text (20/28 px). Tinted ink again (`rgb(29 50 8)`, dark olive) on off-white (`#FAFAF0`).
- No canvas: hero 3D is **pre-rendered video** (4 `<video>` elements). Lenis smooth scroll.
- Structure from **hairlines**: 1 px rules at 20% ink (`rgba(0,0,0,0.2)`) under the header and between service cells; service grid cells have radius 0 and are separated only by rules; the content column is framed by vertical 1 px rules at the container edges.
- Only rounded elements are buttons and small tags (pill). Material easing `cubic-bezier(0.4, 0, 0.2, 1)` at 0.15–0.3 s for UI.

**Principles**
1. *Hairline structure beats cards.* A grid divided by 1 px rules at reduced opacity gives order without boxes, shadows or radii.
2. *Frame the page.* Vertical rules at the container edges make the page itself feel like a sheet.
3. *Pre-render what is not interactive.* Non-interactive 3D can be video, saving GPU and load for what must be live.
4. *UI motion is fast and quiet* (≤ 300 ms); cinematic timing is reserved for scenes.

**How Infintin applies it**
- Confirms our rule-based components and the **SheetFrame**: hairline inset frame plus title block.
- Rules at 18% graphite on vellum and 14% vellum on lab ground (already tokens).
- Our posters and OG images are pre-rendered stills. We will **not** replace the live explorer with video, because interaction is the point; but secondary 3D moments (e.g. a small isolated part beside text) can be pre-rendered stills on low tier.
- Duration tokens split clearly: UI (`instant`/`quick`) vs scene (`scene`/`assembly`).
- Avoid: pink/pastel field colour, generic floating abstract objects.

---

## 3. Oryzo — oryzo.ai

**Evidence**
- Three families: `halyard-display-variable` (100–900) for display and UI, **Literata** (serif, 200–900) for text, **DM Mono** for data. Display word "ORYZO" at ≈123 px; very large scrubbed headlines.
- Single fixed full-viewport WebGL canvas plus several smaller canvases; extremely long scroll (≈ 56,000 px) driving one continuous product story.
- The product is **staged in its working context**: a coaster on a cutting mat with millimetre rulers, pencils and a craft knife. The ruler ticks double as a measurement device.
- The 3D object **sits in front of the headline** and occludes it ("it's w[object]able"), so type and object share one depth space.
- Technical framing: dashed bounding box with centre ticks and a dashed circle around the selected object; dashed 1 px rules in the UI.
- Warm dark ground (`rgb(16 9 4)` → browns), cream ink (`rgb(255 237 215)`), one burnt-orange accent (`rgb(220 80 0)`). All-caps micro labels and nav throughout; rounded (36 px) buttons.

**Principles**
1. *Stage the product where it works.* Context objects and a measurement scale make the object legible and believable.
2. *Type and object in the same space.* Letting the object cross, cover and interrupt the headline makes typography an active element.
3. *Selection as a drawing.* A dashed frame with ticks around the subject is a precise, non-decorative way to say "this is what we are looking at".
4. *One canvas, one continuous story* across a long scroll.
5. *Serif for reading, display sans for impact* is a credible pairing in a technical context.

**How Infintin applies it**
- Context staging, engineering version: the motor rests on its **mounting stand** with a faint centre line and length scale in the Sheet environment. Values on the scale appear only if dimensions are approved; otherwise ticks without numbers.
- Hero composition: the shaft line passes **through** the headline; the blower wheel overlaps the last line of the H1 on desktop (depth-sorted DOM + canvas, the H1 stays in the DOM for LCP and accessibility).
- **Isolate state** draws a dashed inspection frame with centre ticks around the selected part, plus its balloon number. Added to Phase 06.3.
- Confirms one fixed canvas and the Archivo + Source Serif 4 pairing (display sans + reading serif). We stay with two families (no mono); Archivo condensed with tabular figures covers data.
- Avoid: all-caps micro-labels, pill buttons, warm brown palette, joke-product tone.

---

## 4. Normal is Boring — normalisboring.es

**Evidence**
- Sans + serif-italic pairing: Izmir (geometric sans) for display caps and small text, Editorial New (ultralight/italic) and Juana for serif moments. Headline lines are **staggered across grid columns** ("ESPACIOS / DE VIDA" left, "QUE / DESAFÍAN" offset right, "LO / ORDINARIO" back left, last word in italic).
- Vertical navigation set along the right edge; the wordmark is split and mirrored ("NORMAL" top-left, "is BORING" upside-down bottom-right) as a compositional device.
- Body text very small (12.75 px) in a narrow column, deliberately placed against large type.
- Sections that **convert vertical scroll into horizontal travel** (black panel → vertical "VALORES" band → photography sliding in), using GSAP + Lenis. No canvas.
- Black, warm beige (`#ECE4DA`) and white grounds; 1–2 px solid black rules; a spring easing (`cubic-bezier(0.34, 1.56, 0.64, 1)`) for small UI.

**Principles**
1. *Break the grid by using it.* Staggering lines across real columns creates tension while staying aligned.
2. *Scale contrast is hierarchy.* Very large display next to a small, quiet text block reads as editorial confidence.
3. *Direction change is a scene cut.* Turning scroll into horizontal travel signals a new chapter.
4. *Typographic devices can carry identity* (vertical nav, mirrored wordmark) when they come from a clear idea.

**How Infintin applies it**
- Hero and scene titles are staged on the 12-column grid: lines placed in different column spans, aligned to the shaft axis, not centred.
- Scale contrast: `display-xl` against a narrow `body` column. Our body stays at 17–19 px for readability (B2B technical audience); we don't copy the 12.75 px text.
- **Horizontal travel** is the natural motion for our shaft-axis subjects: the development-process timeline (Phase 09.4) and the axial explode scrub scroll sideways along the centre line on desktop.
- Our identity device is the **centre line + title block**, not a mirrored wordmark or vertical nav.
- Avoid: springy overshoot easing (our motion is damped and mechanical), all-caps display.

---

## 4a. Responsive behaviour (mobile pass)

| Site | Display size desktop → mobile | Body (mobile) | Margin | Navigation | 3D / media on mobile |
| --- | --- | --- | --- | --- | --- |
| Mind Robotics | 80 → 36 px (≈0.45×) | 20/30 px | 24 px | Two pill CTAs stay visible | WebGL scenes kept; pinned scene shortened (`200svh` on tablet) |
| Litebox | 88 → 38 px | 20/28 px, centred | 16 px | "Menu" button | Pre-rendered video kept; hero background colour changes per load |
| Oryzo | ≈123 → 51 px | 16/19 px | — | — | **Full 3D kept on mobile.** Scroll shortened (≈56k → 50k px). Preloader is a **CAD-style construction drawing** of the product (dotted grid, dimension handles, bounding circles) that resolves into the render. |
| Normal is Boring | 52 → 29 px | 13/16.5 px | ≈ 6–20 px | Vertical nav → "Menú" pill | Staggered headline composition kept, scaled down |

**Principles**
1. *Keep the idea on mobile, shorten the timeline.* The best sites keep their signature moment (3D, staggered type) on phones and cut scroll length, rather than replacing it with a static fallback.
2. *Display type scales to ≈0.4–0.45× on phones;* body text does not shrink below desktop (Mind, Litebox keep 20 px).
3. *Loading is part of the story* (Oryzo): the preloader is a technical drawing of the product.

**How Infintin applies it**
- Mobile keeps the live 3D hero on `mid`/`low` tiers (LOD1), with shorter pins (Phase 08.6). Poster only for the `poster` tier.
- `display-xl` clamps to ≈ 0.42× on 360 px; body stays 17 px minimum; margins 16 px minimum (NiB's 6 px is too tight).
- **Preloader = elevation drawing.** While the GLB loads, the hero shows the motor's SVG elevation drawing (centre line, outline, construction lines) drawn by `DrawPath`; when the model is ready, the drawing hands off to the 3D, matching the Sheet → Lab language. Added to Phase 08.2.

## 5. Synthesis — decisions for the design system

| # | Principle | Decision for Infintin | Affects |
| --- | --- | --- | --- |
| 1 | Tinted ink on warm ground | Graphite `#141517` on vellum `#ECEAE3`; lab ground graphite with vellum ink. No pure black/white. | Phase 02.1 |
| 2 | Hairline structure, no cards | 1 px rules at 18% / 14%; radius 0–2 px only; no shadows on UI. | 02.4, 02.6 |
| 3 | Framed page | `SheetFrame`: inset hairline + title block (desktop). | 07.2 |
| 4 | Small motion vocabulary | 3 easings, 5 durations. UI ≤ 240 ms; scenes 900–1600 ms. No spring overshoot. | 02.5 |
| 5 | One canvas, one continuous story | Confirmed: single fixed canvas with drei `View`s. | 05.2 |
| 6 | 3D can be drawn | Drawing mode (ink edges, flat vellum) is the visual bridge between Sheet and Lab. | 06.4 |
| 7 | Type and object share depth | Shaft line and front blower wheel cross the hero H1 on desktop. | 08.1 |
| 8 | Selection as a drawing | Dashed inspection frame with centre ticks on isolate. | 06.3 |
| 9 | Stage in working context | Motor on its stand, centre line + length scale (numbers only if approved). | 08.5, 09.1 |
| 10 | Break the grid by using it | Headline lines staggered across real column spans. | 02.2, 08.1 |
| 11 | Direction change = new chapter | Horizontal travel for process timeline and axial explode scrub (desktop). | 09.1, 09.4 |
| 12 | Pre-render what isn't interactive | Posters/OG stills; secondary 3D accents as stills on low tier. | 04.7, 05.6 |
| 14 | Loading is part of the story | Preloader is the motor's elevation drawing, handed off to 3D when ready. | 08.2 |
| 15 | Keep the idea on mobile | Live 3D on mobile (LOD1), shorter pins; display ≈0.42×, body ≥ 17 px, margin ≥ 16 px. | 02.2, 08.6 |
| 13 | Pinned scene caption | Title block / parts-list entry is the stable caption of pinned 3D scenes. | 07.2, 09.1 |

Things all four sites do that we deliberately won't: pill-shaped buttons, all-caps micro labels, multi-colour accents.
