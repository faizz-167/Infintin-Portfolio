"use client";

import { type ReactNode, useRef } from "react";
import type { EnvironmentId } from "@/design/three-presets";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSceneStore } from "@/lib/store";

type SectionSweepProps = {
  /** Environment of the scene above, shown where the cut hasn't passed. */
  from: EnvironmentId;
  /** Environment of the incoming scene (the children). */
  to: EnvironmentId;
  /**
   * A scene view whose 3D section plane follows the sweep, so the 2D cut
   * across the page and the cut through the motor read as one gesture.
   */
  viewId?: string;
  children: ReactNode;
  className?: string;
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
 * Reduced motion: no clip, no cut; the new environment is simply there.
 */
export function SectionSweep({
  from,
  to,
  viewId,
  children,
  className,
}: SectionSweepProps) {
  const root = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
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
            scene.current,
            { clipPath: "inset(0% 100% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)" },
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
    <div ref={root} data-env={from} className="relative overflow-x-clip">
      <div ref={scene} data-env={to} className={className}>
        {children}
      </div>
      <span
        ref={line}
        aria-hidden="true"
        className="pointer-events-none invisible absolute inset-y-0 w-px bg-accent"
      />
    </div>
  );
}
