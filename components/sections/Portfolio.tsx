import { partNames } from "@/components/explorer/partNames";
import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { type SpecRow, SpecTable } from "@/components/ui/SpecTable";
import { StatusTag } from "@/components/ui/StatusTag";
import { PRODUCT_NAME_FALLBACK, products } from "@/data/products";
import type { ClaimId } from "@/data/types";
import { PortfolioStage } from "./PortfolioStage";

/** A row value, or none (the table then routes to engineering). */
function specValue(id: ClaimId): SpecRow["value"] {
  return claimString(id) === null ? undefined : <ClaimText id={id} />;
}

/**
 * Sheet 03, server side. The FCU motor is the only product; a second one
 * joins the portfolio here once its data exists and is approved, never as an
 * empty slot.
 */
export function Portfolio() {
  const product = products[0];
  return (
    <PortfolioStage
      name={claimString(product.name) ?? PRODUCT_NAME_FALLBACK}
      overview={<ClaimText id={product.overview} />}
      status={
        <StatusTag>
          <ClaimText id={product.status} />
        </StatusTag>
      }
      specs={
        <SpecTable
          rows={[
            { term: "Power range", value: specValue("product.power-range") },
            { term: "Application", value: specValue(product.application) },
            { term: "Status", value: specValue(product.status) },
          ]}
        />
      }
      names={partNames()}
      href={`/products/${product.slug}`}
    />
  );
}
