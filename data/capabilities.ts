import type { Capability } from "./types";

// PRD §8.3, written as value to an HVAC OEM. No tools, algorithms or
// validation procedures are named (IP guardrail).
export const capabilities = [
  {
    id: "motor-design",
    name: "Motor design",
    value:
      "Electromagnetic, structural and thermal design for the duty of a specific HVAC application.",
  },
  {
    id: "motor-control",
    name: "Motor control",
    value:
      "Control tuned to the fan loads and operating points the motor will see.",
  },
  {
    id: "power-electronics",
    name: "Power electronics",
    value:
      "Drive hardware designed alongside the motor rather than sourced separately.",
  },
  {
    id: "embedded-systems",
    name: "Embedded systems",
    value:
      "Firmware for control, protection and the interfaces your unit needs.",
  },
  {
    id: "testing-validation",
    name: "Testing and validation",
    value:
      "Laboratory testing of prototypes, with results reported under stated conditions.",
  },
  {
    id: "custom-engineering",
    name: "Custom engineering",
    value:
      "Mounting, shaft and control interfaces adapted to an OEM's platform.",
  },
  {
    id: "manufacturing",
    name: "Manufacturing coordination",
    value: { claim: "company.manufacturing-model" },
  },
] as const satisfies readonly Capability[];
