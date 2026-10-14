"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { ReactNode } from "react";
import {
  type EnvironmentId,
  lightingRigs,
  qualityTiers,
} from "@/design/three-presets";
import { useSceneStore } from "@/lib/store";

// Bottom of the mounting stand, in model space (model-audit.md §1).
const FLOOR_Y = -0.094;

interface LabStageProps {
  env: EnvironmentId;
  children: ReactNode;
}

/**
 * Background, studio environment and tone mapping for one view. Tone mapping
 * and exposure are renderer state shared by every view, so they are set in a
 * frame callback that R3F runs just before this view's own render (children
 * subscribe before the drei View container that renders them, at the same
 * priority).
 */
export function LabStage({ env, children }: LabStageProps) {
  const rig = lightingRigs[env];
  const directionalShadow = useSceneStore((s) =>
    s.tier ? qualityTiers[s.tier].directionalShadow : false,
  );

  useFrame(({ gl, scene }) => {
    gl.toneMapping = rig.toneMapping;
    gl.toneMappingExposure = rig.exposure;
    scene.environmentIntensity = rig.environmentIntensity;
  });

  return (
    <>
      <color attach="background" args={[rig.ground]} />
      {/* Baked once into a cube map: no HDR download, nothing per frame. */}
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
      {directionalShadow && <KeyShadowLight />}
      {children}
    </>
  );
}

/**
 * High tier only: a weak light from the key softbox's direction that exists
 * to cast real-time self-shadows between parts. The environment still does
 * the lighting; this adds occlusion, not brightness.
 */
function KeyShadowLight() {
  return (
    <directionalLight
      position={[-2.5, 2.5, 2]}
      intensity={0.4}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.0002}
      shadow-normalBias={0.002}
      shadow-camera-left={-0.4}
      shadow-camera-right={0.4}
      shadow-camera-top={0.4}
      shadow-camera-bottom={-0.4}
      shadow-camera-near={1}
      shadow-camera-far={6}
    />
  );
}

/**
 * Contact shadow under the motor, baked in one frame. It lives inside the
 * model's rotation group so it turns with the model, and mounts with the
 * model so the bake never runs before the geometry exists.
 */
export function StageShadow({ env }: { env: EnvironmentId }) {
  const { opacity, blur, far } = lightingRigs[env].contactShadow;
  return (
    <ContactShadows
      key={env}
      frames={1}
      position={[0, FLOOR_Y, 0]}
      // Covers the exploded length (blower wheels slide 160 mm each way).
      scale={[0.45, 1.25]}
      resolution={512}
      opacity={opacity}
      blur={blur}
      far={far}
    />
  );
}
