import { test, expect } from "@playwright/test";

test("public library exposes live Wondergreen knowledge resources", async ({ page }) => {
  await page.goto("/biblioteca");

  await expect(page.getByRole("heading", { name: /La biblioteca no es un archivo/i })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Programas Wondergreen por cultivo" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Guía práctica de deficiencias nutricionales" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Abrir guía/i })).toHaveAttribute("href", "/biblioteca/guia-deficiencias");
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
  await page.getByRole("link", { name: /Ver programa Wondergreen para Cacao/i }).click();

  await expect(page).toHaveURL(/\/wondergreen\/cultivos\/cacao$/);
  await expect(page.getByText(/01 · Establecimiento/)).toBeVisible();
});