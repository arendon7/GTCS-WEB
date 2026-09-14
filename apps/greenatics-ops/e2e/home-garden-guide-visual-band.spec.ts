import { test, expect } from "@playwright/test";

const guides = [
  {
    title: "Guía Wondergreen Casa & Jardín",
    cover: "/api/public-media/home-garden-casa-jardin-cover",
    download: "/api/public-resources/home-garden-guide-casa-jardin",
  },
  {
    title: "Guía Mi Huerta",
    cover: "/api/public-media/home-garden-mi-huerta-cover",
    download: "/api/public-resources/home-garden-guide-mi-huerta",
  },
  {
    title: "Guía rápida de etapas",
    cover: "/api/public-media/home-garden-etapas-cover",
    download: "/api/public-resources/home-garden-guide-etapas",
  },
  {
    title: "Guía de trasplante",
    cover: "/api/public-media/home-garden-trasplante-cover",
    download: "/api/public-resources/home-garden-guide-trasplante",
  },
] as const;

test("Casa Jardin exposes the four published guides with real covers and PDFs", async ({ page }) => {
  await page.goto("/casa-jardin");

  const library = page.getByRole("region", { name: "Cuatro guías. Dos formas de usarlas.", exact: true });
  await expect(library).toBeVisible();

  for (const guide of guides) {
    await expect(library.getByRole("img", { name: `Portada publicada de ${guide.title}`, exact: true })).toHaveAttribute("src", guide.cover);
    await expect(library.getByRole("link", { name: `Abrir PDF ${guide.title}`, exact: true })).toHaveAttribute("href", guide.download);
  }

  const downloadHrefs = await library.getByRole("link", { name: "Descargar PDF ↓", exact: true }).evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  expect(downloadHrefs.sort()).toEqual(guides.map((guide) => guide.download).sort());
  await expect(library.getByText(/Masters públicos reconstruidos y gobernados/i)).toBeVisible();
});

test("guide visual library stays on the Casa Jardin landing only", async ({ page }) => {
  await page.goto("/casa-jardin/guias");
  await expect(page.getByRole("heading", { name: "Cuatro guías. Dos formas de usarlas.", exact: true })).toHaveCount(0);
});
