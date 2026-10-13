import type { ReactNode } from "react";

export type Provenance = "target" | "simulated" | "lab result";

export type SpecRow = {
  term: string;
  /** Omit to withhold the value; the row then directs people to engineering. */
  value?: ReactNode;
  provenance?: Provenance;
};

const WITHHELD = "Contact engineering for current technical details";

/** Two-column specification list with hairline rows and provenance notes. */
export function SpecTable({
  rows,
  className,
}: {
  rows: SpecRow[];
  className?: string;
}) {
  return (
    <dl
      className={`grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] ${className ?? ""}`}
    >
      {rows.map((row) => (
        <div
          key={row.term}
          className="col-span-full grid grid-cols-subgrid gap-x-gutter rule-hairline py-1"
        >
          <dt className="wrap-break-word type-annotation text-ink-muted">
            {row.term}
          </dt>
          <dd className="flex flex-wrap items-baseline gap-x-1">
            {row.value === undefined ? (
              <span className="type-caption text-ink-muted">{WITHHELD}</span>
            ) : (
              <>
                <span className="type-data text-ink">{row.value}</span>
                {row.provenance && (
                  <span className="type-caption text-ink-muted">
                    {row.provenance}
                  </span>
                )}
              </>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
