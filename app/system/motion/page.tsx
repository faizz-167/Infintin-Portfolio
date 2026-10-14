import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PageTransition,
  ProductNameMorph,
} from "@/components/layout/PageTransition";
import { RouteLink } from "@/components/ui/RouteLink";
import { MotionChecks, TriggerCount } from "./MotionChecks";

export const metadata: Metadata = {
  title: "Motion check",
  robots: { index: false },
};

// Phase 07 bench: the site shell, motion primitives and route transitions,
// until Phases 08–10 put them on the real routes. Two routes, so the wipe,
// the product-name morph and Activity hide/show can be checked.
export default function MotionCheckPage() {
  // Development-only; production builds render a 404.
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <PageTransition>
      <div className="flex flex-col gap-3 px-margin pt-9">
        <ProductNameMorph>
          <p className="self-start type-annotation">FCU Double Shaft Motor</p>
        </ProductNameMorph>
        <RouteLink
          href="/system/motion/b"
          transitionTypes={["nav-forward"]}
          className="self-start type-annotation underline"
        >
          Forward to page B
        </RouteLink>
      </div>
      <MotionChecks />
      <TriggerCount />
    </PageTransition>
  );
}
