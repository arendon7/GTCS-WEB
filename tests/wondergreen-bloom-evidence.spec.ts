import { expect, test } from "@playwright/test";

test("2BLOOM explains its phosphorus profile and keeps the evidence readable", async ({ page }) => {
  await page.goto("/wondergreen/productos/2bloom-liquido/#evidencia-fosforo");

  const section = page.locator("#evidencia-fosforo");
  await expect(section.getByRole("heading", { name: "Un perfil alto en fósforo. La respuesta se define en cada lote." })).toBeVisible();
  await expect(section).toContainText("30-80-30");
  await expect(section).toContainText("+32,6%");
  await expect(section).toContainText("Cenicafé");
  await expect(section.locator("blockquote")).toContainText("fósforo como valor destacado de la fórmula");
  await expect(section).toContainText("análisis foliar");
  await expect(section.getByRole("link", { name: /Scientia Horticulturae/ })).toHaveAttribute("href", "https://doi.org/10.1016/j.scienta.2020.109596");
  await expect(section.getByRole("link", { name: /Cenicafé/ })).toHaveAttribute("href", "https://biblioteca.cenicafe.org/handle/10778/4297");

  const layout = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    section: document.querySelector("#evidencia-fosforo")?.getBoundingClientRect().toJSON(),
    formula: document.querySelector("#evidencia-fosforo figure")?.getBoundingClientRect().toJSON(),
    articles: [...document.querySelectorAll("#evidencia-fosforo article")].map((article) => article.getBoundingClientRect().toJSON()),
    claim: document.querySelector("#evidencia-fosforo blockquote")?.getBoundingClientRect().toJSON(),
  }));

  expect(layout.document).toBeLessThanOrEqual(layout.viewport);
  expect(layout.section).toBeTruthy();
  expect(layout.formula).toBeTruthy();
  expect(layout.articles).toHaveLength(2);
  expect(layout.claim).toBeTruthy();
  for (const box of [layout.section, layout.formula, ...layout.articles, layout.claim]) {
    expect(box!.left).toBeGreaterThanOrEqual(-1);
    expect(box!.right).toBeLessThanOrEqual(layout.viewport + 1);
  }
});
