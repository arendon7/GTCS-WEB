import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { calculateSodiumAdsorptionRatio, parseWaterNumber } from "../src/data/irrigation-water";

test("water numbers preserve missing values and accept decimal comma or point", () => {
  expect(parseWaterNumber(" 2,5 ")).toBe(2.5);
  expect(parseWaterNumber(".25")).toBe(.25);
  expect(parseWaterNumber("0")).toBe(0);
  for (const input of ["", " ", "NaN", "Infinity", "0x10", "1.2.3"]) expect(parseWaterNumber(input)).toBeNull();
});

test("RAS depends on the supplied sodium, calcium and magnesium", () => {
  expect(calculateSodiumAdsorptionRatio(4, 2, 6)).toBe(2);
  expect(calculateSodiumAdsorptionRatio(8, 2, 6)).toBe(4);
  expect(calculateSodiumAdsorptionRatio(4, 10, 6)).toBeCloseTo(Math.SQRT2);
  expect(calculateSodiumAdsorptionRatio(0, 2, 0)).toBe(0);
});

test("missing ions, negatives and zero denominators cannot produce a RAS", () => {
  for (const inputs of [[null, 2, 6], [4, null, 6], [4, 2, null], [-1, 2, 6], [4, -1, 6], [4, 2, -1], [4, 0, 0], [NaN, 2, 6], [4, Infinity, 6]] as const) {
    expect(calculateSodiumAdsorptionRatio(inputs[0], inputs[1], inputs[2])).toBeNull();
  }
});

test("the water report starts empty and computes only from editable ions", async ({ page }) => {
  await page.goto("/wondergreen/analisis-agua/");
  for (const input of await page.getByRole("textbox").all()) await expect(input).toHaveValue("");
  await expect(page.locator(".wg-water__ratio")).toHaveText("Por calcular");
  await page.getByLabel("Sodio (Na) (meq/L)", { exact: true }).fill("4");
  await page.getByLabel("Calcio (Ca) (meq/L)", { exact: true }).fill("2");
  await page.getByLabel("Magnesio (Mg) (meq/L)", { exact: true }).fill("6");
  await expect(page.locator(".wg-water__ratio")).toHaveText("2,00");
  await page.getByLabel("Calcio (Ca) (meq/L)", { exact: true }).fill("10");
  await expect(page.locator(".wg-water__ratio")).toHaveText("1,41");
  await page.getByLabel("Magnesio (Mg) (meq/L)", { exact: true }).fill("");
  await expect(page.locator(".wg-water__ratio")).toHaveText("Por calcular");
});

test("invalid and zero-denominator states explain the problem instead of inventing results", async ({ page }) => {
  await page.goto("/wondergreen/analisis-agua/");
  await page.getByLabel("Sodio (Na) (meq/L)", { exact: true }).fill("3,5");
  await page.getByLabel("Calcio (Ca) (meq/L)", { exact: true }).fill("0");
  await page.getByLabel("Magnesio (Mg) (meq/L)", { exact: true }).fill("0");
  await expect(page.locator(".wg-water__ratio")).toHaveText("Por calcular");
  await expect(page.getByText("Calcio y magnesio no pueden sumar cero para este cálculo.")).toBeVisible();
  await page.getByLabel("Calcio (Ca) (meq/L)", { exact: true }).fill("-1");
  await expect(page.getByLabel("Calcio (Ca) (meq/L)", { exact: true })).toHaveAttribute("aria-invalid", "true");
  await page.getByLabel("pH del agua", { exact: true }).fill("15");
  await expect(page.getByLabel("pH del agua", { exact: true })).toHaveAttribute("aria-invalid", "true");
});

test("an edited example remains identified and shares all ions through the private contact handoff", async ({ page }, testInfo) => {
  await page.goto("/wondergreen/analisis-agua/");
  await page.getByRole("button", { name: "Cargar un ejemplo", exact: true }).click();
  await page.getByLabel("Sodio (Na) (meq/L)", { exact: true }).fill("4");
  await page.getByLabel("Calcio (Ca) (meq/L)", { exact: true }).fill("6");
  await page.getByLabel("Magnesio (Mg) (meq/L)", { exact: true }).fill("2");
  await expect(page.locator(".wg-water__ratio")).toHaveText("2,00");
  await expect(page.locator(".wg-water__example-note")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("water-example.png"), fullPage: true });
  await page.getByRole("link", { name: "Compartir lectura con Greenatics", exact: true }).click();
  await expect(page).toHaveURL(/\/contacto\/\?/);
  expect(new URL(page.url()).searchParams.has("prioridad")).toBe(false);
  const details = page.locator("#contact-details");
  await expect(details).toHaveValue(/Calcio: 6 meq\/L/);
  await expect(details).toHaveValue(/Magnesio: 2 meq\/L/);
  await expect(details).toHaveValue(/RAS: 2\.00/);
  await expect(details).toHaveValue(/Ejemplo numérico editable/);
});

test("water input states remain accessible and fit a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/wondergreen/analisis-agua/", { waitUntil: "networkidle" });
  for (const state of ["empty", "example", "invalid"] as const) {
    if (state === "example") await page.getByRole("button", { name: "Cargar un ejemplo", exact: true }).click();
    if (state === "invalid") await page.getByLabel("Calcio (Ca) (meq/L)", { exact: true }).fill("-1");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.filter(({ impact }) => impact === "critical" || impact === "serious"), state).toEqual([]);
    const widths = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
    expect(widths.content, state).toBeLessThanOrEqual(widths.viewport + 1);
  }
  await page.getByRole("button", { name: "Limpiar datos", exact: true }).click();
  await expect(page.locator(".wg-water__example-note")).toHaveCount(0);
  await expect(page.locator(".wg-water__ratio")).toHaveText("Por calcular");
});
