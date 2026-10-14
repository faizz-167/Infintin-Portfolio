// Elevation line drawing: the high-tier GLB → SVG paths that sit exactly on
// top of the live 3D at the `elevation` camera shot.
//
//   npm run drawings:elevation
//
// Writes components/drawings/generated/fcuElevation.gen.ts. Projects every
// part through the same perspective camera the scene uses, keeps silhouette,
// boundary and crease edges, and removes hidden lines against a software
// depth buffer. Coordinates are millimetres in the camera's target plane, so
// the SVG only has to be scaled to the view's height to line up. Output is
// deterministic.

import { writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { MeshoptDecoder } from "meshoptimizer";

const root = join(import.meta.dirname, "..");
const SOURCE = join(root, "public/models/fcu-double-shaft.glb");
const OUTPUT = join(root, "components/drawings/generated/fcuElevation.gen.ts");

// Must equal `cameraShots.elevation` (desktop) in design/three-presets.ts; the
// drawing component fails typecheck if they drift apart.
const CAMERA = { position: [2.4, 0, 0], fov: 18 };
const DISTANCE = CAMERA.position[0];
// Half the frame height at the target, in mm: the SVG viewBox height.
const HALF_HEIGHT =
  DISTANCE * Math.tan(((CAMERA.fov / 2) * Math.PI) / 180) * 1000;

// Faces meeting at more than this read as a drawn edge (a step, a chamfer);
// facets of a smooth cylinder stay under it.
const CREASE_DEG = 35;
// Depth buffer resolution, px per mm (a 900 px tall view is ≈1.2 px per mm).
const RASTER = 4;
// A sample is visible if no surface is nearer by more than this (mm).
const DEPTH_EPSILON = 0.6;
// Sample spacing along an edge for the visibility test (mm).
const SAMPLE = 0.25;
// Simplification tolerance and the shortest stroke worth drawing (mm).
const TOLERANCE = 0.15;
const MIN_LENGTH = 1.5;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });

await MeshoptDecoder.ready;
const doc = await io.read(SOURCE);

// ---------------------------------------------------------------- Geometry

/** Model space (m) → camera view (mm in the target plane) + depth (mm). */
function project([x, y, z]) {
  const depth = DISTANCE - x;
  const k = (DISTANCE / depth) * 1000;
  // Camera looks down −X with +Y up, so screen right is −Z.
  return [-z * k, y * k, depth * 1000];
}

function transform(m, [x, y, z]) {
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}

const meshes = [];
for (const node of doc.getRoot().listNodes()) {
  const mesh = node.getMesh();
  if (!mesh) continue;
  // The runtime places each part with its node's own transform only
  // (PartMesh), so the drawing does too.
  const matrix = node.getMatrix();
  for (const prim of mesh.listPrimitives()) {
    const positions = prim.getAttribute("POSITION");
    const indices = prim.getIndices();
    if (!positions || !indices) continue;
    const world = [];
    const element = [];
    for (let i = 0; i < positions.getCount(); i++)
      world.push(transform(matrix, positions.getElement(i, element)));
    const tris = [];
    for (let i = 0; i < indices.getCount(); i += 3)
      tris.push([
        indices.getScalar(i),
        indices.getScalar(i + 1),
        indices.getScalar(i + 2),
      ]);
    meshes.push({ name: node.getName(), world, tris });
  }
}
meshes.sort((a, b) => a.name.localeCompare(b.name));

// ------------------------------------------------------------ Depth buffer

let minX = Infinity;
let maxX = -Infinity;
let minY = Infinity;
let maxY = -Infinity;
for (const m of meshes) {
  m.screen = m.world.map(project);
  for (const [x, y] of m.screen) {
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
}
const PAD = 4;
const W = Math.ceil((maxX - minX + 2 * PAD) * RASTER);
const H = Math.ceil((maxY - minY + 2 * PAD) * RASTER);
const depthBuffer = new Float32Array(W * H).fill(Infinity);
const toPx = (x, y) => [(x - minX + PAD) * RASTER, (maxY + PAD - y) * RASTER];

for (const m of meshes) {
  for (const [a, b, c] of m.tris) {
    const [ax, ay] = toPx(m.screen[a][0], m.screen[a][1]);
    const [bx, by] = toPx(m.screen[b][0], m.screen[b][1]);
    const [cx, cy] = toPx(m.screen[c][0], m.screen[c][1]);
    const az = m.screen[a][2];
    const bz = m.screen[b][2];
    const cz = m.screen[c][2];
    const area = (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
    if (Math.abs(area) < 1e-9) continue;
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
    const x1 = Math.min(W - 1, Math.ceil(Math.max(ax, bx, cx)));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by, cy)));
    const y1 = Math.min(H - 1, Math.ceil(Math.max(ay, by, cy)));
    for (let py = y0; py <= y1; py++) {
      for (let px = x0; px <= x1; px++) {
        const sx = px + 0.5;
        const sy = py + 0.5;
        const w0 = ((bx - sx) * (cy - sy) - (cx - sx) * (by - sy)) / area;
        const w1 = ((cx - sx) * (ay - sy) - (ax - sx) * (cy - sy)) / area;
        const w2 = 1 - w0 - w1;
        if (w0 < 0 || w1 < 0 || w2 < 0) continue;
        const z = w0 * az + w1 * bz + w2 * cz;
        const i = py * W + px;
        if (z < depthBuffer[i]) depthBuffer[i] = z;
      }
    }
  }
}

/**
 * A point is visible if, anywhere in the 3×3 px patch around it, nothing is
 * nearer. The patch matters at silhouettes: a curved surface seen edge-on is
 * nearer than its own outline on the pixels just inside it, but not on the
 * pixels just outside. An occluder in front covers the whole patch.
 */
function visible(x, y, z) {
  const [px, py] = toPx(x, y);
  const cx = Math.floor(px);
  const cy = Math.floor(py);
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      const qx = cx + dx;
      const qy = cy + dy;
      if (qx < 0 || qy < 0 || qx >= W || qy >= H) return true;
      if (z <= depthBuffer[qy * W + qx] + DEPTH_EPSILON) return true;
    }
  return false;
}

// ------------------------------------------------------------------ Edges

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const normalize = (a) => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const COS_CREASE = Math.cos((CREASE_DEG * Math.PI) / 180);
const EYE = CAMERA.position;

const outline = [];
const construction = [];

for (const m of meshes) {
  // Weld by position so split normals don't turn every face into a boundary.
  const key = (p) => p.map((v) => v.toFixed(6)).join(",");
  const canonical = new Map();
  const remap = m.world.map((p) => {
    const k = key(p);
    if (!canonical.has(k)) canonical.set(k, canonical.size);
    return canonical.get(k);
  });
  // One original vertex per welded index, for its projected position.
  const point = [];
  remap.forEach((welded, i) => {
    point[welded] = i;
  });

  const faces = m.tris.map(([a, b, c]) => {
    const pa = m.world[a];
    const n = normalize(cross(sub(m.world[b], pa), sub(m.world[c], pa)));
    const facing = dot(n, sub(EYE, pa)) > 0;
    return { n, facing };
  });

  const edges = new Map();
  m.tris.forEach((tri, f) => {
    for (let e = 0; e < 3; e++) {
      const i = remap[tri[e]];
      const j = remap[tri[(e + 1) % 3]];
      if (i === j) continue;
      const k = i < j ? `${i}_${j}` : `${j}_${i}`;
      const entry = edges.get(k);
      if (entry) entry.faces.push(f);
      else edges.set(k, { i: Math.min(i, j), j: Math.max(i, j), faces: [f] });
    }
  });

  for (const { i, j, faces: fs } of edges.values()) {
    let kind = null;
    if (fs.length !== 2) kind = "outline";
    else {
      const [f, g] = [faces[fs[0]], faces[fs[1]]];
      if (f.facing !== g.facing) kind = "outline";
      else if (f.facing && dot(f.n, g.n) < COS_CREASE) kind = "construction";
    }
    if (!kind) continue;

    // Split the edge into visible runs.
    const a = m.screen[point[i]];
    const b = m.screen[point[j]];
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const steps = Math.max(1, Math.ceil(length / SAMPLE));
    let run = null;
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const x = a[0] + (b[0] - a[0]) * t;
      const y = a[1] + (b[1] - a[1]) * t;
      const z = a[2] + (b[2] - a[2]) * t;
      if (visible(x, y, z)) {
        if (!run) run = [[x, y]];
        else run[1] = [x, y];
      } else if (run) {
        if (run.length === 2)
          (kind === "outline" ? outline : construction).push(run);
        run = null;
      }
    }
    if (run?.length === 2)
      (kind === "outline" ? outline : construction).push(run);
  }
}

// ---------------------------------------------------- Chain and simplify

const round = (v) => Math.round(v * 10) / 10;
const pkey = ([x, y]) => `${round(x)},${round(y)}`;

/** Joins segments that share endpoints into polylines. */
function chain(segments) {
  const ends = new Map();
  const add = (k, s) => {
    const list = ends.get(k);
    if (list) list.push(s);
    else ends.set(k, [s]);
  };
  segments.forEach((s, idx) => {
    add(pkey(s[0]), idx);
    add(pkey(s[1]), idx);
  });
  const used = new Uint8Array(segments.length);
  const next = (k) => (ends.get(k) ?? []).find((idx) => !used[idx]);
  const lines = [];
  for (let start = 0; start < segments.length; start++) {
    if (used[start]) continue;
    used[start] = 1;
    const line = [...segments[start]];
    for (const forward of [true, false]) {
      for (;;) {
        const tip = forward ? line[line.length - 1] : line[0];
        const idx = next(pkey(tip));
        if (idx === undefined) break;
        used[idx] = 1;
        const [p, q] = segments[idx];
        const other = pkey(p) === pkey(tip) ? q : p;
        if (forward) line.push(other);
        else line.unshift(other);
      }
    }
    lines.push(line);
  }
  return lines;
}

/** Ramer–Douglas–Peucker. */
function simplify(points) {
  if (points.length < 3) return points;
  const [a, b] = [points[0], points[points.length - 1]];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  let worst = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i];
    const d =
      len === 0
        ? Math.hypot(p[0] - a[0], p[1] - a[1])
        : Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / len;
    if (d > worst) {
      worst = d;
      index = i;
    }
  }
  if (worst <= TOLERANCE) return [a, b];
  return [
    ...simplify(points.slice(0, index + 1)).slice(0, -1),
    ...simplify(points.slice(index)),
  ];
}

const polylineLength = (line) =>
  line.reduce(
    (sum, p, i) =>
      i === 0
        ? 0
        : sum + Math.hypot(p[0] - line[i - 1][0], p[1] - line[i - 1][1]),
    0,
  );

/** SVG path data, y flipped (SVG y runs down), left to right for drawing. */
function toPath(segments) {
  const lines = chain(segments)
    .filter((line) => polylineLength(line) >= MIN_LENGTH)
    .map(simplify)
    .map((line) =>
      line[0][0] > line[line.length - 1][0] ? line.reverse() : line,
    )
    .sort((p, q) => p[0][0] - q[0][0] || p[0][1] - q[0][1]);
  const fmt = (v) => {
    const r = round(v);
    return Object.is(r, -0) ? "0" : String(r);
  };
  return lines
    .map((line) => `M${line.map(([x, y]) => `${fmt(x)} ${fmt(-y)}`).join("L")}`)
    .join("");
}

const outlinePath = toPath(outline);
const constructionPath = toPath(construction);
// Shaft centre line, a little past the ends of the assembly.
const OVERRUN = 12;
const centreLine = `M${round(minX - OVERRUN)} 0H${round(maxX + OVERRUN)}`;

const halfHeight = round(HALF_HEIGHT);
const halfWidth = Math.ceil(Math.max(-minX, maxX) + OVERRUN + 2);

const out = `// Generated by scripts/draw-elevation.mjs from public/models/fcu-double-shaft.glb.
// Do not edit; run \`npm run drawings:elevation\`.

/** The camera the drawing was projected through (desktop \`elevation\` shot). */
export const camera = {
  position: [${CAMERA.position.join(", ")}],
  fov: ${CAMERA.fov},
} as const;

/**
 * Millimetres in the camera's target plane, origin on the shaft axis. The
 * height is the full frame height, so scaling the viewBox to the view's
 * height lines the drawing up with the 3D.
 */
export const viewBox = "${-halfWidth} ${-halfHeight} ${2 * halfWidth} ${2 * halfHeight}";

/** Screen extent of the assembly, mm. */
export const extent = {
  left: ${round(minX)},
  right: ${round(maxX)},
  top: ${round(maxY)},
  bottom: ${round(minY)},
} as const;

export const centreLine = "${centreLine}";
export const outline =
  "${outlinePath}";
export const construction =
  "${constructionPath}";
`;

writeFileSync(OUTPUT, out);
console.log(
  `drawings:elevation: ${relative(root, OUTPUT)} — outline ${outlinePath.length} B, construction ${constructionPath.length} B, extent ${round(minX)}…${round(maxX)} × ${round(minY)}…${round(maxY)} mm`,
);
