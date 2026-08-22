import { test, expect } from "@playwright/test";

const publicRoutes = [
  "/",
  "/soluciones",
  "/soluciones/esp",
  "/soluciones/municipios",
  "/soluciones/empresas",
  "/soluciones/propiedad-horizontal",
  "/soluciones/plantas",
  "/soluciones/diagnostico-caracterizacion",
  "/wondergreen",
  "/wondergreen/cultivos",
  "/wondergreen/cultivos/cafe",
  "/recursos",
  "/proyectos",
  "/proyectos/yarumal",
  "/impacto",
  "/biblioteca",
  "/biblioteca/guia-deficiencias",
  "/nosotros",
  "/contacto",
] as const;

async function jsonLdByType(page: import("@playwright/test").Page, type: string) {
  const payloads = await page.locator('script[type="application/ld+json"]').allTextContents();
  return payloads.map((payload) => JSON.parse(payload) as Record<string, unknown>).find((payload) => payload["@type"] === type);
}

test("public HOME emits governed Organization structured data", async ({ page }) => {
  await page.goto("/");
  const organization = await jsonLdByType(page, "Organization");

  expect(organization).toBeTruthy();
  expect(organization?.name).toBe("Greenatics");
  expect(organization?.url).toBe("https://greenatics.com.co");
  expect(JSON.stringify(organization)).not.toContain("VERCEL_URL");
});

for (const route of publicRoutes) {
  test(`public main landmark contract: ${route}`, async ({ page }) => {
    await page.goto(route);
    await expect(page.getByRole("main")).toHaveCount(1);
    await expect(page.locator("#public-main")).toHaveCount(1);
  });
}

test("public HOME skip-link moves keyboard focus into the shell-owned main", async ({ page }) => {
  await page.goto("/");

  const skipLink = page.getByRole("link", { name: "Saltar al contenido" });
  const target = page.locator("#public-main");

  await expect(target).toHaveRole("main");
  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#public-main$/);
  await expect(target).toBeFocused();

  await page.keyboard.press("Tab");
  expect(await target.evaluate((element) => element.contains(document.activeElement))).toBe(true);
});

test("public nested route skip-link focuses shell target and continues into page main", async ({ page }) => {
  await page.goto("/soluciones");

  const skipLink = page.getByRole("link", { name: "Saltar al contenido" });
  const target = page.locator("#public-main");
  const main = page.getByRole("main");

  await expect(target).not.toHaveRole("main");
  await expect(main).toHaveCount(1);

  await page.keyboard.press("Tab");
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#public-main$/);
  await expect(target).toBeFocused();

  await page.keyboard.press("Tab");
  expect(await target.evaluate((element) => element.contains(document.activeElement))).toBe(true);
});

test("manifest uses governed site content without inherited color claims", async ({ request }) => {
  const response = await request.get("/manifest.webmanifest");
  expect(response.ok()).toBe(true);
  const manifest = await response.json() as Record<string, unknown>;

  expect(manifest.name).toBe("Greenatics");
  expect(manifest.start_url).toBe("/");
  expect(manifest.lang).toBe("es-CO");
  expect(manifest.theme_color).toBeUndefined();
  expect(manifest.background_color).toBeUndefined();
});

test("Yarumal exposes exact recovered evidence assets with historical truth lock", async ({ page }) => {
  await page.goto("/proyectos/yarumal");

  await expect(page.getByRole("heading", { name: "Un registro real del caso Yarumal." })).toBeVisible();
  await expect(page.getByRole("img", { name: "Vista aérea documentada del caso Greenatics en Yarumal", exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Segunda vista aérea documentada del caso Greenatics en Yarumal", exact: true })).toBeVisible();
  await expect(page.getByText(/el registro visual documenta experiencia histórica/i)).toBeVisible();

  const breadcrumb = await jsonLdByType(page, "BreadcrumbList");
  expect(breadcrumb).toBeTruthy();
  expect(JSON.stringify(breadcrumb)).toContain("https://greenatics.com.co/proyectos/yarumal");
});

test("unknown routes render the dual-platform 404 without legacy destinations", async ({ page }) => {
  const response = await page.goto("/ruta-publica-que-no-existe");
  expect(response?.status()).toBe(404);

  await expect(page.getByRole("heading", { name: "Esta ruta no existe o cambió." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver al sitio" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Explorar Wondergreen" })).toHaveAttribute("href", "/wondergreen");
  await expect(page.getByRole("link", { name: "Ir a GREENATICS OPS" })).toHaveAttribute("href", "/app");
  await expect(page.locator('a[href="/diagnostico/"]')).toHaveCount(0);
});
