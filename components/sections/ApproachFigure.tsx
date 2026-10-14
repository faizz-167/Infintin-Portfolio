"use client";

import { type ReactNode, useEffect, useState } from "react";
import { SceneView } from "@/components/three/SceneView";
import type { PartId } from "@/data/types";
import { useSceneStore } from "@/lib/store";

const VIEW = "engineering";

export type ApproachEntry = {
  id: string;
  title: string;
  text: ReactNode;
  part: PartId | null;
};

/**
 * The approach as a list beside one live view of the motor: choosing an
 * entry isolates the part it is about. The text is the content; the view is
 * a figure for it, so it carries no accessible name of its own. A selectable
 * list rather than a scroll-driven one: the canvas sits behind the page, so
 * a sticky view would have text scrolling over it on phones.
 */
export function ApproachFigure({
  entries,
}: {
  entries: readonly ApproachEntry[];
}) {
  const [selected, setSelected] = useState(entries[0]?.id);
  const dispatch = useSceneStore((s) => s.dispatch);
  const part = entries.find((e) => e.id === selected)?.part ?? null;

  useEffect(() => {
    dispatch(VIEW, part ? { type: "ISOLATE", part } : { type: "CLEAR" });
  }, [dispatch, part]);

  return (
    <div className="grid grid-cols-4 gap-x-gutter gap-y-4 md:grid-cols-6 lg:grid-cols-12">
      <SceneView
        id={VIEW}
        shot="hero"
        poster="hero"
        env="sheet"
        sizes="(min-width: 64rem) 50vw, 100vw"
        className="col-span-full aspect-[4/3] w-full lg:col-span-6 lg:col-start-7 lg:row-start-1"
      />
      <ul className="col-span-full flex flex-col lg:col-span-5 lg:row-start-1">
        {entries.map((entry) => {
          const active = entry.id === selected;
          return (
            <li key={entry.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => setSelected(entry.id)}
                className="group flex w-full cursor-pointer flex-col gap-1 rule-hairline py-3 text-left"
              >
                <span
                  className={`flex items-center gap-1 type-annotation ${active ? "text-accent" : "text-ink-muted group-hover:text-ink"}`}
                >
                  {/* Selection is drawn, never colour alone: a tick on the
                      centre line marks the active entry. */}
                  <span
                    aria-hidden="true"
                    className={`h-px w-3 bg-current transition-transform duration-(--duration-quick) ease-settle origin-left ${active ? "scale-x-100" : "scale-x-0"}`}
                  />
                  {entry.title}
                </span>
                <span className="type-body text-ink">{entry.text}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
