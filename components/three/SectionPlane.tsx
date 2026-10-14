"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo } from "react";
import {
  type Group,
  MeshBasicMaterial,
  Plane,
  Raycaster,
  Vector2,
  Vector3,
} from "three";
import {
  createSectionCap,
  type EnvironmentId,
  xrayHighlight,
} from "@/design/three-presets";
import type { ViewRuntime } from "./viewRuntime";

// The cut runs across X, through the motor body: t = 0 and t = 1 sit just
// inside the end covers' radius, t = 0.5 is the shaft axis.
const X_MIN = -0.064;
const X_MAX = 0.064;
// The cap plane covers the exploded model in Y and Z; the stencil decides
// where it actually draws.
const CAP = { length: 1.3, height: 0.34, centreY: 0.04 } as const;
// The handle sits on the cut just under the stand's foot: inside every
// shot, and nothing moves there in the explode.
const HANDLE_Y = -0.106;

export function sectionX(t: number): number {
  return X_MIN + (X_MAX - X_MIN) * t;
}

// Runs after the rotation group (priority 0) has moved the model this frame
// and before drei's View renders it (priority 1), so plane, cap and clipping
// never disagree by a frame while the model turns.
const AFTER_ROTATION = 0.5;

/**
 * The cutting plane: a world-space clipping plane derived from the model's
 * transform, a stencil-masked cap on the cut, and a copper handle on the
 * cut under the stand that can be dragged along the cut direction.
 */
export function SectionPlane({
  root,
  runtime,
  env,
  on,
  t,
  hatch,
}: {
  /** The model group; the cut is in its space. */
  root: RefObject<Group | null>;
  runtime: ViewRuntime;
  env: EnvironmentId;
  on: boolean;
  t: number;
  hatch: boolean;
}) {
  const gl = useThree((s) => s.gl);
  const get = useThree((s) => s.get);
  const invalidate = useThree((s) => s.invalidate);
  const x = sectionX(t);

  const capMaterial = useMemo(
    () => createSectionCap(env, gl.getPixelRatio(), hatch),
    [env, gl, hatch],
  );
  const handleMaterial = useMemo(
    () => new MeshBasicMaterial({ color: xrayHighlight[env] }),
    [env],
  );
  useEffect(
    () => () => {
      capMaterial.dispose();
      handleMaterial.dispose();
    },
    [capMaterial, handleMaterial],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: listed only to request a frame when they change
  useEffect(() => {
    invalidate();
  }, [on, t, invalidate]);

  const local = useMemo(() => new Plane(new Vector3(-1, 0, 0), 0), []);
  useFrame(() => {
    const group = root.current;
    if (!group) return;
    group.updateWorldMatrix(true, false);
    local.constant = x;
    runtime.sectionPlane.copy(local).applyMatrix4(group.matrixWorld);
    // Adaptive DPR changes the pixel ratio; hatch spacing is in CSS pixels.
    capMaterial.uniforms.uPixelRatio.value = gl.getPixelRatio();
  }, AFTER_ROTATION);

  // Dragging the handle: intersect the pointer ray with the plane that holds
  // the cut direction and faces the camera most squarely, then read the
  // model-space X of the hit.
  useEffect(() => {
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    const origin = new Vector3();
    const axis = new Vector3();
    const toCamera = new Vector3();
    const hit = new Vector3();
    const plane = new Plane();

    runtime.sectionAt = (clientX, clientY) => {
      const group = root.current;
      const element = runtime.element;
      if (!group || !element) return null;
      const rect = element.getBoundingClientRect();
      const { camera } = get();
      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, camera);

      group.updateWorldMatrix(true, false);
      origin.set(0, HANDLE_Y, 0).applyMatrix4(group.matrixWorld);
      axis.set(1, 0, 0).transformDirection(group.matrixWorld);
      toCamera.copy(camera.position).sub(origin);
      toCamera.addScaledVector(axis, -toCamera.dot(axis)).normalize();
      plane.setFromNormalAndCoplanarPoint(toCamera, origin);
      if (!raycaster.ray.intersectPlane(plane, hit)) return null;

      const along =
        hit.sub(origin).dot(axis) / group.matrixWorld.getMaxScaleOnAxis();
      return (along - X_MIN) / (X_MAX - X_MIN);
    };
    return () => {
      runtime.sectionAt = null;
    };
  }, [runtime, root, get]);

  if (!on) return null;

  return (
    <group position={[x, 0, 0]}>
      {/* After the parts (0) and their stencil passes (1). */}
      <mesh
        position={[0, CAP.centreY, 0]}
        rotation={[0, Math.PI / 2, 0]}
        material={capMaterial}
        renderOrder={2}
        raycast={() => null}
      >
        <planeGeometry args={[CAP.length, CAP.height]} />
      </mesh>
      <mesh
        position={[0, HANDLE_Y, 0]}
        material={handleMaterial}
        userData={{ handle: true }}
      >
        <boxGeometry args={[0.004, 0.008, 0.05]} />
      </mesh>
    </group>
  );
}
