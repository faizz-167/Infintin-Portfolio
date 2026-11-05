"use client";

import { AnimatePresence, m } from "framer-motion";
import { usePathname } from "next/navigation";
import { type MouseEvent, useLayoutEffect, useRef } from "react";
import { useMotionPreference } from "@/components/motion/useMotionPreference";
import { Button } from "@/components/ui/Button";
import { RouteLink } from "@/components/ui/RouteLink";
import { company } from "@/data/company";
import { navigation, primaryAction } from "@/data/navigation";
import { isCurrent } from "./isCurrent";

type Props = {
  open: boolean;
  /** `leftPage`: closed by following a link to another page. */
  onClose: (leftPage: boolean) => void;
  /** The exit animation finished and the dialog is closed. */
  onClosed: () => void;
};

/**
 * The menu sheet itself, split from `MenuOverlay` so it stays out of every
 * route's initial JS (Phase 11 budget); the overlay fetches it on first
 * intent. A native modal `<dialog>` does the hard parts: focus stays inside,
 * the page behind is inert, and Esc fires `cancel`. The dialog only closes
 * once the exit animation has finished.
 */
export default function MenuPanel({ open, onClose, onClosed }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const { reduced, transition } = useMotionPreference();

  useLayoutEffect(() => {
    const el = dialog.current;
    if (open && el && !el.open) el.showModal();
  }, [open]);

  // Links close the menu as they're followed, including same-page anchors.
  const onPanelClick = (event: MouseEvent) => {
    const link =
      event.target instanceof Element ? event.target.closest("a") : null;
    if (!link) return;
    onClose(link.pathname !== window.location.pathname);
  };

  const travel = reduced ? { opacity: 0 } : { y: "-100%" };
  const settled = reduced ? { opacity: 1 } : { y: 0 };
  const item = reduced ? { opacity: 0 } : { y: 16, opacity: 0 };

  return (
    <dialog
      ref={dialog}
      aria-label="Menu"
      // Esc: animate out first; the dialog closes when the exit finishes.
      onCancel={(event) => {
        event.preventDefault();
        onClose(false);
      }}
      className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent"
    >
      <AnimatePresence
        onExitComplete={() => {
          dialog.current?.close();
          onClosed();
        }}
      >
        {open && (
          <m.div
            key="panel"
            data-env="sheet"
            initial={travel}
            animate={settled}
            exit={travel}
            transition={transition("move")}
            onClick={onPanelClick}
            className="flex h-full flex-col"
          >
            {/* Mirrors the header row, so Close sits where Menu was. */}
            <div className="flex h-header shrink-0 items-center justify-between gap-3 border-rule border-b px-margin">
              <RouteLink
                href="/"
                className="flex min-h-target items-center type-annotation text-ink"
              >
                {company.shortName}
              </RouteLink>
              <button
                type="button"
                onClick={() => onClose(false)}
                className="flex min-h-target min-w-target cursor-pointer items-center justify-end type-annotation text-ink"
              >
                Close
              </button>
            </div>

            <nav aria-label="Main" className="flex flex-1 flex-col px-margin">
              <ul className="flex flex-col">
                {navigation.map((link, i) => (
                  <m.li
                    key={link.href}
                    initial={item}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      ...transition("ui"),
                      delay: 0.04 * (i + 1),
                    }}
                    className="border-rule border-b"
                  >
                    <RouteLink
                      href={link.href}
                      aria-current={
                        isCurrent(pathname, link.href) ? "page" : undefined
                      }
                      className="flex min-h-target items-center py-2 type-display-m text-ink aria-[current=page]:text-accent"
                    >
                      {link.label}
                    </RouteLink>
                  </m.li>
                ))}
              </ul>
              <m.div
                initial={item}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  ...transition("ui"),
                  delay: 0.04 * (navigation.length + 1),
                }}
                className="mt-5"
              >
                <Button href={primaryAction.href} size="lg" arrow>
                  {primaryAction.label}
                </Button>
              </m.div>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </dialog>
  );
}
