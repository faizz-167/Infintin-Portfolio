import { Plane, Vector3 } from "three";
import type { PartId } from "@/data/types";

export type Pick = { kind: "part"; part: PartId } | { kind: "handle" } | null;

/** Shared between the DOM gesture handlers and the group in the scene. */
export interface RotateState {
  yaw: number;
  pitch: number;
  /** Radians per second, carried after release. */
  yawVelocity: number;
  pitchVelocity: number;
  dragging: boolean;
  zoom: number;
}

/**
 * Mutable per-view bridge between the DOM side (gestures, overlay) and the
 * canvas side (model, camera). Per-frame values pass through here instead of
 * the store, so nothing re-renders at frame rate. The canvas side fills in
 * the functions once the model has loaded.
 */
export interface ViewRuntime {
  /** The view's DOM placeholder; viewport points are measured against it. */
  element: HTMLElement | null;
  rotation: RotateState;
  /** What is under a viewport point: a part, the section handle, or nothing. */
  pick: ((clientX: number, clientY: number) => Pick) | null;
  /** Section position (0–1) under a viewport point while dragging the handle. */
  sectionAt: ((clientX: number, clientY: number) => number | null) | null;
  /** World-space centre and radius of the isolated part, for the camera. */
  focus: { center: Vector3; radius: number } | null;
  /** World-space cutting plane; part materials clip against it when on. */
  sectionPlane: Plane;
  /** Balloons and inspection frame, drawn over the view in DOM. */
  overlay: SVGSVGElement | null;
}

export function createViewRuntime(): ViewRuntime {
  return {
    element: null,
    rotation: {
      yaw: 0,
      pitch: 0,
      yawVelocity: 0,
      pitchVelocity: 0,
      dragging: false,
      zoom: 1,
    },
    pick: null,
    sectionAt: null,
    focus: null,
    sectionPlane: new Plane(new Vector3(-1, 0, 0), 0),
    overlay: null,
  };
}
