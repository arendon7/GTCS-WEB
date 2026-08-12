import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  ["home", "/"],
  ["servicios", "/servicios/"],
  ["wondergreen", "/wondergreen/"],
  ["producto-bioinsumo", "/wondergreen/productos/bioinsumo-trichoderma/"],
  ["cotizador", "/wondergreen/cotizador/"],
  ["municipios", "/municipios/"],
  ["empresas", "/empresas/"],
  ["tecnologia", "/tecnologia/"],
  ["proyectos", "/proyectos/"],
  ["biblioteca", "/biblioteca/"],
  ["diagnostico", "/diagnostico/"],
  ["contacto", "/contacto/"],
] as const;

for (const [slug, route] of routes) {
  test(`${slug} has no critical or serious automated accessibility violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const blocking = results.violations
      .filter((violation) => violation.impact === "critical" || violation.impact === "serious")
      .map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        targets: violation.nodes.map((node) => node.target),
      }));

    expect(blocking, `${route} accessibility blockers`).toEqual([]);
  });
}
