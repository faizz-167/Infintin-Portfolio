"use client";

import { View } from "@react-three/drei";
import { invalidate, useFrame } from "@react-three/fiber";
import { type RefObject, Suspense, useEffect, useRef, useState } from "react";
import type { EnvironmentId } from "@/design/three-presets";
import type { CalloutAnchor } from "@/lib/calloutTrack";
import { useSceneStore } from "@/lib/store";
import { CameraRig } from "./CameraRig";
import { RotateGroup, useViewGestures } from "./DragRotate";
import { LabStage } from "./LabStage";
import { FcuDoubleShaft } from "./models/FcuDoubleShaft";
import { SpecOverlay } from "./SpecOverlay";
import { createViewRuntime } from "./viewRuntime";

interface SceneContentProps {
  id: string;
  env: EnvironmentId;
  /** The placeholder the view tracks and the gestures listen on. */
  element: RefObject<HTMLDivElement | null>;
  rotate: boolean;
  zoom: boolean;
  /** Full explorer: pick parts, drag the section handle, show balloons. */
  explore: boolean;
  fixedShot: boolean;
  callouts?: readonly CalloutAnchor[];
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
  explore,
  fixedShot,
  callouts,
}: SceneContentProps) {
  const visible = useSceneStore((s) => s.views[id]?.visible ?? false);
  const dispatch = useSceneStore((s) => s.dispatch);
  const setHovered = useSceneStore((s) => s.setHovered);
  const [runtime] = useState(createViewRuntime);

  useEffect(() => {
    runtime.element = element.current;
    return () => {
      runtime.element = null;
    };
  }, [runtime, element]);

  useViewGestures(element, runtime, {
    rotate,
    zoom,
    ...(explore && {
      onTap: (part) =>
        dispatch(id, part ? { type: "ISOLATE", part } : { type: "CLEAR" }),
      onHover: (part) => setHovered(id, part),
      onSection: (t) => dispatch(id, { type: "SET_SECTION", t }),
    }),
  });

  // Scrolling into view needs a frame to draw the view's first picture.
  useEffect(() => {
    if (visible) invalidate();
  }, [visible]);

  return (
    <>
      <View className="absolute inset-0" visible={visible}>
        <LabStage env={env}>
          <CameraRig viewId={id} runtime={runtime} fixedShot={fixedShot} />
          <Suspense fallback={null}>
            <RotateGroup state={runtime.rotation}>
              <FcuDoubleShaft
                viewId={id}
                env={env}
                runtime={runtime}
                balloons={explore}
                callouts={callouts}
              />
            </RotateGroup>
            <ReadySignal id={id} />
          </Suspense>
        </LabStage>
      </View>
      {explore && <SpecOverlay runtime={runtime} env={env} />}
    </>
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
