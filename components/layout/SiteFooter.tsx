import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { ChannelValue, shownChannels } from "@/components/ui/ContactChannels";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import { certificates } from "@/data/certificates";
import { company } from "@/data/company";
import { socials } from "@/data/contact";
import { navigation, primaryAction } from "@/data/navigation";

const LABEL = "type-annotation text-ink-muted";
const LIST = "flex flex-col gap-1 type-body";

/**
 * Closes every page: a dark panel on the light page, holding the brand
 * glyph large in paper white, beside three calm link columns, then a strip with the
 * copyright and registrations. The glyph is the footer's one big element,
 * with the approved vision line under it; nothing else competes: no call
 * to action (the header carries it), no product status. The page around it stays paper
 * and the panel is Lab (owner request, 25 Nov 2026).
 */
export function SiteFooter() {
  const channels = shownChannels();
  const registrations = certificates.filter(
    (cert) => claimString(cert.number) !== null,
  );
  const pages = [...navigation, primaryAction];
  const vision = claimString(company.vision) !== null;

  return (
    <footer data-env="sheet" className="relative z-content">
      <Container className="py-8">
        <div data-env="lab" className="bg-ground p-3 md:p-5">
          <div className="grid gap-x-gutter gap-y-5 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-5">
              {/* Paper white, the same as the page around the panel, so the
                  light ground shows through the dark panel as the mark. The
                  logo is a raster, so a mask gives a flat silhouette; an
                  outline isn't possible. */}
              <span
                aria-hidden="true"
                className="block aspect-square w-[min(100%,12rem)] bg-paper md:w-[16rem] lg:w-[min(100%,22rem)]"
                style={{
                  maskImage: "url(/brand/infintin-glyph.png)",
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                }}
              />
              {vision && (
                <p className="measure type-lede text-ink-muted">
                  <ClaimText id={company.vision} />
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-gutter gap-y-4 md:grid-cols-3 lg:col-span-7">
              <nav
                aria-labelledby="footer-pages"
                className="flex flex-col gap-2"
              >
                <h2 id="footer-pages" className={LABEL}>
                  Pages
                </h2>
                <ul className={LIST}>
                  {pages.map((page) => (
                    <li key={page.href}>
                      <TextLink href={page.href}>{page.label}</TextLink>
                    </li>
                  ))}
                </ul>
              </nav>

              {channels.length > 0 && (
                <section
                  aria-labelledby="footer-contact"
                  className="col-span-2 flex flex-col gap-2 md:col-span-1"
                >
                  <h2 id="footer-contact" className={LABEL}>
                    Contact
                  </h2>
                  <ul className={LIST}>
                    {channels.map((channel) => (
                      <li key={channel.kind}>
                        <ChannelValue channel={channel} />
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {socials.length > 0 && (
                <section
                  aria-labelledby="footer-profiles"
                  className="row-start-1 col-start-2 flex flex-col gap-2 md:row-start-auto md:col-start-auto"
                >
                  <h2 id="footer-profiles" className={LABEL}>
                    Profiles
                  </h2>
                  <ul className={LIST}>
                    {socials.map((social) => (
                      <li key={social.href}>
                        <TextLink href={social.href}>{social.label}</TextLink>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 rule-hairline pt-3 md:flex-row md:items-baseline md:justify-between">
            <p className="type-annotation text-ink-muted">© {company.name}</p>
            {registrations.length > 0 && (
              <dl className="flex flex-col gap-1 sm:flex-row sm:gap-x-4">
                {registrations.map((cert) => (
                  <div key={cert.id} className="flex items-baseline gap-1">
                    <dt className="type-annotation text-ink-muted">
                      {cert.register}
                    </dt>
                    <dd className="type-data text-ink">
                      <ClaimText id={cert.number} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
      </Container>
    </footer>
  );
}
