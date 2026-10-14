"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import type { PosterShot } from "@/data/types";
import type { EnvironmentId, ShotId } from "@/design/three-presets";
import { useSceneStore } from "@/lib/store";
import { PosterFallback } from "./PosterFallback";

const SceneContent = dynamic(() => import("./SceneContent"), { ssr: false });

interface SceneViewProps {
  id: string;
  shot: ShotId;
  poster: PosterShot;
  env: EnvironmentId;
  /** Drag to turn the model. */
  rotate?: boolean;
  /** Wheel and pinch zoom; takes over touch gestures, so only for a full-screen explorer. */
  zoom?: boolean;
  /** Full explorer: tap parts to isolate, drag the section, balloons. */
  explore?: boolean;
  /**
   * Accessible name. With it the view is a focusable image (arrow keys turn
   * the model); without it the view is decorative.
   */
  label?: string;
  /** Sizing for the placeholder; the view fills it. */
  className?: string;
  /** `sizes` for the poster image, matching the placeholder's width. */
  sizes?: string;
  /** Above the fold: load the poster eagerly, it is likely the LCP. */
  eager?: boolean;
  /**
   * The page draws its own loading state (the hero's elevation drawing), so
   * the poster appears only on the `poster` tier, never while loading.
   */
  ownLoading?: boolean;
  /**
   * The camera holds `shot` even while exploded or sectioned: a scroll scene
   * that cuts or opens the model owns the framing itself.
   */
  fixedShot?: boolean;
}

/**
 * A DOM placeholder that the shared canvas draws one scene into. The server
 * renders the poster; the live view replaces it once its first frame is up.
 * Registration and the visibility observer live in effects, so a page hidden
 * by `<Activity>` unregisters its views and stops them rendering.
 */
export function SceneView({
  id,
  shot,
  poster,
  env,
  rotate = false,
  zoom = false,
  explore = false,
  label,
  className = "",
  sizes = "100vw",
  eager = false,
  ownLoading = false,
  fixedShot = false,
}: SceneViewProps) {
  const element = useRef<HTMLDivElement>(null);
  const shotRef = useRef(shot);
  const tier = useSceneStore((s) => s.tier);
  const live = tier !== null && tier !== "poster";
  const ready = useSceneStore((s) => s.views[id]?.ready ?? false);
  const registerView = useSceneStore((s) => s.registerView);
  const unregisterView = useSceneStore((s) => s.unregisterView);
  const setViewVisible = useSceneStore((s) => s.setViewVisible);
  const setShot = useSceneStore((s) => s.setShot);

  useEffect(() => {
    registerView(id, shotRef.current);
    return () => unregisterView(id);
  }, [id, registerView, unregisterView]);

  useEffect(() => {
    shotRef.current = shot;
    setShot(id, shot);
  }, [id, shot, setShot]);

  useEffect(() => {
    const el = element.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setViewVisible(id, entry.isIntersecting);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [id, setViewVisible]);

  // Touch: horizontal drags turn the model, vertical ones scroll the page.
  // Zoom claims every touch gesture for pinch.
  const gestures =
    !live || !rotate
      ? ""
      : `cursor-grab active:cursor-grabbing ${zoom ? "touch-none" : "touch-pan-y"}`;

  return (
    <div
      ref={element}
      className={`relative ${gestures} ${className}`}
      data-lenis-prevent={zoom && live ? "" : undefined}
      {...(label
        ? {
            role: "img",
            "aria-label": label,
            tabIndex: live && rotate ? 0 : undefined,
          }
        : { "aria-hidden": true })}
    >
      {(ownLoading ? tier === "poster" : !live || !ready) && (
        <PosterFallback poster={poster} env={env} sizes={sizes} eager={eager} />
      )}
      {live && (
        <SceneContent
          id={id}
          env={env}
          element={element}
          rotate={rotate}
          zoom={zoom}
          explore={explore}
          fixedShot={fixedShot}
        />
      )}
    </div>
  );
}
