import type { Recognition } from "./types";

// PRD §8.6 list and order (conflict C4). Support and recognition only.
export const recognition = [
  {
    id: "pitch-x-2026",
    kind: "award",
    year: 2026,
    title: "recognition.pitch-x-2026",
    host: "recognition.pitch-x-2026.host",
    photo: {
      src: "/images/events/pitchx-2026.jpg",
      alt: "Collage from the PitchX 2026 award presentation hosted by Anna Incubator and CADFEM, with the Infintin team receiving the award.",
    },
    initials: "PX",
    logoPermission: false,
  },
  {
    id: "autohackathon-2023",
    kind: "award",
    year: 2023,
    title: "recognition.autohackathon-2023",
    host: "recognition.autohackathon-2023.host",
    initials: "AH",
    logoPermission: false,
  },
  {
    id: "edii-tn-ivp",
    kind: "support",
    title: "recognition.edii-tn-ivp",
    initials: "ED",
    logoPermission: false,
  },
  {
    id: "dst-nidhi-ssp",
    kind: "support",
    title: "recognition.dst-nidhi-ssp",
    initials: "DN",
    logoPermission: false,
  },
  {
    id: "itel-grant",
    kind: "grant",
    title: "recognition.itel-grant",
    initials: "IT",
    logoPermission: false,
  },
] as const satisfies readonly Recognition[];
