import assert from "node:assert/strict";
import { describe, it } from "node:test";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ease, mirror } from "../design/tokens.ts";
import { cubicBezier } from "./cubicBezier.ts";

gsap.registerPlugin(CustomEase);

// The swap must not change any motion: each token curve, and its mirrored
// return, matches what CustomEase produced for the same control points.
describe("cubicBezier", () => {
  const curves = Object.entries(ease).flatMap(
    ([name, points]) =>
      [
        [name, points],
        [`${name}.return`, mirror(points)],
      ] as const,
  );

  for (const [name, points] of curves) {
    it(`matches CustomEase for ${name}`, () => {
      const ours = cubicBezier(points);
      const theirs = CustomEase.create(`test-${name}`, points.join(","));
      for (let i = 0; i <= 200; i++) {
        const t = i / 200;
        assert.ok(
          Math.abs(ours(t) - theirs(t)) < 0.002,
          `${name} at ${t}: ${ours(t)} vs ${theirs(t)}`,
        );
      }
    });
  }

  it("pins the endpoints", () => {
    const f = cubicBezier(ease.machine);
    assert.equal(f(0), 0);
    assert.equal(f(1), 1);
    assert.equal(f(-0.5), 0);
    assert.equal(f(1.5), 1);
  });
  // Timelines ask for eases by name, including dotted ones ("machine.return"),
  // which GSAP could otherwise read as a type suffix on "machine".
  it("resolves registered names, dotted ones included", () => {
    gsap.registerEase("check", cubicBezier(ease.machine));
    gsap.registerEase("check.return", cubicBezier(mirror(ease.machine)));
    const back = cubicBezier(mirror(ease.machine));
    assert.equal(gsap.parseEase("check")(0.3), cubicBezier(ease.machine)(0.3));
    assert.equal(gsap.parseEase("check.return")(0.3), back(0.3));
  });
});
