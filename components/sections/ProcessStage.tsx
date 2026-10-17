"use client";

import { type SceneBuild, ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { processStages } from "@/data/process";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { ProcessBoard } from "./ProcessBoard";
import { OwnerMark, STATE_LABEL } from "./ProcessMarks";

/** Board timeline units: each run takes one, its tile lights as it lands. */
const RUN = 1;
const LIGHT = 0.3;
/** Scroll held on the finished board before the pin lets go. */
const HOLD = 0.8;
/** Floor bloom under the current tile, as drawn (`opacity-35`). */
const BLOOM = 0.35;

/**
 * Desktop: scroll draws the trace run by run while the board travels right
 * to left. The head follows the solid runs and parks under the current tile;
 * dashed runs to upcoming stages draw without it, so the copper stops where
 * the work stops.
 */
function buildBoard(tl: gsap.core.Timeline, root: HTMLElement) {
  const reveals = root.querySelectorAll<SVGPathElement>(".process-reveal");
  const traces = root.querySelectorAll<SVGPathElement>(".process-trace");
  const tiles = root.querySelectorAll<HTMLElement>(".process-tile");
  const labels = root.querySelectorAll<HTMLElement>(".process-label");
  const head = root.querySelector<SVGCircleElement>(".process-head");
  const board = root.querySelector<HTMLElement>(".process-board");
  const view = board?.parentElement;
  if (!head || !board || !view) return;

  // Travel is linear with the drawing and the tiles are evenly spaced, so the
  // head crosses the viewport steadily from left to right as the board moves.
  tl.fromTo(
    board,
    { x: 0 },
    {
      x: () => -Math.max(0, board.offsetWidth - view.clientWidth),
      duration: processStages.length * RUN + LIGHT,
      ease: "none",
    },
    0,
  );

  // Every tween states both ends: the timeline is invalidated on resize to
  // remeasure the travel, and a `from` would re-record its end from the
  // start state it is showing at that moment.
  tl.fromTo(
    head,
    { autoAlpha: 0 },
    { autoAlpha: 1, duration: LIGHT, ease: "none" },
    0,
  );

  processStages.forEach((stage, index) => {
    const reveal = reveals[index];
    const trace = traces[index];
    const tile = tiles[index];
    const label = labels[index];
    if (!reveal || !trace || !tile || !label) return;
    const start = index * RUN;
    const lands = start + RUN;

    const solid = stage.state !== "upcoming";
    const length = trace.getTotalLength();
    // fromTo renders its start state at once (before the tween is even
    // assigned), so the head reads the drawn fraction off the mask path.
    tl.fromTo(
      reveal,
      { strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        duration: RUN,
        ease: "none",
        onUpdate: solid
          ? () => {
              const drawn =
                1 -
                Number.parseFloat(
                  String(gsap.getProperty(reveal, "strokeDashoffset")),
                );
              const point = trace.getPointAtLength(drawn * length);
              head.setAttribute("cx", String(point.x));
              head.setAttribute("cy", String(point.y));
            }
          : undefined,
      },
      start,
    );

    const lit = tile.querySelectorAll(".process-lit");
    if (lit.length)
      tl.fromTo(
        lit,
        { opacity: 0 },
        { opacity: 1, duration: LIGHT, ease: "none" },
        lands,
      );
    const bloom = tile.querySelector(".process-bloom");
    if (bloom)
      tl.fromTo(
        bloom,
        { opacity: 0 },
        { opacity: BLOOM, duration: LIGHT * 2, ease: "none" },
        lands,
      );

    // A reached tile is pressed a few pixels and released; no overshoot.
    const cap = tile.querySelector(".process-cap");
    if (cap && solid)
      tl.fromTo(
        cap,
        { z: 0 },
        { z: -4, duration: LIGHT / 2, ease: "machine", immediateRender: false },
        lands,
      ).fromTo(
        cap,
        { z: -4 },
        { z: 0, duration: LIGHT, ease: "settle", immediateRender: false },
      );

    tl.fromTo(
      label,
      { autoAlpha: 0, y: 6 },
      { autoAlpha: 1, y: 0, duration: LIGHT, ease: "settle" },
      lands - LIGHT / 2,
    );
  });

  tl.to({}, { duration: HOLD });

  // The travel distance depends on the viewport; measure it again on resize.
  const remeasure = () => tl.invalidate();
  ScrollTrigger.addEventListener("refreshInit", remeasure);
  return () => ScrollTrigger.removeEventListener("refreshInit", remeasure);
}

const build: SceneBuild = (tl, { conditions, root }) => {
  if (conditions.reduce) return;
  if (conditions.desktop) return buildBoard(tl, root);

  // Phones: the line draws down the list as it is read.
  const track = root.querySelector<HTMLElement>(".process-track");
  if (!track) return;
  gsap.fromTo(
    root.querySelectorAll(".process-segment"),
    { clipPath: "inset(0% 0% 100% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "none",
      stagger: 0.5,
      scrollTrigger: {
        trigger: track,
        start: "top 70%",
        end: "bottom 70%",
        scrub: true,
      },
    },
  );
};

/**
 * Sheet 05. The development process as eleven numbered stages (numbering is
 * justified: the stages are sequential). Complete stages are solid ink, the
 * current stage is copper with its label, upcoming stages are dashed.
 * Ownership appears only once the internal/external split is approved.
 *
 * Desktop with motion allowed (ScrollScene's desktop branch, the
 * `lg:motion-safe:` classes) shows the stages as a tilted board of tiles
 * joined by one trace; phones and reduced motion read the same stages as a
 * list top to bottom. Only one of the two is ever displayed, so a screen
 * reader hears the stages once.
 */
export function ProcessStage({ showOwners }: { showOwners: boolean }) {
  return (
    <ScrollScene
      id="process"
      sheet="Process"
      env="sheet"
      pin="desktop"
      scrub
      end="+=350%"
      build={build}
      className={`flex flex-col gap-6 overflow-x-clip py-scene lg:motion-safe:h-svh lg:motion-safe:min-h-[36rem] lg:motion-safe:justify-center lg:motion-safe:gap-4 lg:motion-safe:py-0`}
    >
      <div className="flex flex-col gap-3 px-margin lg:flex-row lg:items-end lg:justify-between">
        <SplitHeadline className="type-display-l lg:w-1/2">
          From requirement to production
        </SplitHeadline>
        <ul
          aria-label="Key"
          className="flex flex-wrap gap-x-3 gap-y-1 type-caption text-ink-muted"
        >
          <li className="flex items-center gap-1">
            <span aria-hidden="true" className="size-[0.6875rem] bg-ink" />
            Complete
          </li>
          <li className="flex items-center gap-1">
            <span aria-hidden="true" className="size-[0.6875rem] bg-accent" />
            Current stage
          </li>
          <li className="flex items-center gap-1">
            <span
              aria-hidden="true"
              className="size-[0.6875rem] border border-ink-muted border-dashed"
            />
            Upcoming
          </li>
        </ul>
      </div>

      {/* Without scripting nothing pins, so the board scrolls on its own. */}
      <div className="hidden overflow-clip pb-4 lg:motion-safe:block [@media(scripting:none)]:overflow-x-auto">
        <ProcessBoard showOwners={showOwners} />
      </div>

      <ol className="process-track flex flex-col px-margin lg:motion-safe:hidden">
        {processStages.map((stage, index) => {
          const current = stage.state === "current";
          const done = stage.state === "complete";
          return (
            <li
              key={stage.id}
              className="relative flex flex-col gap-1 pb-5 pl-5"
            >
              {/* This stage's stretch of the line, from its node on. */}
              <span
                aria-hidden="true"
                className={`process-segment absolute top-0 bottom-0 left-[0.3125rem] border-l ${
                  done ? "border-ink" : "border-ink-muted border-dashed"
                }`}
              />
              <span
                aria-hidden="true"
                className={`absolute top-0 left-0 size-[0.6875rem] border ${
                  current
                    ? "border-accent bg-accent"
                    : done
                      ? "border-ink bg-ink"
                      : "border-ink-muted border-dashed bg-ground"
                }`}
              />
              <span className="type-data text-ink-muted">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="type-annotation text-[1.0625rem] text-ink">
                {stage.name}
              </span>
              <span
                className={`type-caption ${current ? "text-accent" : "sr-only"}`}
              >
                {STATE_LABEL[stage.state]}
              </span>
              {showOwners && <OwnerMark owner={stage.owner} />}
            </li>
          );
        })}
      </ol>
    </ScrollScene>
  );
}
