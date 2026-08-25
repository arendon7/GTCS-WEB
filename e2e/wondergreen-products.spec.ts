import { test, expect } from "@playwright/test";

test("Wondergreen product catalog exposes governed references with commercial products first", async ({ page }) => {
  await page.goto("/wondergreen/productos");

  await expect(page.getByRole("heading", { name: "Productos concretos, formulación por formulación." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Estado comercial confirmado" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("8 referencias", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /2Grow Sólido/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Extracto de Neem/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Encontrar mi programa/ })).toHaveAttribute("href", "/wondergreen/finder");

  await expect(page.getByRole("link", { name: /2Grow Sólido/ }).first()).toHaveAttribute("data-tone", "grow");
  await expect(page.getByRole("link", { name: /2Balance Sólido/ }).first()).toHaveAttribute("data-tone", "balance");
  await expect(page.getByRole("link", { name: /2Bloom Sólido/ }).first()).toHaveAttribute("data-tone", "bloom");
  await expect(page.getByRole("link", { name: /2Fruit Sólido/ }).first()).toHaveAttribute("data-tone", "fruit");

  await page.getByRole("button", { name: "Todo el portafolio" }).click();
  await expect(page.getByText("17 referencias", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Extracto de Neem/ }).first()).toHaveAttribute("data-tone", "botanical");
});

test("catalog browser filters by search, commercial truth and format without changing Product Master", async ({ page }) => {
  await page.goto("/wondergreen/productos");

  await page.getByRole("button", { name: "Todo el portafolio" }).click();
  const search = page.getByRole("searchbox", { name: "Buscar en el portafolio" });
  await search.fill("Neem");
  await expect(page.getByText("1 referencia", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Extracto de Neem/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /2Grow Sólido/ })).toHaveCount(0);

  await page.getByRole("button", { name: "Volver a referencias confirmadas" }).click();
  await expect(page.getByRole("button", { name: "Estado comercial confirmado" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("link", { name: /2Grow Sólido/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Extracto de Neem/ })).toHaveCount(0);

  await page.getByRole("button", { name: "Líquidos" }).click();
  await expect(page.getByRole("link", { name: /2Grow Líquido/ }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /2Grow Sólido/ })).toHaveCount(0);
});

test("commercial product page shows reconciled state and approved line artwork without inventing a packshot", async ({ page }) => {
  await page.goto("/wondergreen/productos/2grow-solido-15-3-3");

  await expect(page.locator('div[data-tone="grow"]').first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /2Grow Sólido/ })).toBeVisible();
  await expect(page.getByText("Referencia comercial reconciliada").first()).toBeVisible();
  await expect(page.getByText("Reconciliada", { exact: true })).toBeVisible();
  await expect(page.getByRole("img", { name: "Identidad visual aprobada de la línea Wondergreen 2Grow" })).toBeVisible();
  await expect(page.getByText(/No se presenta como packshot específico/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Manual de uso Wondergreen" })).toHaveAttribute("href", "/biblioteca/manual-uso-wondergreen");
});

test("product consultation preserves the exact governed reference into contact", async ({ page }) => {
  await page.goto("/wondergreen/productos/2grow-solido-15-3-3");

  const consult = page.getByRole("link", { name: "Consultar esta referencia" });
  await expect(consult).toHaveAttribute("href", "/contacto?producto=2grow-solido-15-3-3#wondergreen");
  await consult.click();

  await expect(page.getByRole("heading", { name: "Cuéntanos el contexto de 2Grow Sólido." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "2Grow Sólido · 15-3-3" })).toBeVisible();
  await expect(page.getByText("Referencia comercial reconciliada").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Volver a la ficha/ })).toHaveAttribute("href", "/wondergreen/productos/2grow-solido-15-3-3");
  await expect(page.getByRole("link", { name: "Agendar reunión", exact: true }).first()).toHaveAttribute("href", /^https:\/\/outlook\.office\.com\//);
});

test("unknown product context is ignored instead of fabricating a reference", async ({ page }) => {
  await page.goto("/contacto?producto=referencia-inexistente#wondergreen");

  await expect(page.getByRole("heading", { name: "Cuéntanos qué quieres resolver." })).toBeVisible();
  await expect(page.getByRole("heading", { name: /2Grow|Estás consultando/ })).toHaveCount(0);
});

test("technical bioinput page does not pretend to be commercially available", async ({ page }) => {
  await page.goto("/wondergreen/productos/extracto-neem");

  await expect(page.locator('div[data-tone="botanical"]').first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /Extracto de Neem/ })).toBeVisible();
  await expect(page.getByText(/Portafolio técnico · ficha\/registro por reconciliar/).first()).toBeVisible();
  await expect(page.getByText("Requiere confirmación", { exact: true })).toBeVisible();
  await expect(page.getByText("Consultar", { exact: true })).toBeVisible();
});