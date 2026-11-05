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
import { enquiryTypes } from "@/data/contact";
import { siteOpenGraph } from "@/lib/seo";

export const ensureStatic = "navigation";

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
 * One sheet: how to reach us and what happens next on the left, the
 * enquiry form on the right. Direct channels stay visible beside the form,
 * since online submission isn't connected yet (Phase 12).
 */
export default function ContactPage() {
  const email = claimString("contact.email");

  return (
    <PageTransition>
      <ScrollScene
        id="contact"
        sheet="Contact"
        env="sheet"
        className="grid gap-x-gutter gap-y-6 px-margin pt-[calc(var(--spacing-header)+var(--spacing-6))] pb-scene lg:grid-cols-12"
      >
        <div className="flex flex-col gap-5 lg:col-span-4">
          <div className="flex flex-col gap-3">
            <h1 className="type-display-l">Talk to our engineers</h1>
            <p className="measure type-lede">
              Tell us about your unit, its duty and what you need. We'll talk
              through technical fit and what an evaluation would involve.
            </p>
          </div>

          <ContactChannels />

          <section
            aria-labelledby="topics-heading"
            className="flex flex-col gap-2"
          >
            <h2 id="topics-heading" className="type-annotation text-ink-muted">
              What you can write to us about
            </h2>
            <ul className="flex flex-col">
              {enquiryTypes.map((type) => (
                <li key={type.id} className="rule-hairline py-1 type-body">
                  {type.label}
                </li>
              ))}
            </ul>
          </section>

          <section
            aria-labelledby="next-heading"
            className="flex flex-col gap-2"
          >
            <h2 id="next-heading" className="type-annotation text-ink-muted">
              What happens next
            </h2>
            <p className="measure type-body">
              Your enquiry goes to our engineering team. If there's a fit, the
              next step is usually a call about your unit and, where it makes
              sense, an evaluation.
            </p>
          </section>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          {/* The fallback is the same form without a type chosen, so the
              prerendered page has a working form before the params resolve. */}
          <Suspense fallback={<EnquiryForm email={email} />}>
            <EnquiryFormFromLink email={email} />
          </Suspense>
        </div>
      </ScrollScene>
    </PageTransition>
  );
}
