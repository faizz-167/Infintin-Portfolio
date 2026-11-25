import type { Recognition } from "./types";

// PRD §8.6 list and order (conflict C4). Support and recognition only.
export const recognition = [
  {
    id: "pitch-x-2026",
    kind: "award",
    year: 2026,
    result: "recognition.pitch-x-2026.result",
    title: "recognition.pitch-x-2026",
    host: "recognition.pitch-x-2026.host",
    photo: {
      src: "/images/events/pitchx-2026-award.jpg",
      alt: "On stage at PitchX 2026: the award cheque made out to Infintin Mobility Solutions is handed over.",
    },
    initials: "PX",
    logoPermission: false,
  },
  {
    id: "autohackathon-2023",
    kind: "award",
    year: 2023,
    result: "recognition.autohackathon-2023.result",
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
