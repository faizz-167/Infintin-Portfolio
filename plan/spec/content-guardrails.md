# Content Guardrails & Claims Register

Source of truth: `prd.md`. PRD wins over the original brief **and over the current infintin.in content** wherever they conflict (client decisions, 2026-10-13).

## 1. Brief → PRD reconciliation

| Brief asked for | Resolution |
| --- | --- |
| Rare-earth-free SRM/BLDC platforms for mobility, HVAC, industrial | HVAC-first. FCU Double Shaft Motor is the hero product. Mobility/industrial only as approved R&D/heritage context, labelled with status. |
| "0% rare-earth magnet reliance" | Withheld. The model itself contains a `magnet` part; PRD requires engineering to confirm "rare-earth-free" vs "heavy-rare-earth-free" wording before anything is published. |
| High efficiency, fault tolerance | Withheld until test data with conditions exists. Engineering *approach* (low-core-loss laminations, copper fill factor, controller tuning on testbed data) may be described qualitatively once approved. |
| Make-in-India / Atmanirbhar | Phrase as "locally designed, with local sourcing and manufacturing partners", pending approval. No "100% made in India" / "fully indigenous". |
| Technological edge & comparison | Qualitative comparison only (supply chain, lead time, serviceability, application-specific design). No numeric comparison without comparable, valid data. |
| Founder bios | Carried from current site as `pending` until re-confirmed. |
| Partnerships | Company marked public partnerships "NA". Section is "Recognition & support", never "partners". |
| Contact without API | Deferred decision; see architecture §8. |

## 2. Claims register (initial)

| Claim id | Draft text | Status | Qualifier / note |
| --- | --- | --- | --- |
| `product.name` | FCU Double Shaft Motor | pending | Confirm naming/capitalisation |
| `product.status` | Prototype — under laboratory testing | approved | Re-confirm at launch |
| `product.power-range` | 50 W to 250 W | approved | Client confirmed 2026-10-13; supersedes current site's 50–120 W |
| `product.application` | Fan coil units, 1 to 2 TR | pending | Confirm configurations |
| `product.energy-saving` | Up to 60% | withheld | Needs baseline, method, evidence |
| `product.payback` | 2 to 3 years | withheld | Clarify metric + assumptions |
| `product.noise` | Low-noise operation | pending | Qualitative only |
| `product.controller` | Controller designed for HVAC | pending | Integration scope |
| `product.rare-earth` | (wording TBD by engineering) | withheld | Mandatory technical confirmation |
| `product.supply` | Locally designed, short lead times, serviceable | pending | Manufacturing/service model |
| `company.positioning` | PRD §5 positioning statement | pending | Sourcing wording |
| `process.ownership` | Internal vs external stage split | pending | PRD lists 3D modelling in both |
| `recognition.*` | Pitch X 2026, Autohackathon 2023, EDII TN – IVP, DST NIDHI SSP via AIC – Anna Incubator, ITEL Foundation grant | pending | Names, wording, logo permissions |
| `team.*` | Founder/advisor names, titles, bios, photos | pending | Re-confirm all |
| `product.dimensions` | CAD envelope ≈124 × 156 × 705 mm | withheld | Engineering approval required |
| `product.converter-efficiency` | 96%+ peak converter efficiency (current site) | withheld | Needs test conditions |
| `product.ingress-rating` | IP67 (current site) | withheld | Needs certification evidence |
| `company.indigenous` | "100% indigenously designed in India" (current site) | withheld | Absolute claim; PRD forbids without substantiation |
| `company.vision` | Vision statement (to be rewritten for HVAC) | pending | |
| `company.manufacturing-model` | Internal design, partner prototyping and production | pending | Replaces "end-to-end manufacturing hub" |
| `project.approach` | PRD §8.4 approach (magnet selection, low-core-loss laminations, copper fill, testbed-tuned controller) | pending | Magnet wording tied to `product.rare-earth` |
| `product.retrofit` | Retrofit with existing FCUs | pending | From current site |
| `product.vfd-compat` | Interoperability with VFDs | pending | From current site |
| `product.iot` | IoT telemetry capability | pending | From current site |
| `market.*` | HVAC energy share, induction-motor losses, rare-earth export controls, efficiency regulation | pending | Each needs a cited public source |
| `contact.email` / `contact.phone` / `contact.address` | admin@infintin.in · +91-9790395731 · Guduvanchery, Tamil Nadu | pending | Confirm as public enquiry channels |
| `parts.*` | Part names derived from CAD nodes (blower wheel, windings, etc.) | pending | Engineering confirms naming; no material claims |

## 3. Open questions for the client

PRD links to "§17 Open Questions" but the section is missing from `prd.md`. Collected here:

1. ~~Rare-earth terminology~~ — resolved 2026-11-05: both heavy-rare-earth-free and fully rare-earth-free versions, to the customer's requirement. Magnet material still not stated.
2. Approved public spec sheet — partly resolved 2026-11-05: voltage, speed, mounting, supply published; see 16–22 for the rest.
3. Are the CAD part names correct for public display (e.g. "turbine" → blower wheel, "coil for max 1/2/3")? Is showing the internal magnet/rotor geometry acceptable IP-wise?
4. Does the product include the controller? Is there a controller model or photo?
5. Real prototype / lab photographs available? (Renders must be labelled as renders.)
6. Founder/advisor data and photos; recognition logos and permission.
7. Brand: logo vector, any existing colour/type rules the new direction must respect.
8. Contact transport, recipient, retention, spam protection (deferred).
9. Legacy EV products: archive with status label, or remove entirely?
10. Domain/canonical URL and hosting target (affects metadata, sitemap, OG images).
11. ~~FCU power range~~ — resolved 2026-10-13: 50 W to 250 W.
12. ~~Support list~~ — resolved 2026-10-13: use the PRD list; wording and logo permissions still to confirm (Q6).
13. ~~AHU motor~~ — resolved 2026-11-05: target market with R&D in progress; first release is FCU only, so nothing about AHU is published.
14. Exact degrees: A. Infantraj (M.Tech. or M.Tech., Ph.D.), M. Senthilkumaran (Ph.D. or M.E., Ph.D.), name form for Wg. Cdr. E. J. Kennedy. (C3)
15. Are the existing photos (`Motor-1.png`, founder and advisor portraits) real photographs cleared for reuse? Higher-resolution originals?
16. Payback: where does the "measured" 38% saving come from, given the lab study is still running? With an answer, "about 3 years" can be published with its assumptions (Rs 5,500, 16 h/day, Rs 12/kWh, vs IE3 induction motor).
17. Torque: 0.6 Nm at 1200 RPM is about 75 W, but the approved power range runs to 250 W. Which figure is right, or at what operating point is 0.6 Nm rated?
18. Dimensions: Ø110 × 78 mm, but the CAD motor body measures about Ø119 × 131 mm. Which is right, and what does each include?
19. Shaft: is 470 mm the tip-to-tip length of the double shaft, and is Ø12.75 mm exact?
20. Noise "below 30 dB": dBA? Measured at what distance and speed?
21. Operating temperature 40 °C: maximum ambient?
22. Protection features and warranty: not answered.
23. Energy saving (up to 60%): held until the lab study completes; send results with test conditions.
