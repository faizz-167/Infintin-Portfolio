"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname } from "next/navigation";
import {
  type MouseEvent,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useLenis } from "@/components/motion/SmoothScroll";
import { useMotionPreference } from "@/components/motion/useMotionPreference";
import { Button } from "@/components/ui/Button";
import { RouteLink } from "@/components/ui/RouteLink";
import { company } from "@/data/company";
import { navigation, primaryAction } from "@/data/navigation";

/** A destination is current on its own route; anchors never are. */
export function isCurrent(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Full-screen menu for narrow screens. A native modal `<dialog>` does the
 * hard parts: focus stays inside, the page behind is inert, and Esc fires
 * `cancel`. Motion animates the sheet in and out; the dialog only closes
 * once the exit has finished, and focus goes back to the Menu button.
 */
export function MenuOverlay({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const lenis = useLenis();
  const pathname = usePathname();
  const { reduced, transition } = useMotionPreference();

  useLayoutEffect(() => {
    const el = dialog.current;
    if (open && el && !el.open) el.showModal();
  }, [open]);

  // Any navigation closes it: a link, back/forward, or a hash change on the
  // same page (which leaves the pathname alone).
  // biome-ignore lint/correctness/useExhaustiveDependencies: closes on every pathname change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("popstate", close);
    window.addEventListener("hashchange", close);
    return () => {
      window.removeEventListener("popstate", close);
      window.removeEventListener("hashchange", close);
    };
  }, []);

  // Scroll lock. Lenis has its own stop; under reduced motion there is no
  // Lenis, so the root stops overflowing instead. Both are undone by cleanup.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const root = document.documentElement;
    root.dataset.menuOpen = "true";
    return () => {
      lenis?.start();
      delete root.dataset.menuOpen;
    };
  }, [open, lenis]);

  const onExitComplete = () => {
    dialog.current?.close();
    trigger.current?.focus();
  };

  // Links close the menu as they're followed, including same-page anchors.
  const onPanelClick = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest("a"))
      setOpen(false);
  };

  const travel = reduced ? { opacity: 0 } : { y: "-100%" };
  const settled = reduced ? { opacity: 1 } : { y: 0 };
  const item = reduced ? { opacity: 0 } : { y: 16, opacity: 0 };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={`flex min-h-target min-w-target cursor-pointer items-center justify-end type-annotation text-ink ${className ?? ""}`}
      >
        Menu
      </button>

      <dialog
        ref={dialog}
        aria-label="Menu"
        // Esc: animate out first; the dialog closes when the exit finishes.
        onCancel={(event) => {
          event.preventDefault();
          setOpen(false);
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-transparent"
      >
        <AnimatePresence onExitComplete={onExitComplete}>
          {open && (
            <motion.div
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
                  onClick={() => setOpen(false)}
                  className="flex min-h-target min-w-target cursor-pointer items-center justify-end type-annotation text-ink"
                >
                  Close
                </button>
              </div>

              <nav aria-label="Main" className="flex flex-1 flex-col px-margin">
                <ul className="flex flex-col">
                  {navigation.map((link, i) => (
                    <motion.li
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
                    </motion.li>
                  ))}
                </ul>
                <motion.div
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
                </motion.div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </dialog>
    </>
  );
}
