# Phase 21 — Recognition redesign

**Status:** BUILT (awaiting review)
**Depends on:** Phase 20
**Source:** client review, 24 Nov 2026: "Give awards and industry
participation more visual prominence"; "Reduce repeated information".

## Objective

The Recognition sheet ("Awards, events and industry support") puts four
large event photos first and the awards last, about 3,800 px down at
1440 wide. PitchX shows up twice, once as an event and once as an award.
Reorder the sheet by weight, show each fact once, and make it shorter,
using the Founders and Capabilities vocabulary (framed cells edge to edge,
a label strip, corner labels on photos).

## Behaviour

- **Order:** Awards, then Events, then Support and registrations.
- **Awards** lead the sheet as one framed panel. The PitchX award sits
  beside its photograph (the award collage, uncropped); Autohackathon sits
  under it. Each award cell has a strip ("Award" and the year), then what
  was won at display size and who hosted it below. PitchX is no longer
  listed among the events.
- **Events:** the remaining events as framed cells edge to edge (3 / 1
  columns), each with its photo (event name as the corner label) and one
  line on what we did. No sequence numerals: the events aren't a sequence.
- **Support and registrations:** one framed panel. The programme support
  and grant entries as a list with their kind, then the two certificates
  as uncropped thumbnails that open full size, each with its title and
  registration detail.
- Award titles are split into what was won and who hosted it. Same
  approved words, nothing new.
- The awards plaques' large copper year is dropped (design direction §2:
  no big number + small label). Copper stays as the 2 px top edge of the
  Awards panel (the only panel with one) and the labels.
- The approval gating stays: an entry shows only once its claims are
  approved, and a sheet with nothing approved doesn't render.

## Out of scope

- Navigation and heading copy changes from the same review (their own phases).
- Third-party logos, including ones that appear inside the PitchX collage.
- No new claims, no new package.

## Acceptance check

1. At 1440 × 900 the first thing under the headline is the Awards panel,
   with PitchX beside its photo; PitchX appears once on the sheet.
2. The sheet is clearly shorter than before (was ≈3,800 px at 1440).
3. 390 px: everything stacks in the same order, with no horizontal overflow.
4. Certificates open full size in a new tab.
5. Typecheck, build and claims:check pass; lint is clean on the files touched.
