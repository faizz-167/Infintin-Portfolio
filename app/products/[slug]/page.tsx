import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { partNames } from "@/components/explorer/partNames";
import { PageTransition } from "@/components/layout/PageTransition";
import { ScrollScene } from "@/components/motion/ScrollScene";
import { SectionSweep } from "@/components/motion/SectionSweep";
import { ProductExplorerScene } from "@/components/sections/ProductExplorerScene";
import { Button } from "@/components/ui/Button";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { Disclosure } from "@/components/ui/Disclosure";
import {
  type Provenance,
  SpecTable,
  type SpecRow as SpecTableRow,
} from "@/components/ui/SpecTable";
import { StatusTag } from "@/components/ui/StatusTag";
import { TextLink } from "@/components/ui/TextLink";
import { getClaim } from "@/data/claims";
import { getProduct, PRODUCT_NAME_FALLBACK, products } from "@/data/products";
import type { ClaimId, ClaimQualifier, Product, SpecRow } from "@/data/types";

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
  if (!product) return {};
  const name = claimString(product.name) ?? PRODUCT_NAME_FALLBACK;
  const text = description(product, name);
  return {
    title: name,
    description: text,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: name,
      description: text,
      type: "website",
      images: [
        {
          url: `/posters/${product.slug}-hero-lab.webp`,
          width: 2706,
          height: 1520,
          alt: `${name}, rendered from its CAD model`,
        },
      ],
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
      <div className="flex flex-wrap gap-2">
        <Button href={product.cta.primary.href} arrow>
          {product.cta.primary.label}
        </Button>
        <Button href={product.cta.secondary.href} variant="secondary">
          {product.cta.secondary.label}
        </Button>
      </div>
    </div>
  );

  return (
    <PageTransition>
      <ProductExplorerScene heading={heading} names={partNames()} />

      <SectionSweep from="lab">
        <ScrollScene
          id="specification"
          sheet="Specification"
          env="sheet"
          className="grid gap-x-gutter gap-y-6 px-margin py-scene lg:grid-cols-12"
        >
          <section
            aria-labelledby="overview-heading"
            className="flex flex-col gap-3 lg:col-span-5"
          >
            <h2 id="overview-heading" className="type-display-m">
              Overview
            </h2>
            {shown(product.overview) && (
              <p className="measure type-lede">
                <ClaimText id={product.overview} />
              </p>
            )}
            {shown(product.application) && (
              <p className="flex flex-col gap-1">
                <span className="type-annotation text-ink-muted">
                  Application
                </span>
                <span className="type-body">
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
            aria-labelledby="specification-heading"
            className="flex flex-col gap-5 lg:col-span-6 lg:col-start-7"
          >
            <h2 id="specification-heading" className="type-display-m">
              Specification
            </h2>
            <SpecTable rows={product.specs.map(specRow)} />

            {features.length > 0 && (
              <div className="flex flex-col gap-2">
                <h3 className="type-annotation text-ink-muted">Features</h3>
                <ul className="flex flex-col gap-1">
                  {features.map((id) => (
                    <li key={id} className="rule-hairline py-1 type-body">
                      <ClaimText id={id} />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <h3 className="type-annotation text-ink-muted">Controller</h3>
              <p className="measure type-body">
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
          </section>
        </ScrollScene>
      </SectionSweep>

      <ScrollScene
        id="questions"
        sheet="Questions"
        env="sheet"
        className="grid gap-x-gutter gap-y-6 px-margin pb-scene lg:grid-cols-12"
      >
        {faq.length > 0 && (
          <section
            aria-labelledby="questions-heading"
            className="flex flex-col gap-3 lg:col-span-7"
          >
            <h2 id="questions-heading" className="type-display-m">
              Questions
            </h2>
            <div className="flex flex-col">
              {faq.map((item) => (
                <Disclosure key={item.answer} summary={item.question}>
                  <p className="measure type-body">
                    <ClaimText id={item.answer} />
                  </p>
                </Disclosure>
              ))}
            </div>
          </section>
        )}

        <section
          aria-labelledby="next-steps-heading"
          className={`flex flex-col gap-3 ${faq.length > 0 ? "lg:col-span-4 lg:col-start-9" : "lg:col-span-7"}`}
        >
          <h2 id="next-steps-heading" className="type-display-m">
            Next steps
          </h2>
          <p className="measure type-body">
            Tell us about your fan coil unit and its duty, and we'll talk
            through technical fit and what an evaluation would involve.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button href={product.cta.primary.href} arrow>
              {product.cta.primary.label}
            </Button>
            <Button href={product.cta.secondary.href} variant="secondary">
              {product.cta.secondary.label}
            </Button>
          </div>
          <p className="type-annotation">
            <TextLink href="/contact?type=product">
              Contact engineering
            </TextLink>
          </p>
        </section>
      </ScrollScene>
    </PageTransition>
  );
}
