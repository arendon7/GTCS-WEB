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
const imageExtension = /\.(?:png|jpe?g|webp|svg|gif|avif)(?:$|[?#])/i;
const editorialRisks = [
  { label: "exact public dose per plant", pattern: /\b\d+(?:[.,]\d+)?\s*g\s*\/\s*(?:planta|árbol)\b/i },
  { label: "exact public bags per hectare", pattern: /\b\d+(?:[.,]\d+)?\s*bultos?\s*\/\s*ha\b/i },
  { label: "exact public product recipe per liter", pattern: /\b\d+(?:[.,]\d+)?\s*(?:cc|ml)\s*\/\s*l(?:itro)?\b/i },
  { label: "automatic product prescription", pattern: /prescripción (?:correctiva|sugerida|wondergreen)/i },
  { label: "deterministic thermal promise", pattern: /mezcla perfecta.{0,160}(?:36 a 48 horas|cero olores)/i },
  { label: "unsupported product response time", pattern: /quelan? el aluminio.{0,80}48 horas/i },
  { label: "automatic phytosanitary assignment", pattern: /solución biológica asignada/i },
  { label: "unsafe universal claim", pattern: /(?:garantiza(?:mos)?\b|100% segur[oa]|sin residualidad química)/i },
  { label: "fixed tax-benefit promise", pattern: /(?:25% directo a pagar|56% capex recuperado|19% en equipos)/i },
  { label: "fixed route-savings promise", pattern: /85% menor costo de combustible/i },
  { label: "automatic zero-waste certification", pattern: /certificación vertimiento cero/i },
];

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

function localAssetExists(raw) {
  const clean = raw.split("#")[0].split("?")[0];
  if (!clean.startsWith("/") || clean.startsWith("/_next/")) return true;
  return fs.existsSync(path.join(root, clean.replace(/^\//, "")));
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

  for (const risk of editorialRisks) {
    if (risk.pattern.test(html)) errors.push(`${page}: editorial risk detected (${risk.label})`);
  }

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

  if (/\/_next\/image(?:\?|["'])/i.test(html)) {
    errors.push(`${page}: static export contains /_next/image; use direct public assets instead`);
  }

  for (const match of html.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
    const targets = match[0].startsWith("srcset=")
      ? match[1].split(",").map((candidate) => candidate.trim().split(/\s+/)[0])
      : [match[1]];
    for (const target of targets) {
      if (imageExtension.test(target) && !localAssetExists(target)) {
        errors.push(`${page}: missing exported image ${target}`);
      }
    }
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
console.log("Static QA PASS: routes, assets, JSON-LD, indexability, manifest and editorial safeguards are consistent.");
