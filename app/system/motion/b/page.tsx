import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  PageTransition,
  ProductNameMorph,
} from "@/components/layout/PageTransition";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { RouteLink } from "@/components/ui/RouteLink";
import { TriggerCount } from "../MotionChecks";

export const metadata: Metadata = {
  title: "Motion check B",
  robots: { index: false },
};

// Second route of the Phase 07 bench (see ../page.tsx).
export default function MotionCheckPageB() {
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <PageTransition>
      <ScrollScene
        id="bench-b"
        sheet="Product"
        env="lab"
        className="flex min-h-screen flex-col justify-center gap-4 px-margin"
      >
        <ProductNameMorph>
          <h1 className="self-start type-display-xl">FCU Double Shaft Motor</h1>
        </ProductNameMorph>
        <RouteLink
          href="/system/motion"
          transitionTypes={["nav-back"]}
          className="self-start type-annotation underline"
        >
          Back to page A
        </RouteLink>
      </ScrollScene>
      <TriggerCount />
    </PageTransition>
  );
}
