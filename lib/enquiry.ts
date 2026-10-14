import { type EnquiryTypeId, enquiryTypes } from "@/data/contact";

/** Everything the enquiry form collects (PRD §8.7). Optional fields are "" when left blank. */
export interface EnquiryData {
  name: string;
  email: string;
  company: string;
  role: string;
  phone: string;
  type: EnquiryTypeId;
  requirement: string;
  consent: true;
  // Qualifiers, folded under "Add technical details".
  application: string;
  power: string;
  quantity: string;
  location: string;
  timeline: string;
  /** Honeypot. People never see it, so anything here came from a bot; the transport drops it. */
  website: string;
}

export type EnquiryResult =
  | { ok: true }
  | { ok: false; reason: "not-connected" | "failed" };

/**
 * Where an enquiry goes. The form only knows this interface, so Phase 12
 * swaps the delivery without touching the UI. `ok: true` means the receiving
 * end confirmed it; nothing else may produce it.
 */
export interface EnquiryTransport {
  submit(data: EnquiryData): Promise<EnquiryResult>;
}

/**
 * Delivery hasn't been decided (recipient, storage and retention are open
 * with the client), so every submission reports that honestly instead of
 * pretending it was sent.
 */
const notConnected: EnquiryTransport = {
  submit: async () => ({ ok: false, reason: "not-connected" }),
};

export const enquiryTransport: EnquiryTransport = notConnected;

// ---------------------------------------------------------------- Rules

export const requiredRule =
  (message: string) =>
  (value: string): string | null =>
    value.trim() === "" ? message : null;

export function emailRule(value: string): string | null {
  if (value.trim() === "") return "Enter your work email.";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
    ? null
    : "Enter an email address like name@company.com.";
}

/** Optional, but if given it has to be diallable: digits with the usual separators. */
export function phoneRule(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const digits = trimmed.replace(/\D/g, "").length;
  return /^\+?[\d\s()-]+$/.test(trimmed) && digits >= 7 && digits <= 15
    ? null
    : "Enter a phone number like +91 98765 43210.";
}

export function isEnquiryType(value: string | null): value is EnquiryTypeId {
  return enquiryTypes.some((type) => type.id === value);
}

/** The enquiry as plain text, for people to paste into an email while the form can't send. */
export function composeEnquiry(data: EnquiryData): string {
  const typeLabel =
    enquiryTypes.find((type) => type.id === data.type)?.label ?? data.type;
  const lines: [string, string][] = [
    ["Name", data.name],
    ["Work email", data.email],
    ["Company", data.company],
    ["Role", data.role],
    ["Phone", data.phone],
    ["Enquiry type", typeLabel],
    ["Application", data.application],
    ["Power range", data.power],
    ["Quantity", data.quantity],
    ["City / state", data.location],
    ["Timeline", data.timeline],
  ];
  return [
    ...lines
      .filter(([, value]) => value.trim() !== "")
      .map(([label, value]) => `${label}: ${value.trim()}`),
    "",
    data.requirement.trim(),
  ].join("\n");
}
