"use client";

import { type ReactNode, useEffect, ViewTransition } from "react";
import { useLenis } from "@/components/motion/SmoothScroll";
import { ScrollTrigger } from "@/lib/gsap";

// Class names for the route wipe (globals.css). Only typed navigations from
// RouteLink animate; back/forward and refreshes carry no type and swap
// instantly, as the Next guide recommends.
const enter = {
  "nav-forward": "page-enter-forward",
  "nav-back": "page-enter-back",
  default: "none",
};
const exit = {
  "nav-forward": "page-exit",
  "nav-back": "page-exit",
  default: "none",
};

/**
 * Wraps a page's content for route transitions (React `<ViewTransition>`).
 * Goes in each `page.tsx`, not a layout: layouts persist across navigations,
 * so enter and exit never fire there.
 *
 * Also re-measures scroll when the page becomes visible: `<Activity>` keeps
 * routes alive, and a page coming back from `display: none` needs Lenis and
 * ScrollTrigger to measure it again. Child scenes rebuild their triggers in
 * layout effects, which run before this effect.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const lenis = useLenis();

  useEffect(() => {
    lenis?.resize();
    ScrollTrigger.refresh();
  }, [lenis]);

  return (
    <ViewTransition enter={enter} exit={exit} default="none">
      {/* One box, so the page wipes as a single sheet; with several top-level
          children each would get its own snapshot and wipe separately. */}
      <div>{children}</div>
    </ViewTransition>
  );
}

/**
 * The product name as one object across routes: the portfolio title on the
 * home page morphs into the product page heading.
 */
export function ProductNameMorph({ children }: { children: ReactNode }) {
  return (
    <ViewTransition name="product-name" share="morph" default="none">
      {children}
    </ViewTransition>
  );
}
