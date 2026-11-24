import type { CompanyEvent } from "./types";

// Client event list and photos, 18 Nov 2026, in the client's order. PitchX
// is shown once, as the award it was (see recognition.ts), not as an event.
export const events = [
  {
    id: "etm-2026",
    name: "event.etm-2026.name",
    caption: "event.etm-2026.caption",
    photo: {
      src: "/images/events/etm-2026.jpg",
      alt: "Delegates gathered on the exhibition floor at ETM 2026 in Goa.",
    },
  },
  {
    id: "electric-motor-expo-2026",
    name: "event.electric-motor-expo-2026.name",
    caption: "event.electric-motor-expo-2026.caption",
    photo: {
      src: "/images/events/electric-motor-expo-2026.jpg",
      alt: "Visitors looking at the prototype on the table of the Infintin Mobility booth at the Electric Motor Expo 2026.",
      position: "50% 70%",
    },
  },
  {
    id: "rata-conclave-2026",
    name: "event.rata-conclave-2026.name",
    caption: "event.rata-conclave-2026.caption",
    photo: {
      src: "/images/events/rata-conclave-2026.jpg",
      alt: "Three members of the Infintin team in front of the RATA Conclave 2026 backdrop.",
    },
  },
] as const satisfies readonly CompanyEvent[];
