"use client";

let shown = false;

/**
 * True only for the first page shown in this document. Focus is left alone
 * on a full load (the browser starts at the top and the skip link works);
 * only client-side navigations move it.
 */
export function isFirstPageShow(): boolean {
  if (shown) return false;
  shown = true;
  return true;
}

/**
 * Moves focus to the visible page's heading after a client-side navigation.
 *
 * Routes stay mounted under `<Activity>`, so the link that was followed is
 * now inside a hidden page, and the browser's sequential focus would carry
 * on from there: the next Tab landed in the footer. Focusing the new page's
 * h1 also has screen readers announce where the visitor has arrived.
 */
export function focusPageHeading(): void {
  // Hidden pages are `display: none`, so they have no client rects.
  const heading = [
    ...document.querySelectorAll<HTMLElement>("#content h1"),
  ].find((h) => h.getClientRects().length > 0);
  const target = heading ?? document.getElementById("content");
  if (!target) return;
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}
