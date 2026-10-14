import { create } from "zustand";

/**
 * "covering": the preloader is up. "lifting": its exit has started, so
 * anything waiting to be seen can start. "gone": no preloader, or it's done.
 */
export type PreloaderState = "covering" | "lifting" | "gone";

/** Set on <html> before first paint when this load shows the preloader. */
export const PRELOAD_ATTRIBUTE = "data-preload";
export const PRELOAD_SESSION_KEY = "infintin:preloaded";

// Runs synchronously in <head>, before the body paints, so the cover is
// either there from the first frame or never. First load of the session
// only; reduced motion never. Storage can throw (privacy modes): no cover.
export const preloadDecisionScript = `try{if(!sessionStorage.getItem("${PRELOAD_SESSION_KEY}")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.setAttribute("${PRELOAD_ATTRIBUTE}","")}}catch(e){}`;

// The decision script has already run by the time any module evaluates, so
// the initial state is known before the first client render. The server
// never shows it; nothing reads this during render, only in effects.
const initial: PreloaderState =
  typeof document !== "undefined" &&
  document.documentElement.hasAttribute(PRELOAD_ATTRIBUTE)
    ? "covering"
    : "gone";

export const usePreloader = create<{
  state: PreloaderState;
  set: (state: PreloaderState) => void;
}>()((set) => ({
  state: initial,
  set: (state) => set({ state }),
}));

/** Resolves once nothing covers the page (immediately if nothing ever did). */
export function whenUncovered(): Promise<void> {
  if (usePreloader.getState().state !== "covering") return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = usePreloader.subscribe(({ state }) => {
      if (state === "covering") return;
      unsubscribe();
      resolve();
    });
  });
}
