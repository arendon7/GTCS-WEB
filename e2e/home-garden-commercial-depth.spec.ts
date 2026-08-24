import { test, expect } from "@playwright/test";

const productStages = [
  ["COMPOST", "prepara"],
  ["CRECE", "crece"],
  ["EQUILIBRA", "equilibra"],
  ["FLORECE", "florece"],
  ["FRUCTIFICA", "fructifica"],
] as const;

const visibleKits = [
  ["Kit Plantas Verdes", "plantas-verdes"],
  ["Kit Plantas con Flor", "plantas-con-flor"],
  ["Kit Mi Huerta", "mi-huerta"],
  ["Kit Casa Completa", "casa-completa"],
  ["Casa Completa XL", "casa-completa-xl"],
] as const;

test("Casa Jardin product catalog exposes governed stages and approved visuals before orientation", async ({ page }) => {
  await page.goto("/casa-jardin/productos");

  await expect(page.getByRole("heading", { name: "Primero la etapa. Después la referencia." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Producto visible antes que orientador." })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();

  for (const [name, slug] of productStages) {
    const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name, exact: true }) });
    await expect(card).toHaveCount(1);
    await expect(card.getByLabel(`Visual ${name}`, { exact: true })).toBeVisible();
    await expect(card.getByRole("link", { name: /Ver producto y formatos propuestos/ })).toHaveAttribute("href", `/casa-jardin/productos/${slug}`);
  }

  await expect(page.getByText("Arte de línea aprobado · no packshot específico", { exact: true })).toHaveCount(4);
  await expect(page.getByText("Base del sistema · representación editorial", { exact: true })).toHaveCount(1);
  await expect(page.getByRole("link", { name: "Usar orientador de etapa y condición", exact: true })).toHaveAttribute("href", "/casa-jardin/diagnostico");
  await expect(page.getByRole("link", { name: /Comprar|Añadir al carrito|Checkout/i })).toHaveCount(0);
});

test("Casa Jardin product detail puts technical product truth and approved line art before diagnostic orientation", async ({ page }) => {
  await page.goto("/casa-jardin/productos/crece");

  await expect(page.getByRole("heading", { name: "CRECE", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "← Volver a productos", exact: true })).toHaveAttribute("href", "/casa-jardin/productos");
  await expect(page.getByRole("link", { name: "Ver Product Truth técnico", exact: true })).toHaveAttribute("href", "/wondergreen/productos/2grow-solido-15-3-3");
  await expect(page.getByRole("link", { name: "Ver kits por uso", exact: true })).toHaveAttribute("href", "/casa-jardin/kits");
  await expect(page.getByRole("link", { name: "No sé si corresponde a mi planta", exact: true })).toHaveAttribute("href", "/casa-jardin/diagnostico");

  const visual = page.getByLabel("Visual CRECE", { exact: true });
  await expect(visual).toBeVisible();
  await expect(visual.getByRole("img", { name: "Arte aprobado de la línea Wondergreen 2Grow para la etapa CRECE", exact: true })).toHaveAttribute("src", "/api/public-media/wondergreen-2grow");
  await expect(page.getByText(/no representa un packshot específico/i)).toBeVisible();
  await expect(page.getByText(/Sin precio público, cobertura ni dosis/i).first()).toBeVisible();
});

test("Casa Jardin kit catalog exposes visual prelaunch compositions and keeps blocked kit out", async ({ page }) => {
  await page.goto("/casa-jardin/kits");

  await expect(page.getByRole("heading", { name: "Kits por uso. Etapas separadas." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Elige por contexto. Después revisa cada etapa." })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);

  for (const [name, slug] of visibleKits) {
    const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name, exact: true }) });
    await expect(card).toHaveCount(1);
    await expect(card.getByLabel(`Composición visual ${name}`, { exact: true })).toBeVisible();
    await expect(card.getByRole("link", { name: /Ver composición y ruta/ })).toHaveAttribute("href", `/casa-jardin/kits/${slug}`);
    await expect(card.getByText("Pre-lanzamiento · compra deshabilitada", { exact: true })).toBeVisible();
  }

  await expect(page.getByRole("heading", { name: "Kit Trasplanta & Arranca", exact: true })).toHaveCount(0);
  await expect(page.getByText(/Trasplanta & Arranca sigue fuera del catálogo visible/i)).toBeVisible();
});

test("Casa Jardin kit detail leads with governed visual composition and product route, not diagnosis", async ({ page }) => {
  await page.goto("/casa-jardin/kits/mi-huerta");

  await expect(page.getByRole("heading", { name: "Kit Mi Huerta", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "← Volver a kits", exact: true })).toHaveAttribute("href", "/casa-jardin/kits");
  await expect(page.getByRole("link", { name: "Ver productos del kit", exact: true })).toHaveAttribute("href", "#ruta-kit");
  await expect(page.getByRole("link", { name: "Explorar productos por etapa", exact: true })).toHaveAttribute("href", "/casa-jardin/productos");
  await expect(page.getByRole("link", { name: "No sé si este kit encaja", exact: true })).toHaveAttribute("href", "/casa-jardin/diagnostico");

  const visualRail = page.getByLabel("Etapas incluidas en Kit Mi Huerta", { exact: true });
  await expect(visualRail).toBeVisible();
  for (const stage of ["COMPOST", "CRECE", "FLORECE", "FRUCTIFICA"]) {
    await expect(visualRail.getByLabel(`Visual ${stage}`, { exact: true })).toBeVisible();
  }
  await expect(page.getByText(/No son packshots finales del kit/i)).toBeVisible();

  const productLinks = page.getByRole("link", { name: "Ver producto →", exact: true });
  await expect(productLinks).toHaveCount(4);
  await expect(productLinks.nth(0)).toHaveAttribute("href", "/casa-jardin/productos/prepara");
  await expect(productLinks.nth(1)).toHaveAttribute("href", "/casa-jardin/productos/crece");
  await expect(productLinks.nth(2)).toHaveAttribute("href", "/casa-jardin/productos/florece");
  await expect(productLinks.nth(3)).toHaveAttribute("href", "/casa-jardin/productos/fructifica");
});
