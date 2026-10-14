import { FcuElevation } from "@/components/drawings/FcuElevation";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ClaimText } from "@/components/ui/ClaimText";
import { Grid } from "@/components/ui/Grid";

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
      <Grid className="gap-y-6">
        <SplitHeadline className="col-span-full type-display-l lg:col-span-8">
          Why we are building it
        </SplitHeadline>
        <Reveal className="col-span-full flex flex-col gap-2 md:col-span-3 lg:col-span-5 lg:col-start-1">
          <h3 className="type-annotation text-ink-muted">The problem</h3>
          <p className="type-lede">
            <ClaimText id="project.context" />
          </p>
        </Reveal>
        <Reveal className="col-span-full flex flex-col gap-2 md:col-span-3 lg:col-span-5 lg:col-start-7">
          <h3 className="type-annotation text-ink-muted">Our approach</h3>
          <p className="type-body">
            <ClaimText id="company.positioning" />
          </p>
        </Reveal>
      </Grid>
    </ScrollScene>
  );
}
