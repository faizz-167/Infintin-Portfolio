import type { Project } from "./types";

// PRD §8.4. No results section: none have been supplied, and the project
// must read as active development, not a completed deployment.
export const project = {
  title: "project.title",
  context: "project.context",
  objective: "project.objective",
  challenges: "project.challenges",
  approach: "project.approach",
  status: "product.status",
} as const satisfies Project;
