import { test, expect } from "@playwright/test";

const canonicalOrigin = "https://greenatics.com.co";

const publicRoutes = [
  "/",
  "/soluciones",
  "/soluciones/diagnostico-caracterizacion",
  "/wondergreen",
  "/wondergreen/cultivos",
  "/wondergreen/cultivos/cafe",
  "/proyectos",
  "/proyectos/yarumal",
  "/impacto",
  "/biblioteca",
  "/biblioteca/guia-deficiencias",
  "/nosotros",
  "/contacto",
] as const;

for (const route of publicRoutes) {
  test(`public SEO contract: ${route}`, async ({ page }) => {
    await page.goto(route);

    await expect(page).toHaveTitle(/.+/);
    expect(await page.title()).not.toContain("GREENATICS OPS");

    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveCount(1);
    expect((await description.getAttribute("content"))?.trim().length ?? 0).toBeGreaterThan(20);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute("href", `${canonicalOrigin}${route === "/" ? "/" : route}`);
  });
}

test("crop canonicals remain specific and do not collapse to the crop index", async ({ page }) => {
  await page.goto("/wondergreen/cultivos/cafe");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    `${canonicalOrigin}/wondergreen/cultivos/cafe`,
  );
});
