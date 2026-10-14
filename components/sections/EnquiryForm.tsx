"use client";

import { useSearchParams } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Disclosure } from "@/components/ui/Disclosure";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { TextLink } from "@/components/ui/TextLink";
import { type EnquiryTypeId, enquiryTypes } from "@/data/contact";
import {
  composeEnquiry,
  type EnquiryData,
  emailRule,
  enquiryTransport,
  isEnquiryType,
  phoneRule,
  requiredRule,
} from "@/lib/enquiry";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "not-connected"; message: string; data: EnquiryData }
  | { kind: "failed" };

const CONSENT_MESSAGE = "Tick the box so we can reply to you.";

/** Fields with a rule, in the order the summary lists them. */
const CHECKED = [
  "name",
  "email",
  "company",
  "phone",
  "type",
  "requirement",
  "consent",
] as const;
type Checked = (typeof CHECKED)[number];

const RULES: Record<Checked, (value: string) => string | null> = {
  name: requiredRule("Enter your name."),
  email: emailRule,
  company: requiredRule("Enter your company or organisation."),
  phone: phoneRule,
  type: requiredRule("Choose the kind of enquiry."),
  requirement: requiredRule("Tell us about your application or requirement."),
  // An unticked box submits nothing, so it reads as "".
  consent: requiredRule(CONSENT_MESSAGE),
};

type Errors = Partial<Record<Checked, string>>;

const fieldId = (name: string) => `enquiry-${name}`;

const typeOptions = enquiryTypes.map((t) => ({ value: t.id, label: t.label }));
const applicationOptions = [
  { value: "FCU", label: "Fan coil unit (FCU)" },
  { value: "AHU", label: "Air handling unit (AHU)" },
  { value: "Other", label: "Other" },
];

function text(form: FormData, name: string): string {
  const value = form.get(name);
  return typeof value === "string" ? value : "";
}

function mailto(email: string, data: EnquiryData, message: string) {
  const subject = `Enquiry from ${data.company.trim()}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

/**
 * The enquiry form (PRD §8.7). Uncontrolled fields, so values survive every
 * failed submit and a page hidden under `<Activity>`. Validation runs on
 * blur per field and on submit for all of them; a failed submit lists the
 * errors at the top, linked to their fields, and moves focus there.
 *
 * Sending goes through `enquiryTransport`. The success state exists for the
 * transport that can confirm delivery (Phase 12); nothing else reaches it.
 */
export function EnquiryForm({
  email,
  defaultType,
}: {
  /** Approved enquiry address, or null while it isn't approved. */
  email: string | null;
  defaultType?: EnquiryTypeId;
}) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  // Bumped on each failed submit, so focus moves to the summary every time.
  const [attempt, setAttempt] = useState(0);
  const [copied, setCopied] = useState(false);
  const summary = useRef<HTMLElement>(null);
  const result = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (attempt > 0) summary.current?.focus();
  }, [attempt]);

  // Status and error messages belong to the visit that produced them: when
  // `<Activity>` hides the page they go. The fields keep their drafts.
  useLayoutEffect(
    () => () => {
      setStatus({ kind: "idle" });
      setErrors({});
      setCopied(false);
    },
    [],
  );

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status.kind === "submitting") return;
    const formElement = event.currentTarget;
    const form = new FormData(formElement);

    const found: Errors = {};
    for (const name of CHECKED) {
      const message = RULES[name](text(form, name));
      if (message) found[name] = message;
    }
    const type = text(form, "type");
    if (Object.keys(found).length > 0 || !isEnquiryType(type)) {
      setErrors(found);
      setStatus({ kind: "idle" });
      setAttempt((n) => n + 1);
      return;
    }

    setErrors({});
    setCopied(false);
    const data: EnquiryData = {
      name: text(form, "name"),
      email: text(form, "email").trim(),
      company: text(form, "company"),
      role: text(form, "role"),
      phone: text(form, "phone"),
      type,
      requirement: text(form, "requirement"),
      consent: true,
      application: text(form, "application"),
      power: text(form, "power"),
      quantity: text(form, "quantity"),
      location: text(form, "location"),
      timeline: text(form, "timeline"),
      website: text(form, "website"),
    };

    setStatus({ kind: "submitting" });
    const outcome = await enquiryTransport.submit(data);
    if (outcome.ok) {
      // Delivered, so the draft has done its job.
      formElement.reset();
      setStatus({ kind: "success" });
    } else if (outcome.reason === "not-connected") {
      setStatus({ kind: "not-connected", message: composeEnquiry(data), data });
    } else {
      setStatus({ kind: "failed" });
    }
  };

  useEffect(() => {
    if (status.kind === "not-connected" || status.kind === "failed") {
      result.current?.scrollIntoView({ block: "nearest" });
    }
  }, [status.kind]);

  const copy = async (message: string) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
    } catch {
      // Clipboard refused (permissions, insecure origin): the text is
      // selectable in the box above, so say so rather than fail silently.
      setCopied(false);
      result.current?.querySelector("textarea")?.select();
    }
  };

  const errorList = CHECKED.flatMap((name) => {
    const message = errors[name];
    return message ? [{ name, message }] : [];
  });

  return (
    <form
      method="post"
      noValidate
      onSubmit={onSubmit}
      aria-labelledby="enquiry-heading"
      className="flex flex-col gap-4"
    >
      <h2 id="enquiry-heading" className="type-display-m">
        Send an enquiry
      </h2>

      {errorList.length > 0 && (
        <section
          ref={summary}
          tabIndex={-1}
          aria-labelledby="enquiry-errors"
          className="flex flex-col gap-1 border-accent border-l-2 pl-2 outline-none"
        >
          <h3 id="enquiry-errors" className="type-annotation text-ink">
            {errorList.length === 1
              ? "One thing to fix before sending:"
              : `${errorList.length} things to fix before sending:`}
          </h3>
          <ul className="flex flex-col gap-1">
            {errorList.map(({ name, message }) => (
              <li key={name}>
                {/* A plain anchor: focusing the control is the point, and
                    a fragment alone scrolls to it without focusing. */}
                <a
                  href={`#${fieldId(name)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const field = document.getElementById(fieldId(name));
                    field?.focus();
                    field?.scrollIntoView({ block: "center" });
                  }}
                  className="type-body text-ink underline decoration-accent underline-offset-4"
                >
                  {message}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-x-gutter gap-y-2 md:grid-cols-2">
        <Field
          id={fieldId("name")}
          label="Name"
          name="name"
          required
          autoComplete="name"
          validate={RULES.name}
          error={errors.name}
        />
        <Field
          id={fieldId("email")}
          label="Work email"
          name="email"
          type="email"
          required
          autoComplete="email"
          validate={RULES.email}
          error={errors.email}
        />
        <Field
          id={fieldId("company")}
          label="Company or organisation"
          name="company"
          required
          autoComplete="organization"
          validate={RULES.company}
          error={errors.company}
        />
        <Field
          id={fieldId("role")}
          label="Role or department"
          name="role"
          autoComplete="organization-title"
        />
        <Field
          id={fieldId("phone")}
          label="Phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          validate={RULES.phone}
          error={errors.phone}
        />
        <Select
          id={fieldId("type")}
          label="Enquiry type"
          name="type"
          required
          placeholder="Choose one"
          options={typeOptions}
          defaultValue={defaultType}
          validate={RULES.type}
          error={errors.type}
        />
        <Field
          id={fieldId("requirement")}
          label="Application or requirement"
          name="requirement"
          multiline
          required
          help="A few lines on your unit, its duty and what you need from us."
          validate={RULES.requirement}
          error={errors.requirement}
          className="md:col-span-2"
        />
      </div>

      <Disclosure summary="Add technical details (optional)">
        <div className="grid gap-x-gutter gap-y-2 pt-2 md:grid-cols-2">
          <Select
            label="Application type"
            name="application"
            placeholder="Choose one"
            options={applicationOptions}
          />
          <Field
            label="Motor power range"
            name="power"
            help="In watts, if you know it."
          />
          <Field label="Approximate quantity or scale" name="quantity" />
          <Field
            label="City and state"
            name="location"
            autoComplete="address-level2"
          />
          <Field
            label="Desired evaluation timeline"
            name="timeline"
            className="md:col-span-2"
          />
        </div>
      </Disclosure>

      {/* Honeypot: off-screen and out of the tab order, so only bots fill it. */}
      <div
        aria-hidden="true"
        className="absolute -left-[100vw] size-px overflow-hidden"
      >
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <Checkbox
        id={fieldId("consent")}
        name="consent"
        required
        requiredMessage={CONSENT_MESSAGE}
        error={errors.consent}
      >
        Infintin may contact me about this enquiry
      </Checkbox>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" size="lg" disabled={status.kind === "submitting"}>
          {status.kind === "submitting" ? "Sending…" : "Send enquiry"}
        </Button>
      </div>

      {/* Always in the DOM, so screen readers announce what lands in it. */}
      <div ref={result} aria-live="polite">
        {status.kind === "success" && (
          <p className="measure type-body">
            Thank you. Your enquiry has reached our engineering team.
          </p>
        )}
        {status.kind === "submitting" && (
          <p className="sr-only">Sending your enquiry…</p>
        )}
        {status.kind === "failed" && (
          <p className="measure type-body">
            We couldn't send your enquiry. Everything you entered is still here;
            please try again in a moment.
          </p>
        )}
        {status.kind === "not-connected" && (
          <div className="flex flex-col gap-2 border-status-mark border-l-2 pl-2">
            <p className="measure type-body">
              Online submission isn't available yet.{" "}
              {email ? (
                <>
                  Email us at{" "}
                  <TextLink href={mailto(email, status.data, status.message)}>
                    {email}
                  </TextLink>{" "}
                  — your message is ready to copy below.
                </>
              ) : (
                "Your message is ready to copy below."
              )}
            </p>
            <label htmlFor="enquiry-composed" className="sr-only">
              Your enquiry, ready to copy
            </label>
            <textarea
              id="enquiry-composed"
              readOnly
              value={status.message}
              rows={8}
              className="w-full rounded-xs border border-ink-muted bg-ground px-2 py-1 type-data text-ink"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" onClick={() => copy(status.message)}>
                Copy message
              </Button>
              {copied && (
                <span className="type-caption text-ink-muted">Copied</span>
              )}
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

/**
 * The form with its enquiry type chosen from `?type=` (links across the
 * site open it that way). Must sit inside `<Suspense>`: reading search
 * params would otherwise opt the whole page out of prerendering.
 */
export function EnquiryFormFromLink({ email }: { email: string | null }) {
  const type = useSearchParams().get("type");
  return (
    <EnquiryForm
      email={email}
      defaultType={isEnquiryType(type) ? type : undefined}
    />
  );
}
