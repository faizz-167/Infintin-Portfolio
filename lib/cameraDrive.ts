// Camera travel progress set directly by a scroll timeline (the Portfolio
// elevation), bypassing the rig's damped shot. Kept out of the store for the
// same reason as `explodeDrive`: it changes every frame while scrubbing, and
// the page must drive it without bundling the canvas.

const values = new Map<string, number>();
const redraws = new Map<string, () => void>();

/** Sets a view's travel progress (0 at the front wheel, 1 the whole motor);
 * `null` hands the camera back to the view's shot. */
export function driveCamera(viewId: string, value: number | null): void {
  if (value === null) values.delete(viewId);
  else values.set(viewId, value);
  redraws.get(viewId)?.();
}

export function drivenCamera(viewId: string): number | undefined {
  return values.get(viewId);
}

/** The canvas side registers how to request a frame for the view. */
export function onCameraDriven(viewId: string, redraw: () => void): () => void {
  redraws.set(viewId, redraw);
  return () => {
    if (redraws.get(viewId) === redraw) redraws.delete(viewId);
  };
}
