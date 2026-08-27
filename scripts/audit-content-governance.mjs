import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const errors = [];

function read(relativePath) {
  const file = path.join(root, relativePath);
  if (!fs.existsSync(file)) {
    errors.push(`missing required governance source: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

function requireText(source, needle, label) {
  if (!source.includes(needle)) errors.push(`${label}: expected ${JSON.stringify(needle)}`);
}

function forbidText(source, needle, label) {
  if (source.includes(needle)) errors.push(`${label}: forbidden legacy/blocked text ${JSON.stringify(needle)}`);
}

const products = read("src/data/products.ts");
const productPage = read("src/app/wondergreen/productos/[slug]/page.tsx");
const wondergreenPage = read("src/app/wondergreen/page.tsx");
const crops = read("src/data/crops.ts");
const cropPage = read("src/app/wondergreen/cultivos/[slug]/page.tsx");
const quotePage = read("src/app/wondergreen/cotizador/page.tsx");
const quoteBuilder = read("src/components/quote-builder.tsx");
const technology = read("src/app/tecnologia/page.tsx");
const services = read("src/data/services.ts");

// Product publication state must be explicit. Price is not checkout readiness.
requireText(products, "export type ProductPublicationLevel", "products publication model");
requireText(products, 'publicationLevel: "COMMERCIAL_RECONCILED"', "reconciled product state");
requireText(products, 'publicationLevel: "PORTAFOLIO_TECNICO"', "technical product state");
requireText(products, 'return product.publicationLevel === "CHECKOUT_READY";', "checkout helper");

// No product is checkout-ready in this controlled baseline. Future activation requires an explicit governance change.
const checkoutAssignments = [...products.matchAll(/publicationLevel:\s*"CHECKOUT_READY"/g)];
if (checkoutAssignments.length) errors.push(`products: ${checkoutAssignments.length} product(s) marked CHECKOUT_READY without a V1.0 allowlist`);

// Recovered technical presentation truth.
requireText(products, 'slug: "2grow-liquido-200-0-0"', "2GROW technical reference");
requireText(products, 'presentations: ["3,75 L", "20 L", "200 L"]', "technical liquid presentations");
forbidText(products, "peletizada/ocluida", "2GROW mechanism claim");
forbidText(products, '["cuajado y desarrollo según cultivo", "llenado", "fase productiva"]', "2FRUIT generic role");

// Commerce semantics and structured-data gate.
requireText(productPage, "const checkoutReady = isCheckoutReady(product);", "product page checkout gate");
requireText(productPage, "checkoutReady && hasPublicPrice", "Product Offer schema gate");
forbidText(productPage, "Consultar / comprar", "product CTA");
requireText(productPage, "Solicitar cotización", "product CTA");
forbidText(cropPage, "<span>Comprar</span>", "crop CTA");
requireText(cropPage, "<span>Cotizar</span>", "crop CTA");
forbidText(quoteBuilder, "Arma tu pedido", "quote estimator semantics");
requireText(quoteBuilder, "Arma tu estimación", "quote estimator semantics");
forbidText(quotePage, "precios vigentes", "versioned price wording");
requireText(quotePage, "precios reconciliados", "versioned price wording");

// Crop claims hardened without removing diagnostic caveats.
forbidText(crops, "Sostener la fase productiva, calibre y desarrollo del fruto.", "avocado outcome claim");
forbidText(crops, "Impulsar recuperación, color y crecimiento vegetativo.", "pasture outcome verb");

// Technology fails closed to the source strength recovered in V0.7.
forbidText(technology, "UASB + biogás", "technology reactor specificity");
forbidText(technology, "reactor anaerobio tipo UASB", "technology reactor specificity");
requireText(technology, "Metanogénesis + biogás", "technology safe wording");

// Wondergreen hub must not propagate the old 2BLOOM liquid range or collapse Compost into organomineral fertilizer.
forbidText(wondergreenPage, '["2BLOOM", "3-8-3 sólido + 30-80-30 líquido", "Sólido / líquido", "5–40 kg · 1–1000 L"', "Wondergreen 2BLOOM presentation");
requireText(wondergreenPage, "líquido técnico 3,75 L · 20 L · 200 L", "Wondergreen 2BLOOM presentation");
requireText(wondergreenPage, "Compost se presenta como base orgánica y acondicionador", "Compost category boundary");

// Draft extended services must remain outside executable service truth until their activation gates are approved.
const draftServiceSlugs = [
  "huella-carbono",
  "regulatorio-residuos-esp",
  "estructuracion-tarifaria-tratamiento",
  "desarrollo-productos-derivados",
  "transicion-agroecologica",
  "valorizacion-agroindustrial",
  "optimizacion-composteras",
];
for (const slug of draftServiceSlugs) {
  if (services.includes(`slug: "${slug}"`)) errors.push(`draft service leaked into executable services.ts: ${slug}`);
  const route = path.join(root, "src", "app", "servicios", slug);
  if (fs.existsSync(route)) errors.push(`draft service route exists before activation: /servicios/${slug}/`);
}

const espReadyRoute = path.join(root, "src", "app", "esp-ready");
if (fs.existsSync(espReadyRoute)) errors.push("ESP READY route exists before packaged-offer activation gate");

if (errors.length) {
  console.error(`Content governance audit FAILED (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log("Content governance audit PASS: product truth, commerce, technology wording and draft-service gates are consistent.");
