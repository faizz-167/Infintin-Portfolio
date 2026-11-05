import type { GLTFResult } from "@/components/three/models/generated/FcuDoubleShaft.gen";
import type { claims } from "./claims";

// ---------------------------------------------------------------- Claims

export type ClaimStatus = "approved" | "pending" | "withheld";

/** How a figure was obtained. A target must never read as a measured result. */
export type ClaimQualifier = "target" | "estimate" | "simulated" | "lab-result";

export interface Claim {
  text: string;
  status: ClaimStatus;
  qualifier?: ClaimQualifier;
  /** Where the wording or evidence comes from, for reviewers. Never rendered. */
  source?: string;
}

/** Every claim id in the register. A typo is a type error. */
export type ClaimId = keyof typeof claims;

/** Gated text: rendered only through `ClaimText`, never as a raw string. */
export interface ClaimRef {
  claim: ClaimId;
}

/**
 * A plain string is editorial copy that states no fact about performance,
 * status, people or third parties. Anything factual is a `ClaimRef`.
 */
export type Copy = string | ClaimRef;

// ---------------------------------------------------------------- Links

export interface NavItem {
  label: string;
  href: string;
}

export interface CtaLink {
  label: string;
  href: string;
}

// ---------------------------------------------------------------- Product

export type ProductSlug = "fcu-double-shaft";

/** Stills rendered from the model for the no-WebGL / reduced-data path. */
export type PosterShot = "hero" | "elevation";

export interface SpecRow {
  label: string;
  /**
   * `"withheld"` when no value has been supplied at all; the row then points
   * people to engineering (PRD §8.2). The qualifier lives on the claim, so a
   * figure and its provenance are approved together.
   */
  value: ClaimId | "withheld";
  /** Conditions the figure was measured under, once test data exists. */
  testCondition?: string;
}

export interface FaqItem {
  question: string;
  answer: ClaimId;
}

export interface Product {
  slug: ProductSlug;
  name: ClaimId;
  overview: ClaimId;
  status: ClaimId;
  application: ClaimId;
  specs: readonly SpecRow[];
  features: readonly ClaimId[];
  controller: ClaimId;
  faq: readonly FaqItem[];
  modelRef: ProductSlug;
  posterRefs: readonly PosterShot[];
  /** Path under `public/`, set only once the client approves the file. */
  datasheet?: string;
  /** One way in: pilots and general questions are enquiry types in the form. */
  cta: CtaLink;
}

// ---------------------------------------------------------------- Parts

export type PartId =
  | "end-cover-front"
  | "end-cover-rear"
  | "mid-cover"
  | "stator"
  | "windings"
  | "rotor"
  | "rotor-magnet"
  | "shaft"
  | "blower-wheel-front"
  | "blower-wheel-rear"
  | "retaining-clip-front"
  | "retaining-clip-rear"
  | "mounting-stand";

/**
 * Mesh node names in the optimised GLB, typed from the gltfjsx output, so a
 * part renamed or dropped by the pipeline is a type error in parts data.
 * Windings are three meshes so the end turns can separate in the explode.
 */
export type ModelNodeName = keyof GLTFResult["nodes"];

/** Surface finishes for parts. Phase 04 defines one preset per id. */
export type MaterialPresetId =
  | "castAluminium"
  | "siliconSteel"
  | "enamelCopper"
  | "polishedSteel"
  | "magnetCoated"
  | "polymerBlack"
  | "galvanisedSteel";

export type PartGroup =
  | "housing"
  | "electromagnetic"
  | "rotating"
  | "air-moving"
  | "mounting";

export interface PartSpec {
  id: PartId;
  nodeNames: readonly ModelNodeName[];
  label: ClaimId;
  /** Item number in the parts list. */
  balloon: number;
  material: MaterialPresetId;
  /**
   * Exploded position. `order` sequences the explode (lower leaves first).
   * `axial`: metres along the shaft, signed (+ is the front, +Z); defaults
   * to 0.1 m away from the motor centre on the part's own side, 0 for parts
   * centred on it. `radial`: metres outward from the shaft, in the direction
   * of the part's centroid, or straight up for parts centred on the axis;
   * defaults to 0.
   */
  explode: { order: number; axial?: number; radial?: number };
  /**
   * Where the balloon leader touches the part, as a fraction of its bounding
   * box on each axis (0 = min, 1 = max). Defaults to top centre, [0.5, 1, 0.5].
   */
  anchor?: readonly [number, number, number];
  description?: ClaimId;
  group: PartGroup;
}

// ---------------------------------------------------------------- Company

export interface Capability {
  id: string;
  name: string;
  /** What the capability gives an HVAC OEM. */
  value: Copy;
}

export type StageOwner = "internal" | "external" | "shared" | "unconfirmed";
export type StageState = "complete" | "current" | "upcoming";

export interface ProcessStage {
  id: string;
  name: string;
  owner: StageOwner;
  state: StageState;
}

export interface Project {
  title: ClaimId;
  context: ClaimId;
  objective: ClaimId;
  challenges: ClaimId;
  approach: ClaimId;
  status: ClaimId;
}

export interface TeamMember {
  id: string;
  kind: "founder" | "consultant";
  /** Name with credentials, as displayed. */
  name: ClaimId;
  role: ClaimId;
  /** Path under `public/`, only once a cleared photo exists. */
  photo?: string;
}

/** Support and recognition only. There is deliberately no "partner" kind. */
export type RecognitionKind = "award" | "support" | "grant";

export interface Recognition {
  id: string;
  kind: RecognitionKind;
  year?: number;
  title: ClaimId;
  /** Text placeholder until a logo is supplied with permission to use it. */
  initials: string;
  logoPermission: boolean;
}

export interface ContactChannel {
  kind: "email" | "phone" | "address";
  label: string;
  /** The `mailto:`/`tel:` link is built from the approved text, never stored. */
  value: ClaimId;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface EnquiryType {
  id: string;
  label: string;
}
