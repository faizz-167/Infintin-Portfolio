"use client";

import { motion } from "motion/react";
import {
  type MouseEventHandler,
  type PointerEvent,
  type ReactNode,
  useRef,
} from "react";
import { LetterSwap } from "@/components/motion/LetterSwap";
import { useMotionPreference } from "@/components/motion/useMotionPreference";
import { RouteLink } from "./RouteLink";

const MotionLink = motion.create(RouteLink);

type Variant = "primary" | "secondary" | "text";
type Size = "md" | "lg";

type CommonProps = {
  variant?: Variant;
  size?: Size;
  /** Trailing arrow that travels along the shaft axis on hover. */
  arrow?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = CommonProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Makes it a toggle button (`aria-pressed`). */
  pressed?: boolean;
  /** Announced keyboard shortcut, e.g. "E". */
  shortcut?: string;
};

type ButtonAsLink = CommonProps & {
  href: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<Variant, string> = {
  primary: "border border-accent bg-accent text-on-accent",
  secondary:
    "border border-ink text-ink transition-colors duration-(--duration-quick) ease-settle hover:text-ground active:text-ground",
  text: "text-ink",
};

const sizeClasses: Record<Size, string> = {
  md: "px-3",
  lg: "px-4 py-2",
};

// The hover wipe: primary and secondary fill with ink from the edge the
// pointer came in by (see `edgeOf`), the text variant draws a copper
// underline. On press the fill shows at once (no transition), so touch
// devices without hover still get instant feedback.
const fillClasses =
  "wipe-edge absolute inset-0 bg-ink group-active:wipe-on group-active:transition-none";
const underlineClasses =
  "wipe-x absolute inset-x-3 bottom-2 h-px bg-accent group-hover:wipe-on group-active:wipe-on group-active:transition-none";

type Edge = "top" | "right" | "bottom" | "left";

// Nearest edge to the pointer, as a fraction of the button's size rather than
// in pixels: on a wide button a pixel measure would almost never pick a side.
function edgeOf(event: PointerEvent<HTMLElement>): Edge {
  const box = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width;
  const y = (event.clientY - box.top) / box.height;
  const distances: [Edge, number][] = [
    ["top", y],
    ["right", 1 - x],
    ["bottom", 1 - y],
    ["left", x],
  ];
  return distances.reduce((nearest, next) =>
    next[1] < nearest[1] ? next : nearest,
  )[0];
}

/**
 * Rectangular, 2 px radius, 44 px minimum target. The press is acknowledged on
 * pointer-down with a critically damped spring and released on pointer-up,
 * or cancelled by dragging off.
 */
export function Button(props: ButtonProps) {
  const {
    variant = "primary",
    size = "md",
    arrow = false,
    className,
    children,
  } = props;
  const { reduced, transition } = useMotionPreference();
  const disabled = props.href === undefined && props.disabled === true;
  const fillRef = useRef<HTMLSpanElement>(null);

  // Written straight to the fill's dataset: hover is per frame and needs no
  // re-render. Touch is left to the press state (`group-active`), so a tap
  // never leaves the fill stuck on.
  function onPointerEnter(event: PointerEvent<HTMLElement>) {
    const fill = fillRef.current;
    if (!fill || event.pointerType === "touch") return;
    if (!reduced) {
      // Jump to the hidden state on the entry edge, then animate in from it.
      fill.style.transition = "none";
      fill.dataset.edge = edgeOf(event);
      void fill.offsetWidth;
      fill.style.transition = "";
    }
    fill.dataset.on = "";
  }

  function onPointerLeave(event: PointerEvent<HTMLElement>) {
    const fill = fillRef.current;
    if (!fill || event.pointerType === "touch") return;
    if (!reduced) fill.dataset.edge = edgeOf(event);
    delete fill.dataset.on;
  }

  const classes = [
    "group relative inline-flex min-h-target min-w-target items-center justify-center gap-1 overflow-hidden rounded-xs type-annotation select-none",
    // A pressed toggle holds the hover fill instead of the variant's ink.
    props.href === undefined && props.pressed
      ? "border border-ink bg-ink text-ground"
      : variantClasses[variant],
    sizeClasses[size],
    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    className ?? "",
  ].join(" ");

  const content = (
    <>
      {!disabled && (
        <span
          aria-hidden="true"
          className={variant === "text" ? underlineClasses : fillClasses}
          ref={variant === "text" ? undefined : fillRef}
        />
      )}
      <span className="relative">
        {/* Plain-text labels roll on hover; anything richer stays put. */}
        {typeof children === "string" && !disabled ? (
          <LetterSwap label={children} />
        ) : (
          children
        )}
      </span>
      {arrow && (
        <span
          aria-hidden="true"
          className="relative transition-transform duration-(--duration-quick) ease-settle group-hover:translate-x-[0.25em] motion-reduce:transform-none"
        >
          →
        </span>
      )}
    </>
  );

  // Reduced motion: no scale; the instant fill above is the press feedback.
  // `whileTap` stays defined either way: Motion adds tabindex="0" whenever it
  // is set, and the server can't know the OS preference, so dropping it on a
  // reduced-motion client caused a hydration mismatch.
  const press = disabled ? undefined : { scale: reduced ? 1 : 0.98 };

  if (props.href !== undefined) {
    return (
      <MotionLink
        href={props.href}
        className={classes}
        whileTap={press}
        transition={transition("press")}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
      >
        {content}
      </MotionLink>
    );
  }

  return (
    <motion.button
      type={props.type ?? "button"}
      disabled={disabled}
      onClick={props.onClick}
      aria-pressed={props.pressed}
      aria-keyshortcuts={props.shortcut}
      className={classes}
      whileTap={press}
      transition={transition("press")}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      {content}
    </motion.button>
  );
}
