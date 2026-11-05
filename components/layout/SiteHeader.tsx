"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import { LetterSwap } from "@/components/motion/LetterSwap";
import { Button } from "@/components/ui/Button";
import { RouteLink } from "@/components/ui/RouteLink";
import { company } from "@/data/company";
import { navigation, primaryAction } from "@/data/navigation";
import { useActiveSheet } from "@/lib/sheets";
import { isCurrent } from "./isCurrent";
import { MenuOverlay } from "./MenuOverlay";
import { useEnvUnder } from "./useEnvUnder";

/**
 * Wordmark, three destinations and the one action. Fixed, solid, and inked
 * for whatever environment is passing under its bottom edge. Below `lg` the
 * sheet frame is hidden, so the header carries the current scene name and
 * the destinations move into the menu.
 */
export function SiteHeader() {
  const ref = useRef<HTMLElement>(null);
  const env = useEnvUnder(ref, 0.5, 1);
  const pathname = usePathname();
  const sheet = useActiveSheet();

  return (
    <header
      ref={ref}
      data-env={env}
      // Kept out of the route wipe: the header is the fixed reference the
      // pages move under (see globals.css, view transitions).
      style={{ viewTransitionName: "site-header" }}
      className="fixed inset-x-0 top-0 z-header h-header border-rule border-b"
    >
      <div className="mx-auto flex h-full max-w-page items-center justify-between gap-3 px-margin">
        <RouteLink
          href="/"
          className="flex min-h-target items-center type-annotation text-ink"
        >
          {company.shortName}
        </RouteLink>

        {sheet && (
          <p className="min-w-0 truncate type-annotation text-ink-muted lg:hidden">
            <span className="sr-only">Current sheet: </span>
            {sheet.name}
          </p>
        )}

        <nav aria-label="Main" className="hidden items-center gap-4 lg:flex">
          <ul className="flex items-center gap-3">
            {navigation.map((item) => (
              <li key={item.href}>
                <RouteLink
                  href={item.href}
                  aria-current={
                    isCurrent(pathname, item.href) ? "page" : undefined
                  }
                  className="group relative flex min-h-target items-center type-annotation text-ink"
                >
                  <LetterSwap label={item.label} />
                  <span
                    aria-hidden="true"
                    className="wipe-x absolute inset-x-0 bottom-2 h-px bg-accent group-hover:wipe-on group-aria-[current=page]:wipe-on"
                  />
                </RouteLink>
              </li>
            ))}
          </ul>
          <Button href={primaryAction.href} arrow>
            {primaryAction.label}
          </Button>
        </nav>

        <MenuOverlay className="lg:hidden" />
      </div>
    </header>
  );
}
