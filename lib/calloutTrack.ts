// Screen positions of a view's callout anchors, published by the canvas each
// rendered frame and applied by the page to its own DOM notes. The notes live
// outside the view (they are real text, listed in reading order), so they
// can't inherit anything from it; this bridge carries the projection across
// without re-rendering React. No three.js here.

import type { PartId } from "@/data/types";

/** A point on a part, as fractions of its rest bounds (x, y, z). */
export interface CalloutAnchor {
  part: PartId;
  at: readonly [number, number, number];
}

/** CSS pixels from the view's top-left corner. */
export type CalloutPositions = ReadonlyMap<PartId, { x: number; y: number }>;

type Listener = (positions: CalloutPositions | null) => void;

const listeners = new Map<string, Listener>();

/** `null` when the live view goes, so the page falls back to its defaults. */
export function publishCallouts(
  viewId: string,
  positions: CalloutPositions | null,
): void {
  listeners.get(viewId)?.(positions);
}

export function onCallouts(viewId: string, listener: Listener): () => void {
  listeners.set(viewId, listener);
  return () => {
    if (listeners.get(viewId) === listener) listeners.delete(viewId);
  };
}
