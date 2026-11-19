import type { ClaimId } from "./types";

export interface ApproachItem {
  id: string;
  title: string;
  text: ClaimId;
}

// PRD §8.4 approach, in the order the parts sit from the outside in.
export const approach = [
  {
    id: "laminations",
    title: "Laminations",
    text: "edge.laminations",
  },
  {
    id: "copper-fill",
    title: "Copper fill",
    text: "edge.copper-fill",
  },
  { id: "magnet", title: "Magnets", text: "edge.magnet" },
  {
    id: "controller",
    title: "Controller",
    text: "edge.controller",
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
