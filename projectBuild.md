# Infintin — project build notes

## What this is

The website for Infintin Mobility Solutions, a startup building an
energy-efficient motor (the "FCU Double Shaft Motor") for the fans inside
fan coil units, the boxes that heat and cool rooms in offices and hotels.

The site's job: show HVAC manufacturers, investors and incubators what the
motor is, how far along it is (a prototype under lab testing), and get them
to talk to the engineers.

Three pages: a long scrolling home page, a product page, and a contact page.

## The idea behind the look

"The Drawing Set": the site reads like a set of engineering drawings. Pale
paper sheets alternate with a dark "lab", every section is a numbered sheet,
and copper is the one accent colour. The motor is a live 3D model you can
rotate, take apart and inspect, not a stock photo.

## Key decisions (and why)

- **Honesty first.** Every factual statement (specs, awards, names) lives in
  one register with an approval status. Only approved text reaches the live
  site, and a build check fails if anything unapproved leaks. Why: a startup
  that overclaims loses engineers' trust in one sentence.
- **Real 3D, one canvas.** One shared WebGL canvas drives every 3D view on a
  page, from a compressed model of the real CAD assembly. Why: one canvas is
  far cheaper for phones than one per section.
- **Real photos, one treatment.** Client photos (prototype, founders, events)
  are shown monochrome in hairline frames, with colour on hover. Why: they
  come from different cameras; monochrome makes them one set and keeps
  copper as the only accent. Labelled as photographs, never passed off as
  renders (and renders never passed off as photos).
- **Logo drawn in ink.** The client logo is used as a mask, so it takes the
  colour of whatever sheet it sits on; the full-colour emblem is the favicon.
  Why: the full-colour logo's grey text disappears on the dark lab.
- **Big originals stay out of git.** Phone photos (35 MB) live in
  `assets-src/photos/` locally; `scripts/photos.sh` makes small web copies
  and strips location data from them.
- **Contact form without a backend yet.** The form never pretends to have
  sent; delivery is a later phase.
- **Short form, optional extras tucked away.** Only the five fields needed
  to reply are required and shown; phone, role and technical details sit in
  a closed, visibly separate panel with an example in every field. Why: the
  client found the form long, and buyers fill in what they know.
- **Say each thing once.** PitchX is shown as the award it was, not also as
  an event; the footer has no second "Talk to engineering" block. Why: the
  client review flagged repeated information.
- **Footer with one big quiet mark.** The round Infintin glyph, large and
  in paper white on a light grey panel, the page ending light (no outline,
  since the logo is a picture, not a drawing) and the vision line under
  it, with pages, contact and
  profiles in three columns beside it and the registration numbers (DPIIT,
  Udyam) in a strip below. Why: the earlier ruled grid gave every cell the
  same weight; one big brand element gives the eye somewhere to land.

## Stack

- Next.js 16 (App Router, static pages), React 19, TypeScript (strict),
  Tailwind CSS 4.
- 3D: three.js with React Three Fiber and drei.
- Motion: GSAP + ScrollTrigger (scroll scenes), Lenis (smooth scroll),
  Framer Motion (small UI states), anime.js (line drawings).
- Biome for lint/format; Node's test runner for unit tests.

## How work happens

Spec-driven: each phase has a spec in `plan/`, `plan/Status.md` tracks where
things stand. Work goes on the `dev` branch and reaches `main` only by a PR
the owner merges; Vercel deploys `main` only (`vercel.json`).

## Checks before any merge

`npm run build`, `npm run typecheck`, `npm run lint`, `npm test`,
`npm run claims:check`.
