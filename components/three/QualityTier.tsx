"use client";

import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { useSceneStore } from "@/lib/store";

// drei's PerformanceMonitor assumes a continuous loop: it divides frames by
// wall time, so with `frameloop="demand"` an idle page reads as 1 fps and
// would always step down. This monitor only times back-to-back frames.
const IDLE_GAP_MS = 200;
const WINDOW = 120;
// Median frame time above this (under 40 fps) during motion steps down.
const SLOW_FRAME_MS = 1000 / 40;

/**
 * Watches frame times while something is moving and steps the quality tier
 * down once if the device can't keep up. Never steps up: a session that
 * struggled once shouldn't oscillate between tiers.
 */
export function QualityTier() {
  const stepDown = useSceneStore((s) => s.stepDown);
  const last = useRef(0);
  const samples = useRef<number[]>([]);
  const done = useRef(false);

  useFrame(() => {
    const now = performance.now();
    const gap = now - last.current;
    last.current = now;
    if (done.current || gap > IDLE_GAP_MS) return;

    samples.current.push(gap);
    if (samples.current.length < WINDOW) return;

    const sorted = samples.current.toSorted((a, b) => a - b);
    samples.current = [];
    if (sorted[WINDOW / 2] > SLOW_FRAME_MS) {
      done.current = true;
      stepDown();
    }
  });

  return null;
}
