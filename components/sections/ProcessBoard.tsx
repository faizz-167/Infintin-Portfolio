import type { CSSProperties, ReactNode } from "react";
import { processStages } from "@/data/process";
import type { StageState } from "@/data/types";
import { OwnerMark, STATE_LABEL } from "./ProcessMarks";

/*
 * Board geometry, in board units (`--u`, set on the board so the whole thing
 * scales with the viewport). The plane is tilted to a dimetric view with CSS,
 * rotateZ(-45°) then rotateX(60°) and no perspective, so lengths along each
 * axis stay comparable like a drawing's axonometric view. Tiles step along
 * the plane's x and y axes in turn: on screen that is a left-to-right zigzag,
 * one tile up, the next down, so the board reads as a horizontal run.
 */
const TILE = 5;
const STEP = 22;
const PAD = 3;
const STEPS = processStages.length - 1;
const W = PAD * 2 + Math.ceil(STEPS / 2) * STEP + TILE;
const D = PAD * 2 + Math.floor(STEPS / 2) * STEP + TILE;
/** How far the trace runs in from before the first tile. */
const ENTRY = 16;
/** Base plate and cap heights. */
const BASE_H = 0.6;
const CAP_H = 1.4;
/** Empty floor left and right of the end tiles, and above the board. */
const SIDE = 12;
const TOP = 3;
/** Below the lowest tile: room for its label (and owner mark) in rem. */
const LABEL_ROOM = "5rem";

const u = (n: number) => `calc(var(--u) * ${n})`;

type Point = readonly [number, number];

/** Top-left corner of a stage's tile: odd steps go along x, even along y. */
function origin(index: number): Point {
  return [
    PAD + Math.ceil(index / 2) * STEP,
    PAD + Math.floor(index / 2) * STEP,
  ];
}

function centre(index: number): Point {
  const [x, y] = origin(index);
  return [x + TILE / 2, y + TILE / 2];
}

/**
 * The trace's run into a stage, in right angles like a PCB track: it leaves
 * one tile, jogs sideways into its own lane and drops back in to the next.
 */
function segment(index: number): string {
  const b = centre(index);
  let points: Point[];
  if (index === 0) {
    points = [[b[0] - ENTRY, b[1]], b];
  } else {
    const a = centre(index - 1);
    // Runs along x on odd steps, along y on even ones; `at` builds a point
    // from a distance along the run and an offset across it.
    const alongX = index % 2 === 1;
    const at = (along: number, across: number): Point =>
      alongX ? [along, across] : [across, along];
    const [a1, a2] = alongX ? a : [a[1], a[0]];
    const [b1] = alongX ? b : [b[1], b[0]];
    const jog = index % 4 < 2 ? 1.5 : -1.5;
    const out = a1 + 5.5;
    const into = b1 - 5.5;
    points = [
      a,
      at(out, a2),
      at(out, a2 + jog),
      at(into, a2 + jog),
      at(into, a2),
      b,
    ];
  }
  return points.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
}

/**
 * Where a plane point lands on screen, relative to the plane's origin:
 * rotateZ(-45°) sends x up-right and y down-right, rotateX(60°) halves the
 * vertical. Labels use it to sit in a flat layer over the tilted board.
 */
function project([x, y]: Point): Point {
  return [(x + y) * Math.SQRT1_2, ((y - x) * Math.SQRT1_2) / 2];
}

// Screen extent of the tiles (base plates and cap height included), which
// sizes the board; the faded floor and the trace's entry overhang it.
const corners = processStages.flatMap((_, index) => {
  const [x, y] = origin(index);
  return [
    project([x - 0.5, y - 0.5]),
    project([x + TILE + 0.5, y + TILE + 0.5]),
    project([x + TILE + 0.5, y - 0.5]),
    project([x - 0.5, y + TILE + 0.5]),
  ];
});
const LIFT = (BASE_H + CAP_H) * Math.sin(Math.PI / 3);
const MIN_X = Math.min(...corners.map(([x]) => x)) - SIDE;
const MAX_X = Math.max(...corners.map(([x]) => x)) + SIDE;
const MIN_Y = Math.min(...corners.map(([, y]) => y)) - LIFT - TOP;
const MAX_Y = Math.max(...corners.map(([, y]) => y));
const BOX_W = MAX_X - MIN_X;
const BOX_H = MAX_Y - MIN_Y;

type Side = "top" | "left" | "front";

/**
 * One face of a slab standing on the plane. Only the two sides facing the
 * viewer are drawn (−x and +y); the plane's tilt hides the other two.
 */
function Face({
  side,
  z,
  h,
  className,
  children,
}: {
  side: Side;
  z: number;
  h: number;
  className: string;
  children?: ReactNode;
}) {
  const style: CSSProperties =
    side === "top"
      ? { inset: 0, transform: `translateZ(${u(z + h)})` }
      : side === "left"
        ? {
            left: 0,
            top: 0,
            bottom: 0,
            width: u(h),
            transformOrigin: "0 0",
            transform: `translateZ(${u(z)}) rotateY(-90deg)`,
          }
        : {
            left: 0,
            right: 0,
            top: "100%",
            height: u(h),
            transformOrigin: "0 0",
            transform: `translateZ(${u(z)}) rotateX(90deg)`,
          };
  return (
    <div className={`absolute ${className}`} style={style}>
      {children}
    </div>
  );
}

const CAP_UNLIT: Record<Side, string> = {
  top: "bg-ground",
  left: "bg-[color-mix(in_srgb,var(--ground)_88%,var(--ink))]",
  front: "bg-[color-mix(in_srgb,var(--ground)_78%,var(--ink))]",
};

// Lit caps: complete stages in ink, the current stage in copper. The side
// faces are shaded towards ink so the cap still reads as a solid.
const CAP_LIT: Record<"complete" | "current", Record<Side, string>> = {
  complete: {
    top: "bg-ink text-ground",
    left: "bg-[color-mix(in_srgb,var(--ink)_84%,var(--ground))]",
    front: "bg-[color-mix(in_srgb,var(--ink)_70%,var(--ground))]",
  },
  current: {
    top: "bg-accent text-on-accent",
    left: "bg-[color-mix(in_srgb,var(--accent)_82%,var(--ink))]",
    front: "bg-[color-mix(in_srgb,var(--accent)_66%,var(--ink))]",
  },
};

const SIDES: readonly Side[] = ["left", "front", "top"];

function Tile({ index, state }: { index: number; state: StageState }) {
  const [x, y] = origin(index);
  const lit = state === "upcoming" ? null : CAP_LIT[state];
  const number = String(index + 1).padStart(2, "0");
  return (
    <div
      className="process-tile absolute [transform-style:preserve-3d]"
      style={{ left: u(x), top: u(y), width: u(TILE), height: u(TILE) }}
    >
      {/* Contact shadow, just above the floor so it never fights the grid. */}
      <div
        className="absolute bg-ink opacity-15 blur-[0.375rem]"
        style={{ inset: u(-0.2), transform: "translateZ(1px)" }}
      />
      {state === "current" && (
        <div
          className="process-bloom absolute bg-[radial-gradient(closest-side,var(--accent),transparent)] opacity-35"
          style={{ inset: u(-4.5), transform: "translateZ(1px)" }}
        />
      )}
      <div
        className="absolute [transform-style:preserve-3d]"
        style={{ inset: u(-0.5) }}
      >
        <Face
          side="left"
          z={0}
          h={BASE_H}
          className="bg-[color-mix(in_srgb,var(--ground-raised)_86%,var(--ink))]"
        />
        <Face
          side="front"
          z={0}
          h={BASE_H}
          className="bg-[color-mix(in_srgb,var(--ground-raised)_74%,var(--ink))]"
        />
        <Face
          side="top"
          z={0}
          h={BASE_H}
          className="border border-rule bg-ground-raised"
        />
      </div>
      <div
        className="process-cap absolute [transform-style:preserve-3d]"
        style={{ inset: u(0.4) }}
      >
        {SIDES.map((side) => (
          <Face
            key={side}
            side={side}
            z={BASE_H}
            h={CAP_H}
            className={`${CAP_UNLIT[side]} ${
              side === "top"
                ? `flex items-center justify-center border text-ink-muted ${
                    state === "upcoming"
                      ? "border-dashed border-ink-muted"
                      : "border-rule"
                  }`
                : ""
            }`}
          >
            {side === "top" && <span className="type-data">{number}</span>}
            {lit && (
              <span
                className={`process-lit absolute inset-0 flex items-center justify-center ${lit[side]}`}
              >
                {side === "top" && <span className="type-data">{number}</span>}
              </span>
            )}
          </Face>
        ))}
      </div>
    </div>
  );
}

/**
 * Desktop Process board: the stages as raised tiles on a tilted drawing
 * floor, joined by one trace in stage order. Markup is the end state (every
 * run drawn, every reached tile lit) so the board reads without scripting;
 * ProcessStage's desktop build scrubs it in from there.
 *
 * The tilted plane is decoration only. The stage list a screen reader reads
 * is the flat label layer on top, in order.
 */
export function ProcessBoard({ showOwners }: { showOwners: boolean }) {
  const current = processStages.findIndex((s) => s.state === "current");
  const head = centre(current === -1 ? processStages.length - 1 : current);
  return (
    <div
      className="process-board relative [--u:min(1.0625rem,1.9svh)]"
      style={{
        width: u(BOX_W),
        height: `calc(${u(BOX_H)} + ${LABEL_ROOM})`,
      }}
    >
      <div
        aria-hidden="true"
        className="absolute [transform-style:preserve-3d]"
        style={{
          left: u(-MIN_X),
          top: u(-MIN_Y),
          width: u(W),
          height: u(D),
          transformOrigin: "0 0",
          transform: "rotateX(60deg) rotateZ(-45deg)",
        }}
      >
        {/* Drawing floor: a 5-unit grid in register with the tiles. The
            tiles run along the plane's diagonal, so the grid is faded to a
            band around that diagonal (and at its ends) instead of a border. */}
        <div
          className="absolute [mask-composite:intersect] [mask-image:linear-gradient(45deg,transparent_42%,black_47%,black_53%,transparent_58%),linear-gradient(135deg,transparent,black_12%,black_88%,transparent)]"
          style={{
            inset: u(-14),
            backgroundImage:
              "linear-gradient(var(--rule) 1px, transparent 1px), linear-gradient(90deg, var(--rule) 1px, transparent 1px)",
            backgroundSize: `${u(5)} ${u(5)}`,
            backgroundPosition: `${u(17)} ${u(17)}`,
          }}
        />
        <svg
          aria-hidden="true"
          className="absolute inset-0 size-full overflow-visible"
          viewBox={`0 0 ${W} ${D}`}
          style={{ transform: "translateZ(2px)" }}
        >
          <defs>
            <linearGradient
              id="process-entry"
              gradientUnits="userSpaceOnUse"
              x1={PAD + TILE / 2 - ENTRY}
              y1={0}
              x2={PAD}
              y2={0}
            >
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0" />
              <stop offset="1" stopColor="var(--accent)" />
            </linearGradient>
            {/* Each run is revealed by drawing a solid copy of it in a mask,
                so the dashed runs can draw in the same way as the solid. */}
            {processStages.map((stage, index) => (
              <mask
                key={stage.id}
                id={`process-run-${index}`}
                maskUnits="userSpaceOnUse"
                x={-ENTRY}
                y={-2}
                width={W + ENTRY + 2}
                height={D + 4}
              >
                <path
                  className="process-reveal"
                  d={segment(index)}
                  pathLength={1}
                  fill="none"
                  stroke="white"
                  strokeWidth={1.2}
                  strokeDasharray="1 1"
                  strokeDashoffset={0}
                />
              </mask>
            ))}
          </defs>
          {processStages.map((stage, index) => {
            const solid = stage.state !== "upcoming";
            return (
              <path
                key={stage.id}
                className={`process-trace ${solid ? "drop-shadow-[0_0_3px_var(--accent)]" : ""}`}
                d={segment(index)}
                mask={`url(#process-run-${index})`}
                fill="none"
                stroke={
                  index === 0
                    ? "url(#process-entry)"
                    : solid
                      ? "var(--accent)"
                      : "var(--ink-muted)"
                }
                strokeWidth={solid ? 0.3 : 0.22}
                strokeDasharray={solid ? undefined : "0.7 0.7"}
                strokeLinejoin="round"
              />
            );
          })}
          <circle
            className="process-head drop-shadow-[0_0_4px_var(--accent)]"
            cx={head[0]}
            cy={head[1]}
            r={0.45}
            fill="var(--accent)"
          />
        </svg>
        {processStages.map((stage, index) => (
          <Tile key={stage.id} index={index} state={stage.state} />
        ))}
      </div>

      <ol className="absolute inset-0">
        {processStages.map((stage, index) => {
          const [x, y] = origin(index);
          // Under the tile's nearest corner, the lowest point it has on screen.
          const [sx, sy] = project([x, y + TILE]);
          const current = stage.state === "current";
          return (
            <li
              key={stage.id}
              className="absolute -translate-x-1/2"
              style={{
                left: u(sx - MIN_X),
                top: `calc(${u(sy - MIN_Y)} + 0.5rem)`,
              }}
            >
              <div className="process-label flex flex-col items-center gap-[0.25rem]">
                <span
                  className={`whitespace-nowrap border bg-ground px-1 py-[0.1875rem] type-annotation ${
                    current
                      ? "border-accent text-accent"
                      : "border-rule text-ink"
                  }`}
                >
                  {stage.name}
                </span>
                <span
                  className={`type-caption ${current ? "text-accent" : "sr-only"}`}
                >
                  {STATE_LABEL[stage.state]}
                </span>
                {showOwners && <OwnerMark owner={stage.owner} />}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
