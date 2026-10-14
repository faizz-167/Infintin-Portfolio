"use client";

import { type ReactNode, useEffect, useRef } from "react";
import type { EnvironmentId } from "@/design/three-presets";
import { breakpoint } from "@/design/tokens";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useSheetStore } from "@/lib/sheets";

/** Which `gsap.matchMedia` branch a scene is being built for. */
export type SceneConditions = {
  desktop: boolean;
  touch: boolean;
  reduce: boolean;
};

export type SceneBuild = (
  tl: gsap.core.Timeline,
  ctx: { conditions: SceneConditions; root: HTMLElement },
) => void;

type ScrollSceneProps = {
  id: string;
  /** Sheet name for the title block. Omit for scenes that aren't a sheet. */
  sheet?: string;
  env?: EnvironmentId;
  /** Pin the scene while its timeline plays. */
  pin?: boolean;
  /** Tie the timeline to scroll position; otherwise it plays on entry. */
  scrub?: boolean;
  /** ScrollTrigger `end`; the scroll distance a pinned scene holds for. */
  end?: string;
  /** Adds the scene's tweens to `tl`. Selectors are scoped to the scene. */
  build?: SceneBuild;
  className?: string;
  children: ReactNode;
};

const media = {
  desktop: `(min-width: ${breakpoint.lg}px) and (prefers-reduced-motion: no-preference)`,
  touch: `(max-width: ${breakpoint.lg - 0.02}px) and (prefers-reduced-motion: no-preference)`,
  reduce: "(prefers-reduced-motion: reduce)",
};

/**
 * One scene of the page: a section that registers as a sheet and owns one
 * GSAP timeline driven by ScrollTrigger. Everything is created inside
 * `useGSAP`, so when `<Activity>` hides the page the triggers are reverted
 * and when it shows again they are rebuilt.
 *
 * Reduced motion builds the same timeline paused and jumps it to the end:
 * no scroll link, no pin, the scene simply shows its final state.
 */
export function ScrollScene({
  id,
  sheet,
  env,
  pin = false,
  scrub = false,
  end = "bottom top",
  build,
  className,
  children,
}: ScrollSceneProps) {
  const root = useRef<HTMLElement>(null);
  const register = useSheetStore((s) => s.register);
  const unregister = useSheetStore((s) => s.unregister);
  const setPassed = useSheetStore((s) => s.setPassed);
  // The latest build without rebuilding triggers on every render.
  const buildRef = useRef(build);
  buildRef.current = build;

  useEffect(() => {
    const element = root.current;
    if (!sheet || !element) return;
    register({ id, name: sheet, element });
    return () => unregister(id);
  }, [id, sheet, register, unregister]);

  useGSAP(
    () => {
      const element = root.current;
      if (!element) return;

      // Marks the sheet as passed from the moment its top crosses the middle
      // of the viewport to the end of the page (see lib/sheets.ts). Kept
      // outside matchMedia so it also runs under reduced motion.
      if (sheet)
        ScrollTrigger.create({
          trigger: element,
          start: "top center",
          end: "max",
          // Enter/leave-back, not isActive: at the very bottom of the page
          // the range ends and isActive drops, but the sheet is still passed.
          onEnter: () => setPassed(id, true),
          onLeaveBack: () => setPassed(id, false),
        });

      const mm = gsap.matchMedia();
      mm.add(
        media,
        (context) => {
          const conditions: SceneConditions = {
            desktop: context.conditions?.desktop === true,
            touch: context.conditions?.touch === true,
            reduce: context.conditions?.reduce === true,
          };
          const current = buildRef.current;
          if (!current) return;

          if (conditions.reduce) {
            const tl = gsap.timeline({ paused: true });
            current(tl, { conditions, root: element });
            tl.progress(1);
            return;
          }

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: element,
              start: pin ? "top top" : "top 75%",
              end,
              pin,
              scrub,
              toggleActions: scrub ? undefined : "play none none reverse",
            },
          });
          current(tl, { conditions, root: element });
        },
        element,
      );
    },
    { scope: root, dependencies: [id, sheet, pin, scrub, end] },
  );

  return (
    <section ref={root} id={id} data-env={env} className={className}>
      {children}
    </section>
  );
}
