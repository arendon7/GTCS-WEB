import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { readingRatio, formatReading } from "../src/data/measured-tool-math";

test("reading ratios reject missing, zero and non-finite denominators without substitution", () => {
  expect(readingRatio(6, 2)).toBe(3);
  expect(readingRatio(0, 2)).toBe(0);
  for (const denominator of [0, -1, Infinity, NaN, null]) expect(readingRatio(6, denominator)).toBeNull();
  expect(readingRatio(null, 2)).toBeNull();
  expect(readingRatio(-1, 2)).toBeNull();
  expect(formatReading(Infinity)).toBe("Por calcular");
});

const tools = [
  ["calibracion-aspersores", "Llevar calibración a Contacto", "Agua utilizada por tanque: 20 L"],
  ["balance-bases", "Llevar lectura a Contacto", "Calcio intercambiable: 6.5 cmol(+)/kg"],
  ["costo-unidad-nutriente", "Llevar comparación a Contacto", "Peso Wondergreen: 40 kg"],
] as const;

for (const [route, cta, detail] of tools) {
  test(`${route} starts empty, identifies examples, clears and transfers their origin`, async ({ page }, testInfo) => {
    await page.goto(`/wondergreen/${route}/`);
    for (const input of await page.locator(".wg-measured input").all()) await expect(input).toHaveValue("");
    await expect(page.getByText("Por calcular", { exact: true }).first()).toBeVisible();
    await page.getByRole("button", { name: "Cargar un ejemplo", exact: true }).click();
    await expect(page.locator(".wg-measured__example")).toBeVisible();
    await page.locator("h1").click();
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.screenshot({ path: testInfo.outputPath(`${route}.png`), fullPage: true });
    await page.getByRole("link", { name: new RegExp(cta) }).click();
    await expect(page.locator("#contact-details")).toHaveValue(/Origen: Ejemplo editable/);
    await expect(page.locator("#contact-details")).toHaveValue(new RegExp(detail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    expect(new URL(page.url()).searchParams.has("prioridad")).toBe(false);
    await page.goto(`/wondergreen/${route}/`);
    await page.getByRole("button", { name: "Cargar un ejemplo", exact: true }).click();
    await page.getByRole("button", { name: "Limpiar datos", exact: true }).click();
    await expect(page.locator(".wg-measured__example")).toHaveCount(0);
    for (const input of await page.locator(".wg-measured input").all()) await expect(input).toHaveValue("");
  });

  test(`${route} validates input and remains accessible at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(`/wondergreen/${route}/`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Cargar un ejemplo", exact: true }).click();
    await page.locator(".wg-measured input").first().fill("-1");
    await expect(page.locator(".wg-measured input").first()).toHaveAttribute("aria-invalid", "true");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.filter(({ impact }) => impact === "critical" || impact === "serious")).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  });
}

test("calibration accepts actual decimal measurements and does not fabricate missing results", async ({ page }) => {
  await page.goto("/wondergreen/calibracion-aspersores/");
  await page.getByLabel("Agua utilizada por tanque (L)", { exact: true }).fill("3,75");
  await page.getByLabel("Área medida cubierta (m²)", { exact: true }).fill("125");
  await page.getByLabel("Área total a intervenir (m²)", { exact: true }).fill("1000");
  await expect(page.getByText("8,00", { exact: true })).toBeVisible();
  await expect(page.getByText("30,00 L", { exact: true })).toBeVisible();
  await expect(page.getByText("300,00 L/ha equivalentes", { exact: true })).toBeVisible();
  await page.getByLabel("Área medida cubierta (m²)", { exact: true }).fill("0");
  await expect(page.getByText("Por calcular", { exact: true }).first()).toBeVisible();
});

test("soil ratios preserve exact readings and never replace zero potassium", async ({ page }) => {
  await page.goto("/wondergreen/balance-bases/");
  await page.getByRole("button", { name: "Cargar un ejemplo", exact: true }).click();
  await page.getByLabel("Potasio intercambiable (cmol(+)/kg)", { exact: true }).fill("0");
  await expect(page.getByText(/Una relación con denominador cero/)).toBeVisible();
  await page.getByRole("link", { name: /Llevar lectura a Contacto/ }).click();
  await expect(page.locator("#contact-details")).toHaveValue(/Relación Mg\/K: Por calcular/);
  await expect(page.locator("#contact-details")).toHaveValue(/K\/C.I.C.: 0,00%/);
});

test("purchase comparison reports signed direction and handles decimal packages", async ({ page }) => {
  await page.goto("/wondergreen/costo-unidad-nutriente/");
  await page.getByLabel("Precio de la alternativa (COP)", { exact: true }).fill("100");
  await page.getByLabel("Peso de la alternativa (kg)", { exact: true }).fill("3");
  await page.getByLabel("Precio Wondergreen (COP)", { exact: true }).fill("100");
  await page.getByLabel("Peso Wondergreen (kg)", { exact: true }).fill("2,5");
  await expect(page.getByText(/Wondergreen cuesta COP 6,67 más por kilogramo/)).toBeVisible();
  await page.getByLabel("Peso Wondergreen (kg)", { exact: true }).fill("5");
  await expect(page.getByText(/Wondergreen cuesta COP 13,33 menos por kilogramo/)).toBeVisible();
  await page.getByLabel("Peso Wondergreen (kg)", { exact: true }).fill("0");
  await expect(page.getByText(/Completa precios y pesos válidos/)).toBeVisible();
});
