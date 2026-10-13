// 3D presets: materials, lighting rigs, camera shots and quality tiers.
// Plain data plus small material factories; the stage, model and camera rig
// (Phase 05) consume them. Units are metres, the shaft runs along Z with the
// origin at the centre of the stator (model-audit.md §1).

import {
  AgXToneMapping,
  Color,
  DoubleSide,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  NotEqualStencilFunc,
  ShaderMaterial,
  type ToneMapping,
} from "three";
import type { MaterialPresetId } from "@/data/types";

// ------------------------------------------------------------------ Colour

// Mirrors the palette in app/globals.css (`--color-*`); keep in step. Three
// treats hex input as sRGB and converts it to linear itself.
const palette = {
  paper: "#fafafa",
  graphite: "#14151a",
  leadLit: "#a2a9b6",
  copper: "#9c4522",
  copperLit: "#d9774a",
} as const;

// ---------------------------------------------------------------- Materials

interface PhysicalPreset {
  color: string;
  metalness: number;
  roughness: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  /** Lamination stack lines, as a procedural normal (no UVs in the model). */
  lamination?: { pitch: number; depth: number };
}

// Real-world PBR values for a lab photograph (design-direction.md §8). No
// anisotropy: three's needs tangents, which need UVs the CAD export lacks.
export const materialPresets = {
  // Bead-blasted cast covers.
  castAluminium: { color: "#c4c6c8", metalness: 1, roughness: 0.45 },
  // Dark varnished laminations, 0.5 mm sheets.
  siliconSteel: {
    color: "#4f5257",
    metalness: 0.85,
    roughness: 0.4,
    lamination: { pitch: 0.0005, depth: 0.18 },
  },
  // Copper under a clear enamel coat.
  enamelCopper: {
    color: "#b8673a",
    metalness: 1,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
  },
  polishedSteel: { color: "#c8cacc", metalness: 1, roughness: 0.12 },
  // Neutral coated finish: says nothing about the magnet's material.
  magnetCoated: {
    color: "#3a3b3d",
    metalness: 0.6,
    roughness: 0.35,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
  },
  // Glass-filled polymer: matte, non-metal.
  polymerBlack: { color: "#1d1e20", metalness: 0, roughness: 0.55 },
  galvanisedSteel: { color: "#a9adb0", metalness: 1, roughness: 0.32 },
} as const satisfies Record<MaterialPresetId, PhysicalPreset>;

/** A new material for a part finish. Callers own and dispose it. */
export function createMaterial(id: MaterialPresetId): MeshPhysicalMaterial {
  const preset: PhysicalPreset = materialPresets[id];
  const { lamination, ...params } = preset;
  const material = new MeshPhysicalMaterial({ ...params, name: id });
  if (lamination) addLamination(material, lamination);
  return material;
}

// Stack lines run around the part at a fixed pitch along its own Z axis. The
// coordinate is object-space Z times the model matrix's Z scale, so it is in
// metres (the GLB is quantised) and does not swim when the part moves in an
// explode. The bump fades out once a line is narrower than about a pixel,
// so distant views show a clean surface instead of moiré.
function addLamination(
  material: MeshPhysicalMaterial,
  { pitch, depth }: { pitch: number; depth: number },
) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uLaminationPitch = { value: pitch };
    shader.uniforms.uLaminationDepth = { value: depth };
    shader.vertexShader = shader.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying float vStackZ;\nvarying vec3 vStackAxis;",
      )
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
vStackZ = position.z * length(modelMatrix[2].xyz);
vStackAxis = normalize((viewMatrix * modelMatrix * vec4(0.0, 0.0, 1.0, 0.0)).xyz);`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        `#include <common>
uniform float uLaminationPitch;
uniform float uLaminationDepth;
varying float vStackZ;
varying vec3 vStackAxis;`,
      )
      .replace(
        "#include <normal_fragment_maps>",
        `#include <normal_fragment_maps>
float stackPhase = vStackZ / uLaminationPitch;
float stackFade = 1.0 - smoothstep(0.25, 0.5, fwidth(stackPhase));
normal = normalize(normal + vStackAxis * uLaminationDepth * stackFade * sin(6.2831853 * stackPhase));`,
      );
  };
  material.customProgramCacheKey = () => "lamination";
}

// ---------------------------------------------------------- Technical modes

export type EnvironmentId = "sheet" | "lab";

/**
 * Drawing mode: flat ground-coloured surfaces with ink edges, so the model
 * reads like the 2D sheets. Edges are drawn by drei `<Edges>` with these
 * settings; polygon offset keeps them from z-fighting with the surface.
 */
export const drawingEdges = {
  sheet: { color: palette.graphite, threshold: 20 },
  lab: { color: palette.paper, threshold: 20 },
} as const satisfies Record<
  EnvironmentId,
  { color: string; threshold: number }
>;

export function createDrawingSurface(env: EnvironmentId): MeshBasicMaterial {
  return new MeshBasicMaterial({
    name: "drawingSurface",
    color: env === "sheet" ? palette.paper : palette.graphite,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
}

/** Copper marks the isolated part in X-ray mode (edges and ghost). */
export const xrayHighlight = {
  sheet: palette.copper,
  lab: palette.copperLit,
} as const satisfies Record<EnvironmentId, string>;

/**
 * X-ray mode: a fresnel ghost, opaque at grazing angles and clear face-on,
 * so internal parts show through the housing. No depth write, so ghosts
 * never hide each other.
 */
export function createXrayGhost(
  env: EnvironmentId,
  color: string = env === "sheet" ? palette.graphite : palette.leadLit,
): ShaderMaterial {
  return new ShaderMaterial({
    name: "xrayGhost",
    transparent: true,
    depthWrite: false,
    side: DoubleSide,
    uniforms: {
      uColor: { value: new Color(color) },
      uPower: { value: 2.5 },
      uOpacity: { value: 0.55 },
    },
    vertexShader: `
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`,
    fragmentShader: `
uniform vec3 uColor;
uniform float uPower;
uniform float uOpacity;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), uPower);
  gl_FragColor = vec4(uColor, rim * uOpacity);
  #include <colorspace_fragment>
}`,
  });
}

/**
 * Section mode cap: drawn on the cutting plane only where the stencil marks
 * the inside of a cut part, filled with 45° hatching in screen space so the
 * line spacing stays constant at any zoom, like a drawing.
 */
export const SECTION_STENCIL_REF = 1;

export function createSectionCap(
  env: EnvironmentId,
  pixelRatio: number,
): ShaderMaterial {
  const ink = env === "sheet" ? palette.graphite : palette.paper;
  const ground = env === "sheet" ? palette.paper : palette.graphite;
  return new ShaderMaterial({
    name: "sectionCap",
    stencilWrite: true,
    stencilRef: SECTION_STENCIL_REF,
    stencilFunc: NotEqualStencilFunc,
    uniforms: {
      uInk: { value: new Color(ink) },
      uGround: { value: new Color(ground) },
      // CSS pixels between hatch lines, and line width.
      uSpacing: { value: 6 },
      uWidth: { value: 1 },
      uPixelRatio: { value: pixelRatio },
    },
    vertexShader: `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,
    fragmentShader: `
uniform vec3 uInk;
uniform vec3 uGround;
uniform float uSpacing;
uniform float uWidth;
uniform float uPixelRatio;
void main() {
  vec2 p = gl_FragCoord.xy / uPixelRatio;
  float d = mod(p.x + p.y, uSpacing * 1.41421356);
  float line = 1.0 - smoothstep(uWidth, uWidth + 1.0, d);
  gl_FragColor = vec4(mix(uGround, uInk, line), 1.0);
  #include <colorspace_fragment>
}`,
  });
}

// ---------------------------------------------------------- Lighting rigs

interface Lightformer {
  form: "rect" | "circle" | "ring";
  intensity: number;
  position: readonly [number, number, number];
  /** Width, height. */
  scale: readonly [number, number];
}

interface LightingRig {
  /** Canvas clear colour, matching the page ground behind the view. */
  ground: string;
  toneMapping: ToneMapping;
  exposure: number;
  /** `scene.environmentIntensity`: how much the studio fills the shadows. */
  environmentIntensity: number;
  /** Uniform fill colour of the environment cube behind the panels. */
  environmentColor: string;
  /** Panels in the environment cube map; each faces the origin. */
  lightformers: readonly Lightformer[];
  contactShadow: { opacity: number; blur: number; far: number };
}

// A product-photography studio: one big softbox upper left, a strip
// overhead, two thin rims behind to cut the silhouette from the ground.
// Neutral white only (design-direction.md §8: no coloured lights).
const studio: readonly Lightformer[] = [
  { form: "rect", intensity: 4, position: [-2.5, 2.5, 2], scale: [5, 3] },
  { form: "rect", intensity: 3, position: [0, 3.5, 0], scale: [6, 1] },
  { form: "rect", intensity: 6, position: [2, 0.5, -3], scale: [0.3, 4] },
  { form: "rect", intensity: 6, position: [-2, 0.5, -3], scale: [0.3, 4] },
];

export const lightingRigs = {
  // Dark ground, full contrast: the "lab photograph".
  lab: {
    ground: palette.graphite,
    toneMapping: AgXToneMapping,
    exposure: 1,
    environmentIntensity: 1,
    environmentColor: "#262626",
    lightformers: studio,
    contactShadow: { opacity: 0.6, blur: 2.5, far: 0.2 },
  },
  // Same studio, lifted fill and softer contrast so metal reads against
  // paper instead of mirroring a black room.
  sheet: {
    ground: palette.paper,
    toneMapping: AgXToneMapping,
    exposure: 1.15,
    environmentIntensity: 1,
    environmentColor: "#6e6e6e",
    lightformers: studio.map((l) => ({ ...l, intensity: l.intensity * 0.7 })),
    contactShadow: { opacity: 0.35, blur: 3, far: 0.2 },
  },
} as const satisfies Record<EnvironmentId, LightingRig>;

// ---------------------------------------------------------- Camera shots

type Vec3 = readonly [number, number, number];

interface Framing {
  position: Vec3;
  target: Vec3;
  /** Vertical field of view, degrees. */
  fov: number;
}

export interface CameraShot extends Framing {
  /** Portrait phones: the assembly is ≈5.7 : 1, so it needs its own framing. */
  mobile?: Framing;
}

export type ShotId = "hero" | "elevation" | "explode" | "section";

/**
 * The CAD export's own camera (orthographic, dropped from the GLB): a
 * three-quarter view from +X/+Z, slightly above. Reference only; `hero` and
 * `elevation` start from it.
 */
export const cadCamera = {
  position: [1.148, 0.23, 0.678],
  quaternion: [-0.0644, 0.4959, 0.0709, 0.8631],
} as const;

// Long lenses throughout: low perspective distortion reads as a technical
// photograph, and keeps the shaft centreline close to straight.
export const cameraShots = {
  hero: {
    position: [0.78, 0.12, 0.62],
    target: [0, -0.01, 0],
    fov: 35,
    mobile: { position: [0.42, 0.14, 0.42], target: [0, -0.01, 0], fov: 45 },
  },
  // Side view along X: near-orthographic for alignment with 2D elevations.
  elevation: {
    position: [2.4, 0, 0],
    target: [0, 0, 0],
    fov: 18,
    mobile: { position: [1.1, 0, 0], target: [0, 0, 0], fov: 18 },
  },
  explode: {
    position: [1.2, 0.45, 1.05],
    target: [0, 0, 0],
    fov: 35,
    mobile: { position: [0.9, 0.5, 1.25], target: [0, 0, 0], fov: 45 },
  },
  // Looking into the cut across X (the whole radial stack at once).
  section: {
    position: [0.55, 0.12, 0.3],
    target: [0, 0, 0],
    fov: 30,
    mobile: { position: [0.42, 0.12, 0.32], target: [0, 0, 0], fov: 40 },
  },
} as const satisfies Record<ShotId, CameraShot>;

/**
 * Isolate shot for one part, from its world bounds: the hero direction,
 * pulled back until the bounding sphere fills `fill` of the frame height.
 */
export function isolateShot(
  bounds: { min: Vec3; max: Vec3 },
  fov = 30,
  fill = 0.6,
): CameraShot {
  const { min, max } = bounds;
  const target: Vec3 = [
    (min[0] + max[0]) / 2,
    (min[1] + max[1]) / 2,
    (min[2] + max[2]) / 2,
  ];
  const radius =
    Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]) / 2;
  const distance = radius / fill / Math.tan(((fov / 2) * Math.PI) / 180);
  const [dx, dy, dz] = cameraShots.hero.position;
  const k = distance / Math.hypot(dx, dy, dz);
  const position: Vec3 = [
    target[0] + dx * k,
    target[1] + dy * k,
    target[2] + dz * k,
  ];
  return { position, target, fov };
}

// ---------------------------------------------------------- Quality tiers

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
