type BalloonProps = {
  /** Parts-list item number this balloon refers to. */
  number: number;
  className?: string;
};

/**
 * Numbered circle referencing a parts-list item. Drawn in SVG: the circle is
 * a drafting mark, not a rounded UI surface.
 */
export function Balloon({ number, className }: BalloonProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label={`Item ${number}`}
      className={`size-4 shrink-0 overflow-visible text-ink ${className ?? ""}`}
    >
      <circle
        cx="16"
        cy="16"
        r="15"
        fill="var(--ground)"
        stroke="currentColor"
        strokeWidth="1"
        vectorEffect="non-scaling-stroke"
      />
      <text
        x="16"
        y="16"
        textAnchor="middle"
        dominantBaseline="central"
        fill="currentColor"
        className="type-data"
        style={{ fontSize: "14px" }}
      >
        {number}
      </text>
    </svg>
  );
}
