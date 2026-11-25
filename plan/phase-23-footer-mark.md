# Phase 23 — Footer with the brand mark

**Status:** BUILT (awaiting review)
**Depends on:** Phase 22
**Source:** owner request, 25 Nov 2026, with a reference footer (a large
tone-on-tone brand mark on the left, link columns on the right, a rule, and
a closing strip). "Don't copy exactly, do it according to our theme."

## Objective

The Phase 22 footer is a ruled title block: correct, but every cell weighs
the same, so nothing reads first. The owner wants the reference's structure,
with one large quiet brand element and the links set calmly beside it, in
our own materials.

## Behaviour

- **Panel:** one raised graphite panel (the Lab's raised ground) inside the
  page margin, with a hairline frame and square corners. Our sheet has no
  rounded corners, so neither does this.
- **Mark:** the round Infintin glyph from the logo, large, filled in the
  Lab ground so it sits slightly *below* the panel (recessed, tone on tone).
  Flat silhouette: the logo is a raster, so it can't be outlined. It is
  decorative (hidden from assistive tech; the company name is in the strip).
- **Links:** three columns beside the mark, each with a small label: Pages
  (Product, Engineering, Talk to engineering), Contact (email, phone,
  address) and Profiles (LinkedIn).
- **Closing strip:** under a hairline, the copyright on the left and the
  registrations (DPIIT recognition and Udyam numbers) on the right.
- **Removed:** the vision line. The mark now carries the brand, and the
  reference has no text block there. Restore it on request.
- **Phones:** the mark comes first at a smaller size, the columns run two
  wide, and the strip stacks.

## Out of scope

- Contact page, header, closing bands. No new package. The vision claim
  stays in the content layer.

## Acceptance check

1. At 1440 × 900 the footer shows the mark on the left, three link columns
   on the right, and a strip with the copyright and both registration numbers.
2. The mark reads as a darker shape on the raised panel, with no glow or gradient.
3. At 390 px it stacks with no horizontal overflow.
4. Typecheck, lint on touched files and claims:check pass.
