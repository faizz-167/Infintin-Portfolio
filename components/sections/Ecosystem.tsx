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

// Static class names, one per slot, repeating every four events: widths and
// vertical offsets that make the zigzag.
const MOSAIC = [
  {
    item: "lg:col-span-7",
    aspect: "aspect-[3/2]",
    sizes: "(min-width: 1024px) 58vw, 100vw",
  },
  {
    item: "lg:col-span-5 lg:mt-9",
    aspect: "aspect-square",
    sizes: "(min-width: 1024px) 42vw, 100vw",
  },
  {
    item: "lg:col-span-5 lg:-mt-6",
    aspect: "aspect-square",
    sizes: "(min-width: 1024px) 42vw, 100vw",
  },
  {
    item: "lg:col-span-7 lg:mt-5",
    aspect: "aspect-[3/2]",
    sizes: "(min-width: 1024px) 58vw, 100vw",
  },
] as const;

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
        Awards, events and industry support
      </SplitHeadline>
      {shown.length > 0 && (
        <section
          aria-labelledby="events-heading"
          className="flex flex-col gap-4"
        >
          <h3 id="events-heading" className="type-annotation text-accent">
            Events
          </h3>
          {/* An offset mosaic instead of a row of equal cards: photos change
              width and drop in steps down the grid, each with a large copper
              numeral, so the eye zigzags through the events. Below lg they
              stack in order. */}
          <ul className="grid gap-x-gutter gap-y-6 lg:grid-cols-12 lg:gap-y-0">
            {shown.map((event, index) => {
              const layout = MOSAIC[index % MOSAIC.length];
              return (
                <li key={event.id} className={layout.item}>
                  <Reveal className="flex flex-col gap-2">
                    <div className="flex items-end gap-2">
                      <span
                        aria-hidden="true"
                        className="type-display-l leading-none text-accent"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="mb-1 h-px flex-1 bg-accent/50" />
                    </div>
                    <Photo
                      photo={event.photo}
                      label={<ClaimText id={event.name} />}
                      aspect={layout.aspect}
                      sizes={layout.sizes}
                    />
                    <p className="measure type-body text-ink-muted">
                      <ClaimText id={event.caption} />
                    </p>
                  </Reveal>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {entries.length > 0 && (
        <section
          aria-labelledby="register-heading"
          className="flex flex-col gap-3"
        >
          <h3 id="register-heading" className="type-annotation text-accent">
            Awards and support
          </h3>
          {/* Each recognition as a plaque: the year large in copper, the
              programme set as a lede, its kind as an outlined tag. */}
          <ul className="grid gap-gutter md:grid-cols-2">
            {entries.map((entry) => (
              <li key={entry.id}>
                <Reveal className="flex h-full flex-col justify-between gap-4 border border-rule border-t-[length:var(--rule-object)] border-t-accent p-3 lg:p-4">
                  <p className="type-display-l leading-none text-accent">
                    {entry.year ?? <span className="sr-only">No year</span>}
                  </p>
                  <p className="type-lede text-ink">
                    <ClaimText id={entry.title} />
                  </p>
                  <p>
                    <span className="inline-block border border-accent px-1 py-[0.125rem] type-annotation text-accent">
                      {KIND_LABEL[entry.kind]}
                    </span>
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}
    </ScrollScene>
  );
}
