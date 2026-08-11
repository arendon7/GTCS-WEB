import { test, expect } from "@playwright/test";

function latestImportRun(page: import("@playwright/test").Page) {
  return page.locator("section.panel").filter({
    has: page.getByRole("heading", { name: "Fixture histórico GREENATICS · anomalías conocidas" }),
  }).first();
}

async function stageFixture(page: import("@playwright/test").Page) {
  await page.goto("/imports");
  await page.getByRole("button", { name: "Cargar fixture histórico QA" }).click();
  await page.getByRole("button", { name: "Ejecutar dry-run" }).click();
  await expect(page.getByText(/Dry-run creado: IMP-/)).toBeVisible();
  return latestImportRun(page);
}

test("historical fixture produces deterministic staging and quarantine counts", async ({ page }) => {
  await page.goto("/imports");
  await expect(page.getByRole("heading", { name: "Importaciones históricas" })).toBeVisible();
  await page.getByRole("button", { name: "Cargar fixture histórico QA" }).click();
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
