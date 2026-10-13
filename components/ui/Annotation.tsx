import type { ReactNode } from "react";
import { Balloon } from "./Balloon";

type Point = { x: number; y: number };

type AnnotationProps = {
  /** Screen-space point being annotated, in px relative to the positioned parent. */
  anchor: Point;
  /** Where the label sits relative to the anchor, in px. */
  offset: Point;
  /** Parts-list number; shown as a balloon at the label end of the leader. */
  number?: number;
  children: ReactNode;
};

/**
 * Leader line from a point on the object to a condensed label. Coordinates
 * are screen space so a 3D overlay can feed projected positions directly.
 * The parent must be positioned (`relative`).
 */
export function Annotation({
  anchor,
  offset,
  number,
  children,
}: AnnotationProps) {
  const end = { x: anchor.x + offset.x, y: anchor.y + offset.y };
  const labelOnLeft = offset.x < 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-annotations">
      <svg
        aria-hidden="true"
        className="absolute inset-0 size-full overflow-visible text-ink"
      >
        <circle cx={anchor.x} cy={anchor.y} r="2.5" fill="currentColor" />
        <line
          x1={anchor.x}
          y1={anchor.y}
          x2={end.x}
          y2={end.y}
          stroke="currentColor"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div
        className={`absolute flex items-center gap-1 type-annotation text-ink ${labelOnLeft ? "-translate-x-full flex-row-reverse" : ""} -translate-y-1/2`}
        style={{ left: end.x, top: end.y }}
      >
        {number !== undefined && <Balloon number={number} />}
        <span className="whitespace-nowrap">{children}</span>
      </div>
    </div>
  );
}
