type CentreLineProps = {
  orientation?: "horizontal" | "vertical";
  className?: string;
};

// Drafting convention: long dash, gap, short dash, gap.
const DASH = "24 6 4 6";

/** Dashed long-short centre line marking an axis. Decorative. */
export function CentreLine({
  orientation = "horizontal",
  className,
}: CentreLineProps) {
  const horizontal = orientation === "horizontal";
  return (
    <svg
      aria-hidden="true"
      className={`block overflow-visible text-ink-muted ${horizontal ? "h-px w-full" : "h-full w-px"} ${className ?? ""}`}
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
