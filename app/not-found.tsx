import type { Metadata } from "next";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Page not found" };

/** Unknown routes and `notFound()` (an unknown product slug). */
export default function NotFound() {
  return (
    <ScrollScene
      id="not-found"
      sheet="Not found"
      env="sheet"
      className="flex min-h-svh flex-col justify-center gap-4 px-margin pt-[calc(var(--spacing-header)+var(--spacing-6))] pb-scene"
    >
      <div className="flex flex-col gap-3">
        <p className="type-annotation text-ink-muted">Error 404</p>
        <h1 className="type-display-l">This sheet isn't in the set</h1>
        <p className="measure type-lede">
          The page may have moved, or the address may be mistyped.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button href="/" arrow>
          Go to the home page
        </Button>
        <Button href="/products/fcu-double-shaft" variant="secondary">
          See the product
        </Button>
      </div>
    </ScrollScene>
  );
}
