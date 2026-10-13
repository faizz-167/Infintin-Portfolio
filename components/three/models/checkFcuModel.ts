import type { ObjectMap } from "@react-three/fiber";
import { Mesh } from "three";
import type { GLTF } from "three-stdlib";
import { fcuDoubleShaftParts } from "@/data/parts/fcu-double-shaft";
import type { GLTFResult } from "./generated/FcuDoubleShaft.gen";

const NODE_NAMES = fcuDoubleShaftParts.flatMap((part) => part.nodeNames);

// drei types `nodes` as a loose name → Object3D map. Checking every part
// slug at load time narrows it to the generated `GLTFResult` without a cast,
// and a GLB that drifts from parts data fails here, not as a silent hole.
function isFcuModel(gltf: GLTF & ObjectMap): gltf is GLTFResult & ObjectMap {
  return NODE_NAMES.every((name) => gltf.nodes[name] instanceof Mesh);
}

/** `useGLTF` output, narrowed to the generated type or thrown. */
export function checkFcuModel(gltf: GLTF & ObjectMap): GLTFResult {
  if (!isFcuModel(gltf)) {
    const missing = NODE_NAMES.filter(
      (name) => !(gltf.nodes[name] instanceof Mesh),
    );
    throw new Error(`FCU model is missing part meshes: ${missing.join(", ")}`);
  }
  return gltf;
}
