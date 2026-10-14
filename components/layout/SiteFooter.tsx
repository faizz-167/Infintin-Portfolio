import { Button } from "@/components/ui/Button";
import { ContactChannels } from "@/components/ui/ContactChannels";
import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";
import { company } from "@/data/company";
import { socials } from "@/data/contact";
import { navigation, primaryAction } from "@/data/navigation";

/**
 * The closing sheet: the one action again, how to reach the company, and
 * the destinations. Always in the Lab environment, so the page ends dark.
 */
export function SiteFooter() {
  return (
    <footer data-env="lab" className="relative z-content">
      <Container className="grid gap-6 py-8 lg:grid-cols-12 lg:gap-gutter">
        <div className="flex flex-col items-start gap-3 lg:col-span-6">
          <h2 className="type-display-l">{primaryAction.label}</h2>
          <Button href={primaryAction.href} size="lg" arrow>
            Start an enquiry
          </Button>
        </div>

        <ContactChannels className="lg:col-span-3" />

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
