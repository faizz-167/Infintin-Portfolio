"use client";

import { type SceneBuild, ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { processStages } from "@/data/process";
import type { StageOwner, StageState } from "@/data/types";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const OWNER_LABEL: Record<StageOwner, string> = {
  internal: "In-house",
  external: "With partners",
  shared: "In-house and with partners",
  unconfirmed: "To be confirmed",
};

const STATE_LABEL: Record<StageState, string> = {
  complete: "Complete",
  current: "Current stage",
  upcoming: "Upcoming",
};

/** Ownership by line style, always beside its label (never style alone). */
function OwnerMark({ owner }: { owner: StageOwner }) {
  const style = {
    internal: "border-t",
    external: "h-[3px] border-y",
    shared: "h-[3px] border-y border-dashed",
    unconfirmed: "border-t border-dotted",
  }[owner];
  return (
    <span className="flex items-center gap-1 type-caption text-ink-muted">
      <span aria-hidden="true" className={`w-3 border-ink-muted ${style}`} />
      {OWNER_LABEL[owner]}
    </span>
  );
}

const build: SceneBuild = (tl, { conditions, root }) => {
  if (conditions.reduce) return;
  const track = root.querySelector<HTMLElement>(".process-track");
  const segments = root.querySelectorAll(".process-segment");
  if (!track) return;

  if (conditions.desktop) {
    // Vertical scroll drives travel along the centre line; the line is drawn
    // just ahead of the stages it joins.
    tl.fromTo(
      track,
      { x: 0 },
      {
        x: () => -(track.scrollWidth - root.clientWidth),
        ease: "none",
        duration: 1,
      },
      0,
    ).fromTo(
      segments,
      { clipPath: "inset(0% 100% 0% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        ease: "none",
        duration: 0.12,
        stagger: 0.08,
      },
      0,
    );
    // The travel distance depends on the viewport; measure it again on resize.
    const remeasure = () => tl.invalidate();
    ScrollTrigger.addEventListener("refreshInit", remeasure);
    return () => ScrollTrigger.removeEventListener("refreshInit", remeasure);
  }

  // Phones: the line draws down the list as it is read.
  gsap.fromTo(
    segments,
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
 * Sheet 05. The development process as eleven numbered stages on the shaft
 * centre line (numbering is justified: the stages are sequential). Complete
 * stages sit on a solid line, upcoming ones on a dashed line, and the current
 * stage is marked in copper with its label. Ownership appears only once the
 * internal/external split is approved.
 *
 * The row runs horizontally only on ScrollScene's desktop branch (lg, motion
 * allowed: the `lg:motion-safe:` classes); phones and reduced motion read
 * the same list top to bottom.
 */
export function ProcessStage({ showOwners }: { showOwners: boolean }) {
  return (
    <ScrollScene
      id="process"
      sheet="Process"
      env="sheet"
      pin="desktop"
      scrub
      end="+=200%"
      build={build}
      className={`flex flex-col gap-6 py-scene lg:motion-safe:h-svh lg:motion-safe:min-h-[36rem] lg:motion-safe:justify-center lg:motion-safe:py-0`}
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
            <span aria-hidden="true" className="w-3 border-ink border-t" />
            Complete
          </li>
          <li className="flex items-center gap-1">
            <span aria-hidden="true" className="size-1 bg-accent" />
            Current stage
          </li>
          <li className="flex items-center gap-1">
            <span
              aria-hidden="true"
              className="w-3 border-ink-muted border-t border-dashed"
            />
            Upcoming
          </li>
        </ul>
      </div>

      {/* Without scripting nothing pins, so the row scrolls on its own. */}
      <div className="overflow-x-clip [@media(scripting:none)]:overflow-x-auto">
        <ol
          className={`process-track flex flex-col px-margin lg:motion-safe:w-max lg:motion-safe:flex-row`}
        >
          {processStages.map((stage, index) => {
            const current = stage.state === "current";
            const done = stage.state === "complete";
            return (
              <li
                key={stage.id}
                className={`relative flex flex-col gap-1 pb-5 pl-5 lg:motion-safe:w-[16rem] lg:motion-safe:pt-5 lg:motion-safe:pr-gutter lg:motion-safe:pb-0 lg:motion-safe:pl-0`}
              >
                {/* This stage's stretch of the centre line, from its node on. */}
                <span
                  aria-hidden="true"
                  className={`process-segment absolute top-0 bottom-0 left-[0.3125rem] border-l lg:motion-safe:top-[0.3125rem] lg:motion-safe:right-0 lg:motion-safe:bottom-auto lg:motion-safe:left-0 lg:motion-safe:border-t lg:motion-safe:border-l-0 ${
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
                        : "border-ink-muted bg-ground"
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
      </div>
    </ScrollScene>
  );
}
