# Phase 11 QA report

Production build (`next build` + `next start`), Next 16.4.3, Chrome via DevTools MCP on Linux. 2026-11-05.
"Owed" = needs a real device, a real assistive technology, another browser, or the client; not done here.

## Known issues going in

| Issue | Outcome |
| --- | --- |
| 11.3 Title block covers content | **Fixed.** The block fades out while text or a control is under it and returns once the corner is clear (`useContentUnder`, same hit-testing as `useEnvUnder`). Checked by an independent script (every text node and control vs the block, hit-tested) at 1024, 1440, 1920 on `/`, product, `/contact`, 404, scrolling the full page in 200–300 px steps: zero visible text under a shown block. One flag on the product page (parts-list item 13) was a false positive: the list's scroll container ends 6 px above the block and clips it. |
| 11.3 Labels escape their frame | **Fixed (hero), closed (other two).** The hero poster caption sat at x = 8 px, outside the frame on the left and bottom; it is now off in the hero, which already shows the status under the lede (same rule as Portfolio). The Engineering caption and the "Project spotlight" label only touch the frame line mid-scroll, like any scrolling text; at their scene starts they sit well inside (caption inside its figure; label at y = 214 px). |
| 11.6 "Talk to engineering" ×3 on the Inquiry screen | **Client-blocked.** Proposal: the Inquiry secondary button becomes "Ask about OEM integration" (it already opens the form with OEM integration chosen). Header CTA and footer headline stay. |
| 11.6 Repeated spec placeholder | **Client-blocked.** Proposal: an em dash in each withheld row and one note under the table: "Contact engineering for current technical details." |
| 11.6 Project headline in Title Case | **Client-blocked.** Proposal: "Development of an indigenous motor for fan coil unit application". Note the claim's own source flags "indigenous" as needing approval (`company.indigenous` is withheld). |
| 11.4 npm audit | **Closed, not fixed.** All 4 moderate findings are glob/minimatch under `@gltf-transform/cli` (dev-only, not shipped; `npm audit --omit=dev`: 0). The offered fix downgrades the CLI to 3.5.1 (breaking). No script references the CLI; removing it would clear the findings (needs your OK). |

## Found and fixed during QA

- **Focus after navigation.** Routes stay mounted under `<Activity>`, so after following a link the browser's focus point stayed in the hidden page and the next Tab landed in the footer. Focus now moves to the new page's h1 after every client-side navigation (`lib/routeFocus.ts`); the mobile menu hands focus to the page heading when it closes by navigation, and still returns it to the Menu button on Esc.
- **GPU memory leak in the contact shadow.** drei `ContactShadows` never disposes its two render targets and rebuilt them whenever its inline `scale` array changed identity, i.e. on every model re-render; the explode re-bake remounted it on top. Measured +14 textures/framebuffers/renderbuffers per explorer cycle. Replaced with our own `StageShadow` (same technique, owns and disposes its targets, re-bakes on demand). After the fix: 10 textures, 13 framebuffers, 8 renderbuffers, 153 buffers, 17 programs, identical after 1 and after 11 cycles (explode, X-ray, section, drawing, isolate, reset).

## 11.1 Accessibility

| Check | Result |
| --- | --- |
| Lighthouse (axe) mobile, `/`, product, `/contact` | A11y 100 / Best practices 100 / SEO 100 on all three |
| Lighthouse desktop, same routes | 100 / 100 / 100 (product page timed out once, 100s on retry) |
| Explorer state (exploded, X-ray, section, part isolated) snapshot | A11y 100 |
| Contact form error state snapshot | A11y 100; focus moves to the error summary, 6 fields `aria-invalid` |
| Keyboard journey home → product → contact | Pass after the focus fix: skip link, header, hero view (focusable, arrow keys), CTAs in order, focus ring on every stop; Enter follows links; focus lands on each new page's h1 |
| Menu (390 px) | Opens, Esc closes and returns focus to Menu; link closes and focuses the new page's h1 |
| `prefers-contrast` | Not re-checked this phase (Phase 02 increased-contrast mode, 20 pairs pass on `/system`) |
| NVDA, VoiceOver | **Owed** |

## 11.2 Reduced motion and poster tier

Reduced motion (emulated), `/` at 1440: no preloader, 0 pin spacers, Lenis off, 0 running animations after a full scroll, no text left at opacity 0 or hidden; page height 11,656 px vs 15,168 with motion (no pin lengths). Hero screenshot correct.
Poster tier (forced via the session tier floor): posters on every view, captions as above.
Model fetch failure (GLB fetch rejected): canvas drops, session falls to posters, page intact. Console shows the load error, as expected for a real failure.

## 11.3 Responsive

No horizontal page overflow at 360, 390, 768, 1024, 1440, 1920 on `/`, product, `/contact`, 404 (widest element on `/` is the Process board, clipped by its container by design). Title block: see above.
**Owed:** real iPhone (iOS Safari) and mid-range Android; Firefox and Safari; touch rotate vs scroll; safe-area insets; landscape phones.

## 11.4 Performance

Mobile emulation: 390 × 844 @3×, 4× CPU, Slow 4G, cold cache.

| Budget | Measured | Result |
| --- | --- | --- |
| Initial JS excl. three < 230 KB gz (raised from 150) | `/` 230.5 KB (236,022 B), product 226.9 KB, `/contact` 221.3 KB (excludes the 38 KB `noModule` polyfill modern browsers skip). React DOM 72 KB + Next runtime ≈ 57 KB; GSAP + ScrollTrigger + SplitText 47 KB; Lenis 9 KB; Framer Motion core ≈ 12 KB | **Fail on `/` by 0.5 KB**; product and contact pass |
| three/R3F chunk lazy after first paint | Not in any route's initial scripts; loaded after hydration | Pass |
| Model `fetchpriority` low until the hero needs it | Requested after hydration (tier detection), default priority. Every route's first screen has a live view, so it is needed as soon as it can be requested | Deviation, noted |
| LCP < 2.5 s | First load of a session: **5.5 s** (H1 waits for the preloader, which holds until the model is ready, up to 4 s). Repeat load: 1.56 s | **Fail on first load** |
| CLS < 0.05 | 0.047 both loads: the hero lede shifts when the Archivo webfont replaces its fallback (≈3.3 s on Slow 4G) | Pass, marginal |
| INP < 200 ms | Worst 112 ms (explode, X-ray, section, menu; 4× CPU, real clicks) | Pass |
| GPU memory stable over 10 explorer cycles | Flat after the shadow fix (see above) | Pass |
| Lighthouse mobile Performance ≥ 85 | Not measured: the MCP audit excludes the Performance category and there is no Lighthouse CLI here | **Owed** (PageSpeed Insights after deploy, or install the CLI) |
| Lighthouse A11y ≥ 95, BP ≥ 95, SEO 100 | 100 / 100 / 100 | Pass |

**Framer Motion cut.** `framer-motion` 14.6.0 is now a declared dependency (exact pin, the version `motion` itself pins, so one copy) and every component imports it directly: `motion/react` re-exports through `import * as fm from "framer-motion"`, which kept the whole library in the bundle. Components use `m.*` under one `LazyMotion` (strict) that fetches `domAnimation` after hydration. `Disclosure` moved off `useAnimate` (which bundles the full engine) to `m.div` with a height motion value. The mobile menu sheet is its own chunk, fetched on first intent (hover, focus, touch) and mounted on first open. GSAP's CustomEase (3.7 KB on every route) replaced by `lib/cubicBezier.ts` registered with `gsap.registerEase`; a test holds every token curve and its return within 0.002 of CustomEase. Before → after: `/` 267 → 230.5, product 267 → 226.9, `/contact` 264 → 221.3 KB.

## 11.5 SEO

- Titles: home "Infintin · Fan coil unit motors and controllers for HVAC"; "FCU Double Shaft Motor · Infintin"; "Contact · Infintin"; "Page not found · Infintin". Descriptions from approved claims (home: `company.vision`).
- Canonical per route, `og:url`, `og:site_name`, `og:locale` en_IN, Twitter `summary_large_image` on every route.
- Share card `public/og/fcu-double-shaft.jpg` (1200 × 630, hero lab poster cropped). JPEG because `ImageResponse` rendered the WebP poster blank and several share targets reject WebP. Re-make command in `lib/seo.ts`.
- `sitemap.xml`: `/`, `/products/fcu-double-shaft`, `/contact`. `robots.txt`: allow all, disallow `/system/`, sitemap link. `/system/*` 404 in production.
- JSON-LD Organization on the home page (approved claims only; `<` escaped). No Product markup: a prototype with no offer would be flagged and would overstate availability.
- All URLs resolve against `https://infintin.in`, still a placeholder until the launch domain is confirmed.
- Unknown product slug: 404 with `noindex`; its title arrives in the streamed payload (partial prerender), not the initial HTML.

## 11.6 Content

`claims:report`: 80 approved, 7 pending, 3 withheld after the client's answers of 2026-11-05 (rare-earth wording, voltage, speed, mounting, field trials, PoCs and pilots approved; IP67 and converter efficiency withdrawn). The 2 non-approved claims referenced by content (`product.dimensions`, `product.shaft`) are gated and show "Contact engineering". `claims:check`: 10 unapproved claims absent from 124 prerendered and client files. Follow-ups for the client: `content-guardrails.md` §3, items 16–23.

PRD §13:

| Criterion | Status | Evidence |
| --- | --- | --- |
| HVAC focus clear from the first screen, metadata, navigation | Pass | Hero H1 "Motors and controllers, engineered for fan coil units"; home title/description; nav Product / Engineering / Contact |
| FCU Double Shaft Motor is the primary product | Pass | Hero, Portfolio scene, only product route |
| Prototype status prominent and accurate | Pass | Status tag under the hero lede, on the product heading, in the title block on every sheet |
| No legacy EV product shown as active | Pass | No EV content on any route |
| Published specifications confirmed | Client-blocked | Voltage, speed, mounting, rare-earth wording approved 2026-11-05; dimensions, shaft, torque, noise level, temperature held on conflicting or unqualified answers; gated |
| Energy saving, payback, rare-earth, noise, efficiency, local manufacturing, lead time qualified or omitted | Client-blocked | Energy saving (simulation only) and payback held, absent; converter efficiency and IP67 withdrawn; rare-earth qualified "to the customer's requirement"; noise qualitative only; "Short lead times from local design and production" is an approved claim; confirm it is evidence-backed |
| Project shown as in-progress prototype | Pass | "Project spotlight · active development" |
| Enquiry from key pages | Pass | Header CTA on every route; hero, product and Inquiry CTAs open `/contact` with the type chosen |
| Enquiry form accessible, validated, reliable success/error states | Client-blocked | Accessible and validated (above); delivery not connected (Phase 12 deferred), form says so instead of faking success |
| Company names, awards, team, partners, logos approved | Client-blocked | See `content-guardrails.md` §3 |
| Mobile and desktop, semantic, performance/accessibility checks | Partly | A11y passes; JS budget and first-load LCP fail (11.4); real devices owed |
| No proprietary methods or confidential details | Client to confirm | Nothing beyond the approved claims is published |

## 11.7 Redirects

No redirects needed. Current site is one page with anchors (`content-inventory.md`); a `site:infintin.in` web search returned no indexed URLs. **Owed:** Google Search Console check before closing.

## 11.8 Error, 404, offline assets

- `not-found.tsx`: sheet-styled 404 with links home and to the product; served for unknown routes and unknown product slugs (status 404, `noindex`).
- `error.tsx`: page-level boundary inside the site shell, with Try again (`retry`) and a link home.
- `global-error.tsx`: plain inline-styled document for root-layout failures.
- Model fetch failure: falls back to posters (11.2). Not triggered on purpose: `error.tsx` and `global-error.tsx` render paths (no failing route to throw from).

## Console

Production build, fresh browser context, `/`, product, `/contact`: no errors. One warning on every route with a canvas: `THREE.Clock: This module has been deprecated`, raised inside `@react-three/fiber`. **Open:** R3F bumped to 9.8.2, which still constructs `THREE.Clock` in its store (`events-*.esm.js`), so the warning remains.
