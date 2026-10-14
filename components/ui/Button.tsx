"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { useMotionPreference } from "@/components/motion/useMotionPreference";

const MotionLink = motion.create(Link);

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

// The hover wipe: primary and secondary fill with ink from the baseline,
// the text variant draws a copper underline. On press the fill shows at once
// (no transition), so touch devices without hover still get instant feedback.
const fillClasses =
  "wipe-y absolute inset-0 bg-ink group-hover:wipe-on group-active:wipe-on group-active:transition-none";
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
        />
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
    >
      {content}
    </motion.button>
  );
}
