"use client";

import { m } from "framer-motion";
import type { MouseEventHandler, ReactNode } from "react";
import { useMotionPreference } from "@/components/motion/useMotionPreference";
import { RouteLink } from "./RouteLink";

const MotionLink = m.create(RouteLink);

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

// Hover: the button lifts off the sheet and a hard offset shadow appears
// beneath it, like a part drawn with a drop line. No fill, no text change.
// Press (and touch, which has no hover) drops it back flat at once.
const lift =
  "transition-[translate,box-shadow] duration-(--duration-quick) ease-settle hover:-translate-x-[2px] hover:-translate-y-[2px] active:translate-0 active:shadow-none motion-reduce:transition-none motion-reduce:hover:translate-0";

const variantClasses: Record<Variant, string> = {
  primary: `border border-accent bg-accent text-on-accent hover:shadow-[4px_4px_0_var(--ink)] ${lift}`,
  secondary: `border border-ink text-ink hover:shadow-[4px_4px_0_var(--accent)] ${lift}`,
  text: "text-ink",
};

const sizeClasses: Record<Size, string> = {
  md: "px-3",
  lg: "px-4 py-2",
};

// The text variant draws a copper underline on hover.
const underlineClasses =
  "wipe-x absolute inset-x-3 bottom-2 h-px bg-accent group-hover:wipe-on group-active:wipe-on group-active:transition-none";

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

  const classes = [
    "group relative inline-flex min-h-target min-w-target items-center justify-center gap-1 rounded-xs type-annotation select-none",
    // A pressed toggle stays filled with ink.
    props.href === undefined && props.pressed
      ? "border border-ink bg-ink text-ground"
      : variantClasses[variant],
    sizeClasses[size],
    disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
    className ?? "",
  ].join(" ");

  const content = (
    <>
      {!disabled && variant === "text" && (
        <span aria-hidden="true" className={underlineClasses} />
      )}
      <span className="relative">{children}</span>
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

  // Reduced motion: no scale; the shadow dropping away is the press feedback.
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
      >
        {content}
      </MotionLink>
    );
  }

  return (
    <m.button
      type={props.type ?? "button"}
      disabled={disabled}
      onClick={props.onClick}
      aria-pressed={props.pressed}
      aria-keyshortcuts={props.shortcut}
      className={classes}
      whileTap={press}
      transition={transition("press")}
    >
      {content}
    </m.button>
  );
}
