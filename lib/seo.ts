import { claimString } from "@/components/ui/ClaimText";
import { company } from "@/data/company";

/**
 * Placeholder: the current site's domain, until the launch domain is
 * confirmed. Canonicals, the sitemap, robots and share cards all resolve
 * against it.
 */
export const siteUrl = new URL("https://infintin.in");

/**
 * Open Graph fields every page shares. A page's own `openGraph` replaces the
 * parent's object wholesale (an inherited `opengraph-image` file included),
 * so the card lives here and pages that set `openGraph` spread this into it.
 *
 * The card is the hero lab poster cropped to 1200 × 630 (≈3% off top and
 * bottom; letterboxing left seams against the poster's own ground), as JPEG
 * because several share targets reject WebP and `ImageResponse` can't
 * decode it. Re-make it when the poster is re-captured:
 *   magick public/posters/fcu-double-shaft-hero-lab.webp \
 *     -resize '1200x630^' -gravity center -extent 1200x630 -strip \
 *     -quality 85 public/og/fcu-double-shaft.jpg
 */
export const siteOpenGraph = {
  siteName: company.shortName,
  locale: "en_IN",
  type: "website" as const,
  images: [
    {
      url: "/og/fcu-double-shaft.jpg",
      width: 1200,
      height: 630,
      // The poster caption's wording (restates the approved prototype status).
      alt: "Render of prototype assembly",
    },
  ],
};

/**
 * schema.org Organization for the home page. Only approved claims go in; a
 * withheld or pending contact detail is left out rather than published.
 * No Product entity: the motor is a prototype with no offer, and Product
 * markup without one is flagged by Google and would overstate availability.
 */
export function organizationJsonLd(): string {
  const email = claimString("contact.email");
  const telephone = claimString("contact.phone");
  const address = claimString("contact.address");
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.name,
    alternateName: company.shortName,
    url: siteUrl.href,
    description: claimString(company.positioning) ?? undefined,
    email: email ?? undefined,
    telephone: telephone ?? undefined,
    address: address ?? undefined,
  };
  // `<` escaped so claim text can never close the script tag.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
