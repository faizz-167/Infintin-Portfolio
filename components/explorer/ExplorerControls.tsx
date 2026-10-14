"use client";

import { Button } from "@/components/ui/Button";
import { useSceneStore } from "@/lib/store";
import { initialExplorerState, type RenderMode } from "./explorer-machine";

const MODES: readonly { mode: RenderMode; label: string; shortcut?: string }[] =
  [
    { mode: "shaded", label: "Shaded" },
    { mode: "drawing", label: "Drawing", shortcut: "D" },
    { mode: "xray", label: "X-ray", shortcut: "X" },
  ];

/**
 * Buttons for every explorer state, so all of it is reachable without the
 * keyboard shortcuts or the 3D gestures. Wraps on narrow screens; every
 * target is at least 44 px.
 */
export function ExplorerControls({ viewId }: { viewId: string }) {
  const state = useSceneStore(
    (s) => s.views[viewId]?.explorer ?? initialExplorerState,
  );
  const dispatch = useSceneStore((s) => s.dispatch);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        pressed={state.exploded}
        shortcut="E"
        onClick={() =>
          dispatch(viewId, { type: state.exploded ? "ASSEMBLE" : "EXPLODE" })
        }
      >
        Explode
      </Button>

      <fieldset className="flex flex-wrap gap-1">
        <legend className="sr-only">Render mode</legend>
        {MODES.map(({ mode, label, shortcut }) => (
          <Button
            key={mode}
            variant="secondary"
            pressed={state.mode === mode}
            shortcut={shortcut}
            onClick={() => dispatch(viewId, { type: "SET_MODE", mode })}
          >
            {label}
          </Button>
        ))}
      </fieldset>

      <Button
        variant="secondary"
        pressed={state.section.on}
        shortcut="S"
        onClick={() => dispatch(viewId, { type: "TOGGLE_SECTION" })}
      >
        Section
      </Button>
      {state.section.on && (
        <label className="flex min-h-target items-center gap-1 type-annotation text-ink-muted">
          Cut position
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={state.section.t}
            onChange={(event) =>
              dispatch(viewId, {
                type: "SET_SECTION",
                t: event.currentTarget.valueAsNumber,
              })
            }
            className="w-11 accent-accent"
          />
        </label>
      )}

      <Button
        variant="text"
        shortcut="Escape"
        onClick={() => dispatch(viewId, { type: "RESET" })}
      >
        Reset
      </Button>
    </div>
  );
}
