"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useRef } from "react";
import { Box3, Matrix4, Quaternion, Vector3 } from "three";
import { fcuDoubleShaftParts } from "@/data/parts/fcu-double-shaft";
import type { PartId, PartSpec } from "@/data/types";
import type { GLTFResult } from "./models/generated/FcuDoubleShaft.gen";
import type { PartRegistry } from "./PartMesh";
import { prefersReducedMotion } from "./reducedMotion";

/** Rest geometry and exploded displacement of one part, in model space. */
export interface PartLayout {
  part: PartSpec;
  bounds: Box3;
  /** Full displacement along the shaft (Z). */
  axial: Vector3;
  /** Full displacement away from the shaft. */
  radial: Vector3;
  /** Balloon anchor at rest. */
  anchor: Vector3;
}

// Parts within this distance of the motor centre (or the axis) count as
// centred, for the default explode direction.
const CENTRED = 0.005;
const DEFAULT_AXIAL = 0.1;
const DEFAULT_ANCHOR = [0.5, 1, 0.5] as const;

/** Bounds and explode vectors for every part, from the loaded nodes. */
export function computePartLayout(
  nodes: GLTFResult["nodes"],
): Map<PartId, PartLayout> {
  const layout = new Map<PartId, PartLayout>();
  const matrix = new Matrix4();
  const quaternion = new Quaternion();

  for (const spec of fcuDoubleShaftParts) {
    // Widened from the literal data type, where optional fields are absent.
    const part: PartSpec = spec;
    const bounds = new Box3();
    for (const name of part.nodeNames) {
      const node = nodes[name];
      node.geometry.computeBoundingBox();
      const box = node.geometry.boundingBox;
      if (!box) continue;
      quaternion.copy(node.quaternion);
      matrix.compose(node.position, quaternion, node.scale);
      bounds.union(box.clone().applyMatrix4(matrix));
    }

    const center = bounds.getCenter(new Vector3());
    const explode: PartSpec["explode"] = part.explode;
    const side = Math.abs(center.z) > CENTRED ? Math.sign(center.z) : 0;
    const axial = new Vector3(0, 0, explode.axial ?? side * DEFAULT_AXIAL);
    const outward = new Vector3(center.x, center.y, 0);
    if (outward.length() < CENTRED) outward.set(0, 1, 0);
    const radial = outward.normalize().multiplyScalar(explode.radial ?? 0);

    const [ax, ay, az] = part.anchor ?? DEFAULT_ANCHOR;
    const anchor = new Vector3(
      bounds.min.x + (bounds.max.x - bounds.min.x) * ax,
      bounds.min.y + (bounds.max.y - bounds.min.y) * ay,
      bounds.min.z + (bounds.max.z - bounds.min.z) * az,
    );

    layout.set(part.id, { part, bounds, axial, radial, anchor });
  }
  return layout;
}

const MAX_ORDER = Math.max(...fcuDoubleShaftParts.map((p) => p.explode.order));
// Each part moves over this share of the whole explode; starts are spread
// across the rest, by order, so the stages overlap rather than queue.
const SPAN = 0.4;
// Within a part's own move, the axial slide finishes before the radial
// lift completes: things come off the shaft, then step out from it.
const AXIAL_END = 0.6;
const RADIAL_START = 0.4;

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/** A part's displacement at explode progress `p` (0 assembled, 1 exploded). */
export function displacementAt(
  layout: PartLayout,
  p: number,
  out: Vector3,
): Vector3 {
  const { order } = layout.part.explode;
  if (order === 0) return out.set(0, 0, 0);
  const start = ((order - 1) / Math.max(1, MAX_ORDER - 1)) * (1 - SPAN);
  const local = (p - start) / SPAN;
  return out
    .copy(layout.axial)
    .multiplyScalar(smoothstep(local / AXIAL_END))
    .addScaledVector(
      layout.radial,
      smoothstep((local - RADIAL_START) / (1 - RADIAL_START)),
    );
}

// Seconds to (approximately) reach the target: critically damped, so an
// interrupted explode reverses from where it is, without a jump.
const SMOOTH_TIME = 0.5;
const MAX_DELTA = 1 / 30;

/**
 * Drives every part group from one explode value, damped towards 0 or 1.
 * Scroll timelines and buttons both only set the target.
 */
export function ExplodedView({
  registry,
  layout,
  exploded,
  onSettle,
}: {
  registry: PartRegistry;
  layout: Map<PartId, PartLayout>;
  exploded: boolean;
  /** Called once the explode has come to rest at a new target. */
  onSettle: (exploded: boolean) => void;
}) {
  const progress = useRef({ value: exploded ? 1 : 0 });
  const settled = useRef(exploded);
  const offset = useRef(new Vector3());
  const invalidate = useThree((s) => s.invalidate);

  // A new target starts the loop; the frame callback keeps it going.
  useEffect(() => {
    if (exploded !== settled.current) invalidate();
  }, [exploded, invalidate]);

  useFrame((state, rawDelta) => {
    const target = exploded ? 1 : 0;
    const p = progress.current;
    let still: boolean;
    if (prefersReducedMotion()) {
      p.value = target;
      still = true;
    } else {
      still = !easing.damp(
        p,
        "value",
        target,
        SMOOTH_TIME,
        Math.min(rawDelta, MAX_DELTA),
      );
    }

    for (const [id, group] of registry) {
      const part = layout.get(id);
      if (part)
        group.position.copy(displacementAt(part, p.value, offset.current));
    }

    if (!still) {
      state.invalidate();
    } else if (settled.current !== exploded) {
      settled.current = exploded;
      onSettle(exploded);
    }
  });

  return null;
}
