"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useEffect, useState } from "react";
import { initialExplorerState } from "@/components/explorer/explorer-machine";
import { PartsList } from "@/components/explorer/PartsList";
import type { PartName } from "@/components/explorer/partNames";
import { type SceneBuild, ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { useMotionPreference } from "@/components/motion/useMotionPreference";
import { SceneView } from "@/components/three/SceneView";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { driveExplode } from "@/lib/explodeDrive";
import { useSceneStore } from "@/lib/store";

const VIEW = "portfolio";

type PortfolioStageProps = {
  name: string;
  overview: ReactNode;
  status: ReactNode;
  specs: ReactNode;
  names: readonly PartName[];
  href: string;
};

/** Hands the explode to scroll: the parts follow `p` exactly while the scene
 * is pinned, and the explorer state takes over at either end, so the camera
 * frames the explode and the toggle shows what is on screen. */
function scrubExplode(p: number) {
  const { dispatch } = useSceneStore.getState();
  dispatch(VIEW, { type: p > 0 ? "EXPLODE" : "ASSEMBLE" });
  driveExplode(VIEW, p > 0 && p < 1 ? p : null);
}

/**
 * Sheet 03, the Lab. The motor beside its specification, with a compact
 * explorer (drag, explode, X-ray) and the parts list its balloons refer to.
 * On desktop the scene pins and scrolling opens the assembly along the
 * shaft; balloons come into view as the parts separate. Phones keep the
 * toggle instead of a scroll-held scene.
 */
export function PortfolioStage({
  name,
  overview,
  status,
  specs,
  names,
  href,
}: PortfolioStageProps) {
  const tier = useSceneStore((s) => s.tier);
  const ready = useSceneStore((s) => s.views[VIEW]?.ready ?? false);
  const state = useSceneStore(
    (s) => s.views[VIEW]?.explorer ?? initialExplorerState,
  );
  const dispatch = useSceneStore((s) => s.dispatch);
  const { transition } = useMotionPreference();
  const [listOpen, setListOpen] = useState(false);
  const live = tier !== null && tier !== "poster";

  // A drive left mid-way would outlive the page (Activity hide).
  useEffect(() => () => driveExplode(VIEW, null), []);

  const build: SceneBuild = (tl, { conditions }) => {
    if (!conditions.desktop) return;
    const drive = { p: 0 };
    tl.to(drive, {
      p: 1,
      duration: 1,
      ease: "none",
      onUpdate: () => scrubExplode(drive.p),
    });
    return () => driveExplode(VIEW, null);
  };

  return (
    <ScrollScene
      id="portfolio"
      sheet="Portfolio"
      pin="desktop"
      scrub
      end="+=150%"
      build={build}
    >
      {/* Lab ground: painted around the view by the view itself, so the
          canvas shows through its box (globals.css, `ground-hole`). */}
      <div
        data-env="lab"
        data-ground={live && ready ? "canvas" : undefined}
        className="isolate flex flex-col gap-5 overflow-clip px-margin py-scene lg:grid lg:h-svh lg:min-h-[40rem] lg:grid-cols-12 lg:gap-x-gutter lg:gap-y-0 lg:pt-[calc(var(--spacing-header)+var(--spacing-4))] lg:pb-5"
      >
        <SceneView
          id={VIEW}
          shot="hero"
          poster="hero"
          env="lab"
          rotate
          explore
          label="3D view of the motor assembly. Drag or use the arrow keys to turn it; the parts list describes each part."
          sizes="(min-width: 64rem) 66vw, 100vw"
          className="ground-hole order-2 aspect-[4/3] w-full lg:order-none lg:col-span-8 lg:aspect-auto lg:h-full"
        />

        {/* Phones: name, then the motor, then the details. */}
        <div className="contents lg:col-span-4 lg:flex lg:min-h-0 lg:flex-col lg:gap-4">
          <div className="order-1 flex flex-col gap-2 lg:order-none">
            <SplitHeadline className="type-display-m">{name}</SplitHeadline>
            <div>{status}</div>
            <p className="type-body text-ink-muted">{overview}</p>
          </div>

          <div className="order-3 flex min-h-0 flex-col gap-4 lg:order-none lg:contents">
            <div className="flex flex-wrap gap-1">
              <Button
                variant="secondary"
                pressed={state.exploded}
                onClick={() =>
                  dispatch(VIEW, {
                    type: state.exploded ? "ASSEMBLE" : "EXPLODE",
                  })
                }
              >
                Explode
              </Button>
              <Button
                variant="secondary"
                pressed={state.mode === "xray"}
                onClick={() =>
                  dispatch(VIEW, {
                    type: "SET_MODE",
                    mode: state.mode === "xray" ? "shaded" : "xray",
                  })
                }
              >
                X-ray
              </Button>
            </div>

            {specs}

            {/* The balloons' key. Folded by default: open, it scrolls inside
              the pinned scene rather than pushing the page. */}
            <div className="flex min-h-0 flex-col">
              <button
                type="button"
                aria-expanded={listOpen}
                onClick={() => setListOpen((open) => !open)}
                className="flex min-h-target w-full shrink-0 cursor-pointer items-center justify-between border-rule border-t type-annotation text-ink"
              >
                Parts list
                <span aria-hidden="true">{listOpen ? "−" : "+"}</span>
              </button>
              <AnimatePresence initial={false}>
                {listOpen && (
                  <motion.div
                    key="parts"
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={transition("move")}
                    data-lenis-prevent=""
                    className="min-h-0 overflow-hidden lg:overflow-y-auto"
                  >
                    <PartsList viewId={VIEW} names={names} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="type-annotation lg:mt-auto">
              <TextLink href={href}>Open the full explorer</TextLink>
            </p>
          </div>
        </div>
      </div>
    </ScrollScene>
  );
}
