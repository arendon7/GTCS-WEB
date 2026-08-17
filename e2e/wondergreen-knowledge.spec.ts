import { test, expect } from "@playwright/test";

test("public library exposes live Wondergreen knowledge resources", async ({ page }) => {
  await page.goto("/biblioteca");

  await expect(page.getByRole("heading", { name: /La biblioteca no es un archivo/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Programas Wondergreen por cultivo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guía práctica de deficiencias nutricionales" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Abrir guía/i })).toHaveAttribute("href", "/biblioteca/guia-deficiencias");
  await expect(page.getByText("Lectura web disponible · descarga pública en preparación", { exact: true })).toBeVisible();
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
