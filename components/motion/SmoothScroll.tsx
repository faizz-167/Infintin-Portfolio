"use client";

import Lenis from "lenis";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const LenisContext = createContext<Lenis | null>(null);

/** The active Lenis instance, or null when reduced motion keeps native scroll. */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Lenis runs off the GSAP ticker (not its own rAF) so scroll position and
    // ScrollTrigger updates land in the same frame as GSAP tweens.
    function start(): () => void {
      const instance = new Lenis({ autoRaf: false, anchors: true });
      const tick = (time: number) => instance.raf(time * 1000);

      instance.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      setLenis(instance);

      return () => {
        gsap.ticker.remove(tick);
        gsap.ticker.lagSmoothing(500, 33);
        instance.destroy();
        setLenis(null);
      };
    }

    // Reduced motion means no Lenis at all; the browser scrolls natively.
    // Re-evaluated live so toggling the OS setting takes effect without reload.
    let stop: (() => void) | null = query.matches ? null : start();

    const onChange = () => {
      stop?.();
      stop = query.matches ? null : start();
      ScrollTrigger.refresh();
    };
    query.addEventListener("change", onChange);

    return () => {
      query.removeEventListener("change", onChange);
      stop?.();
    };
  }, []);

  return <LenisContext value={lenis}>{children}</LenisContext>;
}
