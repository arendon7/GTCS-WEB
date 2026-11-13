import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const held = ["guia-casa-jardin.pdf", "guia-trasplante.pdf", "guia-mi-huerta.pdf"];
test("kits and compost lead to complete web guidance instead of held PDFs", async ({ page }) => {
  for (const [route, name, anchor] of [
    ["/casa-jardin/kits/casa-completa/", "Consultar Guía Casa & Jardín", "observar"],
    ["/casa-jardin/kits/casa-completa-xl/", "Consultar Guía Casa & Jardín", "observar"],
    ["/casa-jardin/productos/compost/", "Consultar Guía de trasplante", "trasplantar"],
  ]) {
    await page.goto(route);
    for (const filename of held) await expect(page.locator('a[href="/downloads/' + filename + '"]')).toHaveCount(0);
    const link = page.getByRole("link", { name, exact: true });
    await expect(link).not.toHaveAttribute("download");
    await link.click();
    await expect(page).toHaveURL(new RegExp("/casa-jardin/guias/#" + anchor + "$"));
    await expect(page.locator("#" + anchor)).toBeInViewport();
    await expect(page.locator("#" + anchor + " h2")).toBeVisible();
  }
  await page.getByRole("link", { name: "Revisar el estado de mi planta", exact: true }).click();
  await expect(page).toHaveURL(/\/casa-jardin\/#diagnostico$/);
  await expect(page.locator("#diagnostico")).toBeInViewport();
});

test("guide index preserves readable care and responsive composition", async ({ page }, testInfo) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/casa-jardin/guias/", { waitUntil: "networkidle" });
    for (const filename of held) await expect(page.locator('a[href="/downloads/' + filename + '"]')).toHaveCount(0);
    await expect(page.getByText(/iteración visual en revisión|borrador de 10 páginas|Ver las revisiones visuales/i)).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Antes de nutrir, entiende cómo está tu planta.", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Un cambio de matera empieza por las raíces.", exact: true })).toBeVisible();
    await expect(page.locator(".care-reading__steps h3")).toHaveCount(4);
    await expect(page.getByText("La proporción depende del sustrato, la planta y las condiciones de cultivo;", { exact: false })).toBeVisible();
    await expect(page.getByText(/QR REAL|se inserta al final|No presentar una proporción universal/)).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    expect(await page.locator(".care-reading img").evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const analysis = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(analysis.violations.filter(({ impact }) => impact === "critical" || impact === "serious"), width + "px").toEqual([]);
    if (width === 1440 || width === 320) await page.screenshot({ path: testInfo.outputPath("care-" + width + ".png"), fullPage: true });
  }
});
