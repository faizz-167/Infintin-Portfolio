type CentreLineProps = {
  orientation?: "horizontal" | "vertical";
  /** Copper instead of the muted ink: an axis that carries the reading. */
  accent?: boolean;
  className?: string;
};

// Drafting convention: long dash, gap, short dash, gap.
const DASH = "24 6 4 6";

/** Dashed long-short centre line marking an axis. Decorative. */
export function CentreLine({
  orientation = "horizontal",
  accent = false,
  className,
}: CentreLineProps) {
  const horizontal = orientation === "horizontal";
  return (
    <svg
      aria-hidden="true"
      className={`block overflow-visible ${accent ? "text-accent" : "text-ink-muted"} ${horizontal ? "h-px w-full" : "h-full w-px"} ${className ?? ""}`}
    >
      <line
        x1="0"
        y1="0"
        x2={horizontal ? "100%" : "0"}
        y2={horizontal ? "0" : "100%"}
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray={DASH}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/** Closed arrowhead that ends a centre line or leader, pointing right. */
export function Arrowhead() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 8 10"
      className="-ml-px h-[10px] w-2 shrink-0"
      fill="currentColor"
    >
      <path d="M0 0l8 5-8 5z" />
    </svg>
  );
}
