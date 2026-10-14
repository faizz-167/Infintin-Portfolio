"use client";

import { AdaptiveDpr, View } from "@react-three/drei";
import { advance, Canvas, invalidate, useStore } from "@react-three/fiber";
import { Component, type ReactNode, useEffect } from "react";
import { qualityTiers } from "@/design/three-presets";
import { rememberTier } from "@/lib/quality";
import { useSceneStore } from "@/lib/store";
import { QualityTier } from "./QualityTier";

/**
 * The site's only WebGL canvas: fixed behind the page, transparent to the
 * pointer. Every 3D scene draws into it through a drei `View` that tracks a
 * DOM placeholder, so the model is uploaded once and phones never juggle
 * several contexts.
 */
export default function CanvasRoot() {
  const tier = useSceneStore((s) => s.tier);
  const spec = qualityTiers[tier ?? "low"];

  // Views follow their placeholders only when a frame renders; scrolling is
  // the one movement nothing inside the canvas knows about.
  useEffect(() => {
    const onScroll = () => invalidate();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <CanvasErrorBoundary>
      <Canvas
        eventSource={document.body}
        frameloop="demand"
        dpr={[1, spec.maxDpr]}
        // PCF: three r186 dropped PCFSoft, R3F's default, and warns about it.
        shadows={spec.directionalShadow ? "percentage" : false}
        // Moving frames drop to 75% resolution; the drop is hard to see in motion.
        performance={{ min: 0.75 }}
        // Stencil for section caps; local clipping for per-material section
        // planes (environment and shadow passes stay uncut).
        gl={{ antialias: true, stencil: true }}
        onCreated={({ gl }) => {
          gl.localClippingEnabled = true;
        }}
        className="z-canvas"
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          // Frozen during route wipes (globals.css): never snapshotted.
          viewTransitionName: "site-canvas",
        }}
      >
        <View.Port />
        <QualityTier />
        <AdaptiveDpr />
        <RedrawOnDpr />
      </Canvas>
    </CanvasErrorBoundary>
  );
}

/**
 * A DPR change (AdaptiveDpr drops resolution while the model is dragged)
 * resizes the drawing buffer, which clears it. Waiting for the next frame
 * leaves a blank canvas on screen for one paint, and scenes that leave their
 * ground to the canvas blink white through it. So the frame is drawn at once,
 * from a store subscriber that runs right after R3F's own resize.
 */
function RedrawOnDpr() {
  const store = useStore();
  useEffect(
    () =>
      store.subscribe((state, previous) => {
        if (
          state.viewport.dpr !== previous.viewport.dpr &&
          state.viewport.dpr > 0
        )
          advance(performance.now());
      }),
    [store],
  );
  return null;
}

/**
 * Any failure creating or running the canvas drops the session to posters.
 * The page content never depended on WebGL, so nothing else changes.
 */
class CanvasErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    rememberTier("poster");
    useSceneStore.getState().setTier("poster");
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
