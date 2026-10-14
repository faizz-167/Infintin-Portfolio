"use client";

import type { ReactNode } from "react";
import { Balloon } from "@/components/ui/Balloon";
import { fcuDoubleShaftParts } from "@/data/parts/fcu-double-shaft";
import type { PartId } from "@/data/types";
import { useSceneStore } from "@/lib/store";
import type { PartName } from "./partNames";

const byBalloon = fcuDoubleShaftParts.toSorted((a, b) => a.balloon - b.balloon);

/**
 * The accessible equivalent of the 3D view: every part, numbered like its
 * balloon. Hover or focus highlights the part in 3D; activating isolates it
 * (again to clear). 3D hover highlights the row back.
 */
export function PartsList({
  viewId,
  names,
}: {
  viewId: string;
  names: readonly PartName[];
}) {
  const isolated = useSceneStore(
    (s) => s.views[viewId]?.explorer.isolated ?? null,
  );
  const hovered = useSceneStore((s) => s.views[viewId]?.hovered ?? null);
  const dispatch = useSceneStore((s) => s.dispatch);
  const setHovered = useSceneStore((s) => s.setHovered);
  const nameOf = (id: PartId): ReactNode =>
    names.find((n) => n.id === id)?.name;

  return (
    <ol aria-label="Parts" className="flex flex-col">
      {byBalloon.map((part) => {
        const selected = isolated === part.id;
        return (
          <li key={part.id}>
            <button
              type="button"
              aria-pressed={selected}
              data-active={selected || hovered === part.id ? "" : undefined}
              onClick={() =>
                dispatch(
                  viewId,
                  selected
                    ? { type: "CLEAR" }
                    : { type: "ISOLATE", part: part.id },
                )
              }
              onPointerEnter={() => setHovered(viewId, part.id)}
              onPointerLeave={() => setHovered(viewId, null)}
              onFocus={() => setHovered(viewId, part.id)}
              onBlur={() => setHovered(viewId, null)}
              className="group flex min-h-target w-full cursor-pointer items-center gap-2 border-rule border-b px-1 text-left type-annotation text-ink data-active:text-accent"
            >
              <Balloon
                number={part.balloon}
                className="group-data-active:text-accent"
              />
              <span>{nameOf(part.id)}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
