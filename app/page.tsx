import type { Metadata } from "next";
import { Fragment, type ReactNode } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { SectionSweep } from "@/components/motion/SectionSweep";
import { Blueprint } from "@/components/sections/Blueprint";
import { Ecosystem, ecosystemShown } from "@/components/sections/Ecosystem";
import { Hero } from "@/components/sections/Hero";
import { Inquiry } from "@/components/sections/Inquiry";
import { Leadership, leadershipShown } from "@/components/sections/Leadership";
import { Portfolio } from "@/components/sections/Portfolio";
import { Process } from "@/components/sections/Process";
import {
  ProjectSpotlight,
  projectShown,
} from "@/components/sections/ProjectSpotlight";
import { TechnicalEdge } from "@/components/sections/TechnicalEdge";
import { claimString } from "@/components/ui/ClaimText";
import { company } from "@/data/company";
import type { EnvironmentId } from "@/design/three-presets";
import { organizationJsonLd, siteOpenGraph } from "@/lib/seo";

// The title carries the search terms the PRD leads with (HVAC, fan coil unit
// motors, controllers); the description is the approved vision line.
const TITLE = `${company.shortName} · Fan coil unit motors and controllers for HVAC`;
const DESCRIPTION = claimString(company.vision) ?? undefined;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    ...siteOpenGraph,
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
};

type Scene = {
  id: string;
  env: EnvironmentId;
  shown: boolean;
  node: ReactNode;
};

export default function Home() {
  // After the Blueprint sheet. A scene with nothing approved to show is left
  // out entirely (no empty sheets); sheet numbers and the environment cuts
  // follow from the scenes that remain.
  const scenes: Scene[] = [
    { id: "portfolio", env: "lab", shown: true, node: <Portfolio /> },
    { id: "engineering", env: "sheet", shown: true, node: <TechnicalEdge /> },
    { id: "process", env: "sheet", shown: true, node: <Process /> },
    {
      id: "project",
      env: "lab",
      shown: projectShown(),
      node: <ProjectSpotlight />,
    },
    {
      id: "leadership",
      env: "sheet",
      shown: leadershipShown(),
      node: <Leadership />,
    },
    {
      id: "recognition",
      env: "lab",
      shown: ecosystemShown(),
      node: <Ecosystem />,
    },
    { id: "inquiry", env: "sheet", shown: true, node: <Inquiry /> },
  ];

  // Every change of environment is a section sweep from the one before.
  let previous: EnvironmentId = "sheet";
  const cuts = scenes
    .filter((scene) => scene.shown)
    .map((scene) => {
      const from = previous;
      previous = scene.env;
      return scene.env === from ? (
        <Fragment key={scene.id}>{scene.node}</Fragment>
      ) : (
        <SectionSweep key={scene.id} from={from}>
          {scene.node}
        </SectionSweep>
      );
    });

  return (
    <PageTransition>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: approved claims only, `<` escaped
        dangerouslySetInnerHTML={{ __html: organizationJsonLd() }}
      />
      <Hero />
      <Blueprint />
      {cuts}
    </PageTransition>
  );
}
