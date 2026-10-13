import type { ClaimId, ProcessStage } from "./types";

// PRD §9, in order. Stages before laboratory testing are complete because a
// prototype exists to test; nothing after it is marked done.
export const processStages = [
  {
    id: "requirements",
    name: "Requirement definition",
    owner: "internal",
    state: "complete",
  },
  {
    id: "concept",
    name: "Concept development",
    owner: "internal",
    state: "complete",
  },
  { id: "cad", name: "CAD design", owner: "internal", state: "complete" },
  // The PRD lists this stage as both internal and external.
  {
    id: "modelling",
    name: "3D modelling & simulation",
    owner: "unconfirmed",
    state: "complete",
  },
  {
    id: "prototype",
    name: "Prototype development",
    owner: "external",
    state: "complete",
  },
  {
    id: "lab-testing",
    name: "Laboratory testing",
    owner: "internal",
    state: "current",
  },
  {
    id: "optimisation",
    name: "Design optimisation",
    owner: "internal",
    state: "upcoming",
  },
  {
    id: "field-validation",
    name: "Field validation",
    owner: "internal",
    state: "upcoming",
  },
  {
    id: "dfm",
    name: "Design for manufacturing",
    owner: "internal",
    state: "upcoming",
  },
  {
    id: "production-readiness",
    name: "Production readiness",
    owner: "internal",
    state: "upcoming",
  },
  {
    id: "production",
    name: "Commercial production",
    owner: "external",
    state: "upcoming",
  },
] as const satisfies readonly ProcessStage[];

/** Owners are shown only once this claim is approved. */
export const processOwnershipClaim: ClaimId = "process.ownership";
