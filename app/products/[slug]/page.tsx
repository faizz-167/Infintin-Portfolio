import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { partNames } from "@/components/explorer/partNames";
import { PageTransition } from "@/components/layout/PageTransition";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SectionSweep } from "@/components/motion/SectionSweep";
import { HomeFaq } from "@/components/sections/HomeFaq";
import { ProductExplorerScene } from "@/components/sections/ProductExplorerScene";
import { Button } from "@/components/ui/Button";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { Photo } from "@/components/ui/Photo";
import {
  type Provenance,
  SpecTable,
  type SpecRow as SpecTableRow,
} from "@/components/ui/SpecTable";
import { RouteLink } from "@/components/ui/RouteLink";
import { StatusTag } from "@/components/ui/StatusTag";
import { TextLink } from "@/components/ui/TextLink";
import { getClaim } from "@/data/claims";
import { getProduct, PRODUCT_NAME_FALLBACK, products } from "@/data/products";
import type { ClaimId, ClaimQualifier, Product, SpecRow } from "@/data/types";
import { faqJsonLd, siteOpenGraph } from "@/lib/seo";

// Every product page is built ahead; nothing on it reads the request. The
// explorer's deep-link state is read in the browser.
export const ensureStatic = "navigation";

// The App Shell is shared across slugs and can't hold `params`, and nearly
// everything here depends on the product, so a Suspense shell would only be a
// placeholder. Navigation waits instead, on a payload that is already static.
export const instant = false;

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

const WITHHELD = "Contact engineering for current technical details";

const shown = (id: ClaimId) => claimString(id) !== null;

const PROVENANCE: Record<ClaimQualifier, Provenance> = {
  target: "target",
  estimate: "estimate",
  simulated: "simulated",
  "lab-result": "lab result",
};

/** A spec row for the table: the value only when its claim may be shown. */
function specRow(row: SpecRow): SpecTableRow {
  if (row.value === "withheld" || !shown(row.value)) return { term: row.label };
  const { qualifier } = getClaim(row.value);
  return {
    term: row.label,
    value: <ClaimText id={row.value} />,
    provenance: qualifier && PROVENANCE[qualifier],
  };
}

/**
 * Search snippet from approved claims only: the overview once it is approved,
 * until then the approved facts that exist (power range, status).
 */
function description(product: Product, name: string): string {
  const overview = claimString(product.overview);
  if (overview) return overview;
  const facts = [
    claimString("product.power-range"),
    claimString(product.status),
  ].filter((fact) => fact !== null);
  return `${[name, ...facts].join(". ")}.`;
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) notFound();
  const name = claimString(product.name) ?? PRODUCT_NAME_FALLBACK;
  const text = description(product, name);
  return {
    title: name,
    description: text,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: name,
      description: text,
      url: `/products/${product.slug}`,
      ...siteOpenGraph,
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const name = claimString(product.name) ?? PRODUCT_NAME_FALLBACK;
  const features = product.features.filter(shown);
  const faq = product.faq.filter((item) => shown(item.answer));

  // Headline figures for the strip: the approved ones among these four.
  const FIGURES = ["Power range", "Speed", "Supply voltage", "Noise"];
  const figures = product.specs.filter(
    (row) =>
      FIGURES.includes(row.label) &&
      row.value !== "withheld" &&
      shown(row.value),
  );
  const sections = [
    { id: "overview", label: "Overview" },
    { id: "specification-details", label: "Specification" },
    ...(faq.length > 0 ? [{ id: "questions", label: "Questions" }] : []),
  ];

  // Prototype photographs are woven through the page, each beside the content
  // it shows. A missing photo simply leaves its slot out.
  const figure = (
    index: number,
    aspect: string,
    sizes: string,
    fill = false,
  ) => {
    const photo = product.photos[index];
    if (!photo) return null;
    return (
      <figure className={`flex flex-col gap-1 ${fill ? "h-full" : ""}`}>
        <Photo
          photo={photo}
          label={photo.view}
          aspect={aspect}
          sizes={sizes}
          className={fill ? "min-h-0 flex-1" : undefined}
        />
        {index === 0 && (
          <figcaption className="type-caption text-ink-muted">
            Photographs of the prototype, not renders. Taken in November 2026.
          </figcaption>
        )}
      </figure>
    );
  };

  const heading = (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <h1 className="type-display-l">{name}</h1>
        <div>
          <StatusTag>
            <ClaimText id={product.status} />
          </StatusTag>
        </div>
      </div>
      <div>
        <Button href={product.cta.href} arrow>
          {product.cta.label}
        </Button>
      </div>
    </div>
  );

  const faqLd = faqJsonLd(product.faq);

  return (
    <PageTransition>
      {faqLd && (
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: approved claims only, `<` escaped
          dangerouslySetInnerHTML={{ __html: faqLd }}
        />
      )}
      <ProductExplorerScene heading={heading} names={partNames()} />

      <SectionSweep from="lab">
        {/* One sheet, two columns: a sticky rail (name and section index)
            beside a single flow of overview, specification, photographs and
            questions. The closing call to action sits below, full width. */}
        <ScrollScene
          id="specification"
          sheet="Specification"
          env="sheet"
          className="grid gap-x-gutter gap-y-6 px-margin py-scene lg:grid-cols-12"
        >
          <aside className="lg:col-span-3">
            <div className="flex flex-col gap-3 lg:sticky lg:top-[calc(var(--spacing-header)+var(--spacing-3))]">
              <p className="border-accent border-l-2 pl-2 type-lede text-ink">
                {name}
              </p>
              <nav aria-label="On this page">
                <ul className="flex flex-wrap gap-x-3 gap-y-1 lg:flex-col">
                  {sections.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="type-annotation text-ink-muted transition-colors duration-(--duration-quick) hover:text-accent"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>

          <div className="flex flex-col gap-9 lg:col-span-9">
            <section
              id="overview"
              aria-labelledby="overview-heading"
              className="flex scroll-mt-9 flex-col gap-4"
            >
              <h2 id="overview-heading" className="type-display-m">
                Overview
              </h2>
              {shown(product.overview) && (
                <p className="measure type-lede">
                  <ClaimText id={product.overview} />
                </p>
              )}
              {figures.length > 0 && (
                <dl className="grid border-accent border-t-2 sm:grid-cols-2 lg:grid-cols-4">
                  {figures.map((row) => (
                    <div
                      key={row.label}
                      className="flex flex-col gap-1 border-rule border-b py-3 sm:pr-gutter"
                    >
                      <dd className="type-display-m text-accent">
                        <ClaimText id={row.value as ClaimId} />
                      </dd>
                      <dt className="type-annotation text-ink-muted">
                        {row.label}
                      </dt>
                    </div>
                  ))}
                </dl>
              )}
              {figure(
                0,
                "aspect-[2/1] lg:aspect-[21/9]",
                "(min-width: 1024px) 75vw, 100vw",
              )}
              {shown(product.application) && (
                <p className="flex flex-col gap-1">
                  <span className="type-annotation text-accent">
                    Application
                  </span>
                  <span className="measure type-body">
                    <ClaimText id={product.application} />
                  </span>
                </p>
              )}
              <p className="measure type-body text-ink-muted">
                We publish a figure only once it has been measured and approved.
                Where a value is missing below, our engineers can share the
                current details directly.
              </p>
              {product.datasheet && (
                <div>
                  <Button href={product.datasheet} variant="secondary">
                    Download the datasheet
                  </Button>
                </div>
              )}
            </section>

            <section
              id="specification-details"
              aria-labelledby="specification-heading"
              className="flex scroll-mt-9 flex-col gap-6"
            >
              <h2 id="specification-heading" className="type-display-m">
                Specification
              </h2>

              {/* The table and one photograph share a row; the photograph
                  stretches to the table's height, so neither leaves a gap. */}
              <div className="grid gap-x-gutter gap-y-4 lg:grid-cols-12">
                <SpecTable
                  rows={product.specs.map(specRow)}
                  className="self-start lg:col-span-7"
                />
                <div className="lg:col-span-5">
                  {figure(
                    1,
                    "aspect-[4/3] lg:aspect-auto",
                    "(min-width: 1024px) 30vw, 100vw",
                    true,
                  )}
                </div>
              </div>

              {features.length > 0 && (
                <div className="flex flex-col gap-2">
                  <h3 className="type-annotation text-accent">Features</h3>
                  {/* Framed tiles with a copper numeral each, edges shared
                      so the grid reads as one block. */}
                  <ul className="grid border-rule border-t border-l sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((id, index) => (
                      <li
                        key={id}
                        className="flex flex-col gap-3 border-rule border-r border-b p-3"
                      >
                        <span
                          aria-hidden="true"
                          className="type-display-m leading-none text-accent"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="type-body">
                          <ClaimText id={id} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-2 border-accent border-l-2 bg-ground-raised p-3 lg:p-4">
                <h3 className="type-annotation text-accent">Controller</h3>
                <p className="measure type-lede">
                  <ClaimText id={product.controller} fallback={WITHHELD} />
                </p>
                {!shown(product.controller) && (
                  <p className="type-annotation">
                    <TextLink href="/contact?type=product">
                      Contact engineering
                    </TextLink>
                  </p>
                )}
              </div>

              {/* The remaining views as one strip, labelled by view. */}
              <ul className="grid gap-gutter sm:grid-cols-3">
                {[2, 3, 4].map((index) => (
                  <li key={index}>
                    {figure(
                      index,
                      "aspect-[4/3]",
                      "(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw",
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </ScrollScene>

        {faq.length > 0 && <HomeFaq product={product} />}

        {/* Closing band: copper ground, paper text. The button is inverted
            (paper ground) so it keeps contrast against the copper. */}
        <section
          aria-labelledby="next-steps-heading"
          className="flex flex-col gap-4 bg-copper px-margin py-9 text-paper lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="flex flex-col gap-2">
            <h2
              id="next-steps-heading"
              className="type-display-l lg:max-w-[20ch]"
            >
              Next steps
            </h2>
            <p className="measure type-lede">
              Tell us about your fan coil unit and its duty, and we'll talk
              through technical fit and what an evaluation would involve.
            </p>
          </div>
          <RouteLink
            href={product.cta.href}
            className="inline-flex min-h-target items-center justify-center bg-paper px-4 py-2 type-annotation text-graphite transition-colors duration-(--duration-quick) hover:bg-graphite hover:text-paper"
          >
            {product.cta.label} →
          </RouteLink>
        </section>
      </SectionSweep>
    </PageTransition>
  );
}
