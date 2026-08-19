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
  await expect(page.getByRole("heading", { name: "Kit Trasplanta & Arranca", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Ver etapa y formatos propuestos/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver composición y ruta/i }).first()).toBeVisible();
});

test("Casa product detail exposes proposed household formats without making them commercial SKUs", async ({ page }) => {
  await page.goto("/casa-jardin/productos/crece");

  await expect(page.getByRole("heading", { name: "CRECE", exact: true })).toBeVisible();
  for (const variant of ["500 g", "1 kg", "2 kg", "5 kg"]) {
    await expect(page.getByRole("heading", { name: variant, exact: true })).toBeVisible();
  }
  await expect(page.getByText(/Sin precio público, cobertura ni dosis/i).first()).toBeVisible();
  await expect(page.getByText(/La presentación pequeña no se presume habilitada/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver Product Truth técnico" })).toHaveAttribute("href", "/wondergreen/productos/2grow-solido-15-3-3");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.getByText(/\$\s*[0-9]/)).toHaveCount(0);
});

test("Casa kit detail preserves exact sourced composition without checkout or savings claims", async ({ page }) => {
  await page.goto("/casa-jardin/kits/mi-huerta");

  await expect(page.getByRole("heading", { name: "Kit Mi Huerta", exact: true })).toBeVisible();
  for (const component of ["COMPOST · 2 kg", "CRECE · 500 g", "FLORECE · 500 g", "FRUCTIFICA · 500 g"]) {
    await expect(page.getByRole("heading", { name: component, exact: true })).toBeVisible();
  }
  await expect(page.getByText(/hipótesis comercial de precios/i)).toBeVisible();
  await expect(page.getByText(/no se anuncia ahorro/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /comprar/i })).toHaveCount(0);
  await expect(page.getByText(/\$\s*[0-9]/)).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
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

test("Casa diagnostic captures pot size but routes a healthy growing plant without calculating dose", async ({ page }) => {
  await page.goto("/casa-jardin/diagnostico");

  await page.getByLabel("Tipo de planta").selectOption("green");
  await page.getByLabel("Etapa de la planta").selectOption("growing");
  await page.getByLabel("Condición de la planta").selectOption("healthy");
  await page.getByLabel("Cantidad de plantas").selectOption("6-10");
  await page.getByLabel("Matera M").check();
  await page.getByLabel("Matera L").check();

  await expect(page.getByText("CRECE · 15-3-3", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir siguiente paso →" })).toHaveAttribute("href", "/casa-jardin/productos/crece");
  await expect(page.getByText(/Aún no tiene equivalencia pública a volumen ni gramos/i)).toBeVisible();
  await expect(page.getByText(/No calcula dosis ni cobertura todavía/i)).toBeVisible();
});

test("extremely dry substrate stays in review instead of recommending fertilizer", async ({ page }) => {
  await page.goto("/casa-jardin/diagnostico");
  await page.getByLabel("Tipo de planta").selectOption("green");
  await page.getByLabel("Etapa de la planta").selectOption("growing");
  await page.getByLabel("Condición de la planta").selectOption("extremely-dry");
  await expect(page.getByText("Primero recupera una humedad adecuada.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir siguiente paso →" })).toHaveCount(0);
});

test("Casa guide library exposes handoff sources without broken download links", async ({ page }) => {
  await page.goto("/casa-jardin/guias");

  for (const guide of ["Guía Wondergreen Casa & Jardín", "Guía Mi Huerta", "Guía rápida de etapas", "Guía de trasplante"]) {
    await expect(page.getByRole("heading", { name: guide, exact: true })).toBeVisible();
  }
  await expect(page.getByRole("link", { name: /Descargar PDF/i })).toHaveCount(0);
  await expect(page.getByText(/PDF fuente validado en el handoff/i).first()).toBeVisible();
});
