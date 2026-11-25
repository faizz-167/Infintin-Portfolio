import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTransition } from "@/components/layout/PageTransition";
import { ScrollScene } from "@/components/motion/ScrollScene";
import {
  EnquiryForm,
  EnquiryFormFromLink,
} from "@/components/sections/EnquiryForm";
import { claimString } from "@/components/ui/ClaimText";
import { ContactChannels } from "@/components/ui/ContactChannels";
import { siteOpenGraph } from "@/lib/seo";

export const ensureStatic = "navigation";

const NEXT_STEPS = [
  "Your enquiry reaches our engineering team.",
  "If there's a fit, we arrange a call about your unit.",
  "Where it makes sense, we plan an evaluation with you.",
] as const;

const DESCRIPTION =
  "Talk to Infintin's engineers about a fan coil unit programme, an OEM integration or a pilot.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    ...siteOpenGraph,
    title: "Contact",
    description: DESCRIPTION,
    url: "/contact",
  },
};

/**
 * One sheet. The heading and intro across the top; below, the form, with
 * the direct channels and what happens next beside it, in view while the
 * form scrolls. Email and phone stay beside the form since online
 * submission isn't connected yet (Phase 12). The enquiry types live in the
 * form's own field, not in a second list.
 */
export default function ContactPage() {
  const email = claimString("contact.email");

  return (
    <PageTransition>
      <ScrollScene
        id="contact"
        sheet="Contact"
        env="sheet"
        // The form is the end of the page: a shorter close than a scene's.
        className="flex flex-col gap-6 px-margin pt-[calc(var(--spacing-header)+var(--spacing-6))] pb-9"
      >
        <div className="grid gap-x-gutter gap-y-3 lg:grid-cols-12 lg:items-end">
          <h1 className="type-display-l lg:col-span-7">
            Talk to our engineers
          </h1>
          <p className="measure type-lede lg:col-span-5">
            Tell us about your unit, its duty and what you need. We'll talk
            through technical fit and what an evaluation would involve.
          </p>
        </div>

        <div className="grid gap-x-gutter gap-y-7 border-rule border-t pt-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {/* The fallback is the same form without a type chosen, so the
                prerendered page has a working form before the params resolve. */}
            <Suspense fallback={<EnquiryForm email={email} />}>
              <EnquiryFormFromLink email={email} />
            </Suspense>
          </div>

          <aside
            aria-label="Other ways to reach us"
            className="lg:col-span-3 lg:col-start-10"
          >
            <div className="flex flex-col gap-6 lg:sticky lg:top-[calc(var(--spacing-header)+var(--spacing-4))]">
              <section
                aria-labelledby="direct-heading"
                className="flex flex-col gap-2"
              >
                <h2
                  id="direct-heading"
                  className="type-annotation text-ink-muted"
                >
                  Or write or call directly
                </h2>
                <ContactChannels only={["email", "phone"]} size="lede" />
              </section>

              <section
                aria-labelledby="next-heading"
                className="flex flex-col gap-2"
              >
                <h2
                  id="next-heading"
                  className="type-annotation text-ink-muted"
                >
                  What happens next
                </h2>
                {/* Numbered because it is a sequence. */}
                <ol className="flex flex-col">
                  {NEXT_STEPS.map((step, index) => (
                    <li
                      key={step}
                      className="grid grid-cols-[2rem_1fr] gap-x-1 border-rule border-t py-2 type-body"
                    >
                      <span className="type-data text-ink-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          </aside>
        </div>
      </ScrollScene>
    </PageTransition>
  );
}
