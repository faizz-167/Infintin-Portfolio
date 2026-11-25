import type { TeamMember } from "./types";

// Carried from the current site (PRD §8.5). Founder portraits supplied by
// the client on 18 Nov 2026. Consultants removed at the client's request
// (19 Nov 2026).
export const team = [
  {
    id: "augustine",
    kind: "founder",
    name: "team.augustine.name",
    role: "team.augustine.role",
    focus: "team.augustine.focus",
    photo: "/images/team/augustine.jpg",
    linkedin: "https://www.linkedin.com/in/mg-augustine/",
  },
  {
    id: "infantraj",
    kind: "founder",
    name: "team.infantraj.name",
    role: "team.infantraj.role",
    focus: "team.infantraj.focus",
    photo: "/images/team/infantraj.jpg",
    linkedin: "https://www.linkedin.com/in/ainfantraj/",
  },
  {
    id: "chandrasekhar",
    kind: "founder",
    name: "team.chandrasekhar.name",
    role: "team.chandrasekhar.role",
    photo: "/images/team/chandrasekhar.jpg",
    linkedin: "https://www.linkedin.com/in/chandrasekhar-p-5a9a82227/",
  },
] as const satisfies readonly TeamMember[];
