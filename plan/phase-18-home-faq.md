# Phase 18 — Home FAQ

**Status:** BUILT (awaiting check)
**Depends on:** Phase 17
**Runs before:** Phase 11 (closing)

## Objective

A "Questions" sheet on the home page, just before the Inquiry sheet, using
the product's existing FAQ so nothing new needs client approval.

## Behaviour

- Same questions and answers as the product page, in the same order. Only
  items whose answer claim is approved are shown; if none are, the sheet is
  left out (like other scenes without approved content).
- Disclosure list on the paper ground, heading "Questions", no new styling.
- It is one of the numbered sheets, so the title block counts it.
- Answers are in the HTML without JavaScript (disclosures, not script).

## Out of scope

- New FAQ copy, a separate home-only set, FAQ structured data.
- No new package.

## Acceptance check

1. `/` shows the Questions sheet between the last content sheet and Inquiry,
   with the approved items; each opens and closes.
2. With every FAQ claim withheld, the sheet is absent and the sheet count
   drops by one.
3. Build, typecheck, lint, tests and claims:check pass.
