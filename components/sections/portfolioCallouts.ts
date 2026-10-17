import type { ClaimId, PartId } from "@/data/types";

export interface PortfolioCallout {
  part: PartId;
  claim: ClaimId;
  /** Anchor on the part, as fractions of its rest bounds; x = 1 faces the
   * camera, so the point is never hidden behind the part itself. */
  at: readonly [number, number, number];
  /** Anchor on the elevation poster, as fractions of the image (no live 3D). */
  poster: readonly [number, number];
  /** The note sits above the motor or below it, clear of its neighbour. */
  side: "above" | "below";
  /** Scroll progress at which the camera has reached the part. */
  reveal: number;
}

// Shaft order, front wheel first: the order the camera meets them and the
// order they are read. Status is not a callout; it belongs to the whole
// assembly and sits with the name.
export const portfolioCallouts = [
  {
    part: "blower-wheel-front",
    claim: "product.application",
    at: [1, 0.7, 0.5],
    poster: [0.323, 0.468],
    side: "above",
    reveal: 0.02,
  },
  {
    part: "mid-cover",
    claim: "product.power-range",
    at: [1, 0.75, 0.5],
    poster: [0.5, 0.465],
    side: "above",
    reveal: 0.24,
  },
  {
    part: "mounting-stand",
    claim: "product.retrofit",
    at: [1, 0.4, 0.5],
    poster: [0.5, 0.58],
    side: "below",
    reveal: 0.32,
  },
] as const satisfies readonly PortfolioCallout[];
