import { Reveal } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { recognition } from "@/data/recognition";
import type { Recognition, RecognitionKind } from "@/data/types";

const KIND_LABEL: Record<RecognitionKind, string> = {
  award: "Award",
  support: "Support",
  grant: "Grant",
};

function listed(): Recognition[] {
  return recognition.filter((entry) => claimString(entry.title) !== null);
}

export function ecosystemShown(): boolean {
  return listed().length > 0;
}

/**
 * Sheet 08, the Lab. Recognition and support as a register: year, what it
 * was and who hosted it, and its kind. Nobody here is called a partner.
 * Logos would appear only with permission; none has been given, so the
 * register is text.
 */
export function Ecosystem() {
  const entries = listed();
  if (entries.length === 0) return null;

  return (
    <ScrollScene
      id="recognition"
      sheet="Recognition"
      env="lab"
      className="flex flex-col gap-6 px-margin py-scene"
    >
      <SplitHeadline className="type-display-l lg:w-2/3">
        Recognition and support
      </SplitHeadline>
      <Reveal>
        <table className="w-full border-collapse text-left">
          <thead className="sr-only">
            <tr>
              <th scope="col">Year</th>
              <th scope="col">Programme</th>
              <th scope="col">Kind</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="rule-hairline align-baseline">
                <td className="w-[5rem] py-2 type-data text-ink-muted md:w-[8rem]">
                  {entry.year ?? <span className="sr-only">No year</span>}
                </td>
                <td className="py-2 pr-gutter type-body text-ink">
                  <ClaimText id={entry.title} />
                </td>
                <td className="py-2 text-right type-annotation text-ink-muted">
                  {KIND_LABEL[entry.kind]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </ScrollScene>
  );
}
