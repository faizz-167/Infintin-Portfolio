"use client";

import {
  ContactShadows,
  Edges,
  Environment,
  Lightformer,
  OrbitControls,
  PerspectiveCamera,
  useGLTF,
} from "@react-three/drei";
import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Box3, type Material, Mesh } from "three";
import { fcuDoubleShaftParts } from "@/data/parts/fcu-double-shaft";
import type { MaterialPresetId, PartId } from "@/data/types";
import {
  type CameraShot,
  cameraShots,
  createDrawingSurface,
  createMaterial,
  createXrayGhost,
  drawingEdges,
  type EnvironmentId,
  isolateShot,
  lightingRigs,
  modelUrls,
  type ShotId,
  xrayHighlight,
} from "@/design/three-presets";

type ModelId = keyof typeof modelUrls;
type Mode = "shaded" | "drawing" | "xray";
type Framing = "desktop" | "mobile";
type Shot = ShotId | `isolate:${PartId}`;

function isPresetShot(shot: Shot): shot is ShotId {
  return shot in cameraShots;
}

// Mesh name → part, from parts data: the only place presets are assigned.
const PART_BY_NODE = new Map<
  string,
  { id: PartId; material: MaterialPresetId }
>(
  fcuDoubleShaftParts.flatMap((part) =>
    part.nodeNames.map((node) => [
      node,
      { id: part.id, material: part.material },
    ]),
  ),
);

interface PartMeshInfo {
  name: string;
  part: PartId | null;
  mesh: Mesh;
}

/** Every mesh in the loaded scene, world matrices resolved. */
function useModelMeshes(model: ModelId): PartMeshInfo[] {
  const { scene } = useGLTF(modelUrls[model]);
  return useMemo(() => {
    scene.updateMatrixWorld(true);
    const meshes: PartMeshInfo[] = [];
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        meshes.push({
          name: object.name,
          part: PART_BY_NODE.get(object.name)?.id ?? null,
          mesh: object,
        });
      }
    });
    return meshes;
  }, [scene]);
}

function materialFor(
  info: PartMeshInfo,
  mode: Mode,
  env: EnvironmentId,
  isolated: PartId | null,
): Material {
  if (mode === "drawing") return createDrawingSurface(env);
  if (mode === "xray") {
    return info.part !== null && info.part === isolated
      ? createXrayGhost(env, xrayHighlight[env])
      : createXrayGhost(env);
  }
  const preset = PART_BY_NODE.get(info.name)?.material;
  // A mesh without a preset fails the check loudly; there is no CAD
  // material to fall back to.
  if (!preset) throw new Error(`No material preset for mesh "${info.name}"`);
  return createMaterial(preset);
}

function Model({
  model,
  mode,
  env,
  isolated,
  onMeshes,
}: {
  model: ModelId;
  mode: Mode;
  env: EnvironmentId;
  isolated: PartId | null;
  onMeshes: (meshes: PartMeshInfo[]) => void;
}) {
  const meshes = useModelMeshes(model);
  useEffect(() => onMeshes(meshes), [meshes, onMeshes]);

  const materials = useMemo(
    () => meshes.map((info) => materialFor(info, mode, env, isolated)),
    [meshes, mode, env, isolated],
  );
  useEffect(
    () => () => {
      for (const m of materials) m.dispose();
    },
    [materials],
  );

  return meshes.map((info, i) => (
    <mesh
      key={info.name}
      name={info.name}
      geometry={info.mesh.geometry}
      material={materials[i]}
      matrix={info.mesh.matrixWorld}
      matrixAutoUpdate={false}
    >
      {mode === "drawing" && <Edges {...drawingEdges[env]} />}
    </mesh>
  ));
}

function Rig({ env }: { env: EnvironmentId }) {
  const rig = lightingRigs[env];
  const { gl, scene, invalidate } = useThree();
  useEffect(() => {
    gl.toneMapping = rig.toneMapping;
    gl.toneMappingExposure = rig.exposure;
    scene.environmentIntensity = rig.environmentIntensity;
    invalidate();
  }, [gl, scene, rig, invalidate]);

  return (
    <>
      <color attach="background" args={[rig.ground]} />
      <Environment key={env} frames={1} resolution={256}>
        <color attach="background" args={[rig.environmentColor]} />
        {rig.lightformers.map((l) => (
          <Lightformer
            key={l.position.join()}
            form={l.form}
            intensity={l.intensity}
            position={[...l.position]}
            scale={[l.scale[0], l.scale[1], 1]}
            target={[0, 0, 0]}
          />
        ))}
      </Environment>
      <ContactShadows
        key={`shadow-${env}`}
        frames={1}
        position={[0, -0.094, 0]}
        scale={[0.4, 1]}
        resolution={512}
        opacity={rig.contactShadow.opacity}
        blur={rig.contactShadow.blur}
        far={rig.contactShadow.far}
      />
    </>
  );
}

function Camera({ shot }: { shot: CameraShot }) {
  const [x, y, z] = shot.position;
  const [tx, ty, tz] = shot.target;
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[x, y, z]}
        fov={shot.fov}
        near={0.01}
        far={20}
      />
      <OrbitControls target={[tx, ty, tz]} makeDefault />
    </>
  );
}

function resolveShot(
  shot: Shot,
  framing: Framing,
  meshes: PartMeshInfo[],
): CameraShot {
  if (isPresetShot(shot)) {
    const preset: CameraShot = cameraShots[shot];
    return framing === "mobile" && preset.mobile ? preset.mobile : preset;
  }
  const part = shot.slice("isolate:".length);
  const box = new Box3();
  for (const info of meshes) {
    if (info.part === part) box.expandByObject(info.mesh);
  }
  if (box.isEmpty()) return cameraShots.hero;
  return isolateShot({ min: box.min.toArray(), max: box.max.toArray() });
}

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className="flex flex-wrap items-center gap-1">
      <legend className="type-annotation text-ink-muted">{label}</legend>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={option === value}
          onClick={() => onChange(option)}
          className={`border border-rule px-1 py-px type-annotation ${
            option === value ? "bg-ink text-ground" : "text-ink"
          }`}
        >
          {option}
        </button>
      ))}
    </fieldset>
  );
}

const SHOTS: readonly Shot[] = [
  "hero",
  "elevation",
  "explode",
  "section",
  ...fcuDoubleShaftParts.map((part) => `isolate:${part.id}` as const),
];

export function ModelCheck() {
  const [model, setModel] = useState<ModelId>("high");
  const [env, setEnv] = useState<EnvironmentId>("lab");
  const [mode, setMode] = useState<Mode>("shaded");
  const [framing, setFraming] = useState<Framing>("desktop");
  const [shot, setShot] = useState<Shot>("hero");
  const [meshes, setMeshes] = useState<PartMeshInfo[]>([]);

  const isolated = shot.startsWith("isolate:")
    ? (fcuDoubleShaftParts.find((p) => `isolate:${p.id}` === shot)?.id ?? null)
    : null;
  const camera = resolveShot(shot, framing, meshes);
  const missing = meshes.filter((m) => m.part === null).map((m) => m.name);
  const unrendered = fcuDoubleShaftParts
    .filter((p) => !meshes.some((m) => m.part === p.id))
    .map((p) => p.id);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        <Segmented
          label="Model"
          value={model}
          options={["high", "lod1"]}
          onChange={setModel}
        />
        <Segmented
          label="Environment"
          value={env}
          options={["lab", "sheet"]}
          onChange={setEnv}
        />
        <Segmented
          label="Mode"
          value={mode}
          options={["shaded", "drawing", "xray"]}
          onChange={setMode}
        />
        <Segmented
          label="Framing"
          value={framing}
          options={["desktop", "mobile"]}
          onChange={setFraming}
        />
      </div>
      <Segmented label="Shot" value={shot} options={SHOTS} onChange={setShot} />

      <div
        className={`border border-rule ${
          framing === "mobile"
            ? "aspect-[9/16] w-[24rem] max-w-full"
            : "aspect-video w-full"
        }`}
      >
        <Canvas
          key={`${shot}-${framing}`}
          frameloop="demand"
          dpr={[1, 2]}
          gl={{ antialias: true }}
          data-testid="model-canvas"
        >
          <Camera shot={camera} />
          <Rig env={env} />
          <Suspense fallback={null}>
            <Model
              model={model}
              mode={mode}
              env={env}
              isolated={isolated}
              onMeshes={setMeshes}
            />
          </Suspense>
        </Canvas>
      </div>

      <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 type-data">
        <dt className="text-ink-muted">Meshes</dt>
        <dd>{meshes.length}</dd>
        <dt className="text-ink-muted">Triangles</dt>
        <dd data-testid="triangles">
          {meshes.reduce(
            (sum, m) =>
              sum +
              (m.mesh.geometry.index?.count ??
                m.mesh.geometry.attributes.position.count) /
                3,
            0,
          )}
        </dd>
        <dt className="text-ink-muted">Without preset</dt>
        <dd data-testid="missing-presets">
          {missing.length ? missing.join(", ") : "none"}
        </dd>
        <dt className="text-ink-muted">Parts not in model</dt>
        <dd data-testid="missing-parts">
          {unrendered.length ? unrendered.join(", ") : "none"}
        </dd>
      </dl>
    </div>
  );
}
