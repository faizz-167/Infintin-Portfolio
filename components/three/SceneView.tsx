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
  /** Sizing for the placeholder; the view fills it. */
  className?: string;
  /** `sizes` for the poster image, matching the placeholder's width. */
  sizes?: string;
  /** Above the fold: load the poster eagerly, it is likely the LCP. */
  eager?: boolean;
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
  className = "",
  sizes = "100vw",
  eager = false,
}: SceneViewProps) {
  const element = useRef<HTMLDivElement>(null);
  const shotRef = useRef(shot);
  const live = useSceneStore((s) => s.tier !== null && s.tier !== "poster");
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
    >
      {(!live || !ready) && (
        <PosterFallback poster={poster} env={env} sizes={sizes} eager={eager} />
      )}
      {live && (
        <SceneContent
          id={id}
          env={env}
          element={element}
          rotate={rotate}
          zoom={zoom}
        />
      )}
    </div>
  );
}
