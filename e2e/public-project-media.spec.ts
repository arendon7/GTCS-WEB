import { test, expect } from "@playwright/test";

test("projects page shows governed visual evidence for Yarumal and Tamesis", async ({ page }) => {
  await page.goto("/proyectos");

  await expect(page.getByRole("img", { name: /Vista aérea documentada del caso Greenatics en Yarumal/ })).toBeVisible();
  await expect(page.getByRole("img", { name: /Infraestructura de proceso documentada en el proyecto Greenatics de Támesis/ })).toBeVisible();
  await expect(page.getByText(/No usamos una fotografía genérica para representar un proyecto real/)).toHaveCount(0);
});

test("Yarumal detail gallery is sourced from the governed media registry", async ({ page }) => {
  await page.goto("/proyectos/yarumal");

  await expect(page.getByRole("heading", { name: "Un registro real del caso Yarumal." })).toBeVisible();
  await expect(page.getByRole("img", { name: /Vista aérea documentada del caso Greenatics en Yarumal/ })).toBeVisible();
  await expect(page.getByRole("img", { name: /Segunda vista aérea documentada del caso Greenatics en Yarumal/ })).toBeVisible();
  await expect(page.getByText(/Si un proyecto no tiene activo conciliado/)).toBeVisible();
});

test("Tamesis detail gallery exposes historical evidence without turning it into a current-state claim", async ({ page }) => {
  await page.goto("/proyectos/tamesis");

  await expect(page.getByRole("heading", { name: "Un registro real del caso Támesis." })).toBeVisible();
  await expect(page.getByRole("img", { name: /Infraestructura de proceso documentada en el proyecto Greenatics de Támesis/ })).toBeVisible();
  await expect(page.getByText(/Registro fotográfico de archivo · Támesis · julio de 2023/)).toBeVisible();
  await expect(page.getByText(/no representa por sí sola el estado operativo actual/i)).toBeVisible();
  await expect(page.getByText(/una fotografía no se usa para afirmar por sí sola capacidad, producción o estado operativo actual/i)).toBeVisible();
});
