"use client";

import { usePathname } from "next/navigation";
import { type RefObject, useEffect, useState } from "react";

// Sample grid over the fixed element. Rows ≈16 px apart at the title block's
// height, so a single caption line can't slip between two rows.
const COLUMNS = 10;
const ROWS = 6;
// Text this close to the element counts as under it: touching type reads as
// covered even when the glyph boxes don't quite overlap.
const MARGIN = 8;
// Pinned scenes and reveals move content without a scroll event.
const POLL_MS = 400;

const INTERACTIVE =
  "a, button, input, select, textarea, summary, label, [role='button'], [tabindex]:not([tabindex='-1'])";

function intersects(a: DOMRect, b: DOMRect) {
  return (
    a.left < b.right + MARGIN &&
    a.right > b.left - MARGIN &&
    a.top < b.bottom + MARGIN &&
    a.bottom > b.top - MARGIN
  );
}

/** Whether `el` holds readable text or a control within `box`. */
function isContent(el: Element, box: DOMRect, range: Range) {
  if (el.closest(INTERACTIVE)) return true;
  // Only the element's own text nodes: its children are hit-tested on their
  // own, and a parent box (a whole section) says nothing about where its
  // text actually is.
  for (const node of el.childNodes) {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent?.trim()) continue;
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      if (intersects(rect, box)) return true;
    }
  }
  return false;
}

/**
 * Whether readable text or a control sits under a fixed element, so fixed
 * chrome can get out of the way of the page instead of covering it. The model,
 * posters, drawings and empty ground don't count.
 *
 * Hit-testing, like `useEnvUnder`: it respects clip-paths and skips pages
 * hidden by `<Activity>`. The element itself must be `pointer-events: none`
 * (hit-testing skips it), which also keeps hiding it from changing the result.
 */
export function useContentUnder(ref: RefObject<HTMLElement | null>): boolean {
  const [covered, setCovered] = useState(false);
  const pathname = usePathname();

  // `pathname` is a trigger, not an input: a route change swaps the content
  // under the chrome without any scroll event.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-probe on navigation
  useEffect(() => {
    let frame = 0;
    const range = document.createRange();

    const probe = () => {
      frame = 0;
      const self = ref.current;
      if (!self) return;
      const box = self.getBoundingClientRect();
      if (box.width === 0 || box.height === 0) {
        setCovered(false);
        return;
      }
      const seen = new Set<Element>();
      let found = false;
      for (let row = 0; row < ROWS && !found; row++) {
        for (let col = 0; col < COLUMNS && !found; col++) {
          const x = box.left + ((col + 0.5) / COLUMNS) * box.width;
          const y = box.top + ((row + 0.5) / ROWS) * box.height;
          const el = document.elementFromPoint(x, y);
          if (!el || seen.has(el) || self.contains(el)) continue;
          seen.add(el);
          found = isContent(el, box, range);
        }
      }
      setCovered(found);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(probe);
    };

    schedule();
    const poll = window.setInterval(schedule, POLL_MS);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearInterval(poll);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [ref, pathname]);

  return covered;
}
