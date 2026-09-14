import { test, expect } from "@playwright/test";

const publicOrigin = "https://greenatics.com.co";
const cropSlugs = ["cacao", "cafe", "aguacate", "limon-tahiti", "pastos-gramineas"] as const;

function normalizeUrl(value: string, base = publicOrigin) {
  return new URL(value, base).toString();
}

for (const slug of cropSlugs) {
  const route = `/wondergreen/cultivos/${slug}`;

  test(`Wondergreen crop social metadata matches the exact page metadata: ${route}`, async ({ page }) => {
    await page.goto(route);

    const expectedUrl = normalizeUrl(route);
    const pageTitle = await page.title();
    const description = (await page.locator('meta[name="description"]').getAttribute("content")) ?? "";

    expect(pageTitle).not.toBe("");
    expect(description).not.toBe("");

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    expect(normalizeUrl((await canonical.getAttribute("href")) ?? "")).toBe(expectedUrl);

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
    expect(items).toHaveLength(4);
    expect(items.slice(0, 3).map((item) => item.name)).toEqual(["Greenatics", "Wondergreen", "Cultivos"]);
    expect(items.at(-1)?.name).toBeTruthy();
    expect(normalizeUrl(items.at(-1)?.item ?? "")).toBe(expectedUrl);
  });
}
