"use client";

import { useEffect } from "react";
import { fcuDoubleShaftParts } from "@/data/parts/fcu-double-shaft";
import { useSceneStore } from "@/lib/store";
import { readExplorerParams, writeExplorerParams } from "./deep-link";

const PART_IDS = fcuDoubleShaftParts.map((part) => part.id);

/**
 * Keeps a view's explorer state and the URL in step: the query restores the
 * state whenever the view registers (first load, and each time `<Activity>`
 * shows the page again, which re-registers it fresh), and every change after
 * that replaces the query, so the address bar is always a shareable link.
 *
 * Reads `window.location` rather than `useSearchParams`: it runs in effects
 * only, so the page needs no Suspense boundary to stay prerendered, and the
 * store listener always sees the current URL instead of a render's snapshot.
 * `replaceState` adds no history entries; Next keeps its router in sync.
 */
export function useExplorerDeepLink(viewId: string) {
  const dispatch = useSceneStore((s) => s.dispatch);

  useEffect(() => {
    const restore = () => {
      const params = new URLSearchParams(window.location.search);
      for (const action of readExplorerParams(params, PART_IDS)) {
        dispatch(viewId, action);
      }
    };

    // The view registers in its own effect, which runs before this one.
    if (useSceneStore.getState().views[viewId]) restore();

    return useSceneStore.subscribe((state, previous) => {
      const view = state.views[viewId];
      const before = previous.views[viewId];
      if (!view) return;
      if (!before) return restore();
      if (view.explorer === before.explorer) return;

      const query = writeExplorerParams(
        view.explorer,
        new URLSearchParams(window.location.search),
      ).toString();
      const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
      const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      if (url !== current) window.history.replaceState(null, "", url);
    });
  }, [viewId, dispatch]);
}
