"use client";

import { type ReactNode, useRef } from "react";
import { TitleBlock } from "@/components/ui/TitleBlock";
import { useActiveSheet } from "@/lib/sheets";
import { useContentUnder } from "./useContentUnder";
import { useEnvUnder } from "./useEnvUnder";

/**
 * The drawing border: a hairline frame inset from the viewport with a live
 * title block in the bottom-right corner (current scene, sheet n of N,
 * status). Desktop only; narrow screens show the scene name in the header.
 * Purely visual and transparent to the pointer.
 *
 * The title block never covers the page: it fades out while text or a
 * control is under it and returns once the corner is clear. Reserving the
 * corner can't work on a scrolling page, where every line passes through it.
 */
export function SheetFrame({ status }: { status: ReactNode }) {
  const block = useRef<HTMLDivElement>(null);
  const env = useEnvUnder(block, 0.5, 0.5);
  const sheet = useActiveSheet();
  const covered = useContentUnder(block);

  return (
    <div
      aria-hidden="true"
      style={{ viewTransitionName: "site-frame" }}
      // One mid-grey for the frame line: it crosses both environments at
      // once during a section sweep, so it can't take either one's ink.
      className="pointer-events-none fixed inset-x-2 top-[calc(var(--spacing-header)+0.5rem)] bottom-2 z-annotations hidden border border-lead/40 lg:block"
    >
      <div
        ref={block}
        data-env={env}
        // Overlaps the frame line by a pixel so the borders coincide.
        className={`absolute -right-px -bottom-px ${sheet ? "" : "invisible"}`}
        style={{
          opacity: covered ? 0 : 1,
          // Out at once, back after a beat: content scrolling through the
          // corner shouldn't make the block flicker between lines.
          transition: covered
            ? "opacity var(--duration-instant) var(--ease-settle)"
            : "opacity var(--duration-quick) var(--ease-settle) var(--duration-base)",
        }}
      >
        <TitleBlock
          sheetName={sheet?.name ?? ""}
          sheet={sheet?.number ?? 0}
          sheetCount={sheet?.count ?? 0}
          status={status}
        />
      </div>
    </div>
  );
}
