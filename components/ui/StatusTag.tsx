import type { ReactNode } from "react";

type StatusTagProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Status mark: a hatched swatch beside text. The text carries the meaning;
 * the swatch is never the only signal.
 */
export function StatusTag({ children, className }: StatusTagProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 type-annotation text-ink ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className="size-2 shrink-0 border border-status-mark"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, var(--status-mark) 0 1.5px, transparent 1.5px 4px)",
        }}
      />
      {children}
    </span>
  );
}
