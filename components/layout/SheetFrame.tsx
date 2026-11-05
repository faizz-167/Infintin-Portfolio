/**
 * The drawing border: a hairline frame inset from the viewport. Desktop
 * only; narrow screens show the scene name in the header. Purely visual and
 * transparent to the pointer.
 */
export function SheetFrame() {
  return (
    <div
      aria-hidden="true"
      style={{ viewTransitionName: "site-frame" }}
      // One mid-grey for the frame line: it crosses both environments at
      // once during a section sweep, so it can't take either one's ink.
      className="pointer-events-none fixed inset-x-2 top-[calc(var(--spacing-header)+0.5rem)] bottom-2 z-annotations hidden border border-lead/40 lg:block"
    />
  );
}
