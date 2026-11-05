"use client";

import { AnimatePresence, m } from "framer-motion";
import {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMotionPreference } from "@/components/motion/useMotionPreference";
import { SceneView } from "@/components/three/SceneView";
import type { EnvironmentId } from "@/design/three-presets";
import { useSceneStore } from "@/lib/store";
import { ExplorerControls } from "./ExplorerControls";
import {
  type ExplorerAction,
  type ExplorerState,
  initialExplorerState,
} from "./explorer-machine";
import { PartsList } from "./PartsList";
import type { PartName } from "./partNames";

const MODE_NAMES = {
  shaded: "Shaded",
  drawing: "Drawing",
  xray: "X-ray",
} as const;

/** What changed between two states, as a short phrase for the live region. */
function describeChange(
  before: ExplorerState,
  after: ExplorerState,
  nameOf: (id: string) => ReactNode,
): ReactNode {
  if (after.isolated !== before.isolated) {
    return after.isolated ? (
      <>{nameOf(after.isolated)} isolated</>
    ) : (
      "Selection cleared"
    );
  }
  if (after.exploded !== before.exploded) {
    return after.exploded ? "Exploded view" : "Assembled view";
  }
  if (after.mode !== before.mode) return `${MODE_NAMES[after.mode]} mode`;
  if (after.section.on !== before.section.on) {
    return after.section.on ? "Section on" : "Section off";
  }
  return null;
}

const SHORTCUTS: Record<string, (s: ExplorerState) => ExplorerAction> = {
  e: (s) => ({ type: s.exploded ? "ASSEMBLE" : "EXPLODE" }),
  x: (s) => ({ type: "SET_MODE", mode: s.mode === "xray" ? "shaded" : "xray" }),
  d: (s) => ({
    type: "SET_MODE",
    mode: s.mode === "drawing" ? "shaded" : "drawing",
  }),
  s: () => ({ type: "TOGGLE_SECTION" }),
  escape: (s) => ({ type: s.isolated ? "CLEAR" : "RESET" }),
};

/**
 * The product explorer: the live view, its controls and the parts list.
 * Shortcuts work while focus is anywhere inside it. State changes are
 * announced politely; the parts list is the screen-reader way in.
 */
export function ProductExplorer({
  id,
  env,
  names,
  fill = false,
}: {
  id: string;
  env: EnvironmentId;
  names: readonly PartName[];
  /**
   * Take the height the parent gives it (from `md` up) instead of a fixed
   * aspect ratio; the parts list scrolls inside. For a full-viewport Lab
   * scene, where the view also paints the ground around itself.
   */
  fill?: boolean;
}) {
  const state = useSceneStore(
    (s) => s.views[id]?.explorer ?? initialExplorerState,
  );
  const dispatch = useSceneStore((s) => s.dispatch);
  const { transition } = useMotionPreference();
  const [announcement, setAnnouncement] = useState<ReactNode>(null);
  const [listOpen, setListOpen] = useState(false);
  const previous = useRef(state);

  useEffect(() => {
    const message = describeChange(
      previous.current,
      state,
      (part) => names.find((n) => n.id === part)?.name,
    );
    previous.current = state;
    if (message) setAnnouncement(message);
  }, [state, names]);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const target = event.target;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    ) {
      return;
    }
    const action = SHORTCUTS[event.key.toLowerCase()];
    if (!action) return;
    event.preventDefault();
    dispatch(id, action(state));
  };

  return (
    // Keyboard shortcuts for the region; every action also has a button.
    <section
      aria-label="Product explorer"
      onKeyDown={onKeyDown}
      className={`flex flex-col gap-3 ${fill ? "md:min-h-0 md:flex-1" : ""}`}
    >
      <div
        className={`grid gap-3 md:grid-cols-[1fr_18rem] ${fill ? "md:min-h-0 md:flex-1 md:grid-rows-[minmax(0,1fr)]" : ""}`}
      >
        <SceneView
          id={id}
          shot="hero"
          poster="hero"
          env={env}
          rotate
          explore
          eager
          label="3D view of the motor assembly. Drag or use the arrow keys to turn it; the parts list below describes each part."
          sizes="(min-width: 48rem) 75vw, 100vw"
          className={
            fill
              ? "ground-hole aspect-[4/3] w-full md:aspect-auto md:h-full"
              : "aspect-[4/3] w-full md:aspect-video"
          }
        />
        <div
          data-lenis-prevent={fill ? "" : undefined}
          className={`hidden md:block ${fill ? "md:min-h-0 md:overflow-y-auto" : ""}`}
        >
          <PartsList viewId={id} names={names} />
        </div>
      </div>

      <ExplorerControls viewId={id} />

      {/* Narrow screens: the parts list folds into a sheet under the controls. */}
      <div className="md:hidden">
        <button
          type="button"
          aria-expanded={listOpen}
          onClick={() => setListOpen((open) => !open)}
          className="flex min-h-target w-full cursor-pointer items-center justify-between border-rule border-t type-annotation text-ink"
        >
          Parts list
          <span aria-hidden="true">{listOpen ? "−" : "+"}</span>
        </button>
        <AnimatePresence initial={false}>
          {listOpen && (
            <m.div
              key="parts"
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={transition("move")}
              className="overflow-hidden"
            >
              <PartsList viewId={id} names={names} />
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}
