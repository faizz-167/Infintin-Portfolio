import { FcuElevation } from "@/components/drawings/FcuElevation";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ClaimText } from "@/components/ui/ClaimText";

/**
 * Sheet 02. Arrives already on the Sheet: the hero's section sweep has laid
 * the elevation over the 3D, so this scene starts with the text. Under
 * reduced motion there is no sweep, and the drawing sits here instead.
 */
export function Blueprint() {
  return (
    <ScrollScene
      id="blueprint"
      sheet="Blueprint"
      env="sheet"
      className="px-margin pt-6 pb-scene motion-reduce:pt-scene"
    >
      <figure className="mb-8 hidden motion-reduce:block">
        <FcuElevation fit="tight" className="h-auto w-full text-ink" />
        <figcaption className="mt-2 type-caption text-ink-muted">
          Elevation of the prototype assembly
        </figcaption>
      </figure>
      <div className="flex flex-col gap-6">
        <SplitHeadline className="type-display-l lg:w-2/3">
          Why we are building a local fan coil unit motor
        </SplitHeadline>

        {/* Problem and approach as two framed panels read left to right,
            the way the site reads along the shaft: the arrow on the shared
            edge is the move from one to the other. */}
        <Reveal className="relative grid border border-rule md:grid-cols-2">
          <div className="flex flex-col border-rule border-b md:border-r md:border-b-0">
            <div
              aria-hidden="true"
              className="h-2 border-rule border-b hatch-rule"
            />
            <div className="flex flex-1 flex-col gap-4 p-3 lg:p-5">
              <h3 className="type-annotation text-ink-muted">The problem</h3>
              <p className="measure type-lede text-ink-muted">
                <ClaimText id="project.context" />
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <div aria-hidden="true" className="h-2 border-ink border-t-2" />
            <div className="flex flex-1 flex-col gap-4 p-3 lg:p-5">
              <h3 className="type-annotation text-ink">Our approach</h3>
              <p className="measure type-lede">
                <ClaimText id="company.positioning" />
              </p>
            </div>
          </div>

          <span
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 hidden size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center border border-rule bg-ground text-ink md:flex"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="size-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
            >
              <path d="M2 8h12M9 3l5 5-5 5" />
            </svg>
          </span>
        </Reveal>
      </div>
    </ScrollScene>
  );
}
