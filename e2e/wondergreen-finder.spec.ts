import { test, expect } from "@playwright/test";

test("crop library exposes the governed Wondergreen Finder", async ({ page }) => {
  await page.goto("/wondergreen/cultivos");
  await expect(page.getByRole("link", { name: "Usar Finder Wondergreen" }).first()).toHaveAttribute("href", "/wondergreen/finder");
});

test("Wondergreen Finder is limited to the five published crop programs", async ({ page }) => {
  await page.goto("/wondergreen/finder");

  const cropSelect = page.getByLabel("Cultivo Wondergreen", { exact: true });
  await expect(page.getByRole("heading", { name: "Empieza por el cultivo y la etapa." })).toBeVisible();
  for (const crop of ["Café", "Cacao", "Aguacate", "Limón Tahití", "Pastos y gramíneas"]) {
    await expect(cropSelect.getByRole("option", { name: crop, exact: true })).toBeAttached();
  }
  await expect(cropSelect.locator("option")).toHaveCount(6);
  await expect(page.getByText(/V1 trabaja únicamente con Café, Cacao, Aguacate, Limón Tahití y Pastos\/Gramíneas/i)).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/i);
});

test("Finder persists a governed cacao stage without turning it into an automatic prescription", async ({ page }) => {
  await page.goto("/wondergreen/finder");

  await page.getByLabel("Cultivo Wondergreen", { exact: true }).selectOption("cacao");
  await page.getByLabel("Etapa del cultivo Wondergreen", { exact: true }).selectOption({ label: "Prefloración y floración" });
  await page.getByLabel("Análisis disponible Wondergreen", { exact: true }).selectOption("none");

  const result = page.getByLabel("Resultado orientativo del Finder Wondergreen");
  await expect(result.getByRole("heading", { name: "Esta es la ruta que ya aparece en el programa publicado." })).toBeVisible();
  await expect(result.getByLabel("Familias presentes en el programa publicado").getByText("2Bloom", { exact: true })).toBeVisible();
  await expect(result.getByText(/No calcula dosis, frecuencia, mezcla, compatibilidad, eficacia, cobertura ni disponibilidad comercial/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /comprar/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /comprar/i })).toHaveCount(0);

  const params = await page.evaluate(() => Object.fromEntries(new URL(window.location.href).searchParams.entries()));
  expect(params).toMatchObject({ crop: "cacao", moment: "Prefloración y floración", analysis: "none" });
});

test("Finder restores a shared state and carries only contextual guidance into Contact", async ({ page }) => {
  const url = "/wondergreen/finder?crop=cacao&moment=Prefloraci%C3%B3n+y+floraci%C3%B3n&analysis=available";
  await page.goto(url);

  await expect(page.getByLabel("Cultivo Wondergreen", { exact: true })).toHaveValue("cacao");
  await expect(page.getByLabel("Etapa del cultivo Wondergreen", { exact: true })).toHaveValue("Prefloración y floración");
  await expect(page.getByLabel("Análisis disponible Wondergreen", { exact: true })).toHaveValue("available");
  const result = page.getByLabel("Resultado orientativo del Finder Wondergreen");
  await expect(result.getByLabel("Familias presentes en el programa publicado").getByText("2Bloom", { exact: true })).toBeVisible();

  const support = result.getByRole("link", { name: "Llevar este contexto a soporte técnico" });
  const href = await support.getAttribute("href");
  expect(href).toBeTruthy();
  const target = new URL(href!, "https://greenatics.com.co");
  expect(target.searchParams.get("audience")).toBe("wondergreen");
  expect(target.searchParams.get("need")).toBe("nutricion");
  expect(target.searchParams.get("cultivo")).toBe("Cacao");
  expect(target.searchParams.get("source")).toBe("wondergreen-finder");
  expect(target.searchParams.get("contexto")).toContain("Familias del programa publicado: 2Bloom");
  expect(target.searchParams.get("contexto")).not.toContain("dosis");

  await support.click();
  await expect(page.getByLabel("¿Desde qué contexto nos escribes?", { exact: true })).toHaveValue("wondergreen");
  await expect(page.getByLabel("¿Qué necesitas resolver primero?", { exact: true })).toHaveValue("nutricion");
  await page.getByRole("button", { name: "Preparar contexto" }).click();
  await expect(page.getByLabel("Resumen preparado para la conversación")).toContainText("Cultivo: Cacao");
  await expect(page.getByLabel("Resumen preparado para la conversación")).toContainText("Wondergreen Finder");
  await expect(page.getByLabel("Resumen preparado para la conversación")).toContainText("Familias del programa publicado: 2Bloom");
  await expect(page.getByText(/Nada se ha enviado todavía/i)).toBeVisible();
});

test("unknown stage stops the Finder before exposing a program family", async ({ page }) => {
  await page.goto("/wondergreen/finder?crop=cacao&moment=unknown");

  await expect(page.getByLabel("Cultivo Wondergreen", { exact: true })).toHaveValue("cacao");
  await expect(page.getByLabel("Etapa del cultivo Wondergreen", { exact: true })).toHaveValue("unknown");
  const result = page.getByLabel("Resultado orientativo del Finder Wondergreen");
  await expect(result.getByRole("heading", { name: "Todavía no cierres una referencia." })).toBeVisible();
  await expect(result.getByLabel("Familias presentes en el programa publicado")).toHaveCount(0);
  await expect(result.getByRole("link", { name: "Llevar contexto al equipo técnico" })).toBeVisible();
});

test("invalid Finder URL values fail closed instead of fabricating crop or evidence", async ({ page }) => {
  await page.goto("/wondergreen/finder?crop=banano&moment=produccion&analysis=magic");

  await expect(page.getByLabel("Cultivo Wondergreen", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Etapa del cultivo Wondergreen", { exact: true })).toBeDisabled();
  await expect(page.getByLabel("Análisis disponible Wondergreen", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Resultado orientativo del Finder Wondergreen").getByRole("heading", { name: "Empieza por un cultivo publicado." })).toBeVisible();
});
