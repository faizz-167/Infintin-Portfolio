"use client";

import { usePathname } from "next/navigation";
import { type RefObject, useEffect, useState } from "react";
import type { EnvironmentId } from "@/design/three-presets";

/**
 * The environment (`data-env`) of the page content under a point of a fixed
 * element, so fixed chrome can take the ink of whatever scrolls beneath it.
 * The point is a fraction of the element's box (0.5, 1 = bottom centre).
 *
 * Hit-testing rather than observers: it respects clip-path (the section
 * sweep), skips pages hidden by `<Activity>` (display: none is never hit),
 * and needs no list of sections. The result is React state, so nothing is
 * left on the document when the chrome unmounts.
 */
export function useEnvUnder(
  ref: RefObject<HTMLElement | null>,
  fx: number,
  fy: number,
): EnvironmentId {
  const [env, setEnv] = useState<EnvironmentId>("sheet");
  const pathname = usePathname();

  // `pathname` is a trigger, not an input: a route change swaps the content
  // under the chrome without any scroll event.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-probe on navigation
  useEffect(() => {
    let frame = 0;

    const probe = () => {
      frame = 0;
      const self = ref.current;
      if (!self) return;
      const box = self.getBoundingClientRect();
      // One pixel inside the box, so a bottom-edge probe stays on screen.
      const x = box.left + Math.min(box.width - 1, box.width * fx);
      const y = box.top + Math.min(box.height - 1, box.height * fy);
      let found: EnvironmentId = "sheet";
      for (const el of document.elementsFromPoint(x, y)) {
        if (self.contains(el)) continue;
        const value = el.closest("[data-env]")?.getAttribute("data-env");
        if (value === "lab" || value === "sheet") {
          found = value;
          break;
        }
      }
      setEnv(found);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(probe);
    };

    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, fx, fy, pathname]);

  return env;
}
