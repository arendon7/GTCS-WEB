import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("glossary search ignores accents, case and surrounding whitespace", async ({ page }) => {
  await page.goto("/biblioteca/glosario/");
  const search = page.getByLabel("Buscar un término del glosario", { exact: true });
  await search.fill("  OCLUSION  ");
  await expect(page.locator(".glossary-public__terms article")).toHaveCount(1);
  await expect(page.getByRole("status")).toHaveText("1 concepto encontrado");
  await expect(page.locator(".glossary-public__terms h2")).toHaveText("Oclusión en Matriz Orgánica");
  await search.fill("  ");
  await expect(page.locator(".glossary-public__terms article")).toHaveCount(11);
  await page.getByLabel("Tema", { exact: true }).selectOption("Regulatorio");
  await expect(page.locator(".glossary-public__terms article")).toHaveCount(4);
  await search.fill("PMIRS");
  await expect(page.locator(".glossary-public__terms h2")).toHaveText("PMIRS");
});

test("glossary offers explicit recovery after an empty combined search", async ({ page }) => {
  await page.goto("/biblioteca/glosario/");
  await page.getByLabel("Tema", { exact: true }).selectOption("Suelos");
  await page.getByLabel("Buscar un término del glosario", { exact: true }).fill("zzzinexistente");
  await expect(page.getByRole("heading", { name: "No encontramos un concepto con esos filtros.", exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("0 conceptos encontrados");
  await page.getByRole("button", { name: "Ver todos los conceptos", exact: true }).click();
  await expect(page.getByLabel("Tema", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Buscar un término del glosario", { exact: true })).toHaveValue("");
  await expect(page.locator(".glossary-public__terms article")).toHaveCount(11);
});

test("glossary controls and empty state fit desktop tablet and narrow mobile", async ({ page }, testInfo) => {
  for (const width of [1440, 768, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/biblioteca/glosario/", { waitUntil: "networkidle" });
    for (const empty of [false, true]) {
      if (empty) await page.getByLabel("Buscar un término del glosario", { exact: true }).fill("zzzinexistente");
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      expect(result.violations.filter(({ impact }) => impact === "critical" || impact === "serious")).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
      await page.screenshot({ path: testInfo.outputPath(`glossary-${width}-${empty ? "empty" : "all"}.png`), fullPage: true });
    }
  }
});
