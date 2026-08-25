import { test, expect } from "@playwright/test";

const lines = [
  ["2Grow", "2grow", "Identidad visual aprobada de la línea Wondergreen 2Grow"],
  ["2Balance", "2balance", "Identidad visual aprobada de la línea Wondergreen 2Balance"],
  ["2Bloom", "2bloom", "Identidad visual aprobada de la línea Wondergreen 2Bloom"],
  ["2Fruit", "2fruit", "Identidad visual aprobada de la línea Wondergreen 2Fruit"],
] as const;

test("Wondergreen exposes visual line families before requiring an exact formulation", async ({ page }) => {
  await page.goto("/wondergreen/lineas");

  await expect(page.getByRole("heading", { name: "Una identidad por línea. Una ficha exacta por referencia." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Línea ≠ formulación ≠ presentación." })).toBeVisible();

  for (const [family, slug, alt] of lines) {
    const link = page.getByRole("link", { name: new RegExp(family) }).filter({ has: page.getByRole("img", { name: alt }) });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute("href", `/wondergreen/lineas/${slug}`);
  }

  await expect(page.getByText(/no se presentan como packshots/i)).toBeVisible();
  await expect(page.getByText(/no trasladamos automáticamente una formulación, tecnología/i)).toBeVisible();
});

test("2Grow line separates family identity from exact solid and liquid Product Truth", async ({ page }) => {
  await page.goto("/wondergreen/lineas/2grow");

  await expect(page.getByRole("heading", { name: "2Grow", exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Identidad visual aprobada de la línea Wondergreen 2Grow" })).toBeVisible();
  await expect(page.getByText("3 referencias documentadas", { exact: true })).toBeVisible();
  await expect(page.getByText("2 comerciales reconciliadas", { exact: true })).toBeVisible();

  await expect(page.getByRole("link", { name: /2Grow Sólido/ })).toHaveAttribute("href", "/wondergreen/productos/2grow-solido-15-3-3");
  const liquid100 = page.getByRole("link").filter({ hasText: "2Grow Líquido" }).filter({ hasText: "100-20-20" });
  await expect(liquid100).toHaveCount(1);
  await expect(liquid100).toHaveAttribute("href", "/wondergreen/productos/2grow-liquido-100-20-20");
  await expect(page.getByRole("link", { name: /2Grow Líquido · referencia nitrogenada/ })).toHaveAttribute("href", "/wondergreen/productos/2grow-liquido-200-0-0");

  await expect(page.getByText("15-3-3", { exact: true })).toBeVisible();
  await expect(page.getByText("100-20-20", { exact: true })).toBeVisible();
  await expect(page.getByText("200-0-0", { exact: true })).toBeVisible();
  await expect(page.getByText("5 kg", { exact: true })).toBeVisible();
  await expect(page.getByText("40 kg", { exact: true })).toBeVisible();
  await expect(liquid100.getByText("1 L", { exact: true })).toBeVisible();
  await expect(liquid100.getByText("1000 L", { exact: true })).toBeVisible();

  await expect(page.getByRole("link", { name: "Profundizar en tecnología" })).toHaveAttribute("href", "/wondergreen/tecnologia");
  await expect(page.getByText(/no significa compartir automáticamente una característica tecnológica/i)).toBeVisible();
});

test("product catalog exposes line exploration while keeping exact products primary", async ({ page }) => {
  await page.goto("/wondergreen/productos");
  await expect(page.getByRole("link", { name: "Explorar líneas de producto →" })).toHaveAttribute("href", "/wondergreen/lineas");
  await expect(page.getByRole("link", { name: "Líneas Wondergreen" })).toHaveAttribute("href", "/wondergreen/lineas");
  await expect(page.getByRole("heading", { name: "Empieza por los productos comercialmente reconciliados." })).toBeVisible();
});

test("line routes have canonical metadata and are included in sitemap", async ({ page, request }) => {
  await page.goto("/wondergreen/lineas/2grow");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://greenatics.com.co/wondergreen/lineas/2grow");
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute("content", "https://greenatics.com.co/wondergreen/lineas/2grow");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const text = await sitemap.text();
  expect(text).toContain("https://greenatics.com.co/wondergreen/lineas");
  for (const [, slug] of lines) expect(text).toContain(`https://greenatics.com.co/wondergreen/lineas/${slug}`);
});
