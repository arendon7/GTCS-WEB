import { test, expect } from "@playwright/test";

async function expectSectionBefore(page: import("@playwright/test").Page, first: string, secondText: string) {
  const second = page.getByRole("heading", { name: secondText, exact: true });
  const firstBeforeSecond = await page.locator(first).evaluate((node, secondElement) => {
    return Boolean(node.compareDocumentPosition(secondElement as Node) & Node.DOCUMENT_POSITION_FOLLOWING);
  }, await second.elementHandle());
  expect(firstBeforeSecond).toBe(true);
}

const programs = [
  ["esp-ready", "ESP READY", ["Estado actual", "Brechas", "Prioridades", "Hoja de ruta"], "/soluciones/rutas-selectivas"],
  ["greenatics-base", "GREENATICS BASE", ["Ficha GREENATICS BASE", "Base consolidada", "Evidencias organizadas", "Insumos para PMIRS y operación"], "/soluciones/pmirs"],
  ["pmirs-red", "PMIRS RED", ["PMIRS implementables", "Base consolidada", "Indicadores comparables", "Ruta de seguimiento"], "/soluciones/recoleccion-tratamiento"],
] as const;

for (const [slug, name, outputs, relatedHref] of programs) {
  test(`${name} exposes governed outputs before method and preserves exact program context`, async ({ page }) => {
    await page.goto(`/soluciones/programas/${slug}`);

    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Ver qué recibe el cliente", exact: true })).toHaveAttribute("href", "#entregables");
    await expect(page.getByRole("heading", { name: "Salidas gobernadas del programa." })).toBeVisible();
    for (const output of outputs) await expect(page.getByText(output, { exact: true })).toBeVisible();

    await expectSectionBefore(page, "#entregables", "El programa organiza una etapa concreta sin convertirla en una ruta obligatoria para todos.");

    const related = page.getByRole("link", { name: /Ver alcance y entregables/ }).filter({ has: page.locator(`[href="${relatedHref}"]`) });
    await expect(page.locator(`a[href="${relatedHref}"]`).filter({ hasText: "Ver alcance y entregables" }).first()).toBeVisible();

    const contact = page.getByRole("link", { name: `Hablar sobre ${name}`, exact: true });
    await expect(contact).toHaveAttribute("href", new RegExp(`service=${encodeURIComponent(name).replace(/%20/g, "(?:%20|\\+)")}`));
    await expect(contact).toHaveAttribute("href", /source=programa/);
  });
}

test("program related services remain separate scopes rather than automatic package contents", async ({ page }) => {
  await page.goto("/soluciones/programas/esp-ready");

  await expect(page.getByRole("heading", { name: "El programa puede conectarse con servicios específicos sin convertirlos en un paquete obligatorio." })).toBeVisible();
  await expect(page.getByText(/no significa que esté incluido automáticamente dentro del programa/i)).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver portafolio de servicios", exact: true })).toHaveAttribute("href", "/soluciones");
});
