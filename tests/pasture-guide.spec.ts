import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("pasture guide preserves references and completes both next-step journeys", async ({ page }) => {
  await page.goto("/biblioteca/pastos-gramineas/");
  await expect(page.locator(".field-question-list, .knowledge-card-grid, .knowledge-warning")).toHaveCount(0);
  await expect(page.getByText(/Capítulo \d/)).toHaveCount(0);
  await page.getByRole("link", { name: "Explorar la ruta para pastos y praderas", exact: true }).click();
  await expect(page).toHaveURL(/\/wondergreen\/cultivos\/pastos-gramineas\//);
  await expect(page.locator("h1")).toContainText("Pastos");
  await page.goto("/biblioteca/pastos-gramineas/");
  await page.getByRole("link", { name: "Solicitar acompañamiento para mi pradera", exact: true }).click();
  await expect(page).toHaveURL(/\/contacto\/\?/);
  expect(new URL(page.url()).searchParams.get("perfil")).toBe("agro");
  expect(new URL(page.url()).searchParams.get("diagnostico")).toBe("Pastos y praderas");
  await expect(page.locator("#contact-details")).toBeVisible();
});

test("pasture guide is readable with a bounded illustration at desktop, tablet and mobile", async ({ page }, testInfo) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/biblioteca/pastos-gramineas/", { waitUntil: "networkidle" });
    const cover = page.getByRole("img", { name: "Portada de la Guía Wondergreen para pastos y praderas", exact: true });
    await expect(cover).toBeVisible();
    const image = await cover.evaluate((element) => { const img = element as HTMLImageElement; return { width: img.clientWidth, naturalWidth: img.naturalWidth }; });
    expect(image.width).toBeLessThanOrEqual(290);
    expect(image.naturalWidth).toBeGreaterThanOrEqual(image.width);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.filter(({ impact }) => impact === "serious" || impact === "critical"), `${width}px`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}px`).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`pasture-${width}.png`), fullPage: true });
  }
});
