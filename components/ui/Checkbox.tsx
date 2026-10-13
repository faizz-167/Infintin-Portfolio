"use client";

import type { ReactNode } from "react";
import { describedBy, FieldMessages } from "./FieldMessages";
import { useFieldValidation } from "./useFieldValidation";

type CheckboxProps = {
  name: string;
  children: ReactNode;
  required?: boolean;
  defaultChecked?: boolean;
  help?: string;
  /** Message shown when a required box is left unchecked. */
  requiredMessage?: string;
  error?: string;
  className?: string;
};

/** Square checkbox; the whole label row is the 44 px target. */
export function Checkbox({
  name,
  children,
  required,
  defaultChecked,
  help,
  requiredMessage = "Please tick this box to continue.",
  error: formError,
  className,
}: CheckboxProps) {
  // Checkbox state is mapped to "on" / "" so it shares the text-field rule.
  const v = useFieldValidation(
    required ? (value) => (value === "on" ? null : requiredMessage) : undefined,
    formError,
  );
  const value = (checked: boolean) => (checked ? "on" : "");

  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label
        htmlFor={v.id}
        className="flex min-h-target cursor-pointer items-center gap-2 type-annotation text-ink"
      >
        <span className="relative grid size-3 shrink-0 place-items-center">
          <input
            id={v.id}
            name={name}
            type="checkbox"
            required={required}
            defaultChecked={defaultChecked}
            aria-invalid={v.error ? true : undefined}
            aria-describedby={describedBy(v.helpId, v.errorId, help, v.error)}
            onBlur={(e) => v.onBlur(value(e.currentTarget.checked))}
            onChange={(e) => v.onChange(value(e.currentTarget.checked))}
            className="peer size-3 cursor-pointer appearance-none rounded-xs border border-ink-muted bg-ground checked:border-ink checked:bg-ink aria-invalid:border-accent"
          />
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="pointer-events-none absolute size-2 text-ground opacity-0 peer-checked:opacity-100"
          >
            <path
              d="M3 8.5l3 3 7-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </span>
        <span>
          {children}
          {required && <span className="text-ink-muted"> (required)</span>}
        </span>
      </label>
      <FieldMessages
        helpId={v.helpId}
        errorId={v.errorId}
        help={help}
        error={v.error}
      />
    </div>
  );
}
