import { test, expect } from "@playwright/test";

const routes = [
  "/wondergreen",
  "/wondergreen/cultivos",
  "/wondergreen/cultivos/cafe",
  "/recursos",
  "/impacto",
  "/biblioteca",
  "/biblioteca/guia-deficiencias",
  "/nosotros",
  "/contacto",
] as const;

for (const route of routes) {
  test(`social metadata: ${route}`, async ({ page }) => {
    await page.goto(route);
    const title = page.locator('meta[property="og:title"]');
    await expect(title).toHaveCount(1);
    expect((await title.getAttribute("content")) ?? "").not.toContain("GREENATICS OPS");
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://greenatics.com.co${route}`);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Greenatics");
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "es_CO");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary");
  });
}
