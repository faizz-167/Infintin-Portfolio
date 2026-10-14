import { Reveal } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { Grid } from "@/components/ui/Grid";
import { StatusTag } from "@/components/ui/StatusTag";
import { processStages } from "@/data/process";
import { project } from "@/data/project";

/** The project can only be presented under its own approved title. */
export function projectShown(): boolean {
  return claimString(project.title) !== null;
}

/**
 * Sheet 06, the Lab. The development project as a case study that reads as
 * work in progress: objective, challenges, approach, where it stands and
 * what comes next. No results section until results exist (PRD §8.4). The
 * context is left to the Blueprint sheet, which already states it.
 */
export function ProjectSpotlight() {
  const title = claimString(project.title);
  if (title === null) return null;
  const next = processStages.find((stage) => stage.state === "upcoming");

  const blocks = [
    { heading: "Objective", id: project.objective },
    { heading: "Challenges", id: project.challenges },
    { heading: "Approach", id: project.approach },
  ].filter((block) => claimString(block.id) !== null);

  return (
    <ScrollScene
      id="project"
      sheet="Project"
      env="lab"
      className="px-margin py-scene"
    >
      <Grid className="gap-y-6">
        <div className="col-span-full flex flex-col gap-3 lg:col-span-9">
          <p className="type-annotation text-ink-muted">
            Project spotlight · active development
          </p>
          <SplitHeadline className="type-display-l">{title}</SplitHeadline>
        </div>

        {blocks.map((block, index) => (
          <Reveal
            key={block.heading}
            className={`col-span-full flex flex-col gap-1 rule-hairline pt-2 md:col-span-3 lg:col-span-4 ${index === 0 ? "lg:col-start-1" : ""}`}
          >
            <h3 className="type-annotation text-ink-muted">{block.heading}</h3>
            <p className="type-body">
              <ClaimText id={block.id} />
            </p>
          </Reveal>
        ))}

        <Reveal className="col-span-full grid grid-cols-subgrid gap-y-3 rule-object pt-3">
          <div className="col-span-full flex flex-col gap-1 md:col-span-3 lg:col-span-4">
            <h3 className="type-annotation text-ink-muted">Current status</h3>
            <StatusTag>
              <ClaimText id={project.status} />
            </StatusTag>
          </div>
          {next && (
            <div className="col-span-full flex flex-col gap-1 md:col-span-3 lg:col-span-4">
              <h3 className="type-annotation text-ink-muted">Next stage</h3>
              <p className="type-annotation text-ink">{next.name}</p>
            </div>
          )}
          <p className="col-span-full type-caption text-ink-muted lg:col-span-4">
            An active development project, not a completed deployment.
          </p>
        </Reveal>
      </Grid>
    </ScrollScene>
  );
}
