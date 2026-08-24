import { test, expect } from "@playwright/test";

test("trazabilidad service connects governed Yarumal evidence without turning the case into a universal promise", async ({ page }) => {
  await page.goto("/soluciones/trazabilidad-datos");

  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "Trazabilidad digital, indicadores y GREENATICS OPS" })).toBeVisible();
  await expect(main.getByRole("heading", { name: "Qué recibe", exact: true })).toBeVisible();
  await expect(main.getByRole("heading", { name: "Qué hacemos", exact: true })).toBeVisible();
  await expect(main.getByRole("heading", { name: /Casos que documentan esta capacidad/ })).toBeVisible();

  const evidence = main.getByRole("article").filter({ has: main.getByRole("heading", { name: "Yarumal", exact: true }) });
  await expect(evidence).toHaveCount(1);
  await expect(evidence.getByText("Caso documentado", { exact: true })).toBeVisible();
  await expect(evidence.getByText(/registros de recepción, lotes, mantenimiento, producto e inventarios/i)).toBeVisible();
  await expect(evidence.getByRole("link", { name: /Abrir caso documentado/ })).toHaveAttribute("href", "/proyectos/yarumal");
  await expect(main.getByRole("heading", { name: "Támesis", exact: true })).toHaveCount(0);
});

test("rehabilitation service connects only the governed Tamesis assessment and related infrastructure routes", async ({ page }) => {
  await page.goto("/soluciones/rehabilitacion");

  const main = page.getByRole("main");
  const evidence = main.getByRole("article").filter({ has: main.getByRole("heading", { name: "Támesis", exact: true }) });
  await expect(evidence).toHaveCount(1);
  await expect(evidence.getByText("Diagnóstico y rehabilitación documentados", { exact: true })).toBeVisible();
  await expect(evidence.getByRole("link", { name: /Abrir caso documentado/ })).toHaveAttribute("href", "/proyectos/tamesis");
  await expect(main.getByRole("heading", { name: "Yarumal", exact: true })).toHaveCount(0);

  await expect(main.getByRole("heading", { name: /El servicio puede conectarse con otras fases/ })).toBeVisible();
  await expect(main.locator('a[href="/soluciones/factibilidad-ingenieria"]')).toHaveCount(1);
  await expect(main.locator('a[href="/soluciones/plantas-nuevas"]')).toHaveCount(1);
});

test("services without a directly governed case do not fabricate an evidence block", async ({ page }) => {
  await page.goto("/soluciones/pmirs");

  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "PMIRS y planes internos de gestión de residuos" })).toBeVisible();
  await expect(main.getByText("Evidencia pública relacionada", { exact: true })).toHaveCount(0);
  await expect(main.getByRole("heading", { name: "Yarumal", exact: true })).toHaveCount(0);
  await expect(main.getByRole("heading", { name: "Támesis", exact: true })).toHaveCount(0);
});

test("service contact keeps the exact commercial context instead of restarting at diagnosis", async ({ page }) => {
  await page.goto("/soluciones/trazabilidad-datos");

  const contact = page.getByRole("link", { name: "Solicitar conversación comercial", exact: true });
  const href = await contact.getAttribute("href");
  expect(href).toBeTruthy();
  const target = new URL(href!, "https://greenatics.com.co");
  expect(target.pathname).toBe("/contacto");
  expect(target.searchParams.get("source")).toBe("solucion");
  expect(target.searchParams.get("service")).toBe("Trazabilidad digital, indicadores y GREENATICS OPS");
  expect(target.searchParams.get("contexto")).toContain("Interés en Trazabilidad digital");

  await contact.click();
  const inherited = page.getByLabel("Contexto heredado de navegación");
  await expect(inherited).toContainText("Origen: solucion");
  await expect(inherited).toContainText("Servicio: Trazabilidad digital, indicadores y GREENATICS OPS");
  await expect(inherited).toContainText("Interés en Trazabilidad digital");
});
