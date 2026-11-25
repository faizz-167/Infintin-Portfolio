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

- **Panel:** one raised panel (the Sheet's raised grey ground, on paper)
  inside the page margin. The footer is light: the owner asked for a light
  background and mark (25 Nov 2026), replacing the earlier dark Lab footer.
  The panel has a hairline frame and square corners. Our sheet has no
  rounded corners, so neither does this.
- **Mark:** the round Infintin glyph from the logo, large, filled in the
  paper ground, so it reads as a light mark set into the grey panel.
  Flat silhouette: the logo is a raster, so it can't be outlined. It is
  decorative (hidden from assistive tech; the company name is in the strip).
- **Links:** three columns beside the mark, each with a small label: Pages
  (Product, Engineering, Talk to engineering), Contact (email, phone,
  address) and Profiles (LinkedIn).
- **Closing strip:** under a hairline, the copyright on the left and the
  registrations (DPIIT recognition and Udyam numbers) on the right.
- **Vision line:** the approved vision line sits under the mark, in the
  muted lede style (owner asked for it back, 25 Nov 2026).
- **Phones:** the mark comes first at a smaller size, the columns run two
  wide, and the strip stacks.

## Out of scope

- Contact page, header, closing bands. No new package. The vision claim
  stays in the content layer.

## Acceptance check

1. At 1440 × 900 the footer shows the mark on the left with the vision line
   under it, three link columns
   on the right, and a strip with the copyright and both registration numbers.
2. The mark reads as a lighter shape on the grey panel, with no glow or gradient.
3. At 390 px it stacks with no horizontal overflow.
4. Typecheck, lint on touched files and claims:check pass.
