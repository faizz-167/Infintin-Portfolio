// Read inside frame callbacks, so a cached query rather than a hook.
let query: MediaQueryList | null = null;

/** Live OS reduced-motion setting, for code running outside React renders. */
export function prefersReducedMotion(): boolean {
  query ??= window.matchMedia("(prefers-reduced-motion: reduce)");
  return query.matches;
}
