import type { StageOwner, StageState } from "@/data/types";

const OWNER_LABEL: Record<StageOwner, string> = {
  internal: "In-house",
  external: "With partners",
  shared: "In-house and with partners",
  unconfirmed: "To be confirmed",
};

export const STATE_LABEL: Record<StageState, string> = {
  complete: "Complete",
  current: "Current stage",
  upcoming: "Upcoming",
};

/** Ownership by line style, always beside its label (never style alone). */
export function OwnerMark({ owner }: { owner: StageOwner }) {
  const style = {
    internal: "border-t",
    external: "h-[3px] border-y",
    shared: "h-[3px] border-y border-dashed",
    unconfirmed: "border-t border-dotted",
  }[owner];
  return (
    <span className="flex items-center gap-1 type-caption text-ink-muted">
      <span aria-hidden="true" className={`w-3 border-ink-muted ${style}`} />
      {OWNER_LABEL[owner]}
    </span>
  );
}
