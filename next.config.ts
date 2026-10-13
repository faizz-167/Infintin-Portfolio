import type { NextConfig } from "next";

// Tailwind compiles through Next's built-in PostCSS pipeline
// (postcss.config.mjs). Turbopack doesn't support webpack loaders that
// transform CSS, so a `turbopack.rules` CSS loader never saw edits in dev.
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
