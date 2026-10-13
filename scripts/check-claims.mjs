// Claims report and build check.
//
//   npm run claims:report   every pending/withheld claim, and where it is used
//   npm run claims:check    after `next build`: fails if any pending/withheld
//                           text reached prerendered pages or client chunks
//
// Server bundles are not searched: they hold the whole register by design.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { claims } from "../data/claims.ts";

const root = join(import.meta.dirname, "..");
const unpublished = Object.entries(claims).filter(
  ([, claim]) => claim.status !== "approved",
);

function walk(dir, keep) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path, keep);
    return keep(path) ? [path] : [];
  });
}

function report() {
  // Where each id is referenced. /system is excluded: its pages are
  // specimens and checks, not site content.
  const sources = ["app", "components", "data"]
    .flatMap((dir) => walk(join(root, dir), (p) => /\.tsx?$/.test(p)))
    .filter(
      (p) =>
        !p.endsWith(join("data", "claims.ts")) &&
        !p.includes(join("app", "system")),
    )
    .map((p) => ({ path: relative(root, p), text: readFileSync(p, "utf8") }));

  for (const status of ["withheld", "pending"]) {
    const rows = unpublished.filter(([, claim]) => claim.status === status);
    console.log(`\n${status.toUpperCase()} (${rows.length})\n`);
    for (const [id, claim] of rows) {
      const usedIn = sources
        .filter((file) => file.text.includes(`"${id}"`))
        .map((file) => file.path);
      console.log(`  ${id}`);
      console.log(`    "${claim.text}"`);
      if (claim.source) console.log(`    source: ${claim.source}`);
      console.log(
        `    used in: ${usedIn.length ? usedIn.join(", ") : "not referenced"}`,
      );
    }
  }

  const approved = Object.keys(claims).length - unpublished.length;
  const used = unpublished.filter(([id]) =>
    sources.some((file) => file.text.includes(`"${id}"`)),
  ).length;
  console.log(
    `\n${approved} approved, ${unpublished.length} not approved, ${used} of those referenced by site content.`,
  );
}

// The same text can be HTML-escaped in markup or \u-escaped in JS/RSC.
function variants(text) {
  const html = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#x27;");
  const unicode = text.replace(
    /[^\x20-\x7e]/g,
    (ch) => `\\u${ch.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
  return [...new Set([text, html, unicode])];
}

function checkBuild() {
  const next = join(root, ".next");
  const checkPage = join(next, "server", "app", "system", "claims.html");
  // A check that can't run must fail, not pass vacuously.
  if (!existsSync(checkPage)) {
    console.error(
      `No prerendered ${relative(root, checkPage)}. Run \`npm run build\` first.`,
    );
    process.exit(1);
  }

  // Positive control: the approved sample must be there, or the search below
  // is looking at the wrong output.
  const approvedSample = claims["product.power-range"].text;
  if (!readFileSync(checkPage, "utf8").includes(approvedSample)) {
    console.error(
      `Approved claim "${approvedSample}" missing from the check page; output format changed?`,
    );
    process.exit(1);
  }

  const files = [
    ...walk(join(next, "server", "app"), (p) =>
      /\.(html|rsc|body|meta)$/.test(p),
    ),
    ...walk(join(next, "static"), (p) => p.endsWith(".js")),
  ];
  const leaks = [];
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const [id, claim] of unpublished) {
      if (variants(claim.text).some((v) => text.includes(v))) {
        leaks.push(`${relative(root, file)}: ${id} ("${claim.text}")`);
      }
    }
  }

  if (leaks.length) {
    console.error(
      `Unapproved claim text in build output:\n  ${leaks.join("\n  ")}`,
    );
    process.exit(1);
  }
  console.log(
    `OK: ${unpublished.length} unapproved claims absent from ${files.length} prerendered and client files.`,
  );
}

if (process.argv.includes("--build")) checkBuild();
else report();
