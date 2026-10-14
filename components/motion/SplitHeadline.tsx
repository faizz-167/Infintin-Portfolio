"use client";

import { useEffect, useRef } from "react";
import { duration } from "@/design/tokens";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

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
};

const CONDENSED = "75%";

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
export function SplitHeadline({
  as: Tag = "h2",
  children,
  className,
  lock,
}: SplitHeadlineProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const lines = useRef<Element[]>([]);
  const lockRef = useRef(lock);
  lockRef.current = lock;

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
                // Narrowed per line, never on the heading: re-splits measure
                // the heading, which must stay at its final width.
                if (lockRef.current === false)
                  gsap.set(self.lines, { fontStretch: CONDENSED });
                return gsap.from(self.lines, {
                  yPercent: 110,
                  duration: duration.scene,
                  ease: "settle",
                  stagger: 0.1,
                  scrollTrigger: { trigger: el, start: "top 85%", once: true },
                });
              },
            });
            return () => {
              lines.current = [];
            };
          },
          el,
        );
      });

      document.fonts.ready.then(split);
      return () => {
        alive = false;
      };
    },
    { scope: ref },
  );

  const widen = contextSafe(() => {
    const el = ref.current;
    if (!el || lines.current.length === 0) return;
    gsap.to(lines.current, {
      fontStretch: getComputedStyle(el).fontStretch,
      duration: duration.assembly,
      ease: "machine",
    });
  });

  // Runs on the flip to true only; `widen` is a fresh function each render.
  // biome-ignore lint/correctness/useExhaustiveDependencies: keyed to lock
  useEffect(() => {
    if (lock) widen();
  }, [lock]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
