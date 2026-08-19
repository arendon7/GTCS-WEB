import { test, expect } from "@playwright/test";

const shellRoutes = [
  "/",
  "/wondergreen",
  "/wondergreen/cultivos",
  "/wondergreen/cultivos/cafe",
  "/casa-jardin",
  "/soluciones",
  "/soluciones/esp-municipios",
  "/soluciones/empresas-grandes-generadores",
  "/soluciones/residuos-organicos",
  "/soluciones/infraestructura-plantas",
  "/soluciones/propiedad-horizontal-redes",
  "/soluciones/diagnostico-caracterizacion",
  "/proyectos",
  "/proyectos/yarumal",
  "/impacto",
  "/biblioteca",
  "/biblioteca/guia-deficiencias",
  "/nosotros",
  "/contacto",
];

test("public home uses the shared navigation and real routes", async ({ page }) => {
  await page.goto("/");

  const header = page.getByRole("banner");
  const nav = header.getByRole("navigation", { name: "Navegación pública" });
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link", { name: "Soluciones" })).toHaveAttribute("href", "/soluciones");
  await expect(nav.getByRole("link", { name: "Wondergreen" })).toHaveAttribute("href", "/wondergreen");
  await expect(nav.getByRole("link", { name: "Casa y Jardín" })).toHaveAttribute("href", "/casa-jardin");
  await expect(nav.getByRole("link", { name: "Proyectos" })).toHaveAttribute("href", "/proyectos");
  await expect(nav.getByRole("link", { name: "Impacto" })).toHaveAttribute("href", "/impacto");
  await expect(header.getByRole("link", { name: "Contacto" })).toHaveAttribute("href", "/contacto");
  await expect(header.getByRole("link", { name: "Acceder a Greenatics" })).toHaveAttribute("href", "/app");
});

test("Casa y Jardín stays a real but non-indexed placeholder until its catalog is defined", async ({ page }) => {
  await page.goto("/casa-jardin");

  await expect(page.getByRole("heading", { name: "Casa y Jardín." })).toBeVisible();
  await expect(page.getByText("Próximamente", { exact: true })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
});

test("nested public routes inherit the same shell", async ({ page }) => {
  await page.goto("/soluciones/diagnostico-caracterizacion");

  const header = page.getByRole("banner");
  const footer = page.getByRole("contentinfo");
  await expect(header.getByRole("navigation", { name: "Navegación pública" })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Diagnóstico y caracterización/i })).toBeVisible();
  await expect(footer.getByText(/Centro Empresarial Alcalá/)).toBeVisible();
  await expect(footer.getByRole("link", { name: "GREENATICS OPS" })).toHaveAttribute("href", "/app");
});

test("every governed public route renders exactly one shared shell", async ({ page }) => {
  for (const route of shellRoutes) {
    await page.goto(route);
    await expect(page.locator("header"), `${route} should have one header`).toHaveCount(1);
    await expect(page.locator("footer"), `${route} should have one footer`).toHaveCount(1);
    await expect(page.getByRole("navigation", { name: "Navegación pública" }), `${route} should expose the shared navigation`).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "GREENATICS OPS" }), `${route} should expose the OPS bridge`).toHaveAttribute("href", "/app");
  }
});

test("sitemap exposes public routes and robots blocks OPS", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("https://greenatics.com.co/soluciones/esp-municipios");
  expect(sitemapText).toContain("https://greenatics.com.co/soluciones/empresas-grandes-generadores");
  expect(sitemapText).toContain("https://greenatics.com.co/soluciones/residuos-organicos");
  expect(sitemapText).toContain("https://greenatics.com.co/soluciones/infraestructura-plantas");
  expect(sitemapText).toContain("https://greenatics.com.co/soluciones/propiedad-horizontal-redes");
  expect(sitemapText).toContain("https://greenatics.com.co/soluciones/diagnostico-caracterizacion");
  expect(sitemapText).toContain("https://greenatics.com.co/proyectos/yarumal");
  expect(sitemapText).toContain("https://greenatics.com.co/wondergreen/cultivos/cafe");
  expect(sitemapText).not.toContain("https://greenatics.com.co/casa-jardin");
  expect(sitemapText).not.toContain("https://greenatics.com.co/app");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const robotsText = await robots.text();
  expect(robotsText).toContain("Disallow: /app");
  expect(robotsText).toContain("Disallow: /dashboard");
  expect(robotsText).toContain("Disallow: /login");
  expect(robotsText).toContain("Disallow: /receptions");
  expect(robotsText).toContain("Disallow: /sales");
  expect(robotsText).toContain("Disallow: /supplies");
  expect(robotsText).toContain("Sitemap: https://greenatics.com.co/sitemap.xml");
});
