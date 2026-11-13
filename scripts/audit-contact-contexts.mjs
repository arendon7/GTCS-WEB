#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const outputRoot = path.resolve("out");
const formSourcePath = path.resolve("src/components/interactive-contact-form.tsx");

if (!fs.existsSync(outputRoot)) {
  throw new Error("Static export /out not found. Run the site build first.");
}

const formSource = fs.readFileSync(formSourcePath, "utf8");
const contextBlock = formSource
  .split("const contactContexts = {")[1]
  ?.split("} as const satisfies Record<string, ContactContext>")[0];

if (!contextBlock) throw new Error("Could not locate the contactContexts map.");

const contextKeys = new Set(
  [...contextBlock.matchAll(/^  "([^"]+)":/gm)].map((match) => match[1]),
);
const references = new Map();
const htmlFiles = [];
const failures = [];

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(fullPath);
    else if (entry.name.endsWith(".html")) htmlFiles.push(fullPath);
  }
}

walk(outputRoot);

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  for (const match of html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)) {
    const href = match[1].replaceAll("&amp;", "&");

    try {
      const url = new URL(href, "https://greenatics.local");
      if (url.pathname !== "/contacto" && url.pathname !== "/contacto/") continue;

      const key = url.searchParams.get("servicio") || url.searchParams.get("interes");
      if (!key) continue;

      const pages = references.get(key) || new Set();
      pages.add(path.relative(outputRoot, file).replace(/\\/g, "/"));
      references.set(key, pages);
      if (!contextKeys.has(key)) failures.push(`${key} · ${[...pages].join(", ")}`);
    } catch {
      failures.push(`invalid contact URL: ${href} · ${path.relative(outputRoot, file)}`);
    }
  }
}

if (failures.length) {
  console.error("Contact context audit FAIL: static links without a matching context:");
  for (const failure of new Set(failures)) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  const unlinked = [...contextKeys].filter((key) => !references.has(key)).sort();
  console.log(
    `Contact context audit PASS: ${htmlFiles.length} HTML pages, `
      + `${references.size} linked context keys, 0 unresolved.`,
  );
  if (unlinked.length) {
    console.log(
      `Not present as static links (may be used by interactive flows): ${unlinked.join(", ")}`,
    );
  }
}
