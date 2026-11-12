import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { crops } from "../src/data/crops";

const routes = [
  ["home", "/"],
  ["servicios", "/servicios/"],
  ["servicio-diagnostico", "/servicios/diagnostico-residuos/"],
  ["servicio-pgirs", "/servicios/pgirs-pmirs/"],
  ["servicio-motocarguero", "/servicios/microrrutas-motocarguero/"],
  ["servicio-plantas", "/servicios/plantas-modulares/"],
  ["servicio-operacion", "/servicios/operacion-delegada/"],
  ["servicio-ops", "/servicios/greenatics-ops/"],
  ["servicio-valorizacion", "/servicios/aprovechamiento-productivo/"],
  ["servicio-wondergreen", "/servicios/programas-wondergreen/"],
  ["soluciones", "/soluciones/"],
  ["solucion-auditoria-sui", "/soluciones/auditoria-sui/"],
  ["solucion-beneficio-tributario", "/soluciones/beneficio-tributario/"],
  ["solucion-biogas-energia", "/soluciones/biogas-energia/"],
  ["solucion-flota-recoleccion", "/soluciones/flota-recoleccion/"],
  ["solucion-podas-municipales", "/soluciones/podas-municipales/"],
  ["solucion-riesgo-lixiviados", "/soluciones/riesgo-lixiviados/"],
  ["solucion-vertimiento-cero", "/soluciones/vertimiento-cero/"],
  ["solucion-viabilidad-municipal", "/soluciones/viabilidad-municipal/"],
  ["parque-ambiental", "/parque-ambiental/"],
  ["wondergreen", "/wondergreen/"],
  ["cultivos", "/wondergreen/cultivos/"],
  ["planificador-agricola", "/wondergreen/calendario-agricola/"],
  ["catalogo-wondergreen", "/biblioteca/catalogo-wondergreen/"],
  ["producto-2grow", "/wondergreen/productos/2grow/"],
  ["producto-2balance", "/wondergreen/productos/2balance/"],
  ["producto-2bloom", "/wondergreen/productos/2bloom/"],
  ["producto-2fruit", "/wondergreen/productos/2fruit/"],
  ["producto-compost", "/wondergreen/productos/compost/"],
  ["producto-bioinsumos", "/wondergreen/productos/bioinsumos/"],
  ["producto-trichoderma", "/wondergreen/productos/bioinsumo-trichoderma/"],
  ["producto-bacillus", "/wondergreen/productos/bioinsumo-bacillus-subtilis/"],
  ["producto-beauveria", "/wondergreen/productos/bioinsumo-beauveria/"],
  ["producto-metarhizium", "/wondergreen/productos/bioinsumo-metarhizium/"],
  ["producto-ajo-aji", "/wondergreen/productos/bioinsumo-ajo-aji/"],
  ["producto-neem", "/wondergreen/productos/bioinsumo-neem/"],
  ["producto-2grow-liquido", "/wondergreen/productos/2grow-liquido/"],
  ["producto-2balance-liquido", "/wondergreen/productos/2balance-liquido/"],
  ["producto-2bloom-liquido", "/wondergreen/productos/2bloom-liquido/"],
  ["producto-2fruit-liquido", "/wondergreen/productos/2fruit-liquido/"],
  ["producto-biol", "/wondergreen/productos/biol/"],
  ["casa-jardin", "/casa-jardin/"],
  ["cotizador", "/wondergreen/cotizador/"],
  ["municipios", "/municipios/"],
  ["empresas", "/empresas/"],
  ["agroindustria", "/agroindustria/"],
  ["tecnologia", "/tecnologia/"],
  ["proyectos", "/proyectos/"],
  ["nosotros", "/nosotros/"],
  ["yarumal", "/proyectos/yarumal/"],
  ["portafolio", "/portafolio/"],
  ["portafolio-wondergreen", "/portafolio/wondergreen/"],
  ["tamesis", "/proyectos/tamesis/"],
  ["biblioteca", "/biblioteca/"],
  ["recursos", "/recursos/"],
  ["impacto", "/impacto/"],
  ["organic-flow-estimator", "/herramientas/estimador-organicos/"],
  ["diagnostico", "/diagnostico/"],
  ["contacto", "/contacto/"],
  ["privacidad", "/legal/privacidad/"],
  ["herramientas", "/herramientas/"],
  ["acceso", "/acceso/"],
  ["plataforma", "/plataforma/"],
  ["usuarios", "/plataforma/usuarios/"],
  ["huella-app", "/huella/"],
  ["ops-app", "/app/"],
  ["red-landing", "/red/"],
  ["red-app", "/red/app/"],
  ["agroway-app", "/agroway/app/"],
  ["agroway-landing", "/agroway/"],
  ["sana-landing", "/sana/"],
  ["sana-app", "/sana/app/"],
  ...crops.map(({ slug }) => [`cultivo-${slug}`, `/wondergreen/cultivos/${slug}/`] as const),
] as const;

const knownRoutes = new Set<string>(routes.map(([, route]) => route));
const exportedRoutes = fs.readdirSync(path.join(process.cwd(), "out"), { recursive: true, encoding: "utf8" })
  .filter((file) => file.endsWith("index.html") && file !== "_not-found/index.html")
  .map((file) => `/${file.slice(0, -"index.html".length).replaceAll(path.sep, "/")}`)
  .sort();
const auditRoutes: Array<readonly [string, string]> = [
  ...routes,
  ...exportedRoutes
    .filter((route) => !knownRoutes.has(route))
    .map((route) => [`export-${route}`, route] as const),
];

for (const [slug, route] of auditRoutes) {
  test(`${slug} has no critical or serious automated accessibility violations`, async ({ page }) => {
    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.status(), `${route} must serve the exported page`).toBe(200);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const blocking = results.violations
      .filter((violation) => violation.impact === "critical" || violation.impact === "serious")
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          failureSummary: node.failureSummary,
        })),
      }));

    expect(blocking, `${route} accessibility blockers`).toEqual([]);
  });
}
