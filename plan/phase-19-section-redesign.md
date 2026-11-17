# Phase 19 — Capabilities, Project and Questions redesign

**Status:** BUILT (awaiting review)
**Depends on:** Phase 18
**Reference:** turnoev.com (Inspo): framed panels with corner labels,
labelled column rows over a panel, hatched edge on the closing block.

## Objective

The three sheets share one layout today (a lone heading on the left, a list
on the right, a large empty area). Give each its own structure, using only
existing content and tokens (hairlines, hatch, copper, type scale).

## Behaviour

- **Capabilities** (inside Engineering): a grid of framed cells, edge to
  edge across the sheet. The heading is the first cell; each capability is
  a cell with its name as the corner label and its sentence below. The
  heading cell widens so the last row is always full (4 columns on desktop,
  2 on tablet, 1 on phones), whether or not the manufacturing line is shown.
- **Project spotlight** (revised twice after review): title across the
  sheet; Objective / Challenges / Approach strung along a copper dash-dot
  centre line (the hero's shaft axis) with a centre mark and leader for
  each and an arrowhead at the end. Vertical axis down the left on phones.
  No stage strip and no status panel: the stages are the Process sheet's,
  and "active development" in the label carries the status.
- **Questions**: the left column is a framed block with a hatched edge —
  heading, one line, and a "Talk to engineering" link to the form — that
  stays in view while the questions scroll on desktop. Questions are set
  larger (lede size).

- **Blueprint** ("Why we are building it", added after review): the problem
  and the approach as two framed panels side by side, the problem under a
  rule hatch, the approach under a 2 px object line, a direction arrow on
  their shared edge (desktop). Stacked on phones, no arrow.

## Out of scope

- New claims or copy beyond the Questions line and link.
- Changing the Process board, the comparison table or the approach figure.
- No new package.

## Acceptance check

1. At 1440 × 900 none of the three sheets has an empty half-column; the
   Capabilities grid's last row is full with and without the manufacturing
   claim.
2. Project shows the three blocks on the copper axis, marks centred on
   the line; at 390 px the axis is vertical with no horizontal overflow.
3. Questions block stays pinned while scrolling the list on desktop; at
   390 px it stacks above the questions.
4. Build, typecheck, lint, tests and claims:check pass.
