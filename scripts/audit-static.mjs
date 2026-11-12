import fs from "node:fs";
import path from "node:path";
import { assertStaticExportFresh } from "./static-export-provenance.mjs";
import { auditServiceIndexHtml } from "./service-index-static-contract.mjs";

const root = path.resolve("out");
if (!fs.existsSync(root)) throw new Error("Static export directory /out not found. Run npm run build first.");
try {
  assertStaticExportFresh(process.cwd(), root);
} catch (error) {
  console.error(`Static QA BLOCKED: ${error.message}`);
  process.exit(1);
}

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
const contactFormSourceFile = path.resolve("src/components/interactive-contact-form.tsx");
const contactFormSource = fs.existsSync(contactFormSourceFile)
  ? fs.readFileSync(contactFormSourceFile, "utf8")
  : "";
const contactContextsMatch = contactFormSource.match(/const contactContexts = \{([\s\S]*?)\} as const satisfies Record<string, ContactContext>;/);
const contactContextKeys = new Set(
  [...(contactContextsMatch?.[1] || "").matchAll(/^\s+"([^"]+)"\s*:/gm)].map((match) => match[1]),
);
if (!contactContextsMatch) errors.push("contact routing audit: unable to read contactContexts registry");
const contactRouteKeys = new Set();
let contactLinkCount = 0;
const imageExtension = /\.(?:png|jpe?g|webp|svg|gif|avif)(?:$|[?#])/i;
const editorialRisks = [
  { label: "exact public dose per plant", pattern: /\b\d+(?:[.,]\d+)?\s*g\s*\/\s*(?:planta|árbol)\b/i },
  { label: "exact public bags per hectare", pattern: /\b\d+(?:[.,]\d+)?\s*bultos?\s*\/\s*ha\b/i },
  { label: "exact public product recipe per liter", pattern: /\b\d+(?:[.,]\d+)?\s*(?:cc|ml)\s*\/\s*l(?:itro)?\b/i },
  { label: "automatic product prescription", pattern: /prescripción (?:correctiva|sugerida|wondergreen)/i },
  { label: "deterministic thermal promise", pattern: /mezcla perfecta.{0,160}(?:36 a 48 horas|cero olores)/i },
  { label: "unsupported product response time", pattern: /quelan? el aluminio.{0,80}48 horas/i },
  { label: "automatic phytosanitary assignment", pattern: /solución biológica asignada/i },
  { label: "unsafe universal claim", pattern: /(?:(?<!no )(?<!ni )garantiza(?:mos)?\b|100% segur[oa]|sin residualidad química)/i },
  { label: "fixed tax-benefit promise", pattern: /(?:25% directo a pagar|56% capex recuperado|19% en equipos)/i },
  { label: "fixed route-savings promise", pattern: /85% menor costo de combustible/i },
  { label: "automatic zero-waste certification", pattern: /certificación vertimiento cero/i },
];
const internalCopyMarkers = [
  { label: "TODO/TBD marker", pattern: /\b(?:TODO|TBD)\b/ },
  { label: "Lorem ipsum", pattern: /lorem ipsum/i },
  { label: "internal editorial note", pattern: /nota interna/i },
  {
    label: "visual production note",
    pattern: /escena editorial(?: ilustrativa| conceptual)?|composición editorial|escena de cultivo|imagen editorial|imagen generada con IA|generada con imagegen|no documenta|no representa un empaque|no representa un caso documentado|registro de archivo|registro fotográfico(?:\s*[·:]\s*(?:támesis|yarumal)|\s+(?:del proceso de|de la ruta selectiva en) (?:támesis|yarumal))|infraestructura documentada|infraestructura.{0,80}documentada en (?:támesis|yarumal)/i,
  },
  { label: "provisional copy", pattern: /texto provisional|contenido pendiente|pendiente de redactar/i },
  { label: "pending image placeholder", pattern: /imagen pendiente|faltante de contenido/i },
];

function visibleTextFromHtml(html) {
  return renderedMarkupFromHtml(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

function renderedMarkupFromHtml(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
}

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
    ? [path.join(root, relative, "index.html")]
    : [path.join(root, relative), path.join(root, `${relative}.html`), path.join(root, relative, "index.html")];
  return candidates.some((candidate) => {
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  });
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

const serviceLandingPaths = [
  "/servicios/diagnostico-residuos/",
  "/servicios/pgirs-pmirs/",
  "/servicios/microrrutas-motocarguero/",
  "/servicios/plantas-modulares/",
  "/servicios/operacion-delegada/",
  "/servicios/greenatics-ops/",
  "/servicios/aprovechamiento-productivo/",
  "/servicios/programas-wondergreen/",
  "/servicios/recoleccion-tratamiento/",
  "/servicios/rehabilitacion-infraestructura/",
  "/servicios/optimizacion-composteras/",
];

for (const route of serviceLandingPaths) {
  const file = path.join(root, route.replace(/^\//, ""), "index.html");
  if (!fs.existsSync(file)) {
    errors.push(`${route}: missing service landing export`);
    continue;
  }
  const html = fs.readFileSync(file, "utf8");
  if (!/<figure[^>]*>[\s\S]*?<img\b/i.test(html)) errors.push(`${route}: service landing is missing its contextual visual`);
}

const serviceIndexFile = path.join(root, "servicios", "index.html");
if (fs.existsSync(serviceIndexFile)) {
  const serviceIndexHtml = fs.readFileSync(serviceIndexFile, "utf8");
  errors.push(...auditServiceIndexHtml(renderedMarkupFromHtml(serviceIndexHtml)));
}

const homeGardenCatalogFile = path.join(root, "casa-jardin", "productos", "index.html");
if (fs.existsSync(homeGardenCatalogFile)) {
  const homeGardenCatalogHtml = fs.readFileSync(homeGardenCatalogFile, "utf8");
  const stageCards = (homeGardenCatalogHtml.match(/<article class="homegarden-product-card homegarden-product-card--/g) || []).length;
  const stageVisuals = (homeGardenCatalogHtml.match(/<figure class="homegarden-product-card__media"><img alt="[^"]{20,}"/g) || []).length;
  if (stageCards < 5 || stageVisuals < 5) errors.push(`/casa-jardin/productos/: expected five stage cards with contextual visuals, found ${stageCards} cards and ${stageVisuals} visual alts`);
  if (/se habilitarán sólo cuando estén reconciliados/i.test(homeGardenCatalogHtml)) errors.push(`/casa-jardin/productos/: internal reconciliation wording must not appear in public catalog`);
}

const productRoot = path.join(root, "wondergreen", "productos");
if (fs.existsSync(productRoot)) {
  const productPages = fs.readdirSync(productRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(productRoot, entry.name, "index.html")))
    .map((entry) => entry.name);
  if (productPages.length < 14) {
    errors.push(`/wondergreen/productos/: expected at least 14 product landings, found ${productPages.length}`);
  }
  for (const slug of productPages) {
    const page = `/wondergreen/productos/${slug}/`;
    const html = fs.readFileSync(path.join(productRoot, slug, "index.html"), "utf8");
    if (!/<h1\b/i.test(html)) errors.push(`${page}: product landing is missing its H1`);
    if (!/product-(?:reference-visual|packshot|stage)|wg-biol-hero__visual/i.test(html)) errors.push(`${page}: product landing is missing a visual product treatment`);
    if (!/href="\/wondergreen\/"/i.test(html)) errors.push(`${page}: product landing is missing its return link to Wondergreen`);
    if (!/href="\/contacto\/[^\"]*interes=wondergreen|href="\/wondergreen\/\/?(?:#productos)?/i.test(html)) errors.push(`${page}: product landing is missing its validation or portfolio route`);
  }
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const page = pagePathFromFile(file);
  const visibleText = visibleTextFromHtml(html);
  const renderedMarkup = renderedMarkupFromHtml(html);
  const h1Count = [...renderedMarkup.matchAll(/<h1\b/gi)].length;

  if (!/<html[^>]+lang="es"/i.test(html)) errors.push(`${page}: missing lang=es`);
  if (!/<meta[^>]+name="description"[^>]+content=/i.test(html)) warnings.push(`${page}: missing meta description`);
  if (!/<meta[^>]+name="viewport"/i.test(html)) errors.push(`${page}: missing viewport meta`);
  if (h1Count !== 1) errors.push(`${page}: expected one rendered H1, found ${h1Count}`);

  for (const risk of editorialRisks) {
    if (risk.pattern.test(html)) errors.push(`${page}: editorial risk detected (${risk.label})`);
  }
  for (const marker of internalCopyMarkers) {
    if (marker.pattern.test(renderedMarkup)) errors.push(`${page}: internal or provisional copy detected (${marker.label})`);
  }
  for (const match of renderedMarkup.matchAll(/<img\b([^>]*)>/gi)) {
    if (!/\balt\s*=/.test(match[1])) errors.push(`${page}: image is missing an alt attribute`);
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
    const openGraphUrlMatch = html.match(/<meta[^>]+property="og:url"[^>]+content="([^"]+)"/i);
    if (openGraphUrlMatch && normalizePathname(openGraphUrlMatch[1]) !== page) {
      errors.push(`${page}: og:url ${openGraphUrlMatch[1]} does not match sitemap route`);
    }
  }

  if ((html.match(/<main\b/gi) || []).length > 1) {
    errors.push(`${page}: nested or duplicate main landmarks detected`);
  }

  for (const match of renderedMarkup.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (target.startsWith("/")) {
      if (!localTargetExists(target)) errors.push(`${page}: broken local target ${target}`);
      if (match[0].startsWith("href=")) {
        try {
          const contactUrl = new URL(target.replace(/&amp;/g, "&"), "https://greenatics.invalid");
          if (contactUrl.pathname === "/contacto/") {
            const routingKey = contactUrl.searchParams.get("servicio") || contactUrl.searchParams.get("interes");
            if (routingKey) {
              contactLinkCount += 1;
              contactRouteKeys.add(routingKey);
              if (!contactContextKeys.has(routingKey)) {
                errors.push(`${page}: contact CTA uses unhandled routing key "${routingKey}"`);
              }
            }
          }
        } catch {
          errors.push(`${page}: invalid contact CTA URL ${target}`);
        }
      }
    }
  }

  if (/\/_next\/image(?:\?|["'])/i.test(renderedMarkup)) {
    errors.push(`${page}: static export contains /_next/image; use direct public assets instead`);
  }

  for (const match of renderedMarkup.matchAll(/(?:src|srcset)="([^"]+)"/g)) {
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
console.log(`Contact routing QA: ${contactLinkCount} rendered links; ${contactRouteKeys.size} unique contexts resolved.`);
if (warnings.length) console.log(`Warnings (${warnings.length}):\n- ${warnings.join("\n- ")}`);
if (errors.length) {
  console.error(`Errors (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}
console.log("Static QA PASS: routes, assets, JSON-LD, indexability, manifest and editorial safeguards are consistent.");
