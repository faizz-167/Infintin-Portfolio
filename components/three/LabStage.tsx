"use client";

import { Environment, Lightformer } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { type ReactNode, useEffect, useMemo, useRef } from "react";
import {
  Color,
  Mesh,
  MeshDepthMaterial,
  type OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  UniformsUtils,
  WebGLRenderTarget,
} from "three";
import { HorizontalBlurShader } from "three/examples/jsm/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/examples/jsm/shaders/VerticalBlurShader.js";
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

// Shadow plane: covers the exploded length (blower wheels slide 160 mm each
// way). Metres, model space.
const SHADOW_WIDTH = 0.45;
const SHADOW_DEPTH = 1.25;
const SHADOW_RESOLUTION = 512;

/**
 * Contact shadow under the motor, baked into a texture once per `bake` value
 * (the model bumps it when an explode settles). It lives inside the model's
 * rotation group so it turns with the model, and mounts with the model so the
 * bake never runs before the geometry exists.
 *
 * drei's ContactShadows technique (depth pass, then horizontal and vertical
 * blur, twice), but owning its GPU resources: drei's version never disposes
 * its two render targets, and rebuilds them whenever an inline `scale` array
 * changes identity, so every re-render and every re-bake leaked ≈2 MB.
 */
export function StageShadow({
  env,
  bake,
}: {
  env: EnvironmentId;
  bake: number;
}) {
  const { opacity, blur, far } = lightingRigs[env].contactShadow;
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const invalidate = useThree((state) => state.invalidate);
  const plane = useRef<Mesh>(null);
  const camera = useRef<OrthographicCamera>(null);
  const pending = useRef(true);

  const kit = useMemo(() => {
    const target = new WebGLRenderTarget(SHADOW_RESOLUTION, SHADOW_RESOLUTION);
    const blurTarget = new WebGLRenderTarget(
      SHADOW_RESOLUTION,
      SHADOW_RESOLUTION,
    );
    target.texture.generateMipmaps = false;
    blurTarget.texture.generateMipmaps = false;
    const geometry = new PlaneGeometry(SHADOW_WIDTH, SHADOW_DEPTH).rotateX(
      Math.PI / 2,
    );
    const depth = new MeshDepthMaterial();
    depth.depthTest = false;
    depth.depthWrite = false;
    // Same colouring as drei: darker towards the contact, alpha falls off
    // with distance from the floor.
    depth.onBeforeCompile = (shader) => {
      shader.uniforms.ucolor = { value: new Color("#000000") };
      shader.fragmentShader = shader.fragmentShader
        .replace("void main() {", "uniform vec3 ucolor;\nvoid main() {")
        .replace(
          "vec4( vec3( 1.0 - fragCoordZ ), opacity );",
          "vec4( ucolor * fragCoordZ * 2.0, ( 1.0 - fragCoordZ ) * 1.0 );",
        );
    };
    const horizontal = new ShaderMaterial({
      ...HorizontalBlurShader,
      uniforms: UniformsUtils.clone(HorizontalBlurShader.uniforms),
      depthTest: false,
    });
    const vertical = new ShaderMaterial({
      ...VerticalBlurShader,
      uniforms: UniformsUtils.clone(VerticalBlurShader.uniforms),
      depthTest: false,
    });
    const blurPlane = new Mesh(geometry);
    return {
      target,
      blurTarget,
      geometry,
      depth,
      horizontal,
      vertical,
      blurPlane,
    };
  }, []);

  useEffect(
    () => () => {
      kit.target.dispose();
      kit.blurTarget.dispose();
      kit.geometry.dispose();
      kit.depth.dispose();
      kit.horizontal.dispose();
      kit.vertical.dispose();
    },
    [kit],
  );

  // `bake` and the rig are triggers: a new value asks for one more bake.
  // biome-ignore lint/correctness/useExhaustiveDependencies: listed only to re-bake when they change
  useEffect(() => {
    pending.current = true;
    invalidate();
  }, [bake, env, blur, far, invalidate]);

  useFrame(() => {
    const cam = camera.current;
    const mesh = plane.current;
    if (!pending.current || !cam || !mesh) return;
    pending.current = false;

    const blurPass = (amount: number) => {
      kit.blurPlane.visible = true;
      kit.blurPlane.material = kit.horizontal;
      kit.horizontal.uniforms.tDiffuse.value = kit.target.texture;
      kit.horizontal.uniforms.h.value = amount / 256;
      gl.setRenderTarget(kit.blurTarget);
      gl.render(kit.blurPlane, cam);
      kit.blurPlane.material = kit.vertical;
      kit.vertical.uniforms.tDiffuse.value = kit.blurTarget.texture;
      kit.vertical.uniforms.v.value = amount / 256;
      gl.setRenderTarget(kit.target);
      gl.render(kit.blurPlane, cam);
      kit.blurPlane.visible = false;
    };

    const background = scene.background;
    const override = scene.overrideMaterial;
    const previousTarget = gl.getRenderTarget();
    mesh.visible = false;
    scene.background = null;
    scene.overrideMaterial = kit.depth;
    gl.setRenderTarget(kit.target);
    gl.render(scene, cam);
    blurPass(blur);
    blurPass(blur * 0.4);
    gl.setRenderTarget(previousTarget);
    mesh.visible = true;
    scene.overrideMaterial = override;
    scene.background = background;
  });

  return (
    <group rotation-x={Math.PI / 2} position={[0, FLOOR_Y, 0]}>
      <mesh
        ref={plane}
        geometry={kit.geometry}
        scale={[1, -1, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <meshBasicMaterial
          transparent
          map={kit.target.texture}
          opacity={opacity}
          depthWrite={false}
        />
      </mesh>
      <orthographicCamera
        ref={camera}
        args={[
          -SHADOW_WIDTH / 2,
          SHADOW_WIDTH / 2,
          SHADOW_DEPTH / 2,
          -SHADOW_DEPTH / 2,
          0,
          far,
        ]}
      />
    </group>
  );
}
