import { test, expect } from "@playwright/test";

test("Casa Jardín and Vivero leads with products and kits while keeping safe orientation secondary", async ({ page }) => {
  await page.goto("/casa-jardin");

  await expect(page.getByRole("heading", { name: "Nutrición por etapas para tus plantas.", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver productos por etapa", exact: true }).first()).toHaveAttribute("href", "#etapas");
  await expect(page.getByRole("link", { name: "Ver kits", exact: true }).first()).toHaveAttribute("href", "#kits");
  await expect(page.getByRole("link", { name: "No sé qué etapa corresponde →", exact: true })).toHaveAttribute("href", "/casa-jardin/diagnostico");

  const hierarchy = await page.evaluate(() => {
    const stages = document.querySelector("#etapas");
    const kits = document.querySelector("#kits");
    const diagnostic = document.querySelector("#diagnostico");
    if (!stages || !kits || !diagnostic) return { stagesBeforeDiagnostic: false, kitsBeforeDiagnostic: false };
    return {
      stagesBeforeDiagnostic: Boolean(stages.compareDocumentPosition(diagnostic) & Node.DOCUMENT_POSITION_FOLLOWING),
      kitsBeforeDiagnostic: Boolean(kits.compareDocumentPosition(diagnostic) & Node.DOCUMENT_POSITION_FOLLOWING),
    };
  });
  expect(hierarchy).toEqual({ stagesBeforeDiagnostic: true, kitsBeforeDiagnostic: true });

  await expect(page.getByRole("heading", { name: "Kits por uso. Etapas separadas, no una receta universal.", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "A veces, la mejor dosis es no fertilizar todavía.", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "¿No sabes qué etapa corresponde?", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Usar orientador", exact: true })).toHaveAttribute("href", "/casa-jardin/diagnostico");

  await expect(page.getByRole("img", { name: /Sistema Wondergreen por etapas/i })).toHaveAttribute("src", "/api/public-media/wondergreen-system-stages");
  await expect(page.getByRole("link", { name: /Descargar catálogo Wondergreen/i })).toHaveAttribute("href", "/api/public-resources/wondergreen-product-master");

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

  for (const [alt, src] of [
    [/Línea Wondergreen 2Grow/i, "/api/public-media/wondergreen-2grow"],
    [/Línea Wondergreen 2Balance/i, "/api/public-media/wondergreen-2balance"],
    [/Línea Wondergreen 2Bloom/i, "/api/public-media/wondergreen-2bloom"],
    [/Línea Wondergreen 2Fruit/i, "/api/public-media/wondergreen-2fruit"],
  ] as const) {
    await expect(page.getByRole("img", { name: alt })).toHaveAttribute("src", src);
  }

  for (const kit of ["Kit Plantas Verdes", "Kit Plantas con Flor", "Kit Mi Huerta", "Kit Casa Completa", "Casa Completa XL"]) {
    await expect(page.getByRole("heading", { name: kit, exact: true })).toBeVisible();
  }

  await expect(page.getByText("Ya está gobernado", { exact: true })).toBeVisible();
  await expect(page.getByText("Falta cerrar antes de activar ecommerce", { exact: true })).toBeVisible();
  await expect(page.getByText(/Costo total y PVP gobernado/i)).toBeVisible();
  await expect(page.getByText(/Kit Trasplanta & Arranca · bloqueado/i)).toBeVisible();

  await expect(page.getByRole("button", { name: /comprar/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /comprar/i })).toHaveCount(0);
  await expect(page.getByText(/\$\s*[0-9]/)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Kit Trasplanta & Arranca", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Ver etapa y formatos propuestos/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver composición y ruta/i }).first()).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
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
  await expect(page.getByText(/Tampoco se anuncia ahorro/i)).toBeVisible();
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
  await expect(page.getByRole("link", { name: "Llevar este contexto a soporte técnico →" })).toHaveAttribute("href", /need=nutricion/);
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

  const params = await page.evaluate(() => Object.fromEntries(new URL(window.location.href).searchParams.entries()));
  expect(params).toMatchObject({ plant: "green", stage: "growing", condition: "healthy", count: "6-10", pots: "M,L" });
});

test("Casa diagnostic restores structured state and Contact inherits it without turning it into a prescription", async ({ page }) => {
  await page.goto("/casa-jardin/diagnostico?plant=green&stage=growing&condition=healthy&count=6-10&pots=M,L");

  await expect(page.getByLabel("Tipo de planta")).toHaveValue("green");
  await expect(page.getByLabel("Etapa de la planta")).toHaveValue("growing");
  await expect(page.getByLabel("Condición de la planta")).toHaveValue("healthy");
  await expect(page.getByLabel("Cantidad de plantas")).toHaveValue("6-10");
  await expect(page.getByLabel("Matera M")).toBeChecked();
  await expect(page.getByLabel("Matera L")).toBeChecked();
  await expect(page.getByText("CRECE · 15-3-3", { exact: true })).toBeVisible();

  const support = page.getByRole("link", { name: "Llevar este contexto a soporte técnico →" });
  const href = await support.getAttribute("href");
  expect(href).toBeTruthy();
  const target = new URL(href!, "https://greenatics.com.co");
  expect(target.searchParams.get("audience")).toBe("wondergreen");
  expect(target.searchParams.get("need")).toBe("nutricion");
  expect(target.searchParams.get("source")).toBe("casa-jardin-diagnostico");
  expect(target.searchParams.get("contexto")).toContain("Materas: M, L");
  expect(target.searchParams.get("contexto")).not.toContain("prescripción");

  await support.click();
  await expect(page.getByRole("heading", { name: /Cuéntanos sobre tu cultivo o tu interés en Wondergreen/i })).toBeVisible();
  await expect(page.getByLabel("¿Desde qué contexto nos escribes?")).toHaveValue("wondergreen");
  await expect(page.getByLabel("¿Qué necesitas resolver primero?")).toHaveValue("nutricion");
  await expect(page.getByLabel("Contexto recibido de la navegación")).toContainText("Materas: M, L");

  await page.getByRole("button", { name: "Preparar contexto" }).click();
  await expect(page.getByLabel("Resumen preparado para la conversación")).toContainText("Contexto heredado: Casa & Jardín");
  await expect(page.getByLabel("Resumen preparado para la conversación")).toContainText("Orientación del flujo: CRECE · 15-3-3");
  await expect(page.getByText(/Nada se ha enviado todavía/i)).toBeVisible();
});

test("Casa diagnostic lets an unknown stage stay in review instead of fabricating a product", async ({ page }) => {
  await page.goto("/casa-jardin/diagnostico");
  await page.getByLabel("Tipo de planta").selectOption("green");
  await page.getByLabel("Etapa de la planta").selectOption("unknown");
  await page.getByLabel("Condición de la planta").selectOption("healthy");

  await expect(page.getByText("Todavía falta contexto.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir siguiente paso →" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Llevar este contexto a soporte técnico →" })).toBeVisible();
});

test("extremely dry substrate stays in review instead of recommending fertilizer", async ({ page }) => {
  await page.goto("/casa-jardin/diagnostico");
  await page.getByLabel("Tipo de planta").selectOption("green");
  await page.getByLabel("Etapa de la planta").selectOption("growing");
  await page.getByLabel("Condición de la planta").selectOption("extremely-dry");
  await expect(page.getByText("Primero recupera una humedad adecuada.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir siguiente paso →" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Llevar este contexto a soporte técnico →" })).toBeVisible();
});

test("Casa guide library publishes four reconstructed same-origin PDFs", async ({ page }) => {
  await page.goto("/casa-jardin/guias");

  for (const guide of ["Guía Wondergreen Casa & Jardín", "Guía Mi Huerta", "Guía rápida de etapas", "Guía de trasplante"]) {
    await expect(page.getByRole("heading", { name: guide, exact: true })).toBeVisible();
  }

  const downloads = page.getByRole("link", { name: "Descargar PDF →", exact: true });
  await expect(downloads).toHaveCount(4);
  const hrefs = await downloads.evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  expect(hrefs.sort()).toEqual([
    "/api/public-resources/home-garden-guide-casa-jardin",
    "/api/public-resources/home-garden-guide-etapas",
    "/api/public-resources/home-garden-guide-mi-huerta",
    "/api/public-resources/home-garden-guide-trasplante",
  ]);
  expect(hrefs.join(" ")).not.toMatch(/sharepoint|graph\.microsoft/i);
  await expect(page.getByText(/Master público reconstruido y verificado/i).first()).toBeVisible();
  await expect(page.getByText(/no se presenta como una copia byte a byte/i).first()).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
});
