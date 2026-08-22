import { test, expect } from "@playwright/test";

const approvedDownloadIds = [
  "wondergreen-product-master",
  "wondergreen-guide-cafe",
  "wondergreen-guide-cacao",
  "wondergreen-guide-aguacate",
  "wondergreen-guide-limon-tahiti",
  "wondergreen-guide-pastos",
];

test("public resources hub exposes library, projects and impact as distinct layers", async ({ page }) => {
  await page.goto("/recursos");

  await expect(page.getByRole("heading", { name: "Conocimiento, experiencia e impacto para decidir mejor." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Biblioteca técnica", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Proyectos / casos", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Impacto", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir biblioteca →", exact: true })).toHaveAttribute("href", "/biblioteca");
  await expect(page.getByRole("link", { name: "Ver proyectos →", exact: true })).toHaveAttribute("href", "/proyectos");
  await expect(page.getByRole("link", { name: "Ver impacto →", exact: true })).toHaveAttribute("href", "/impacto");
  await expect(page.getByRole("link", { name: "Explorar soluciones", exact: true })).toHaveAttribute("href", "/soluciones");
});

test("public library is a technical surface instead of duplicating the Resources hub", async ({ page }) => {
  await page.goto("/biblioteca");

  await expect(page.getByRole("heading", { name: "Conocimiento técnico para llevar mejores decisiones a la práctica." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver todos los recursos Greenatics", exact: true })).toHaveAttribute("href", "/recursos");
  await expect(page.getByRole("heading", { name: "Proyectos / casos", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Impacto", exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Entender → comprobar → aplicar → medir." })).toBeVisible();
});

test("public library exposes Wondergreen guides with same-origin PDF downloads", async ({ page }) => {
  await page.goto("/biblioteca");

  await expect(page.getByRole("heading", { name: /Guías que puedes leer, usar y descargar/i })).toBeVisible();
  for (const title of [
    "Guía Wondergreen para café",
    "Guía Wondergreen para cacao",
    "Guía Wondergreen para aguacate",
    "Guía Wondergreen para limón Tahití",
    "Guía Wondergreen para pastos y gramíneas",
    "Catálogo técnico-comercial Wondergreen",
  ]) {
    await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
  }

  const hrefs = await page.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  expect(hrefs.join(" ")).not.toMatch(/sharepoint|graph\.microsoft/i);
  for (const resourceId of approvedDownloadIds) {
    expect(hrefs).toContain(`/api/public-resources/${resourceId}`);
  }

  const catalogCard = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Catálogo técnico-comercial Wondergreen", exact: true }) });
  await expect(catalogCard.getByText("Lectura web + PDF disponible", { exact: true })).toBeVisible();
  await expect(catalogCard.getByRole("link", { name: /Descargar catálogo PDF/i })).toHaveAttribute("href", "/api/public-resources/wondergreen-product-master");
  await expect(catalogCard.getByRole("img", { name: /Portada de Catálogo técnico-comercial Wondergreen/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Más que NPK", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bioinsumos Wondergreen", exact: true })).toBeVisible();
});

test("public library routes by user intent before product selection", async ({ page }) => {
  await page.goto("/biblioteca");

  await expect(page.getByRole("heading", { name: "No necesitas conocer el nombre del recurso." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Elegir cultivo/ })).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(page.getByRole("link", { name: /Revisar síntomas/ })).toHaveAttribute("href", "/biblioteca/guia-deficiencias");
  await expect(page.getByRole("link", { name: /Comprobar criterios/ })).toHaveAttribute("href", "/biblioteca/criterios-nutricionales");
  await expect(page.getByRole("link", { name: /Abrir manual de uso/ })).toHaveAttribute("href", "/biblioteca/manual-uso-wondergreen");
  await expect(page.getByRole("link", { name: /Ver Product Master/ })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(page.getByRole("link", { name: /Ir a descargas/ })).toHaveAttribute("href", "#biblioteca");
});

test("deficiency guide prevents symptom-only diagnosis and links to crop programs", async ({ page }) => {
  await page.goto("/biblioteca/guia-deficiencias");
  await expect(page.getByRole("heading", { name: "Una hoja amarilla no es un diagnóstico." })).toBeVisible();
  await expect(page.getByText("Cuatro preguntas antes del producto", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Cacao", exact: true })).toBeVisible();
  await expect(page.getByText("Hojas viejas", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver programa Wondergreen para Cacao/i })).toHaveAttribute("href", "/wondergreen/cultivos/cacao");
});

test("deficiency guide can continue into the cacao Wondergreen program", async ({ page }) => {
  await page.goto("/biblioteca/guia-deficiencias");
  const cacaoBlock = page.locator("#cacao");
  const cacaoLink = cacaoBlock.getByRole("link", { name: /Ver programa Wondergreen para Cacao/i });
  await cacaoLink.evaluate((element) => element.scrollIntoView({ block: "center", inline: "nearest" }));
  await expect(cacaoLink).toBeInViewport();
  await expect(cacaoLink).toBeVisible();
  await cacaoLink.click();
  await expect(page).toHaveURL(/\/wondergreen\/cultivos\/cacao$/);
  await expect(page.getByText(/01 · Establecimiento/)).toBeVisible();
});
