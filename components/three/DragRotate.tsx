"use client";

import { invalidate, useFrame } from "@react-three/fiber";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { type Group, Quaternion, Vector3 } from "three";

/** Shared between the DOM gesture handlers and the group in the scene. */
interface RotateState {
  yaw: number;
  pitch: number;
  /** Radians per second, carried after release. */
  yawVelocity: number;
  pitchVelocity: number;
  dragging: boolean;
  zoom: number;
}

// The model tips at most ±20° towards or away from the camera, so it is
// never seen from directly above or below, where it stops reading as a motor.
const PITCH_LIMIT = (20 * Math.PI) / 180;
// A drag across the full width of the view turns the model half a turn.
const TURN_PER_WIDTH = Math.PI;
// Inertia decays exponentially: after a flick the model coasts and settles
// without overshoot (the house rule: no bounce, including flicks).
const DECAY_PER_SECOND = 4;
const REST_VELOCITY = 0.01;
// A release this long after the last move is a placement, not a flick.
const FLICK_WINDOW_MS = 80;
const ZOOM_LIMITS = { min: 1, max: 2.5 } as const;
const WHEEL_ZOOM_RATE = 0.0015;
const MAX_DELTA = 1 / 30;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Pointer gestures on a view's DOM element, written into a mutable state
 * object the scene reads each frame. Mouse and pen turn on both axes; touch
 * turns horizontally only, because vertical touch drags scroll the page
 * (`touch-action: pan-y` hands them to the browser). With `zoom`, the wheel
 * and two-finger pinch scale the model; without it they belong to the page.
 */
export function useDragRotate(
  element: RefObject<HTMLElement | null>,
  { enabled, zoom }: { enabled: boolean; zoom: boolean },
): RotateState {
  const [state] = useState<RotateState>(() => ({
    yaw: 0,
    pitch: 0,
    yawVelocity: 0,
    pitchVelocity: 0,
    dragging: false,
    zoom: 1,
  }));

  useEffect(() => {
    const el = element.current;
    if (!el || !enabled) return;

    const pointers = new Map<number, { x: number; y: number }>();
    let lastMove = 0;
    let pinch: { distance: number; zoom: number } | null = null;

    const pinchDistance = () => {
      const [a, b] = [...pointers.values()];
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      el.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      state.dragging = true;
      state.yawVelocity = 0;
      state.pitchVelocity = 0;
      lastMove = event.timeStamp;
      if (zoom && pointers.size === 2) {
        pinch = { distance: pinchDistance(), zoom: state.zoom };
      }
      invalidate();
    };

    const onMove = (event: PointerEvent) => {
      const last = pointers.get(event.pointerId);
      if (!last) return;
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

      if (pinch && pointers.size === 2) {
        const distance = pinchDistance();
        if (pinch.distance > 0) {
          state.zoom = clamp(
            (pinch.zoom * distance) / pinch.distance,
            ZOOM_LIMITS.min,
            ZOOM_LIMITS.max,
          );
        }
        invalidate();
        return;
      }

      const { width, height } = el.getBoundingClientRect();
      const dt = Math.max(event.timeStamp - lastMove, 1) / 1000;
      lastMove = event.timeStamp;

      const dYaw = ((event.clientX - last.x) / width) * TURN_PER_WIDTH;
      const dPitch =
        event.pointerType === "touch"
          ? 0
          : ((event.clientY - last.y) / height) * TURN_PER_WIDTH;
      state.yaw += dYaw;
      state.pitch = clamp(state.pitch + dPitch, -PITCH_LIMIT, PITCH_LIMIT);
      // Light smoothing so one jittery event doesn't decide the flick.
      state.yawVelocity = state.yawVelocity * 0.5 + (dYaw / dt) * 0.5;
      state.pitchVelocity = state.pitchVelocity * 0.5 + (dPitch / dt) * 0.5;
      invalidate();
    };

    const onUp = (event: PointerEvent) => {
      if (!pointers.delete(event.pointerId)) return;
      if (pointers.size < 2) pinch = null;
      if (pointers.size > 0) return;
      state.dragging = false;
      if (
        event.type === "pointercancel" ||
        event.timeStamp - lastMove > FLICK_WINDOW_MS
      ) {
        state.yawVelocity = 0;
        state.pitchVelocity = 0;
      }
      invalidate();
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      state.zoom = clamp(
        state.zoom * Math.exp(-event.deltaY * WHEEL_ZOOM_RATE),
        ZOOM_LIMITS.min,
        ZOOM_LIMITS.max,
      );
      invalidate();
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    // Not passive: zoom must stop the page (and Lenis) from scrolling.
    if (zoom) el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("wheel", onWheel);
    };
  }, [element, state, enabled, zoom]);

  return state;
}

const UP = new Vector3(0, 1, 0);

/**
 * Rotates its children (the model and its shadow), not the camera, so shots
 * stay authored and the lighting stays fixed to the studio. Pitch turns about
 * the camera's horizontal axis, so dragging up always tips the model towards
 * the viewer whichever way it faces.
 */
export function RotateGroup({
  state,
  children,
}: {
  state: RotateState;
  children: ReactNode;
}) {
  const group = useRef<Group>(null);
  const [scratch] = useState(() => ({
    right: new Vector3(),
    yaw: new Quaternion(),
    pitch: new Quaternion(),
  }));

  useFrame((frame, rawDelta) => {
    const g = group.current;
    if (!g) return;
    const delta = Math.min(rawDelta, MAX_DELTA);

    let coasting = false;
    if (!state.dragging) {
      coasting =
        Math.abs(state.yawVelocity) > REST_VELOCITY ||
        Math.abs(state.pitchVelocity) > REST_VELOCITY;
      if (coasting) {
        state.yaw += state.yawVelocity * delta;
        state.pitch = clamp(
          state.pitch + state.pitchVelocity * delta,
          -PITCH_LIMIT,
          PITCH_LIMIT,
        );
        // Hitting the tilt limit stops tilting dead, no rebound.
        if (Math.abs(state.pitch) === PITCH_LIMIT) state.pitchVelocity = 0;
        const decay = Math.exp(-DECAY_PER_SECOND * delta);
        state.yawVelocity *= decay;
        state.pitchVelocity *= decay;
      }
    }

    const { right, yaw, pitch } = scratch;
    right.set(1, 0, 0).applyQuaternion(frame.camera.quaternion);
    right.y = 0;
    right.normalize();
    yaw.setFromAxisAngle(UP, state.yaw);
    pitch.setFromAxisAngle(right, state.pitch);
    g.quaternion.multiplyQuaternions(pitch, yaw);
    g.scale.setScalar(state.zoom);

    if (state.dragging || coasting) {
      // Drop resolution while moving (AdaptiveDpr), restore once still.
      frame.performance.regress();
      if (coasting) frame.invalidate();
    }
  });

  return <group ref={group}>{children}</group>;
}
