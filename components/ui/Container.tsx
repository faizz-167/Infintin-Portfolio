import type { ReactNode } from "react";

type ContainerProps = {
  as?: "div" | "section" | "header" | "footer" | "article" | "nav";
  className?: string;
  children: ReactNode;
};

/** Page width with the responsive page margin on both sides. */
export function Container({
  as: Tag = "div",
  className,
  children,
}: ContainerProps) {
  return (
    <Tag className={`mx-auto w-full max-w-page px-margin ${className ?? ""}`}>
      {children}
    </Tag>
  );
}
