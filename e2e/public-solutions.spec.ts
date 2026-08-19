import { test, expect } from "@playwright/test";

async function jsonLdByType(page: import("@playwright/test").Page, type: string) {
  const payloads = await page.locator('script[type="application/ld+json"]').allTextContents();
  return payloads
    .map((payload) => JSON.parse(payload) as Record<string, unknown>)
    .filter((payload) => payload["@type"] === type);
}

test("solutions hub exposes strategic programs, decision modules, six commercial lines and governed services", async ({ page }) => {
  await page.goto("/soluciones");

  await expect(page.getByRole("heading", { name: /Primero estructurar. Luego operar. Después valorizar./i })).toBeVisible();
  await expect(page.getByRole("img", { name: "Vista aérea documentada del caso Greenatics en Yarumal" })).toBeVisible();
  await expect(page.getByText(/Vista aérea de archivo · Yarumal/)).toBeVisible();

  await expect(page.getByRole("heading", { name: "Tres formas de empezar con una base más clara." })).toBeVisible();
  for (const program of ["ESP READY", "GREENATICS BASE", "PMIRS RED"]) {
    await expect(page.getByRole("heading", { name: program, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: /Conocer ESP READY/ })).toHaveAttribute("href", "/soluciones/programas/esp-ready");
  await expect(page.getByRole("link", { name: /Conocer GREENATICS BASE/ })).toHaveAttribute("href", "/soluciones/programas/greenatics-base");
  await expect(page.getByRole("link", { name: /Conocer PMIRS RED/ })).toHaveAttribute("href", "/soluciones/programas/pmirs-red");

  await expect(page.getByRole("heading", { name: "No todo problema necesita convertirse en un servicio nuevo." })).toBeVisible();
  for (const module of [
    "Puesta en marcha de operación de aseo",
    "Rutas, flota y continuidad operativa",
    "Programa de orgánicos: captura real y piloto",
    "Prefactibilidad de decisiones de infraestructura",
    "Screening técnico de predios",
    "Acompañamiento por etapas",
  ]) {
    await expect(page.getByRole("heading", { name: module, exact: true })).toBeVisible();
  }
  await expect(page.getByText(/no presupone una planta ni una tecnología/i)).toBeVisible();
  await expect(page.getByText(/no sustituye concepto de uso del suelo/i)).toBeVisible();

  for (const line of [
    "Diagnóstico y datos",
    "Planeación y gestión",
    "Operación de aseo y logística",
    "Circularidad y valorización",
    "Infraestructura y proyectos",
    "Acompañamiento y operación",
  ]) {
    await expect(page.getByRole("heading", { name: line, exact: true })).toBeVisible();
  }

  await expect(page.getByRole("link", { name: /Diagnóstico y caracterización/ }).first()).toHaveAttribute("href", "/soluciones/diagnostico-caracterizacion");
  await expect(page.getByRole("link", { name: /Trazabilidad, indicadores y datos/ })).toHaveAttribute("href", "/soluciones/trazabilidad-datos");
  await expect(page.getByRole("heading", { name: /De la planeación a una operación preparada para crecer/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /De cumplimiento aislado a gestión medible y circular/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Diagnóstico y caracterización de residuos orgánicos" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver solución en profundidad/i }).first()).toHaveAttribute("href", /\/soluciones\//);
});

test("ESP READY keeps the ten sourced preparation dimensions and decision outputs", async ({ page }) => {
  await page.goto("/soluciones/programas/esp-ready");

  await expect(page.getByRole("heading", { name: "ESP READY", exact: true })).toBeVisible();
  await expect(page.getByText(/¿Qué tan preparada está la empresa para iniciar y crecer?/)).toBeVisible();

  for (const dimension of ["Regulación", "Clientes", "Operación", "Tarifa", "Facturación", "Rutas", "Flota", "Datos", "Contingencias", "Infraestructura futura"]) {
    await expect(page.getByText(dimension, { exact: true })).toBeVisible();
  }
  for (const output of ["Estado actual", "Brechas", "Prioridades", "Hoja de ruta"]) {
    await expect(page.getByText(output, { exact: true })).toBeVisible();
  }

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/programas/esp-ready");
});

test("GREENATICS BASE keeps technical baseline separate from PMIRS and regulatory aforo", async ({ page }) => {
  await page.goto("/soluciones/programas/greenatics-base");

  await expect(page.getByRole("heading", { name: "GREENATICS BASE", exact: true })).toBeVisible();
  await expect(page.getByText(/Empieza a producir información real mientras estructuras lo que sigue/i)).toBeVisible();
  for (const item of [
    "Línea base de generación",
    "Caracterización de residuos",
    "Diagnóstico de infraestructura",
    "Lectura operativa del proyecto",
    "Captura digital y evidencia",
    "Consolidación y análisis",
  ]) {
    await expect(page.getByText(item, { exact: true })).toBeVisible();
  }
  for (const excluded of ["PMIRS completo", "Aforo regulatorio", "Estudio tarifario", "Diseño final de rutas", "Ingeniería", "Permisos"]) {
    await expect(page.getByText(excluded, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/alcance independiente conforme al procedimiento aplicable/i)).toBeVisible();

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/programas/greenatics-base");
});

test("PMIRS RED separates unit-level implementation from network intelligence", async ({ page }) => {
  await page.goto("/soluciones/programas/pmirs-red");

  await expect(page.getByRole("heading", { name: "PMIRS RED", exact: true })).toBeVisible();
  for (const item of ["Diagnóstico", "Caracterización", "Programas", "Implementación", "Indicadores", "Seguimiento"]) {
    await expect(page.getByText(item, { exact: true })).toBeVisible();
  }
  for (const item of ["Demanda", "Ubicación", "Composición", "Accesos", "Horarios", "Orgánicos", "Aprovechables", "Oportunidades"]) {
    await expect(page.getByText(item, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/24 no es un mínimo ni una promesa universal/i)).toBeVisible();
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
