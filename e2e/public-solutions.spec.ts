import { test, expect } from "@playwright/test";

async function jsonLdByType(page: import("@playwright/test").Page, type: string) {
  const payloads = await page.locator('script[type="application/ld+json"]').allTextContents();
  return payloads
    .map((payload) => JSON.parse(payload) as Record<string, unknown>)
    .filter((payload) => payload["@type"] === type);
}

async function clickDigitalBridge(page: import("@playwright/test").Page) {
  const header = page.getByRole("banner");
  const desktopEntry = header.getByRole("link", { name: "GREENATICS OPS", exact: true });
  if (await desktopEntry.isVisible()) {
    await desktopEntry.click();
    return;
  }

  await header.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("dialog", { name: "Navegación Greenatics" }).getByRole("link", { name: "GREENATICS OPS", exact: true }).click();
}

test("solutions hub exposes concrete services inside every commercial family before orientation", async ({ page }) => {
  await page.goto("/soluciones");

  await expect(page.getByRole("heading", { name: /Servicios para convertir necesidades de gestión en resultados concretos./i })).toBeVisible();
  await expect(page.getByRole("img", { name: "Vista aérea documentada del caso Greenatics en Yarumal", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver servicios y entregables", exact: true })).toHaveAttribute("href", "#servicios");

  await expect(page.getByRole("heading", { name: "Ocho familias. Servicios concretos que puedes abrir y revisar en profundidad." })).toBeVisible();
  for (const family of [
    "Caracterización y línea base",
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

  const baseline = page.getByRole("navigation", { name: "Servicios de Caracterización y línea base" });
  await expect(baseline.getByRole("link", { name: "Diagnóstico y caracterización de residuos orgánicos" })).toHaveAttribute("href", "/soluciones/diagnostico-caracterizacion");

  const planning = page.getByRole("navigation", { name: "Servicios de Planeación y programas" });
  await expect(planning.getByRole("link", { name: /PGIRS/ })).toHaveAttribute("href", "/soluciones/pgirs");
  await expect(planning.getByRole("link", { name: /PMIRS/ })).toHaveAttribute("href", "/soluciones/pmirs");

  const legal = page.getByRole("navigation", { name: "Servicios de Gestión jurídica y regulatoria" });
  await expect(legal.getByRole("link", { name: /Gestión jurídica y regulatoria para residuos/ })).toHaveAttribute("href", "/soluciones/gestion-juridica-regulatoria");

  const logistics = page.getByRole("navigation", { name: "Servicios de Rutas y logística" });
  await expect(logistics.getByRole("link", { name: /rutas selectivas y microrrutas/i })).toHaveAttribute("href", "/soluciones/rutas-selectivas");
  await expect(logistics.getByRole("link", { name: /motocarguero/i })).toHaveAttribute("href", "/soluciones/motocarguero");

  const plants = page.getByRole("navigation", { name: "Servicios de Plantas y tratamiento" });
  await expect(plants.getByRole("link", { name: /Prefactibilidad de plantas/i })).toHaveAttribute("href", "/soluciones/prefactibilidad");
  await expect(plants.getByRole("link", { name: /Factibilidad, APU e ingeniería de detalle/i })).toHaveAttribute("href", "/soluciones/factibilidad-ingenieria");
  await expect(plants.getByRole("link", { name: /Diseño, construcción e implementación de plantas/i })).toHaveAttribute("href", "/soluciones/plantas-nuevas");
  await expect(plants.getByRole("link", { name: /rehabilitación y puesta en marcha/i })).toHaveAttribute("href", "/soluciones/rehabilitacion");

  const operations = page.getByRole("navigation", { name: "Servicios de Dirección técnica y operación asistida" });
  await expect(operations.getByRole("link", { name: /Dirección técnica y coordinación de operación/i })).toHaveAttribute("href", "/soluciones/direccion-operacion");
  await expect(operations.getByRole("link", { name: /Operación integral de plantas/i })).toHaveAttribute("href", "/soluciones/operacion-integral");
  await expect(operations.getByRole("link", { name: /Gestión, recolección y tratamiento de residuos orgánicos/i })).toHaveAttribute("href", "/soluciones/recoleccion-tratamiento");

  const data = page.getByRole("navigation", { name: "Servicios de Datos, trazabilidad y OPS" });
  await expect(data.getByRole("link", { name: /Trazabilidad digital, indicadores y GREENATICS OPS/i })).toHaveAttribute("href", "/soluciones/trazabilidad-datos");

  const valorization = page.getByRole("navigation", { name: "Servicios de Valorización y desarrollo de productos" });
  await expect(valorization.getByRole("link", { name: "Valorización y desarrollo de productos", exact: true })).toHaveAttribute("href", "/soluciones/valorizacion-productos");

  for (const audience of [
    "ESP / Prestadores",
    "Municipios",
    "Empresas / Grandes generadores",
    "Propiedad horizontal / Instituciones",
    "Plantas / Operadores",
  ]) {
    await expect(page.getByRole("heading", { name: audience, exact: true })).toBeVisible();
  }

  const serviceTop = await page.locator("#servicios").evaluate((element) => (element as HTMLElement).offsetTop);
  const audienceTop = await page.locator("#audiencias").evaluate((element) => (element as HTMLElement).offsetTop);
  expect(serviceTop).toBeLessThan(audienceTop);

  await expect(page.getByRole("heading", { name: "El servicio define el resultado; la línea base solo entra cuando es necesaria." })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Antes de reemplazar una planta/ })).toBeVisible();
  await expect(page.getByRole("img", { name: "Segunda vista aérea documentada del caso Greenatics en Yarumal", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /La consultoría gana valor cuando la información sigue viva después del informe./i })).toBeVisible();
  await expect(page.getByRole("heading", { name: /¿No sabes cuál de estas soluciones corresponde a tu caso?/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Usar orientador inicial", exact: true })).toHaveAttribute("href", "/soluciones/diagnostico-inicial");
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

test("service detail puts deliverables before activities and keeps diagnosis conditional", async ({ page }) => {
  await page.goto("/soluciones/diagnostico-caracterizacion");

  await expect(page.getByRole("heading", { name: "Diagnóstico y caracterización de residuos orgánicos" })).toBeVisible();
  await expect(page.getByText("Qué problema busca resolver", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qué recibe", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qué hacemos", exact: true })).toBeVisible();
  await expect(page.getByText("mediciones de generación y caracterización", { exact: true })).toBeVisible();
  await expect(page.getByText("aforos y caracterización", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Alcance y precisión", { exact: true })).toBeVisible();
  await expect(page.getByText(/no constituyen por sí solas un aforo regulatorio/i)).toBeVisible();
  await expect(page.getByText(/la línea base o el diagnóstico se incorpora como una actividad inicial; no sustituye el servicio contratado/i)).toBeVisible();

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(breadcrumbs).toHaveLength(1);
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/diagnostico-caracterizacion");
  expect(JSON.stringify(breadcrumbs[0])).toContain("Diagnóstico y caracterización de residuos orgánicos");
});

test("legal and regulatory family has a deep commercial route with authority guardrails", async ({ page }) => {
  await page.goto("/soluciones/gestion-juridica-regulatoria");

  await expect(page.getByRole("heading", { name: "Gestión jurídica y regulatoria para residuos, aseo y proyectos." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qué recibe", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qué hacemos", exact: true })).toBeVisible();
  await expect(page.getByText("matriz de obligaciones, competencias y responsables según el alcance", { exact: true })).toBeVisible();
  await expect(page.getByText(/no sustituye a la autoridad competente ni garantiza decisiones administrativas/i)).toBeVisible();

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/gestion-juridica-regulatoria");
});

test("valorization family reaches product preparation without inventing approvals or claims", async ({ page }) => {
  await page.goto("/soluciones/valorizacion-productos");

  await expect(page.getByRole("heading", { name: "Convertir una salida del proceso en un producto técnicamente preparado para vender." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qué recibe", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qué hacemos", exact: true })).toBeVisible();
  await expect(page.getByText("matriz de preparación comercial para llevar el producto a una condición vendible", { exact: true })).toBeVisible();
  await expect(page.getByText(/no presenta como aprobado, certificado o eficaz aquello que todavía está en validación/i)).toBeVisible();
  await expect(page.getByText(/registros, certificaciones, autorizaciones y resultados de laboratorio dependen/i)).toBeVisible();

  const breadcrumbs = await jsonLdByType(page, "BreadcrumbList");
  expect(JSON.stringify(breadcrumbs[0])).toContain("https://greenatics.com.co/soluciones/valorizacion-productos");
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
