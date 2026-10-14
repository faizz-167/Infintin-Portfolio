"use client";

import { Bvh, useGLTF } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { type Group, Raycaster, Sphere, Vector2, Vector3 } from "three";
import { initialExplorerState } from "@/components/explorer/explorer-machine";
import { fcuDoubleShaftParts } from "@/data/parts/fcu-double-shaft";
import type { PartId } from "@/data/types";
import {
  type EnvironmentId,
  modelUrlFor,
  qualityTiers,
} from "@/design/three-presets";
import { useSceneStore } from "@/lib/store";
import {
  computePartLayout,
  displacementAt,
  ExplodedView,
} from "../ExplodedView";
import { StageShadow } from "../LabStage";
import { PartMesh, type PartRegistry } from "../PartMesh";
import { SectionPlane } from "../SectionPlane";
import { SpecOverlayTracker } from "../SpecOverlay";
import { useTechnicalMaterials } from "../TechnicalMaterials";
import type { ViewRuntime } from "../viewRuntime";
import { checkFcuModel } from "./checkFcuModel";

const PART_IDS = new Set<string>(fcuDoubleShaftParts.map((p) => p.id));
function isPartId(value: unknown): value is PartId {
  return typeof value === "string" && PART_IDS.has(value);
}

// Same slot as the section plane: after the rotation group, before render.
const AFTER_ROTATION = 0.5;

interface FcuDoubleShaftProps {
  viewId: string;
  env: EnvironmentId;
  runtime: ViewRuntime;
  /** Balloons over the view (the full explorer only). */
  balloons: boolean;
}

/**
 * The FCU motor, one `PartMesh` per entry in parts data, driven by the view's
 * explorer state: explode, isolate, render mode and section. Uses the
 * generated `GLTFResult` type, never the generated component, so part order,
 * finishes and refs come from data while node names stay checked against
 * the GLB.
 */
export function FcuDoubleShaft({
  viewId,
  env,
  runtime,
  balloons,
}: FcuDoubleShaftProps) {
  const tier = useSceneStore((s) => s.tier) ?? "low";
  // Meshopt only; no Draco, so drei never fetches a decoder from its CDN.
  const { nodes } = checkFcuModel(useGLTF(modelUrlFor(tier), false, true));
  const explorer = useSceneStore(
    (s) => s.views[viewId]?.explorer ?? initialExplorerState,
  );
  const hovered = useSceneStore((s) => s.views[viewId]?.hovered ?? null);
  const get = useThree((s) => s.get);
  const invalidate = useThree((s) => s.invalidate);

  const root = useRef<Group>(null);
  const registry = useMemo<PartRegistry>(() => new Map(), []);
  const layout = useMemo(() => computePartLayout(nodes), [nodes]);
  const materials = useTechnicalMaterials(
    env,
    runtime.sectionPlane,
    explorer.section.on,
  );
  // Contact shadow re-bakes once per explode change, after it has settled.
  const [bake, setBake] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: listed only to request a frame when they change
  useEffect(() => {
    invalidate();
  }, [explorer, hovered, invalidate]);

  // Picking for gestures: parts and the section handle. Our own raycaster
  // returns every hit, so hits on the cut-away side of a section are skipped
  // and the part behind them is found.
  const sectionOn = useRef(explorer.section.on);
  sectionOn.current = explorer.section.on;
  useEffect(() => {
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    runtime.pick = (clientX, clientY) => {
      const group = root.current;
      const element = runtime.element;
      if (!group || !element) return null;
      const rect = element.getBoundingClientRect();
      ndc.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(ndc, get().camera);
      for (const hit of raycaster.intersectObject(group, true)) {
        if (hit.object.userData.handle === true) return { kind: "handle" };
        const part: unknown = hit.object.userData.part;
        if (!isPartId(part)) continue;
        if (
          sectionOn.current &&
          runtime.sectionPlane.distanceToPoint(hit.point) < 0
        ) {
          continue;
        }
        return { kind: "part", part };
      }
      return null;
    };
    return () => {
      runtime.pick = null;
    };
  }, [runtime, get]);

  // Where the camera should look for the isolated part: its bounds at the
  // explode state it is heading to, in world space, so the camera settles
  // with the part rather than chasing it.
  const scratch = useMemo(
    () => ({ offset: new Vector3(), sphere: new Sphere() }),
    [],
  );
  useFrame(() => {
    const group = root.current;
    const part = explorer.isolated ? layout.get(explorer.isolated) : undefined;
    if (!group || !part) {
      runtime.focus = null;
      return;
    }
    group.updateWorldMatrix(true, false);
    part.bounds.getBoundingSphere(scratch.sphere);
    displacementAt(part, explorer.exploded ? 1 : 0, scratch.offset);
    const center = (runtime.focus?.center ?? new Vector3())
      .copy(scratch.sphere.center)
      .add(scratch.offset)
      .applyMatrix4(group.matrixWorld);
    runtime.focus = {
      center,
      radius: scratch.sphere.radius * group.matrixWorld.getMaxScaleOnAxis(),
    };
  }, AFTER_ROTATION);

  const clipping = explorer.section.on ? [runtime.sectionPlane] : null;

  return (
    <group ref={root} dispose={null}>
      <Bvh firstHitOnly>
        {fcuDoubleShaftParts.map((part) => (
          <PartMesh
            key={part.id}
            part={part}
            nodes={nodes}
            look={materials.lookFor(part, explorer, hovered)}
            stencil={explorer.section.on ? materials.stencil : null}
            clipping={clipping}
            registry={registry}
          />
        ))}
      </Bvh>
      <ExplodedView
        viewId={viewId}
        registry={registry}
        layout={layout}
        exploded={explorer.exploded}
        onSettle={() => setBake((n) => n + 1)}
      />
      <SectionPlane
        root={root}
        runtime={runtime}
        env={env}
        on={explorer.section.on}
        t={explorer.section.t}
        hatch={qualityTiers[tier].sectionHatch}
      />
      <StageShadow key={bake} env={env} />
      {balloons && (
        <SpecOverlayTracker
          runtime={runtime}
          layout={layout}
          registry={registry}
          isolated={explorer.isolated}
          hovered={hovered}
          sectionOn={explorer.section.on}
        />
      )}
    </group>
  );
}
