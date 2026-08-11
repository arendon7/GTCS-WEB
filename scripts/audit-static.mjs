import fs from "node:fs";
import path from "node:path";

const root = path.resolve("out");
if (!fs.existsSync(root)) throw new Error("Static export directory /out not found. Run npm run build first.");

const htmlFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}
walk(root);

const errors = [];
const warnings = [];

function localTargetExists(raw) {
  const clean = raw.split("#")[0].split("?")[0];
  if (!clean || clean === "/") return fs.existsSync(path.join(root, "index.html"));
  if (!clean.startsWith("/")) return true;
  if (clean.startsWith("/_next/")) return true;
  const relative = clean.replace(/^\//, "");
  const candidates = clean.endsWith("/")
    ? [path.join(root, relative, "index.html"), path.join(root, relative)]
    : [path.join(root, relative), path.join(root, `${relative}.html`), path.join(root, relative, "index.html")];
  return candidates.some((candidate) => fs.existsSync(candidate));
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const page = "/" + path.relative(root, file).replace(/\\/g, "/").replace(/index\.html$/, "");

  if (!/<html[^>]+lang="es"/i.test(html)) errors.push(`${page}: missing lang=es`);
  if (!/<meta[^>]+name="description"[^>]+content=/i.test(html)) warnings.push(`${page}: missing meta description`);
  if (!/<meta[^>]+name="viewport"/i.test(html)) errors.push(`${page}: missing viewport meta`);

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (target.startsWith("/") && !localTargetExists(target)) errors.push(`${page}: broken local target ${target}`);
  }

  for (const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); }
    catch { errors.push(`${page}: invalid JSON-LD`); }
  }
}

const sitemap = path.join(root, "sitemap.xml");
const robots = path.join(root, "robots.txt");
if (!fs.existsSync(sitemap)) errors.push("missing sitemap.xml");
if (!fs.existsSync(robots)) errors.push("missing robots.txt");

console.log(`Static QA: ${htmlFiles.length} HTML pages checked.`);
if (warnings.length) console.log(`Warnings (${warnings.length}):\n- ${warnings.join("\n- ")}`);
if (errors.length) {
  console.error(`Errors (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("Static QA PASS: internal routes/assets and JSON-LD are consistent.");
