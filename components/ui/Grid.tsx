import type { ReactNode } from "react";

type GridProps = {
  as?: "div" | "section" | "ul" | "ol" | "dl";
  /**
   * Inherit the parent grid's columns instead of defining new ones, so rows
   * nested inside a card or list stay aligned to the page grid.
   */
  subgrid?: boolean;
  className?: string;
  children: ReactNode;
};

/** 4 columns on phones, 6 from `md`, 12 from `lg`. Spans are set by children. */
export function Grid({
  as: Tag = "div",
  subgrid = false,
  className,
  children,
}: GridProps) {
  const columns = subgrid
    ? "col-span-full grid-cols-subgrid"
    : "grid-cols-4 gap-x-gutter md:grid-cols-6 lg:grid-cols-12";
  return <Tag className={`grid ${columns} ${className ?? ""}`}>{children}</Tag>;
}
