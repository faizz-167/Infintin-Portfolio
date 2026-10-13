# Current-Site Content Inventory — infintin.in

Phase 00.2, captured 2026-10-13 from https://www.infintin.in/ (rendered DOM text, links, images). The site is a single page with anchor sections (`#about`, `#problem`, `#products`, `#technology`, `#team`, `#backed-by`, `#contact`); there are no sub-pages, so no legacy URLs need redirects (Phase 11.7 can be closed as not applicable unless older URLs exist in search results).

Decision key: **keep** (usable as is, pending approval) · **rewrite** (reposition for HVAC / PRD wording) · **archive** (legacy EV, R&D section only if the client wants it) · **drop** (remove, conflicts with PRD guardrails).

## 0. Conflicts found

**Resolution (client, 2026-10-13): the PRD is the source of truth for every conflict below.** FCU power range confirmed as 50 W to 250 W. Items the PRD itself marks for confirmation (rare-earth wording, team details, recognition wording/logos) stay pending, but their content follows the PRD, not the current site.

| # | Conflict | Current site | PRD | Action |
| --- | --- | --- | --- | --- |
| C1 | FCU motor power range | **50 W to 120 W** | 50 W to 250 W | **Resolved:** 50 W to 250 W (client confirmed). Claim `product.power-range` approved. |
| C2 | Rare-earth wording | "0% Rare Earth Magnet Reliance", "Rare earth free BLDC", "HRE Free and Rare earth free Magnets", and hero eyebrow "Indigenous **PM** motors" | Wording unconfirmed; rare-earth-free ≠ heavy-rare-earth-free | **Resolved → PRD:** withheld until engineering approves the exact term (PRD §5 guardrail). None of the site's terms are carried over. |
| C3 | Founder credentials | Text: "A. Infantraj M.Tech., Ph.D."; image alt: "A. Infantraj M.Tech."; advisor text "M. Senthilkumaran Ph.D." vs alt "M.E., Ph.D." | Re-confirm all | **Resolved → PRD:** all team details re-confirmed before publishing (PRD §8.5); entries stay pending. |
| C4 | Support ecosystem list | AIC – Anna Incubator, ITEL Foundation(s), Startup TN, MSME, EDII TN | Pitch X 2026, Autohackathon 2023, EDII TN – IVP, DST NIDHI SSP via AIC – Anna Incubator, ITEL Foundation grant | **Resolved → PRD list:** Pitch X 2026, Autohackathon 2023, EDII TN – IVP, DST NIDHI SSP via AIC – Anna Incubator, ITEL Foundation grant. Startup TN and MSME dropped. Wording/logos still pending (PRD §8.6). |
| C5 | "Partners" labelling | Nav "Partners"; section "Ecosystem & Partnerships"; labels "Incubation partner", "Strategic supporter" | Public partnerships "NA"; don't imply commercial partnership | **Resolved → PRD:** "Recognition & support"; relationship kinds only, no "partner" labels. |
| C6 | Manufacturing claim | "Establishing an end-to-end R&D and manufacturing hub in Tamil Nadu"; "Designed and built in Tamil Nadu" | Production and prototypes involve external partners | **Resolved → PRD:** internal design/engineering vs partner-led prototyping and production; site claim dropped. |

## 1. Metadata

| Item | Current | Decision |
| --- | --- | --- |
| `<title>` | "Infintin Mobility Solutions - Rare-Earth-Free EV Motors" | **rewrite**: HVAC/FCU motors and controllers (PRD §10 SEO) |
| Meta description | none found | **rewrite**: new HVAC description |
| Footer tagline | "Pioneering Rare-Earth-Free Electric Motor Technology for Sustainable Global Clean Mobility." | **drop** (EV, absolute claim) |

## 2. Hero

| Item | Current | Decision | Claim id |
| --- | --- | --- | --- |
| Eyebrow | "Indigenous PM motors for HVAC" | **drop** (eyebrow pattern; "indigenous" and "PM" need approval) | `company.positioning` |
| H1 | "Engineering the future of motion" | **drop** (generic) | — |
| Lede | "Engineering rare-earth-free electric motors … HVAC and industrial applications." | **rewrite** to PRD positioning | `company.positioning`, `product.rare-earth` |
| Stat row | "0% rare earth magnet reliance", "96%+ peak converter efficiency", "100% indigenously designed in India", "IP67" | **drop** (unverified numeric claims, absolute "100%", stat-row pattern). Keep each as a withheld claim. | `product.rare-earth`, `product.converter-efficiency`, `company.indigenous`, `product.ingress-rating` |
| CTA | "Explore motors" | **rewrite**: "Talk to engineering" / "Explore the FCU motor" | — |
| Hero image | `Motor-1.png` (alt "rare-earth-free motor prototype") | **drop** (replaced by 3D); check whether it's a real photo usable on the product page | — |

## 3. About / vision

| Item | Decision | Claim id |
| --- | --- | --- |
| "Engineering blueprint — Next-generation rare-earth-free traction architecture" | **archive** (traction) | — |
| Vision: "high-efficiency electric motors completely independent of rare-earth materials like Neodymium and Dysprosium" | **rewrite** (HVAC focus; rare-earth wording pending) | `company.vision`, `product.rare-earth` |
| Three "technical approach" bullets (repetitive, mobility-oriented) | **rewrite** into one engineering-approach paragraph using PRD §8.4 approach | `project.approach` |
| "National Atmanirbhar commitment … end-to-end R&D and manufacturing hub in Tamil Nadu … domestic EV supply chains" | **rewrite** to "locally designed, with local sourcing and manufacturing partners" | `product.supply`, `company.manufacturing-model` |

## 4. Problem section

| Item | Decision | Claim id |
| --- | --- | --- |
| "40% of building energy consumed by HVAC… waste nearly a third" / "~30% power wasted" | **keep only with a cited source**; otherwise drop | `market.hvac-energy-share`, `market.induction-loss` (new, pending source) |
| Rare-earth supply bottleneck, "China's April 2025 export controls" | **keep with source**, neutral wording | `market.rare-earth-supply` (new, pending source) |
| Regulatory risk, OEM ESG pressure | **rewrite** concisely; no unsupported claims | `market.regulation` (new) |

## 5. Products

| Product | Current claims | Decision |
| --- | --- | --- |
| **FCU Motor** (`MotorV1.png`, alt "1kW SRM Motor"!) | 50–120 W (superseded: 50–250 W confirmed); rare-earth-free BLDC; 2–3 yr ROI; up to 60% energy saving; retrofit with FCUs | **rewrite** as "FCU Double Shaft Motor" hero product. Power range 50 W to 250 W (approved). ROI and savings **withheld**. "Retrofit with FCUs" → new pending claim `product.retrofit`. Image alt text is wrong. |
| **AHU Motor** (`MotorV2.jpg`) | Rare-earth-free reluctance motor; 2–3 yr ROI; up to 30% energy saving; standard frame size | **ask client**: PRD names AHU as a target area but not a product. Hide unless approved as a public product; never with ROI/savings figures. |
| **SRM Traction Platform** ("flagship", 1–60 kW, maintenance-free, zero demagnetisation risk) | **archive** (legacy EV); "maintenance-free" is an absolute claim to drop even in archive. |
| **Intelligent Power Converter** (sensorless algorithms, regen braking, CAN 2.0B) | **archive** or **rewrite** as the HVAC controller only if confirmed (`product.controller`). Do not disclose algorithm details (PRD IP guardrail). |

## 6. Technological edge

| Item | Decision |
| --- | --- |
| Rare-earth free | **withheld** (C2) |
| Fault-tolerant drive (independent phase isolation, fail-safe redundancy) | **drop** unless engineering confirms for the FCU product; SRM-specific |
| Interoperability with VFDs | **ask**; pending claim `product.vfd-compat` |
| IoT capability (telemetry, cloud analytics, predictive maintenance) | **ask**; pending claim `product.iot` |
| Comparison matrix (Infintin BLDC vs PM BLDC vs induction: magnets, rotor loss, manufacturing cost, fault tolerance) | **rewrite** as a qualitative comparison on supply chain, lead time, serviceability and application-specific design (PRD §5). Drop "low & stable cost" unless substantiated. |

## 7. Team

| Person | Current role text | Decision |
| --- | --- | --- |
| M. Augustine M.E., Ph.D. | Founder — Machine design (electromagnetic FEA, structural, thermal, SRM prototype testing) | **keep, pending** (`team.augustine`); trim SRM reference to motor design generally |
| A. Infantraj M.Tech.(, Ph.D.?) | Founder — Embedded systems (PM BLDC & SRM control, ML health monitoring, DSP firmware, inverter hardware) | **keep, pending** (`team.infantraj`); confirm degree (C3) |
| P. Chandrasekhar M.E. | Founder — Manufacturing & ops | **keep, pending** (`team.chandrasekhar`) |
| Mr. Karthik Anbalagan | Consultant — Brand & go-to-market | **keep, pending** (`team.anbalagan`) |
| M. Senthilkumaran (M.E.,) Ph.D. | Consultant — Controls & feedback | **keep, pending** (`team.senthilkumaran`); confirm degree (C3) |
| Wg. Cdr. E. J. Kennedy (Retd) | Consultant — Production & quality, 23 years IAF | **keep, pending** (`team.kennedy`); confirm name form (alt says "Edward Jeyaseelan Kennedy") |

Photos `founder1-3.png`, `advisor1-3.png` exist; confirm they may be reused and request higher-resolution originals.

## 8. Recognition & support

Use the PRD list (conflict C4 resolved): Pitch X 2026, Autohackathon 2023, EDII TN – IVP, DST NIDHI SSP via AIC – Anna Incubator, ITEL Foundation grant. Current-site entries Startup TN and MSME are dropped. Logos are text placeholders (initials), not real marks. Every entry → `recognition.*` pending, with relationship kind and permission flag.

## 9. Contact

| Item | Current | Decision |
| --- | --- | --- |
| Headline | "Let's build the future together" + "Interested in pilots, joint development and new product developments?" | **rewrite** for pilot/PoC framing (PRD §8.7) |
| Form | Full name, business email, project details | **rewrite** to PRD field set |
| Email | admin@infintin.in | **keep, pending** confirmation as public enquiry address (`contact.email`) |
| Phone | +91-9790395731, labelled "Call technical support" | **keep, pending**; drop "technical support" label (no support operation for a prototype) (`contact.phone`) |
| Address | No.10, Lakshmi Nagar, Guduvanchery – 603202, Tamil Nadu, India | **keep, pending** (`contact.address`) |
| Socials | none found | ask client |

## 10. New claim ids to add to the register

`product.converter-efficiency`, `product.ingress-rating`, `company.indigenous`, `company.vision`, `company.manufacturing-model`, `project.approach`, `product.retrofit`, `product.vfd-compat`, `product.iot`, `market.hvac-energy-share`, `market.induction-loss`, `market.rare-earth-supply`, `market.regulation`, `team.*` (6), `contact.email`, `contact.phone`, `contact.address`.
