import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ModelCheck } from "./ModelCheck";

export const metadata: Metadata = {
  title: "Model check",
  robots: { index: false },
};

// Phase 04 check: both GLBs load with the meshopt decoder and every mesh
// gets a material preset. Stand-in until the Phase 05 stage replaces it.
export default function ModelCheckPage() {
  // Development-only; production builds render a 404.
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <Container className="flex flex-col gap-4 py-8">
      <h1 className="type-display-m">Model check</h1>
      <ModelCheck />
    </Container>
  );
}
