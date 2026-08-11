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

function normalizePathname(value) {
  if (!value || value === "/") return "/";
  const pathname = value.startsWith("http") ? new URL(value).pathname : value;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function pagePathFromFile(file) {
  const relative = path.relative(root, file).replace(/\\/g, "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) return `/${relative.replace(/\/index\.html$/, "")}/`;
  return normalizePathname(`/${relative.replace(/\.html$/, "")}`);
}

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

const sitemapFile = path.join(root, "sitemap.xml");
const robotsFile = path.join(root, "robots.txt");
const manifestFile = path.join(root, "manifest.webmanifest");

if (!fs.existsSync(sitemapFile)) errors.push("missing sitemap.xml");
if (!fs.existsSync(robotsFile)) errors.push("missing robots.txt");
if (!fs.existsSync(manifestFile)) errors.push("missing manifest.webmanifest");

const sitemapPaths = new Set();
if (fs.existsSync(sitemapFile)) {
  const xml = fs.readFileSync(sitemapFile, "utf8");
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    sitemapPaths.add(normalizePathname(match[1]));
  }
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const page = pagePathFromFile(file);

  if (!/<html[^>]+lang="es"/i.test(html)) errors.push(`${page}: missing lang=es`);
  if (!/<meta[^>]+name="description"[^>]+content=/i.test(html)) warnings.push(`${page}: missing meta description`);
  if (!/<meta[^>]+name="viewport"/i.test(html)) errors.push(`${page}: missing viewport meta`);

  const robotsMatch = html.match(/<meta[^>]+name="robots"[^>]+content="([^"]+)"/i);
  const noindex = robotsMatch?.[1]?.toLowerCase().includes("noindex") ?? false;
  if (noindex && sitemapPaths.has(page)) errors.push(`${page}: noindex page must not appear in sitemap`);

  if (sitemapPaths.has(page)) {
    const canonicalMatch = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/i);
    if (!canonicalMatch) warnings.push(`${page}: indexable sitemap page has no explicit canonical`);
    else if (normalizePathname(canonicalMatch[1]) !== page) {
      errors.push(`${page}: canonical ${canonicalMatch[1]} does not match sitemap route`);
    }
  }

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (target.startsWith("/") && !localTargetExists(target)) errors.push(`${page}: broken local target ${target}`);
  }

  for (const match of html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); }
    catch { errors.push(`${page}: invalid JSON-LD`); }
  }
}

for (const route of sitemapPaths) {
  const file = route === "/"
    ? path.join(root, "index.html")
    : path.join(root, route.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(file)) errors.push(`${route}: sitemap points to missing exported HTML`);
}

console.log(`Static QA: ${htmlFiles.length} HTML pages checked; ${sitemapPaths.size} sitemap routes audited.`);
if (warnings.length) console.log(`Warnings (${warnings.length}):\n- ${warnings.join("\n- ")}`);
if (errors.length) {
  console.error(`Errors (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("Static QA PASS: routes, assets, JSON-LD, indexability and manifest are consistent.");
