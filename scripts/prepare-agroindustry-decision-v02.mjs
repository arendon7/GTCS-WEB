#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "public/diagrams/agroindustria-decision-v02");
const embeddedAssets = [
  { file: "agroindustria-material-stream-v02.jpg", mime: "image/jpeg" },
  { file: "greenatics-horizontal-logo-v1.png", mime: "image/png" },
];

for (const variant of ["desktop", "mobile"]) {
  const svgPath = path.join(dir, `agroindustria-decision-${variant}.svg`);
  let svg = readFileSync(svgPath, "utf8");

  for (const { file, mime } of embeddedAssets) {
    const asset = readFileSync(path.join(dir, file)).toString("base64");
    const pattern = new RegExp(`href="(?:${file}|data:${mime};base64,[^"]+)"`, "g");
    const matches = svg.match(pattern) ?? [];
    if (matches.length !== 1) {
      throw new Error(`${path.basename(svgPath)} debe contener exactamente una referencia a ${file}; encontradas: ${matches.length}.`);
    }
    svg = svg.replace(pattern, `href="data:${mime};base64,${asset}"`);
  }

  writeFileSync(svgPath, svg);
  console.log(`Prepared self-contained ${path.basename(svgPath)} (${Buffer.byteLength(svg)} bytes).`);
}
