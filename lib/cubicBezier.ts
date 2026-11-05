/**
 * A token's `cubic-bezier(x1, y1, x2, y2)` as an easing function: progress
 * in, eased progress out. Replaces GSAP's CustomEase (3.7 KB gz on every route,
 * Phase 11 JS budget), which we only used to turn token curves into eases.
 *
 * x(t) is solved for the curve parameter with Newton's method, falling back
 * to bisection where the slope is too flat for Newton to converge.
 */
export function cubicBezier([x1, y1, x2, y2]: readonly [
  number,
  number,
  number,
  number,
]): (progress: number) => number {
  // Polynomial form of one bezier coordinate with endpoints 0 and 1.
  const coefficients = (p1: number, p2: number) => {
    const c = 3 * p1;
    const b = 3 * (p2 - p1) - c;
    return [1 - c - b, b, c] as const;
  };
  const [ax, bx, cx] = coefficients(x1, x2);
  const [ay, by, cy] = coefficients(y1, y2);
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  const solveT = (x: number) => {
    let t = x;
    for (let i = 0; i < 8; i++) {
      const error = sampleX(t) - x;
      if (Math.abs(error) < 1e-7) return t;
      const slope = slopeX(t);
      if (Math.abs(slope) < 1e-6) break;
      t -= error / slope;
    }
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 40; i++) {
      const value = sampleX(t);
      if (Math.abs(value - x) < 1e-7) break;
      if (value < x) lo = t;
      else hi = t;
      t = (lo + hi) / 2;
    }
    return t;
  };

  return (progress) => {
    if (progress <= 0) return 0;
    if (progress >= 1) return 1;
    return sampleY(solveT(progress));
  };
}
