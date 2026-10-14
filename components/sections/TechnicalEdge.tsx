import { Reveal } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { Grid } from "@/components/ui/Grid";
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
      part: item.part,
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
    // The canvas shows through: the page ground behind it is the Sheet's.
    <ScrollScene
      id="engineering"
      sheet="Engineering"
      env="sheet"
      ground="canvas"
      className="flex flex-col gap-scene px-margin py-scene"
    >
      <div className="flex flex-col gap-6">
        <SplitHeadline className="type-display-l lg:w-2/3">
          Engineered part by part, for one duty
        </SplitHeadline>
        {entries.length > 0 && <ApproachFigure entries={entries} />}
      </div>

      {rows.length > 0 && (
        <Reveal>
          <table className="w-full border-collapse text-left">
            <caption className="mb-3 text-left type-display-m">
              Against typical imported supply
            </caption>
            <thead>
              <tr className="type-annotation text-ink-muted">
                <td className="w-1/4 pb-1" />
                <th scope="col" className="w-3/8 pb-1 font-[inherit]">
                  Typical imported EC motor supply
                </th>
                <th scope="col" className="w-3/8 pb-1 font-[inherit]">
                  Infintin approach
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.topic} className="rule-hairline align-baseline">
                  <th
                    scope="row"
                    className="py-2 pr-gutter type-annotation font-[inherit] text-ink-muted"
                  >
                    {row.topic}
                  </th>
                  <td className="py-2 pr-gutter type-body text-ink-muted">
                    <ClaimText id={row.typical} />
                  </td>
                  <td className="py-2 type-body text-ink">
                    <ClaimText id={row.infintin} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      )}

      <Grid className="gap-y-5">
        <h3 className="col-span-full type-display-m lg:col-span-4">
          Capabilities
        </h3>
        <dl className="col-span-full grid grid-cols-subgrid gap-y-3 md:col-span-6 lg:col-span-8 lg:grid-cols-2">
          {listed.map((capability) => (
            <div
              key={capability.id}
              className="flex flex-col gap-1 rule-hairline pt-2"
            >
              <dt className="type-annotation text-ink">{capability.name}</dt>
              <dd className="type-body text-ink-muted">
                {typeof capability.value === "string" ? (
                  capability.value
                ) : (
                  <ClaimText id={capability.value.claim} />
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Grid>
    </ScrollScene>
  );
}
