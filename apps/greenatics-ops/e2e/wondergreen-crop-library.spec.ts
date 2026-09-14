import { test, expect } from "@playwright/test";

const cropGuides = [
  ["Café", "cafe", "Guía Wondergreen para café", "wondergreen-guide-cafe"],
  ["Cacao", "cacao", "Guía Wondergreen para cacao", "wondergreen-guide-cacao"],
  ["Aguacate", "aguacate", "Guía Wondergreen para aguacate", "wondergreen-guide-aguacate"],
  ["Limón Tahití", "limon-tahiti", "Guía Wondergreen para limón Tahití", "wondergreen-guide-limon-tahiti"],
  ["Pastos y gramíneas", "pastos-gramineas", "Guía Wondergreen para pastos y gramíneas", "wondergreen-guide-pastos"],
] as const;

test("crop index makes every published guide directly visible without replacing the program route", async ({ page }) => {
  await page.goto("/wondergreen/cultivos");

  await expect(page.getByRole("heading", { name: "El cultivo cambia la pregunta." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cinco programas. Cinco guías completas." })).toBeVisible();
  const summary = page.getByLabel("Resumen de la biblioteca por cultivo");
  await expect(summary.getByText("5", { exact: true })).toHaveCount(2);
  await expect(summary.getByText("3", { exact: true })).toHaveCount(1);

  for (const [crop, slug, guideTitle, resourceId] of cropGuides) {
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: crop, exact: true }),
    }).filter({
      has: page.getByRole("img", { name: `Portada de ${guideTitle}` }),
    });

    await expect(card).toHaveCount(1);
    await expect(card.getByText("Guía PDF publicada", { exact: true })).toBeVisible();
    await expect(card.getByText(/20 páginas/i)).toBeVisible();
    await expect(card.getByRole("link", { name: "Abrir programa →" })).toHaveAttribute("href", `/wondergreen/cultivos/${slug}`);
    await expect(card.getByRole("link", { name: "Abrir PDF ↗" })).toHaveAttribute("href", `/api/public-resources/${resourceId}`);
    await expect(card.getByRole("link", { name: "Descargar ↓" })).toHaveAttribute("href", `/api/public-resources/${resourceId}?download=1`);
  }
});

test("crop library keeps guide, web program and Product Master responsibilities separate", async ({ page }) => {
  await page.goto("/wondergreen/cultivos");

  await expect(page.getByRole("heading", { name: "Tres capas, tres responsabilidades distintas." })).toBeVisible();
  await expect(page.getByText("Guía PDF", { exact: true })).toBeVisible();
  await expect(page.getByText("Programa web", { exact: true })).toBeVisible();
  await expect(page.getByText("Product Master", { exact: true })).toBeVisible();
  await expect(page.getByText(/no los fusiona en una sola fuente/i)).toBeVisible();
  await expect(page.getByText(/evita que una guía general se interprete como dosis cerrada/i)).toBeVisible();

  await expect(page.getByRole("link", { name: "Usar Finder Wondergreen" }).first()).toHaveAttribute("href", "/wondergreen/finder");
  await expect(page.getByRole("link", { name: "Ver Product Master", exact: true })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(page.getByRole("link", { name: "Abrir Biblioteca técnica" })).toHaveAttribute("href", "/biblioteca");
});
