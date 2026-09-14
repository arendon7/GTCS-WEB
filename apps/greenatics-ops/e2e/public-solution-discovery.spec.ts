import { test, expect } from "@playwright/test";

const publicOrigin = "https://greenatics.com.co";

const routes = [
  "/soluciones/esp",
  "/soluciones/municipios",
  "/soluciones/empresas",
  "/soluciones/propiedad-horizontal",
  "/soluciones/plantas",
  "/soluciones/residuos-organicos",
  "/soluciones/infraestructura-plantas",
  "/soluciones/propiedad-horizontal-redes",
  "/soluciones/programas/esp-ready",
  "/soluciones/programas/greenatics-base",
  "/soluciones/programas/pmirs-red",
] as const;

function normalizeUrl(value: string, base = publicOrigin) {
  return new URL(value, base).toString();
}

for (const route of routes) {
  test(`solution discovery metadata is route-specific: ${route}`, async ({ page }) => {
    await page.goto(route);

    const expectedUrl = normalizeUrl(route);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    expect(normalizeUrl((await canonical.getAttribute("href")) ?? "")).toBe(expectedUrl);

    const pageTitle = await page.title();
    const description = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
    expect(pageTitle).not.toBe("");
    expect(pageTitle).not.toContain("GREENATICS OPS");
    expect(description).not.toBe("");

    const ogTitle = page.locator('meta[property="og:title"]');
    const ogDescription = page.locator('meta[property="og:description"]');
    const ogUrl = page.locator('meta[property="og:url"]');
    await expect(ogTitle).toHaveCount(1);
    await expect(ogDescription).toHaveCount(1);
    await expect(ogUrl).toHaveCount(1);
    await expect(ogTitle).toHaveAttribute("content", pageTitle);
    await expect(ogDescription).toHaveAttribute("content", description);
    expect(normalizeUrl((await ogUrl.getAttribute("content")) ?? "")).toBe(expectedUrl);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Greenatics");
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "es_CO");
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");

    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary");
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", pageTitle);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", description);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(0);

    const jsonLdBlocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const breadcrumb = jsonLdBlocks
      .map((block) => JSON.parse(block) as { "@type"?: string; itemListElement?: Array<{ name?: string; item?: string }> })
      .find((block) => block["@type"] === "BreadcrumbList");

    expect(breadcrumb).toBeTruthy();
    const items = breadcrumb?.itemListElement ?? [];
    expect(items.length).toBeGreaterThanOrEqual(3);
    const lastItem = items.at(-1);
    expect(lastItem?.name).toBeTruthy();
    expect(normalizeUrl(lastItem?.item ?? "")).toBe(expectedUrl);
  });
}
