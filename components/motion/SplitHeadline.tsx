"use client";

import { useEffect, useRef, useState } from "react";
import { duration } from "@/design/tokens";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { whenUncovered } from "@/lib/preloader";

type SplitHeadlineProps = {
  as?: "h1" | "h2" | "h3";
  children: string;
  className?: string;
  /**
   * Width "machining". When given, the lines enter condensed (wdth 75) and
   * widen to the style's own width the moment this turns true: the hero
   * passes the 3D assembly lock here. Omit for a plain line reveal.
   */
  lock?: boolean;
  /**
   * Letters thicken towards `PROXIMITY_WEIGHT` as a hovering cursor nears
   * them, once the headline has settled. Fine pointers only.
   */
  proximity?: boolean;
};

const CONDENSED = "75%";

const PROXIMITY_WEIGHT = 800;
// Reach of the effect, in multiples of the headline's font size, so it
// scales with the type rather than the screen.
const PROXIMITY_RADIUS = 1.6;
const FAR = -1e6;

// A re-split on resize lands after ScrollTrigger has re-measured the page, so
// a headline that gains or loses a line leaves every trigger below it off by
// that line (section sweeps visibly). One refresh per frame, however many
// headlines re-split together.
let refreshQueued = false;
function refreshAfterReflow() {
  if (refreshQueued) return;
  refreshQueued = true;
  requestAnimationFrame(() => {
    refreshQueued = false;
    ScrollTrigger.refresh();
  });
}

/**
 * Headline whose lines rise from behind their baseline in sequence (GSAP
 * SplitText with line masks) when it scrolls into view.
 *
 * The split waits for `document.fonts.ready`, so lines are measured in the
 * final face and nothing reflows (CLS). It re-splits on resize and returns
 * the reveal from `onSplit`, so GSAP carries progress across re-splits.
 * SplitText labels the heading with its text and hides the line wrappers,
 * so screen readers read one heading, not fragments. Reduced motion: no
 * split at all; the heading renders as plain text.
 */
/**
 * Wraps every character of the given (settled) lines in a box exactly as wide
 * as its kerned advance, measured in place before anything moves. The text
 * looks identical (per-letter boxes would otherwise drop kerning), and a
 * heavier letter overhangs its box instead of pushing its neighbours: no
 * reflow, no layout shift. SplitText's revert discards these with the lines.
 */
function splitKerned(lines: Element[]): HTMLElement[] {
  const out: HTMLElement[] = [];
  for (const line of lines) {
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) {
      if (walker.currentNode instanceof Text) nodes.push(walker.currentNode);
    }
    // Every character's left edge and right edge, in reading order.
    const glyphs: { node: Text; text: string; left: number; right: number }[] =
      [];
    const range = document.createRange();
    for (const node of nodes) {
      let offset = 0;
      for (const text of Array.from(node.data)) {
        range.setStart(node, offset);
        range.setEnd(node, offset + text.length);
        const box = range.getBoundingClientRect();
        glyphs.push({ node, text, left: box.left, right: box.right });
        offset += text.length;
      }
    }
    // The advance is the distance to the next character's left edge, which
    // carries the kerning; the last one has nothing after it.
    const boxes = glyphs.map((glyph, i) => {
      const next = glyphs[i + 1];
      const box = document.createElement("span");
      box.textContent = glyph.text;
      box.style.display = "inline-block";
      box.style.whiteSpace = "pre";
      // A box is a block container: it would inherit the hero's percentage
      // first-line indent, resolved against its own width.
      box.style.textIndent = "0";
      box.style.width = `${(next ? next.left : glyph.right) - glyph.left}px`;
      return { node: glyph.node, box };
    });
    for (const node of nodes) {
      const fragment = document.createDocumentFragment();
      for (const { node: owner, box } of boxes)
        if (owner === node) fragment.append(box);
      node.replaceWith(fragment);
    }
    for (const { box } of boxes) if (box.textContent?.trim()) out.push(box);
  }
  return out;
}

export function SplitHeadline({
  as: Tag = "h2",
  children,
  className,
  lock,
  proximity = false,
}: SplitHeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const lines = useRef<Element[]>([]);
  const chars = useRef<HTMLElement[]>([]);
  // Revealed and, when locked, machined to width: letters are at rest.
  const [settled, setSettled] = useState(false);
  const settledRef = useRef(false);
  const lockRef = useRef(lock);
  lockRef.current = lock;
  const proximityRef = useRef(proximity);
  proximityRef.current = proximity;
  // Machining plays once; later re-splits (resize) keep the final width.
  const widened = useRef(false);
  // Height at the last split; `null` until the first one.
  const splitHeight = useRef<number | null>(null);

  const { contextSafe } = useGSAP(
    (_, contextSafe) => {
      const el = ref.current;
      if (!el || !contextSafe) return;
      let alive = true;

      const split = contextSafe(() => {
        if (!alive) return;
        const mm = gsap.matchMedia();
        mm.add(
          "(prefers-reduced-motion: no-preference)",
          () => {
            SplitText.create(el, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              aria: "auto",
              onSplit: (self) => {
                lines.current = self.lines;
                chars.current = [];
                if (settledRef.current && proximityRef.current)
                  chars.current = splitKerned(self.lines);
                const height = el.offsetHeight;
                if (
                  splitHeight.current !== null &&
                  splitHeight.current !== height
                )
                  refreshAfterReflow();
                splitHeight.current = height;
                // Narrowed per line, never on the heading: re-splits measure
                // the heading, which must stay at its final width.
                if (lockRef.current !== undefined && !widened.current) {
                  gsap.set(self.lines, { fontStretch: CONDENSED });
                  // The lock can arrive before the fonts do (a fast model
                  // load); it machines from here instead.
                  if (lockRef.current) machine(el, self.lines);
                }
                return gsap.from(self.lines, {
                  yPercent: 110,
                  duration: duration.scene,
                  ease: "settle",
                  stagger: 0.1,
                  onComplete: () => {
                    if (lockRef.current === undefined) settle();
                  },
                  scrollTrigger: { trigger: el, start: "top 85%", once: true },
                });
              },
            });
            return () => {
              lines.current = [];
              chars.current = [];
            };
          },
          el,
        );
      });

      // Also waits for the preloader to lift, so no reveal plays unseen.
      Promise.all([document.fonts.ready, whenUncovered()]).then(split);
      return () => {
        alive = false;
      };
    },
    { scope: ref },
  );

  const settle = () => {
    if (settledRef.current) return;
    settledRef.current = true;
    if (proximityRef.current) chars.current = splitKerned(lines.current);
    setSettled(true);
  };

  const machine = (el: HTMLElement, targets: Element[]) => {
    widened.current = true;
    gsap.to(targets, {
      fontStretch: getComputedStyle(el).fontStretch,
      duration: duration.assembly,
      ease: "machine",
      onComplete: settle,
    });
  };

  const widen = contextSafe(() => {
    const el = ref.current;
    // Not split yet: the split machines when it happens.
    if (!el || lines.current.length === 0 || widened.current) return;
    machine(el, lines.current);
  });

  // Runs on the flip to true only; `widen` is a fresh function each render.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed to lock
  useEffect(() => {
    if (lock) widen();
  }, [lock]);

  // Cursor proximity. Runs only on pointer movement and scroll, one update
  // per frame; letters past the radius carry no override at all.
  useEffect(() => {
    const el = ref.current;
    if (!proximity || !settled || !el) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;

    let x = FAR;
    let y = FAR;
    let frame = 0;
    const update = () => {
      frame = 0;
      const style = getComputedStyle(el);
      const rest = Number.parseFloat(style.fontWeight);
      const radius = Number.parseFloat(style.fontSize) * PROXIMITY_RADIUS;
      for (const char of chars.current) {
        const box = char.getBoundingClientRect();
        const distance = Math.hypot(
          box.left + box.width / 2 - x,
          box.top + box.height / 2 - y,
        );
        const t = Math.max(0, 1 - distance / radius);
        const settings =
          t > 0
            ? `"wght" ${Math.round(rest + (PROXIMITY_WEIGHT - rest) * t)}`
            : "";
        if (char.style.fontVariationSettings !== settings)
          char.style.fontVariationSettings = settings;
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      schedule();
    };
    const onLeave = () => {
      x = FAR;
      y = FAR;
      schedule();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", schedule);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      for (const char of chars.current) char.style.fontVariationSettings = "";
    };
  }, [proximity, settled]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
