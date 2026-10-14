// Route transition types (07.9). The site reads left to right along the
// shaft: home, then product, then contact. Moving right along that order is
// "forward" and the new page wipes in from the right; moving left wipes in
// from the left.
const ORDER = ["/", "/products", "/contact"] as const;

function position(path: string): number {
  const route = path.split(/[?#]/)[0] || "/";
  // Longest prefix wins, so "/products/x" is a product page, not home.
  for (let i = ORDER.length - 1; i >= 0; i--) {
    const prefix = ORDER[i];
    if (route === prefix || (prefix !== "/" && route.startsWith(`${prefix}/`)))
      return i;
  }
  return -1;
}

/**
 * `transitionTypes` for a link from the current path. Empty when the route
 * doesn't change (an anchor on the same page) or either end is off the map,
 * which means no wipe.
 */
export function transitionTypesFor(from: string, to: string): string[] {
  const a = position(from);
  const b = position(to);
  if (a < 0 || b < 0 || a === b) return [];
  return [b > a ? "nav-forward" : "nav-back"];
}
