"use client";

import { MotionConfig, useReducedMotion } from "framer-motion";
import { createContext, type ReactNode, useContext } from "react";
import {
  crossFade,
  type SpringName,
  type SpringTransition,
  springFor,
} from "@/design/tokens";

type MotionOverride = {
  /** Force reduced motion regardless of the OS setting (specimen bench). */
  reduced?: boolean;
  /** Slow every spring down for frame-by-frame review; 1 = real time. */
  timeScale?: number;
};

const MotionOverrideContext = createContext<MotionOverride>({});

/**
 * Overrides motion for a subtree. Also sets Motion's own reduced-motion mode
 * for any animation that doesn't go through `useMotionPreference`; in testing
 * that mode alone did not stop transform transitions, so the hook's
 * cross-fade (which pins transforms to instant) is the real guarantee.
 */
export function MotionPreference({
  reduced,
  timeScale,
  children,
}: MotionOverride & { children: ReactNode }) {
  return (
    <MotionOverrideContext value={{ reduced, timeScale }}>
      <MotionConfig
        reducedMotion={
          reduced === undefined ? "user" : reduced ? "always" : "never"
        }
      >
        {children}
      </MotionConfig>
    </MotionOverrideContext>
  );
}

/**
 * Resolves a spring token to the transition to use: the spring itself, or a
 * short cross-fade when reduced motion is on. Components call this rather
 * than reading springs directly, so reduced motion can't be forgotten.
 */
export function useMotionPreference(): {
  reduced: boolean;
  transition: (name: SpringName) => SpringTransition | typeof crossFade;
} {
  const override = useContext(MotionOverrideContext);
  const osReduced = useReducedMotion() ?? false;
  const reduced = override.reduced ?? osReduced;
  const timeScale = override.timeScale ?? 1;

  return {
    reduced,
    transition: (name) => (reduced ? crossFade : springFor(name, timeScale)),
  };
}
