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
import type { EnvironmentId } from "@/design/three-presets";

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
      <Hero />
      <Blueprint />
      {cuts}
    </PageTransition>
  );
}
