import { test, expect } from "@playwright/test";

async function jsonLdByType(page: import("@playwright/test").Page, type: string) {
  const payloads = await page.locator('script[type="application/ld+json"]').allTextContents();
  return payloads
    .map((payload) => JSON.parse(payload) as Record<string, unknown>)
    .filter((payload) => payload["@type"] === type);
}

test("solutions hub surfaces plant and multiunit intent through the audience router", async ({ page }) => {
  await page.goto("/soluciones");

  await expect(page.getByRole("heading", { name: "Propiedad horizontal / Instituciones", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Plantas / Operadores", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver ruta multiunidad/ })).toHaveAttribute("href", "/soluciones/propiedad-horizontal-redes");
  await expect(page.getByRole("link", { name: /Ver ruta de plantas/ })).toHaveAttribute("href", "/soluciones/infraestructura-plantas");
  await expect(page.getByRole("link", { name: /Plantas y tratamiento/ })).toHaveAttribute("href", "/soluciones/infraestructura-plantas");
});

test("organic waste route moves from real capture to treatment and prefactibility", async ({ page }) => {
  await page.goto("/soluciones/residuos-organicos");

  await expect(page.getByRole("heading", { name: "Del potencial orgánico a una corriente útil y trazable." })).toBeVisible();
  await expect(page.getByText(/Orgánico potencial no es lo mismo que orgánico útil/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "GREENATICS BASE →", exact: true })).toHaveAttribute("href", "/soluciones/programas/greenatics-base");
  await expect(page.getByRole("link", { name: "Diagnóstico y caracterización →", exact: true })).toHaveAttribute("href", "/soluciones/diagnostico-caracterizacion");
  await expect(page.getByRole("link", { name: "Gestión, recolección y tratamiento →", exact: true })).toHaveAttribute("href", "/soluciones/recoleccion-tratamiento");
  await expect(page.getByRole("link", { name: "Prefactibilidad →", exact: true })).toHaveAttribute("href", "/soluciones/prefactibilidad");
  await expect(page.getByText(/El módulo no presupone una planta ni una tecnología/i)).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://greenatics.com.co/soluciones/residuos-organicos");

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/residuos-organicos");
});

test("infrastructure route keeps prefactibility before engineering and construction", async ({ page }) => {
  await page.goto("/soluciones/infraestructura-plantas");

  await expect(page.getByRole("heading", { name: "La primera decisión no es construir. Es saber si vale la pena avanzar." })).toBeVisible();
  await expect(page.getByText(/Seguir, esperar, rediseñar o descartar también son resultados útiles/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Prefactibilidad →", exact: true })).toHaveAttribute("href", "/soluciones/prefactibilidad");
  await expect(page.getByRole("link", { name: "Factibilidad e ingeniería →", exact: true })).toHaveAttribute("href", "/soluciones/factibilidad-ingenieria");
  await expect(page.getByRole("link", { name: "Diseño, construcción e implementación →", exact: true })).toHaveAttribute("href", "/soluciones/plantas-nuevas");
  await expect(page.getByRole("link", { name: "Diagnóstico y rehabilitación →", exact: true })).toHaveAttribute("href", "/soluciones/rehabilitacion");
  await expect(page.getByText(/La prefactibilidad orienta la decisión/i)).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://greenatics.com.co/soluciones/infraestructura-plantas");

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/infraestructura-plantas");
});

test("multiunit property route standardizes method without importing ESP READY", async ({ page }) => {
  await page.goto("/soluciones/propiedad-horizontal-redes");

  await expect(page.getByRole("heading", { name: "Cada unidad conserva su realidad. La red puede compartir método y datos." })).toBeVisible();
  await expect(page.getByText(/La escala aparece cuando la información puede compararse/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "GREENATICS BASE →", exact: true })).toHaveAttribute("href", "/soluciones/programas/greenatics-base");
  await expect(page.getByRole("link", { name: "PMIRS y planes internos →", exact: true })).toHaveAttribute("href", "/soluciones/pmirs");
  await expect(page.getByRole("link", { name: "PMIRS RED →", exact: true })).toHaveAttribute("href", "/soluciones/programas/pmirs-red");
  await expect(page.getByRole("link", { name: "Trazabilidad digital y GREENATICS OPS →", exact: true })).toHaveAttribute("href", "/soluciones/trazabilidad-datos");
  await expect(page.getByText("ESP READY", { exact: true })).toHaveCount(0);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://greenatics.com.co/soluciones/propiedad-horizontal-redes");

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/propiedad-horizontal-redes");
});
