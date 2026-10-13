"use client";

import { useCallback } from "react";
import type { Group, Material } from "three";
import type { PartId, PartSpec } from "@/data/types";
import type { GLTFResult } from "./models/generated/FcuDoubleShaft.gen";

/** Part id → its group in the scene, for explode, isolate and overlays. */
export type PartRegistry = Map<PartId, Group>;

interface PartMeshProps {
  part: PartSpec;
  nodes: GLTFResult["nodes"];
  material: Material;
  registry?: PartRegistry;
}

/**
 * One part as a group of its meshes (windings are three), so a part moves
 * and highlights as a unit. Transforms come from the GLB nodes themselves:
 * the same values gltfjsx extracts, and LOD1 shares them node for node.
 */
export function PartMesh({ part, nodes, material, registry }: PartMeshProps) {
  const register = useCallback(
    (group: Group) => {
      registry?.set(part.id, group);
      return () => {
        registry?.delete(part.id);
      };
    },
    [registry, part.id],
  );

  return (
    <group ref={register} name={part.id}>
      {part.nodeNames.map((name) => {
        const node = nodes[name];
        return (
          <mesh
            key={name}
            name={name}
            geometry={node.geometry}
            material={material}
            position={node.position}
            quaternion={node.quaternion}
            scale={node.scale}
            castShadow
            receiveShadow
          />
        );
      })}
    </group>
  );
}
