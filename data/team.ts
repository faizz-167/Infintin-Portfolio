import type { TeamMember } from "./types";

// Carried from the current site; every entry pending re-confirmation
// (PRD §8.5). No photos until they are cleared for reuse.
export const team = [
  {
    id: "augustine",
    kind: "founder",
    name: "team.augustine.name",
    role: "team.augustine.role",
  },
  {
    id: "infantraj",
    kind: "founder",
    name: "team.infantraj.name",
    role: "team.infantraj.role",
  },
  {
    id: "chandrasekhar",
    kind: "founder",
    name: "team.chandrasekhar.name",
    role: "team.chandrasekhar.role",
  },
  {
    id: "anbalagan",
    kind: "consultant",
    name: "team.anbalagan.name",
    role: "team.anbalagan.role",
  },
  {
    id: "senthilkumaran",
    kind: "consultant",
    name: "team.senthilkumaran.name",
    role: "team.senthilkumaran.role",
  },
  {
    id: "kennedy",
    kind: "consultant",
    name: "team.kennedy.name",
    role: "team.kennedy.role",
  },
] as const satisfies readonly TeamMember[];
