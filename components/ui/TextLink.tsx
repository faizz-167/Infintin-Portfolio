import type { ReactNode } from "react";
import { RouteLink } from "./RouteLink";

type TextLinkProps = {
  href: string;
  /** Opens in a new tab with an indicator; inferred for absolute http(s) URLs. */
  external?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Underlined with a 1 px rule. On hover a copper rule is drawn left to right
 * over it, and retracts back to the left on hover-out.
 */
export function TextLink({
  href,
  external,
  className,
  children,
}: TextLinkProps) {
  const isExternal = external ?? /^https?:\/\//.test(href);
  const content = (
    <>
      <span className="relative inline-block pb-[0.2em]">
        {children}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px bg-current opacity-40"
        />
        <span
          aria-hidden="true"
          className="wipe-x absolute inset-x-0 bottom-0 h-px bg-accent group-hover:wipe-on"
        />
      </span>
      {isExternal && (
        <>
          <span aria-hidden="true" className="ml-[0.2em] inline-block">
            ↗
          </span>
          <span className="sr-only"> (opens in a new tab)</span>
        </>
      )}
    </>
  );

  const classes = `group inline ${className ?? ""}`;

  if (isExternal)
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {content}
      </a>
    );

  // mailto:, tel: and other schemes are for the browser, not the router.
  if (!href.startsWith("/") && !href.startsWith("#"))
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );

  return (
    <RouteLink href={href} className={classes}>
      {content}
    </RouteLink>
  );
}
