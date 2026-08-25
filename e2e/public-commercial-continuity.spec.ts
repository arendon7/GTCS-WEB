import { test, expect } from "@playwright/test";

test("legal solution keeps exact service context into Contact without exposing source metadata", async ({ page }) => {
  await page.goto("/soluciones/gestion-juridica-regulatoria");

  const contact = page.getByRole("link", { name: "Plantear el caso", exact: true });
  await expect(contact).toHaveAttribute("href", /\/contacto\?service=/);
  await contact.click();

  const inherited = page.getByLabel("Contexto heredado de navegación");
  await expect(inherited.locator("span").filter({ hasText: "Servicio:" })).toContainText("Gestión jurídica y regulatoria para residuos, aseo y proyectos");
  await expect(page.getByLabel("Servicio recibido de la navegación")).toContainText("Gestión jurídica y regulatoria para residuos, aseo y proyectos");
  await expect(page.getByText(/Origen:/)).toHaveCount(0);
});

test("valorization solution keeps exact service context into Contact without exposing source metadata", async ({ page }) => {
  await page.goto("/soluciones/valorizacion-productos");

  const contact = page.getByRole("link", { name: "Evaluar un producto", exact: true });
  await expect(contact).toHaveAttribute("href", /\/contacto\?service=/);
  await contact.click();

  const inherited = page.getByLabel("Contexto heredado de navegación");
  await expect(inherited.locator("span").filter({ hasText: "Servicio:" })).toContainText("Valorización y desarrollo de productos");
  await expect(page.getByLabel("Servicio recibido de la navegación")).toContainText("Valorización y desarrollo de productos");
  await expect(page.getByText(/Origen:/)).toHaveCount(0);
});

test("public company and contact surfaces no longer make technical diagnosis the primary next step", async ({ page }) => {
  for (const route of ["/nosotros", "/contacto"] as const) {
    await page.goto(route);
    await expect(page.getByRole("link", { name: "Explorar servicios", exact: true })).toHaveAttribute("href", "/soluciones");
    await expect(page.getByRole("link", { name: "Usar orientador inicial", exact: true })).toHaveAttribute("href", "/soluciones/diagnostico-inicial");
    await expect(page.getByRole("link", { name: "Empezar por diagnóstico", exact: true })).toHaveCount(0);
  }
});
