"use client";

import { useAnimate } from "motion/react";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { useMotionPreference } from "@/components/motion/useMotionPreference";

type DisclosureProps = {
  summary: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Native `<details>`, so it opens without JavaScript, finds-in-page, and
 * keeps closed content in the form. With JavaScript the summary click is
 * taken over to animate the height: opening sets `open` first and grows the
 * panel; closing shrinks it and only then drops `open`, since the browser
 * hides the content the instant the attribute goes.
 *
 * The panel carries no inline height until a toggle runs, so the server HTML
 * opens normally before (or without) hydration.
 */
export function Disclosure({ summary, children, className }: DisclosureProps) {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [panel, animate] = useAnimate<HTMLDivElement>();
  const { transition } = useMotionPreference();
  // A ref, so re-renders mid-animation don't restart it.
  const spring = useRef(transition("move"));
  spring.current = transition("move");
  const toggled = useRef(false);

  const expand = () => {
    toggled.current = true;
    setOpen(true);
    setExpanded(true);
  };

  // Layout effect: `open` is committed, so the content can be measured before
  // the browser paints it at full height. Starts from the current height, so
  // a toggle mid-animation reverses smoothly.
  useLayoutEffect(() => {
    const el = panel.current;
    if (!toggled.current || !el) return;
    // No inline height means nothing is running: start from fully closed or
    // fully open. Otherwise pick up from wherever the last animation stopped.
    const from =
      el.style.height === ""
        ? expanded
          ? 0
          : el.scrollHeight
        : el.getBoundingClientRect().height;
    const to = expanded ? el.scrollHeight : 0;
    let cancelled = false;
    const controls = animate(el, { height: [from, to] }, spring.current);
    controls.then(() => {
      if (cancelled) return;
      el.style.height = "";
      if (!expanded) setOpen(false);
    });
    return () => {
      cancelled = true;
      controls.stop();
    };
  }, [expanded, animate, panel]);

  return (
    <details
      open={open}
      // The browser opens it by itself for find-in-page.
      onToggle={(e) => {
        if (e.currentTarget.open && !expanded) expand();
      }}
      className={`rule-hairline ${className ?? ""}`}
    >
      {/* biome-ignore lint/a11y/noStaticElementInteractions: <summary> is the details element's native button; the click is only taken over to animate. */}
      <summary
        onClick={(e) => {
          e.preventDefault();
          if (expanded) {
            toggled.current = true;
            setExpanded(false);
          } else {
            expand();
          }
        }}
        className="flex min-h-target cursor-pointer list-none items-center justify-between gap-2 py-1 type-annotation text-ink [&::-webkit-details-marker]:hidden"
      >
        {summary}
        <span aria-hidden="true" className="shrink-0">
          {expanded ? "−" : "+"}
        </span>
      </summary>
      <div ref={panel} className="overflow-hidden">
        <div className="pb-3">{children}</div>
      </div>
    </details>
  );
}
