import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { Grid } from "@/components/ui/Grid";
import { team } from "@/data/team";
import type { TeamMember } from "@/data/types";

const GROUPS = [
  { kind: "founder", heading: "Founders" },
  { kind: "consultant", heading: "Consultants" },
] as const;

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
 * Sheet 07. The people as an editorial list: names in Archivo, roles in
 * Source Serif. Portraits only where a cleared photo exists, all in the same
 * monochrome treatment.
 */
export function Leadership() {
  const people = listed();
  if (people.length === 0) return null;

  return (
    <ScrollScene
      id="leadership"
      sheet="Leadership"
      env="sheet"
      className="px-margin py-scene"
    >
      <Grid className="gap-y-6">
        <SplitHeadline className="col-span-full type-display-l lg:col-span-8">
          The engineers behind it
        </SplitHeadline>
        {GROUPS.map(({ kind, heading }) => {
          const members = people.filter((m) => m.kind === kind);
          if (members.length === 0) return null;
          return (
            <section
              key={kind}
              aria-label={heading}
              className="col-span-full grid grid-cols-subgrid gap-y-4"
            >
              <h3 className="col-span-full type-annotation text-ink-muted lg:col-span-3">
                {heading}
              </h3>
              <ul className="col-span-full grid grid-cols-subgrid gap-y-4 lg:col-span-9">
                {members.map((member) => (
                  <li
                    key={member.id}
                    className="col-span-full rule-hairline pt-2 md:col-span-3 lg:col-span-3"
                  >
                    <Reveal className="flex gap-3">
                      {member.photo && (
                        <Image
                          src={member.photo}
                          alt=""
                          width={96}
                          height={120}
                          className="h-auto w-8 shrink-0 grayscale"
                        />
                      )}
                      <div className="flex flex-col gap-1">
                        <p className="type-annotation text-[1.0625rem] text-ink">
                          <ClaimText id={member.name} />
                        </p>
                        <p className="type-body text-ink-muted">
                          <ClaimText id={member.role} />
                        </p>
                      </div>
                    </Reveal>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </Grid>
    </ScrollScene>
  );
}
