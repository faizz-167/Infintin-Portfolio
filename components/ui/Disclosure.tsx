"use client";

import { m, useMotionValue } from "framer-motion";
import { type ReactNode, useState } from "react";
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
 * The panel's height stays `auto` until a toggle runs, so the server HTML
 * opens normally before (or without) hydration.
 *
 * Height is driven by the `m.div`'s `animate` prop rather than `useAnimate`:
 * that hook bundles Framer Motion's whole animation engine into the page,
 * while `m` animates through the features `MotionFeatures` loads later.
 */
export function Disclosure({ summary, children, className }: DisclosureProps) {
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const { transition } = useMotionPreference();
  // The panel's height, "auto" until the first toggle (the same as no inline
  // height). An open starts from it: set to 0 first when the panel is at
  // rest, since by the time the animation runs `open` is committed and the
  // panel would already measure full height; mid-animation it holds the
  // current height, so a toggle reverses from wherever the panel is.
  const height = useMotionValue<number | string>("auto");
  // Set by the first toggle. Until then the panel has no animation target and
  // the content keeps its resting look, so a panel the browser opened on its
  // own (no JS yet) is never faded out or clamped.
  const [touched, setTouched] = useState(false);

  const expand = () => {
    if (height.get() === "auto") height.set(0);
    setTouched(true);
    setOpen(true);
    setExpanded(true);
  };

  const collapse = () => {
    setTouched(true);
    setExpanded(false);
  };

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
          if (expanded) collapse();
          else expand();
        }}
        className="flex min-h-target cursor-pointer list-none items-center justify-between gap-2 py-1 type-annotation text-ink [&::-webkit-details-marker]:hidden"
      >
        {summary}
        {/* A plus whose upright stroke turns a quarter turn flat to make the
            minus, so the marker moves rather than swapping glyphs. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className="size-[0.75rem] shrink-0 overflow-visible"
        >
          <path d="M0 6h12" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M6 0v12"
            stroke="currentColor"
            strokeWidth="1.5"
            className={`origin-center transition-[rotate] duration-(--duration-quick) ease-settle motion-reduce:transition-none ${
              expanded ? "rotate-90" : ""
            }`}
          />
        </svg>
      </summary>
      <m.div
        className="overflow-hidden"
        style={{ height }}
        animate={touched ? { height: expanded ? "auto" : 0 } : undefined}
        transition={transition("move")}
        onAnimationComplete={() => {
          if (!expanded) setOpen(false);
        }}
      >
        <div
          // Opening fades in from `@starting-style` as the browser first
          // renders the content; closing fades out while the height shrinks.
          className={`pb-3 transition-[opacity,translate] duration-(--duration-quick) ease-settle starting:-translate-y-[4px] starting:opacity-0 motion-reduce:transition-none ${
            touched && !expanded ? "-translate-y-[4px] opacity-0" : ""
          }`}
        >
          {children}
        </div>
      </m.div>
    </details>
  );
}
