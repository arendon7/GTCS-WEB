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
  ['href="/"', `href="${basePath}/"`],
  ['src="/"', `src="${basePath}/"`],
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

    replacements.forEach(([from, to], index) => {
      const guard = `__GREENATICS_BASE_GUARD_${index}__`;
      content = content.split(to).join(guard);
      content = content.split(from).join(to);
      content = content.split(guard).join(to);
    });

    if (content !== original) fs.writeFileSync(fullPath, content);
  }
}

walk(outDir);
fs.writeFileSync(path.join(outDir, ".nojekyll"), "");
console.log(`Prepared GitHub Pages export for base path ${basePath}`);
