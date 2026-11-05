"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLenis } from "@/components/motion/SmoothScroll";
import { focusPageHeading } from "@/lib/routeFocus";

const loadPanel = () => import("./MenuPanel");
// Client-only: the panel renders nothing until first opened, so there is no
// server HTML to match.
const MenuPanel = dynamic(loadPanel, { ssr: false });

/**
 * Full-screen menu for narrow screens: the Menu button, open state, scroll
 * lock and focus hand-back. The sheet (`MenuPanel`) is fetched on first
 * intent (hover, focus, touch) rather than shipped with the page; a tap
 * that beats the fetch opens it as soon as it lands.
 */
export function MenuOverlay({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  // Mounted on first open and kept, so later opens are instant.
  const [wanted, setWanted] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  // Closed by following a link to another page: focus then belongs to the
  // new page's heading, not the Menu button.
  const leftPage = useRef(false);
  const lenis = useLenis();
  const pathname = usePathname();

  // Any navigation closes it: a link, back/forward, or a hash change on the
  // same page (which leaves the pathname alone).
  // biome-ignore lint/correctness/useExhaustiveDependencies: closes on every pathname change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const close = () => {
      leftPage.current = true;
      setOpen(false);
    };
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

  const prefetch = () => {
    void loadPanel();
  };

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onPointerEnter={prefetch}
        onPointerDown={prefetch}
        onFocus={prefetch}
        onClick={() => {
          setWanted(true);
          setOpen(true);
        }}
        className={`flex min-h-target min-w-target cursor-pointer items-center justify-end type-annotation text-ink ${className ?? ""}`}
      >
        Menu
      </button>

      {wanted && (
        <MenuPanel
          open={open}
          onClose={(toOtherPage) => {
            leftPage.current = toOtherPage;
            setOpen(false);
          }}
          onClosed={() => {
            if (leftPage.current) focusPageHeading();
            else trigger.current?.focus();
            leftPage.current = false;
          }}
        />
      )}
    </>
  );
}
