import { company } from "@/data/company";

type LogoProps = {
  /** Static height class; the width follows the lockup's 1400 × 392 ratio. */
  className?: string;
};

/**
 * The client's lockup, drawn in the current ink through a CSS mask rather
 * than in its brand blue: the header re-inks for the Sheet and the Lab as
 * they pass under it, and the full-colour lockup's grey "Mobility Solutions"
 * vanishes on the dark Lab. The brand colours stay in the favicon.
 */
export function Logo({ className }: LogoProps) {
  return (
    <span
      role="img"
      aria-label={company.name}
      className={`block aspect-[1400/392] bg-current ${className ?? ""}`}
      style={{
        maskImage: "url(/brand/infintin-logo.png)",
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "left center",
      }}
    />
  );
}
