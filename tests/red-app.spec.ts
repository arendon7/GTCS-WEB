import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { countApprovedDecisions, countCorrectionStates } from "../src/app/red/app/qa-metrics";

const redModuleIds: Record<string, string> = {
  Territorio: "territory",
  Generadores: "generators",
  Rutas: "routes",
  "Trabajo de campo": "field",
  "Revisión de datos": "qa",
  Hallazgos: "findings",
  "Programas PMIRS": "pmirs",
  "Seguimiento PMIRS": "pmirs-live",
  Indicadores: "indicators",
  Evidencias: "evidence",
  Coordinación: "coord",
};

async function openRedModule(page: Page, label: string) {
  const mobilePicker = page.getByLabel("Módulo activo");
  if (await mobilePicker.isVisible()) {
    await mobilePicker.selectOption(redModuleIds[label]);
    return;
  }

  await page
    .getByRole("navigation", { name: "Módulos de la aplicación" })
    .getByRole("button", { name: new RegExp(label) })
    .click();
}

test.describe("GREENATICS Red public sample", () => {
  test("deep links and browser history keep the module and mobile picker synchronized", async ({ page }) => {
    await page.goto("/red/app/#qa", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "Revisión de datos", exact: true })).toBeVisible();

    await openRedModule(page, "Rutas");
    await expect(page).toHaveURL(/\/red\/app\/#routes$/);
    await expect(page.getByRole("heading", { name: "Rutas", exact: true })).toBeVisible();

    await page.goBack();
    await expect(page).toHaveURL(/\/red\/app\/#qa$/);
    await expect(page.getByRole("heading", { name: "Revisión de datos", exact: true })).toBeVisible();
    await page.goForward();
    await expect(page.getByRole("heading", { name: "Rutas", exact: true })).toBeVisible();

    const skipLink = page.getByRole("link", { name: "Saltar al contenido" });
    await skipLink.focus();
    await skipLink.press("Enter");
    await expect(page).toHaveURL(/\/red\/app\/#contenido$/);
    await expect(page.getByRole("heading", { name: "Rutas", exact: true })).toBeVisible();

    const mobilePicker = page.getByLabel("Módulo activo");
    if (await mobilePicker.isVisible()) {
      await expect(mobilePicker).toHaveValue("routes");
    }

    await page.goto("/red/app/", { waitUntil: "networkidle" });
    await openRedModule(page, "Generadores");
    await page.goBack();
    await expect(page).toHaveURL(/\/red\/app\/$/);
    await expect(page.getByRole("heading", { name: "Resumen del proyecto", exact: true })).toBeVisible();
  });

  test("landing explains PGIRS and PMIRS distinctly and keeps its actions inside narrow viewports", async ({ page }) => {
    const response = await page.goto("/red/", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "De los datos de campo a planes que se pueden ejecutar." })).toBeVisible();
    await expect(page.getByText(/El PGIRS organiza la gestión de residuos en el territorio; el PMIRS, dentro de una organización o gran generador/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Abrir la estación con datos ficticios" })).toHaveAttribute("href", "/red/app/");
    await expect(page.getByRole("link", { name: "Ver muestra de GREENATICS OPS" })).toHaveAttribute("href", "/app/");
    await expect(page.getByRole("link", { name: "Conocer el servicio de operación" })).toHaveAttribute("href", "/servicios/operacion-delegada/");
    await expect(page.getByRole("heading", { name: "Del levantamiento de campo al seguimiento del plan." })).toBeVisible();

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      const geometry = await page.evaluate(() => ({ viewport: window.innerWidth, document: document.documentElement.scrollWidth }));
      expect(geometry.document, `Red landing must not overflow at ${width}px`).toBeLessThanOrEqual(geometry.viewport + 2);
    }
  });

  test("configured RED runtime stays hidden until its readiness endpoint confirms all gates", async ({ page }) => {
    test.skip(!process.env.NEXT_PUBLIC_RED_APP_URL, "requires a build with a configured RED runtime origin");
    const readinessUrl = new URL("/api/ready", process.env.NEXT_PUBLIC_RED_APP_URL!).toString();
    const readinessBody = {
      status: "ready",
      application: "GREENATICS RED",
      version: "synthetic-test",
      project_workspaces: 4,
      drive_backup_verified: true,
    };
    const siteOrigin = new URL(process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4173").origin;
    const corsHeaders = {
      "access-control-allow-origin": siteOrigin,
      "access-control-allow-methods": "GET",
      vary: "Origin",
    };

    let runtimeReady = false;
    await page.route(readinessUrl, (route) => route.fulfill(runtimeReady ? {
      status: 200,
      headers: corsHeaders,
      contentType: "application/json",
      body: JSON.stringify(readinessBody),
    } : {
      status: 503,
      headers: corsHeaders,
      contentType: "application/json",
      body: JSON.stringify({ detail: "readiness closed" }),
    }));
    await page.goto("/red/", { waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: /Abrir entorno GREENATICS Red/ })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Abrir muestra pública/ })).toBeVisible();

    runtimeReady = true;
    await page.reload({ waitUntil: "networkidle" });
    await expect(page.getByRole("link", { name: /Abrir entorno GREENATICS Red/ })).toBeVisible();
  });

  test("shows fictitious context and lets visitors navigate and filter real demo controls", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto("/red/app/", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Resumen del proyecto" })).toBeVisible();
    await expect(page.getByText("Territorio y organización · demostración")).toBeVisible();
    await expect(page.getByText("Nombres, cifras y estados no son de entidades reales")).toBeVisible();
    await expect(page.getByText(/PGIRS territorial o un PMIRS organizacional, incluidos grandes generadores/)).toBeVisible();
    await expect(page.locator(".red-app__topbar a[href='/contacto/?interes=red']")).toHaveCount(0);
    const scopeCta = page.locator(".red-app__workspace-head a[href='/contacto/?interes=red']");
    await expect(scopeCta).toHaveCount(1);
    await expect(scopeCta).toHaveText("Conversar sobre territorio u organización");

    const moduleNav = page.getByRole("navigation", { name: "Módulos de la aplicación" });
    const mobilePicker = page.getByLabel("Módulo activo");
    if (await mobilePicker.isVisible()) {
      await expect(moduleNav).toBeHidden();
      for (const id of Object.values(redModuleIds)) {
        await expect(mobilePicker.locator(`option[value="${id}"]`)).toHaveCount(1);
      }
    } else {
      await expect(moduleNav).toBeVisible();
      for (const module of Object.keys(redModuleIds)) {
        await expect(moduleNav.getByRole("button", { name: new RegExp(module) })).toBeVisible();
      }
    }

    await openRedModule(page, "Territorio");
    await expect(page.getByRole("heading", { name: /Una línea base que explica/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Infraestructura" })).toBeVisible();
    const decisionLayer = page.locator(".red-app__layer-list button").filter({ hasText: "Decisión pública" });
    await decisionLayer.click();
    await expect(decisionLayer).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".red-app__record-inspector h2")).toHaveText("Decisión pública");
    await page.getByText("Siguiente paso sugerido", { exact: true }).click();
    await expect(page.getByText(/Revisar las fuentes relacionadas con esta capa/)).toBeVisible();

    await openRedModule(page, "Generadores");
    await expect(page.getByRole("heading", { name: "Generadores y unidades de gestión" })).toBeVisible();
    await page.getByRole("searchbox", { name: "Buscar en la muestra" }).fill("institución educativa");
    await expect(page.getByRole("heading", { name: "Institución educativa" })).toBeVisible();
    const generatorRecord = page.getByRole("button", { name: "Ver ficha de GEN-031: Institución educativa, Registrado" });
    await generatorRecord.focus();
    await generatorRecord.press("Enter");
    await expect(generatorRecord).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText(/GEN-031: ficha contextual cargada/)).toBeVisible();
    await expect(page.locator(".red-app__record-inspector h2")).toHaveText("Institución educativa");
    await page.getByRole("searchbox", { name: "Buscar en la muestra" }).fill("sin coincidencias");
    await expect(page.getByText(/No hay registros de ejemplo que coincidan/)).toBeVisible();

    await openRedModule(page, "Rutas");
    await expect(page.getByRole("heading", { name: /Una microrruta eficiente/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Diseñar un piloto de microrruta/ })).toHaveAttribute("href", "/contacto/?interes=red&servicio=microrrutas-motocarguero");
    await expect(page.getByRole("button", { name: /Conocer el siguiente paso/ })).toHaveCount(0);
    const routeCard = page.locator(".red-app__route-card").filter({ hasText: "Instituciones educativas" });
    await routeCard.click();
    await expect(routeCard).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".red-app__record-inspector h2")).toHaveText("Instituciones educativas");
    await page.getByText("Siguiente paso sugerido", { exact: true }).click();
    await expect(page.getByText(/Verificar el ciclo observado, la calidad y el destino/)).toBeVisible();

    await openRedModule(page, "Trabajo de campo");
    await expect(page.getByRole("heading", { name: "Medición" })).toBeVisible();
    const infrastructureStep = page.locator(".red-app__field-grid button").filter({ hasText: "Infraestructura" });
    await infrastructureStep.click();
    await expect(infrastructureStep).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".red-app__record-inspector h2")).toHaveText("Infraestructura");
    await expect(page.locator(".red-app__record-inspector").getByText(/2 fotografías pendientes/)).toBeVisible();

    await openRedModule(page, "Programas PMIRS");
    await expect(page.getByRole("heading", { name: /Convertir hallazgos en programas/ })).toBeVisible();
    await page.getByRole("button", { name: /P-02 · MUESTRA/ }).click();
    await expect(page.getByRole("heading", { name: /El plan deja de ser documento/ })).toBeVisible();
    await expect(page.getByText(/abrimos el seguimiento de muestra asociado/)).toBeVisible();
    await page.getByRole("button", { name: "Simular avance +10 %" }).click();
    await expect(page.getByText(/A-015: avance simulado en 40 %/)).toBeVisible();
    await expect(page.getByText(/En una operación real, el cierre requiere comentario, evidencia y fecha de revisión/)).toBeVisible();

    await openRedModule(page, "Revisión de datos");
    const correctionMetric = page.locator(".red-app__screen > .red-app__metrics > article").nth(1).locator("strong");
    const approvedMetric = page.locator(".red-app__screen > .red-app__metrics > article").nth(3).locator("strong");
    await expect(correctionMetric).toHaveText("2");
    await expect(approvedMetric).toHaveText("22");
    await page.getByRole("button", { name: "Simular aprobación", exact: true }).click();
    await expect(page.getByText(/QA-108: cambio de estado simulado solo en esta sesión/)).toBeVisible();
    await expect(correctionMetric).toHaveText("1");
    await expect(approvedMetric).toHaveText("23");
    await page.getByRole("button", { name: /QA-104/ }).click();
    await page.getByRole("button", { name: "Simular solicitud de corrección", exact: true }).click();
    await expect(correctionMetric).toHaveText("2");
    await expect(approvedMetric).toHaveText("23");
    await page.getByRole("button", { name: "Simular aprobación", exact: true }).click();
    await expect(correctionMetric).toHaveText("1");
    await expect(approvedMetric).toHaveText("24");
    await page.getByRole("button", { name: "Restablecer estado", exact: true }).click();
    await expect(approvedMetric).toHaveText("23");
    await page.getByRole("button", { name: /QA-108/ }).click();
    await page.getByRole("button", { name: "Restablecer estado", exact: true }).click();
    await expect(approvedMetric).toHaveText("22");
    await openRedModule(page, "Hallazgos");
    await page.getByRole("combobox", { name: "Prioridad" }).selectOption("Alta");
    await expect(page.getByRole("button", { name: /H-021/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /H-018/ })).toHaveCount(0);
    await page.getByRole("searchbox", { name: "Buscar en la muestra" }).fill("no existe");
    await expect(page.getByText(/No hay hallazgos ficticios que coincidan/)).toBeVisible();

    await openRedModule(page, "Indicadores");
    await expect(page.getByText("Fecha ficticia de demostración")).toBeVisible();
    await expect(page.getByRole("button", { name: /Cambiar corte/ })).toHaveCount(0);
    await openRedModule(page, "Evidencias");
    await expect(page.getByRole("heading", { name: /La evidencia no es un archivo/ })).toBeVisible();
    await expect(page.getByRole("button", { name: "Qué describe un soporte" })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Qué debe acompañar cada soporte" })).toBeVisible();
    const evidenceRecord = page.locator(".red-app__evidence-grid button").filter({ hasText: "Planilla de pesaje jornada 04" });
    await evidenceRecord.click();
    await expect(evidenceRecord).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".red-app__record-inspector h2")).toHaveText("Planilla de pesaje jornada 04");
    await expect(page.getByText(/ficha contextual cargada con soporte, metadatos, estado y objeto origen/)).toBeVisible();

    await openRedModule(page, "Coordinación");
    await expect(page.getByRole("heading", { name: "Relacionar una conversación con el trabajo." })).toBeVisible();
    await expect(page.getByText("Diseño de flujo, no servicio conectado")).toBeVisible();
    await expect(page.getByText(/no envía mensajes ni crea tareas/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "Confirmar horario de visita" })).toBeVisible();
    const coordinationItem = page.locator(".red-app__coord-list button").filter({ hasText: "Soporte de pesaje jornada 04" });
    await coordinationItem.click();
    await expect(coordinationItem).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator(".red-app__record-inspector h2")).toHaveText("Soporte de pesaje jornada 04");
    await expect(page.getByText(/hilo de muestra seleccionado con objeto origen, responsable, fecha objetivo y módulo Revisión/)).toBeVisible();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test("does not overflow on a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/red/app/", { waitUntil: "networkidle" });
    const geometry = await page.evaluate(() => ({ viewport: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(geometry.scrollWidth, "Red must not overflow horizontally on mobile").toBeLessThanOrEqual(geometry.viewport + 2);

    const mobileColumns = await page.locator(".red-app__metrics").evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/).length,
    );
    expect(mobileColumns, "The summary metrics should use a readable two-column mobile grid").toBe(2);

    const touchTargets = await page.evaluate(() =>
      [".red-app__site-link", ".red-app__primary", "#red-app-mobile-module"].map((selector) =>
        document.querySelector<HTMLElement>(selector)?.getBoundingClientRect().height ?? 0,
      ),
    );
    expect(touchTargets.every((height) => height >= 44), "Primary mobile controls should meet the 44px touch target").toBe(true);

    await openRedModule(page, "Revisión de datos");
    const firstQaRecord = page.locator(".red-app__queue button").first();
    const qaCopyWidths = await firstQaRecord.evaluate((button) => ({
      title: button.querySelector("strong")?.getBoundingClientRect().width ?? 0,
      metadata: button.querySelector("small")?.getBoundingClientRect().width ?? 0,
      alert: button.querySelector("em")?.getBoundingClientRect().width ?? 0,
    }));
    expect(qaCopyWidths.title, "The QA record title should remain readable at 390px").toBeGreaterThan(180);
    expect(qaCopyWidths.metadata, "The QA record metadata should remain readable at 390px").toBeGreaterThan(180);
    expect(qaCopyWidths.alert, "The QA alert should remain readable at 390px").toBeGreaterThan(180);

    await page.setViewportSize({ width: 320, height: 740 });
    const extraNarrow = await page.evaluate(() => ({
      viewport: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      metricColumns: getComputedStyle(document.querySelector(".red-app__metrics")!).gridTemplateColumns.trim().split(/\s+/).length,
    }));
    expect(extraNarrow.scrollWidth).toBeLessThanOrEqual(extraNarrow.viewport + 2);
    expect(extraNarrow.metricColumns, "Metrics should stack at very narrow widths").toBe(1);
    const narrowQaWidths = await firstQaRecord.evaluate((button) => ({
      title: button.querySelector("strong")?.getBoundingClientRect().width ?? 0,
      metadata: button.querySelector("small")?.getBoundingClientRect().width ?? 0,
      alert: button.querySelector("em")?.getBoundingClientRect().width ?? 0,
    }));
    expect(narrowQaWidths.title, "The QA record title should remain readable at 320px").toBeGreaterThan(145);
    expect(narrowQaWidths.metadata, "The QA record metadata should remain readable at 320px").toBeGreaterThan(145);
    expect(narrowQaWidths.alert, "The QA alert should remain readable at 320px").toBeGreaterThan(145);
  });

  test("uses a compact grouped module selector on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/red/app/", { waitUntil: "networkidle" });

    const moduleNav = page.getByRole("navigation", { name: "Módulos de la aplicación" });
    const modulePicker = page.getByLabel("Módulo activo");
    await expect(moduleNav).toBeHidden();
    await expect(modulePicker).toBeVisible();
    await expect(modulePicker).toHaveValue("overview");

    const railHeight = await page.locator(".red-app__rail").evaluate((element) => element.getBoundingClientRect().height);
    expect(railHeight).toBeLessThan(140);

    await modulePicker.selectOption("routes");
    await expect(page.getByRole("heading", { name: "Rutas" })).toBeVisible();
    await expect(modulePicker).toHaveValue("routes");

    const narrowGeometry = await page.evaluate(() => ({
      viewport: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      pickerHeight: document.querySelector<HTMLSelectElement>("#red-app-mobile-module")?.getBoundingClientRect().height ?? 0,
    }));
    expect(narrowGeometry.documentWidth).toBeLessThanOrEqual(narrowGeometry.viewport + 2);
    expect(narrowGeometry.pickerHeight).toBeGreaterThanOrEqual(44);

    await page.setViewportSize({ width: 320, height: 740 });
    const extraNarrowWidth = await page.evaluate(() => ({ viewport: window.innerWidth, documentWidth: document.documentElement.scrollWidth }));
    expect(extraNarrowWidth.documentWidth).toBeLessThanOrEqual(extraNarrowWidth.viewport + 2);
  });

  test("labels sample records and recommendations without promising unavailable actions", () => {
    const source = fs.readFileSync(path.join(process.cwd(), "src/app/red/app/page.tsx"), "utf8");
    const styles = fs.readFileSync(path.join(process.cwd(), "src/app/red/app/red-app-v4.css"), "utf8");

    expect(source).toContain("Siguiente paso sugerido");
    expect(source).toContain("Es una orientación; no ejecuta acciones ni modifica los datos de muestra.");
    expect(source).toContain("En una operación real, el cierre requiere comentario, evidencia y fecha de revisión.");
    expect(source).not.toContain("Añade comentario, evidencia y fecha de revisión");
    expect(source).toContain("Consultar ficha del soporte");
    expect(source).toContain("Ver detalles de esta ruta");
    expect(source).toContain('aria-label={`Ver ficha de ${id}: ${type}, ${state}`}');
    expect(source).toContain("aria-pressed={selectedGeneratorId === id}");
    expect(source).not.toContain("aria-selected={selectedGeneratorId === id}");
    expect(source).not.toContain("Qué describe un soporte");
    expect(source).not.toContain("Ver soporte ↗");
    expect(source).toContain('label: "Trabajo de campo"');
    expect(source).toContain('label: "Revisión de datos"');
    expect(source).toContain('label: "Programas PMIRS"');
    expect(source).toContain('label: "Seguimiento PMIRS"');
    expect(source).toContain("5 registros de campo · 4 documentos · cifras ficticias");
    expect(source).toContain("Registros aprobados en la revisión de datos");
    expect(source).toContain("Comunicación pública");
    expect(source).not.toContain("Claim público");
    expect(source).not.toContain("5 FIELD");
    expect(source).toContain("function publicRedText(value: string)");
    expect(source).not.toContain('label: "FIELD"');
    expect(source).not.toContain('label: "QA/QC"');
    expect(source).not.toContain('label: "PMIRS STUDIO"');
    expect(source).not.toContain('label: "PMIRS VIVO"');
    expect(styles).toContain(".red-app__next .red-app__panel-head .red-app__status--warn { color: #805c12; }");
  });

  test("public offer presents territorial PGIRS and organizational PMIRS without narrowing large generators", () => {
    const pageSource = fs.readFileSync(path.join(process.cwd(), "src/app/red/page.tsx"), "utf8");
    const demoSource = fs.readFileSync(path.join(process.cwd(), "src/app/red/app/page.tsx"), "utf8");
    const formSource = fs.readFileSync(path.join(process.cwd(), "src/components/interactive-contact-form.tsx"), "utf8");
    const landingHtml = fs.readFileSync(path.join(process.cwd(), "out/red/index.html"), "utf8");
    const demoHtml = fs.readFileSync(path.join(process.cwd(), "out/red/app/index.html"), "utf8");

    expect(pageSource).toContain("gestión territorial y organizacional");
    expect(pageSource).toContain("El PGIRS organiza la gestión de residuos en el territorio; el PMIRS, dentro de una organización o gran generador.");
    expect(pageSource).toContain("unidades residenciales, centros comerciales, instituciones y empresas");
    expect(pageSource).toContain("no está conectada a una organización real");
    expect(demoSource).toContain('href="/contacto/?interes=red">Conversar sobre territorio u organización');
    expect(demoSource).not.toContain("Configurar para mi organización");
    expect(formSource).toContain('label: "GREENATICS Red · alcance territorial y organizacional"');
    expect(formSource).toContain("organizaciones o grandes generadores participan");
    expect(landingHtml).toContain("De los datos de campo a planes que se pueden ejecutar");
    expect(landingHtml).toContain("El PGIRS organiza la gestión de residuos en el territorio; el PMIRS, dentro de una organización o gran generador");
    expect(landingHtml).toContain("unidades residenciales, centros comerciales, instituciones y empresas");
    expect(landingHtml).toContain("Del plan a la operación, con alcances distintos");
    expect(demoHtml).toContain("Territorio y organización · demostración");
    expect(demoHtml).toContain("PGIRS territorial o un PMIRS organizacional");
    expect(demoHtml).toContain("Nombres, cifras y estados no son de entidades reales");
    expect(demoHtml).toContain("Conversar sobre territorio u organización");
    expect(demoHtml).not.toContain("Configurar para mi organización");
  });
});

test("QA correction count follows current in-session decisions", () => {
  const records = [
    { id: "QA-108", state: "Corrección" },
    { id: "QA-104", state: "Aclaración" },
    { id: "QA-099", state: "Corrección" },
    { id: "QA-096", state: "Por validar" },
  ];

  expect(countCorrectionStates(records, {})).toBe(2);
  expect(countCorrectionStates(records, { "QA-108": "Aprobada" })).toBe(1);
  expect(countCorrectionStates(records, { "QA-108": "Aprobada", "QA-104": "Corrección solicitada" })).toBe(2);
  expect(countCorrectionStates(records, { "QA-108": "Aprobada", "QA-104": "Aprobada" })).toBe(1);
});

test("QA approval total follows current in-session decisions", () => {
  expect(countApprovedDecisions({})).toBe(0);
  expect(countApprovedDecisions({ "QA-108": "Aprobada" })).toBe(1);
  expect(countApprovedDecisions({ "QA-108": "Corrección solicitada" })).toBe(0);
  expect(countApprovedDecisions({ "QA-108": "Aprobada", "QA-104": "Aprobada" })).toBe(2);
});
