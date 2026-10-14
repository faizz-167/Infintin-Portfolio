"use client";

import { useEffect, useState } from "react";
import { DrawPath } from "@/components/motion/DrawPath";
import { Reveal } from "@/components/motion/Reveal";
import { type SceneBuild, ScrollScene } from "@/components/motion/ScrollScene";
import { SectionSweep } from "@/components/motion/SectionSweep";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { SceneView } from "@/components/three/SceneView";
import { Button } from "@/components/ui/Button";
import { ScrollTrigger } from "@/lib/gsap";

/** Live count of ScrollTriggers, for the Activity check (07 validation). */
export function TriggerCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setCount(ScrollTrigger.getAll().length), 250);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="fixed top-[4.5rem] left-4 z-toast bg-ink px-1 py-1 type-data text-ground">
      ScrollTriggers: <span data-testid="trigger-count">{count}</span>
    </p>
  );
}

// A pinned, scrubbed scene: the bar fills along the shaft axis while pinned.
const fillBar: SceneBuild = (tl) => {
  tl.fromTo(".bench-bar", { scaleX: 0 }, { scaleX: 1, ease: "none" });
};

// Plays on entry: three blocks seat along the axis.
const seat: SceneBuild = (tl) => {
  tl.from(".bench-block", {
    xPercent: -60,
    opacity: 0,
    duration: 0.9,
    ease: "machine",
    stagger: 0.12,
  });
};

/** Elevation-style test drawing: centre line, outline, then ticks. */
function Elevation() {
  return (
    <svg
      viewBox="0 0 800 200"
      className="w-full text-ink"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        data-draw="line"
        d="M20 100 H780"
        strokeDasharray="24 6 4 6"
        className="text-ink-muted"
      />
      <path data-draw="line" d="M160 40 H640 V160 H160 Z" strokeWidth="2" />
      <path data-draw="line" d="M80 70 H160 M80 130 H160 M80 70 V130" />
      <path data-draw="line" d="M640 70 H720 M640 130 H720 M720 70 V130" />
      <path data-draw="tick" d="M160 180 H640 M160 172 V188 M640 172 V188" />
      <path
        data-draw="tick"
        d="M240 40 V160 M320 40 V160 M400 40 V160 M480 40 V160 M560 40 V160"
        className="text-ink-muted"
      />
    </svg>
  );
}

export function MotionChecks() {
  const [locked, setLocked] = useState(false);

  return (
    <>
      <ScrollScene
        id="bench-intro"
        sheet="Headlines"
        className="flex min-h-screen flex-col justify-center gap-5 px-margin py-8"
      >
        <SplitHeadline as="h1" className="type-display-xl">
          Drawn around the shaft, read in order
        </SplitHeadline>
        <div className="flex flex-col items-start gap-3">
          <SplitHeadline lock={locked} className="type-display-l">
            The headline machines to width on assembly lock
          </SplitHeadline>
          <Button
            variant="secondary"
            pressed={locked}
            onClick={() => setLocked((v) => !v)}
          >
            Assembly lock
          </Button>
        </div>
      </ScrollScene>

      <ScrollScene
        id="bench-drawing"
        sheet="Elevation"
        className="flex flex-col gap-6 px-margin py-8"
      >
        <h2 className="type-display-m">Line draw on entry</h2>
        <DrawPath>
          <Elevation />
        </DrawPath>
        <h2 className="type-display-m">Line draw, scrubbed</h2>
        <DrawPath mode="scrub">
          <Elevation />
        </DrawPath>
      </ScrollScene>

      <ScrollScene
        id="bench-seat"
        sheet="Assembly"
        build={seat}
        className="flex flex-col gap-3 px-margin py-8"
      >
        <h2 className="type-display-m">Timeline on entry</h2>
        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bench-block h-8 flex-1 border border-ink bg-ground-raised"
            />
          ))}
        </div>
        <Reveal className="measure type-body">
          A Reveal: supporting text rises a short way and fades in once, the
          first time it enters view.
        </Reveal>
      </ScrollScene>

      <section className="flex flex-col gap-3 px-margin py-8">
        <h2 className="type-display-m">Model above the sweep</h2>
        <p className="measure type-body text-ink-muted">
          The section plane on this view follows the sweep below.
        </p>
        <SceneView
          id="bench-sweep-view"
          shot="section"
          poster="hero"
          env="sheet"
          className="aspect-video w-full lg:w-2/3"
        />
      </section>

      <SectionSweep from="sheet" to="lab" viewId="bench-sweep-view">
        <ScrollScene
          id="bench-pinned"
          sheet="Section"
          pin
          scrub
          end="+=150%"
          build={fillBar}
          className="flex min-h-screen flex-col justify-center gap-4 px-margin"
        >
          <h2 className="type-display-l">Pinned and scrubbed in the Lab</h2>
          <div className="bench-bar h-1 w-full origin-left bg-accent" />
        </ScrollScene>
      </SectionSweep>

      <SectionSweep from="lab" to="sheet">
        <ScrollScene
          id="bench-outro"
          sheet="Notes"
          className="flex min-h-screen flex-col justify-center gap-4 px-margin py-8"
        >
          <h2 className="type-display-l">Back on the Sheet</h2>
        </ScrollScene>
      </SectionSweep>
    </>
  );
}
