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
import type { PartId } from "@/data/types";
import { prefersReducedMotion } from "./reducedMotion";
import type { Pick, RotateState, ViewRuntime } from "./viewRuntime";

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
// Movement under this (CSS px) between down and up is a tap, not a drag.
const TAP_SLOP = 5;
const ZOOM_LIMITS = { min: 1, max: 2.5 } as const;
const WHEEL_ZOOM_RATE = 0.0015;
const MAX_DELTA = 1 / 30;
// Arrow keys: a nudge of velocity (coasts like a flick), or a fixed step
// under reduced motion.
const KEY_VELOCITY = 2.5;
const KEY_STEP = (15 * Math.PI) / 180;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

interface GestureOptions {
  /** Drag (and arrow keys) turn the model. */
  rotate: boolean;
  /** Wheel and pinch zoom; without it they belong to the page. */
  zoom: boolean;
  /** Tap a part to isolate it, empty space to clear; hover highlights. */
  onTap?: (part: PartId | null) => void;
  onHover?: (part: PartId | null) => void;
  /** Section handle dragged to a new position (0–1). */
  onSection?: (t: number) => void;
}

/**
 * Pointer and key gestures on a view's DOM element. Mouse and pen turn on
 * both axes; touch turns horizontally only, because vertical touch drags
 * scroll the page (`touch-action: pan-y` hands them to the browser). A press
 * on the section handle drags the cut instead; a press that barely moves is
 * a tap. Rotation lives in `runtime.rotation`, read by `RotateGroup`.
 */
export function useViewGestures(
  element: RefObject<HTMLElement | null>,
  runtime: ViewRuntime,
  options: GestureOptions,
): void {
  // Callbacks change identity every render; the listeners read the latest.
  const latest = useRef(options);
  latest.current = options;
  const { rotate, zoom } = options;

  useEffect(() => {
    const el = element.current;
    if (!el) return;
    const state = runtime.rotation;
    const pointers = new Map<number, { x: number; y: number }>();
    let lastMove = 0;
    let down: { x: number; y: number; pick: Pick; moved: boolean } | null =
      null;
    let mode: "rotate" | "section" = "rotate";
    let pinch: { distance: number; zoom: number } | null = null;
    let hoverFrame = 0;

    const pickAt = (x: number, y: number): Pick => runtime.pick?.(x, y) ?? null;
    const interactive = () =>
      latest.current.onTap !== undefined ||
      latest.current.onSection !== undefined;

    const pinchDistance = () => {
      const [a, b] = [...pointers.values()];
      return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0;
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      el.setPointerCapture(event.pointerId);
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      lastMove = event.timeStamp;

      if (pointers.size === 1) {
        const pick = interactive()
          ? pickAt(event.clientX, event.clientY)
          : null;
        down = { x: event.clientX, y: event.clientY, pick, moved: false };
        mode = pick?.kind === "handle" ? "section" : "rotate";
      }
      if (mode === "rotate" && latest.current.rotate) {
        state.dragging = true;
        state.yawVelocity = 0;
        state.pitchVelocity = 0;
      }
      if (latest.current.zoom && pointers.size === 2) {
        pinch = { distance: pinchDistance(), zoom: state.zoom };
      }
      invalidate();
    };

    const onMove = (event: PointerEvent) => {
      const last = pointers.get(event.pointerId);
      if (!last) {
        // Hover: mouse and pen only, at most once per frame.
        if (
          event.pointerType !== "touch" &&
          latest.current.onHover &&
          !hoverFrame
        ) {
          const { clientX, clientY } = event;
          hoverFrame = requestAnimationFrame(() => {
            hoverFrame = 0;
            const pick = pickAt(clientX, clientY);
            latest.current.onHover?.(pick?.kind === "part" ? pick.part : null);
          });
        }
        return;
      }
      pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      if (
        down &&
        Math.hypot(event.clientX - down.x, event.clientY - down.y) > TAP_SLOP
      ) {
        down.moved = true;
      }

      if (mode === "section") {
        const t = runtime.sectionAt?.(event.clientX, event.clientY);
        if (t !== null && t !== undefined) latest.current.onSection?.(t);
        return;
      }

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
      if (!latest.current.rotate) return;

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

      const cancelled = event.type === "pointercancel";
      if (down && !down.moved && !cancelled && mode === "rotate") {
        latest.current.onTap?.(
          down.pick?.kind === "part" ? down.pick.part : null,
        );
      }
      down = null;
      mode = "rotate";
      state.dragging = false;
      if (cancelled || event.timeStamp - lastMove > FLICK_WINDOW_MS) {
        state.yawVelocity = 0;
        state.pitchVelocity = 0;
      }
      invalidate();
    };

    const onLeave = () => latest.current.onHover?.(null);

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      state.zoom = clamp(
        state.zoom * Math.exp(-event.deltaY * WHEEL_ZOOM_RATE),
        ZOOM_LIMITS.min,
        ZOOM_LIMITS.max,
      );
      invalidate();
    };

    const onKey = (event: KeyboardEvent) => {
      if (!latest.current.rotate || event.target !== el) return;
      const yaw = { ArrowLeft: -1, ArrowRight: 1 }[event.key] ?? 0;
      const pitch = { ArrowUp: -1, ArrowDown: 1 }[event.key] ?? 0;
      if (!yaw && !pitch) return;
      event.preventDefault();
      if (prefersReducedMotion()) {
        state.yaw += yaw * KEY_STEP;
        state.pitch = clamp(
          state.pitch + pitch * KEY_STEP,
          -PITCH_LIMIT,
          PITCH_LIMIT,
        );
      } else {
        state.yawVelocity += yaw * KEY_VELOCITY;
        state.pitchVelocity += pitch * KEY_VELOCITY;
      }
      invalidate();
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("keydown", onKey);
    // Not passive: zoom must stop the page (and Lenis) from scrolling.
    if (zoom) el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      cancelAnimationFrame(hoverFrame);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("keydown", onKey);
      el.removeEventListener("wheel", onWheel);
    };
    // `rotate` is read through `latest`; only zoom changes the listener set.
  }, [element, runtime, zoom]);

  // Turning rotation off mid-coast stops it where it is.
  useEffect(() => {
    if (!rotate) {
      runtime.rotation.yawVelocity = 0;
      runtime.rotation.pitchVelocity = 0;
    }
  }, [rotate, runtime]);
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
