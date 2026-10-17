"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { Vector3 } from "three";
import type { PartId } from "@/data/types";
import { type CalloutAnchor, publishCallouts } from "@/lib/calloutTrack";
import type { PartLayout } from "./ExplodedView";
import type { PartRegistry } from "./PartMesh";
import type { ViewRuntime } from "./viewRuntime";

// After explode (0) and rotation (0) have moved the parts, before render (1).
const AFTER_PARTS = 0.75;

/**
 * Projects each callout anchor to the view every rendered frame and hands
 * the positions to the page. No occlusion test: callout anchors sit on the
 * camera-facing side of their part by choice of `at`.
 */
export function CalloutTracker({
  viewId,
  runtime,
  layout,
  registry,
  callouts,
}: {
  viewId: string;
  runtime: ViewRuntime;
  layout: Map<PartId, PartLayout>;
  registry: PartRegistry;
  callouts: readonly CalloutAnchor[];
}) {
  const scratch = useMemo(
    () => ({
      point: new Vector3(),
      positions: new Map<PartId, { x: number; y: number }>(),
    }),
    [],
  );

  useEffect(() => () => publishCallouts(viewId, null), [viewId]);

  useFrame(({ camera }) => {
    const element = runtime.element;
    if (!element) return;
    const { width, height } = element.getBoundingClientRect();
    const { point, positions } = scratch;
    positions.clear();
    for (const { part, at } of callouts) {
      const rest = layout.get(part);
      const group = registry.get(part);
      if (!rest || !group) continue;
      const { min, max } = rest.bounds;
      group.updateWorldMatrix(true, false);
      point
        .set(
          min.x + (max.x - min.x) * at[0],
          min.y + (max.y - min.y) * at[1],
          min.z + (max.z - min.z) * at[2],
        )
        .applyMatrix4(group.matrixWorld)
        .project(camera);
      positions.set(part, {
        x: ((point.x + 1) / 2) * width,
        y: ((1 - point.y) / 2) * height,
      });
    }
    publishCallouts(viewId, positions);
  }, AFTER_PARTS);

  return null;
}
