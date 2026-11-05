"use client";

import { LazyMotion } from "framer-motion";
import type { ReactNode } from "react";

const loadFeatures = () =>
  import("@/lib/motionFeatures").then((module) => module.default);

/**
 * Framer Motion with its animation features fetched after hydration (Phase 11
 * JS budget). Components use `m.*`, not `motion.*`; `strict` makes a stray
 * `motion.*` throw instead of quietly needing the full bundle. Until the
 * features arrive, `m` elements render their initial state, which is also
 * the server HTML.
 *
 * Import from `framer-motion`, never `motion/react`: the latter re-exports
 * through `import * as fm from "framer-motion"`, which pulls the whole
 * library back into the initial bundle. Likewise avoid `useAnimate`, which
 * bundles the full animation engine (Phase 11 qa-report, 11.4).
 */
export function MotionFeatures({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  );
}
