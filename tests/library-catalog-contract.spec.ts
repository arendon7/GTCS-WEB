import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { libraryResources } from "../src/data/library";
import { crops } from "../src/data/crops";

const outputPathFor = (route: string) =>
  path.join(process.cwd(), "out", route.replace(/^\/+|\/+$/g, ""), "index.html");
const documentQualityHoldbacks = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "docs/knowledge/PUBLIC_DOCUMENT_QUALITY_HOLDBACKS.json"), "utf8"),
) as { holdbacks: Array<{ asset: string }> };
const heldDocumentPaths = new Set(documentQualityHoldbacks.holdbacks.map((item) => item.asset));

test("biblioteca mantiene un único catálogo con rutas y descargas existentes", async () => {
  const slugs = libraryResources.map((resource) => resource.slug);
  expect(new Set(slugs).size, "resource slugs must be unique").toBe(slugs.length);
  expect(libraryResources).toHaveLength(24);

  for (const resource of libraryResources) {
    expect(resource.status).toBe("publicado");
    expect(
      fs.existsSync(outputPathFor(resource.href)),
      `${resource.href} must exist in the static export for ${resource.slug}`,
    ).toBe(true);

    if (resource.downloadUrl) {
      expect(heldDocumentPaths.has(resource.downloadUrl), `${resource.downloadUrl} must not be linked from ${resource.slug}`).toBe(false);
      expect(resource.downloadPages, `${resource.slug} must declare verified PDF pagination`).toBeGreaterThan(0);
      expect(
        fs.existsSync(path.join(process.cwd(), "public", resource.downloadUrl.replace(/^\//, ""))),
        `${resource.downloadUrl} must exist for ${resource.slug}`,
      ).toBe(true);
    }
  }
});

test("las rutas públicas de cultivo y Casa & Jardín no enlazan documentos retenidos", async () => {
  const publicSources = [
    "src/data/crops.ts",
    "src/data/library.ts",
    "src/app/casa-jardin/guias/page.tsx",
  ];
  for (const sourcePath of publicSources) {
    const source = fs.readFileSync(path.join(process.cwd(), sourcePath), "utf8");
    for (const heldPath of heldDocumentPaths) {
      expect(source, `${sourcePath} must not link ${heldPath}`).not.toContain(heldPath);
    }
  }
});

test("biblioteca publica paginación exacta, filtros accesibles y no inventa protocolos", async () => {
  const html = fs.readFileSync(outputPathFor("/biblioteca/"), "utf8");
  for (const crop of ["cacao", "cafe", "aguacate"]) {
    expect(html).toContain(`href="/wondergreen/cultivos/${crop}/"`);
    expect(html).toContain(`src="/guides/guia-${crop}-cover.webp"`);
    expect(html).toContain(`alt="Portada del programa de campo Wondergreen para ${crop === "cafe" ? "café" : crop}"`);
  }
  expect(html).toContain("aria-label=\"Filtrar recursos por categoría\"");
  expect(html).toContain("aria-pressed=\"true\"");
  expect(html).toContain("Buscar por cultivo, producto o tema");
  expect(html).toMatch(/PDF.{0,40}20<!-- --> páginas/);
  expect(html).toMatch(/PDF.{0,40}13<!-- --> páginas/);
  expect(html).toMatch(/PDF.{0,40}12<!-- --> páginas/);
  expect(html).not.toContain('href="/downloads/guia-mi-huerta.pdf"');
  expect(libraryResources.find((resource) => resource.slug === "huertas")?.downloadUrl).toBeUndefined();
  expect(html).toMatch(/PDF.{0,40}2<!-- --> páginas/);
  expect(html).toContain("Descargar Ficha técnica del fertilizante líquido Biol Wondergreen en PDF, 2 páginas");
  expect(html).not.toContain("POE-01 protocolo báscula");
  expect(html).not.toContain("POE-02 térmico");

  const librarySource = fs.readFileSync(path.join(process.cwd(), "src/data/library.ts"), "utf8");
  expect(librarySource).not.toContain("title: \"Guía Oficial");
});

test("la guía web de tomate no ofrece el PDF retenido y conserva una ruta legible", async () => {
  const html = fs.readFileSync(outputPathFor("/wondergreen/cultivos/tomate-chonto/"), "utf8");
  expect(html).not.toContain('href="/downloads/01_GUIA_WONDERGREEN_TOMATE_CHONTO_V1.pdf"');
  expect(html).not.toContain("Descargar guía breve PDF");
  expect(html).toContain("Usa esta ruta para preparar el manejo de Tomate Chonto.");
  expect(html).toContain("Esta ruta web organiza etapas, señales de campo y variables del lote.");
  expect(html).toContain('href="#ruta-fisiologica">Repasar etapas y señales');
  expect(libraryResources.find((resource) => resource.slug === "tomate-chonto")?.downloadUrl).toBeUndefined();
});

test("la ruta web de Café conserva sus documentos fuente para revisión técnica", async () => {
  const html = fs.readFileSync(outputPathFor("/wondergreen/cultivos/cafe/"), "utf8");
  expect(html).toContain('href="/downloads/guia-wondergreen-cafe.pdf"');
  expect(html).toContain('href="/downloads/MANUAL_TECNICO_WONDERGREEN_CAFE_PROFUNDO_20P.pdf"');
  expect(html).toContain("Empieza por la guía breve o consulta el manual ampliado");
  const coffee = crops.find((crop) => crop.slug === "cafe");
  expect(coffee?.pdfFile).toBe("/downloads/guia-wondergreen-cafe.pdf");
  expect(coffee?.technicalManualFile).toBe("/downloads/MANUAL_TECNICO_WONDERGREEN_CAFE_PROFUNDO_20P.pdf");
  expect(libraryResources.find((resource) => resource.slug === "cafe")?.downloadUrl).toBeUndefined();
});

test("la ruta web de cacao conserva sus documentos fuente para revisión técnica", async () => {
  const html = fs.readFileSync(outputPathFor("/wondergreen/cultivos/cacao/"), "utf8");
  expect(html).toContain('href="/downloads/guia-wondergreen-cacao.pdf"');
  expect(html).toContain('href="/downloads/MANUAL_TECNICO_WONDERGREEN_CACAO_PROFUNDO_20P.pdf"');
  expect(html).toContain("Empieza por la guía breve o consulta el manual ampliado");
  const cacao = crops.find((crop) => crop.slug === "cacao");
  expect(cacao?.pdfFile).toBe("/downloads/guia-wondergreen-cacao.pdf");
  expect(cacao?.technicalManualFile).toBe("/downloads/MANUAL_TECNICO_WONDERGREEN_CACAO_PROFUNDO_20P.pdf");
  expect(libraryResources.find((resource) => resource.slug === "cacao")?.downloadUrl).toBeUndefined();
});

test("la ruta web de aguacate conserva sus documentos fuente para revisión técnica", async () => {
  const html = fs.readFileSync(outputPathFor("/wondergreen/cultivos/aguacate/"), "utf8");
  expect(html).toContain('href="/downloads/guia-wondergreen-aguacate.pdf"');
  expect(html).toContain('href="/downloads/MANUAL_TECNICO_WONDERGREEN_AGUACATE_PROFUNDO_20P.pdf"');
  expect(html).toContain("Empieza por la guía breve o consulta el manual ampliado");
  const avocado = crops.find((crop) => crop.slug === "aguacate");
  expect(avocado?.pdfFile).toBe("/downloads/guia-wondergreen-aguacate.pdf");
  expect(avocado?.technicalManualFile).toBe("/downloads/MANUAL_TECNICO_WONDERGREEN_AGUACATE_PROFUNDO_20P.pdf");
  expect(libraryResources.find((resource) => resource.slug === "aguacate")?.downloadUrl).toBeUndefined();
});

test("el buscador usa productos y biblioteca canónicos y no conserva claims de cosecha obsoletos", async () => {
  const source = fs.readFileSync(path.join(process.cwd(), "src/components/universal-search-modal.tsx"), "utf8");
  expect(source).toContain("products.map((product)");
  expect(source).toContain("libraryResources");
  expect(source).toContain('import { digitalTools } from "@/data/digital-tools";');
  expect(source).toContain("const digitalToolSearchItems: SearchItem[] = digitalTools.map");
  expect(source).toContain('category: "Herramientas"');
  expect(source).toContain("/wondergreen/productos/${product.slug}/");
  expect(source).toContain("normalize(item.title).includes(normalizedQuery)");
  expect(source).not.toContain("Brix >15");
  expect(source).not.toContain("calibres 14-22 de exportación");
  expect(source).not.toContain("Ahorro real anti-lixiviación");
  expect(source).not.toContain("proyecta flujos de materia orgánica");
  expect(source).toContain('title: "Acceso a herramientas", category: "Herramientas", url: "/acceso/"');
  expect(source).toContain("Consulta muestras públicas, entornos de trabajo y opciones para solicitar acceso.");
  expect(source).not.toContain("Portal de Plataformas Internas & Acceso");
  expect(source).not.toContain('category: "Soluciones", url: "/app/"');
});
