import { Reveal } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { Photo } from "@/components/ui/Photo";
import { team } from "@/data/team";
import type { TeamMember } from "@/data/types";

/** A person appears only once their name and role are both approved. */
function listed(): TeamMember[] {
  return team.filter(
    (m) => claimString(m.name) !== null && claimString(m.role) !== null,
  );
}

export function leadershipShown(): boolean {
  return listed().length > 0;
}

/**
 * Sheet 07. The founders as framed cells, edge to edge, in the same
 * vocabulary as Capabilities: each cell is a small title block. A strip with
 * the item number, the portrait across the cell, then the discipline (the
 * one copper line), the name and what the discipline covers. The outer frame
 * comes from the grid's top and left plus each cell's right and bottom, so
 * shared edges stay one hairline.
 */
export function Leadership() {
  const people = listed();
  if (people.length === 0) return null;

  return (
    <ScrollScene
      id="leadership"
      sheet="Leadership"
      env="sheet"
      className="flex flex-col gap-6 px-margin py-scene"
    >
      <div className="grid gap-x-gutter gap-y-3 lg:grid-cols-12 lg:items-end">
        <SplitHeadline className="type-display-l lg:col-span-8">
          Founders and engineering team
        </SplitHeadline>
        <p className="measure type-body text-ink-muted lg:col-span-4">
          The founders between them cover the motor, the electronics that drive
          it and how it is made.
        </p>
      </div>

      <ul className="grid border-rule border-t border-l md:grid-cols-3">
        {people.map((member, index) => (
          <li
            key={member.id}
            className="flex flex-col border-rule border-r border-b"
          >
            <Reveal className="flex h-full flex-col">
              <p className="flex items-baseline justify-between border-rule border-b px-3 py-1">
                <span className="type-data text-ink">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="type-annotation text-ink-muted">Founder</span>
              </p>
              {member.photo && (
                // The name follows, so the portrait adds no words.
                <Photo
                  photo={{ src: member.photo, alt: "" }}
                  framed={false}
                  aspect="aspect-[4/3]"
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="border-rule border-b"
                />
              )}
              <div className="flex flex-col gap-2 p-3 lg:p-4">
                <p className="type-annotation text-accent">
                  <ClaimText id={member.role} />
                </p>
                <h3 className="type-lede text-ink">
                  <ClaimText id={member.name} />
                </h3>
                {member.focus && (
                  <p className="type-body text-ink-muted">
                    <ClaimText id={member.focus} />
                  </p>
                )}
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </ScrollScene>
  );
}
