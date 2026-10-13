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
      <nav className="fixed top-4 right-4 z-10 flex gap-4 text-sm">
        <a href="#one">One</a>
        <a href="#pinned">Pinned</a>
        <a href="#three">Three</a>
      </nav>

      <section id="one" className="flex h-[150vh] items-center px-8">
        <h1 className="text-6xl [font-variation-settings:'wdth'_75]">
          Section one
        </h1>
      </section>

      <section
        id="pinned"
        className="pin-section flex h-screen flex-col justify-center gap-8 bg-foreground px-8 text-background"
      >
        <h2 className="font-serif text-5xl italic">Pinned section</h2>
        <div className="pin-bar h-1 w-full origin-left scale-x-0 bg-background" />
      </section>

      <section id="three" className="flex h-[150vh] items-center px-8">
        <h2 className="text-6xl [font-variation-settings:'wdth'_125]">
          Section three
        </h2>
      </section>
    </div>
  );
}
