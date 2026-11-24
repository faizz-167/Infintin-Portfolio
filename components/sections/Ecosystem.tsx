import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
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
 * Every panel is framed cells edge to edge, the Founders vocabulary: the
 * grid draws the top and left edges, each cell its right and bottom, so
 * shared edges stay one hairline. Nobody here is called a partner, and no
 * third-party logo appears without permission (none has been given).
 */
export function Ecosystem() {
  const entries = listed();
  const awards = entries.filter((entry) => entry.kind === "award");
  const support = entries.filter((entry) => entry.kind !== "award");
  const shown = shownEvents();
  const certs = shownCertificates();
  if (entries.length === 0 && shown.length === 0 && certs.length === 0)
    return null;

  // The first award with a photograph leads the panel beside it.
  const featured = awards.find((award) => award.photo);

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
          {/* The one panel with a 2 px object line on top: the awards are
              the sheet's emphasis. */}
          <div className="grid border-accent border-t-[length:var(--rule-object)] border-l border-l-rule lg:grid-cols-12">
            {featured?.photo && (
              <Reveal className="border-rule border-r border-b lg:col-span-7">
                {/* 5:4 is the collage's own ratio, so nothing is cropped. */}
                <Photo
                  photo={featured.photo}
                  framed={false}
                  aspect="aspect-[5/4]"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
              </Reveal>
            )}
            <ul
              className={`flex flex-col ${featured ? "lg:col-span-5" : "md:flex-row lg:col-span-12"}`}
            >
              {awards.map((award) => (
                <li
                  key={award.id}
                  className="flex flex-1 flex-col border-rule border-r border-b"
                >
                  <Reveal className="flex h-full flex-col">
                    <p className="flex items-baseline justify-between border-rule border-b px-3 py-1">
                      <span className="type-annotation text-accent">
                        {KIND_LABEL[award.kind]}
                      </span>
                      {award.year && (
                        <span className="type-data text-ink">{award.year}</span>
                      )}
                    </p>
                    <div className="flex flex-1 flex-col justify-end gap-2 p-3 lg:p-4">
                      <h4 className="type-display-m text-ink">
                        <ClaimText id={award.title} />
                      </h4>
                      {award.host && (
                        <p className="type-body text-ink-muted">
                          <ClaimText id={award.host} />
                        </p>
                      )}
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
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
          {/* One row of equal cells: the events aren't a sequence, so no
              numerals and no order implied beyond the client's list. 3:2 is
              the middle ground for photos from 2.2:1 to square. */}
          <ul className="grid border-rule border-t border-l md:grid-cols-3">
            {shown.map((event) => (
              <li key={event.id} className="border-rule border-r border-b">
                <Reveal className="flex h-full flex-col">
                  <Photo
                    photo={event.photo}
                    label={<ClaimText id={event.name} />}
                    framed={false}
                    aspect="aspect-[3/2]"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="border-rule border-b"
                  />
                  <p className="p-3 type-body text-ink-muted lg:p-4">
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
