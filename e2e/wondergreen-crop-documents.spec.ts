import { test, expect } from "@playwright/test";

const publishedGuides = [
  ["cafe", "Guía Wondergreen para café", "wondergreen-guide-cafe"],
  ["cacao", "Guía Wondergreen para cacao", "wondergreen-guide-cacao"],
  ["aguacate", "Guía Wondergreen para aguacate", "wondergreen-guide-aguacate"],
  ["limon-tahiti", "Guía Wondergreen para limón Tahití", "wondergreen-guide-limon-tahiti"],
  ["pastos-gramineas", "Guía Wondergreen para pastos y gramíneas", "wondergreen-guide-pastos"],
] as const;

for (const [slug, title, resourceId] of publishedGuides) {
  test(`${slug} keeps the published PDF master visually primary and separately downloadable`, async ({ page }) => {
    await page.goto(`/wondergreen/cultivos/${slug}`);

    const document = page.getByRole("complementary", { name: new RegExp(`Documento oficial para`, "i") });
    await expect(document.getByRole("heading", { name: title, exact: true })).toBeVisible();
    await expect(document.getByRole("img", { name: `Portada de ${title}` })).toBeVisible();
    await expect(document.getByText(/Documento completo publicado/i)).toBeVisible();
    await expect(document.getByText(/20 páginas/i)).toBeVisible();
    await expect(document.getByText(/PDF público same-origin/i)).toBeVisible();

    await expect(document.getByRole("link", { name: "Abrir PDF original ↗" })).toHaveAttribute(
      "href",
      `/api/public-resources/${resourceId}`,
    );
    await expect(document.getByRole("link", { name: "Descargar PDF ↓" })).toHaveAttribute(
      "href",
      `/api/public-resources/${resourceId}?download=1`,
    );

    const nav = page.getByRole("navigation", { name: new RegExp(`Contenido del programa`, "i") });
    await expect(nav.getByRole("link", { name: "Etapas" })).toHaveAttribute("href", "#etapas");
    await expect(nav.getByRole("link", { name: "Comprobaciones" })).toHaveAttribute("href", "#comprobaciones");
    await expect(nav.getByRole("link", { name: "Seguimiento" })).toHaveAttribute("href", "#seguimiento");
    await expect(nav.getByRole("link", { name: "Productos relacionados" })).toHaveAttribute("href", "#referencias");
  });
}

test("crop guide web context explicitly preserves PDF and Product Master as different authorities", async ({ page }) => {
  await page.goto("/wondergreen/cultivos/cafe");

  await expect(page.getByRole("heading", { name: /La web no reemplaza la guía/i })).toBeVisible();
  await expect(page.getByText(/la fuente publicada es la guía PDF asociada a este cultivo/i)).toBeVisible();
  await expect(page.getByText(/El PDF y el Product Master siguen siendo fuentes distintas/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Referencias que aparecen en este programa." })).toBeVisible();
});
