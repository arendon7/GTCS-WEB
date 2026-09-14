import { test, expect } from "@playwright/test";

test("projects hub exposes Yarumal and Tamesis with publication context and service-first next step", async ({ page }) => {
  await page.goto("/proyectos");

  await expect(page.getByRole("heading", { name: /La experiencia no es una foto de una planta/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Yarumal", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Támesis", exact: true })).toBeVisible();
  await expect(page.getByText("Caso documentado", { exact: true })).toBeVisible();
  await expect(page.getByText("Diagnóstico y rehabilitación documentados", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /La evidencia ayuda a elegir una capacidad/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver soluciones", exact: true })).toHaveAttribute("href", "/soluciones");
  await expect(page.getByRole("link", { name: "No sé por dónde empezar", exact: true })).toHaveAttribute("href", "/soluciones/diagnostico-inicial");
  await expect(page.getByRole("link", { name: "Empezar por diagnóstico", exact: true })).toHaveCount(0);
});

test("Yarumal case separates documented learning from current-state claims and routes to traceability", async ({ page }) => {
  await page.goto("/proyectos/yarumal");

  await expect(page.getByRole("heading", { name: "Yarumal", exact: true })).toBeVisible();
  await expect(page.getByText("Contexto de publicación", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Registrar → Conectar → Aprender." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trazabilidad", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: /El caso orienta una capacidad relacionada/i })).toBeVisible();
  await expect(page.getByText(/registros de recepción, lotes, mantenimiento, producto e inventarios/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Conocer trazabilidad y GREENATICS OPS" })).toHaveAttribute("href", "/soluciones/trazabilidad-datos");
});

test("Tamesis case exposes the rehabilitation maturity sequence and governed related solution", async ({ page }) => {
  await page.goto("/proyectos/tamesis");

  await expect(page.getByRole("heading", { name: "Támesis", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Puesta en marcha → Estabilización → Escalabilidad." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Reactivación biológica" })).toBeVisible();
  await expect(page.getByText(/separar brechas de infraestructura, proceso, personal, suministro y operación/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver solución de rehabilitación" })).toHaveAttribute("href", "/soluciones/rehabilitacion");
});
