import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

for (const product of [
  { id: "wondergreen-solido", name: "Wondergreen sólido", unit: "kg" },
  { id: "wondergreen-liquido", name: "Wondergreen líquido", unit: "L" },
]) {
  test(`synthetic ${product.unit} correction recovers errors and survives reload without rewriting production`, async ({ page }, testInfo) => {
    test.setTimeout(120_000);
    await page.goto("/production/new");
    await page.getByLabel("Producto terminado").selectOption(product.id);
    await page.getByLabel(/Cantidad producida/).fill("250");
    await page.getByLabel("Proceso fuente").fill("Proceso sintético de control");
    await page.getByRole("button", { name: "Guardar producción y entrar a inventario" }).click();
    await expect(page).toHaveURL(/\/production$/);
    const production = page.locator("article").filter({ hasText: product.name }).first();
    await expect(production).toContainText(`250 ${product.unit}`);
    const lotCode = (await production.textContent())?.match(/TAM-PROD-\d{6}-\d{3}/)?.[0];
    expect(lotCode).toBeTruthy();

    // A rejected write must keep the form and allow correction in place.
    await page.goto("/inventory/dispatch");
    await page.getByLabel(/Cantidad de salida/).fill("300");
    await page.getByLabel("Destino").fill("Destino sintético");
    await page.getByRole("button", { name: "Registrar salida", exact: true }).click();
    await expect(page.locator('p[role="alert"]')).toContainText("Stock insuficiente");
    await expect(page.getByLabel("Destino")).toHaveValue("Destino sintético");
    await page.getByLabel(/Cantidad de salida/).fill("60");
    await page.getByRole("button", { name: "Registrar salida", exact: true }).click();
    await expect(page).toHaveURL(/\/inventory$/);
    const stock = page.locator("article").filter({ hasText: product.name }).first();
    await expect(stock).toContainText(`190 ${product.unit}`);

    await page.goto("/inventory/reconcile");
    const count = page.getByLabel("Conteo físico", { exact: true });
    const note = page.getByLabel("Observación del conteo");
    const save = page.getByRole("button", { name: "Guardar conciliación" });
    await expect(count).toHaveAttribute("inputmode", "decimal");
    for (const invalid of ["", "-1", "cantidad inválida"]) {
      await count.fill(invalid);
      await save.click();
      await expect(page.locator('p[role="alert"]')).toContainText("conteo físico válido");
      await expect(page).toHaveURL(/\/inventory\/reconcile$/);
    }
    // Colombian mobile keyboards use a comma. An omitted reason must still fail.
    await count.fill("185,5");
    await save.click();
    await expect(page.locator('p[role="alert"]')).toContainText("observación del conteo");
    await expect(count).toHaveValue("185,5");
    await note.fill("Conteo sintético con decimal y motivo verificable");
    await save.focus();
    await expect(save).toBeFocused();
    await save.press("Enter");
    await expect(page).toHaveURL(/\/inventory$/);
    await expect(stock).toContainText(`185,5 ${product.unit}`);
    const reconciliation = page.locator("article").filter({ hasText: "Conteo sintético con decimal y motivo verificable" });
    await expect(reconciliation).toHaveCount(1);
    await expect(reconciliation).toContainText(lotCode!);
    await expect(reconciliation).toContainText(`Esperado 190 ${product.unit} · físico 185,5 ${product.unit}`);
    await expect(page.getByText(`− 4,5 ${product.unit}`, { exact: true })).toHaveCount(1);

    await page.reload();
    await expect(stock).toContainText(`185,5 ${product.unit}`);
    await expect(reconciliation).toHaveCount(1);
    await expect(page.getByText(`− 60 ${product.unit}`, { exact: true })).toHaveCount(1);
    await expect(page.getByText(`− 4,5 ${product.unit}`, { exact: true })).toHaveCount(1);

    // A matching second count records evidence but creates no further movement.
    await page.goto("/inventory/reconcile");
    await count.fill("185.5");
    await note.fill("Segundo conteo sintético coincidente");
    await save.click();
    await expect(page).toHaveURL(/\/inventory$/);
    await page.reload();
    await expect(page.getByText("sin ajuste", { exact: true })).toHaveCount(1);
    await expect(page.getByText(`− 4,5 ${product.unit}`, { exact: true })).toHaveCount(1);
    await expect(stock).toContainText(`185,5 ${product.unit}`);
    await page.screenshot({ path: testInfo.outputPath("corrected-inventory.png"), fullPage: true });

    await page.goto("/production");
    await expect(production).toContainText(lotCode!);
    await expect(production).toContainText(`250 ${product.unit}`);
    await page.goto("/dashboard");
    await page.getByLabel("Planta", { exact: true }).selectOption("tamesis");
    const downloaded = page.waitForEvent("download");
    await page.getByRole("button", { name: "Exportar CSV", exact: true }).click();
    const file = await downloaded;
    expect(await file.failure()).toBeNull();
    const csv = await readFile((await file.path())!, "utf8");
    const [flow, currentStock] = csv.split("STOCK ACTUAL (snapshot, no depende del periodo)");
    expect(flow).toContain(`${product.name};${product.unit};250.00`);
    expect(currentStock).toContain(`${product.name};${product.unit};185.50;1`);
    await page.getByLabel("Planta", { exact: true }).selectOption("yarumal");
    await expect(page.getByLabel("Stock actual")).toContainText("Sin stock registrado.");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width + 2);
  });
}
