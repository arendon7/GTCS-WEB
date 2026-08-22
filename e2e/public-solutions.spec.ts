import { test, expect } from "@playwright/test";

async function jsonLdByType(page: import("@playwright/test").Page, type: string) {
  const payloads = await page.locator('script[type="application/ld+json"]').allTextContents();
  return payloads
    .map((payload) => JSON.parse(payload) as Record<string, unknown>)
    .filter((payload) => payload["@type"] === type);
}

async function clickDigitalBridge(page: import("@playwright/test").Page) {
  const header = page.getByRole("banner");
  const desktopEntry = header.getByRole("link", { name: "Ingresar", exact: true });
  if (await desktopEntry.isVisible()) {
    await desktopEntry.click();
    return;
  }

  await header.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("dialog", { name: "Navegación Greenatics" }).getByRole("link", { name: "Ingresar", exact: true }).click();
}

test("solutions hub routes by audience, service family, process and evidence", async ({ page }) => {
  await page.goto("/soluciones");

  await expect(page.getByRole("heading", { name: /Empieza por tu contexto. Después elegimos el servicio./i })).toBeVisible();
  await expect(page.getByRole("img", { name: "Vista aérea documentada del caso Greenatics en Yarumal", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "No sé por dónde empezar", exact: true })).toHaveAttribute("href", "/soluciones/diagnostico-caracterizacion");

  for (const audience of [
    "ESP / Prestadores",
    "Municipios",
    "Empresas / Grandes generadores",
    "Propiedad horizontal / Instituciones",
    "Plantas / Operadores",
  ]) {
    await expect(page.getByRole("heading", { name: audience, exact: true })).toBeVisible();
  }

  await expect(page.getByRole("heading", { name: "Ocho familias para contratar actividades y resultados concretos." })).toBeVisible();
  for (const family of [
    "Diagnóstico y gestión de residuos",
    "Planeación y programas",
    "Gestión jurídica y regulatoria",
    "Rutas y logística",
    "Plantas y tratamiento",
    "Dirección técnica y operación asistida",
    "Datos, trazabilidad y OPS",
    "Valorización y desarrollo de productos",
  ]) {
    await expect(page.getByRole("heading", { name: family, exact: true })).toBeVisible();
  }

  await expect(page.getByRole("link", { name: /Diagnóstico y gestión de residuos/ })).toHaveAttribute("href", "/soluciones/diagnostico-caracterizacion");
  await expect(page.getByRole("link", { name: /Rutas y logística/ })).toHaveAttribute("href", "/soluciones/rutas-selectivas");
  await expect(page.getByRole("link", { name: /Datos, trazabilidad y OPS/ })).toHaveAttribute("href", "/soluciones/trazabilidad-datos");

  await expect(page.getByRole("heading", { name: "El diagnóstico ordena la ruta; no reemplaza el servicio." })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Antes de reemplazar una planta/ })).toBeVisible();
  await expect(page.getByRole("img", { name: "Segunda vista aérea documentada del caso Greenatics en Yarumal", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /La consultoría gana valor cuando la información sigue viva después del informe./i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Si todavía no sabes qué contratar, empieza por una línea base./i })).toBeVisible();
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

test("diagnostic service separates technical measurement from regulatory aforo", async ({ page }) => {
  await page.goto("/soluciones/diagnostico-caracterizacion");

  await expect(page.getByRole("heading", { name: "Diagnóstico y caracterización de residuos orgánicos" })).toBeVisible();
  await expect(page.getByText("Qué problema busca resolver", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qué puede incluir" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Entregables típicos" })).toBeVisible();
  await expect(page.getByText("mediciones de generación y caracterización", { exact: true })).toBeVisible();
  await expect(page.getByText("aforos y caracterización", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Alcance y precisión", { exact: true })).toBeVisible();
  await expect(page.getByText(/no constituyen por sí solas un aforo regulatorio/i)).toBeVisible();

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(breadcrumbs).toHaveLength(1);
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/diagnostico-caracterizacion");
  expect(JSON.stringify(breadcrumbs[0])).toContain("Diagnóstico y caracterización de residuos orgánicos");
});

test("PGIRS and plant operation expose their responsibility boundaries", async ({ page }) => {
  await page.goto("/soluciones/pgirs");
  await expect(page.getByText(/corresponde al municipio o distrito/i)).toBeVisible();
  await expect(page.getByText(/Greenatics presta apoyo técnico/i)).toBeVisible();

  await page.goto("/soluciones/operacion-integral");
  await expect(page.getByRole("heading", { name: "Operación integral de plantas de tratamiento y valorización" })).toBeVisible();
  await expect(page.getByText(/no significa, por sí mismo, que Greenatics asuma integralmente el servicio público de aseo/i)).toBeVisible();
});

test("specialized organics service does not present Greenatics as public-service provider by default", async ({ page }) => {
  await page.goto("/soluciones/recoleccion-tratamiento");
  await expect(page.getByRole("heading", { name: "Gestión, recolección y tratamiento de residuos orgánicos para generadores" })).toBeVisible();
  await expect(page.getByText(/ni convierte automáticamente a Greenatics en prestador frente al usuario/i)).toBeVisible();
});

test("public solutions route keeps the bridge to the Greenatics digital space", async ({ page }) => {
  await page.goto("/soluciones");
  await clickDigitalBridge(page);
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
});
