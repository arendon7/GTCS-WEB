import { test, expect } from "@playwright/test";

test("solutions uncertainty CTA opens the initial diagnostic instead of the technical service", async ({ page }) => {
  await page.goto("/soluciones");
  const start = page.getByRole("link", { name: "Usar orientador inicial", exact: true });
  await expect(start).toHaveAttribute("href", "/soluciones/diagnostico-inicial");
  await start.click();
  await expect(page).toHaveURL(/\/soluciones\/diagnostico-inicial$/);
  await expect(page.getByRole("heading", { name: "No necesitas saber qué servicio pedir." })).toBeVisible();
  await expect(page.getByText(/No sustituye un diagnóstico técnico/i)).toBeVisible();
});

test("initial diagnostic routes an inactive plant toward rehabilitation without making a closed prescription", async ({ page }) => {
  await page.goto("/soluciones/diagnostico-inicial");

  await page.getByRole("button", { name: /Planta \/ Operador/ }).click();
  await page.getByRole("button", { name: /Reactivar una planta que no opera/ }).click();
  await page.getByRole("button", { name: /Existe, pero no está operando/ }).click();

  await expect(page.getByRole("heading", { name: /Por lo que nos cuentas, vale la pena revisar estas rutas/i })).toBeVisible();
  await expect(page.getByText(/no es una prescripción comercial ni un diagnóstico técnico cerrado/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Rehabilitación y puesta en marcha/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Ver rehabilitación/ }).first()).toHaveAttribute("href", "/soluciones/rehabilitacion");

  const contact = page.getByRole("link", { name: "Continuar con Greenatics", exact: true });
  await expect(contact).toHaveAttribute("href", /audience=planta/);
  await expect(contact).toHaveAttribute("href", /need=planta/);
  await expect(contact).toHaveAttribute("href", /source=diagnostico-inicial/);
});

test("initial diagnostic preserves selections in the URL and contact inherits the context", async ({ page }) => {
  await page.goto("/soluciones/diagnostico-inicial");

  await page.getByRole("button", { name: /Empresa \/ Gran generador/ }).click();
  await page.getByRole("button", { name: /Ordenar o actualizar la gestión interna/ }).click();
  await page.getByRole("button", { name: /Existe un plan, pero poca implementación/ }).click();

  await expect(page).toHaveURL(/audience=empresa/);
  await expect(page).toHaveURL(/need=pmirs/);
  await expect(page).toHaveURL(/state=plan-poca-implementacion/);

  await page.getByRole("link", { name: "Continuar con Greenatics", exact: true }).click();
  await expect(page).toHaveURL(/\/contacto\?/);
  await expect(page.getByRole("heading", { name: /Cuéntanos cómo gestionas hoy tus residuos/i })).toBeVisible();
  await expect(page.getByLabel("¿Desde qué contexto nos escribes?")).toHaveValue("empresa");
  await expect(page.getByLabel("¿Qué necesitas resolver primero?")).toHaveValue("planeacion");
  await expect(page.getByLabel("Contexto heredado de navegación")).toContainText("Ordenar o actualizar la gestión interna");
});

test("initial diagnostic can restore a valid shared state from query parameters", async ({ page }) => {
  await page.goto("/soluciones/diagnostico-inicial?audience=planta&need=datos&state=estable-mejorar");

  await expect(page.getByRole("button", { name: /Planta \/ Operador/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /Organizar control, trazabilidad e indicadores/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /Opera de forma estable y queremos mejorar/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: /Datos, trazabilidad y OPS/i })).toBeVisible();
});
