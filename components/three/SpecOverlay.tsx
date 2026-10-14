"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import { type Group, Mesh, Raycaster, Vector3 } from "three";
import { fcuDoubleShaftParts } from "@/data/parts/fcu-double-shaft";
import type { PartId } from "@/data/types";
import type { EnvironmentId } from "@/design/three-presets";
import { breakpoint } from "@/design/tokens";
import type { PartLayout } from "./ExplodedView";
import type { PartRegistry } from "./PartMesh";
import type { ViewRuntime } from "./viewRuntime";

// CSS pixels.
const BALLOON_RADIUS = 11;
const RAIL_INSET = 20;
const MIN_GAP = 2 * BALLOON_RADIUS + 4;
const FRAME_PAD = 12;
const TICK = 8;
// Anchors this close behind a surface still count as visible (metres), so a
// point on a part's own skin isn't hidden by that skin's neighbour.
const OCCLUSION_SLACK = 0.002;

const envInk = {
  lab: "text-paper data-active:text-copper-lit",
  sheet: "text-graphite data-active:text-copper",
} as const satisfies Record<EnvironmentId, string>;
const envGround = {
  lab: "fill-graphite",
  sheet: "fill-paper",
} as const satisfies Record<EnvironmentId, string>;

/**
 * Balloons and the isolate inspection frame, drawn in DOM over the view.
 * React renders the elements once; `SpecOverlayTracker` moves them each
 * frame. Hidden from assistive tech: the parts list says the same thing.
 */
export function SpecOverlay({
  runtime,
  env,
}: {
  runtime: ViewRuntime;
  env: EnvironmentId;
}) {
  return (
    <svg
      ref={(svg) => {
        runtime.overlay = svg;
        return () => {
          runtime.overlay = null;
        };
      }}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 size-full overflow-visible"
    >
      <g
        data-frame=""
        visibility="hidden"
        className={envInk[env]}
        data-active=""
      >
        <rect
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="6 4"
        />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} data-tick={i} stroke="currentColor" strokeWidth="1" />
        ))}
      </g>
      {fcuDoubleShaftParts.map((part) => (
        <g
          key={part.id}
          data-balloon={part.id}
          visibility="hidden"
          className={envInk[env]}
        >
          <circle data-dot="" r="2" fill="currentColor" />
          <line data-leader="" stroke="currentColor" strokeWidth="1" />
          <circle
            data-ring=""
            r={BALLOON_RADIUS}
            className={envGround[env]}
            stroke="currentColor"
            strokeWidth="1"
          />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="currentColor"
            className="type-data"
          >
            {part.balloon}
          </text>
        </g>
      ))}
    </svg>
  );
}

interface BalloonNodes {
  group: SVGGElement;
  dot: SVGCircleElement;
  leader: SVGLineElement;
  ring: SVGCircleElement;
  text: SVGTextElement;
}

function queryBalloons(svg: SVGSVGElement): Map<PartId, BalloonNodes> {
  const map = new Map<PartId, BalloonNodes>();
  for (const part of fcuDoubleShaftParts) {
    const group = svg.querySelector<SVGGElement>(`[data-balloon="${part.id}"]`);
    const dot = group?.querySelector<SVGCircleElement>("[data-dot]");
    const leader = group?.querySelector<SVGLineElement>("[data-leader]");
    const ring = group?.querySelector<SVGCircleElement>("[data-ring]");
    const text = group?.querySelector<SVGTextElement>("text");
    if (group && dot && leader && ring && text) {
      map.set(part.id, { group, dot, leader, ring, text });
    }
  }
  return map;
}

function set(el: Element, attrs: Record<string, number | string>) {
  for (const [name, value] of Object.entries(attrs)) {
    el.setAttribute(name, String(value));
  }
}

// After explode (0) and rotation (0) have moved the parts, before render (1).
const AFTER_PARTS = 0.75;

/**
 * Projects each part's anchor to the view each rendered frame. Balloons sit
 * on a vertical rail at the right edge, in anchor order, pushed apart so
 * they never overlap; an anchor behind the camera or behind another solid
 * part hides its balloon. Narrow views show no balloons (the parts list
 * carries the numbers). The isolated part gets a dashed frame with centre
 * ticks around its projected bounds.
 */
export function SpecOverlayTracker({
  runtime,
  layout,
  registry,
  isolated,
  hovered,
  sectionOn,
}: {
  runtime: ViewRuntime;
  layout: Map<PartId, PartLayout>;
  registry: PartRegistry;
  isolated: PartId | null;
  hovered: PartId | null;
  sectionOn: boolean;
}) {
  const scratch = useMemo(
    () => ({
      raycaster: new Raycaster(),
      world: new Vector3(),
      ndc: new Vector3(),
      direction: new Vector3(),
      corner: new Vector3(),
      cache: null as {
        svg: SVGSVGElement;
        balloons: Map<PartId, BalloonNodes>;
      } | null,
    }),
    [],
  );

  // Hide everything when the tracker goes (e.g. balloons switched off).
  useEffect(
    () => () => {
      const svg = runtime.overlay;
      if (!svg) return;
      for (const g of svg.querySelectorAll("g"))
        g.setAttribute("visibility", "hidden");
    },
    [runtime],
  );

  useFrame(({ camera }) => {
    const svg = runtime.overlay;
    const element = runtime.element;
    if (!svg || !element) return;
    if (scratch.cache?.svg !== svg) {
      scratch.cache = { svg, balloons: queryBalloons(svg) };
    }
    const { balloons } = scratch.cache;
    const rect = element.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;
    const { width, height } = rect;

    const toScreen = (point: Vector3): { x: number; y: number } | null => {
      scratch.ndc.copy(point).project(camera);
      if (scratch.ndc.z > 1) return null;
      return {
        x: ((scratch.ndc.x + 1) / 2) * width,
        y: ((1 - scratch.ndc.y) / 2) * height,
      };
    };

    // ---- Balloons
    const solids: Group[] = [...registry.values()];
    const shown: { id: PartId; x: number; y: number; railY: number }[] = [];
    const wide = width >= breakpoint.md;

    for (const [id, part] of layout) {
      const group = registry.get(id);
      // Isolated: only that part keeps its balloon; the ghosts are context.
      if (!wide || !group || (isolated && id !== isolated)) continue;
      group.updateWorldMatrix(true, false);
      const world = scratch.world
        .copy(part.anchor)
        .applyMatrix4(group.matrixWorld);
      if (sectionOn && runtime.sectionPlane.distanceToPoint(world) < 0)
        continue;
      const screen = toScreen(world);
      if (!screen) continue;
      if (isOccluded(id, world)) continue;
      shown.push({ id, ...screen, railY: screen.y });
    }

    function isOccluded(id: PartId, world: Vector3): boolean {
      const { raycaster, direction } = scratch;
      direction.copy(world).sub(camera.position);
      const distance = direction.length();
      raycaster.set(camera.position, direction.normalize());
      raycaster.far = distance - OCCLUSION_SLACK;
      for (const hit of raycaster.intersectObjects(solids, true)) {
        const object = hit.object;
        if (!(object instanceof Mesh) || object.userData.part === id) continue;
        // Ghosted parts are see-through; they don't hide anything.
        const material = object.material;
        if (!Array.isArray(material) && material.transparent) continue;
        if (sectionOn && runtime.sectionPlane.distanceToPoint(hit.point) < 0) {
          continue;
        }
        return true;
      }
      return false;
    }

    // Rail layout: sort by anchor height, push down to keep the gap, clamp to
    // the view, then push back up from the bottom.
    shown.sort((a, b) => a.y - b.y);
    const top = BALLOON_RADIUS + 2;
    const bottom = height - BALLOON_RADIUS - 2;
    for (let i = 0; i < shown.length; i++) {
      const previous = i > 0 ? shown[i - 1].railY + MIN_GAP : top;
      shown[i].railY = Math.max(shown[i].railY, previous);
    }
    for (let i = shown.length - 1; i >= 0; i--) {
      const next = i < shown.length - 1 ? shown[i + 1].railY - MIN_GAP : bottom;
      shown[i].railY = Math.min(shown[i].railY, next);
    }

    const railX = width - RAIL_INSET;
    const visible = new Set(shown.map((s) => s.id));
    for (const [id, nodes] of balloons) {
      nodes.group.setAttribute(
        "visibility",
        visible.has(id) ? "visible" : "hidden",
      );
      nodes.group.toggleAttribute(
        "data-active",
        id === isolated || id === hovered,
      );
    }
    for (const { id, x, y, railY } of shown) {
      const nodes = balloons.get(id);
      if (!nodes) continue;
      set(nodes.dot, { cx: x, cy: y });
      set(nodes.leader, {
        x1: x,
        y1: y,
        x2: railX - BALLOON_RADIUS,
        y2: railY,
      });
      set(nodes.ring, { cx: railX, cy: railY });
      set(nodes.text, { x: railX, y: railY });
    }

    // ---- Inspection frame
    const frame = svg.querySelector<SVGGElement>("[data-frame]");
    if (!frame) return;
    const part = isolated ? layout.get(isolated) : undefined;
    const group = isolated ? registry.get(isolated) : undefined;
    if (!part || !group) {
      frame.setAttribute("visibility", "hidden");
      return;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const { min, max } = part.bounds;
    for (let i = 0; i < 8; i++) {
      scratch.corner
        .set(
          i & 1 ? max.x : min.x,
          i & 2 ? max.y : min.y,
          i & 4 ? max.z : min.z,
        )
        .applyMatrix4(group.matrixWorld);
      const screen = toScreen(scratch.corner);
      if (!screen) {
        frame.setAttribute("visibility", "hidden");
        return;
      }
      minX = Math.min(minX, screen.x);
      minY = Math.min(minY, screen.y);
      maxX = Math.max(maxX, screen.x);
      maxY = Math.max(maxY, screen.y);
    }
    minX -= FRAME_PAD;
    minY -= FRAME_PAD;
    maxX += FRAME_PAD;
    maxY += FRAME_PAD;
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    frame.setAttribute("visibility", "visible");
    const rectEl = frame.querySelector("rect");
    if (rectEl) {
      set(rectEl, {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
      });
    }
    // Centre ticks, pointing out from the middle of each side.
    const ticks: [number, number, number, number][] = [
      [midX, minY, midX, minY - TICK],
      [maxX, midY, maxX + TICK, midY],
      [midX, maxY, midX, maxY + TICK],
      [minX, midY, minX - TICK, midY],
    ];
    frame.querySelectorAll("line").forEach((line, i) => {
      const t = ticks[i];
      if (t) set(line, { x1: t[0], y1: t[1], x2: t[2], y2: t[3] });
    });
  }, AFTER_PARTS);

  return null;
}
