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
- **Awards** (revised after review, 25 Nov 2026) lead the sheet as a
  typeset record under a 2 px copper line, one row per award. The placing
  ("Winner", "Top 5") is set in the hero's expanded display; a copper centre
  line with an arrowhead runs from it to the competition name. Who hosted it
  sits under the name, and for PitchX the photo of the award cheque (cropped
  from the collage, without the hosts' logos) sits under that. PitchX is no
  longer listed among the events. The leaders draw in once on entry.
- **Events** (revised after review): a contact sheet. The photos hang at one
  height, each at its own ratio so none is cropped, with the event name and
  what we did below. Stacked on phones. No sequence numerals: the events
  aren't a sequence.
- **Support and registrations:** one framed panel. The programme support
  and grant entries as a list with their kind, then the two certificates
  as uncropped thumbnails that open full size, each with its title and
  registration detail.
- Award titles are split into placing, competition and host. Same approved
  words, nothing new.
- The awards plaques' large copper year is dropped (design direction §2:
  no big number + small label).
- The approval gating stays: an entry shows only once its claims are
  approved, and a sheet with nothing approved doesn't render.

## Out of scope

- Navigation and heading copy changes from the same review (their own phases).
- Third-party logos, including ones that appear inside the PitchX collage.
- No new claims, no new package.

## Acceptance check

1. At 1440 × 900 the first thing under the headline is the Awards record,
   "Winner" leading to Pitch X 2026; PitchX appears once on the sheet.
2. The three event photos share one height and none is cropped.
3. The sheet is clearly shorter than before (was ≈3,800 px at 1440).
4. 390 px: everything stacks in the same order, with no horizontal overflow.
5. Certificates open full size in a new tab.
6. Typecheck, build and claims:check pass; lint is clean on the files touched.
