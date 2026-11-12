import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

test("portfolio separates service audiences from the Casa y Jardín product route", () => {
  const root = process.cwd();
  const source = read("src/app/portafolio/page.tsx");
  const normalizedSource = source.replace(/\s+/g, " ");
  const styles = read("src/app/portfolio-v5.css");
  const holdbacks = JSON.parse(read("docs/knowledge/PUBLIC_ASSET_RIGHTS_HOLDBACKS.json")).holdbacks as { asset: string }[];
  const serviceRoutes = source.match(/<Link href="\/(?:municipios|empresas|agroindustria)\/">/g) ?? [];
  const audienceRoutes = source.match(/<Link href="\/(?:municipios|empresas|agroindustria)\/">|<Link href="\/casa-jardin\/#kits-v4-title">/g) ?? [];
  const portfolioHeroAsset = "/services/nosotros-consulting-field-v1.jpg";

  expect(serviceRoutes).toHaveLength(3);
  expect(audienceRoutes).toHaveLength(4);
  expect(source).toContain(`src="${portfolioHeroAsset}"`);
  expect(source).not.toContain("/projects/plant/plant-evidence-08.webp");
  expect(fs.existsSync(path.join(root, "public", portfolioHeroAsset.slice(1)))).toBe(true);
  expect(holdbacks.some(({ asset }) => asset === portfolioHeroAsset)).toBe(false);
  expect(fs.existsSync(path.join(root, "public/projects/plant/plant-evidence-08.webp"))).toBe(false);
  expect(fs.existsSync(path.join(root, "docs/knowledge/held-visual-assets/plant-evidence-08.webp"))).toBe(true);
  expect(source).toContain("Planeación PGIRS, recolección selectiva, infraestructura y operación.");
  expect(source).toContain("PMIRS, logística y aprovechamiento en unidades residenciales, centros comerciales, instituciones y otras sedes.");
  expect(source).toContain("Caracterización y rutas para biomasa, subproductos y efluentes.");
  expect(source).toContain('href="/casa-jardin/#kits-v4-title">');
  expect(source).toContain("Kits de cultivo, productos Wondergreen y guías para plantas, jardines y huertas.");
  expect(source).toContain('aria-label="Familias de productos Wondergreen"');
  expect(source).toContain('href="/wondergreen/#solidos"');
  expect(source).toContain('href="/wondergreen/#liquidos"');
  expect(source).toContain('href="/wondergreen/#bioinsumos"');
  expect(source).toContain('href="/servicios/programas-wondergreen/">\n                Diseñar un programa para mi cultivo');
  expect(normalizedSource).toContain("Si conviene validar la estrategia, acordamos un ensayo");
  expect(styles).toContain("grid-template-columns: repeat(3, minmax(0, 1fr))");
  expect(styles).toContain(".portfolio-product-families {");
  expect(styles).toContain("text-align: left;");
  expect(styles).toContain("hyphens: none;");
  expect(styles).toContain("@media (max-width: 620px)");
  expect(styles).toContain("@media (max-width: 350px)");
  expect(styles).toContain(".portfolio-audience a:hover .portfolio-audience__arrow { transform: none; }");
  expect(styles).toContain("grid-template-columns: repeat(4, minmax(0, 1fr))");
  expect(styles).toContain("@media (max-width: 1100px)");
  expect(styles).not.toContain("background: rgba(255, 255, 255, 0.62)");
});

test("portfolio digital visuals use client-facing descriptions and identify example data", () => {
  const source = read("src/data/portfolio.ts");
  const ecosystem = read("public/tools/greenatics-ecosystem-map.svg");

  expect(source).toContain("Vista de Back 2 Green con datos de ejemplo para organizar fuentes, periodos y evidencias de un inventario climático.");
  expect(source).toContain("Ejemplo de inventario climático · datos de muestra");
  expect(source).toContain("Ilustración de cinco ámbitos de trabajo");
  expect(ecosystem).toContain("Cinco contextos donde los datos ayudan a decidir");
  expect(ecosystem).not.toMatch(/mapa conceptual|esquema conceptual|no representa|sincronización automática/i);
});
