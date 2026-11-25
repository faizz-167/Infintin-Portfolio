import { ClaimText, claimString } from "@/components/ui/ClaimText";
import { ChannelValue, shownChannels } from "@/components/ui/ContactChannels";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { TextLink } from "@/components/ui/TextLink";
import { certificates } from "@/data/certificates";
import { company } from "@/data/company";
import { socials } from "@/data/contact";
import { navigation, primaryAction } from "@/data/navigation";

// One cell of the title block. The grid's 1 px gaps over a rule-coloured
// ground draw every inner line once; the cells paint the ground back.
const CELL = "flex flex-col gap-1 bg-ground p-3 lg:p-4";
const LABEL = "type-annotation text-ink-muted";

/**
 * The drawing's title block, closing every page: who the company is, how to
 * reach it, where to go, and its registrations, as one framed grid with a
 * heavier outer line, the way a drawing's title block is ruled. There is no
 * call to action here: the header carries the one action on every page, and
 * the home and product pages end with their own. Always in the Lab
 * environment, so the page ends dark.
 */
export function SiteFooter() {
  const channels = shownChannels();
  const registrations = certificates.filter(
    (cert) => claimString(cert.number) !== null,
  );
  const pages = [...navigation, primaryAction];
  const vision = claimString(company.vision) !== null;

  return (
    <footer data-env="lab" className="relative z-content">
      <Container className="py-8">
        <div className="grid gap-px border-(length:--rule-object) border-ink-muted bg-rule md:grid-cols-2 lg:grid-cols-12">
          <div
            className={`${CELL} justify-between gap-5 md:col-span-2 lg:col-span-6 lg:row-span-2`}
          >
            <Logo className="h-[3.5rem] text-ink" />
            {vision && (
              <p className="measure type-lede text-ink-muted">
                <ClaimText id={company.vision} />
              </p>
            )}
          </div>

          {channels.map((channel) => (
            <dl key={channel.kind} className={`${CELL} lg:col-span-3`}>
              <dt className={LABEL}>{channel.label}</dt>
              <dd className="type-body">
                <ChannelValue channel={channel} />
              </dd>
            </dl>
          ))}

          <nav
            aria-labelledby="footer-pages"
            className={`${CELL} lg:col-span-3`}
          >
            <h2 id="footer-pages" className={LABEL}>
              Pages
            </h2>
            <ul className="flex flex-col gap-1 type-body">
              {pages.map((page) => (
                <li key={page.href}>
                  <TextLink href={page.href}>{page.label}</TextLink>
                </li>
              ))}
            </ul>
          </nav>

          {registrations.length > 0 && (
            <section
              aria-labelledby="footer-registrations"
              className={`${CELL} md:col-span-2 lg:col-span-6`}
            >
              <h2 id="footer-registrations" className={LABEL}>
                Registrations
              </h2>
              <dl className="grid gap-x-gutter gap-y-1 sm:grid-cols-2">
                {registrations.map((cert) => (
                  <div key={cert.id}>
                    <dt className="type-caption text-ink-muted">
                      {cert.register}
                    </dt>
                    <dd className="type-data text-ink">
                      <ClaimText id={cert.number} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {socials.length > 0 && (
            <section
              aria-labelledby="footer-profiles"
              className={`${CELL} lg:col-span-3`}
            >
              <h2 id="footer-profiles" className={LABEL}>
                Profiles
              </h2>
              <ul className="flex flex-col gap-1 type-body">
                {socials.map((social) => (
                  <li key={social.href}>
                    <TextLink href={social.href}>{social.label}</TextLink>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className={`${CELL} justify-end lg:col-span-3`}>
            <p className="type-caption text-ink-muted">© {company.name}</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
