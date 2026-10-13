// Quality tiers and the model each loads (architecture.md §5.6). No three.js
// imports here: the root layout reads this module on every page.

export type QualityTier = "high" | "mid" | "low" | "poster";

interface TierSpec {
  /** Which GLB to load; `null` renders the poster still instead. */
  model: "high" | "lod1" | null;
  maxDpr: number;
  /** Real-time directional shadow on top of the baked contact shadow. */
  directionalShadow: boolean;
  contactShadow: boolean;
  /** N8AO + SMAA. */
  postprocessing: boolean;
  sectionHatch: boolean;
  /** Ink edges in shaded mode (drawing mode always has them). */
  shadedEdges: boolean;
}

// architecture.md §5.6. Detection lives in Phase 05; a session only ever
// steps down this list, never back up.
export const qualityTiers = {
  high: {
    model: "high",
    maxDpr: 2,
    directionalShadow: true,
    contactShadow: true,
    postprocessing: true,
    sectionHatch: true,
    shadedEdges: true,
  },
  mid: {
    model: "high",
    maxDpr: 1.5,
    directionalShadow: false,
    contactShadow: true,
    postprocessing: false,
    sectionHatch: false,
    shadedEdges: true,
  },
  low: {
    model: "lod1",
    maxDpr: 1,
    directionalShadow: false,
    contactShadow: true,
    postprocessing: false,
    sectionHatch: false,
    shadedEdges: false,
  },
  poster: {
    model: null,
    maxDpr: 1,
    directionalShadow: false,
    contactShadow: false,
    postprocessing: false,
    sectionHatch: false,
    shadedEdges: false,
  },
} as const satisfies Record<QualityTier, TierSpec>;

export const TIER_ORDER = ["high", "mid", "low", "poster"] as const;

export const modelUrls = {
  high: "/models/fcu-double-shaft.glb",
  lod1: "/models/fcu-double-shaft.lod1.glb",
} as const;

/** GLB for a tier. Poster never mounts a canvas; it maps to LOD1 as a floor. */
export function modelUrlFor(tier: QualityTier): string {
  return qualityTiers[tier].model === "high" ? modelUrls.high : modelUrls.lod1;
}
