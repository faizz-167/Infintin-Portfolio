import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductExplorer } from "@/components/explorer/ProductExplorer";
import { partNames } from "@/components/explorer/partNames";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Explorer check",
  robots: { index: false },
};

// Phase 06 bench: the product explorer in both environments. Phase 10 puts
// the same component on the product route.
export default function ExplorerCheckPage() {
  // Development-only; production builds render a 404.
  if (process.env.NODE_ENV !== "development") notFound();
  const names = partNames();

  return (
    <Container className="flex flex-col gap-6 py-8">
      <h1 className="type-display-m">Explorer check</h1>
      <ProductExplorer id="explorer-lab" env="lab" names={names} />
      <ProductExplorer id="explorer-sheet" env="sheet" names={names} />
    </Container>
  );
}
