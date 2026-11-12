import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("mixture consultation starts empty and never certifies a selection", async ({ page }) => {
  await page.goto("/wondergreen/compatibilidad/");
  for (const checkbox of await page.getByRole("checkbox").all()) await expect(checkbox).not.toBeChecked();
  await expect(page.locator("#mixture-products")).toHaveValue("");
  await expect(page.getByRole("status")).toContainText("Selecciona una familia");
  for (const checkbox of await page.locator(".wg-mixture__families input").all()) await checkbox.check();
  await expect(page.getByRole("status")).toHaveText("4 familias incluidas en la consulta. Compatibilidad no evaluada.");
  await expect(page.getByText(/Sin alerta preliminar|Rango pH:|5\.8 - 6\.5|70% del agua/)).toHaveCount(0);
  for (const checkbox of await page.locator(".wg-mixture__families input").all()) await checkbox.uncheck();
  await expect(page.getByRole("status")).toContainText("Selecciona una familia");
});

test("checkboxes work by keyboard without label double toggles", async ({ page }) => {
  await page.goto("/wondergreen/compatibilidad/");
  const input = page.getByRole("checkbox", { name: "Bioinsumos", exact: true });
  await input.focus();
  await page.keyboard.press("Space");
  await expect(input).toBeChecked();
  await page.keyboard.press("Space");
  await expect(input).not.toBeChecked();
  await page.getByText("Bioinsumos", { exact: true }).click();
  await expect(input).toBeChecked();
});

test("mixture details reach contact privately, without a compatibility verdict", async ({ page }, testInfo) => {
  await page.goto("/wondergreen/compatibilidad/");
  await page.getByRole("checkbox", { name: "Fertilizantes líquidos y Biol", exact: true }).check();
  await page.getByRole("checkbox", { name: "Etiquetas vigentes de los productos", exact: true }).check();
  await page.getByLabel("Nombres comerciales y formulaciones").fill("Producto A y producto B; formulaciones por confirmar");
  await page.getByLabel("Vía de aplicación que quieres consultar").selectOption({ label: "Fertirriego" });
  await page.getByLabel("Cultivo y condiciones de la consulta").fill("Cultivo piloto; dosis pendientes de revisión");
  await page.locator("h1").click();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.screenshot({ path: testInfo.outputPath("mixture-review.png"), fullPage: true });
  await page.getByRole("link", { name: "Preparar consulta con Greenatics", exact: true }).click();
  await expect(page).toHaveURL(/\/contacto\/\?/);
  expect(new URL(page.url()).searchParams.has("prioridad")).toBe(false);
  const details = page.locator("#contact-details");
  await expect(details).toHaveValue(/Producto A y producto B/);
  await expect(details).toHaveValue(/Vía de aplicación: Fertirriego/);
  await expect(details).toHaveValue(/Cultivo piloto/);
  await expect(details).toHaveValue(/Soportes disponibles según el usuario: Etiquetas/);
  await expect(details).toHaveValue(/compatibilidad no evaluada/);
});

test("mixture form fits desktop, tablet and narrow mobile with accessible states", async ({ page }) => {
  for (const width of [1440, 768, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/wondergreen/compatibilidad/", { waitUntil: "networkidle" });
    await page.getByRole("checkbox", { name: "Otros productos", exact: true }).check();
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.filter(({ impact }) => impact === "critical" || impact === "serious"), `${width}px`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}px`).toBe(true);
    await expect(page.getByRole("link", { name: "Organizar el informe de agua", exact: true })).toHaveAttribute("href", "/wondergreen/analisis-agua/");
    await expect(page.getByRole("link", { name: "Consultar las referencias Wondergreen", exact: true })).toHaveAttribute("href", "/biblioteca/catalogo-wondergreen/");
  }
});
