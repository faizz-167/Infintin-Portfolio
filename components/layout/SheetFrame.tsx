"use client";

import { type ReactNode, useRef } from "react";
import { TitleBlock } from "@/components/ui/TitleBlock";
import { useActiveSheet } from "@/lib/sheets";
import { useEnvUnder } from "./useEnvUnder";

/**
 * The drawing border: a hairline frame inset from the viewport with a live
 * title block in the bottom-right corner (current scene, sheet n of N,
 * status). Desktop only; narrow screens show the scene name in the header.
 * Purely visual and transparent to the pointer.
 */
export function SheetFrame({ status }: { status: ReactNode }) {
  const block = useRef<HTMLDivElement>(null);
  const env = useEnvUnder(block, 0.5, 0.5);
  const sheet = useActiveSheet();

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
