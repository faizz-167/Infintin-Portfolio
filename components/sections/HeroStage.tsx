"use client";

import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { DrawPath } from "@/components/motion/DrawPath";
import { type SceneBuild, ScrollScene } from "@/components/motion/ScrollScene";
import { setSection } from "@/components/motion/SectionSweep";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { useMotionPreference } from "@/components/motion/useMotionPreference";
import { SceneView } from "@/components/three/SceneView";
import { Button } from "@/components/ui/Button";
import { breakpoint, duration } from "@/design/tokens";
import { driveExplode } from "@/lib/explodeDrive";
import { gsap } from "@/lib/gsap";
import { useSceneStore } from "@/lib/store";

const VIEW = "hero";
// The model is given this long to arrive before the drawing simply hands
// over to it, with no assembly sequence (08.2).
const LATE_MS = 2500;
// How far a peek opens the assembly (0–1 of the full explode).
const PEEK = 0.35;
const HOLD_MS = 350;
const HOLD_SLOP = 6;

// Within the pinned scroll (0–1): the camera turns to the elevation at once,
// then the cut crosses between these points.
const SWEEP_START = 0.15;
const SWEEP_LENGTH = 0.7;

type Phase = "drawing" | "assembling" | "assembled";

const desktopQuery = `(min-width: ${breakpoint.lg}px)`;
function useDesktop(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(desktopQuery);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(desktopQuery).matches,
    () => true,
  );
}

type HeroStageProps = {
  headline: string;
  lede: ReactNode;
  status: ReactNode;
  actions: ReactNode;
  /** The elevation drawing; rendered twice (preloader, and the Sheet side). */
  drawing: ReactNode;
  sheetDrawing: ReactNode;
};

/**
 * Sheet 01. The Lab: the motor on its shaft axis, the headline above it.
 * The model arrives by seating its parts along the shaft out of the
 * elevation drawing (assembly lock); scrolling pins the scene while the
 * camera turns to the elevation and a section sweep crosses into the Sheet,
 * where the same drawing lies exactly over the 3D.
 */
export function HeroStage({
  headline,
  lede,
  status,
  actions,
  drawing,
  sheetDrawing,
}: HeroStageProps) {
  const tier = useSceneStore((s) => s.tier);
  const ready = useSceneStore((s) => s.views[VIEW]?.ready ?? false);
  const live = tier !== null && tier !== "poster";
  const { reduced } = useMotionPreference();
  const desktop = useDesktop();

  const [phase, setPhase] = useState<Phase>("drawing");
  const [late, setLate] = useState(false);
  const [swept, setSwept] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const [interacted, setInteracted] = useState(false);

  // Assembly lock. The parts wait exploded from the first frame; once the
  // model is up they seat along the shaft and the headline machines to width.
  useEffect(() => {
    if (!reduced) driveExplode(VIEW, 1);
    const timer = setTimeout(() => setLate(true), LATE_MS);
    return () => {
      clearTimeout(timer);
      driveExplode(VIEW, null);
    };
  }, [reduced]);

  const assembled = phase === "assembled";
  useEffect(() => {
    if (assembled) return;
    if (tier === "poster") {
      setPhase("assembled");
      return;
    }
    if (!ready) return;
    if (reduced || late) {
      driveExplode(VIEW, null);
      setPhase("assembled");
      return;
    }
    setPhase("assembling");
    const progress = { value: 1 };
    const tween = gsap.to(progress, {
      value: 0,
      duration: duration.assembly,
      ease: "machine",
      onUpdate: () => driveExplode(VIEW, progress.value),
      onComplete: () => {
        driveExplode(VIEW, null);
        setPhase("assembled");
      },
    });
    return () => {
      tween.kill();
    };
  }, [assembled, tier, ready, reduced, late]);

  // Peek: a partial explode while held. Starts from wherever the last peek
  // was, so a quick re-press reverses smoothly.
  const peekValue = useRef({ value: 0 });
  const peek = useCallback(
    (on: boolean) => {
      if (!assembled || !live) return;
      setPeeking(on);
      gsap.killTweensOf(peekValue.current);
      gsap.to(peekValue.current, {
        value: on ? PEEK : 0,
        duration: reduced ? 0 : duration.base,
        ease: "machine",
        onUpdate: () => driveExplode(VIEW, peekValue.current.value),
        onComplete: () => {
          if (!on) driveExplode(VIEW, null);
        },
      });
    },
    [assembled, live, reduced],
  );

  const hold = useRef<{
    x: number;
    y: number;
    timer: ReturnType<typeof setTimeout>;
  } | null>(null);
  const endHold = () => {
    if (hold.current) clearTimeout(hold.current.timer);
    hold.current = null;
    if (peeking) peek(false);
  };
  const onPointerDown = (event: PointerEvent) => {
    setInteracted(true);
    // Touch holds belong to scrolling; phones get the toggle instead.
    if (event.pointerType === "touch") return;
    const { clientX: x, clientY: y } = event;
    hold.current = { x, y, timer: setTimeout(() => peek(true), HOLD_MS) };
  };
  const onPointerMove = (event: PointerEvent) => {
    const start = hold.current;
    if (
      start &&
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > HOLD_SLOP
    ) {
      clearTimeout(start.timer);
    }
  };
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key.startsWith("Arrow")) setInteracted(true);
    if (event.key.toLowerCase() === "e" && !event.repeat) {
      setInteracted(true);
      peek(true);
    }
  };
  const onKeyUp = (event: KeyboardEvent) => {
    if (event.key.toLowerCase() === "e") peek(false);
  };

  // Pinned scroll: elevation shot, then the cut crosses into the Sheet and
  // the 3D section follows it in depth, from the near cover to the axis.
  const build: SceneBuild = (tl, { conditions, root }) => {
    if (conditions.reduce) return;
    const sheet = root.querySelector(".hero-sheet");
    const cut = root.querySelector(".hero-cut");
    const scroll = { p: 0 };
    tl.to(
      scroll,
      {
        p: 1,
        duration: 1,
        ease: "none",
        onUpdate: () => {
          setSwept(scroll.p > 0.02);
          const s = Math.min(
            1,
            Math.max(0, (scroll.p - SWEEP_START) / SWEEP_LENGTH),
          );
          const cutting = s > 0 && s < 1;
          gsap.set(cut, { autoAlpha: cutting ? 1 : 0 });
          setSection(VIEW, cutting, 1 - s / 2);
        },
      },
      0,
    )
      .fromTo(
        sheet,
        { clipPath: "inset(0% 100% 0% 0%)" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: SWEEP_LENGTH,
          ease: "none",
        },
        SWEEP_START,
      )
      .fromTo(
        cut,
        { left: "0%" },
        { left: "100%", duration: SWEEP_LENGTH, ease: "none" },
        SWEEP_START,
      );
  };

  // Phones keep the diagonal hero framing throughout: the elevation of a
  // 5.7 : 1 assembly is a sliver in portrait.
  const shot = desktop && (!assembled || swept) ? "elevation" : "home";
  const showDrawing = tier !== "poster" && !(ready && assembled);

  return (
    <ScrollScene
      id="hero"
      sheet="Motor"
      pin
      scrub
      end="+=100%"
      build={build}
      className="relative h-svh min-h-[36rem] overflow-hidden"
    >
      {/* Lab ground: painted by the canvas once the live view is up, so the
          model isn't hidden under the section's own background. */}
      <div
        data-env="lab"
        data-ground={live && ready ? "canvas" : undefined}
        className="absolute inset-0"
      >
        {/* biome-ignore lint/a11y/noStaticElementInteractions: the view inside is the focusable element; this only listens for hold and E */}
        <div
          className="absolute inset-0"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endHold}
          onPointerCancel={endHold}
          onKeyDown={onKeyDown}
          onKeyUp={onKeyUp}
        >
          <SceneView
            id={VIEW}
            shot={shot}
            poster="hero"
            env="lab"
            rotate
            ownLoading
            fixedShot
            label="3D model of the fan coil unit motor prototype. Arrow keys turn it; hold E to look inside."
            className="size-full"
          />
        </div>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 text-ink transition-opacity duration-(--duration-base) ease-settle ${
            !showDrawing
              ? "opacity-0"
              : phase === "assembling"
                ? "opacity-25"
                : "opacity-100"
          }`}
        >
          <DrawPath className="size-full">{drawing}</DrawPath>
        </div>

        <div className="pointer-events-none relative flex h-full flex-col justify-between px-margin pt-[calc(var(--spacing-header)+var(--spacing-4))] pb-5">
          <SplitHeadline
            as="h1"
            // Widens over the same duration as the assembly, so the last line
            // reaches full width as the last part seats.
            lock={reduced ? undefined : phase !== "drawing"}
            className="type-display-xl text-ink lg:type-display-l lg:indent-[calc((100%+var(--spacing-gutter))/12*2)] lg:[&>*]:indent-0 lg:[&>*:first-child]:indent-[calc((100%+var(--spacing-gutter))/12*2)]"
          >
            {headline}
          </SplitHeadline>

          <div className="flex flex-col gap-3 lg:ml-[calc((100%+var(--spacing-gutter))/12*6)]">
            <p className="max-w-[60ch] type-lede text-ink">{lede}</p>
            <div>{status}</div>
            <div className="pointer-events-auto flex flex-wrap items-center gap-2">
              {actions}
              <Button
                variant="secondary"
                pressed={peeking}
                shortcut="E"
                onClick={() => peek(!peeking)}
                className={`lg:hidden ${live && assembled ? "" : "invisible"}`}
              >
                Look inside
              </Button>
            </div>
          </div>
        </div>

        {live && assembled && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute top-1/2 right-margin flex translate-y-[2rem] flex-col items-end gap-1 transition-opacity duration-(--duration-base) ease-settle lg:translate-y-[6rem] ${
              interacted ? "opacity-0" : "opacity-100"
            }`}
          >
            <svg
              className="h-px w-8 overflow-visible text-accent"
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
            <p className="type-annotation text-ink-muted">Drag to rotate</p>
            {/* Phones have the "Look inside" button instead. */}
            <p className="hidden type-annotation text-ink-muted lg:block">
              Hold, or press E, to look inside
            </p>
          </div>
        )}
      </div>

      {/* The Sheet side of the cut. */}
      <div
        aria-hidden="true"
        data-env="sheet"
        className="hero-sheet pointer-events-none absolute inset-0 text-ink motion-reduce:hidden"
        style={{ clipPath: "inset(0% 100% 0% 0%)" }}
      >
        {sheetDrawing}
      </div>
      <span
        aria-hidden="true"
        className="hero-cut pointer-events-none invisible absolute inset-y-0 w-px bg-accent"
      />
    </ScrollScene>
  );
}
