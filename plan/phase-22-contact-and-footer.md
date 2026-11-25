# Phase 22 — Contact page and footer redesign

**Status:** BUILT (awaiting review)
**Depends on:** Phase 21
**Source:** client review, 24 Nov 2026 ("The form is relatively long",
"Optional technical details should be visually separated from required
fields", "Provide examples inside technical input fields", "Reduce repeated
information"); owner request, 25 Nov 2026.

## Objective

The contact page stacks everything on the left: the heading, the channels
(which the footer repeats just below), and a list of topics that repeats the
form's enquiry types. The form mixes optional fields in with required ones,
and its optional section looks like the rest. The footer opens with a
second "Talk to engineering" call to action, which repeats the header and
the home page's closing band, and on the contact page points at itself.

## Behaviour

- **Contact, header:** the heading and the one-paragraph intro sit side by
  side across the sheet (stacked on phones).
- **Contact, form:** the required fields come first, in one group: name,
  work email, company, enquiry type, requirement. The requirement box shows
  an example of what to write.
- **Contact, optional details:** role, phone and the technical details
  (application, power, quantity, location, timeline) move into one optional
  panel, set apart from the required group by a raised ground and a hatched
  edge, collapsed by default so the form is short. Every field in it shows
  an example in its placeholder.
- **Contact, aside:** beside the form on desktop (stays in view while the
  form scrolls), the direct channels, email and phone, set large, then
  "What happens next" as three numbered steps (it is a sequence). The topics
  list is removed: the enquiry type field carries those choices.
- **Footer:** the drawing's title block. One framed grid across the page:
  the logo with the approved vision line; email, phone and address as
  labelled cells; the pages (Product, Engineering, Talk to engineering) and
  profiles (LinkedIn); the company's registrations (DPIIT recognition and
  Udyam numbers, read off the certificates). A closing strip with the
  copyright. No call-to-action block.
- No product status in the footer: the review asked for fewer repeats of it.

## Out of scope

- Sending the form (Phase 12), validation rules, field names, `?type=`.
- Home Inquiry band and the product page's closing band.
- Navigation changes from the same review. No new package.

## Acceptance check

1. `/contact` at 1440 × 900: heading and intro side by side; the form shows
   five required fields, then a collapsed optional panel that looks
   distinct; the aside stays in view while scrolling the form.
2. Opening the optional panel shows seven fields, each with an example.
3. The page shows no topics list, and the footer has no call-to-action block.
4. The footer reads as one title block on desktop and stacks cleanly at
   390 px, with no horizontal overflow on either page width.
5. A failed submit still lists errors and focuses the summary; the
   not-connected fallback still shows the composed message.
6. Typecheck, build, tests and claims:check pass; lint clean on touched files.
