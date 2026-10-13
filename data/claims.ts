import type { Claim } from "./types";

/**
 * Claims register (content-guardrails.md §2). Every factual statement the
 * site makes lives here with an approval status; pages reference the id.
 *
 * Only `approved` claims render in production. This module is imported by
 * server code only: if it reaches a client component, every draft ships to
 * the browser, which `npm run claims:check` catches after a build.
 */
export const claims = {
  // ------------------------------------------------------------ Product
  "product.name": {
    text: "FCU Double Shaft Motor",
    status: "pending",
    source: "PRD §9; confirm naming and capitalisation",
  },
  "product.overview": {
    text: "A double-shaft motor for fan coil units, developed with its controller for HVAC duty.",
    status: "pending",
    source: "Drafted from PRD §1, §9",
  },
  "product.status": {
    text: "Prototype — under laboratory testing",
    status: "approved",
    source: "PRD §9; re-confirm at launch",
  },
  "product.power-range": {
    text: "50 W to 250 W",
    status: "approved",
    source: "Client confirmed 2026-10-13; supersedes current site's 50–120 W",
  },
  "product.application": {
    text: "Fan coil units, 1 to 2 TR",
    status: "pending",
    source: "PRD §9; confirm supported configurations",
  },
  "product.energy-saving": {
    text: "Up to 60% energy saving",
    status: "withheld",
    source: "PRD §9; needs baseline, method and evidence",
  },
  "product.payback": {
    text: "2 to 3 years payback",
    status: "withheld",
    source: "PRD §9; clarify metric and assumptions",
  },
  "product.noise": {
    text: "Low-noise operation",
    status: "pending",
    source: "PRD §9; qualitative only, no dBA supplied",
  },
  "product.controller": {
    text: "Controller designed for HVAC",
    status: "pending",
    source: "PRD §9; confirm integration scope",
  },
  "product.rare-earth": {
    text: "Rare-earth wording to be confirmed by engineering",
    status: "withheld",
    source:
      "PRD §5; rare-earth-free vs heavy-rare-earth-free; model contains a magnet part",
  },
  "product.supply": {
    text: "Locally designed, with short lead times and serviceable construction",
    status: "pending",
    source: "PRD §9; confirm manufacturing and service model",
  },
  "product.dimensions": {
    text: "≈124 × 156 × 705 mm including blower wheels (CAD envelope)",
    status: "withheld",
    source: "model-audit.md §2; engineering approval required",
  },
  "product.converter-efficiency": {
    text: "96%+ peak converter efficiency",
    status: "withheld",
    source: "Current site; needs test conditions",
  },
  "product.ingress-rating": {
    text: "IP67",
    status: "withheld",
    source: "Current site; needs certification evidence",
  },
  "product.retrofit": {
    text: "Retrofits into existing fan coil units",
    status: "pending",
    source: "Current site",
  },
  "product.vfd-compat": {
    text: "Works alongside variable frequency drives",
    status: "pending",
    source: "Current site",
  },
  "product.iot": {
    text: "Telemetry for remote monitoring",
    status: "pending",
    source: "Current site",
  },

  // ------------------------------------------------------------ Product FAQ
  "product.faq.status": {
    text: "The motor is a working prototype under laboratory testing. It is not yet in commercial production.",
    status: "pending",
    source: "Drafted from PRD §9 status",
  },
  "product.faq.fit": {
    text: "It is designed for fan coil units in the 1 to 2 TR range. Share your unit's configuration and we will confirm fit.",
    status: "pending",
    source: "Drafted; depends on product.application",
  },
  "product.faq.customisation": {
    text: "Motor and controller are designed in-house, so shaft, mounting and control interface can be discussed for your application.",
    status: "pending",
    source: "Drafted; confirm customisation scope",
  },
  "product.faq.testing": {
    text: "Testing is under way in the laboratory. Results will be published with their test conditions once they are complete.",
    status: "pending",
    source: "Drafted from PRD §8.4",
  },
  "product.faq.supply": {
    text: "The motor is not yet available in volume. Prototype and production work is carried out with manufacturing partners.",
    status: "pending",
    source: "Drafted; depends on company.manufacturing-model",
  },
  "product.faq.evaluation": {
    text: "Start with a technical discussion. From there we can scope a sample evaluation or a paid proof of concept or pilot.",
    status: "pending",
    source: "Drafted from PRD §8.7, §12",
  },

  // ------------------------------------------------------------ Company
  "company.positioning": {
    text: "Infintin designs motor and controller solutions for HVAC applications, beginning with fan coil unit motors. Its engineering approach combines application-specific design with locally sourced materials and local manufacturing partners to reduce dependence on imported components and improve supply-chain responsiveness.",
    status: "pending",
    source: "PRD §5; confirm sourcing wording",
  },
  "company.vision": {
    text: "Motor and controller engineering for HVAC, designed and sourced close to the manufacturers who use it.",
    status: "pending",
    source: "Rewritten for HVAC; replaces current-site vision",
  },
  "company.manufacturing-model": {
    text: "Design and engineering are done in-house; prototyping and production are carried out with manufacturing partners.",
    status: "pending",
    source:
      "PRD §9 ownership split; replaces 'end-to-end manufacturing hub' (C6)",
  },
  "company.indigenous": {
    text: "100% indigenously designed in India",
    status: "withheld",
    source:
      "Current site; absolute claim, PRD §5 forbids without substantiation",
  },

  // ------------------------------------------------------------ Project
  "project.title": {
    text: "Development of an Indigenous Motor for Fan Coil Unit Application",
    status: "pending",
    source: "PRD §8.4; 'indigenous' needs approval (see company.indigenous)",
  },
  "project.context": {
    text: "HVAC manufacturers source EC motors and controllers from import markets. Infintin is developing a locally designed alternative.",
    status: "pending",
    source: "PRD §8.4",
  },
  "project.objective": {
    text: "Develop a motor and controller tuned to the requirements of fan coil units.",
    status: "pending",
    source: "PRD §8.4",
  },
  "project.challenges": {
    text: "Reduce permanent-magnet use where applicable, cut core and copper losses, run quietly and improve power factor.",
    status: "pending",
    source: "PRD §8.4",
  },
  "project.approach": {
    text: "Magnet selection, electrical laminations chosen for low core loss, higher copper fill factor, and a controller tuned against testbed data.",
    status: "pending",
    source: "PRD §8.4; magnet wording tied to product.rare-earth",
  },
  "process.ownership": {
    text: "Internal and external stage split",
    status: "pending",
    source: "PRD §9 lists 3D modelling under both internal and external",
  },

  // ------------------------------------------------------------ Market context
  "market.hvac-energy-share": {
    text: "HVAC accounts for around 40% of building energy use.",
    status: "pending",
    source: "Current site; needs a cited public source",
  },
  "market.induction-loss": {
    text: "Conventional induction motors waste a significant share of the power they draw.",
    status: "pending",
    source: "Current site (~30%); needs a cited public source",
  },
  "market.rare-earth-supply": {
    text: "Rare-earth magnet supply is concentrated and subject to export controls.",
    status: "pending",
    source: "Current site (April 2025 export controls); needs a cited source",
  },
  "market.regulation": {
    text: "Efficiency regulation for motors in buildings is tightening.",
    status: "pending",
    source: "Current site; needs a cited public source",
  },

  // ------------------------------------------------------------ Team
  "team.augustine.name": {
    text: "M. Augustine, M.E., Ph.D.",
    status: "pending",
    source: "Current site; re-confirm (PRD §8.5)",
  },
  "team.augustine.role": {
    text: "Founder — motor design: electromagnetic FEA, structural and thermal analysis, prototype testing",
    status: "pending",
    source: "Current site, SRM reference trimmed",
  },
  "team.infantraj.name": {
    text: "A. Infantraj, M.Tech., Ph.D.",
    status: "pending",
    source: "Current site; degree conflicts between text and alt (C3)",
  },
  "team.infantraj.role": {
    text: "Founder — embedded systems: motor control, health monitoring, DSP firmware, inverter hardware",
    status: "pending",
    source: "Current site",
  },
  "team.chandrasekhar.name": {
    text: "P. Chandrasekhar, M.E.",
    status: "pending",
    source: "Current site",
  },
  "team.chandrasekhar.role": {
    text: "Founder — manufacturing and operations",
    status: "pending",
    source: "Current site",
  },
  "team.anbalagan.name": {
    text: "Karthik Anbalagan",
    status: "pending",
    source: "Current site",
  },
  "team.anbalagan.role": {
    text: "Consultant — brand and go-to-market",
    status: "pending",
    source: "Current site",
  },
  "team.senthilkumaran.name": {
    text: "M. Senthilkumaran, Ph.D.",
    status: "pending",
    source: "Current site; M.E. appears in alt text only (C3)",
  },
  "team.senthilkumaran.role": {
    text: "Consultant — controls and feedback",
    status: "pending",
    source: "Current site",
  },
  "team.kennedy.name": {
    text: "Wg. Cdr. E. J. Kennedy (Retd)",
    status: "pending",
    source: "Current site; alt text gives 'Edward Jeyaseelan Kennedy' (C3)",
  },
  "team.kennedy.role": {
    text: "Consultant — production and quality, 23 years in the Indian Air Force",
    status: "pending",
    source: "Current site",
  },

  // ------------------------------------------------------------ Recognition
  "recognition.pitch-x-2026": {
    text: "Winner, Pitch X 2026 — hosted by AIC Anna Incubator and CADFEM",
    status: "pending",
    source: "PRD §8.6; confirm wording and logo permission",
  },
  "recognition.autohackathon-2023": {
    text: "Top 5, Autohackathon 2023 — hosted by AIC Anna Incubator and Ashok Leyland",
    status: "pending",
    source: "PRD §8.6",
  },
  "recognition.edii-tn-ivp": {
    text: "Supported by EDII TN – IVP",
    status: "pending",
    source: "PRD §8.6",
  },
  "recognition.dst-nidhi-ssp": {
    text: "Supported by DST NIDHI SSP through AIC – Anna Incubator",
    status: "pending",
    source: "PRD §8.6",
  },
  "recognition.itel-grant": {
    text: "ITEL Foundation grant",
    status: "pending",
    source: "PRD §8.6",
  },

  // ------------------------------------------------------------ Contact
  "contact.email": {
    text: "admin@infintin.in",
    status: "pending",
    source: "Current site; confirm as public enquiry address",
  },
  "contact.phone": {
    text: "+91 97903 95731",
    status: "pending",
    source: "Current site; 'technical support' label dropped",
  },
  "contact.address": {
    text: "No. 10, Lakshmi Nagar, Guduvanchery 603202, Tamil Nadu, India",
    status: "pending",
    source: "Current site",
  },

  // ------------------------------------------------------------ Parts
  // Names derived from CAD nodes (model-audit.md §3). Engineering confirms
  // naming and that front = drive end; no material claims.
  "parts.end-cover-front": { text: "Front end cover", status: "pending" },
  "parts.end-cover-rear": { text: "Rear end cover", status: "pending" },
  "parts.mid-cover": { text: "Mid cover", status: "pending" },
  "parts.stator": { text: "Stator", status: "pending" },
  "parts.windings": { text: "Windings", status: "pending" },
  "parts.rotor": { text: "Rotor", status: "pending" },
  "parts.rotor-magnet": { text: "Rotor magnet", status: "pending" },
  "parts.shaft": { text: "Shaft", status: "pending" },
  "parts.blower-wheel-front": {
    text: "Front blower wheel",
    status: "pending",
  },
  "parts.blower-wheel-rear": { text: "Rear blower wheel", status: "pending" },
  "parts.retaining-clip-front": {
    text: "Front retaining clip",
    status: "pending",
  },
  "parts.retaining-clip-rear": {
    text: "Rear retaining clip",
    status: "pending",
  },
  "parts.mounting-stand": { text: "Mounting stand", status: "pending" },
} as const satisfies Record<string, Claim>;

const byId = new Map<string, Claim>(Object.entries(claims));

/** Looks a claim up by id. Throws so a bad dynamic id fails the build. */
export function getClaim(id: string): Claim {
  const claim = byId.get(id);
  if (!claim) throw new Error(`Unknown claim id "${id}"`);
  return claim;
}
