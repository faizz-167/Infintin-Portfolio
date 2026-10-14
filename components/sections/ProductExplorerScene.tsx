"use client";

import type { ReactNode } from "react";
import { ProductExplorer } from "@/components/explorer/ProductExplorer";
import type { PartName } from "@/components/explorer/partNames";
import { useExplorerDeepLink } from "@/components/explorer/useExplorerDeepLink";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { useSceneStore } from "@/lib/store";

const VIEW = "product-explorer";

/**
 * Sheet 01 of the product page, the Lab: the heading block and the full
 * explorer filling the rest of the viewport (from `md` up; phones read top
 * to bottom). The explorer's state lives in the URL for sharing.
 */
export function ProductExplorerScene({
  heading,
  names,
}: {
  /** Server-rendered name, status and actions. */
  heading: ReactNode;
  names: readonly PartName[];
}) {
  const tier = useSceneStore((s) => s.tier);
  const ready = useSceneStore((s) => s.views[VIEW]?.ready ?? false);
  const live = tier !== null && tier !== "poster";
  useExplorerDeepLink(VIEW);

  return (
    <ScrollScene id="explorer" sheet="Explorer">
      {/* Lab ground: painted around the view by the view itself once it is
          live, so the canvas shows through its box (`ground-hole`). */}
      <div
        data-env="lab"
        data-ground={live && ready ? "canvas" : undefined}
        className="isolate flex flex-col gap-4 overflow-clip px-margin pt-[calc(var(--spacing-header)+var(--spacing-4))] pb-5 md:h-svh md:min-h-[40rem]"
      >
        {heading}
        <ProductExplorer id={VIEW} env="lab" names={names} fill />
      </div>
    </ScrollScene>
  );
}
