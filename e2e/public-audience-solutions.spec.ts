import { test, expect } from "@playwright/test";

async function jsonLdByType(page: import("@playwright/test").Page, type: string) {
  const payloads = await page.locator('script[type="application/ld+json"]').allTextContents();
  return payloads
    .map((payload) => JSON.parse(payload) as Record<string, unknown>)
    .filter((payload) => payload["@type"] === type);
}

test("solutions hub exposes dedicated audience routes instead of internal-only anchors", async ({ page }) => {
  await page.goto("/soluciones");

  await expect(page.getByRole("link", { name: "Municipios y ESP →" })).toHaveAttribute("href", "/soluciones/esp-municipios");
  await expect(page.getByRole("link", { name: "Empresas →" })).toHaveAttribute("href", "/soluciones/empresas-grandes-generadores");
  await expect(page.getByRole("link", { name: /Ver ruta para ESP y municipios/ })).toHaveAttribute("href", "/soluciones/esp-municipios");
  await expect(page.getByRole("link", { name: /Ver ruta para empresas/ })).toHaveAttribute("href", "/soluciones/empresas-grandes-generadores");
});

test("ESP and municipalities landing routes decisions to governed programs and services", async ({ page }) => {
  await page.goto("/soluciones/esp-municipios");

  await expect(page.getByRole("heading", { name: "De la planeación a una operación preparada para crecer." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "No necesitas conocer el nombre del servicio." })).toBeVisible();
  await expect(page.getByText("ESP READY", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("GREENATICS BASE", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "ESP READY →" })).toHaveAttribute("href", "/soluciones/programas/esp-ready");
  await expect(page.getByRole("link", { name: "PGIRS →" })).toHaveAttribute("href", "/soluciones/pgirs");
  await expect(page.getByRole("link", { name: "Prefactibilidad →" })).toHaveAttribute("href", "/soluciones/prefactibilidad");
  await expect(page.getByRole("heading", { name: "Puesta en marcha de operación de aseo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Programa de orgánicos: captura real y piloto" })).toBeVisible();
  await expect(page.getByText(/no implica por sí mismo que Greenatics asuma la condición de prestador/i)).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://greenatics.com.co/soluciones/esp-municipios");

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/esp-municipios");
});

test("enterprise and large-generator landing routes PMIRS, organics and data without ESP READY", async ({ page }) => {
  await page.goto("/soluciones/empresas-grandes-generadores");

  await expect(page.getByRole("heading", { name: "De cumplimiento aislado a gestión medible y circular." })).toBeVisible();
  await expect(page.getByText("PMIRS RED", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("ESP READY", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "PMIRS y planes internos →" })).toHaveAttribute("href", "/soluciones/pmirs");
  await expect(page.getByRole("link", { name: "PMIRS RED →" })).toHaveAttribute("href", "/soluciones/programas/pmirs-red");
  await expect(page.getByRole("link", { name: "Gestión, recolección y tratamiento →" })).toHaveAttribute("href", "/soluciones/recoleccion-tratamiento");
  await expect(page.getByRole("link", { name: "Trazabilidad digital y GREENATICS OPS →" })).toHaveAttribute("href", "/soluciones/trazabilidad-datos");
  await expect(page.getByRole("heading", { name: "Programa de orgánicos: captura real y piloto" })).toBeVisible();
  await expect(page.getByText(/no presupone una planta ni una tecnología/i)).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://greenatics.com.co/soluciones/empresas-grandes-generadores");

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/empresas-grandes-generadores");
});
