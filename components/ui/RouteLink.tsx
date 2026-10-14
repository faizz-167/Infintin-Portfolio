"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { transitionTypesFor } from "@/components/layout/routeDirection";

type RouteLinkProps = ComponentProps<typeof Link> & { href: string };

/**
 * `next/link` that tags the navigation with its direction along the site
 * (home → product → contact), so the route wipe knows which way to run.
 * Every internal link goes through here; nobody picks a direction by hand.
 */
export function RouteLink({ href, transitionTypes, ...props }: RouteLinkProps) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      transitionTypes={transitionTypes ?? transitionTypesFor(pathname, href)}
      {...props}
    />
  );
}
