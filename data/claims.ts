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
    status: "approved",
    source: "PRD §9; confirm naming and capitalisation",
  },
  "product.overview": {
    text: "A double-shaft motor for fan coil units, developed with its controller for HVAC duty.",
    status: "approved",
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
    status: "approved",
    source: "PRD §9; confirm supported configurations",
  },
  "product.energy-saving": {
    text: "Up to 60% energy saving",
    status: "pending",
    source:
      "PRD §9. Client answers 2026-11-05: consultant's simulation only; lab study under way, publish after it completes",
  },
  "product.payback": {
    text: "About 3 years payback",
    status: "pending",
    source:
      "Client answers 2026-11-05: Rs 5,500 purchase, 16 h/day, Rs 12/kWh, vs IE3 induction motor, 38% 'measured' saving. Held: source of the 38% while the lab study is still running; publish only with assumptions",
  },
  "product.torque": {
    text: "0.6 Nm",
    status: "pending",
    source:
      "Client answers 2026-11-05. Held: 0.6 Nm at 1200 RPM is ≈75 W, against the approved 50–250 W range",
  },
  "product.voltage": {
    text: "230 V AC, single phase",
    status: "approved",
    source: "Client answers 2026-11-05 (rated voltage and controller input)",
  },
  "product.speed": {
    text: "300 to 1200 RPM",
    status: "approved",
    source: "Client answers 2026-11-05",
  },
  "product.mounting": {
    text: "Foot mount",
    status: "approved",
    source: "Client answers 2026-11-05",
  },
  "product.shaft": {
    text: "Ø12.75 mm, 470 mm long",
    status: "pending",
    source:
      "Client answers 2026-11-05. Held: confirm 470 mm is tip to tip and 12.75 mm is exact",
  },
  "product.noise-level": {
    text: "Below 30 dB",
    status: "pending",
    source:
      "Client answers 2026-11-05. Held: needs dBA, distance and speed of measurement",
  },
  "product.operating-temperature": {
    text: "40 °C",
    status: "pending",
    source: "Client answers 2026-11-05. Held: confirm this is maximum ambient",
  },
  "product.noise": {
    text: "Low-noise operation",
    status: "approved",
    source: "PRD §9; qualitative only, no dBA supplied",
  },
  "product.controller": {
    text: "Controller designed for HVAC",
    status: "approved",
    source: "PRD §9; confirm integration scope",
  },
  "product.rare-earth": {
    text: "Available in heavy-rare-earth-free and fully rare-earth-free versions, to the customer's requirement",
    status: "approved",
    source: "Client answers 2026-11-05; magnet material not stated",
  },
  "product.supply": {
    text: "Locally designed, with short lead times and serviceable construction",
    status: "approved",
    source: "PRD §9; confirm manufacturing and service model",
  },
  "product.dimensions": {
    text: "Ø110 × 78 mm motor body",
    status: "pending",
    source:
      "Client answers 2026-11-05. Held: the CAD motor body measures ≈Ø119 × 131 mm (model-audit.md §2)",
  },
  "product.converter-efficiency": {
    text: "96%+ peak converter efficiency",
    status: "withheld",
    source: "Current site. Client answers 2026-11-05: efficiency curve NA",
  },
  "product.ingress-rating": {
    text: "IP67",
    status: "withheld",
    source: "Current site. Client answers 2026-11-05: IP rating NA",
  },
  "product.retrofit": {
    text: "Retrofits into existing fan coil units",
    status: "approved",
    source: "Current site",
  },
  "product.vfd-compat": {
    text: "Works alongside variable frequency drives",
    status: "approved",
    source: "Current site",
  },
  "product.iot": {
    text: "Telemetry for remote monitoring",
    status: "approved",
    source: "Current site",
  },

  // ------------------------------------------------------------ Product FAQ
  "product.faq.status": {
    text: "The motor is a working prototype under laboratory testing, with field trials due by December 2026. It is not yet in commercial production.",
    status: "approved",
    source: "Drafted from PRD §9 status; field trials from Client answers 2026-11-05. Re-word once trials start",
  },
  "product.faq.fit": {
    text: "It is designed for fan coil units in the 1 to 2 TR range. Share your unit's configuration and we will confirm fit.",
    status: "approved",
    source: "Drafted; depends on product.application",
  },
  "product.faq.customisation": {
    text: "Motor and controller are designed in-house, so shaft, mounting and control interface can be discussed for your application.",
    status: "approved",
    source: "Drafted; confirm customisation scope",
  },
  "product.faq.testing": {
    text: "Testing is under way in the laboratory. Results will be published with their test conditions once they are complete.",
    status: "approved",
    source: "Drafted from PRD §8.4",
  },
  "product.faq.supply": {
    text: "Not yet in volume. Paid proofs of concept for specific requirements and pilots of the prototype are open now. Prototype and production work is carried out with manufacturing partners.",
    status: "approved",
    source: "Drafted; depends on company.manufacturing-model. PoCs and pilots open: Client answers 2026-11-05",
  },
  "product.faq.evaluation": {
    text: "Start with a technical discussion. From there we can scope a paid proof of concept for your requirement, or a pilot of the prototype.",
    status: "approved",
    source: "Drafted from PRD §8.7, §12; PoC and pilot terms from Client answers 2026-11-05",
  },

  // ------------------------------------------------------------ Home
  "home.headline": {
    text: "Motors and controllers, engineered for fan coil units",
    status: "approved",
    source:
      "Placeholder approved 2026-10-14 to unblock Phase 08; client to supply final copy",
  },

  // ------------------------------------------------------------ Company
  "company.positioning": {
    text: "Infintin designs motor and controller solutions for HVAC applications, beginning with fan coil unit motors. Its engineering approach combines application-specific design with locally sourced materials and local manufacturing partners to reduce dependence on imported components and improve supply-chain responsiveness.",
    status: "approved",
    source: "PRD §5; confirm sourcing wording",
  },
  "company.vision": {
    text: "Motor and controller engineering for HVAC, designed and sourced close to the manufacturers who use it.",
    status: "approved",
    source: "Rewritten for HVAC; replaces current-site vision",
  },
  "company.manufacturing-model": {
    text: "Design and engineering are done in-house; prototyping and production are carried out with manufacturing partners.",
    status: "approved",
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
    status: "approved",
    source: "PRD §8.4; 'indigenous' needs approval (see company.indigenous)",
  },
  "project.context": {
    text: "HVAC manufacturers source EC motors and controllers from import markets. Infintin is developing a locally designed alternative.",
    status: "approved",
    source: "PRD §8.4",
  },
  "project.objective": {
    text: "Develop a motor and controller tuned to the requirements of fan coil units.",
    status: "approved",
    source: "PRD §8.4",
  },
  "project.challenges": {
    text: "Reduce permanent-magnet use where applicable, cut core and copper losses, run quietly and improve power factor.",
    status: "approved",
    source: "PRD §8.4",
  },
  "project.approach": {
    text: "Magnet selection, electrical laminations chosen for low core loss, higher copper fill factor, and a controller tuned against testbed data.",
    status: "approved",
    source: "PRD §8.4; magnet wording tied to product.rare-earth",
  },
  // The approach claim above, one statement per part of the motor (09.2).
  "edge.magnet": {
    text: "Magnet material selected to reduce permanent-magnet use where applicable.",
    status: "approved",
    source: "PRD §8.4; wording tied to product.rare-earth",
  },
  "edge.laminations": {
    text: "Electrical laminations chosen for low core loss.",
    status: "approved",
    source: "PRD §8.4",
  },
  "edge.copper-fill": {
    text: "A higher copper fill factor in the windings, to cut copper loss.",
    status: "approved",
    source: "PRD §8.4",
  },
  "edge.controller": {
    text: "A controller tuned against data from the testbed.",
    status: "approved",
    source: "PRD §8.4",
  },

  // Qualitative comparison (09.2). No figures; PRD §11 requires comparable
  // data for any comparison, so every row needs client sign-off.
  "compare.supply-chain.typical": {
    text: "Motors and controllers sourced from import markets",
    status: "approved",
    source: "PRD §8.4 context",
  },
  "compare.supply-chain.infintin": {
    text: "Designed locally, with locally sourced materials and manufacturing partners",
    status: "approved",
    source: "PRD positioning statement",
  },
  "compare.lead-time.typical": {
    text: "Set by overseas production and shipping",
    status: "approved",
    source: "Drafted; client to confirm",
  },
  "compare.lead-time.infintin": {
    text: "Short lead times from local design and production",
    status: "approved",
    source: "PRD §9 supply value; lead-time assumptions to confirm",
  },
  "compare.serviceability.typical": {
    text: "Service and spares through the import channel",
    status: "approved",
    source: "Drafted; client to confirm",
  },
  "compare.serviceability.infintin": {
    text: "Serviceable construction",
    status: "approved",
    source: "PRD §9 supply value; service model to confirm",
  },
  "compare.application.typical": {
    text: "General-purpose designs fitted to the unit",
    status: "approved",
    source: "Drafted; client to confirm",
  },
  "compare.application.infintin": {
    text: "Motor and controller designed for the fan coil unit's duty",
    status: "approved",
    source: "PRD §8.1 'application-specific motor and controller design'",
  },

  "process.ownership": {
    text: "Internal and external stage split",
    status: "approved",
    source: "PRD §9 lists 3D modelling under both internal and external",
  },

  // ------------------------------------------------------------ Market context
  "market.hvac-energy-share": {
    text: "HVAC accounts for around 40% of building energy use.",
    status: "approved",
    source: "Current site; needs a cited public source",
  },
  "market.induction-loss": {
    text: "Conventional induction motors waste a significant share of the power they draw.",
    status: "approved",
    source: "Current site (~30%); needs a cited public source",
  },
  "market.rare-earth-supply": {
    text: "Rare-earth magnet supply is concentrated and subject to export controls.",
    status: "approved",
    source: "Current site (April 2025 export controls); needs a cited source",
  },
  "market.regulation": {
    text: "Efficiency regulation for motors in buildings is tightening.",
    status: "approved",
    source: "Current site; needs a cited public source",
  },

  // ------------------------------------------------------------ Team
  "team.augustine.name": {
    text: "M. Augustine, M.E., Ph.D.",
    status: "approved",
    source: "Current site; re-confirm (PRD §8.5)",
  },
  "team.augustine.role": {
    text: "Founder — motor design: electromagnetic FEA, structural and thermal analysis, prototype testing",
    status: "approved",
    source: "Current site, SRM reference trimmed",
  },
  "team.infantraj.name": {
    text: "A. Infantraj, M.Tech., Ph.D.",
    status: "approved",
    source: "Current site; degree conflicts between text and alt (C3)",
  },
  "team.infantraj.role": {
    text: "Founder — embedded systems: motor control, health monitoring, DSP firmware, inverter hardware",
    status: "approved",
    source: "Current site",
  },
  "team.chandrasekhar.name": {
    text: "P. Chandrasekhar, M.E.",
    status: "approved",
    source: "Current site",
  },
  "team.chandrasekhar.role": {
    text: "Founder — manufacturing and operations",
    status: "approved",
    source: "Current site",
  },
  "team.anbalagan.name": {
    text: "Karthik Anbalagan",
    status: "approved",
    source: "Current site",
  },
  "team.anbalagan.role": {
    text: "Consultant — brand and go-to-market",
    status: "approved",
    source: "Current site",
  },
  "team.senthilkumaran.name": {
    text: "M. Senthilkumaran, Ph.D.",
    status: "approved",
    source: "Current site; M.E. appears in alt text only (C3)",
  },
  "team.senthilkumaran.role": {
    text: "Consultant — controls and feedback",
    status: "approved",
    source: "Current site",
  },
  "team.kennedy.name": {
    text: "Wg. Cdr. E. J. Kennedy (Retd)",
    status: "approved",
    source: "Current site; alt text gives 'Edward Jeyaseelan Kennedy' (C3)",
  },
  "team.kennedy.role": {
    text: "Consultant — production and quality, 23 years in the Indian Air Force",
    status: "approved",
    source: "Current site",
  },

  // ------------------------------------------------------------ Recognition
  "recognition.pitch-x-2026": {
    text: "Winner, Pitch X 2026 — hosted by AIC Anna Incubator and CADFEM",
    status: "approved",
    source: "PRD §8.6; confirm wording and logo permission",
  },
  "recognition.autohackathon-2023": {
    text: "Top 5, Autohackathon 2023 — hosted by AIC Anna Incubator and Ashok Leyland",
    status: "approved",
    source: "PRD §8.6",
  },
  "recognition.edii-tn-ivp": {
    text: "Supported by EDII TN – IVP",
    status: "approved",
    source: "PRD §8.6",
  },
  "recognition.dst-nidhi-ssp": {
    text: "Supported by DST NIDHI SSP through AIC – Anna Incubator",
    status: "approved",
    source: "PRD §8.6",
  },
  "recognition.itel-grant": {
    text: "ITEL Foundation grant",
    status: "approved",
    source: "PRD §8.6",
  },

  // ------------------------------------------------------------ Contact
  "contact.email": {
    text: "admin@infintin.in",
    status: "approved",
    source: "Current site; confirm as public enquiry address",
  },
  "contact.phone": {
    text: "+91 97903 95731",
    status: "approved",
    source: "Current site; 'technical support' label dropped",
  },
  "contact.address": {
    text: "No. 10, Lakshmi Nagar, Guduvanchery 603202, Tamil Nadu, India",
    status: "approved",
    source: "Current site",
  },

  // ------------------------------------------------------------ Parts
  // Names derived from CAD nodes (model-audit.md §3). Engineering confirms
  // naming and that front = drive end; no material claims.
  "parts.end-cover-front": { text: "Front end cover", status: "approved" },
  "parts.end-cover-rear": { text: "Rear end cover", status: "approved" },
  "parts.mid-cover": { text: "Mid cover", status: "approved" },
  "parts.stator": { text: "Stator", status: "approved" },
  "parts.windings": { text: "Windings", status: "approved" },
  "parts.rotor": { text: "Rotor", status: "approved" },
  "parts.rotor-magnet": { text: "Rotor magnet", status: "approved" },
  "parts.shaft": { text: "Shaft", status: "approved" },
  "parts.blower-wheel-front": {
    text: "Front blower wheel",
    status: "approved",
  },
  "parts.blower-wheel-rear": { text: "Rear blower wheel", status: "approved" },
  "parts.retaining-clip-front": {
    text: "Front retaining clip",
    status: "approved",
  },
  "parts.retaining-clip-rear": {
    text: "Rear retaining clip",
    status: "approved",
  },
  "parts.mounting-stand": { text: "Mounting stand", status: "approved" },
} as const satisfies Record<string, Claim>;

const byId = new Map<string, Claim>(Object.entries(claims));

/** Looks a claim up by id. Throws so a bad dynamic id fails the build. */
export function getClaim(id: string): Claim {
  const claim = byId.get(id);
  if (!claim) throw new Error(`Unknown claim id "${id}"`);
  return claim;
}
