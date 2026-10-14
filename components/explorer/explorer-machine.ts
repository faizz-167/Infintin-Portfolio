import type { PartId } from "@/data/types";

// Pure reducer, no runtime imports: `node --test` runs this file directly,
// and Node doesn't resolve the `@/` alias (type imports are erased).

export type RenderMode = "shaded" | "drawing" | "xray";

/**
 * Explorer state (architecture.md §5.4). Explode and isolate are independent:
 * a part can be isolated while assembled, and clearing isolation returns to
 * whichever explode state was active.
 */
export interface ExplorerState {
  exploded: boolean;
  isolated: PartId | null;
  mode: RenderMode;
  section: { on: boolean; t: number };
}

export type ExplorerAction =
  | { type: "EXPLODE" }
  | { type: "ASSEMBLE" }
  | { type: "ISOLATE"; part: PartId }
  | { type: "CLEAR" }
  | { type: "SET_MODE"; mode: RenderMode }
  | { type: "TOGGLE_SECTION" }
  /** Cut position, 0 to 1 across the motor body. */
  | { type: "SET_SECTION"; t: number }
  | { type: "RESET" };

export const initialExplorerState: ExplorerState = {
  exploded: false,
  isolated: null,
  mode: "shaded",
  // Through the shaft axis: the cut that shows the whole radial stack.
  section: { on: false, t: 0.5 },
};

/** Returns the same object when nothing changes, so subscribers don't re-render. */
export function explorerReducer(
  state: ExplorerState,
  action: ExplorerAction,
): ExplorerState {
  switch (action.type) {
    case "EXPLODE":
      return state.exploded ? state : { ...state, exploded: true };
    case "ASSEMBLE":
      return state.exploded ? { ...state, exploded: false } : state;
    case "ISOLATE":
      return state.isolated === action.part
        ? state
        : { ...state, isolated: action.part };
    case "CLEAR":
      return state.isolated === null ? state : { ...state, isolated: null };
    case "SET_MODE":
      return state.mode === action.mode
        ? state
        : { ...state, mode: action.mode };
    case "TOGGLE_SECTION":
      return { ...state, section: { ...state.section, on: !state.section.on } };
    case "SET_SECTION": {
      const t = Math.min(1, Math.max(0, action.t));
      return t === state.section.t
        ? state
        : { ...state, section: { ...state.section, t } };
    }
    case "RESET":
      return initialExplorerState;
  }
}
