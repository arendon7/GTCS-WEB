import { expect, test } from "@playwright/test";

test.describe("GREENATICS OPS · estación pública de muestra", () => {
  test("la landing separa la muestra pública de la configuración organizacional", async ({ page }) => {
    await page.goto("/app/", { waitUntil: "networkidle" });

    await expect(page.getByRole("heading", { level: 1, name: "Del material recibido a la decisión del día, con una sola historia operativa." })).toBeVisible();
    await expect(page.getByRole("link", { name: "Explorar la muestra pública" })).toHaveAttribute("href", "#estacion");
    await expect(page.getByRole("link", { name: "Ver opciones de acceso" })).toHaveAttribute("href", "/acceso/");
    await expect(page.getByRole("link", { name: "Consultar alcance y configuración" })).toHaveAttribute("href", "/contacto/?interes=greenatics-ops&modalidad=configuracion");
    await expect(page.getByText("Los escenarios son ficticios, los cambios son temporales y la muestra no habilita una operación real.")).toBeVisible();
    await expect(page.getByText("Control por rol", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Los responsables y accesos para una organización se definen durante la configuración; esta muestra no habilita cuentas.")).toBeVisible();
  });

  test("la entrada lleva a la estación e identifica el carácter ficticio de los datos", async ({ page }) => {
    await page.goto("/app/#estacion", { waitUntil: "networkidle" });

    await expect(page).toHaveURL(/\/app\/#estacion$/);
    await expect(page.getByRole("heading", { name: "Explora cómo se relacionan los registros." })).toBeVisible();
    await expect(page.getByText("Datos ficticios de demostración", { exact: true })).toBeVisible();
    await expect(page.getByText("No representan la operación de Yarumal ni Támesis", { exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Área de trabajo de Greenatics OPS" })).toBeVisible();

    await page.getByLabel("Proceso de ejemplo").selectOption("yarumal");
    await expect(page.getByText("Escenario de compostaje termófilo cargado.")).toBeVisible();
    await expect(page.getByRole("region", { name: "Indicadores de la jornada de demostración" }).getByText("4.56 t", { exact: true })).toBeVisible();
  });

  test("la bitácora, recepción y proceso revelan acciones y relaciones concretas", async ({ page }) => {
    await page.goto("/app/#estacion", { waitUntil: "networkidle" });

    await page.getByRole("button", { name: /Bitácora/ }).click();
    await expect(page.getByRole("heading", { name: "Secuencia de actividades" })).toBeVisible();
    const volumeCheck = page.getByRole("checkbox", { name: "Volúmenes y lotes conciliados" });
    await expect(volumeCheck).not.toBeChecked();
    await volumeCheck.check();
    await expect(page.getByText("Checklist de muestra: 3 de 4 puntos marcados. El cambio es temporal; no guarda ni cierra un turno real.")).toBeVisible();

    await page.getByRole("button", { name: /Recepciones/ }).click();
    await expect(page.getByRole("table", { name: /Recepciones ilustrativas de Digestión anaerobia de muestra/ })).toBeVisible();
    await expect(page.getByText("DEMO-DA-047")).toBeVisible();

    await page.getByRole("button", { name: /Procesos/ }).click();
    await expect(page.getByRole("heading", { name: "Digestión anaerobia UASB" })).toBeVisible();
    await expect(page.getByRole("button", { name: /Biogás/ })).toBeVisible();
  });

  test("el balance no se presenta como cerrado y el checklist pertenece a cada escenario", async ({ page }) => {
    await page.goto("/app/#estacion", { waitUntil: "networkidle" });

    await expect(page.getByText("Por conciliar", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: /Bitácora/ }).click();
    const volumeCheck = page.getByRole("checkbox", { name: "Volúmenes y lotes conciliados" });
    await volumeCheck.check();
    await expect(volumeCheck).toBeChecked();

    await page.getByLabel("Proceso de ejemplo").selectOption("yarumal");
    await expect(volumeCheck).not.toBeChecked();
    await volumeCheck.check();
    await page.getByRole("checkbox", { name: "Evidencias y novedades adjuntas" }).check();
    await expect(page.getByText("4/4", { exact: true })).toBeVisible();

    await page.getByLabel("Proceso de ejemplo").selectOption("tamesis");
    await expect(volumeCheck).toBeChecked();
    await expect(page.getByText("3/4", { exact: true })).toBeVisible();
  });

  test("la estación se mantiene navegable sin overflow en 390 y 320 px", async ({ page }) => {
    await page.goto("/app/#estacion", { waitUntil: "networkidle" });

    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      const geometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
      expect(geometry.document, `OPS should fit at ${width}px`).toBeLessThanOrEqual(geometry.viewport + 2);
      const moduleButtons = page.locator(".ops-station__rail nav button");
      await expect(moduleButtons.first()).toBeVisible();
      expect(await moduleButtons.first().evaluate((button) => button.getBoundingClientRect().height)).toBeGreaterThanOrEqual(44);
    }
  });
});
