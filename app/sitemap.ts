import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { siteUrl } from "@/lib/seo";

// Live routes only: the /system pages are dev-only and 404 in production.
// No lastModified: the build date would claim every page changed on deploy.
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    ...products.map((product) => `/products/${product.slug}`),
    "/contact",
  ];
  return paths.map((path) => ({ url: new URL(path, siteUrl).href }));
}
