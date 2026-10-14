"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { useMotionPreference } from "./useMotionPreference";

type RevealProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Minimal entrance for supporting content: rises a little and fades in once,
 * the first time it enters view (Framer Motion `whileInView`). Reduced
 * motion: no travel, a short cross-fade.
 *
 * Starts hidden in the server HTML, so never wrap above-the-fold content or
 * the LCP element in it.
 */
export function Reveal({ children, className }: RevealProps) {
  const { transition } = useMotionPreference();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={transition("move")}
      className={className}
    >
      {children}
    </motion.div>
  );
}
