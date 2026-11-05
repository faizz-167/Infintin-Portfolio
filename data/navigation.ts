import type { CtaLink, NavItem } from "./types";

// Two destinations plus one action. Contact isn't a destination of its own:
// the action already opens the enquiry form, and a "Contact" item beside
// "Talk to engineering" was two names for one place. Home section anchors are
// fixed here so the scenes in Phase 09 use the same ids.
export const navigation = [
  { label: "Product", href: "/products/fcu-double-shaft" },
  { label: "Engineering", href: "/#engineering" },
] as const satisfies readonly NavItem[];

export const primaryAction = {
  label: "Talk to engineering",
  href: "/contact",
} as const satisfies CtaLink;
