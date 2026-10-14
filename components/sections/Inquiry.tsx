import { ScrollScene } from "@/components/motion/ScrollScene";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Button } from "@/components/ui/Button";
import { CentreLine } from "@/components/ui/CentreLine";
import { claimString } from "@/components/ui/ClaimText";
import { TextLink } from "@/components/ui/TextLink";
import type { EnquiryTypeId } from "@/data/contact";

const contactFor = (type: EnquiryTypeId) => `/contact?type=${type}`;

/**
 * Sheet 09, the last. A short statement and two ways in, each opening the
 * contact form with its enquiry type chosen. Plain links, so they work
 * without JavaScript. The shaft centre line ends here, as the rule under
 * the actions.
 */
export function Inquiry() {
  const email = claimString("contact.email");

  return (
    <ScrollScene
      id="inquiry"
      sheet="Inquiry"
      env="sheet"
      className="flex flex-col gap-5 px-margin py-scene"
    >
      <SplitHeadline className="type-display-l lg:w-3/4">
        Have a fan coil unit programme in mind?
      </SplitHeadline>
      <p className="measure type-lede">
        Start with a conversation with our engineers about your unit, its duty
        and what an evaluation would need.
      </p>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button href={contactFor("pilot")} size="lg" arrow>
            Discuss a pilot
          </Button>
          <Button
            href={contactFor("oem-integration")}
            variant="secondary"
            size="lg"
          >
            Talk to engineering
          </Button>
        </div>
        {/* The centre line that runs through the page, ending in a stop. */}
        <div aria-hidden="true" className="flex items-center">
          <CentreLine className="flex-1" />
          <span className="h-3 w-px bg-ink-muted" />
        </div>
        {email && (
          <p className="type-annotation text-ink-muted">
            Or write to{" "}
            <TextLink href={`mailto:${email}`} className="text-ink">
              {email}
            </TextLink>
          </p>
        )}
      </div>
    </ScrollScene>
  );
}
