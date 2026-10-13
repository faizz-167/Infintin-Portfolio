import type { Metadata } from "next";
import { ClaimText } from "@/components/ui/ClaimText";
import { Container } from "@/components/ui/Container";
import type { ClaimId } from "@/data/types";

export const metadata: Metadata = {
  title: "Claim gating check",
  robots: { index: false, follow: false },
};

// Unlike /system this page builds in production: `npm run claims:check`
// searches its prerendered output to prove that only approved claims render.
// One claim of each status, with and without a fallback.
const SAMPLES: readonly { id: ClaimId; fallback?: string }[] = [
  { id: "product.power-range" },
  { id: "product.status" },
  { id: "product.name" },
  { id: "product.noise" },
  { id: "team.augustine.name" },
  {
    id: "product.energy-saving",
    fallback: "Contact engineering for current technical details",
  },
  { id: "product.payback" },
  { id: "company.indigenous" },
];

export default function ClaimsCheckPage() {
  return (
    <Container className="flex flex-col gap-4 py-8">
      <h1 className="type-display-m">Claim gating</h1>
      <dl className="flex flex-col gap-2">
        {SAMPLES.map(({ id, fallback }) => (
          <div key={id} className="flex flex-col gap-1 rule-hairline py-1">
            <dt className="type-annotation text-ink-muted">{id}</dt>
            <dd className="type-body">
              <ClaimText id={id} fallback={fallback} />
            </dd>
          </div>
        ))}
      </dl>
    </Container>
  );
}
