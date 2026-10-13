"use client";

import { View } from "@react-three/drei";
import { invalidate, useFrame } from "@react-three/fiber";
import { type RefObject, Suspense, useEffect, useRef } from "react";
import type { EnvironmentId } from "@/design/three-presets";
import { useSceneStore } from "@/lib/store";
import { CameraRig } from "./CameraRig";
import { RotateGroup, useDragRotate } from "./DragRotate";
import { LabStage, StageShadow } from "./LabStage";
import { FcuDoubleShaft } from "./models/FcuDoubleShaft";

interface SceneContentProps {
  id: string;
  env: EnvironmentId;
  /** The placeholder the view tracks and the gestures listen on. */
  element: RefObject<HTMLDivElement | null>;
  rotate: boolean;
  zoom: boolean;
}

/**
 * Everything three.js about one scene view. Loaded lazily by `SceneView`, so
 * pages carry none of three.js, R3F or drei until a live tier is known.
 */
export default function SceneContent({
  id,
  env,
  element,
  rotate,
  zoom,
}: SceneContentProps) {
  const visible = useSceneStore((s) => s.views[id]?.visible ?? false);
  const rotation = useDragRotate(element, { enabled: rotate, zoom });

  // Scrolling into view needs a frame to draw the view's first picture.
  useEffect(() => {
    if (visible) invalidate();
  }, [visible]);

  return (
    <View className="absolute inset-0" visible={visible}>
      <LabStage env={env}>
        <CameraRig viewId={id} />
        <Suspense fallback={null}>
          <RotateGroup state={rotation}>
            <FcuDoubleShaft />
            <StageShadow env={env} />
          </RotateGroup>
          <ReadySignal id={id} />
        </Suspense>
      </LabStage>
    </View>
  );
}

/**
 * Mounts with the model (same Suspense boundary) and marks the view ready on
 * its first frame, so the poster underneath is removed only once the live
 * render is on screen.
 */
function ReadySignal({ id }: { id: string }) {
  const setViewReady = useSceneStore((s) => s.setViewReady);
  const signalled = useRef(false);
  useFrame(() => {
    if (signalled.current) return;
    signalled.current = true;
    setViewReady(id);
  });
  return null;
}
