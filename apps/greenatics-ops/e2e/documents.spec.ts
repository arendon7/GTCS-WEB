import { expect, test } from "@playwright/test";

test("document center is reachable in local OPS without fabricating SharePoint data", async ({ page }) => {
  await page.goto("/documents");

  await expect(page.getByRole("heading", { name: "Centro documental", level: 1 })).toBeVisible();
  await expect(page.getByText("Integración pendiente de activación.")).toBeVisible();
  await expect(page.getByText(/No se muestran documentos ficticios/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Documentos" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Abrir en SharePoint" })).toHaveCount(0);
});

test("invalid relative document routes fail closed before Graph is consulted", async ({ page }) => {
  await page.goto("/documents?folder=..%2FFinance");

  await expect(page.getByRole("heading", { name: "Ruta documental no válida", level: 1 })).toBeVisible();
  await expect(page.getByText(/SharePoint no fue consultado/)).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver a la raíz documental" })).toHaveAttribute("href", "/documents");
  await expect(page.getByRole("link", { name: "Abrir en SharePoint" })).toHaveCount(0);
});

test("public robots policy keeps the document center out of indexing", async ({ request }) => {
  const response = await request.get("/robots.txt");
  expect(response.ok()).toBeTruthy();
  const body = await response.text();
  expect(body).toContain("Disallow: /documents");
});
