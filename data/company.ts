import type { ClaimId } from "./types";

export const company = {
  // Registered company name (PRD §1); a fact, not a claim.
  name: "Infintin Mobility Solutions",
  shortName: "Infintin",
  positioning: "company.positioning",
  vision: "company.vision",
  manufacturingModel: "company.manufacturing-model",
} as const satisfies Record<string, string | ClaimId>;
