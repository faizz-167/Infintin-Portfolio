"use client";

import { useEffect, useRef, useState } from "react";

type Pair = {
  label: string;
  fg: string;
  bg: string;
  /** 4.5 for body text, 3 for large text and UI marks, 7 for increased contrast. */
  min: number;
};

const PAIRS: Pair[] = [
  { label: "Ink on ground", fg: "--ink", bg: "--ground", min: 4.5 },
  {
    label: "Ink on raised ground",
    fg: "--ink",
    bg: "--ground-raised",
    min: 4.5,
  },
  { label: "Muted ink on ground", fg: "--ink-muted", bg: "--ground", min: 4.5 },
  {
    label: "Muted ink on raised ground",
    fg: "--ink-muted",
    bg: "--ground-raised",
    min: 4.5,
  },
  { label: "Accent text on ground", fg: "--accent", bg: "--ground", min: 4.5 },
  { label: "Text on accent fill", fg: "--on-accent", bg: "--accent", min: 4.5 },
  {
    label: "Text on hover fill (ink)",
    fg: "--on-accent",
    bg: "--ink",
    min: 4.5,
  },
  {
    label: "Status mark on ground (UI)",
    fg: "--status-mark",
    bg: "--ground",
    min: 3,
  },
];

// Increased-contrast values are measured from the raw tokens the
// `prefers-contrast: more` block assigns.
const STRONG: Record<string, Pair[]> = {
  sheet: [
    {
      label: "Muted ink, increased contrast",
      fg: "--color-lead-strong",
      bg: "--color-paper",
      min: 7,
    },
    {
      label: "…on raised ground",
      fg: "--color-lead-strong",
      bg: "--color-paper-deep",
      min: 7,
    },
  ],
  lab: [
    {
      label: "Muted ink, increased contrast",
      fg: "--color-lead-lit-strong",
      bg: "--color-graphite",
      min: 7,
    },
    {
      label: "…on raised ground",
      fg: "--color-lead-lit-strong",
      bg: "--color-graphite-raised",
      min: 7,
    },
  ],
};

function luminance(rgb: number[]): number {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: number[], b: number[]): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Resolves a custom property to sRGB by letting the browser compute it. */
function resolve(scope: HTMLElement, variable: string): number[] {
  const probe = document.createElement("span");
  probe.style.color = `var(${variable})`;
  scope.append(probe);
  const rgb = getComputedStyle(probe)
    .color.match(/[\d.]+/g)
    ?.slice(0, 3)
    .map(Number) ?? [0, 0, 0];
  probe.remove();
  return rgb;
}

type Row = Pair & { value: number };

/** Measured contrast for every text/ground pair in one environment. */
export function ContrastTable({ env }: { env: "sheet" | "lab" }) {
  const ref = useRef<HTMLTableElement>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const scope = ref.current;
    if (!scope) return;
    setRows(
      [...PAIRS, ...STRONG[env]].map((p) => ({
        ...p,
        value: ratio(resolve(scope, p.fg), resolve(scope, p.bg)),
      })),
    );
  }, [env]);

  return (
    <table ref={ref} className="w-full type-data">
      <caption className="pb-1 text-left type-annotation text-ink-muted">
        Contrast, {env === "sheet" ? "Sheet" : "Lab"}
      </caption>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="rule-hairline">
            <th scope="row" className="py-1 text-left font-normal">
              {r.label}
            </th>
            <td className="py-1 text-right">{r.value.toFixed(2)} : 1</td>
            <td className="py-1 pl-2 text-right" data-pass={r.value >= r.min}>
              {r.value >= r.min ? "Pass" : "Fail"} (min {r.min})
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
