import Image from "next/image";
import type { PosterShot } from "@/data/types";
import type { EnvironmentId } from "@/design/three-presets";

/**
 * A still of the motor, rendered from the live stage (`LabStage`, high tier),
 * shown when there is no live 3D: no WebGL, Save-Data, a canvas failure, or
 * while the model is still loading.
 */
export function PosterFallback({
  poster,
  env,
  sizes,
  eager,
}: {
  poster: PosterShot;
  env: EnvironmentId;
  sizes: string;
  /** Above the fold: the poster is likely the page's largest paint. */
  eager: boolean;
}) {
  return (
    <figure className="absolute inset-0 m-0">
      <Image
        src={`/posters/fcu-double-shaft-${poster}-${env}.webp`}
        alt=""
        fill
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="object-contain"
      />
      {/* Restates the approved product status (claim product.status). */}
      <figcaption className="absolute bottom-1 left-1 type-caption text-ink-muted">
        Render of prototype assembly
      </figcaption>
    </figure>
  );
}
