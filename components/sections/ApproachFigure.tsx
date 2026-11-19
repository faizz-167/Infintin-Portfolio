import type { ReactNode } from "react";
import { Photo } from "@/components/ui/Photo";
import { products } from "@/data/products";

export type ApproachEntry = {
  id: string;
  title: string;
  text: ReactNode;
};

/**
 * The approach as a list beside a photograph of the prototype. The photo
 * replaced a live isolate view at the client's request (19 Nov 2026): the
 * real motor says more here than the model, so the list is plain text now,
 * with nothing to select.
 */
export function ApproachFigure({
  entries,
}: {
  entries: readonly ApproachEntry[];
}) {
  const photo =
    products[0].photos.find((p) => p.view === "Three-quarter") ??
    products[0].photos[0];

  return (
    <div className="grid grid-cols-4 gap-x-gutter gap-y-4 md:grid-cols-6 lg:grid-cols-12">
      <Photo
        photo={photo}
        label={photo.view}
        aspect="aspect-[4/3]"
        sizes="(min-width: 64rem) 50vw, 100vw"
        className="col-span-full lg:col-span-6 lg:col-start-7 lg:row-start-1"
      />
      <ul className="col-span-full flex flex-col lg:col-span-5 lg:row-start-1">
        {entries.map((entry) => (
          <li key={entry.id} className="flex flex-col gap-1 rule-hairline py-3">
            <h3 className="type-annotation text-ink-muted">{entry.title}</h3>
            <p className="type-body text-ink">{entry.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
