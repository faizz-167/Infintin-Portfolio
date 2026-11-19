import { Reveal } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { Photo } from "@/components/ui/Photo";
import { events } from "@/data/events";
import { recognition } from "@/data/recognition";
import type { CompanyEvent, Recognition, RecognitionKind } from "@/data/types";

const KIND_LABEL: Record<RecognitionKind, string> = {
  award: "Award",
  support: "Support",
  grant: "Grant",
};

function listed(): Recognition[] {
  return recognition.filter((entry) => claimString(entry.title) !== null);
}

/** An event shows only with both its name and what we did there approved. */
function shownEvents(): CompanyEvent[] {
  return events.filter(
    (event) =>
      claimString(event.name) !== null && claimString(event.caption) !== null,
  );
}

export function ecosystemShown(): boolean {
  return listed().length > 0 || shownEvents().length > 0;
}

/**
 * Sheet 08, the Lab. First the events, as photographs: proof of the motor
 * out in public. Then recognition and support as a register: year, what it
 * was and who hosted it, and its kind. Nobody here is called a partner.
 * Logos would appear only with permission; none has been given, so the
 * register is text.
 */
export function Ecosystem() {
  const entries = listed();
  const shown = shownEvents();
  if (entries.length === 0 && shown.length === 0) return null;

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
      {shown.length > 0 && (
        <section
          aria-labelledby="events-heading"
          className="flex flex-col gap-3"
        >
          <h3 id="events-heading" className="type-annotation text-ink-muted">
            Events
          </h3>
          <ul className="grid gap-x-gutter gap-y-5 md:grid-cols-2 lg:grid-cols-4">
            {shown.map((event) => (
              <li key={event.id}>
                <Reveal className="flex flex-col gap-2">
                  <Photo
                    photo={event.photo}
                    label={<ClaimText id={event.name} />}
                    aspect="aspect-[4/3]"
                    sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
                  />
                  <p className="type-body text-ink-muted">
                    <ClaimText id={event.caption} />
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}
      {entries.length > 0 && (
        <section
          aria-labelledby="register-heading"
          className="flex flex-col gap-3"
        >
          <h3 id="register-heading" className="type-annotation text-ink-muted">
            Awards and support
          </h3>
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
        </section>
      )}
    </ScrollScene>
  );
}
