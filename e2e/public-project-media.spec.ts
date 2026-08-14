import { test, expect } from "@playwright/test";

test("projects page shows real Yarumal evidence and an honest Tamesis placeholder", async ({ page }) => {
  await page.goto("/proyectos");

  await expect(page.getByRole("img", { name: /Vista aérea documentada de la planta Greenatics en Yarumal/ })).toBeVisible();
  await expect(page.getByRole("img", { name: /Támesis: evidencia visual pública pendiente de conciliación/ })).toBeVisible();
  await expect(page.getByText("No usamos una fotografía genérica para representar un proyecto real.")).toBeVisible();
});

test("Yarumal detail gallery is sourced from the governed media registry", async ({ page }) => {
  await page.goto("/proyectos/yarumal");

  await expect(page.getByRole("heading", { name: "Registro documental del proyecto." })).toBeVisible();
  await expect(page.getByRole("img", { name: /Vista aérea documentada de la planta Greenatics en Yarumal/ })).toBeVisible();
  await expect(page.getByRole("img", { name: /Segunda vista aérea documentada de la planta Greenatics en Yarumal/ })).toBeVisible();
  await expect(page.getByText(/Si un proyecto no tiene activo conciliado/)).toBeVisible();
});
