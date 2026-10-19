import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

function operationalDateFromLotCode(lotCode: string) {
  const match = lotCode.match(/TAM-FORSU-(\d{2})(\d{2})(\d{2})-\d{3}/);
  if (!match) throw new Error(`No se pudo derivar la fecha operativa de ${lotCode}.`);
  return `20${match[1]}-${match[2]}-${match[3]}`;
}

function bogotaLocalMinuteForDate(operationalDate: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    hourCycle: "h23",
    timeZone: "America/Bogota",
  }).formatToParts(new Date());
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  const currentDate = `${read("year")}-${read("month")}-${read("day")}`;
  const currentTime = `${read("hour")}:${read("minute")}`;
  return `${operationalDate}T${currentDate === operationalDate ? currentTime : "23:59"}`;
}

/**
 * Pilot-readiness integration gate for the deterministic local adapter.
 *
 * Scheduling writes are intentionally Supabase-only, so this scenario verifies
 * the local calendar/day surface and then proves that one physical-operational
 * chain keeps its identity across reception, execution, maintenance, compost,
 * finished production, inventory and the integrated dashboard.
 */
test("synthetic day preserves traceability through reload and downloaded report", async ({ page }) => {
  test.setTimeout(180_000);
  page.setDefaultTimeout(20_000);
  // 1) The day starts from the operational planning surface.
  await page.goto("/calendar");
  await expect(page.getByRole("heading", { name: "Calendario operativo" })).toBeVisible();
  await expect(page.getByText("Modo local", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Día", exact: true }).click();
  await expect(page.getByText(/actividades$/).first()).toBeVisible();

  await page.goto("/app");
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
  const maintenanceAlert = page.locator("#alertas").getByRole("link").filter({ hasText: "Obstrucción recurrente" });
  await expect(maintenanceAlert).toContainText("Alta");
  await expect(maintenanceAlert).toContainText("Obstrucción");
  await expect(maintenanceAlert).toContainText(/\d+ (?:min|h|d)(?: \d+ (?:min|h))? fuera de servicio/);

  // 2) A measured physical reception creates the day's source lot.
  await page.goto("/receptions/new");
  await page.getByLabel("Generador / proveedor").fill("PILOTO Integrado");
  await page.getByLabel("Ruta / origen").fill("Ruta piloto integrada");
  await page.getByLabel("Peso neto (kg)").fill("1500");
  await page.getByLabel("Rechazo (kg)").fill("0");
  await page.getByRole("button", { name: "Guardar recepción y crear lote" }).click();
  await expect(page).toHaveURL(/\/receptions$/);
  const reception = page.locator("article").filter({ hasText: "PILOTO Integrado" });
  await expect(reception).toContainText("TAM-FORSU-");
  const receptionText = await reception.textContent();
  const lotCode = receptionText?.match(/TAM-FORSU-\d{6}-\d{3}/)?.[0];
  expect(lotCode).toBeTruthy();
  const operationalDate = operationalDateFromLotCode(lotCode!);

  await page.goto("/app");
  await expect(page.getByLabel("Indicadores de hoy").locator(".metric-block").filter({ hasText: "Recibido" })).toContainText("1.50 t");
  await expect(page.getByText("PILOTO Integrado")).toBeVisible();

  // 3) The same day records real work, not only material movement.
  await page.goto("/activities/new");
  await page.getByLabel("Proceso", { exact: true }).fill("Proceso piloto integrado");
  await page.getByLabel("Actividad", { exact: true }).fill("Actividad piloto integrada");
  await page.getByLabel("Juan").check();
  await page.getByRole("button", { name: "Iniciar actividad" }).click();
  await expect(page.getByRole("heading", { name: "Actividad piloto integrada" })).toBeVisible();
  await page.getByLabel(/Cantidad procesada/).fill("250");
  await page.getByRole("button", { name: "Finalizar actividad" }).click();
  await expect(page).toHaveURL(/\/app$/);

  // 4) A maintenance exception is resolved without leaving the operational day.
  await page.goto("/equipment/eq-tam-bp01");
  await page.getByRole("button", { name: "Iniciar reparación" }).click();
  await page.getByLabel("Causa encontrada").fill("Causa verificada en piloto integrado");
  await page.getByLabel("Acción realizada").fill("Ajuste ejecutado en piloto integrado");
  await page.getByRole("group", { name: "Trabajadores de reparación" }).getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Cerrar reparación" }).click();
  await expect(page.getByText("Disponible", { exact: true }).first()).toBeVisible();

  // 5) The exact Tamesis lot created by the measured reception is assigned to the compost pile and closed.
  await page.goto("/compost/new");
  await page.getByLabel("Planta").selectOption("tamesis");
  await page.getByLabel("Ubicación").fill("Zona piloto integrada");
  const sourceGroup = page.getByRole("group", { name: "Lotes físicos y masa asignada" });
  const sourceRow = sourceGroup.locator("div").filter({ has: page.getByText(lotCode!, { exact: true }) }).first();
  await expect(sourceRow).toContainText(lotCode!);
  await sourceRow.getByRole("checkbox").check();
  await sourceRow.getByLabel("Asignar (kg)").fill("1500");
  await page.getByLabel("Volumen conformado (m³)").fill("8");
  const formationMoment = bogotaLocalMinuteForDate(operationalDate);
  await page.getByLabel("Inicio de conformación · hora Colombia").fill(formationMoment);
  await page.getByLabel("Fin de conformación · hora Colombia").fill(formationMoment);
  await page.getByRole("group", { name: "Trabajadores de conformación" }).getByRole("checkbox").first().check();
  await page.getByRole("button", { name: "Conformar pila" }).click();
  await page.waitForURL((url) => url.pathname.startsWith("/compost/") && url.pathname !== "/compost/new");
  const pileId = new URL(page.url()).pathname.split("/").filter(Boolean).at(-1);
  expect(pileId).toBeTruthy();
  const pileCode = (await page.getByRole("heading", { level: 1 }).textContent())?.trim();
  expect(pileCode).toMatch(/^TAM-COMP-/);

  await page.getByLabel("Temperatura punto 1 (°C)").fill("58");
  await page.getByLabel("Temperatura punto 2 (°C)").fill("58");
  await page.getByLabel("Temperatura punto 3 (°C)").fill("58");
  await page.getByLabel("Temperatura ambiente (°C)").fill("22");
  await page.getByLabel(/Humedad \(%\)/).fill("52");
  await page.getByRole("button", { name: "Guardar control" }).click();
  await page.getByRole("button", { name: "Pasar a maduración" }).click();
  await page.getByLabel("Peso final medido (kg)").fill("1000");
  await page.getByRole("button", { name: "Cerrar pila" }).click();
  await expect(page.getByText("Cerrada", { exact: true })).toBeVisible();

  // 6) Finished production references that exact closed pile without copying its mass.
  await page.goto("/production/new");
  await page.getByLabel("Producto terminado").selectOption("wondergreen-solido");
  await page.getByLabel(/Cantidad producida/).fill("300");
  await page.getByLabel("Proceso fuente").fill("Peletizado piloto integrado");
  await page.getByLabel(/Pila cerrada relacionada/).selectOption(pileId!);
  await page.getByLabel(/Observación/).fill("Producción trazada desde la pila del piloto integrado");
  await page.getByRole("button", { name: "Guardar producción y entrar a inventario" }).click();
  await expect(page).toHaveURL(/\/production$/);
  const production = page.locator("article").filter({ hasText: "Wondergreen sólido" }).first();
  await expect(production).toContainText("300 kg");
  await expect(production).toContainText("Pila de compost");
  await expect(production).toContainText(pileCode!);

  // 7) The same production is the current physical stock.
  await page.goto("/inventory");
  const stock = page.locator("article").filter({ hasText: "Wondergreen sólido" }).first();
  await expect(stock).toContainText("300 kg");

  // 8) Direction can reconstruct the same operational day from canonical facts in one dashboard.
  await page.goto("/dashboard");
  await page.getByLabel("Fecha").fill(operationalDate);
  const indicators = page.getByLabel("Indicadores operativos");
  await expect(indicators.locator("article").filter({ hasText: "Recibido" })).toContainText("1.50 t");
  await expect(indicators.locator("article").filter({ hasText: "Procesado" })).toContainText("1.50 t");

  const periodProduction = page.getByLabel("Producción del periodo");
  const currentStock = page.getByLabel("Stock actual");
  await expect(periodProduction).toContainText("300");
  await expect(periodProduction).toContainText("kg");
  await expect(currentStock).toContainText("300");
  await expect(currentStock).toContainText("kg");

  const timeline = page.locator("section.panel").filter({ has: page.getByRole("heading", { name: "Eventos operativos recientes" }) });
  await expect(timeline).toContainText(/Producción TAM-PROD-/);
  await expect(timeline).toContainText("Wondergreen sólido · 300 kg");

  // 9) A full reload must hydrate the same facts without creating a second production.
  await page.reload();
  await page.getByLabel("Fecha", { exact: true }).fill(operationalDate);
  await expect(indicators.locator("article").filter({ hasText: "Recibido" })).toContainText("1.50 t");
  await expect(periodProduction).toContainText("300 kg");
  await expect(currentStock).toContainText("300 kg");
  await expect(timeline).toContainText("Wondergreen sólido · 300 kg");

  async function downloadReport() {
    const downloaded = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exportar CSV", exact: true }).click();
    const file = await downloaded;
    expect(await file.failure()).toBeNull();
    const path = await file.path();
    expect(path).not.toBeNull();
    return { filename: file.suggestedFilename(), csv: await readFile(path!, "utf8") };
  }

  // 10) Download the browser's actual report, rather than inspecting an in-memory helper.
  const report = await downloadReport();
  expect(report.filename).toBe(`greenatics-dashboard-${operationalDate}-${operationalDate}.csv`);
  expect(report.csv).toContain("Recibido kg;1500.00");
  expect(report.csv).toContain("Planta seleccionada;Todas");
  expect(report.csv).toContain("Modo de datos;local");
  expect(report.csv).toContain("Procesado kg (peso inicial medido de pilas iniciadas);1500.00");
  const [periodSection, stockSection] = report.csv.split("STOCK ACTUAL (snapshot, no depende del periodo)");
  expect(periodSection).toContain("PRODUCCIÓN DEL PERIODO");
  expect(periodSection).toContain("Wondergreen sólido;kg;300.00");
  expect(stockSection).toContain("Wondergreen sólido;kg;300.00;1");

  // 11) The same report cannot leak this plant's production into another plant's cut.
  await page.getByRole("combobox", { name: "Planta", exact: true }).selectOption("yarumal");
  await expect(currentStock).toContainText("Sin stock registrado.");
  const otherPlant = await downloadReport();
  expect(otherPlant.csv).toContain("Recibido kg;0.00");
  expect(otherPlant.csv).toContain("Planta seleccionada;Yarumal");
  expect(otherPlant.csv).not.toContain("Wondergreen sólido;kg;300.00");

  // 12) Historical flow is empty while stock remains an explicitly current snapshot.
  await page.getByRole("combobox", { name: "Planta", exact: true }).selectOption("tamesis");
  await page.getByLabel("Fecha", { exact: true }).fill("2000-01-01");
  await expect(periodProduction).toContainText("Sin producción terminada registrada en este periodo.");
  await expect(currentStock).toContainText("300 kg");
  const historical = await downloadReport();
  expect(historical.filename).toBe("greenatics-dashboard-2000-01-01-2000-01-01.csv");
  const [historicalFlow, currentSnapshot] = historical.csv.split("STOCK ACTUAL (snapshot, no depende del periodo)");
  expect(historicalFlow).not.toContain("Wondergreen sólido;kg;300.00");
  expect(currentSnapshot).toContain("Wondergreen sólido;kg;300.00;1");
});
