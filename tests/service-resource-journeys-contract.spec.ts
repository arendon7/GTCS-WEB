import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";

const outputPathFor = (route: string) =>
  path.join(process.cwd(), "out", route.replace(/^\/+|\/+$/g, ""), "index.html");

const routesFromServices = [
  "/impacto/",
  "/soluciones/auditoria-sui/",
  "/contacto/?servicio=prefactibilidad",
  "/servicios/optimizacion-composteras/",
  "/tecnologia/",
  "/contacto/?servicio=gerencia-tecnica",
  "/contacto/?servicio=educacion-adopcion",
  "/contacto/?servicio=aseguramiento-tecnico",
  "/proyectos/yarumal/",
  "/proyectos/tamesis/",
];

const routesFromResources = [
  "/municipios/",
  "/app/",
  "/impacto/",
  "/biblioteca/",
  "/casa-jardin/guias/",
  "/proyectos/yarumal/",
  "/proyectos/tamesis/",
  "/biblioteca/guia-deficiencias/",
  "/wondergreen/cultivos/cafe/",
  "/wondergreen/calculadora/",
];

function expectPublishedRoute(sourceHtml: string, route: string) {
  expect(sourceHtml, `source page should link to ${route}`).toContain(`href="${route}"`);
  const pathname = new URL(route, "https://greenatics.test").pathname;
  expect(fs.existsSync(outputPathFor(pathname)), `${route} should have a published destination`).toBe(true);
}

test("servicios conecta especialidades y casos con destinos publicados", async () => {
  const html = fs.readFileSync(outputPathFor("/servicios/"), "utf8");
  expect(html).toContain('aria-label="Familias de servicios"');
  expect((html.match(/class="[^"]*\bgt-service-capabilities__list\b[^"]*"/g) || []).length).toBe(1);

  for (const route of routesFromServices) expectPublishedRoute(html, route);
});

test("recursos orienta por decisión y enlaza biblioteca, casos y herramientas publicadas", async () => {
  const html = fs.readFileSync(outputPathFor("/recursos/"), "utf8");
  expect(html).toContain("¿Qué necesitas resolver hoy?");
  expect((html.match(/class="gt-resource-route-grid"/g) || []).length).toBe(1);
  expect(html).toContain("Muestra pública interactiva");
  expect(html).toContain("La estación usa registros ficticios");
  expect(html).toContain("no está conectada a una planta real.");
  expect(html).toContain("Explorar muestra de OPS");
  expect(html).not.toContain("Entorno público funcional");

  for (const route of routesFromResources) expectPublishedRoute(html, route);
});

test("la estructuración de proyectos públicos conduce a la evaluación de viabilidad municipal", async () => {
  const territory = fs.readFileSync(outputPathFor("/portafolio/territorio/"), "utf8");
  expect(territory).toContain('href="/soluciones/viabilidad-municipal/"');
  expect(territory).toContain("Evaluar la viabilidad del proyecto");
  expect(fs.existsSync(outputPathFor("/soluciones/viabilidad-municipal/"))).toBe(true);

  const feasibility = fs.readFileSync(outputPathFor("/soluciones/viabilidad-municipal/"), "utf8");
  expect(feasibility).toContain("Antes del CAPEX, hay que entender el sistema.");
  expect(feasibility).toContain("Alternativas comparadas con supuestos visibles.");
});
