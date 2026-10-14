"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "@/components/motion/SmoothScroll";
import { company } from "@/data/company";
import { duration } from "@/design/tokens";
import { gsap } from "@/lib/gsap";
import {
  PRELOAD_ATTRIBUTE,
  PRELOAD_SESSION_KEY,
  usePreloader,
} from "@/lib/preloader";
import { useSceneStore } from "@/lib/store";

const COLUMNS = 8;
// From navigation start: the centre line has finished drawing by then.
const MIN_HOLD_MS = 800;
// A slow or failed model load never holds the page longer than this.
const MAX_HOLD_MS = 4000;
const STAIR_STEP = 0.05;

/**
 * First load of a session: a Lab-coloured cover with the centre line drawn
 * across it, until the page's first 3D view has drawn. It then splits along
 * the centre line and leaves as a double staircase: upper halves up from the
 * left, lower halves down from the right.
 *
 * The markup is always server-rendered and hidden by CSS; the decision script
 * in <head> reveals it before first paint, so there's no flash either way and
 * no-JS visitors never see it.
 */
export function Preloader() {
  const ref = useRef<HTMLDivElement>(null);
  const state = usePreloader((s) => s.state);
  const setState = usePreloader((s) => s.set);
  const lenis = useLenis();

  // Any view drawn, the poster tier (nothing will draw), or a page with no
  // views once the tier is known (views register before the tier is set).
  const pageReady = useSceneStore(
    (s) =>
      s.tier === "poster" ||
      (s.tier !== null && Object.keys(s.views).length === 0) ||
      Object.values(s.views).some((v) => v.ready),
  );

  const covering = state === "covering";

  useEffect(() => {
    if (!covering || !lenis) return;
    lenis.stop();
    return () => lenis.start();
  }, [covering, lenis]);

  // Lift on whichever comes first: ready (but not before the minimum hold),
  // or the maximum hold.
  useEffect(() => {
    if (!covering) return;
    const now = performance.now();
    const wait = pageReady
      ? Math.max(0, MIN_HOLD_MS - now)
      : Math.max(0, MAX_HOLD_MS - now);
    const timer = setTimeout(() => setState("lifting"), wait);
    return () => clearTimeout(timer);
  }, [covering, pageReady, setState]);

  useEffect(() => {
    if (state !== "lifting") return;
    const el = ref.current;
    try {
      sessionStorage.setItem(PRELOAD_SESSION_KEY, "1");
    } catch {
      // No storage: the cover shows again next load; nothing breaks.
    }
    const finish = () => {
      document.documentElement.removeAttribute(PRELOAD_ATTRIBUTE);
      setState("gone");
    };
    if (!el) {
      finish();
      return;
    }
    const tl = gsap
      .timeline({ onComplete: finish })
      .to(el.querySelector(".preloader-mark"), {
        autoAlpha: 0,
        duration: duration.quick,
        ease: "settle",
      })
      .to(
        el.querySelectorAll(".preloader-top"),
        {
          yPercent: -100,
          duration: duration.scene,
          ease: "machine",
          stagger: STAIR_STEP,
        },
        0,
      )
      .to(
        el.querySelectorAll(".preloader-bottom"),
        {
          yPercent: 100,
          duration: duration.scene,
          ease: "machine",
          stagger: { each: STAIR_STEP, from: "end" },
        },
        0,
      );
    return () => {
      tl.kill();
    };
  }, [state, setState]);

  // Always rendered, so server and client markup match; CSS shows it only
  // while <html> carries the preload attribute.
  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-env="lab"
      data-ground="canvas"
      className="preloader pointer-events-none fixed inset-0 z-preloader"
    >
      <div className="absolute inset-0 flex">
        {Array.from({ length: COLUMNS }, (_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed set of columns
          <div key={i} className="flex h-full flex-1 flex-col">
            {/* A hairline of overlap so no seam shows between the halves. */}
            <div className="preloader-top -mb-px h-1/2 bg-ground" />
            <div className="preloader-bottom h-1/2 bg-ground" />
          </div>
        ))}
      </div>
      <div className="preloader-mark absolute inset-x-0 top-1/2">
        <p className="absolute bottom-2 left-margin type-annotation text-ink">
          {company.shortName}
        </p>
        <svg
          className="preloader-line absolute inset-x-0 h-px w-full overflow-visible text-accent"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="0"
            x2="100%"
            y2="0"
            stroke="currentColor"
            strokeDasharray="24 6 4 6"
          />
        </svg>
      </div>
    </div>
  );
}
