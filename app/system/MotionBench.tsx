"use client";

import { motion } from "motion/react";
import { useState } from "react";
import {
  MotionPreference,
  useMotionPreference,
} from "@/components/motion/useMotionPreference";
import { Button } from "@/components/ui/Button";
import type { SpringName } from "@/design/tokens";

const SPRINGS: SpringName[] = ["press", "ui", "move"];

/** A panel that slides in from the left edge of its track and leaves the same way. */
function Disclosure({ spring }: { spring: SpringName }) {
  const [open, setOpen] = useState(false);
  const { transition } = useMotionPreference();
  return (
    <div className="flex flex-col gap-1">
      <Button variant="secondary" onClick={() => setOpen((o) => !o)}>
        {open ? "Close" : "Open"} panel ({spring})
      </Button>
      <div className="relative h-6 overflow-hidden border border-rule">
        <motion.div
          className="absolute inset-0 grid place-items-center bg-ink type-annotation text-ground"
          initial={false}
          animate={{ x: open ? "0%" : "-100%", opacity: open ? 1 : 0 }}
          transition={transition(spring)}
        >
          Panel
        </motion.div>
      </div>
    </div>
  );
}

function Toggle({ spring }: { spring: SpringName }) {
  const [on, setOn] = useState(false);
  const { transition } = useMotionPreference();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => setOn((v) => !v)}
      className="flex min-h-target cursor-pointer items-center gap-2 type-annotation text-ink"
    >
      <span className="relative h-3 w-6 border border-ink-muted">
        <motion.span
          className="absolute inset-y-0 left-0 w-1/2 bg-ink"
          initial={false}
          animate={{ x: on ? "100%" : "0%" }}
          transition={transition(spring)}
        />
      </span>
      Toggle ({spring}) {on ? "on" : "off"}
    </button>
  );
}

/**
 * Interactive check of the spring tokens: click repeatedly mid-animation and
 * every control must reverse from where it is, with no jump or overshoot.
 */
export function MotionBench() {
  const [slow, setSlow] = useState(false);
  const [reduced, setReduced] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4 type-annotation">
        <label className="flex min-h-target items-center gap-1">
          <input
            type="checkbox"
            checked={slow}
            onChange={(e) => setSlow(e.currentTarget.checked)}
          />
          Slow motion (0.25×)
        </label>
        <label className="flex min-h-target items-center gap-1">
          <input
            type="checkbox"
            checked={reduced}
            onChange={(e) => setReduced(e.currentTarget.checked)}
          />
          Force reduced motion
        </label>
      </div>
      <MotionPreference reduced={reduced} timeScale={slow ? 0.25 : 1}>
        <div className="grid gap-4 md:grid-cols-3">
          {SPRINGS.map((s) => (
            <div key={s} className="flex flex-col gap-2">
              <Disclosure spring={s} />
              <Toggle spring={s} />
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button>Press and hold</Button>
          <Button variant="secondary">Press and drag off</Button>
        </div>
      </MotionPreference>
    </div>
  );
}
