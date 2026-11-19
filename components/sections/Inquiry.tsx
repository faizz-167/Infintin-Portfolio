import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { claimString } from "@/components/ui/ClaimText";
import { RouteLink } from "@/components/ui/RouteLink";
import { primaryAction } from "@/data/navigation";

/**
 * Sheet 09, the last. A short statement and the one way in, the same
 * action as the header's (both old buttons opened the same form; the
 * enquiry type is chosen there). A plain link, so it works without
 * JavaScript. A full-width copper band, like the product page's closing.
 */
export function Inquiry() {
  const email = claimString("contact.email");

  return (
    <ScrollScene
      id="inquiry"
      sheet="Inquiry"
      env="sheet"
      // `!`: the scene's data-env rule sets ground and ink outside Tailwind's layer.
      className="flex flex-col gap-4 bg-copper! px-margin py-9 text-paper! lg:flex-row lg:items-end lg:justify-between"
    >
      <div className="flex flex-col gap-3">
        <SplitHeadline className="type-display-l lg:max-w-[20ch]">
          Have a fan coil unit programme in mind?
        </SplitHeadline>
        <p className="measure type-lede">
          Start with a conversation with our engineers about your unit, its duty
          and what an evaluation would need.
        </p>
        {email && (
          <p className="type-annotation text-paper/80">
            Or write to{" "}
            <a
              href={`mailto:${email}`}
              className="text-paper underline underline-offset-4"
            >
              {email}
            </a>
          </p>
        )}
      </div>
      {/* Inverted: a paper button keeps its contrast on the copper ground. */}
      <RouteLink
        href={primaryAction.href}
        className="inline-flex min-h-target shrink-0 items-center justify-center bg-paper px-4 py-2 type-annotation text-graphite transition-colors duration-(--duration-quick) hover:bg-graphite hover:text-paper"
      >
        {primaryAction.label} →
      </RouteLink>
    </ScrollScene>
  );
}
