"use client";

import { type ReactNode, useRef } from "react";
import type { EnvironmentId } from "@/design/three-presets";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSceneStore } from "@/lib/store";

type SectionSweepProps = {
  /** Environment of the scene above, shown where the cut hasn't passed. */
  from: EnvironmentId;
  /**
   * A scene view whose 3D section plane follows the sweep, so the 2D cut
   * across the page and the cut through the motor read as one gesture.
   */
  viewId?: string;
  /** The incoming scene; it paints its own environment. */
  children: ReactNode;
};

/** Turns a view's section on or off; the reducer only has a toggle. */
export function setSection(viewId: string, on: boolean, t: number) {
  const { views, dispatch } = useSceneStore.getState();
  const view = views[viewId];
  if (!view) return;
  if (view.explorer.section.on !== on)
    dispatch(viewId, { type: "TOGGLE_SECTION" });
  if (on) dispatch(viewId, { type: "SET_SECTION", t });
}

/**
 * The environment change between scenes (design-direction §7, "section
 * sweep"): as the incoming scene scrolls up into view, a vertical cutting
 * line crosses the page left to right and the new environment is revealed
 * behind it. GSAP owns the clip and the line; the 3D cut only receives the
 * progress through the store.
 *
 * The old environment is a layer laid over the incoming scene and cut away,
 * rather than the new scene being clipped in over the old ground: a ground
 * painted underneath would cover the canvas, so a live view in the incoming
 * scene would never show (phase 07 finding).
 *
 * Reduced motion: no layer, no cut; the new environment is simply there.
 */
export function SectionSweep({ from, viewId, children }: SectionSweepProps) {
  const root = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "top top",
              scrub: true,
              onUpdate: ({ progress }) => {
                const cutting = progress > 0 && progress < 1;
                gsap.set(line.current, { autoAlpha: cutting ? 1 : 0 });
                if (viewId) setSection(viewId, cutting, progress);
              },
            },
          })
          .fromTo(
            cover.current,
            { clipPath: "inset(0% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 100%)" },
            0,
          )
          .fromTo(line.current, { left: "0%" }, { left: "100%" }, 0);

        // Leaving the section cut on would outlive the page (Activity hide).
        return () => {
          if (viewId) setSection(viewId, false, 0);
        };
      });
    },
    { scope: root, dependencies: [viewId] },
  );

  return (
    // Clipped sideways: the cut line ends a pixel past the right edge.
    <div ref={root} className="relative overflow-x-clip">
      {children}
      <div
        ref={cover}
        aria-hidden="true"
        data-env={from}
        className="pointer-events-none absolute inset-0 z-content motion-reduce:hidden"
        style={{ clipPath: "inset(0% 100% 0% 0%)" }}
      />
      <span
        ref={line}
        aria-hidden="true"
        className="pointer-events-none invisible absolute inset-y-0 z-content w-px bg-accent"
      />
    </div>
  );
}
