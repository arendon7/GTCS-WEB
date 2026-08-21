import { test, expect } from "@playwright/test";

test("public library exposes live Wondergreen knowledge resources and public PDF masters", async ({ page }) => {
  await page.goto("/biblioteca");

  await expect(page.getByRole("heading", { name: /La biblioteca no es un archivo/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Programas Wondergreen por cultivo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guía Wondergreen para café" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guía Wondergreen para cacao" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guía Wondergreen para aguacate" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guía Wondergreen para limón Tahití" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guía Wondergreen para pastos y gramíneas" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guía práctica de deficiencias nutricionales" })).toBeVisible();

  const deficiencyCard = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Guía práctica de deficiencias nutricionales" }),
  });
  await expect(deficiencyCard.getByRole("link", { name: "Abrir guía →", exact: true })).toHaveAttribute("href", "/biblioteca/guia-deficiencias");

  const expectedDownloads = [
    ["Guía Wondergreen para café", "/descargas/guia-cafe", "Descargar PDF ↓"],
    ["Guía Wondergreen para cacao", "/descargas/guia-cacao", "Descargar PDF ↓"],
    ["Guía Wondergreen para aguacate", "/descargas/guia-aguacate", "Descargar PDF ↓"],
    ["Guía Wondergreen para limón Tahití", "/descargas/guia-citricos", "Descargar PDF ↓"],
    ["Guía Wondergreen para pastos y gramíneas", "/descargas/guia-pastos-praderas", "Descargar PDF ↓"],
    ["Catálogo técnico-comercial Wondergreen", "/descargas/catalogo-wondergreen", "Descargar catálogo PDF ↓"],
  ] as const;

  for (const [heading, href, label] of expectedDownloads) {
    const card = page.getByRole("article").filter({ has: page.getByRole("heading", { name: heading, exact: true }) });
    await expect(card.getByText("Lectura web + PDF disponible", { exact: true })).toBeVisible();
    await expect(card.getByRole("link", { name: label, exact: true })).toHaveAttribute("href", href);
  }

  await expect(page.getByText("Lectura web disponible · PDF pendiente de binario público", { exact: true }).first()).toBeVisible();
  const hrefs = await page.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href") || ""));
  expect(hrefs.some((href) => /sharepoint\.com|graph\.microsoft\.com/i.test(href))).toBe(false);
});

test("public library routes by user intent before product selection", async ({ page }) => {
  await page.goto("/biblioteca");

  await expect(page.getByRole("heading", { name: "No necesitas conocer el nombre del recurso." })).toBeVisible();
  await expect(page.getByRole("link", { name: /Elegir cultivo/ })).toHaveAttribute("href", "/wondergreen/cultivos");
  await expect(page.getByRole("link", { name: /Revisar síntomas/ })).toHaveAttribute("href", "/biblioteca/guia-deficiencias");
  await expect(page.getByRole("link", { name: /Comprobar criterios/ })).toHaveAttribute("href", "/biblioteca/criterios-nutricionales");
  await expect(page.getByRole("link", { name: /Abrir manual de uso/ })).toHaveAttribute("href", "/biblioteca/manual-uso-wondergreen");
  await expect(page.getByRole("link", { name: /Ver Product Master/ })).toHaveAttribute("href", "/wondergreen/productos");
  await expect(page.getByRole("link", { name: /Pedir acompañamiento/ })).toHaveAttribute("href", "/contacto#wondergreen");
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
