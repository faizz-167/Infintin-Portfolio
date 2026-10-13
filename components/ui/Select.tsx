"use client";

import { describedBy, FieldMessages } from "./FieldMessages";
import { useFieldValidation, type Validate } from "./useFieldValidation";

type SelectProps = {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  /** Shown as an empty first option; selecting nothing is then possible. */
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  help?: string;
  validate?: Validate;
  error?: string;
  className?: string;
};

/** Native select (keeps platform pickers on touch) styled to the system. */
export function Select({
  label,
  name,
  options,
  placeholder,
  required,
  defaultValue,
  help,
  validate,
  error: formError,
  className,
}: SelectProps) {
  const v = useFieldValidation(validate, formError);

  return (
    <div className={`flex flex-col gap-1 ${className ?? ""}`}>
      <label htmlFor={v.id} className="type-annotation text-ink">
        {label}
        {required && <span className="text-ink-muted"> (required)</span>}
      </label>
      <div className="relative">
        <select
          id={v.id}
          name={name}
          required={required}
          defaultValue={defaultValue ?? ""}
          aria-invalid={v.error ? true : undefined}
          aria-describedby={describedBy(v.helpId, v.errorId, help, v.error)}
          onBlur={(e) => v.onBlur(e.currentTarget.value)}
          onChange={(e) => v.onChange(e.currentTarget.value)}
          className="min-h-target w-full appearance-none rounded-xs border border-ink-muted bg-ground py-0 pr-5 pl-2 type-data text-ink aria-invalid:border-accent"
        >
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 8"
          className="pointer-events-none absolute top-1/2 right-2 h-1 w-2 -translate-y-1/2 text-ink"
        >
          <path
            d="M1 1l5 5 5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>
      <FieldMessages
        helpId={v.helpId}
        errorId={v.errorId}
        help={help}
        error={v.error}
      />
    </div>
  );
}
