import type { ReactNode } from "react";
import { getClaim } from "@/data/claims";
import type { ClaimId } from "@/data/types";

type ClaimTextProps = {
  id: ClaimId;
  /** Shown when the claim can't be published; nothing renders without it. */
  fallback?: ReactNode;
};

/**
 * Renders a claim from the register. Server component on purpose: the
 * register never reaches the browser, so unapproved drafts can't leak
 * through a client bundle.
 *
 * Production renders `approved` only. Development also renders `pending`,
 * marked, so layouts can be designed with real copy. `withheld` never
 * renders, in any environment.
 */
export function ClaimText({ id, fallback = null }: ClaimTextProps) {
  const claim = getClaim(id);

  if (claim.status === "approved") return claim.text;

  if (process.env.NODE_ENV === "development") {
    return (
      <span
        title={`Claim ${id} (${claim.status})`}
        className="outline-1 outline-dashed outline-offset-2 outline-status-mark"
      >
        {claim.status === "pending" ? claim.text : fallback}
        <span className="ml-1 type-caption text-ink-muted">
          {claim.status === "pending" ? "pending approval" : `withheld: ${id}`}
        </span>
      </span>
    );
  }

  return fallback;
}
