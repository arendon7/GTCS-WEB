import { test, expect } from "@playwright/test";
import { utils, write } from "xlsx";

function latestImportRun(page: import("@playwright/test").Page) {
  return page.locator("section.panel").filter({
    has: page.getByRole("heading", { name: "Fixture histórico GREENATICS · anomalías conocidas" }),
  }).first();
}

function importRunBySource(page: import("@playwright/test").Page, sourceName: string) {
  return page.locator("section.panel").filter({ has: page.getByRole("heading", { name: sourceName }) }).first();
}

function xlsxFixtureBuffer() {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([
    ["Fecha", "Actividad a realizar", "Trabajador responsable", "Hora de inicio", "Hora de finalización", "Herramientas utilizadas", "Comentarios", "Datos adjuntos"],
    [46196, "Molienda", "Alejandro", 46196.291666666664, 46196.5, "Molino", null, "1"],
    [46196, "Molienda", "Gabriel", 46196.291666666664, 46196.5, "Molino", null, "1"],
  ]), "BITACORA PROCESOS PLANTA TÁMESI");
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([
    ["Fecha y hora", "Placa", "Cliente", "Masa (Ton)", "Nobre conductor", "Teléfono conductor", "MES", "Material de rechazo"],
    [46192.52777777778, "WLX212", "Municipio de Támesis", 1.3, "Carlos Vallejo", "3017452101", "junio", "9 bultos"],
  ]), "Ingreso de Material Támesis");
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([
    ["Fecha y hora", "Cliente", "Masa (Ton)", "Nobre conductor", "Teléfono conductor", "Datos adjuntos", "MES", "Material de Rechazo PESO KG", "Material de Rechazo VOLUMEN", "Placa"],
    [46197.73263888889, "Greenatics", 426, "Carlos Areiza", "89", "1", "junio", null, "12 costales", "89"],
  ]), "Ingreso de Material Yarumal");
  return write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

async function stageFixture(page: import("@playwright/test").Page) {
  await page.goto("/imports");
  await page.getByRole("button", { name: "Cargar fixture QA" }).click();
  await page.getByRole("button", { name: "Ejecutar dry-run" }).click();
  await expect(page.getByText(/Dry-run creado: IMP-/)).toBeVisible();
  return latestImportRun(page);
}

test("historical fixture produces deterministic staging and quarantine counts", async ({ page }) => {
  await page.goto("/imports");
  await expect(page.getByRole("heading", { name: "Importaciones históricas" })).toBeVisible();
  await page.getByRole("button", { name: "Cargar fixture QA" }).click();
  await page.getByRole("button", { name: "Ejecutar dry-run" }).click();
  await expect(page.getByText(/Dry-run creado: IMP-/)).toBeVisible();

  const latestRun = latestImportRun(page);
  await expect(latestRun).toBeVisible();
  await expect(latestRun).toContainText("Filas");
  await expect(latestRun).toContainText("12");
  await expect(latestRun).toContainText("Válidas");
  await expect(latestRun).toContainText("Warnings");
  await expect(latestRun).toContainText("Cuarentena");
  await expect(latestRun).toContainText("Duplicados");
  await expect(latestRun).toContainText("DURATION_EXCESSIVE");
  await expect(latestRun).toContainText("WORKER_ALIAS_RESOLVED");
  await expect(latestRun).toContainText("DUPLICATE_EXACT");
  await expect(latestRun).toContainText("Alejandro + Gabriel");
});

test("same source cannot create a second import run and canonical promotion is single-use", async ({ page }) => {
  const latestRun = await stageFixture(page);
  await page.getByRole("button", { name: "Ejecutar dry-run" }).click();
  await expect(page.getByText(/Esta fuente ya fue procesada/)).toBeVisible();
  await latestRun.getByRole("button", { name: "Aprobar candidatos válidos" }).click();
  await expect(page.getByText(/Promoción canónica completada: 3 actividades y 2 recepciones/)).toBeVisible();
  await expect(latestRun.getByText("Promovido", { exact: true })).toBeVisible();
  await expect(latestRun.getByRole("button", { name: "Promovido" })).toBeDisabled();
});

test("approved history becomes traceable receptions and historical analytics", async ({ page }) => {
  const latestRun = await stageFixture(page);
  await latestRun.getByRole("button", { name: "Aprobar candidatos válidos" }).click();
  await expect(page.getByText(/Promoción canónica completada/)).toBeVisible();

  await page.getByRole("link", { name: "Recepciones" }).click();
  await expect(page.getByText("HIST-YAR-FORSU-260613-R-001", { exact: true })).toBeVisible();
  await expect(page.getByText("HIST-TAM-FORSU-260620-R-002", { exact: true })).toBeVisible();
  await expect(page.getByText("Sin dato histórico").first()).toBeVisible();
  await expect(page.getByText("Importación histórica").first()).toBeVisible();

  await page.getByRole("link", { name: "Dashboard" }).click();
  await page.getByRole("button", { name: "Histórico" }).click();
  await expect(page.getByLabel("Indicadores operativos").getByText("7.88 t", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Horas por trabajador" })).toBeVisible();
  await expect(page.getByText("Jonathan Balbín", { exact: true }).first()).toBeVisible();
});

test("XLSX upload exposes source profiles and quarantines ambiguous Yarumal mass", async ({ page }) => {
  await page.goto("/imports");
  await page.getByLabel("Archivo Excel").setInputFiles({
    name: "BD_Operativa_Greenatics_QA.xlsx",
    mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    buffer: xlsxFixtureBuffer(),
  });

  const adapter = page.getByLabel("Lectura del Excel");
  await expect(adapter).toBeVisible();
  await expect(adapter).toContainText("Ingreso de Material Támesis");
  await expect(adapter).toContainText("Masa (Ton) declarada como toneladas");
  await expect(adapter).toContainText("Ingreso de Material Yarumal");
  await expect(adapter).toContainText("AMBIGUOUS_MASS_PROFILE");
  await expect(page.getByText(/Excel leído: 3 hojas, 2 filas de bitácora y 2 recepciones candidatas/)).toBeVisible();

  await page.getByRole("button", { name: "Ejecutar dry-run" }).click();
  const run = importRunBySource(page, "BD_Operativa_Greenatics_QA.xlsx");
  await expect(run).toBeVisible();
  await expect(run).toContainText("UNIT_AMBIGUOUS");
  await expect(run).toContainText("REJECTION_UNQUANTIFIED");
  await expect(run).toContainText("Alejandro + Gabriel");

  await run.getByRole("button", { name: "Aprobar candidatos válidos" }).click();
  await expect(page.getByText(/Promoción canónica completada: 1 actividades y 1 recepciones/)).toBeVisible();
  await page.getByRole("link", { name: "Recepciones" }).click();
  await expect(page.getByText("Sin dato cuantitativo").first()).toBeVisible();
});
