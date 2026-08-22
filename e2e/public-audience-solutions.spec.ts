import { test, expect } from "@playwright/test";

async function jsonLdByType(page: import("@playwright/test").Page, type: string) {
  const payloads = await page.locator('script[type="application/ld+json"]').allTextContents();
  return payloads
    .map((payload) => JSON.parse(payload) as Record<string, unknown>)
    .filter((payload) => payload["@type"] === type);
}

test("solutions hub exposes five canonical audience routes", async ({ page }) => {
  await page.goto("/soluciones");

  await expect(page.getByRole("link", { name: /Ver ruta para prestadores/ })).toHaveAttribute("href", "/soluciones/esp");
  await expect(page.getByRole("link", { name: /Ver ruta para municipios/ })).toHaveAttribute("href", "/soluciones/municipios");
  await expect(page.getByRole("link", { name: /Ver ruta para empresas/ })).toHaveAttribute("href", "/soluciones/empresas");
  await expect(page.getByRole("link", { name: /Ver ruta multiunidad/ })).toHaveAttribute("href", "/soluciones/propiedad-horizontal");
  await expect(page.getByRole("link", { name: /Ver ruta de plantas/ })).toHaveAttribute("href", "/soluciones/plantas");
});

test("ESP landing is separated from municipal planning and keeps provider guardrails", async ({ page }) => {
  await page.goto("/soluciones/esp");

  await expect(page.getByRole("heading", { name: "Preparar, estabilizar y fortalecer una operación que debe funcionar todos los días." })).toBeVisible();
  await expect(page.getByText("ESP READY", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "ESP READY →", exact: true })).toHaveAttribute("href", "/soluciones/programas/esp-ready");
  await expect(page.getByRole("link", { name: "Diseño de rutas selectivas y microrrutas →", exact: true })).toHaveAttribute("href", "/soluciones/rutas-selectivas");
  await expect(page.getByText(/responsabilidades regulatorias propias de la persona prestadora/i)).toBeVisible();
  await expect(page.getByText("PMIRS RED", { exact: true })).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://greenatics.com.co/soluciones/esp");

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/esp");
});

test("municipal landing centers PGIRS and project maturity without importing ESP READY", async ({ page }) => {
  await page.goto("/soluciones/municipios");

  await expect(page.getByRole("heading", { name: "De la planeación territorial a decisiones y proyectos que puedan implementarse." })).toBeVisible();
  await expect(page.getByRole("link", { name: "PGIRS →", exact: true })).toHaveAttribute("href", "/soluciones/pgirs");
  await expect(page.getByRole("link", { name: "Prefactibilidad →", exact: true })).toHaveAttribute("href", "/soluciones/prefactibilidad");
  await expect(page.getByText(/El municipio conserva sus competencias/i)).toBeVisible();
  await expect(page.getByText("ESP READY", { exact: true })).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://greenatics.com.co/soluciones/municipios");

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/municipios");
});

test("enterprise landing routes PMIRS, organics and data without ESP READY", async ({ page }) => {
  await page.goto("/soluciones/empresas");

  await expect(page.getByRole("heading", { name: "De obligaciones y prácticas dispersas a una gestión medible y circular." })).toBeVisible();
  await expect(page.getByRole("link", { name: "PMIRS y planes internos →", exact: true })).toHaveAttribute("href", "/soluciones/pmirs");
  await expect(page.getByRole("link", { name: "Gestión, recolección y tratamiento →", exact: true })).toHaveAttribute("href", "/soluciones/recoleccion-tratamiento");
  await expect(page.getByRole("link", { name: "Trazabilidad digital y GREENATICS OPS →", exact: true })).toHaveAttribute("href", "/soluciones/trazabilidad-datos");
  await expect(page.getByText("ESP READY", { exact: true })).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://greenatics.com.co/soluciones/empresas");
});

test("property and institution landing makes PMIRS RED a network layer, not an ESP program", async ({ page }) => {
  await page.goto("/soluciones/propiedad-horizontal");

  await expect(page.getByRole("heading", { name: "Cada unidad conserva su realidad. La red puede compartir método, datos y oportunidades." })).toBeVisible();
  await expect(page.getByRole("link", { name: "PMIRS RED →", exact: true })).toHaveAttribute("href", "/soluciones/programas/pmirs-red");
  await expect(page.getByRole("link", { name: "Rutas y microrrutas →", exact: true })).toHaveAttribute("href", "/soluciones/rutas-selectivas");
  await expect(page.getByText(/Estandarizar el método no significa volver idénticas las unidades/i)).toBeVisible();
  await expect(page.getByText("ESP READY", { exact: true })).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://greenatics.com.co/soluciones/propiedad-horizontal");
});

test("plant and operator landing starts with existing infrastructure and does not fabricate an entry program", async ({ page }) => {
  await page.goto("/soluciones/plantas");

  await expect(page.getByRole("heading", { name: "La infraestructura crea valor cuando puede operar, medirse y mejorar de forma estable." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Diagnóstico y rehabilitación →", exact: true })).toHaveAttribute("href", "/soluciones/rehabilitacion");
  await expect(page.getByRole("link", { name: "Dirección técnica →", exact: true })).toHaveAttribute("href", "/soluciones/direccion-operacion");
  await expect(page.getByRole("link", { name: "GREENATICS OPS →", exact: true })).toHaveAttribute("href", "/soluciones/trazabilidad-datos");
  await expect(page.getByRole("heading", { name: "Programas para ordenar el inicio antes de desplegar servicios." })).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://greenatics.com.co/soluciones/plantas");
});

test("legacy combined audience routes do not remain canonical destinations", async ({ page }) => {
  await page.goto("/soluciones/esp-municipios");
  await expect(page).toHaveURL(/\/soluciones$/);

  await page.goto("/soluciones/empresas-grandes-generadores");
  await expect(page).toHaveURL(/\/soluciones\/empresas$/);
});
