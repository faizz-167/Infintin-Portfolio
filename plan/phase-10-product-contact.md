# Phase 10 — Product Route & Contact Page (UI)

**Status:** NOT_STARTED
**Depends on:** Phase 06, Phase 07, Phase 03
**Outputs:** `app/products/[slug]/page.tsx`, `app/contact/page.tsx`, `components/sections/EnquiryForm.tsx`

## Objective

Give technical and procurement visitors a dedicated, indexable product page with the full explorer, specifications and FAQ, and a contact page with a complete, accessible enquiry form whose delivery mechanism is plugged in later.

## Subtasks

| ID | Subtask | Status |
| --- | --- | --- |
| 10.1 | `products/[slug]` with `generateStaticParams` + `generateMetadata` | NOT_STARTED |
| 10.2 | Full-viewport explorer section (all modes, section plane, parts list) | NOT_STARTED |
| 10.3 | Overview, application fit, status, spec sheet, controller block | NOT_STARTED |
| 10.4 | FAQ (accessible disclosure) + product CTAs | NOT_STARTED |
| 10.5 | Contact page layout: channels, enquiry types, expectations copy | NOT_STARTED |
| 10.6 | Enquiry form UI: fields per PRD §8.7, validation, states | NOT_STARTED |
| 10.7 | `EnquiryTransport` interface + temporary "not connected" implementation | NOT_STARTED |

## Execution plan

1. **Route (10.1):** slug from product data; unknown slug → `notFound()`; metadata from approved claims (title, description, OG poster).
2. **Explorer (10.2):** reuse `ProductExplorer` in full mode; deep-linkable state via search params (`?view=exploded&part=rotor&mode=xray`) for sharing with colleagues; the param reader sits inside `<Suspense>` so the page stays prerendered. Add `export const ensureStatic = "navigation"` to both routes.
3. **Content (10.3 – 10.4):** blocks per PRD §8.2; withheld specs show "Contact engineering for current technical details"; datasheet button only when an approved file exists in data. FAQ uses `<details>`/`<summary>` enhanced with Framer Motion height animation.
4. **Contact (10.5):** enquiry types from data; pre-select from `?type=`; direct email and phone (if approved) always visible; no response-time promise.
5. **Form (10.6):** fields: name*, work email*, company*, role, phone, enquiry type*, requirement*, consent*; optional qualifiers (application FCU/AHU/other, power range, quantity, city/state, timeline) collapsed under "Add technical details". Client validation on blur + submit; errors summarised at top with links; values preserved on error; honeypot field in place; states: idle, submitting, success, error.
6. **Transport (10.7):** `interface EnquiryTransport { submit(data): Promise<{ ok: true } | { ok: false; reason }> }`. Until Phase 12, the active implementation returns `{ ok: false, reason: "not-connected" }` and the UI shows "Online submission isn't available yet — email us at …" with the composed message ready to copy. Never shows success. Status messages reset in a `useLayoutEffect` cleanup when the page is hidden; drafts persist.

## Validation criteria

- [ ] Product page statically generated; one H1; valid heading hierarchy; metadata from approved claims only.
- [ ] Explorer deep links restore state on load.
- [ ] Form: all fields labelled; keyboard-only completion works; errors announced (`aria-live`) and not colour-only; email format validated; values preserved after a failed submit.
- [ ] Form never shows a success state with the placeholder transport.
- [ ] axe DevTools: zero serious/critical issues on both pages.
- [ ] Status.md updated.
