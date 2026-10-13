// JS-side design tokens. This file is the source of truth for motion,
// breakpoints and z-index; `app/globals.css` mirrors the values CSS needs and
// must be kept in step with it.

/** Cubic-bézier control points: [x1, y1, x2, y2]. */
type Bezier = readonly [number, number, number, number];

/**
 * Authored choreography (GSAP scroll scenes, line draws). Character: fast
 * acceleration, firm damped stop, never an overshoot.
 */
export const ease = {
  machine: [0.7, 0, 0.2, 1],
  settle: [0.16, 1, 0.3, 1],
  draw: [0.45, 0, 0.15, 1],
} as const satisfies Record<string, Bezier>;

export type EaseName = keyof typeof ease;

/**
 * The return path of a reversible transition uses the mirrored curve, so a
 * thing leaves exactly the way it arrived.
 */
export function mirror([x1, y1, x2, y2]: Bezier): Bezier {
  return [1 - x2, 1 - y2, 1 - x1, 1 - y1];
}

/** Seconds. UI never exceeds `quick`; only scenes use `scene` / `assembly`. */
export const duration = {
  instant: 0.12,
  quick: 0.24,
  base: 0.48,
  scene: 0.9,
  assembly: 1.6,
} as const;

/** CSS `cubic-bezier()` string for a curve. */
export function cssEase(curve: Bezier): string {
  return `cubic-bezier(${curve.join(", ")})`;
}

/**
 * Springs for UI state, defined with Apple's two designer parameters:
 * damping ratio (1 = critically damped, no overshoot) and response (seconds
 * to reach the target, not a duration). Damping is 1 everywhere: the product
 * is a machine and every part seats with a hard, damped stop, including after
 * a flick.
 */
const springResponse = {
  /** Press / release feedback. */
  press: 0.15,
  /** Disclosures, tabs, menu, part selection. */
  ui: 0.3,
  /** Larger repositioning: sheets, panels. */
  move: 0.4,
} as const;

export type SpringName = keyof typeof springResponse;

export type SpringTransition = {
  type: "spring";
  stiffness: number;
  damping: number;
  mass: 1;
};

/**
 * Converts response + damping ratio to the physical stiffness/damping Motion
 * uses (mass 1). Physical values are passed rather than Motion's
 * `bounce`/`duration`, whose defaults would quietly add bounce.
 * `timeScale` slows the spring for frame-by-frame review (0.25 = quarter speed).
 */
export function springFor(name: SpringName, timeScale = 1): SpringTransition {
  const response = springResponse[name] / timeScale;
  const dampingRatio = 1;
  return {
    type: "spring",
    stiffness: ((2 * Math.PI) / response) ** 2,
    damping: (4 * Math.PI * dampingRatio) / response,
    mass: 1,
  };
}

export const spring = {
  press: springFor("press"),
  ui: springFor("ui"),
  move: springFor("move"),
} as const satisfies Record<SpringName, SpringTransition>;

const instant = { duration: 0 } as const;

/**
 * Reduced motion: opacity cross-fades briefly; every transform value (travel,
 * scale, rotation) jumps straight to its end state.
 */
export const crossFade = {
  type: "tween",
  duration: 0.2,
  ease: ease.settle,
  x: instant,
  y: instant,
  scale: instant,
  scaleX: instant,
  scaleY: instant,
  rotate: instant,
} as const;

/** px; mirrored as `--breakpoint-*` in CSS. Used by `gsap.matchMedia()`. */
export const breakpoint = {
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
  "2xl": 1920,
} as const;

/** Stacking order, lowest first; mirrored as `--z-*` in CSS. */
export const zIndex = {
  canvas: 0,
  content: 10,
  annotations: 20,
  header: 30,
  menu: 40,
  toast: 50,
} as const;
