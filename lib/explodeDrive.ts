// Explode progress set directly by a timeline (the hero's assembly lock, the
// hold-to-peek), bypassing the explorer's damped explode target. Kept out of
// the store: it changes every frame while a tween runs. No three.js or R3F
// here, so pages can drive a view without bundling the canvas.

const values = new Map<string, number>();
const redraws = new Map<string, () => void>();

/** Sets a view's explode progress (0 assembled, 1 exploded); `null` hands it
 * back to the explorer state, which damps on from wherever the drive left it. */
export function driveExplode(viewId: string, value: number | null): void {
  if (value === null) values.delete(viewId);
  else values.set(viewId, value);
  redraws.get(viewId)?.();
}

export function drivenExplode(viewId: string): number | undefined {
  return values.get(viewId);
}

/** The canvas side registers how to request a frame for the view. */
export function onExplodeDriven(
  viewId: string,
  redraw: () => void,
): () => void {
  redraws.set(viewId, redraw);
  return () => {
    if (redraws.get(viewId) === redraw) redraws.delete(viewId);
  };
}
