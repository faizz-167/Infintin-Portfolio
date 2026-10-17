type FieldMessagesProps = {
  helpId: string;
  errorId: string;
  help?: string;
  error?: string;
};

/**
 * Help and error text under a control. The error line always reserves its
 * height so an error appearing never shifts the layout.
 */
export function FieldMessages({
  helpId,
  errorId,
  help,
  error,
}: FieldMessagesProps) {
  return (
    <>
      {help && (
        <p id={helpId} className="type-caption text-ink-muted">
          {help}
        </p>
      )}
      <p
        id={errorId}
        aria-live="polite"
        className="flex min-h-3 items-start gap-1 type-caption text-ink"
      >
        {error && (
          <>
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              className="mt-[0.2em] size-2 shrink-0 text-accent"
            >
              <circle
                cx="8"
                cy="8"
                r="7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path d="M8 4v5" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8" cy="11.5" r="1" fill="currentColor" />
            </svg>
            <span>{error}</span>
          </>
        )}
      </p>
    </>
  );
}

/** `aria-describedby` value linking whichever messages are present. */
export function describedBy(
  helpId: string,
  errorId: string,
  help?: string,
  error?: string,
) {
  return (
    [help ? helpId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined
  );
}

/**
 * Accent rule along a control's bottom edge, drawn in from the left while the
 * control has focus and retracted on blur. Sits after the control (a `peer`)
 * inside a relative wrapper; 2 px so it reads over the 1 px border.
 */
export function FocusRule() {
  return (
    <span
      aria-hidden="true"
      className="wipe-x pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-accent peer-focus:wipe-on"
    />
  );
}
