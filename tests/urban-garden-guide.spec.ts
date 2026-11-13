import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("Mi Huerta returns to a complete web guide and reaches contextual contact", async ({ page }) => {
  await page.goto("/casa-jardin/kits/mi-huerta/");
  await page.getByRole("link", { name: "Consultar Guía Mi Huerta", exact: true }).click();
  await expect(page).toHaveURL(/\/biblioteca\/huertas\//);
  await expect(page.getByText(/Albahaca, cilantro, perejil, tomillo y romero pueden cultivarse por sus hojas/)).toBeVisible();
  await expect(page.locator(".garden-route, .knowledge-card-grid, .home-learning-list, .knowledge-warning")).toHaveCount(0);
  await expect(page.locator('a[href="/downloads/guia-mi-huerta.pdf"]')).toHaveCount(0);
  await page.getByRole("link", { name: "Preparar mi huerta", exact: true }).click();
  await expect(page).toHaveURL(/#preparar-huerta$/);
  await page.getByRole("link", { name: "Consultar mi proyecto de huerta", exact: true }).click();
  await expect(page).toHaveURL(/\/contacto\/\?/);
  const context = new URL(page.url()).searchParams;
  expect(context.get("perfil")).toBe("agro");
  expect(context.get("interes")).toBe("programas-wondergreen");
  expect(context.get("diagnostico")).toBe("Huerta urbana, escolar o comunitaria");
  await expect(page.locator("#contact-details")).toBeVisible();
});

test("garden guide retains distinct contexts and works across desktop tablet and mobile", async ({ page }, testInfo) => {
  for (const width of [1440, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/biblioteca/huertas/", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Huertas escolares y proyectos territoriales", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Orientar el cuidado de mis plantas", exact: true })).toHaveAttribute("href", "/casa-jardin/#diagnostico");
    const image = page.locator(".urban-guide__hero img");
    await expect(image).toBeVisible();
    expect(await image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.filter(({ impact }) => impact === "critical" || impact === "serious"), `${width}px`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}px`).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`garden-${width}.png`), fullPage: true });
  }
});
