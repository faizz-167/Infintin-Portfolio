import type { PartId } from "@/data/types";
import type {
  ExplorerAction,
  ExplorerState,
  RenderMode,
} from "./explorer-machine";

// Pure, no runtime imports, like the reducer: `node --test` runs it directly.
// Part ids are passed in for the same reason (parts data uses the `@/` alias).

/**
 * Explorer state in the URL, for links people send to colleagues:
 * `?view=exploded&part=rotor&mode=xray`. Defaults are left out, so the
 * plain product URL is the plain explorer. The section plane isn't encoded.
 */
const MODES: readonly RenderMode[] = ["shaded", "drawing", "xray"];

/** Actions that bring a fresh explorer to the state in `params`. Unknown values are ignored. */
export function readExplorerParams(
  params: URLSearchParams,
  parts: readonly PartId[],
): ExplorerAction[] {
  const actions: ExplorerAction[] = [];
  if (params.get("view") === "exploded") actions.push({ type: "EXPLODE" });
  const part = parts.find((id) => id === params.get("part"));
  if (part) actions.push({ type: "ISOLATE", part });
  const mode = MODES.find((m) => m === params.get("mode"));
  if (mode) actions.push({ type: "SET_MODE", mode });
  return actions;
}

/** `params` with the explorer's keys set from `state`; other keys are kept. */
export function writeExplorerParams(
  state: ExplorerState,
  params: URLSearchParams,
): URLSearchParams {
  const next = new URLSearchParams(params);
  const set = (key: string, value: string | null) => {
    if (value === null) next.delete(key);
    else next.set(key, value);
  };
  set("view", state.exploded ? "exploded" : null);
  set("part", state.isolated);
  set("mode", state.mode === "shaded" ? null : state.mode);
  return next;
}
