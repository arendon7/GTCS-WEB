import fs from "node:fs";
import path from "node:path";

const outDir = path.resolve("out");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

if (!basePath) {
  console.log("No NEXT_PUBLIC_BASE_PATH set; skipping GitHub Pages post-process.");
  process.exit(0);
}

const textExtensions = new Set([".html", ".js", ".json", ".webmanifest", ".xml", ".txt"]);
const replacements = [
  ["/brand/", `${basePath}/brand/`],
  ["/projects/", `${basePath}/projects/`],
  ["/acceso/", `${basePath}/acceso/`],
];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!textExtensions.has(path.extname(entry.name))) continue;

    let content = fs.readFileSync(fullPath, "utf8");
    const original = content;

    for (const [from, to] of replacements) {
      content = content.split(to).join(`__BASE_GUARD__${to}`);
      content = content.split(from).join(to);
      content = content.split(`__BASE_GUARD__${to}`).join(to);
    }

    if (content !== original) fs.writeFileSync(fullPath, content);
  }
}

walk(outDir);
fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
console.log(`Prepared GitHub Pages export for base path ${basePath}`);
