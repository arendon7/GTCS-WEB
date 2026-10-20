import { expect, test } from "@playwright/test";

function bogotaNowIso() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "00";
  return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}:${value("second")}-05:00`;
}

test("Today keeps calculated data-quality alerts separate from operational exceptions", async ({ page }) => {
  const at = bogotaNowIso();
  const qualityReceipts = [
    { id: "e2e-quality-unquantified", plantId: "tamesis", plant: "Támesis", generator: "Histórico sin cuantificar", route: "Ruta histórica", wasteType: "FORSU", netWeightKg: 500, rejectionKg: 0, rejectionKnown: false, acceptance: "unknown", startedAt: at, endedAt: at, lotCode: "HIST-E2E-001", source: "historical" },
    { id: "e2e-quality-unknown-acceptance", plantId: "tamesis", plant: "Támesis", generator: "Histórico sin aceptación", route: "Ruta histórica", wasteType: "FORSU", netWeightKg: 400, rejectionKg: 20, rejectionKnown: true, acceptance: "unknown", startedAt: at, endedAt: at, lotCode: "HIST-E2E-002", source: "historical" },
  ];

  await page.addInitScript((receptions) => {
    window.localStorage.setItem("greenatics-ops-mvp-001", JSON.stringify({ receptions }));
  }, qualityReceipts);
  await page.goto("/app");

  const quality = page.locator("#calidad-datos");
  const exceptions = page.locator("#alertas");
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
  await expect(quality.getByRole("heading", { name: "Cobertura e incertidumbre" })).toBeVisible();
  await expect(quality).toContainText("2 alertas de hoy");
  await expect(quality.locator(".data-quality-warning")).toContainText("Rechazo sin cuantificar");
  await expect(quality.locator(".data-quality-warning")).toContainText("1 recepción");
  await expect(quality.locator(".data-quality-info")).toContainText("Aceptación histórica no determinada");
  await expect(quality.locator(".data-quality-info")).toContainText("2 recepciones");
  await expect(exceptions.getByRole("heading", { name: "Excepciones" })).toBeVisible();
  await expect(exceptions.locator(".alert-count")).toHaveText("1");
  await expect(exceptions).not.toContainText("Rechazo sin cuantificar");
  await expect(exceptions).not.toContainText("Aceptación histórica no determinada");
});

test("Today explains when analytics has no data-quality alerts", async ({ page }) => {
  await page.goto("/app");

  const quality = page.locator("#calidad-datos");
  await expect(quality).toContainText("0 alertas de hoy");
  await expect(quality).toContainText("Sin alertas de calidad calculadas para hoy");
});
