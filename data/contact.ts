import type { ContactChannel, EnquiryType, SocialLink } from "./types";

export const contactChannels = [
  { kind: "email", label: "Email", value: "contact.email" },
  { kind: "phone", label: "Phone", value: "contact.phone" },
  { kind: "address", label: "Address", value: "contact.address" },
] as const satisfies readonly ContactChannel[];

// The company's public profiles, supplied by the client. The footer and the
// Organization JSON-LD (`sameAs`) both read this list; it hides while empty.
export const socials: readonly SocialLink[] = [
  { label: "LinkedIn", href: "https://in.linkedin.com/company/infintin" },
];

// PRD §8.7. The id is the `?type=` value used to pre-select a type.
export const enquiryTypes = [
  { id: "product", label: "Product enquiry" },
  { id: "oem-integration", label: "OEM integration" },
  { id: "pilot", label: "Paid PoC / pilot" },
  { id: "distribution", label: "Distribution / supply" },
  { id: "partnership", label: "Partnership" },
  { id: "investor", label: "Investor enquiry" },
  { id: "other", label: "Other" },
] as const satisfies readonly EnquiryType[];

export type EnquiryTypeId = (typeof enquiryTypes)[number]["id"];
