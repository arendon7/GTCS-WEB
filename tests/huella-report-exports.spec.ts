import { readFile } from "node:fs/promises";
import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL;
const demoPassword = "Demo2026!";

test.skip(!baseUrl, "Set PLAYWRIGHT_BASE_URL to an isolated local demo runtime.");

async function signIn(page: Page, email: string, expectedPath: RegExp) {
  const target = new URL(baseUrl!);
  expect(["127.0.0.1", "localhost", "::1"]).toContain(target.hostname);
  await page.goto(new URL("/login", target).toString());
  await page.locator("#login-email").fill(email);
  await page.locator("#login-password").fill(demoPassword);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(expectedPath);
}

async function verifyDownload(link: Locator, extension: string, signature: string) {
  const [download] = await Promise.all([pageDownload(link), link.click()]);
  expect(download.suggestedFilename().toLowerCase()).toMatch(new RegExp(`\\.${extension}$`));
  const path = await download.path();
  expect(path).not.toBeNull();
  const content = await readFile(path!);
  expect(content.subarray(0, signature.length).toString("binary")).toBe(signature);
  expect(content.length).toBeGreaterThan(100);
}

function pageDownload(link: Locator) {
  return link.page().waitForEvent("download");
}

test("Consultoría genera y descarga PDF ejecutivo, PDF técnico y memoria XLSX", async ({ page }) => {
  await signIn(page, "consultor@calculatuhuella.local", /\/dashboard$/);
  await page.goto(new URL("/reportes", baseUrl!).toString());
  await expect(page.locator("main h1")).toHaveText("Informes para revisar y explicar el inventario");
  await expect(page.getByRole("heading", { name: "Crear entregable" })).toBeVisible();
  await expect(page.getByText("Entorno demostrativo · datos de ejemplo", { exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  const deliverables = [
    { title: "Informe ejecutivo", extension: "pdf", signature: "%PDF" },
    { title: "Informe técnico", extension: "pdf", signature: "%PDF" },
    { title: "Memoria de cálculo", extension: "xlsx", signature: "PK\u0003\u0004" },
  ];

  for (const item of deliverables) {
    const card = page.locator(".deliverable-card").filter({ has: page.getByRole("heading", { name: item.title }) });
    await expect(card).toBeVisible();
    await card.getByRole("button", { name: `Generar ${item.title}` }).click();
    await expect(page.getByRole("status")).toContainText(`${item.title} generado correctamente.`);
    await expect(page.locator(".report-history")).toContainText(item.title);
    const artifactRow = page.locator(".report-history tbody tr").filter({ hasText: item.title }).last();
    const downloadLink = artifactRow.locator('a[aria-label^="Descargar"]');
    await verifyDownload(downloadLink, item.extension, item.signature);
  }
});

test("Verificación descarga el paquete ZIP y no obtiene permisos de aprobación de informes", async ({ page }) => {
  await signIn(page, "verificador@calculatuhuella.local", /\/verificacion$/);
  const target = new URL(baseUrl!);
  await page.goto(new URL("/verificacion", target).toString());
  const packageCard = page.locator("section.card").filter({
    has: page.getByRole("heading", { name: "Exportación reproducible" }),
  });
  await expect(packageCard.getByRole("button", { name: "Generar paquete" })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

  await packageCard.getByRole("button", { name: "Generar paquete" }).click();
  await expect(page).toHaveURL(/\/verificacion$/);
  const packageLink = packageCard.locator('a.download-row[href^="/reportes/"]').last();
  await expect(packageLink).toBeVisible();
  await verifyDownload(packageLink, "zip", "PK\u0003\u0004");

  await page.goto(new URL("/reportes", target).toString());
  await expect(page.locator(".deliverable-grid button")).toHaveCount(0);
  await expect(page.locator('.report-history button[aria-label^="Aprobar"]')).toHaveCount(0);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
