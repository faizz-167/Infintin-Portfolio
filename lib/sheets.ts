import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";

interface Sheet {
  id: string;
  name: string;
  element: HTMLElement;
}

interface SheetStore {
  /** Scenes on the visible page, in document order. */
  sheets: Sheet[];
  /** Sheets whose top has passed the middle of the viewport. */
  passed: Record<string, boolean>;
  register: (sheet: Sheet) => void;
  unregister: (id: string) => void;
  setPassed: (id: string, passed: boolean) => void;
}

// Scenes register from effects, so a page hidden by `<Activity>` drops its
// sheets and the title block only ever counts the page on screen. "Sheet n
// of N" is the scene's position in document order, never a hand-kept number.
//
// The current sheet is the last one whose top has passed the middle of the
// viewport. A flag per sheet (rather than "the one being crossed") survives
// scroll jumps and gaps between sheets: an anchor jump past three scenes
// still lands on the right one.
export const useSheetStore = create<SheetStore>()((set) => ({
  sheets: [],
  passed: {},

  register: (sheet) =>
    set(({ sheets }) => ({
      sheets: [...sheets.filter((s) => s.id !== sheet.id), sheet].sort(
        (a, b) =>
          a.element.compareDocumentPosition(b.element) &
          Node.DOCUMENT_POSITION_FOLLOWING
            ? -1
            : 1,
      ),
    })),
  unregister: (id) =>
    set(({ sheets, passed }) => {
      const { [id]: _, ...rest } = passed;
      return { sheets: sheets.filter((s) => s.id !== id), passed: rest };
    }),
  setPassed: (id, value) =>
    set(({ passed }) =>
      passed[id] === value ? {} : { passed: { ...passed, [id]: value } },
    ),
}));

/** The active sheet with its 1-based number, or null when none is active. */
export function useActiveSheet(): {
  name: string;
  number: number;
  count: number;
} | null {
  // Shallow compare: the selector builds a new object on every call.
  const sheet = useSheetStore(
    useShallow(({ sheets, passed }) => {
      const index = sheets.findLastIndex((s) => passed[s.id]);
      return {
        name: sheets[index]?.name ?? null,
        number: index + 1,
        count: sheets.length,
      };
    }),
  );
  return sheet.name === null
    ? null
    : { name: sheet.name, number: sheet.number, count: sheet.count };
}
