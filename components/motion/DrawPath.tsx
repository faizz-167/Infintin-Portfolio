"use client";

import {
  createDrawable,
  createTimeline,
  cubicBezier,
  stagger,
  type Timeline,
} from "animejs";
import { type ReactNode, useRef } from "react";
import { duration, ease } from "@/design/tokens";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";

type DrawPathProps = {
  /**
   * An inline SVG. Strokes marked `data-draw="line"` draw first, then those
   * marked `data-draw="tick"` (ticks, arrowheads, dimension text leaders).
   */
  children: ReactNode;
  /** "enter" draws once on entering view; "scrub" ties the drawing to scroll. */
  mode?: "enter" | "scrub";
  /** ScrollTrigger start/end for scrub mode. */
  start?: string;
  end?: string;
  className?: string;
};

const drawEase = cubicBezier(...ease.draw);

/**
 * Line drawing for blueprint art: anime.js owns the strokes (`createDrawable`),
 * ScrollTrigger only says when (enter) or how far (scrub). Lines draw with
 * `ease-draw`, ticks follow once the lines are down.
 *
 * Without JavaScript, or under reduced motion, the SVG is simply drawn.
 */
export function DrawPath({
  children,
  mode = "enter",
  start = "top 80%",
  end = "bottom 40%",
  className,
}: DrawPathProps) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const lines = createDrawable(el.querySelectorAll('[data-draw="line"]'));
      const ticks = createDrawable(el.querySelectorAll('[data-draw="tick"]'));
      const tl: Timeline = createTimeline({ autoplay: false });
      if (lines.length > 0)
        tl.add(lines, {
          draw: ["0 0", "0 1"],
          duration: duration.base * 1000,
          ease: drawEase,
          delay: stagger(60),
        });
      if (ticks.length > 0)
        tl.add(ticks, {
          draw: ["0 0", "0 1"],
          duration: duration.quick * 1000,
          ease: drawEase,
          delay: stagger(30),
        });
      // Undrawn until its moment; seeking renders the timeline's first frame.
      tl.seek(0);

      ScrollTrigger.create(
        mode === "scrub"
          ? {
              trigger: el,
              start,
              end,
              scrub: true,
              onUpdate: (self) => {
                tl.progress = self.progress;
              },
            }
          : {
              trigger: el,
              start,
              once: true,
              onEnter: () => {
                tl.play();
              },
            },
      );

      // ScrollTrigger is reverted by the GSAP context; anime.js by hand.
      return () => {
        tl.revert();
      };
    },
    { scope: root, dependencies: [mode, start, end] },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
