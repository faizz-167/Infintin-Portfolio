import Image from "next/image";
import { DrawLine } from "@/components/motion/DrawLine";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Arrowhead, CentreLine } from "@/components/ui/CentreLine";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { Photo } from "@/components/ui/Photo";
import { certificates } from "@/data/certificates";
import { events } from "@/data/events";
import { recognition } from "@/data/recognition";
import type {
  Certificate,
  CompanyEvent,
  Recognition,
  RecognitionKind,
} from "@/data/types";

const KIND_LABEL: Record<RecognitionKind, string> = {
  award: "Award",
  support: "Support",
  grant: "Grant",
};

/** An entry shows once what it was is approved; its host line is optional. */
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

/** A certificate shows only with its title and detail both approved. */
function shownCertificates(): Certificate[] {
  return certificates.filter(
    (cert) =>
      claimString(cert.title) !== null && claimString(cert.detail) !== null,
  );
}

export function ecosystemShown(): boolean {
  return (
    listed().length > 0 ||
    shownEvents().length > 0 ||
    shownCertificates().length > 0
  );
}

/**
 * Sheet 08, the Lab, ordered by weight (Phase 21): awards first, then the
 * events, then programme support and the company's registrations. Each fact
 * shows once: PitchX is the award with its photograph, not also an event.
 *
 * Type size carries the weight. Awards are a record set large: the placing
 * in the hero's expanded display, a copper leader (the drawings' centre line
 * and arrowhead) running from it to the competition. Events are a quieter
 * hairline register with the photo as proof. Support and registrations are
 * framed cells. Nobody here is called a partner, and no third-party logo
 * appears without permission (none has been given).
 */
export function Ecosystem() {
  const entries = listed();
  const awards = entries.filter((entry) => entry.kind === "award");
  const support = entries.filter((entry) => entry.kind !== "award");
  const shown = shownEvents();
  const certs = shownCertificates();
  if (entries.length === 0 && shown.length === 0 && certs.length === 0)
    return null;

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

      {awards.length > 0 && (
        <section
          aria-labelledby="awards-heading"
          className="flex flex-col gap-3"
        >
          <h3 id="awards-heading" className="type-annotation text-accent">
            Awards
          </h3>
          {/* The sheet's emphasis: a 2 px copper object line opens the list. */}
          <ul className="border-accent border-t-[length:var(--rule-object)]">
            {awards.map((award) => (
              <li
                key={award.id}
                className="grid gap-y-3 border-rule border-b py-5 lg:grid-cols-12 lg:gap-x-gutter lg:gap-y-0 lg:py-6"
              >
                {/* One heading, read as "Winner Pitch X 2026". From lg it
                    joins the row's columns (subgrid): placing and leader
                    across seven, the competition in the last five, centred
                    on the leader it receives. */}
                <h4 className="flex flex-col gap-2 lg:col-span-12 lg:grid lg:grid-cols-subgrid lg:items-center">
                  {award.result && (
                    <span className="flex items-center gap-3 lg:col-span-7">
                      <span className="type-display-xl text-ink">
                        <ClaimText id={award.result} />
                      </span>
                      <DrawLine className="hidden min-w-8 flex-1 items-center text-accent lg:flex">
                        <CentreLine accent className="flex-1" />
                        <Arrowhead />
                      </DrawLine>
                    </span>
                  )}
                  <span className="type-display-m text-ink lg:col-span-5">
                    <ClaimText id={award.title} />
                  </span>
                </h4>
                {/* Two columns with one job each: the placing on the left
                    with air under it, everything about the competition (who
                    hosted it, the photo that proves it) on the right. */}
                {(award.host || award.photo) && (
                  <div className="flex flex-col gap-4 lg:col-span-5 lg:col-start-8">
                    {award.host && (
                      <p className="type-body text-ink-muted">
                        <ClaimText id={award.host} />
                      </p>
                    )}
                    {award.photo && (
                      <Photo
                        photo={award.photo}
                        aspect="aspect-[4/3]"
                        sizes="(min-width: 1024px) 40vw, 100vw"
                      />
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {shown.length > 0 && (
        <section
          aria-labelledby="events-heading"
          className="flex flex-col gap-3"
        >
          <h3 id="events-heading" className="type-annotation text-accent">
            Events
          </h3>
          {/* A contact sheet: the photos hang at one height, each at its
              own width, so none is cropped (they run from 2.2:1 to square).
              Each item grows by its photo's ratio from a zero basis, which
              makes the heights come out equal whatever the row width. No
              numerals: the events aren't a sequence. */}
          <ul className="flex flex-col gap-5 md:flex-row md:gap-gutter">
            {shown.map((event) => (
              <li
                key={event.id}
                style={{ flexGrow: event.photo.width / event.photo.height }}
                className="md:basis-0"
              >
                <Reveal className="flex flex-col gap-2">
                  <Image
                    src={event.photo.src}
                    alt={event.photo.alt}
                    width={event.photo.width}
                    height={event.photo.height}
                    sizes="(min-width: 768px) 45vw, 100vw"
                    // Hairline as an inset outline, not a border: a border
                    // adds the same 2 px to photos of different ratios and
                    // their bottoms stop lining up.
                    className="h-auto w-full outline outline-rule -outline-offset-1"
                  />
                  <h4 className="pt-1 type-lede text-ink">
                    <ClaimText id={event.name} />
                  </h4>
                  <p className="measure type-body text-ink-muted">
                    <ClaimText id={event.caption} />
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(support.length > 0 || certs.length > 0) && (
        <section
          aria-labelledby="support-heading"
          className="flex flex-col gap-3"
        >
          <h3 id="support-heading" className="type-annotation text-accent">
            Support and registrations
          </h3>
          <div className="grid border-rule border-t border-l md:grid-cols-2 lg:grid-cols-12">
            {support.length > 0 && (
              <ul
                className={`flex flex-col md:col-span-2 ${certs.length > 0 ? "lg:col-span-4" : "lg:col-span-12"}`}
              >
                {support.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex-1 border-rule border-r border-b"
                  >
                    <Reveal className="flex h-full flex-col gap-1 p-3 lg:p-4">
                      <p className="type-annotation text-accent">
                        {KIND_LABEL[entry.kind]}
                      </p>
                      <p className="type-lede text-ink">
                        <ClaimText id={entry.title} />
                      </p>
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}
            {certs.map((cert) => (
              <Reveal
                key={cert.id}
                className={`flex flex-col border-rule border-r border-b ${support.length > 0 ? "lg:col-span-4" : "lg:col-span-6"}`}
              >
                <p className="border-rule border-b px-3 py-1 type-annotation text-accent">
                  Registration
                </p>
                {/* The document, never cropped: contained on a raised mat of
                    one ratio so both cells line up whatever the scan's
                    shape. Opens full size so the numbers can be checked. */}
                <a
                  href={cert.src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-[3/2] border-rule border-b bg-ground-raised"
                >
                  <Image
                    src={cert.src}
                    alt={cert.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 50vw, 100vw"
                    className="object-contain p-2"
                  />
                  <span className="sr-only">
                    (opens full size in a new tab)
                  </span>
                </a>
                <div className="flex flex-col gap-1 p-3 lg:p-4">
                  <p className="type-lede text-ink">
                    <ClaimText id={cert.title} />
                  </p>
                  <p className="type-body text-ink-muted">
                    <ClaimText id={cert.detail} />
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}
    </ScrollScene>
  );
}
