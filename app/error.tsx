"use client";

import { useEffect } from "react";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { Button } from "@/components/ui/Button";

/**
 * A render failure inside a page. The header, frame and footer (root layout)
 * stay up, so the visitor can still navigate away.
 */
export default function PageError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    // No error reporting service yet; the console keeps it visible in QA.
    console.error(error);
  }, [error]);

  return (
    <ScrollScene
      id="error"
      sheet="Error"
      env="sheet"
      className="flex min-h-svh flex-col justify-center gap-4 px-margin pt-[calc(var(--spacing-header)+var(--spacing-6))] pb-scene"
    >
      <div className="flex flex-col gap-3">
        <p className="type-annotation text-ink-muted">Error</p>
        <h1 className="type-display-l">This page didn't load</h1>
        <p className="measure type-lede">
          Something went wrong on our side. Try again, or come back in a moment.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={retry}>Try again</Button>
        <Button href="/" variant="secondary">
          Go to the home page
        </Button>
      </div>
    </ScrollScene>
  );
}
