// Model pipeline: CAD export → web GLBs + typed R3F component.
//
//   npm run models:optimize
//
// Reads the untouched source in assets-src/, writes
//   public/models/fcu-double-shaft.glb        high tier (mid/high)
//   public/models/fcu-double-shaft.lod1.glb   low tier
//   components/three/models/generated/FcuDoubleShaft.gen.tsx
//   plan/spec/model-report.md
// and fails if either GLB misses a part or the two disagree on node names or
// transforms. Output is deterministic: rerunning on the same source is a no-op.

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { NodeIO } from "@gltf-transform/core";
import {
  ALL_EXTENSIONS,
  EXTMeshoptCompression,
} from "@gltf-transform/extensions";
import {
  cloneDocument,
  dedup,
  getBounds,
  prune,
  quantize,
  reorder,
  simplifyPrimitive,
  unpartition,
  weld,
} from "@gltf-transform/functions";
import {
  MeshoptDecoder,
  MeshoptEncoder,
  MeshoptSimplifier,
} from "meshoptimizer";

const root = join(import.meta.dirname, "..");
const SOURCE = join(root, "assets-src/fcu-double-shaft/final_assembly.gltf");
const OUT_HIGH = join(root, "public/models/fcu-double-shaft.glb");
const OUT_LOD1 = join(root, "public/models/fcu-double-shaft.lod1.glb");
const OUT_GEN = join(
  root,
  "components/three/models/generated/FcuDoubleShaft.gen.tsx",
);
const OUT_REPORT = join(root, "plan/spec/model-report.md");

// Source node → slug. Mesh slugs must match `ModelNodeName` in data/types.ts.
// Front = +Z (model-audit.md §3); final naming pending engineering.
const RENAME = {
  "final assembly": "fcu-double-shaft",
  "F&B cover-3": "end-cover-front",
  "F&B cover-2": "end-cover-rear",
  "mid cover-2": "mid-cover",
  "stator1-1": "stator",
  "coil assembly": "windings",
  "coil for max1-1": "winding-slot",
  "coil for max2-2": "winding-end-front",
  "coil for max3-2": "winding-end-rear",
  "rotor1-1": "rotor",
  "magnet-1": "rotor-magnet",
  "shaft-1": "shaft",
  "turbine-1": "blower-wheel-front",
  "turbine-2": "blower-wheel-rear",
  "new clip-6": "retaining-clip-front",
  "new clip-7": "retaining-clip-rear",
  "new stand-2": "mounting-stand",
};
const CAMERA_NODE = "current camera";
const MESH_SLUGS = Object.values(RENAME).filter(
  (slug) => slug !== "fcu-double-shaft" && slug !== "windings",
);

// LOD1 keep-ratios. The end windings are 43% of all triangles and read as a
// coil bundle at phone size, so they take the hardest cut; blower wheels are
// next. Covers and the stator carry the silhouette and stay nearly intact.
// Parts not listed are left as they are (the shaft is 104 tris).
const LOD1_RATIO = {
  "winding-end-front": 0.15,
  "winding-end-rear": 0.15,
  "blower-wheel-front": 0.3,
  "blower-wheel-rear": 0.3,
  "winding-slot": 0.5,
  "mounting-stand": 0.4,
  "end-cover-front": 0.5,
  "end-cover-rear": 0.5,
  rotor: 0.5,
  "rotor-magnet": 0.5,
  "mid-cover": 0.8,
  stator: 0.8,
  "retaining-clip-front": 0.8,
  "retaining-clip-rear": 0.8,
};
// Fraction of mesh radius the simplifier may move a surface. Loose enough to
// reach the ratios; silhouettes checked by eye on /system/model at phone size.
const LOD1_ERROR = 0.02;

const BUDGET = {
  high: { bytes: 600 * 1024 },
  lod1: { bytes: 250 * 1024, triangles: 20_000 },
};

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.decoder": MeshoptDecoder,
    "meshopt.encoder": MeshoptEncoder,
  });

function fail(message) {
  console.error(`models:optimize: ${message}`);
  process.exit(1);
}

function nodeBySlug(doc, slug) {
  return doc
    .getRoot()
    .listNodes()
    .find((n) => n.getName() === slug);
}

function triangles(mesh) {
  return mesh
    .listPrimitives()
    .reduce(
      (sum, prim) =>
        sum +
        (prim.getIndices() ?? prim.getAttribute("POSITION")).getCount() / 3,
      0,
    );
}

/** Rename, drop the CAD camera and materials, then clean and quantise. */
async function prepare() {
  const doc = await io.read(SOURCE);
  const docRoot = doc.getRoot();

  for (const node of docRoot.listNodes()) {
    const name = node.getName();
    if (name === CAMERA_NODE) {
      // Its transform became the `cad` reference in design/three-presets.ts.
      node.getCamera()?.dispose();
      node.dispose();
      continue;
    }
    if (!(name in RENAME)) fail(`unmapped source node "${name}"`);
    node.setName(RENAME[name]);
  }
  // Presets replace every CAD placeholder material (design-direction.md §8),
  // so none ship. The wrapper assigns presets by slug from parts data.
  for (const material of docRoot.listMaterials()) material.dispose();

  // No `instance()`: mirrored pairs explode in opposite directions, so every
  // part stays its own node. `dedup` still shares the twins' geometry.
  // Never `join()`: part addressability is the point of the model.
  await doc.transform(
    dedup(),
    weld(),
    prune({ keepLeaves: true }),
    unpartition(),
    // Quantise once, before LOD1 is cloned: `quantize` moves the
    // dequantisation scale into node transforms, and LOD1 must share those
    // transforms exactly so the one generated component renders both files.
    // Same settings as gltf-transform's `meshopt({ level: "high" })`; normals
    // are left float for meshopt's octahedral filter.
    quantize({
      pattern: /^(POSITION|TEXCOORD|JOINTS|WEIGHTS|COLOR)(_\d+)?$/,
      quantizeNormal: 8,
    }),
  );
  return doc;
}

async function simplifyLod1(doc) {
  await MeshoptSimplifier.ready;
  // Twins share one mesh after `dedup`, so a mesh may be reached twice; both
  // twins have the same ratio and each mesh is simplified once.
  const done = new Set();
  for (const node of doc.getRoot().listNodes()) {
    const mesh = node.getMesh();
    const ratio = LOD1_RATIO[node.getName()];
    if (!mesh || ratio === undefined || done.has(mesh)) continue;
    done.add(mesh);
    for (const prim of mesh.listPrimitives()) {
      simplifyPrimitive(prim, {
        simplifier: MeshoptSimplifier,
        ratio,
        error: LOD1_ERROR,
      });
    }
  }
  await doc.transform(prune({ keepLeaves: true }));
}

async function finish(doc, path) {
  // Not gltf-transform's `meshopt()`: it re-quantises, and LOD1's shrunken
  // bounds would then give it different node transforms from the high GLB.
  // This is its encode step without the quantise.
  await doc.transform(reorder({ encoder: MeshoptEncoder, target: "size" }));
  doc
    .createExtension(EXTMeshoptCompression)
    .setRequired(true)
    .setEncoderOptions({
      method: EXTMeshoptCompression.EncoderMethod.FILTER,
    });
  mkdirSync(join(path, ".."), { recursive: true });
  const bytes = await io.writeBinary(doc);
  writeFileSync(path, bytes);
  return bytes.byteLength;
}

function describe(doc) {
  const parts = MESH_SLUGS.map((slug) => {
    const node = nodeBySlug(doc, slug);
    if (!node?.getMesh()) fail(`part "${slug}" missing`);
    return {
      slug,
      triangles: triangles(node.getMesh()),
      bounds: getBounds(node),
      matrix: node.getMatrix(),
    };
  });
  const names = doc
    .getRoot()
    .listNodes()
    .map((n) => n.getName())
    .sort();
  return { parts, names };
}

function assertParity(high, lod1) {
  const a = high.names.join("\n");
  const b = lod1.names.join("\n");
  if (a !== b)
    fail(`node names differ between GLBs:\nhigh:\n${a}\nlod1:\n${b}`);
  for (const [i, part] of high.parts.entries()) {
    const other = lod1.parts[i].matrix;
    if (part.matrix.some((v, j) => v !== other[j])) {
      fail(`transform of "${part.slug}" differs between GLBs`);
    }
  }
}

function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function mm(value) {
  return (value * 1000).toFixed(1);
}

function writeReport(high, lod1, sizes) {
  const total = (d) => d.parts.reduce((sum, p) => sum + p.triangles, 0);
  const rows = high.parts.map((p, i) => {
    const { min, max } = p.bounds;
    const box = [0, 1, 2]
      .map((axis) => `${mm(min[axis])} → ${mm(max[axis])}`)
      .join(" / ");
    return `| \`${p.slug}\` | ${p.triangles.toLocaleString("en")} | ${lod1.parts[i].triangles.toLocaleString("en")} | ${box} |`;
  });
  const report = `# Model Report — FCU Double Shaft Motor

Generated by \`npm run models:optimize\` from \`assets-src/fcu-double-shaft/final_assembly.gltf\`. Do not edit by hand.

## Files

| File | Size | Triangles | Budget |
| --- | --- | --- | --- |
| \`public/models/fcu-double-shaft.glb\` | ${kb(sizes.high)} | ${total(high).toLocaleString("en")} | < ${kb(BUDGET.high.bytes)} |
| \`public/models/fcu-double-shaft.lod1.glb\` | ${kb(sizes.lod1)} | ${total(lod1).toLocaleString("en")} | < ${kb(BUDGET.lod1.bytes)}, ≤ ${BUDGET.lod1.triangles.toLocaleString("en")} tris |

Pipeline: rename → drop CAD camera and materials → dedup → weld → prune → single buffer → quantise → (LOD1: simplify) → reorder → meshopt. Both files have the same node names and transforms (checked by the script).

## Parts

World-space bounds in mm, assembled, from the high GLB.

| Slug | High tris | LOD1 tris | Bounds X / Y / Z (mm) |
| --- | --- | --- | --- |
${rows.join("\n")}
`;
  writeFileSync(OUT_REPORT, report);
}

function generateComponent() {
  // Codegen only, never `--transform` (it joins meshes and uses Draco).
  // Precision 6: transforms carry quantisation scales and sub-millimetre
  // offsets; the default 3 digits would misplace nested parts.
  mkdirSync(join(OUT_GEN, ".."), { recursive: true });
  execFileSync(
    join(root, "node_modules/.bin/gltfjsx"),
    [
      relative(root, OUT_HIGH),
      "--types",
      "--keepnames",
      "--keepgroups",
      "--precision",
      "6",
      // A filesystem dir: the load URL is the GLB path relative to it.
      "--root",
      "public",
      "--output",
      relative(root, OUT_GEN),
    ],
    { cwd: root, stdio: "inherit" },
  );
  // Format first so the fixes below match one known layout, then again after.
  const format = () =>
    execFileSync(
      join(root, "node_modules/.bin/biome"),
      ["format", "--write", OUT_GEN],
      { cwd: root, stdio: "ignore" },
    );
  format();
  postprocessComponent();
  format();
}

// gltfjsx 6.5 targets React 18 types. Each fix is an exact replacement that
// fails loudly if gltfjsx output changes, rather than silently not applying.
const COMPONENT_FIXES = [
  // React 19 has no global JSX namespace; R3F exports the element types.
  // `GLTF` stays from three-stdlib (drei's own dependency): it is the type
  // `useGLTF` returns, and three's own GLTF type does not convert to it.
  [
    'import { GLTF } from "three-stdlib";',
    'import type { ThreeElements } from "@react-three/fiber";\nimport type { GLTF } from "three-stdlib";\nimport { checkFcuModel } from "../checkFcuModel";',
  ],
  ['JSX.IntrinsicElements["group"]', 'ThreeElements["group"]'],
  // `useGLTF(...) as GLTFResult` does not typecheck (drei's loose node map
  // is not comparable to the literal one), so a runtime guard narrows it.
  ["= useGLTF(", "= checkFcuModel(useGLTF("],
  [") as GLTFResult;", "));"],
  // The wrapper (Phase 05) types `nodes` against this, so it is exported.
  ["type GLTFResult = GLTF & {", "export type GLTFResult = GLTF & {"],
  // The model has no animations, so gltfjsx never declares GLTFAction.
  ["  animations: GLTFAction[];\n", ""],
  ['import React from "react";\n', ""],
];

function postprocessComponent() {
  let source = readFileSync(OUT_GEN, "utf8");
  for (const [from, to] of COMPONENT_FIXES) {
    if (!source.includes(from))
      fail(`gltfjsx output changed: "${from}" not found`);
    source = source.replace(from, to);
  }
  writeFileSync(OUT_GEN, source);
}

const high = await prepare();
const lod1 = cloneDocument(high);
await simplifyLod1(lod1);

const sizes = {
  high: await finish(high, OUT_HIGH),
  lod1: await finish(lod1, OUT_LOD1),
};

// Checks run on the written files, as the browser will load them.
await MeshoptDecoder.ready;
const highInfo = describe(await io.read(OUT_HIGH));
const lod1Info = describe(await io.read(OUT_LOD1));
assertParity(highInfo, lod1Info);
writeReport(highInfo, lod1Info, sizes);
generateComponent();

const lod1Triangles = lod1Info.parts.reduce((sum, p) => sum + p.triangles, 0);
console.log(
  `high ${kb(sizes.high)}, lod1 ${kb(sizes.lod1)} / ${lod1Triangles} tris`,
);
if (sizes.high >= BUDGET.high.bytes) fail("high GLB over budget");
if (sizes.lod1 >= BUDGET.lod1.bytes) fail("LOD1 GLB over budget");
if (lod1Triangles > BUDGET.lod1.triangles) fail("LOD1 over triangle budget");
