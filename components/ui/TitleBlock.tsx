import { StatusTag } from "./StatusTag";

type TitleBlockProps = {
  sheetName: string;
  sheet: number;
  sheetCount: number;
  status: string;
  className?: string;
};

/**
 * Drawing title block: answers "where am I?" with the sheet name, its position
 * in the set, and the product status.
 */
export function TitleBlock({
  sheetName,
  sheet,
  sheetCount,
  status,
  className,
}: TitleBlockProps) {
  return (
    <dl
      className={`grid grid-cols-[auto_auto] border border-rule bg-ground type-annotation ${className ?? ""}`}
    >
      <div className="col-span-full border-b border-rule px-1 py-1">
        <dt className="sr-only">Sheet</dt>
        <dd className="text-ink">{sheetName}</dd>
      </div>
      <div className="border-r border-rule px-1 py-1">
        <dt className="text-ink-muted">Sheet</dt>
        <dd className="type-data text-ink">
          {sheet} of {sheetCount}
        </dd>
      </div>
      <div className="px-1 py-1">
        <dt className="text-ink-muted">Status</dt>
        <dd>
          <StatusTag>{status}</StatusTag>
        </dd>
      </div>
    </dl>
  );
}
