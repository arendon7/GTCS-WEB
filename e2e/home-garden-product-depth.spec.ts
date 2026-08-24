import { test, expect } from "@playwright/test";

test("Casa product detail reaches technical truth, documents and related kits before orientation", async ({ page }) => {
  await page.goto("/casa-jardin/productos/crece");

  await expect(page.getByRole("heading", { name: "CRECE", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver referencia técnica", exact: true })).toHaveAttribute(
    "href",
    "/wondergreen/productos/2grow-solido-15-3-3",
  );
  await expect(page.getByRole("heading", { name: "La referencia existe antes que la presentación doméstica." })).toBeVisible();
  await expect(page.getByText("2Grow Sólido", { exact: true })).toBeVisible();
  await expect(page.getByText("Formulación 15-3-3.", { exact: true })).toBeVisible();

  const documents = page.locator("#documentacion");
  await expect(documents.getByRole("heading", { name: "Producto, guía y Product Truth permanecen conectados, pero no se confunden." })).toBeVisible();
  await expect(documents.getByRole("heading", { name: "Guía Wondergreen Casa & Jardín", exact: true })).toBeVisible();
  await expect(documents.getByRole("heading", { name: "Guía rápida de etapas", exact: true })).toBeVisible();
  await expect(documents.getByRole("link", { name: "Abrir PDF ↗" }).first()).toHaveAttribute(
    "href",
    "/api/public-resources/home-garden-guide-casa-jardin",
  );
  await expect(documents.getByRole("link", { name: "Descargar ↓" }).first()).toHaveAttribute(
    "href",
    "/api/public-resources/home-garden-guide-casa-jardin?download=1",
  );

  const kits = page.locator("#kits-relacionados");
  await expect(kits.getByRole("heading", { name: "Kit Plantas Verdes", exact: true })).toBeVisible();
  await expect(kits.getByRole("heading", { name: "Kit Mi Huerta", exact: true })).toBeVisible();
  await expect(kits.getByRole("heading", { name: "Kit Casa Completa", exact: true })).toBeVisible();

  const orientation = page.getByRole("heading", { name: "¿No sabes si CRECE corresponde a tu planta?" });
  await expect(orientation).toBeVisible();
  await expect(page.getByRole("link", { name: "Usar orientador de etapa y condición", exact: true })).toHaveAttribute(
    "href",
    "/casa-jardin/diagnostico",
  );
});

test("Mi Huerta kit opens each product and its specific verified PDF", async ({ page }) => {
  await page.goto("/casa-jardin/kits/mi-huerta");

  await expect(page.getByRole("heading", { name: "Kit Mi Huerta", exact: true })).toBeVisible();
  const productRoute = page.locator("#ruta-kit");
  for (const href of [
    "/casa-jardin/productos/prepara",
    "/casa-jardin/productos/crece",
    "/casa-jardin/productos/florece",
    "/casa-jardin/productos/fructifica",
  ]) {
    await expect(productRoute.locator(`a[href="${href}"]`)).toHaveCount(1);
  }

  const documents = page.locator("#documentacion-kit");
  await expect(documents.getByRole("heading", { name: "Guía Mi Huerta", exact: true })).toBeVisible();
  const miHuertaCard = documents.getByRole("article").filter({
    has: documents.getByRole("heading", { name: "Guía Mi Huerta", exact: true }),
  });
  await expect(miHuertaCard.getByRole("link", { name: "Abrir PDF ↗" })).toHaveAttribute(
    "href",
    "/api/public-resources/home-garden-guide-mi-huerta",
  );
  await expect(miHuertaCard.getByRole("link", { name: "Descargar ↓" })).toHaveAttribute(
    "href",
    "/api/public-resources/home-garden-guide-mi-huerta?download=1",
  );

  await expect(page.getByRole("heading", { name: "¿No sabes si este kit encaja con tus plantas?" })).toBeVisible();
});
