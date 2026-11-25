"use client";

import { m } from "framer-motion";
import type { ReactNode } from "react";
import { duration, ease } from "@/design/tokens";
import { useMotionPreference } from "./useMotionPreference";

type DrawLineProps = {
  children: ReactNode;
  className?: string;
};

/**
 * A straight drafting line (a leader, a centre line) that draws out from its
 * left end with `ease-draw` the first time it enters view: the design
 * direction's line draw, for lines built from HTML rather than one SVG path.
 * The line's own dash pattern stays intact because the whole element scales,
 * not its stroke. Reduced motion: simply drawn. Like `Reveal` it starts
 * undrawn in the server HTML, so use it only for decoration.
 */
export function DrawLine({ children, className }: DrawLineProps) {
  const { reduced } = useMotionPreference();
  return (
    <m.span
      aria-hidden="true"
      initial={reduced ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, amount: 1 }}
      transition={{ duration: duration.scene, ease: ease.draw }}
      style={{ originX: 0 }}
      className={className}
    >
      {children}
    </m.span>
  );
}
