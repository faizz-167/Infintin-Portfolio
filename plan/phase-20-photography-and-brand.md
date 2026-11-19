# Phase 20 — Client photography and logo

**Status:** BUILT (awaiting review)
**Depends on:** Phase 19
**Source:** client assets, 18 Nov 2026: logo, three founder portraits, twelve
prototype photos, four event photos and an event list.

## Objective

Put the client's real assets on the site where each one proves something:
the logo as identity, the prototype photos as proof the motor exists, the
founder portraits on the people, the event photos as proof of public showing.

## Behaviour

- **Logo**: replaces the text wordmark in the header and sits in the footer,
  drawn in the current ink (CSS mask) so it reads on Sheet and Lab alike.
  The emblem, in brand colours, is the favicon and touch icon.
- **Founders** (Leadership redesigned, client, 19 Nov 2026): headline with
  a one-line intro beside it, then three framed cells edge to edge (3 / 1
  columns). Each cell: a strip with its number and "Founder", the 4:3
  portrait across the cell, the discipline in copper, the name, and what the
  discipline covers. Roles are split into discipline + focus claims.
  Consultants are removed from the site.
- **Events**: Recognition opens with an Events row (4 / 2 / 1 columns):
  photo with the event name as corner label, one line on what we did. The
  awards register follows under "Awards and support". Names and captions are
  claims; an event shows only with both approved.
- **Prototype, home**: the Engineering sheet's approach list sits beside
  the Three-quarter photograph (4:3 crop) instead of the live isolate view;
  the list is plain text, nothing to select (client, 19 Nov 2026). The
  Project sheet has no photo (removed at client request).
- **Prototype, product page**: a "Photographs" sheet between Specification
  and Questions: the lead view across the sheet, four more in pairs, each
  with its view (Elevation, Three-quarter, Plan…) as the corner label.
- One photo treatment everywhere: hairline frame, cropped to the frame,
  monochrome, colour under a hovering pointer. Photos always lazy-load.
- Originals stay out of git (`assets-src/photos/`); `scripts/photos.sh`
  makes the web versions and strips EXIF (phone GPS).

## Out of scope

- Lightbox / zoom, logos of third parties.
- No new package.

## Acceptance check

1. Header and footer show the logo in ink on both environments; the tab
   shows the emblem.
2. `/` shows founder portraits, the Engineering photograph and four event photos;
   the product page shows five labelled photographs.
3. 390 px: no horizontal overflow; photos stack.
4. Build, typecheck, lint, tests and claims:check pass.
