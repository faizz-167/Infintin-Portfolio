import type { ClaimId, PartId } from "./types";

export interface ApproachItem {
  id: string;
  title: string;
  text: ClaimId;
  /** The part the statement is about, isolated beside it. `null` for the
   * controller, which isn't in the model; the assembly stays whole. */
  part: PartId | null;
}

// PRD §8.4 approach, in the order the parts sit from the outside in.
export const approach = [
  {
    id: "laminations",
    title: "Laminations",
    text: "edge.laminations",
    part: "stator",
  },
  {
    id: "copper-fill",
    title: "Copper fill",
    text: "edge.copper-fill",
    part: "windings",
  },
  { id: "magnet", title: "Magnets", text: "edge.magnet", part: "rotor-magnet" },
  {
    id: "controller",
    title: "Controller",
    text: "edge.controller",
    part: null,
  },
] as const satisfies readonly ApproachItem[];

export interface ComparisonRow {
  topic: string;
  typical: ClaimId;
  infintin: ClaimId;
}

/** Qualitative only: no figures until one is approved with its source. */
export const comparison = [
  {
    topic: "Supply chain",
    typical: "compare.supply-chain.typical",
    infintin: "compare.supply-chain.infintin",
  },
  {
    topic: "Lead time",
    typical: "compare.lead-time.typical",
    infintin: "compare.lead-time.infintin",
  },
  {
    topic: "Serviceability",
    typical: "compare.serviceability.typical",
    infintin: "compare.serviceability.infintin",
  },
  {
    topic: "Application-specific design",
    typical: "compare.application.typical",
    infintin: "compare.application.infintin",
  },
] as const satisfies readonly ComparisonRow[];
