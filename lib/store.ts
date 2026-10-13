import { create } from "zustand";
import type { QualityTier, ShotId } from "@/design/three-presets";
import { rememberTier, tierBelow } from "./quality";

interface ViewState {
  /** On screen, per IntersectionObserver. Off-screen views skip rendering. */
  visible: boolean;
  /** The model has loaded and drawn, so the poster underneath can go. */
  ready: boolean;
  /** Camera shot the rig is damping towards. */
  shot: ShotId;
}

interface SceneStore {
  /** `null` until detected on the client; the server never knows it. */
  tier: QualityTier | null;
  views: Record<string, ViewState>;

  setTier: (tier: QualityTier) => void;
  /** One tier down, remembered for the rest of the session. */
  stepDown: () => void;

  registerView: (id: string, shot: ShotId) => void;
  unregisterView: (id: string) => void;
  setViewVisible: (id: string, visible: boolean) => void;
  setViewReady: (id: string) => void;
  setShot: (id: string, shot: ShotId) => void;
}

// Per-frame values (rotation, damped camera) never go through the store:
// they live in refs inside the canvas, so no DOM re-renders at 60 fps.
export const useSceneStore = create<SceneStore>()((set) => {
  // Updates one registered view; a call for an unregistered id is dropped,
  // so a late observer callback can't resurrect a view that has gone.
  const patchView = (id: string, patch: Partial<ViewState>) =>
    set(({ views }) => {
      const view = views[id];
      return view ? { views: { ...views, [id]: { ...view, ...patch } } } : {};
    });

  return {
    tier: null,
    views: {},

    setTier: (tier) => set({ tier }),
    stepDown: () =>
      set(({ tier }) => {
        if (tier === null) return {};
        const next = tierBelow(tier);
        rememberTier(next);
        return { tier: next };
      }),

    registerView: (id, shot) =>
      set(({ views }) => ({
        views: { ...views, [id]: { visible: false, ready: false, shot } },
      })),
    unregisterView: (id) =>
      set(({ views }) => {
        const { [id]: _, ...rest } = views;
        return { views: rest };
      }),
    setViewVisible: (id, visible) => patchView(id, { visible }),
    setViewReady: (id) => patchView(id, { ready: true }),
    setShot: (id, shot) => patchView(id, { shot }),
  };
});
