import { type QualityTier, TIER_ORDER } from "@/design/quality-tiers";

// Chromium-only hints, missing from TypeScript's DOM lib. Optional, because
// Safari and Firefox don't have them.
declare global {
  interface Navigator {
    deviceMemory?: number;
    connection?: { saveData?: boolean };
  }
}

const FLOOR_KEY = "infintin:tier-floor";

// Software rasterisers run the scene at a few frames per second; a still
// image reads better than a slideshow.
const SOFTWARE_RENDERER =
  /swiftshader|llvmpipe|softpipe|software|basic render/i;

// Discrete or Apple-silicon GPUs. Anything else (integrated, masked, unknown)
// starts at `mid` and is stepped down by the frame monitor if it struggles.
const STRONG_GPU = /nvidia|geforce|radeon|apple m\d|apple gpu/i;

/**
 * First tier for this visit, from device hints only. No GPU benchmark
 * database: detect-gpu fetches its tables from a CDN on every visit, and the
 * runtime monitor catches what hints miss.
 */
export function detectTier(): QualityTier {
  return lower(detectFromDevice(), readFloor());
}

/** Remembers a step-down so later pages in the session start there. */
export function rememberTier(tier: QualityTier): void {
  try {
    sessionStorage.setItem(FLOOR_KEY, tier);
  } catch {
    // Storage blocked: the step-down still holds for this page.
  }
}

/** The next tier down, or the same tier at the bottom. */
export function tierBelow(tier: QualityTier): QualityTier {
  return TIER_ORDER[
    Math.min(TIER_ORDER.indexOf(tier) + 1, TIER_ORDER.length - 1)
  ];
}

function detectFromDevice(): QualityTier {
  if (navigator.connection?.saveData) return "poster";

  const renderer = probeRenderer();
  if (renderer === null || SOFTWARE_RENDERER.test(renderer)) return "poster";

  const touchFirst = window.matchMedia("(pointer: coarse)").matches;
  const lowMemory = (navigator.deviceMemory ?? 8) < 4;
  const fewCores = navigator.hardwareConcurrency < 4;
  if (touchFirst || lowMemory || fewCores) return "low";

  return STRONG_GPU.test(renderer) ? "high" : "mid";
}

/** WebGL2 renderer string, or null when WebGL2 is unavailable. */
function probeRenderer(): string | null {
  const gl = document.createElement("canvas").getContext("webgl2");
  if (!gl) return null;
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer: unknown = gl.getParameter(
    info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER,
  );
  // Release the probe context now rather than waiting for GC, so the site
  // never holds two contexts at once.
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return typeof renderer === "string" ? renderer : "";
}

function readFloor(): QualityTier {
  try {
    const stored = sessionStorage.getItem(FLOOR_KEY);
    return TIER_ORDER.find((tier) => tier === stored) ?? "high";
  } catch {
    return "high";
  }
}

function lower(a: QualityTier, b: QualityTier): QualityTier {
  return TIER_ORDER.indexOf(a) > TIER_ORDER.indexOf(b) ? a : b;
}
