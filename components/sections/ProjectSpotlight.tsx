import { Reveal } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Arrowhead, CentreLine } from "@/components/ui/CentreLine";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { project } from "@/data/project";

/** The project can only be presented under its own approved title. */
export function projectShown(): boolean {
  return claimString(project.title) !== null;
}

/**
 * Sheet 06, the Lab. The development project as a case study that reads as
 * work in progress: objective, challenges, approach. No results section
 * until results exist (PRD §8.4); "active development" in the label carries
 * the status, and the stages are the Process sheet's. The context is left
 * to the Blueprint sheet, which already states it.
 */
export function ProjectSpotlight() {
  const title = claimString(project.title);
  if (title === null) return null;

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
      className="flex flex-col gap-scene px-margin py-scene"
    >
      <div className="flex flex-col gap-3 lg:w-5/6">
        <p className="type-annotation text-ink-muted">
          Project spotlight · active development
        </p>
        <SplitHeadline className="type-display-l">{title}</SplitHeadline>
      </div>

      {blocks.length > 0 && <ShaftFlow blocks={blocks} />}
    </ScrollScene>
  );
}

type Block = { heading: string; id: (typeof project)[keyof typeof project] };

/**
 * Objective, challenges and approach strung along the shaft: the copper
 * centre line from the hero's elevation runs across the sheet, each block
 * hangs from a centre mark on it by a short leader, and the line ends in an
 * arrowhead, since the project reads forward along the axis like the site.
 * Phones turn the axis vertical, down the left edge.
 */
function ShaftFlow({ blocks }: { blocks: readonly Block[] }) {
  return (
    <div className="relative">
      {/* The axis: horizontal through the marks from lg, vertical on the
          left below it. Marks are 1.5rem (size-3); the row is the arrowhead's
          10 px tall, so it starts 5 px above the marks' centre. */}
      <div className="absolute top-[calc(0.75rem-5px)] right-0 left-0 hidden h-[10px] items-center text-accent lg:flex">
        <CentreLine accent className="flex-1" />
        <Arrowhead />
      </div>
      <div className="absolute top-0 bottom-0 left-[0.75rem] lg:hidden">
        <CentreLine orientation="vertical" accent />
      </div>

      <ol className="relative grid gap-y-6 lg:grid-cols-3 lg:gap-x-gutter">
        {blocks.map((block) => (
          <li key={block.heading}>
            <Reveal className="grid grid-cols-[1.5rem_1fr] gap-x-3 lg:flex lg:flex-col lg:pr-gutter">
              <CentreMark />
              {/* Leader from the mark down to the note (desktop). */}
              <span
                aria-hidden="true"
                className="ml-[calc(0.75rem-0.5px)] hidden h-4 w-px bg-rule lg:block"
              />
              <div className="flex flex-col gap-2 lg:pt-2">
                <h3 className="type-annotation text-ink-muted">
                  {block.heading}
                </h3>
                <p className="measure type-lede">
                  <ClaimText id={block.id} />
                </p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Drafting centre mark: a ring with a dot, sitting on the axis. */
function CentreMark() {
  return (
    <span
      aria-hidden="true"
      className="relative flex size-3 items-center justify-center rounded-full border border-accent bg-ground"
    >
      <span className="size-[5px] rounded-full bg-accent" />
    </span>
  );
}
