import { test, expect } from "@playwright/test";

async function expectSectionBefore(page: import("@playwright/test").Page, first: string, second: string) {
  const firstBeforeSecond = await page.locator(first).evaluate((node, secondSelector) => {
    const secondNode = document.querySelector(secondSelector as string);
    if (!secondNode) return false;
    return Boolean(node.compareDocumentPosition(secondNode) & Node.DOCUMENT_POSITION_FOLLOWING);
  }, second);
  expect(firstBeforeSecond).toBe(true);
}

test("audience landing exposes direct services before the uncertainty router", async ({ page }) => {
  await page.goto("/soluciones/esp");

  await expect(page.getByRole("link", { name: "Ver servicios para este contexto →", exact: true })).toHaveAttribute("href", "#servicios");
  await expect(page.getByRole("link", { name: "No sé cuál revisar →", exact: true })).toHaveAttribute("href", "#decisiones");
  await expect(page.getByRole("link", { name: "Encontrar punto de entrada →", exact: true })).toHaveCount(0);

  await expect(page.getByRole("heading", { name: "Servicios que puedes abrir directamente." })).toBeVisible();
  await expectSectionBefore(page, "#servicios", "#decisiones");

  const routesCard = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Diseño e implementación de rutas selectivas y microrrutas", exact: true }),
  });
  await expect(routesCard).toHaveCount(1);
  await expect(routesCard.getByText("Entregables típicos", { exact: true })).toBeVisible();
  await expect(routesCard.getByText("diseño de ruta", { exact: true })).toBeVisible();
  await expect(routesCard.getByRole("link", { name: /Ver alcance y entregables/ })).toHaveAttribute("href", "/soluciones/rutas-selectivas");

  const contact = page.getByRole("link", { name: "Hablar con Greenatics →", exact: true });
  await expect(contact).toHaveAttribute("href", /audience=esp/);
  await expect(contact).toHaveAttribute("href", /source=soluciones-esp/);
  await expect(contact).toHaveAttribute("href", /contexto=ESP/);
});

test("all five audience routes expose governed service cards without forcing orientation first", async ({ page }) => {
  const cases = [
    ["/soluciones/esp", "Dirección técnica y coordinación de operación", "/soluciones/direccion-operacion"],
    ["/soluciones/municipios", "PGIRS · formulación, actualización y fortalecimiento operativo", "/soluciones/pgirs"],
    ["/soluciones/empresas", "PMIRS y planes internos de gestión de residuos", "/soluciones/pmirs"],
    ["/soluciones/propiedad-horizontal", "PMIRS y planes internos de gestión de residuos", "/soluciones/pmirs"],
    ["/soluciones/plantas", "Operación integral de plantas de tratamiento y valorización", "/soluciones/operacion-integral"],
  ] as const;

  for (const [route, serviceName, href] of cases) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: "Servicios que puedes abrir directamente." })).toBeVisible();
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: serviceName, exact: true }),
    });
    await expect(card, `${route} should expose ${serviceName}`).toHaveCount(1);
    await expect(card.getByRole("link", { name: /Ver alcance y entregables/ })).toHaveAttribute("href", href);
    await expectSectionBefore(page, "#servicios", "#decisiones");
  }
});

test("intent routes inherit the same direct-service hierarchy", async ({ page }) => {
  const cases = [
    ["/soluciones/residuos-organicos", "Gestión, recolección y tratamiento de residuos orgánicos para generadores", "/soluciones/recoleccion-tratamiento"],
    ["/soluciones/infraestructura-plantas", "Prefactibilidad de plantas y sistemas de tratamiento y valorización", "/soluciones/prefactibilidad"],
    ["/soluciones/propiedad-horizontal-redes", "PMIRS y planes internos de gestión de residuos", "/soluciones/pmirs"],
  ] as const;

  for (const [route, serviceName, href] of cases) {
    await page.goto(route);
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: serviceName, exact: true }),
    });
    await expect(card).toHaveCount(1);
    await expect(card.getByRole("link", { name: /Ver alcance y entregables/ })).toHaveAttribute("href", href);
    await expect(page.getByRole("heading", { name: "Usa la situación actual como orientación." })).toBeVisible();
    await expectSectionBefore(page, "#servicios", "#decisiones");
  }
});
