"use client";

import { useId, useState } from "react";

export type Validate = (value: string) => string | null;

/**
 * Inline validation: a field is checked when the user leaves it, then
 * re-checked on every change so the error clears the moment the value is
 * valid. An `error` passed from the form (e.g. after submit) shows until the
 * user edits the field.
 */
export function useFieldValidation(
  validate: Validate | undefined,
  formError: string | undefined,
) {
  const id = useId();
  // undefined = not yet checked locally; null = checked and valid.
  const [localError, setLocalError] = useState<string | null | undefined>(
    undefined,
  );
  const error =
    localError === undefined ? formError : (localError ?? undefined);

  const check = (value: string) => setLocalError(validate?.(value) ?? null);

  return {
    id,
    helpId: `${id}-help`,
    errorId: `${id}-error`,
    error,
    onBlur: (value: string) => check(value),
    onChange: (value: string) => {
      if (localError !== undefined || formError !== undefined) check(value);
    },
  };
}
