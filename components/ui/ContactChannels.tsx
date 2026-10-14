import { ClaimText } from "@/components/ui/ClaimText";
import { TextLink } from "@/components/ui/TextLink";
import { getClaim } from "@/data/claims";
import { contactChannels } from "@/data/contact";
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
 * Email, phone and address as a definition list. Production shows approved
 * channels only (nothing at all when none are); development shows pending
 * ones marked, through ClaimText, so layouts can be judged with real copy.
 */
export function ContactChannels({ className }: { className?: string }) {
  const channels = contactChannels.filter(
    (channel) =>
      getClaim(channel.value).status === "approved" ||
      process.env.NODE_ENV === "development",
  );
  if (channels.length === 0) return null;

  return (
    <dl className={`flex flex-col gap-2 ${className ?? ""}`}>
      {channels.map((channel) => {
        const approved = getClaim(channel.value).status === "approved";
        const href = approved ? channelHref(channel) : null;
        return (
          <div key={channel.kind}>
            <dt className="type-annotation text-ink-muted">{channel.label}</dt>
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
  );
}
