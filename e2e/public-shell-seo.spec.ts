import { test, expect, type Page, type TestInfo } from "@playwright/test";

const shellRoutes = [
  "/", "/wondergreen", "/wondergreen/cultivos", "/wondergreen/cultivos/cafe",
  "/casa-jardin", "/casa-jardin/diagnostico", "/casa-jardin/guias",
  "/soluciones", "/soluciones/esp", "/soluciones/municipios", "/soluciones/empresas",
  "/soluciones/propiedad-horizontal", "/soluciones/plantas",
  "/soluciones/residuos-organicos", "/soluciones/infraestructura-plantas", "/soluciones/propiedad-horizontal-redes",
  "/soluciones/diagnostico-caracterizacion", "/recursos", "/proyectos", "/proyectos/yarumal", "/impacto",
  "/biblioteca", "/biblioteca/guia-deficiencias", "/nosotros", "/contacto",
];

function isMobile(testInfo: TestInfo) {
  return testInfo.project.name === "mobile-chromium";
}

async function openMobileShell(page: Page) {
  const toggle = page.getByRole("button", { name: "Abrir navegación" });
  await expect(toggle).toBeVisible();
  await toggle.click();
  const dialog = page.getByRole("dialog", { name: "Navegación Greenatics" });
  await expect(dialog).toBeVisible();
  return dialog;
}

test("public home uses the canonical shell V2 and real routes", async ({ page }, testInfo) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  const footer = page.getByRole("contentinfo");

  if (isMobile(testInfo)) {
    const dialog = await openMobileShell(page);
    await expect(dialog.getByRole("button", { name: /Soluciones/ })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Wondergreen", exact: true })).toHaveAttribute("href", "/wondergreen");
    await expect(dialog.getByRole("link", { name: "Casa & Jardín", exact: true })).toHaveAttribute("href", "/casa-jardin");
    await expect(dialog.getByRole("button", { name: /Recursos/ })).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Nosotros", exact: true })).toHaveAttribute("href", "/nosotros");
    await expect(dialog.getByRole("link", { name: "Hablar con nosotros", exact: true })).toHaveAttribute("href", "/contacto");
    await expect(dialog.getByRole("link", { name: "Ingresar", exact: true })).toHaveAttribute("href", "/app");
  } else {
    const nav = header.getByRole("navigation", { name: "Navegación pública" });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: "Soluciones", exact: true })).toHaveAttribute("href", "/soluciones");
    await expect(nav.getByRole("link", { name: "Wondergreen", exact: true })).toHaveAttribute("href", "/wondergreen");
    await expect(nav.getByRole("link", { name: "Casa & Jardín", exact: true })).toHaveAttribute("href", "/casa-jardin");
    await expect(nav.getByRole("link", { name: "Recursos", exact: true })).toHaveAttribute("href", "/recursos");
    await expect(nav.getByRole("link", { name: "Nosotros", exact: true })).toHaveAttribute("href", "/nosotros");
    await expect(header.getByRole("link", { name: "Hablar con nosotros", exact: true })).toHaveAttribute("href", "/contacto");
    await expect(header.getByRole("link", { name: "Ingresar", exact: true })).toHaveAttribute("href", "/app");
  }

  await expect(footer.getByRole("link", { name: "Recursos", exact: true })).toHaveAttribute("href", "/recursos");
  await expect(footer.getByRole("link", { name: "Casa & Jardín", exact: true })).toHaveAttribute("href", "/casa-jardin");
  await expect(footer.getByRole("link", { name: "Ingresar", exact: true })).toHaveAttribute("href", "/app");
});

test("Resources groups Biblioteca, Proyectos and Impacto without returning them to the primary nav", async ({ page }, testInfo) => {
  await page.goto("/");

  if (isMobile(testInfo)) {
    const dialog = await openMobileShell(page);
    await dialog.getByRole("button", { name: /Recursos/ }).click();
    await expect(dialog.getByRole("link", { name: /Biblioteca/ })).toHaveAttribute("href", "/biblioteca");
    await expect(dialog.getByRole("link", { name: /Proyectos \/ Casos/ })).toHaveAttribute("href", "/proyectos");
    await expect(dialog.getByRole("link", { name: /Impacto/ })).toHaveAttribute("href", "/impacto");
  } else {
    const header = page.getByRole("banner");
    await header.getByRole("button", { name: "Abrir menú Recursos" }).click();
    await expect(header.getByRole("link", { name: /Biblioteca/ })).toHaveAttribute("href", "/biblioteca");
    await expect(header.getByRole("link", { name: /Proyectos \/ Casos/ })).toHaveAttribute("href", "/proyectos");
    await expect(header.getByRole("link", { name: /Impacto/ })).toHaveAttribute("href", "/impacto");
  }
});

test("Casa & Jardín is functional but remains non-indexed until B2C validation closes", async ({ page }) => {
  await page.goto("/casa-jardin");
  await expect(page.getByRole("heading", { name: "Nutrición por etapas para tus plantas." })).toBeVisible();
  await expect(page.getByText("CRECE", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kit Casa Completa" })).toBeVisible();
  await expect(page.getByText(/compra deshabilitada/i).first()).toBeVisible();
  await expect(page.getByText(/Trasplanta & Arranca no aparece como kit disponible/i)).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
});

test("nested public routes inherit the same shell", async ({ page }, testInfo) => {
  await page.goto("/soluciones/diagnostico-caracterizacion");
  const header = page.getByRole("banner");
  const footer = page.getByRole("contentinfo");

  if (isMobile(testInfo)) {
    await expect(header.getByRole("button", { name: "Abrir navegación" })).toBeVisible();
  } else {
    await expect(header.getByRole("navigation", { name: "Navegación pública" })).toBeVisible();
  }

  await expect(page.getByRole("heading", { name: /Diagnóstico y caracterización/i })).toBeVisible();
  await expect(footer.getByText(/Centro Empresarial Alcalá/)).toBeVisible();
  await expect(footer.getByRole("link", { name: "Casa & Jardín", exact: true })).toHaveAttribute("href", "/casa-jardin");
  await expect(footer.getByRole("link", { name: "Ingresar", exact: true })).toHaveAttribute("href", "/app");
});

test("every governed public route renders exactly one shared shell", async ({ page }, testInfo) => {
  for (const route of shellRoutes) {
    await page.goto(route);
    const header = page.getByRole("banner");
    const footer = page.getByRole("contentinfo");
    await expect(page.locator("header"), `${route} should have one header`).toHaveCount(1);
    await expect(page.locator("footer"), `${route} should have one footer`).toHaveCount(1);

    if (isMobile(testInfo)) {
      await expect(header.getByRole("button", { name: "Abrir navegación" }), `${route} should expose the mobile shell trigger`).toBeVisible();
    } else {
      await expect(header.getByRole("navigation", { name: "Navegación pública" }), `${route} should expose the shared navigation`).toBeVisible();
    }

    await expect(footer.getByRole("link", { name: "Casa & Jardín", exact: true }), `${route} should expose the household route in the shared footer`).toHaveAttribute("href", "/casa-jardin");
    await expect(footer.getByRole("link", { name: "Ingresar", exact: true }), `${route} should expose the digital bridge`).toHaveAttribute("href", "/app");
  }
});

test("sitemap exposes canonical audience routes while legacy combined routes stay out", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  const sitemapText = await sitemap.text();
  for (const path of [
    "/soluciones/esp",
    "/soluciones/municipios",
    "/soluciones/empresas",
    "/soluciones/propiedad-horizontal",
    "/soluciones/plantas",
    "/soluciones/residuos-organicos",
    "/soluciones/infraestructura-plantas",
    "/soluciones/propiedad-horizontal-redes",
    "/soluciones/diagnostico-caracterizacion",
    "/recursos",
    "/biblioteca",
  ]) expect(sitemapText).toContain(`https://greenatics.com.co${path}`);
  expect(sitemapText).not.toContain("https://greenatics.com.co/soluciones/esp-municipios");
  expect(sitemapText).not.toContain("https://greenatics.com.co/soluciones/empresas-grandes-generadores");
  expect(sitemapText).toContain("https://greenatics.com.co/proyectos/yarumal");
  expect(sitemapText).toContain("https://greenatics.com.co/wondergreen/cultivos/cafe");
  expect(sitemapText).not.toContain("https://greenatics.com.co/casa-jardin");
  expect(sitemapText).not.toContain("https://greenatics.com.co/app");

  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  const robotsText = await robots.text();
  for (const path of ["/app", "/dashboard", "/login", "/receptions", "/sales", "/supplies"]) expect(robotsText).toContain(`Disallow: ${path}`);
  expect(robotsText).toContain("Sitemap: https://greenatics.com.co/sitemap.xml");
});
