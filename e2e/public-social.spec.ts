import { test, expect } from "@playwright/test";

const routes = [
  "/",
  "/soluciones",
  "/soluciones/rehabilitacion",
  "/soluciones/gestion-juridica-regulatoria",
  "/soluciones/valorizacion-productos",
  "/proyectos",
  "/proyectos/yarumal",
  "/wondergreen",
  "/wondergreen/tecnologia",
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

    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    const twitterTitle = page.locator('meta[name="twitter:title"]');
    const twitterDescription = page.locator('meta[name="twitter:description"]');

    await expect(ogTitle).toHaveCount(1);
    await expect(ogDescription).toHaveCount(1);
    await expect(twitterTitle).toHaveCount(1);
    await expect(twitterDescription).toHaveCount(1);

    const title = (await ogTitle.getAttribute("content")) ?? "";
    const description = (await ogDescription.getAttribute("content")) ?? "";
    expect(title).not.toContain("GREENATICS OPS");
    expect(title.trim().length).toBeGreaterThan(0);
    expect(description.trim().length).toBeGreaterThan(0);
    await expect(twitterTitle).toHaveAttribute("content", title);
    await expect(twitterDescription).toHaveAttribute("content", description);

    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", `https://greenatics.com.co${route}`);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Greenatics");
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "es_CO");
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary");
  });
}
