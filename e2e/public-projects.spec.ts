import { test, expect } from "@playwright/test";

test("projects hub exposes Yarumal and Tamesis with publication context", async ({ page }) => {
  await page.goto("/proyectos");

  await expect(page.getByRole("heading", { name: /La experiencia no es una foto de una planta/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Yarumal", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Támesis", exact: true })).toBeVisible();
  await expect(page.getByText("Caso documentado", { exact: true })).toBeVisible();
  await expect(page.getByText("Diagnóstico y rehabilitación documentados", { exact: true })).toBeVisible();
});

test("Yarumal case separates documented learning from current-state claims", async ({ page }) => {
  await page.goto("/proyectos/yarumal");

  await expect(page.getByRole("heading", { name: "Yarumal", exact: true })).toBeVisible();
  await expect(page.getByText("Contexto de publicación", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Registrar → Conectar → Aprender." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trazabilidad", exact: true })).toBeVisible();
});

test("Tamesis case exposes the rehabilitation maturity sequence", async ({ page }) => {
  await page.goto("/proyectos/tamesis");

  await expect(page.getByRole("heading", { name: "Támesis", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Puesta en marcha → Estabilización → Escalabilidad." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reactivación biológica" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver solución de rehabilitación" })).toHaveAttribute("href", "/soluciones/rehabilitacion");
});
