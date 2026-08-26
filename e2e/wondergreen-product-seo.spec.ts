import { test, expect } from "@playwright/test";

type ProductSeoCase = {
  path: `/wondergreen/productos/${string}`;
  title: string;
  description: string;
  breadcrumbName: string;
};

const products: ProductSeoCase[] = [
  {
    path: "/wondergreen/productos/2grow-solido-15-3-3",
    title: "2Grow Sólido 15-3-3 | Wondergreen",
    description: "Línea organomineral para establecimiento, brotación, crecimiento y recuperación vegetativa. Consulta formulación, presentaciones, estado público y documentación Wondergreen vinculada.",
    breadcrumbName: "2Grow Sólido",
  },
  {
    path: "/wondergreen/productos/2grow-liquido-200-0-0",
    title: "2Grow Líquido · referencia nitrogenada 200-0-0 | Wondergreen",
    description: "Referencia adicional con orientación nitrogenada dentro del portafolio técnico. Consulta formulación, presentaciones, estado público y documentación Wondergreen vinculada.",
    breadcrumbName: "2Grow Líquido · referencia nitrogenada",
  },
];

async function metaContent(page: import("@playwright/test").Page, selector: string) {
  const element = page.locator(selector);
  await expect(element).toHaveCount(1);
  return element.getAttribute("content");
}

async function jsonLdByType(page: import("@playwright/test").Page, type: string) {
  const payloads = await page.locator('script[type="application/ld+json"]').allTextContents();
  return payloads
    .map((payload) => JSON.parse(payload) as Record<string, unknown>)
    .find((payload) => payload["@type"] === type);
}

for (const product of products) {
  test(`exact Wondergreen product owns social metadata and breadcrumb: ${product.path}`, async ({ page }) => {
    await page.goto(product.path);

    const expectedUrl = new URL(product.path, "https://greenatics.com.co").toString();
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    expect(new URL((await canonical.getAttribute("href")) ?? "", expectedUrl).toString()).toBe(expectedUrl);

    expect(await metaContent(page, 'meta[property="og:title"]')).toBe(product.title);
    expect(await metaContent(page, 'meta[property="og:description"]')).toBe(product.description);
    expect(new URL((await metaContent(page, 'meta[property="og:url"]')) ?? "").toString()).toBe(expectedUrl);
    expect(await metaContent(page, 'meta[property="og:site_name"]')).toBe("Greenatics");
    expect(await metaContent(page, 'meta[property="og:locale"]')).toBe("es_CO");
    expect(await metaContent(page, 'meta[property="og:type"]')).toBe("website");

    expect(await metaContent(page, 'meta[name="twitter:card"]')).toBe("summary");
    expect(await metaContent(page, 'meta[name="twitter:title"]')).toBe(product.title);
    expect(await metaContent(page, 'meta[name="twitter:description"]')).toBe(product.description);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(0);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(0);

    const breadcrumb = await jsonLdByType(page, "BreadcrumbList");
    expect(breadcrumb).toBeTruthy();
    expect(breadcrumb?.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Greenatics",
        item: "https://greenatics.com.co/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Wondergreen",
        item: "https://greenatics.com.co/wondergreen",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Productos",
        item: "https://greenatics.com.co/wondergreen/productos",
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.breadcrumbName,
        item: expectedUrl,
      },
    ]);
  });
}
