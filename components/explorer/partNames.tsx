import type { ReactNode } from "react";
import { ClaimText } from "@/components/ui/ClaimText";
import { fcuDoubleShaftParts } from "@/data/parts/fcu-double-shaft";
import type { PartId } from "@/data/types";

export interface PartName {
  id: PartId;
  name: ReactNode;
}

/**
 * Part names, resolved on the server through the claims register and handed
 * to the client explorer as rendered nodes, so unapproved names never reach
 * the browser. Until a name is approved, production shows the item number.
 */
export function partNames(): PartName[] {
  return fcuDoubleShaftParts.map((part) => ({
    id: part.id,
    name: <ClaimText id={part.label} fallback={`Item ${part.balloon}`} />,
  }));
}
