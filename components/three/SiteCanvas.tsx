"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { preload } from "react-dom";
import { modelUrlFor } from "@/design/quality-tiers";
import { detectTier } from "@/lib/quality";
import { useSceneStore } from "@/lib/store";

// `ssr: false` must sit in a client component (Next 16), hence this wrapper
// between the server root layout and the canvas.
const CanvasRoot = dynamic(() => import("./CanvasRoot"), { ssr: false });

/**
 * Detects the quality tier, then mounts the shared canvas the first time a
 * page registers a scene view. Once mounted it stays, so route changes never
 * create a second WebGL context.
 */
export function SiteCanvas() {
  const tier = useSceneStore((s) => s.tier);
  const setTier = useSceneStore((s) => s.setTier);
  const hasViews = useSceneStore((s) => Object.keys(s.views).length > 0);
  const [needed, setNeeded] = useState(false);

  useEffect(() => {
    setTier(detectTier());
  }, [setTier]);

  useEffect(() => {
    if (hasViews) setNeeded(true);
  }, [hasViews]);

  const live = needed && tier !== null && tier !== "poster";

  // Start the model download alongside the canvas chunk, not after it. The
  // crossOrigin matches the loader's fetch so the browser reuses the response.
  if (live)
    preload(modelUrlFor(tier), { as: "fetch", crossOrigin: "anonymous" });

  return live ? <CanvasRoot /> : null;
}
