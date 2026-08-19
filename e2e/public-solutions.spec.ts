import { test, expect } from "@playwright/test";

async function jsonLdByType(page: import("@playwright/test").Page, type: string) {
  const payloads = await page.locator('script[type="application/ld+json"]').allTextContents();
  return payloads
    .map((payload) => JSON.parse(payload) as Record<string, unknown>)
    .filter((payload) => payload["@type"] === type);
}

test("solutions hub exposes the governed service architecture and four commercial journeys", async ({ page }) => {
  await page.goto("/soluciones");

  await expect(page.getByRole("heading", { name: /El proyecto no empieza en la planta/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No necesitas conocer el nombre del servicio." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Diagnosticar y planear" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Separar y recolectar" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Construir o recuperar capacidad" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Operar, controlar y medir" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Diagnóstico y caracterización/ })).toHaveAttribute("href", "/soluciones/diagnostico-caracterizacion");
  await expect(page.getByRole("link", { name: /Trazabilidad y datos/ })).toHaveAttribute("href", "/soluciones/trazabilidad-datos");
  await expect(page.getByRole("heading", { name: /Del PGIRS a una operación sostenible/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /De residuo operativo a flujo gestionado/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Diagnóstico y caracterización de residuos orgánicos" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver solución en profundidad/i }).first()).toHaveAttribute("href", /\/soluciones\//);
});

test("solution detail preserves problem, scope, deliverables and breadcrumb semantics", async ({ page }) => {
  await page.goto("/soluciones/diagnostico-caracterizacion");

  await expect(page.getByRole("heading", { name: "Diagnóstico y caracterización de residuos orgánicos" })).toBeVisible();
  await expect(page.getByText("Qué problema busca resolver", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qué puede incluir" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Entregables típicos" })).toBeVisible();
  await expect(page.getByText("línea base", { exact: true })).toBeVisible();

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(breadcrumbs).toHaveLength(1);
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/diagnostico-caracterizacion");
  expect(JSON.stringify(breadcrumbs[0])).toContain("Diagnóstico y caracterización de residuos orgánicos");
});

test("public solutions route keeps the bridge to OPS", async ({ page }) => {
  await page.goto("/soluciones");
  await page.getByRole("banner").getByRole("link", { name: "Acceder a Greenatics" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
});
