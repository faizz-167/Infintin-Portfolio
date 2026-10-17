"use client";

import { type ReactNode, useEffect, useMemo, useRef } from "react";
import { type SceneBuild, ScrollScene } from "@/components/motion/ScrollScene";
import { SceneView } from "@/components/three/SceneView";
import { Button } from "@/components/ui/Button";
import type { PartId } from "@/data/types";
import { type CalloutAnchor, onCallouts } from "@/lib/calloutTrack";
import { driveCamera } from "@/lib/cameraDrive";
import { useSceneStore } from "@/lib/store";
import type { PortfolioCallout } from "./portfolioCallouts";

const VIEW = "portfolio";

// The view keeps the elevation poster's aspect at every width, so the poster
// fractions and the camera's travel distances hold. On desktop the box is
// centred in the pinned scene; the callout layer repeats the same box.
const STAGE_BOX =
  "lg:absolute lg:inset-x-0 lg:top-1/2 lg:mx-0 lg:aspect-[2706/1520] lg:-translate-y-1/2";

// Above: long enough to clear the blower wheel's rim in the close-up. Below:
// short, since the stand already reaches down towards the scene's edge.
const LEADER_ABOVE = "lg:h-[clamp(6rem,22vh,13rem)]";
const NOTE_ABOVE = "lg:bottom-[clamp(6rem,22vh,13rem)]";
const LEADER_BELOW = "lg:h-[clamp(3rem,9vh,5rem)]";
const NOTE_BELOW = "lg:top-[clamp(3rem,9vh,5rem)]";

// The shaft's axis, tracked like a callout so the centreline sits on it at
// every point of the travel. Poster: the shaft's height in the still.
const CENTRELINE: CalloutAnchor = { part: "shaft", at: [0.5, 0.5, 0.5] };
const CENTRELINE_POSTER = 0.498;

type PortfolioStageProps = {
  name: string;
  overview: ReactNode | null;
  status: ReactNode;
  /** Approved callouts only, in shaft order. */
  callouts: readonly (PortfolioCallout & { note: ReactNode })[];
  href: string;
};

/**
 * Sheet 03, the Lab: a teaser for the product page. The motor in elevation,
 * side-on and full-bleed; on desktop the scene pins and the camera travels
 * the shaft from the front wheel to the rear one, then pulls back to the
 * whole assembly. Each callout draws as the camera reaches its part; the
 * name and the link to the product sheet close the scene. Phones, reduced
 * motion and no-JS show the end state: the whole motor, every note, the
 * close. The explorer's instruments live on the product page only.
 */
export function PortfolioStage({
  name,
  overview,
  status,
  callouts,
  href,
}: PortfolioStageProps) {
  const tier = useSceneStore((s) => s.tier);
  const ready = useSceneStore((s) => s.views[VIEW]?.ready ?? false);
  const live = tier !== null && tier !== "poster";
  const items = useRef(new Map<PartId, HTMLLIElement>());
  const centreline = useRef<SVGSVGElement>(null);

  const anchors = useMemo<CalloutAnchor[]>(
    () => [CENTRELINE, ...callouts.map(({ part, at }) => ({ part, at }))],
    [callouts],
  );

  // Notes follow the live projection; without it they sit on the poster.
  useEffect(
    () =>
      onCallouts(VIEW, (positions) => {
        const axis = positions?.get(CENTRELINE.part);
        if (centreline.current) {
          centreline.current.style.top = axis
            ? `${axis.y}px`
            : `${CENTRELINE_POSTER * 100}%`;
        }
        for (const callout of callouts) {
          const item = items.current.get(callout.part);
          const point = positions?.get(callout.part);
          if (!item) continue;
          item.style.left = point
            ? `${point.x}px`
            : `${callout.poster[0] * 100}%`;
          item.style.top = point
            ? `${point.y}px`
            : `${callout.poster[1] * 100}%`;
        }
      }),
    [callouts],
  );

  // A drive left behind would outlive the page (Activity hide).
  useEffect(() => () => driveCamera(VIEW, null), []);

  const build: SceneBuild = (tl, { conditions }) => {
    if (!conditions.desktop) return;
    const drive = { p: 0 };
    driveCamera(VIEW, 0);
    tl.to(drive, {
      p: 1,
      duration: 1,
      ease: "none",
      onUpdate: () => driveCamera(VIEW, drive.p),
    });
    for (const { part, reveal } of callouts) {
      tl.fromTo(
        `[data-leader="${part}"]`,
        { scaleY: 0 },
        { scaleY: 1, duration: 0.06, ease: "none" },
        reveal,
      );
      tl.fromTo(
        `[data-note="${part}"]`,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.05, ease: "none" },
        reveal + 0.04,
      );
    }
    tl.fromTo(
      "[data-close]",
      { autoAlpha: 0, y: 24 },
      { autoAlpha: 1, y: 0, duration: 0.12, ease: "power2.out" },
      0.84,
    );
    return () => driveCamera(VIEW, null);
  };

  return (
    <ScrollScene
      id="portfolio"
      sheet="Portfolio"
      pin="desktop"
      scrub
      end="+=250%"
      build={build}
    >
      {/* Lab ground: painted around the view by the view itself, so the
          canvas shows through its box (globals.css, `ground-hole`). */}
      <div
        data-env="lab"
        data-ground={live && ready ? "canvas" : undefined}
        className="relative isolate flex flex-col gap-5 overflow-clip px-margin py-scene lg:block lg:h-svh lg:min-h-[40rem] lg:p-0"
      >
        <div className={`relative -mx-margin aspect-[2706/1520] ${STAGE_BOX}`}>
          <SceneView
            id={VIEW}
            shot="profile"
            poster="elevation"
            env="lab"
            callouts={anchors}
            // The close carries the status tag; the caption would sit under
            // its button.
            posterCaption={false}
            sizes="100vw"
            className="ground-hole size-full"
          />
          {/* The site's datum: the shaft centreline, edge to edge. */}
          <svg
            ref={centreline}
            aria-hidden="true"
            style={{ top: `${CENTRELINE_POSTER * 100}%` }}
            className="pointer-events-none absolute inset-x-0 h-px w-full overflow-visible text-ink-muted"
          >
            <line
              x1="0"
              x2="100%"
              y1="0.5"
              y2="0.5"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="24 6 3 6"
            />
          </svg>
        </div>

        {/* Real text, in shaft order. Desktop: each note hangs on a leader
            from its anchor, in a layer over the view. Phones: a list. */}
        <ol
          aria-label="Callouts"
          className={`pointer-events-none flex flex-col gap-2 lg:block ${STAGE_BOX}`}
        >
          {callouts.map((callout) => {
            const above = callout.side === "above";
            return (
              <li
                key={callout.part}
                ref={(item) => {
                  if (item) items.current.set(callout.part, item);
                  else items.current.delete(callout.part);
                }}
                style={{
                  left: `${callout.poster[0] * 100}%`,
                  top: `${callout.poster[1] * 100}%`,
                }}
                className="rule-hairline py-1 lg:absolute lg:size-0 lg:border-0 lg:p-0"
              >
                <span
                  aria-hidden="true"
                  className="absolute hidden size-1.5 -translate-1/2 rounded-full bg-ink lg:block"
                />
                <span
                  aria-hidden="true"
                  data-leader={callout.part}
                  className={`absolute left-0 hidden w-px bg-ink lg:block ${above ? `bottom-0 origin-bottom ${LEADER_ABOVE}` : `top-0 origin-top ${LEADER_BELOW}`}`}
                />
                <span
                  data-note={callout.part}
                  className={`block type-annotation text-ink lg:absolute lg:left-2 lg:w-max lg:max-w-64 ${above ? NOTE_ABOVE : NOTE_BELOW}`}
                >
                  {callout.note}
                </span>
              </li>
            );
          })}
        </ol>

        <div
          data-close=""
          className="flex flex-col gap-3 lg:absolute lg:bottom-0 lg:left-0 lg:max-w-[36rem] lg:px-margin lg:pb-5"
        >
          <h2 className="type-display-m">{name}</h2>
          <div>{status}</div>
          {overview && <p className="type-body text-ink-muted">{overview}</p>}
          <div>
            <Button href={href} arrow>
              Open the product sheet
            </Button>
          </div>
        </div>
      </div>
    </ScrollScene>
  );
}
