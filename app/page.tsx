import { PageTransition } from "@/components/layout/PageTransition";
import { Blueprint } from "@/components/sections/Blueprint";
import { Hero } from "@/components/sections/Hero";

export default function Home() {
  return (
    <PageTransition>
      <Hero />
      <Blueprint />
    </PageTransition>
  );
}
