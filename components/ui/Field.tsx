"use client";

import { describedBy, FieldMessages } from "./FieldMessages";
import { useFieldValidation, type Validate } from "./useFieldValidation";

type FieldProps = {
  label: string;
  name: string;
  type?: "text" | "email" | "tel" | "url";
  /** Renders a multi-line textarea instead of an input. */
  multiline?: boolean;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
  help?: string;
  /** Returns an error message, or null when the value is valid. */
  validate?: Validate;
  /** Error supplied by the form, e.g. after a failed submit. */
  error?: string;
  className?: string;
};

const controlClasses =
  "w-full rounded-xs border border-ink-muted bg-ground px-2 type-data text-ink aria-invalid:border-accent";

/** Text input with an always-visible label, help text and inline validation. */
export function Field({
  label,
  name,
  type = "text",
  multiline = false,
  required,
  autoComplete,
  defaultValue,
  help,
  validate,
  error: formError,
  className,
}: FieldProps) {
  const v = useFieldValidation(validate, formError);
  const shared = {
    id: v.id,
    name,
    required,
    autoComplete,
    defaultValue,
    "aria-invalid": v.error ? true : undefined,
    "aria-describedby": describedBy(v.helpId, v.errorId, help, v.error),
  };

  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label htmlFor={v.id} className="type-annotation text-ink">
        {label}
        {required && <span className="text-ink-muted"> (required)</span>}
      </label>
      {multiline ? (
        <textarea
          {...shared}
          rows={5}
          className={`${controlClasses} py-1`}
          onBlur={(e) => v.onBlur(e.currentTarget.value)}
          onChange={(e) => v.onChange(e.currentTarget.value)}
        />
      ) : (
        <input
          {...shared}
          type={type}
          className={`${controlClasses} min-h-target`}
          onBlur={(e) => v.onBlur(e.currentTarget.value)}
          onChange={(e) => v.onChange(e.currentTarget.value)}
        />
      )}
      <FieldMessages
        helpId={v.helpId}
        errorId={v.errorId}
        help={help}
        error={v.error}
      />
    </div>
  );
}
