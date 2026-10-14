import { claimString } from "@/components/ui/ClaimText";
import { processOwnershipClaim } from "@/data/process";
import { ProcessStage } from "./ProcessStage";

/** Sheet 05, server side: whether the ownership split may be shown. */
export function Process() {
  return (
    <ProcessStage showOwners={claimString(processOwnershipClaim) !== null} />
  );
}
