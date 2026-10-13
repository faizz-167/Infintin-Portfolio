import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SceneBench } from "./SceneBench";

export const metadata: Metadata = {
  title: "Scene check",
  robots: { index: false },
};

// Phase 05 bench for the shared canvas, stage, camera rig and quality tiers.
export default function SceneCheckPage() {
  // Development-only; production builds render a 404.
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <Container className="flex flex-col gap-4 py-8">
      <h1 className="type-display-m">Scene check</h1>
      <SceneBench />
    </Container>
  );
}
