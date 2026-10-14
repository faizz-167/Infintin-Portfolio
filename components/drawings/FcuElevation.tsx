import { useId } from "react";
import type { cameraShots } from "@/design/three-presets";
import {
  camera,
  centreLine,
  construction,
  extent,
  outline,
  viewBox,
} from "./generated/fcuElevation.gen";

// The drawing was projected through this camera; if the elevation shot
// changes, this stops compiling until `npm run drawings:elevation` reruns.
const _sameCamera: {
  position: typeof cameraShots.elevation.position;
  fov: typeof cameraShots.elevation.fov;
} = camera;

type FcuElevationProps = {
  /**
   * "frame": the camera's whole frame, for lining up with a scene view.
   * "tight": cropped to the drawing, for a figure in the page flow.
   */
  fit?: "frame" | "tight";
  className?: string;
};

// Room for the centre line's overrun and the stroke, mm.
const MARGIN = 16;
const tightViewBox = [
  extent.left - MARGIN,
  -extent.top - MARGIN,
  extent.right - extent.left + 2 * MARGIN,
  extent.top - extent.bottom + 2 * MARGIN,
].join(" ");

/**
 * Elevation of the FCU motor, generated from the GLB. With the "frame" fit
 * it fills its box and scales to its height, centred: placed over a scene
 * view at the `elevation` shot (landscape), it lies exactly on the 3D. Strokes are marked
 * for `DrawPath`: centre line first, then outline, then construction lines.
 */
export function FcuElevation({ fit = "frame", className }: FcuElevationProps) {
  const reveal = useId();
  return (
    <svg
      viewBox={fit === "frame" ? viewBox : tightViewBox}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`overflow-visible ${className ?? ""}`}
    >
      {/* Drawing a stroke takes over its dash array, so the dash-dot centre
          line is revealed through a drawn mask instead. */}
      <mask id={reveal} maskUnits="userSpaceOnUse">
        <path
          data-draw="line"
          d={centreLine}
          vectorEffect="non-scaling-stroke"
          stroke="white"
          strokeWidth={4}
        />
      </mask>
      <path
        d={centreLine}
        mask={`url(#${reveal})`}
        vectorEffect="non-scaling-stroke"
        strokeDasharray="24 6 4 6"
        className="text-accent"
      />
      <path
        data-draw="line"
        d={outline}
        vectorEffect="non-scaling-stroke"
        strokeWidth={1.25}
      />
      <path
        data-draw="line"
        d={construction}
        vectorEffect="non-scaling-stroke"
        strokeWidth={0.75}
        className="text-ink-muted"
      />
    </svg>
  );
}
