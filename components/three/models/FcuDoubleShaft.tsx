"use client";

import { Bvh, useGLTF } from "@react-three/drei";
import type { ThreeElements } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import type { MeshPhysicalMaterial } from "three";
import { fcuDoubleShaftParts } from "@/data/parts/fcu-double-shaft";
import type { MaterialPresetId } from "@/data/types";
import { createMaterial, modelUrlFor } from "@/design/three-presets";
import { useSceneStore } from "@/lib/store";
import { PartMesh, type PartRegistry } from "../PartMesh";
import { checkFcuModel } from "./checkFcuModel";

type FcuDoubleShaftProps = ThreeElements["group"] & {
  registry?: PartRegistry;
};

/**
 * The FCU motor, one `PartMesh` per entry in parts data. Uses the generated
 * `GLTFResult` type, never the generated component, so part order, finishes
 * and refs come from data while node names stay checked against the GLB.
 */
export function FcuDoubleShaft({ registry, ...props }: FcuDoubleShaftProps) {
  const tier = useSceneStore((s) => s.tier) ?? "low";
  // Meshopt only; no Draco, so drei never fetches a decoder from its CDN.
  const { nodes } = checkFcuModel(useGLTF(modelUrlFor(tier), false, true));

  // One material per finish, shared by every part that uses it, created on
  // first use so unused presets never compile.
  const materials = useMemo(
    () => new Map<MaterialPresetId, MeshPhysicalMaterial>(),
    [],
  );
  const materialFor = (id: MaterialPresetId) => {
    let material = materials.get(id);
    if (!material) {
      material = createMaterial(id);
      materials.set(id, material);
    }
    return material;
  };
  useEffect(
    () => () => {
      for (const material of materials.values()) material.dispose();
    },
    [materials],
  );

  return (
    <group {...props} dispose={null}>
      {/* BVH makes part picking cheap enough to raycast on every pointer move. */}
      <Bvh firstHitOnly>
        {fcuDoubleShaftParts.map((part) => (
          <PartMesh
            key={part.id}
            part={part}
            nodes={nodes}
            material={materialFor(part.material)}
            registry={registry}
          />
        ))}
      </Bvh>
    </group>
  );
}
