import { Button } from "@/components/ui/Button";
import { ClaimText } from "@/components/ui/ClaimText";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import { getClaim } from "@/data/claims";
import { company } from "@/data/company";
import { contactChannels, socials } from "@/data/contact";
import { navigation, primaryAction } from "@/data/navigation";
import type { ContactChannel } from "@/data/types";

// Server component: contact details are claims, and the register must stay
// out of client bundles.

/** `mailto:`/`tel:` built from the approved text; addresses aren't links. */
function channelHref(channel: ContactChannel): string | null {
  const { text } = getClaim(channel.value);
  if (channel.kind === "email") return `mailto:${text}`;
  if (channel.kind === "phone") return `tel:${text.replace(/[^\d+]/g, "")}`;
  return null;
}

/**
 * The closing sheet: the one action again, how to reach the company, and
 * the destinations. Always in the Lab environment, so the page ends dark.
 */
export function SiteFooter() {
  // Production shows approved channels only; development shows pending ones
  // marked, through ClaimText, so the layout can be judged with real copy.
  const channels = contactChannels.filter(
    (channel) =>
      getClaim(channel.value).status === "approved" ||
      process.env.NODE_ENV === "development",
  );

  return (
    <footer data-env="lab" className="relative z-content">
      <Container className="grid gap-6 py-8 lg:grid-cols-12 lg:gap-gutter">
        <div className="flex flex-col items-start gap-3 lg:col-span-6">
          <h2 className="type-display-l">{primaryAction.label}</h2>
          <Button href={primaryAction.href} size="lg" arrow>
            Start an enquiry
          </Button>
        </div>

        {channels.length > 0 && (
          <dl className="flex flex-col gap-2 lg:col-span-3">
            {channels.map((channel) => {
              const approved = getClaim(channel.value).status === "approved";
              const href = approved ? channelHref(channel) : null;
              return (
                <div key={channel.kind}>
                  <dt className="type-annotation text-ink-muted">
                    {channel.label}
                  </dt>
                  <dd className="type-body">
                    {href ? (
                      <TextLink href={href} external={false}>
                        <ClaimText id={channel.value} />
                      </TextLink>
                    ) : (
                      <ClaimText id={channel.value} />
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}

        <div className="flex flex-col gap-3 lg:col-span-3">
          <nav aria-label="Footer">
            <ul className="flex flex-col gap-1 type-annotation">
              {navigation.map((item) => (
                <li key={item.href}>
                  <TextLink href={item.href}>{item.label}</TextLink>
                </li>
              ))}
            </ul>
          </nav>
          {socials.length > 0 && (
            <ul
              aria-label="Social profiles"
              className="flex flex-col gap-1 type-annotation"
            >
              {socials.map((social) => (
                <li key={social.href}>
                  <TextLink href={social.href}>{social.label}</TextLink>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="type-caption text-ink-muted lg:col-span-12">
          © {company.name}
        </p>
      </Container>
    </footer>
  );
}
