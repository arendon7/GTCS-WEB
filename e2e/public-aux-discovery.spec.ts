import { test, expect } from "@playwright/test";

const publicOrigin = "https://greenatics.com.co";

const routes = [
  {
    path: "/soluciones/diagnostico-inicial",
    breadcrumb: ["Greenatics", "Soluciones", "Diagnóstico inicial"],
  },
  {
    path: "/wondergreen/productos",
    breadcrumb: ["Greenatics", "Wondergreen", "Productos"],
  },
  {
    path: "/biblioteca/manual-uso-wondergreen",
    breadcrumb: ["Greenatics", "Biblioteca", "Manual de uso Wondergreen"],
  },
  {
    path: "/biblioteca/criterios-nutricionales",
    breadcrumb: ["Greenatics", "Biblioteca", "Criterios nutricionales"],
  },
] as const;

function normalizeUrl(value: string, base = publicOrigin) {
  return new URL(value, base).toString();
}

for (const route of routes) {
  test(`auxiliary public discovery is route-specific: ${route.path}`, async ({ page }) => {
    await page.goto(route.path);

    const expectedUrl = normalizeUrl(route.path);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    expect(normalizeUrl((await canonical.getAttribute("href")) ?? "")).toBe(expectedUrl);

    const pageTitle = await page.title();
    const description = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";
    expect(pageTitle).not.toBe("");
    expect(description).not.toBe("");

    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", pageTitle);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", description);
    expect(normalizeUrl((await page.locator('meta[property="og:url"]').getAttribute("content")) ?? "")).toBe(expectedUrl);
    await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", "Greenatics");
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute("content", "es_CO");
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website");

    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary");
    await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", pageTitle);
    await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", description);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(0);

    const jsonLdBlocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const breadcrumbs = jsonLdBlocks
      .map((block) => JSON.parse(block) as { "@type"?: string; itemListElement?: Array<{ name?: string; item?: string }> })
      .filter((block) => block["@type"] === "BreadcrumbList");

    expect(breadcrumbs).toHaveLength(1);
    const items = breadcrumbs[0]?.itemListElement ?? [];
    expect(items.map((item) => item.name)).toEqual(route.breadcrumb);
    expect(normalizeUrl(items.at(-1)?.item ?? "")).toBe(expectedUrl);
  });
}
