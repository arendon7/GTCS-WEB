import { test, expect } from "@playwright/test";

test("impact page exposes governed metrics without invented values", async ({ page }) => {
  await page.goto("/impacto");

  await expect(page.getByRole("heading", { name: /No basta con decir que aprovechamos residuos/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "La estructura existe. Los valores aparecen cuando estén aprobados." })).toBeVisible();
  await expect(page.getByText("Residuos orgánicos recibidos", { exact: true })).toBeVisible();
  await expect(page.getByText("Impacto climático estimado", { exact: true })).toBeVisible();
  await expect(page.getByText("En validación", { exact: true })).toHaveCount(6);
});

test("impact publication method is explicit", async ({ page }) => {
  await page.goto("/impacto");

  await expect(page.getByRole("heading", { name: "Del registro operativo al dato público." })).toBeVisible();
  await expect(page.getByText("Registrar", { exact: true })).toBeVisible();
  await expect(page.getByText("Conciliar", { exact: true })).toBeVisible();
  await expect(page.getByText("Aprobar", { exact: true })).toBeVisible();
  await expect(page.getByText("Publicar", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "CO₂-eq no es una cifra decorativa." })).toBeVisible();
});

test("impact page links back to governed project cases", async ({ page }) => {
  await page.goto("/impacto");
  await page.getByRole("link", { name: "Ver caso Yarumal" }).click();
  await expect(page).toHaveURL(/\/proyectos\/yarumal$/);
  await expect(page.getByRole("heading", { name: "Yarumal", exact: true })).toBeVisible();
});

test("impact closes the evidence loop toward documented projects and solutions", async ({ page }) => {
  await page.goto("/impacto");

  await expect(page.getByRole("heading", { name: /La evidencia pública debe llevar al caso que la explica/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver proyectos documentados", exact: true })).toHaveAttribute("href", "/proyectos");
  await expect(page.getByRole("link", { name: "Ver soluciones", exact: true })).toHaveAttribute("href", "/soluciones");
  await expect(page.getByText("En validación", { exact: true })).toHaveCount(6);
});
