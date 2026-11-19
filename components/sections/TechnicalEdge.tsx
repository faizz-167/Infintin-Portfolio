import type { CSSProperties } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { capabilities } from "@/data/capabilities";
import { approach, comparison } from "@/data/engineering";
import { ApproachFigure } from "./ApproachFigure";

const shown = (id: Parameters<typeof claimString>[0]) =>
  claimString(id) !== null;

/**
 * Sheet 04, "Engineering" (the header's anchor). How the motor is designed,
 * part by part; how that differs from imported supply, in words only; and
 * the capabilities behind it as a typographic list on the grid. Each block
 * appears only with publishable content; the capabilities always have some.
 */
export function TechnicalEdge() {
  const entries = approach
    .filter((item) => shown(item.text))
    .map((item) => ({
      id: item.id,
      title: item.title,
      text: <ClaimText id={item.text} />,
    }));
  const rows = comparison.filter(
    (row) => shown(row.typical) && shown(row.infintin),
  );
  // Manufacturing has to say who does what (PRD §8.3); without approved
  // wording the capability isn't listed at all.
  const listed = capabilities.filter(
    (c) => typeof c.value === "string" || shown(c.value.claim),
  );

  return (
    <ScrollScene
      id="engineering"
      sheet="Engineering"
      env="sheet"
      className="flex flex-col gap-scene px-margin py-scene"
    >
      <div className="flex flex-col gap-6">
        <SplitHeadline className="type-display-l lg:w-2/3">
          Fan coil unit motor engineering, part by part
        </SplitHeadline>
        {entries.length > 0 && <ApproachFigure entries={entries} />}
      </div>

      {rows.length > 0 && (
        <Reveal>
          <h3 className="mb-4 type-display-m">
            Against typical imported supply
          </h3>
          {/* Two cards whose rows run in step. On md+ the grid owns the row
              heights and each card takes them through a subgrid, so a long
              claim on one side stretches the same row on the other. Below
              md the cards simply stack. */}
          <div
            style={{ "--rows": rows.length + 1 } as CSSProperties}
            className="grid gap-gutter md:gap-y-0 md:grid-cols-2 md:grid-rows-[repeat(var(--rows),auto)] md:content-start"
          >
            <ComparisonCard
              title="Typical imported EC motor supply"
              tone="typical"
              rows={rows.map((r) => ({ topic: r.topic, text: r.typical }))}
            />
            <ComparisonCard
              title="Infintin approach"
              tone="infintin"
              rows={rows.map((r) => ({ topic: r.topic, text: r.infintin }))}
            />
          </div>
        </Reveal>
      )}

      <CapabilityCells listed={listed} />
    </ScrollScene>
  );
}

type Claim = Parameters<typeof claimString>[0];

/**
 * One side of the comparison. The Infintin card carries a heavy ink rule on
 * top; the typical card is quieter. Topics repeat on both cards so each
 * reads alone, and the subgrid keeps the rows level across the pair.
 */
function ComparisonCard({
  title,
  tone,
  rows,
}: {
  title: string;
  tone: "typical" | "infintin";
  rows: { topic: string; text: Claim }[];
}) {
  const infintin = tone === "infintin";
  return (
    <section
      aria-label={title}
      className={`grid border border-rule md:row-[span_var(--rows)] md:grid-rows-subgrid ${
        infintin
          ? "border-t-[length:var(--rule-object)] border-t-copper"
          : "bg-paper-deep/40"
      }`}
    >
      <h4
        className={`p-3 type-annotation lg:p-4 ${
          infintin ? "text-copper" : "text-ink-muted"
        }`}
      >
        {title}
      </h4>
      {rows.map((row) => (
        <div
          key={row.topic}
          className="rule-hairline flex flex-col gap-1 p-3 lg:p-4"
        >
          <span className="type-annotation text-ink-muted">{row.topic}</span>
          <p
            className={
              infintin ? "type-lede text-ink" : "type-body text-ink-muted"
            }
          >
            <ClaimText id={row.text} />
          </p>
        </div>
      ))}
    </section>
  );
}

// Static class names (Tailwind can't see computed ones). The heading cell
// takes up whatever the capabilities leave over in the last row, so the
// grid always closes on a full row: 4 columns on desktop, 2 on tablet.
const LG_SPAN = [
  "lg:col-span-1",
  "lg:col-span-2",
  "lg:col-span-3",
  "lg:col-span-4",
];
const MD_SPAN = ["md:col-span-1", "md:col-span-2"];

type Listed = (typeof capabilities)[number];

/**
 * Capabilities as framed cells, edge to edge: the heading is the first cell,
 * each capability a cell with its name as the corner label. The outer frame
 * is drawn by the cells' own right and bottom edges plus the grid's top and
 * left, so shared edges stay one hairline.
 */
function CapabilityCells({ listed }: { listed: readonly Listed[] }) {
  const lgSpan = 1 + ((4 - ((listed.length + 1) % 4)) % 4);
  const mdSpan = 1 + ((2 - ((listed.length + 1) % 2)) % 2);
  return (
    <section
      aria-labelledby="capabilities-heading"
      className="grid border-rule border-t border-l md:grid-cols-2 lg:grid-cols-4"
    >
      {/* The heading cell is inverted (ink ground, paper text) so the grid
          has a clear head. Its own tokens, not a Lab data-env, so its edges
          keep the Sheet's hairline. */}
      <div
        className={`flex flex-col justify-between gap-4 border-rule border-r border-b bg-ink p-3 text-ground lg:p-4 ${
          MD_SPAN[mdSpan - 1]
        } ${LG_SPAN[lgSpan - 1]}`}
      >
        <h3 id="capabilities-heading" className="type-display-m">
          Capabilities
        </h3>
        <p className="measure type-body text-ground/75">
          The motor, its drive and its firmware designed as one system, then
          tested and adapted to your unit.
        </p>
      </div>
      {listed.map((capability) => (
        <div
          key={capability.id}
          className="flex min-h-[14rem] flex-col justify-between gap-4 border-rule border-r border-b p-3 lg:p-4"
        >
          <h4 className="type-annotation text-ink">{capability.name}</h4>
          <p className="type-body text-ink-muted">
            {typeof capability.value === "string" ? (
              capability.value
            ) : (
              <ClaimText id={capability.value.claim} />
            )}
          </p>
        </div>
      ))}
    </section>
  );
}
