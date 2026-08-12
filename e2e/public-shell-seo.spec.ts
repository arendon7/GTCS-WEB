import { test, expect } from "@playwright/test";

test("public home uses the shared navigation and real routes", async ({ page }) => {
  await page.goto("/");

  const nav = page.getByRole("navigation", { name: "Navegación pública" });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Soluciones" })).toHaveAttribute("href", "/soluciones");
  await expect(nav.getByRole("link", { name: "Wondergreen" })).toHaveAttribute("href", "/wondergreen");
  await expect(nav.getByRole("link", { name: "Proyectos" })).toHaveAttribute("href", "/proyectos");
  await expect(nav.getByRole("link", { name: "Impacto" })).toHaveAttribute("href", "/impacto");
  await expect(page.getByRole("link", { name: "Contacto" }).first()).toHaveAttribute("href", "/contacto");
  await expect(page.getByRole("link", { name: "Acceder a Greenatics" })).toHaveAttribute("href", "/app");
});

test("nested public routes inherit the same shell", async ({ page }) => {
  await page.goto("/soluciones/diagnostico-caracterizacion");

  await expect(page.getByRole("navigation", { name: "Navegación pública" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Diagnóstico y caracterización/i })).toBeVisible();
  await expect(page.getByText("Centro Empresarial Alcalá", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "GREENATICS OPS" })).toHaveAttribute("href", "/app");
});

test("sitemap exposes public routes and robots blocks OPS", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("https://greenatics.com.co/soluciones/diagnostico-caracterizacion");
  expect(sitemapText).toContain("https://greenatics.com.co/proyectos/yarumal");
  expect(sitemapText).toContain("https://greenatics.com.co/wondergreen/cultivos/cafe");
  expect(sitemapText).not.toContain("https://greenatics.com.co/app");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const robotsText = await robots.text();
  expect(robotsText).toContain("Disallow: /app");
  expect(robotsText).toContain("Disallow: /dashboard");
  expect(robotsText).toContain("Sitemap: https://greenatics.com.co/sitemap.xml");
});
