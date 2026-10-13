"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useRef } from "react";
import { type PerspectiveCamera as Camera, Vector3 } from "three";
import {
  type CameraShot,
  cameraShots,
  type ShotId,
} from "@/design/three-presets";
import { useSceneStore } from "@/lib/store";

// Seconds to (approximately) reach a new shot. Critically damped: the camera
// arrives and stops, it never swings past.
const SMOOTH_TIME = 0.6;
// After an idle stretch the first frame's delta covers the whole gap; capped
// so the camera eases from where it was instead of teleporting.
const MAX_DELTA = 1 / 30;

let reducedMotion: MediaQueryList | null = null;
function prefersReducedMotion(): boolean {
  reducedMotion ??= window.matchMedia("(prefers-reduced-motion: reduce)");
  return reducedMotion.matches;
}

function framingFor(shot: ShotId, aspect: number): CameraShot {
  const preset: CameraShot = cameraShots[shot];
  return aspect < 1 && preset.mobile ? preset.mobile : preset;
}

/**
 * The view's camera, damped towards the shot in the store. Renders only while
 * it is still moving: each unsettled frame asks for the next one.
 */
export function CameraRig({ viewId }: { viewId: string }) {
  const camera = useRef<Camera>(null);
  const target = useRef(new Vector3());
  const goal = useRef({ position: new Vector3(), target: new Vector3() });
  const placed = useRef(false);
  const shot = useSceneStore((s) => s.views[viewId]?.shot ?? "hero");
  const shotRef = useRef(shot);
  const invalidate = useThree((s) => s.invalidate);

  // A new shot starts the loop; the frame callback keeps it going.
  useEffect(() => {
    shotRef.current = shot;
    invalidate();
  }, [shot, invalidate]);

  useFrame((state, rawDelta) => {
    const cam = camera.current;
    if (!cam) return;
    // drei's View sets the camera aspect just before it renders, so on the
    // very first frame it is not set yet; the view's own size is.
    const aspect = placed.current
      ? cam.aspect
      : state.size.width / state.size.height;
    const framing = framingFor(shotRef.current, aspect);
    goal.current.position.set(...framing.position);
    goal.current.target.set(...framing.target);

    // First frame, and every frame under reduced motion: cut, don't move.
    if (!placed.current || prefersReducedMotion()) {
      placed.current = true;
      cam.position.copy(goal.current.position);
      target.current.copy(goal.current.target);
      cam.fov = framing.fov;
      cam.updateProjectionMatrix();
      cam.lookAt(target.current);
      return;
    }

    const delta = Math.min(rawDelta, MAX_DELTA);
    // All three must step every frame, so no short-circuiting.
    const position = easing.damp3(
      cam.position,
      goal.current.position,
      SMOOTH_TIME,
      delta,
    );
    const aim = easing.damp3(
      target.current,
      goal.current.target,
      SMOOTH_TIME,
      delta,
    );
    const fov = easing.damp(cam, "fov", framing.fov, SMOOTH_TIME, delta);
    cam.updateProjectionMatrix();
    cam.lookAt(target.current);
    if (position || aim || fov) state.invalidate();
  });

  return <PerspectiveCamera ref={camera} makeDefault near={0.01} far={20} />;
}
