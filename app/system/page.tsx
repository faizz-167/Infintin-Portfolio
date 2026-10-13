import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Annotation } from "@/components/ui/Annotation";
import { Balloon } from "@/components/ui/Balloon";
import { Button } from "@/components/ui/Button";
import { CentreLine } from "@/components/ui/CentreLine";
import { Container } from "@/components/ui/Container";
import { Grid } from "@/components/ui/Grid";
import { Rule } from "@/components/ui/Rule";
import { SpecTable } from "@/components/ui/SpecTable";
import { StatusTag } from "@/components/ui/StatusTag";
import { TextLink } from "@/components/ui/TextLink";
import { TitleBlock } from "@/components/ui/TitleBlock";
import { duration, ease } from "@/design/tokens";
import { ContrastTable } from "./ContrastTable";
import { MotionBench } from "./MotionBench";
import { SpecimenForm } from "./SpecimenForm";

export const metadata: Metadata = {
  title: "Design system",
  robots: { index: false },
};

const TYPE_STYLES = [
  ["type-display-xl", "Drawn around the shaft"],
  ["type-display-l", "Assembly, section, parts"],
  ["type-display-m", "Double shaft motor"],
  [
    "type-lede",
    "A drawing set for one real object, read in the order an engineer would.",
  ],
  [
    "type-body",
    "Body text in Source Serif 4. Optical sizing picks the cut from the rendered size, so this paragraph uses the text design while headlines use the display design. The measure is held near 68 characters.",
  ],
  ["type-caption", "Figure 1. Elevation of the assembly."],
  ["type-annotation", "Front blower wheel"],
  ["type-data", "0123456789 W"],
] as const;

// Literal class names so Tailwind generates every step (it drops unused tokens).
const SPACES = [
  ["1", "w-1"],
  ["2", "w-2"],
  ["3", "w-3"],
  ["4", "w-4"],
  ["5", "w-5"],
  ["6", "w-6"],
  ["7", "w-7"],
  ["8", "w-8"],
  ["9", "w-9"],
  ["10", "w-10"],
  ["11", "w-11"],
  ["12", "w-12"],
] as const;

// Marker i is shown only while the grid has more than i columns (4 / 6 / 12).
function columnVisibility(i: number): string {
  if (i < 4) return "";
  if (i < 6) return "hidden md:block";
  return "hidden lg:block";
}

function Heading({ children }: { children: string }) {
  return <h2 className="type-display-m">{children}</h2>;
}

/** Every primitive, rendered once per environment. */
function Primitives() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="text">Text</Button>
        <Button size="lg" arrow>
          Start an enquiry
        </Button>
        <Button href="/system" variant="secondary" arrow>
          As a link
        </Button>
        <Button disabled>Disabled</Button>
      </div>
      <p className="type-body measure">
        An <TextLink href="/system">internal link</TextLink> and an{" "}
        <TextLink href="https://example.com">external link</TextLink> in running
        text.
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <StatusTag>Prototype, under laboratory testing</StatusTag>
        <Balloon number={7} />
        <TitleBlock
          sheetName="Assembly"
          sheet={2}
          sheetCount={8}
          status="Prototype"
        />
      </div>
      <div className="relative h-11 overflow-hidden border border-rule">
        <div className="absolute inset-x-0 top-1/2">
          <CentreLine />
        </div>
        <Annotation
          anchor={{ x: 120, y: 96 }}
          offset={{ x: 80, y: -56 }}
          number={3}
        >
          Stator
        </Annotation>
        <Annotation
          anchor={{ x: 320, y: 96 }}
          offset={{ x: -60, y: 56 }}
          number={5}
        >
          Shaft
        </Annotation>
      </div>
      <SpecTable
        className="measure"
        rows={[
          { term: "Power range", value: "50 to 250 W" },
          {
            term: "Sample target row",
            value: "Sample value",
            provenance: "target",
          },
          {
            term: "Sample simulated row",
            value: "Sample value",
            provenance: "simulated",
          },
          { term: "Withheld row" },
        ]}
      />
      <SpecimenForm />
    </div>
  );
}

export default function SystemPage() {
  // Development-only specimen; production builds render a 404.
  if (process.env.NODE_ENV !== "development") notFound();

  return (
    <div>
      <Container as="section" className="flex flex-col gap-6 py-8">
        <h1 className="type-display-xl">Design system</h1>

        <Heading>Type</Heading>
        <div className="flex flex-col gap-3">
          {TYPE_STYLES.map(([style, sample]) => (
            <div key={style} className="flex flex-col gap-1 rule-hairline pt-1">
              <span className="type-annotation text-ink-muted">{style}</span>
              <p
                className={`${style} ${style === "type-body" ? "measure" : ""}`}
              >
                {sample}
              </p>
            </div>
          ))}
        </div>

        <Heading>Space</Heading>
        <div className="flex flex-col gap-1">
          {SPACES.map(([n, width]) => (
            <div key={n} className="flex items-center gap-2 type-data">
              <span className="w-4">{n}</span>
              <span className={`h-2 bg-accent ${width}`} />
            </div>
          ))}
        </div>

        <Heading>Grid</Heading>
        <Grid>
          {Array.from({ length: 12 }, (_, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: static column markers
              key={i}
              className={`h-6 bg-ground-raised type-data ${columnVisibility(i)}`}
            >
              {i + 1}
            </div>
          ))}
        </Grid>

        <Heading>Rules and radii</Heading>
        <Rule />
        <Rule weight="object" />
        <CentreLine />
        <div className="flex gap-2">
          <div className="size-6 border border-ink" />
          <div className="size-6 rounded-xs border border-ink" />
        </div>

        <Heading>Motion</Heading>
        <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1 type-data [overflow-wrap:anywhere]">
          {Object.entries(ease).map(([name, curve]) => (
            <div key={name} className="contents">
              <dt>ease.{name}</dt>
              <dd>{curve.join(", ")}</dd>
            </div>
          ))}
          {Object.entries(duration).map(([name, s]) => (
            <div key={name} className="contents">
              <dt>duration.{name}</dt>
              <dd>{s * 1000} ms</dd>
            </div>
          ))}
        </dl>
        <MotionBench />
      </Container>

      {(["sheet", "lab"] as const).map((env) => (
        <section key={env} data-env={env} className="py-8">
          <Container className="flex flex-col gap-6">
            <Heading>
              {env === "sheet" ? "Sheet environment" : "Lab environment"}
            </Heading>
            <ContrastTable env={env} />
            <Primitives />
          </Container>
        </section>
      ))}
    </div>
  );
}
