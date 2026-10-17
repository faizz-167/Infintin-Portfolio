import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { StatusTag } from "@/components/ui/StatusTag";
import { PRODUCT_NAME_FALLBACK, products } from "@/data/products";
import { PortfolioStage } from "./PortfolioStage";
import { portfolioCallouts } from "./portfolioCallouts";

/**
 * Sheet 03, server side. The FCU motor is the only product; a second one
 * joins the portfolio here once its data exists and is approved, never as an
 * empty slot. A callout whose claim is not approved is not drawn at all.
 */
export function Portfolio() {
  const product = products[0];
  return (
    <PortfolioStage
      name={claimString(product.name) ?? PRODUCT_NAME_FALLBACK}
      overview={
        claimString(product.overview) === null ? null : (
          <ClaimText id={product.overview} />
        )
      }
      status={
        <StatusTag>
          <ClaimText id={product.status} />
        </StatusTag>
      }
      callouts={portfolioCallouts
        .filter((callout) => claimString(callout.claim) !== null)
        .map((callout) => ({
          ...callout,
          note: <ClaimText id={callout.claim} />,
        }))}
      href={`/products/${product.slug}`}
    />
  );
}
