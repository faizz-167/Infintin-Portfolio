import type { CtaLink, NavItem } from "./types";

// Three destinations plus one action (phase 07.1). Home section anchors are
// fixed here so the scenes in Phase 09 use the same ids.
export const navigation = [
  { label: "Product", href: "/products/fcu-double-shaft" },
  { label: "Engineering", href: "/#engineering" },
  { label: "Contact", href: "/contact" },
] as const satisfies readonly NavItem[];

export const primaryAction = {
  label: "Talk to engineering",
  href: "/contact",
} as const satisfies CtaLink;
