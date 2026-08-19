import { test, expect } from "@playwright/test";

test("Casa Jardín and Vivero exposes stage system without price or checkout", async ({ page }) => {
  await page.goto("/casa-jardin");

  for (const [name, formula] of [
    ["CRECE", "15-3-3"],
    ["EQUILIBRA", "7-7-7"],
    ["FLORECE", "3-8-3"],
    ["FRUCTIFICA", "3-3-8"],
  ] as const) {
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
    await expect(page.getByText(formula, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText("COMPOST", { exact: true }).first()).toBeVisible();

  for (const kit of ["Kit Plantas Verdes", "Kit Plantas con Flor", "Kit Mi Huerta", "Kit Casa Completa", "Casa Completa XL"]) {
    await expect(page.getByRole("heading", { name: kit, exact: true })).toBeVisible();
  }

  await expect(page.getByRole("button", { name: /comprar/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /comprar/i })).toHaveCount(0);
  await expect(page.getByText(/\$\s*[0-9]/)).toHaveCount(0);
  await expect(page.getByText(/Kit Trasplanta & Arranca no aparece como kit disponible/i)).toBeVisible();
});

test("Casa diagnostic stops fertilizer-first response on safety conditions", async ({ page }) => {
  await page.goto("/casa-jardin/diagnostico");

  await page.getByLabel("Tipo de planta").selectOption("green");
  await page.getByLabel("Etapa de la planta").selectOption("growing");
  await page.getByLabel("Condición de la planta").selectOption("waterlogged");

  await expect(page.getByText("Primero corrige la condición de la planta.", { exact: true })).toBeVisible();
  await expect(page.getByText(/NO EMPIECES FERTILIZANDO/i)).toBeVisible();
  await expect(page.getByText(/Calculadora de dosis: deshabilitada/i)).toBeVisible();
});

test("Casa diagnostic routes a healthy growing plant to CRECE without calculating dose", async ({ page }) => {
  await page.goto("/casa-jardin/diagnostico");

  await page.getByLabel("Tipo de planta").selectOption("green");
  await page.getByLabel("Etapa de la planta").selectOption("growing");
  await page.getByLabel("Condición de la planta").selectOption("healthy");
  await page.getByLabel("Cantidad de plantas").selectOption("6-10");

  await expect(page.getByText("CRECE · 15-3-3", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir siguiente paso →" })).toHaveAttribute("href", "/wondergreen/productos/2grow-solido-15-3-3");
  await expect(page.getByText(/No calcula dosis ni cobertura todavía/i)).toBeVisible();
});

test("Casa guide library exposes handoff sources without broken download links", async ({ page }) => {
  await page.goto("/casa-jardin/guias");

  for (const guide of ["Guía Wondergreen Casa & Jardín", "Guía Mi Huerta", "Guía rápida de etapas", "Guía de trasplante"]) {
    await expect(page.getByRole("heading", { name: guide, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: /Descargar PDF/i })).toHaveCount(0);
  await expect(page.getByText(/PDF fuente validado en el handoff/i).first()).toBeVisible();
});
