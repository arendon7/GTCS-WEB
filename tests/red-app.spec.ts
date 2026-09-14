import { expect, test } from "@playwright/test";

test.describe("GREENATICS Red application shell", () => {
  test("exposes the complete territorial workflow and navigates between modules", async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));

    const response = await page.goto("/red/app/", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Resumen de proyecto" })).toBeVisible();
    await expect(page.getByText("RED-024 · Támesis")).toBeVisible();

    for (const module of ["Territorio", "Generadores", "Rutas", "FIELD", "QA/QC", "Hallazgos", "PMIRS STUDIO", "PMIRS VIVO", "Indicadores", "Evidencias", "Coordinación"]) {
      await expect(page.getByRole("button", { name: new RegExp(module) })).toBeVisible();
    }

    await page.getByRole("button", { name: /Territorio/ }).click();
    await expect(page.getByRole("heading", { name: /Una línea base que explica/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Infraestructura" })).toBeVisible();
    await page.getByRole("button", { name: /Rutas/ }).click();
    await expect(page.getByRole("heading", { name: "Plaza y restaurantes" })).toBeVisible();
    await page.getByRole("button", { name: /FIELD/ }).click();
    await expect(page.getByRole("heading", { name: "Medición" })).toBeVisible();
    await page.getByRole("button", { name: /Generadores/ }).click();
    await expect(page.getByRole("heading", { name: "Generadores y unidades de gestión" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Restaurante" })).toBeVisible();
    await page.getByRole("button", { name: /PMIRS STUDIO/ }).click();
    await expect(page.getByRole("heading", { name: /Convertir hallazgos/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Reducir impropios en la fuente" })).toBeVisible();
    await page.getByRole("button", { name: /Hallazgos/ }).click();
    await expect(page.getByRole("heading", { name: /Un hallazgo no es una opinión/ })).toBeVisible();
    await page.getByRole("button", { name: /PMIRS VIVO/ }).click();
    await expect(page.getByRole("heading", { name: /El plan deja de ser documento/ })).toBeVisible();
    await page.getByRole("button", { name: "+ Registrar avance" }).click();
    await expect(page.getByText(/A-014: avance local registrado en 68 %/)).toBeVisible();
    await page.getByRole("button", { name: /QA\/QC/ }).click();
    await page.getByRole("button", { name: "Aprobar", exact: true }).click();
    await expect(page.getByText(/QA-108: aprobada en esta sesión/)).toBeVisible();
    await page.getByRole("button", { name: /Evidencias/ }).click();
    await expect(page.getByRole("heading", { name: /La evidencia no es un archivo/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Fotografía de punto de almacenamiento" })).toBeVisible();
    await page.getByRole("button", { name: /Coordinación/ }).click();
    await expect(page.getByRole("heading", { name: "Confirmar horario de visita" })).toBeVisible();

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });

  test("does not overflow on a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/red/app/", { waitUntil: "networkidle" });
    const geometry = await page.evaluate(() => ({ viewport: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    expect(geometry.scrollWidth, "Red must not overflow horizontally on mobile").toBeLessThanOrEqual(geometry.viewport + 2);
  });
});
