"use client";

import { Edges } from "@react-three/drei";
import { useCallback, useState } from "react";
import type { Group, Material, Plane } from "three";
import type { PartId, PartSpec } from "@/data/types";
import type { GLTFResult } from "./models/generated/FcuDoubleShaft.gen";
import type { PartLook } from "./TechnicalMaterials";

/** Part id → its group in the scene, for explode, isolate and overlays. */
export type PartRegistry = Map<PartId, Group>;

interface PartMeshProps {
  part: PartSpec;
  nodes: GLTFResult["nodes"];
  look: PartLook;
  /** Stencil passes for the section cap, while the section is on. */
  stencil: { back: Material; front: Material } | null;
  /** Clipping for drawing-mode edges (their material is drei's own). */
  clipping: Plane[] | null;
  registry?: PartRegistry;
}

// drei's Edges builds its line geometry on mount, which is noticeable on the
// end windings. Built the first time drawing mode shows them, then kept and
// hidden, so later switches cost nothing.
const EDGE_THRESHOLD = 20;

/**
 * One part as a group of its meshes (windings are three), so a part moves
 * and highlights as a unit. Transforms come from the GLB nodes themselves:
 * the same values gltfjsx extracts, and LOD1 shares them node for node.
 */
export function PartMesh({
  part,
  nodes,
  look,
  stencil,
  clipping,
  registry,
}: PartMeshProps) {
  const [edgesBuilt, setEdgesBuilt] = useState(false);
  if (look.edges !== null && !edgesBuilt) setEdgesBuilt(true);

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
          <group
            key={name}
            position={node.position}
            quaternion={node.quaternion}
            scale={node.scale}
          >
            <mesh
              name={name}
              geometry={node.geometry}
              material={look.surface}
              userData={{ part: part.id }}
              castShadow
              receiveShadow
            >
              {edgesBuilt && (
                <Edges
                  threshold={EDGE_THRESHOLD}
                  color={look.edges ?? undefined}
                  visible={look.edges !== null}
                  clippingPlanes={clipping ?? []}
                />
              )}
            </mesh>
            {stencil && (
              <>
                <mesh
                  geometry={node.geometry}
                  material={stencil.back}
                  renderOrder={1}
                  raycast={() => null}
                />
                <mesh
                  geometry={node.geometry}
                  material={stencil.front}
                  renderOrder={1}
                  raycast={() => null}
                />
              </>
            )}
          </group>
        );
      })}
    </group>
  );
}
