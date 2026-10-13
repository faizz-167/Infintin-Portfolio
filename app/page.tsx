"use client";

// Temporary Phase 01 page: proves Lenis ↔ ScrollTrigger pinning. Replaced by
// the home scene sequence in a later phase.

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function Home() {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.to(".pin-bar", {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".pin-section",
          start: "top top",
          end: "+=150%",
          pin: true,
          scrub: true,
        },
      });
    },
    { scope },
  );

  return (
    <div ref={scope}>
      <nav className="fixed top-2 right-2 z-header flex gap-2 type-annotation">
        <a href="#one">One</a>
        <a href="#pinned">Pinned</a>
        <a href="#three">Three</a>
      </nav>

      <section id="one" className="flex h-[150vh] items-center px-margin">
        <h1 className="type-display-xl [font-stretch:75%]">Section one</h1>
      </section>

      <section
        id="pinned"
        data-env="lab"
        className="pin-section flex h-screen flex-col justify-center gap-4 px-margin"
      >
        <h2 className="type-display-l font-serif italic">Pinned section</h2>
        <div className="pin-bar h-1 w-full origin-left scale-x-0 bg-accent" />
      </section>

      <section id="three" className="flex h-[150vh] items-center px-margin">
        <h2 className="type-display-xl [font-stretch:125%]">Section three</h2>
      </section>
    </div>
  );
}
