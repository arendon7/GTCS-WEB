import { test, expect } from "@playwright/test";

test("desktop shell exposes the approved Soluciones mega-menu and closes with Escape", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "desktop shell contract");
  await page.goto("/");

  const header = page.getByRole("banner");
  const nav = header.getByRole("navigation", { name: "Navegación pública" });
  await expect(nav.getByRole("link", { name: "Soluciones", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Wondergreen", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Casa & Jardín", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Recursos", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Nosotros", exact: true })).toBeVisible();

  await header.getByRole("button", { name: "Abrir menú Soluciones" }).click();
  const menu = header.getByRole("group", { name: "Menú Soluciones" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: /ESP \/ Prestador/ })).toHaveAttribute("href", "/soluciones/esp-municipios");
  await expect(menu.getByRole("link", { name: /Municipio/ }).first()).toHaveAttribute("href", "/soluciones/esp-municipios");
  await expect(menu.getByRole("link", { name: /Empresa \/ Gran generador/ })).toHaveAttribute("href", "/soluciones/empresas-grandes-generadores");
  await expect(menu.getByRole("link", { name: /Propiedad horizontal \/ Institución/ })).toHaveAttribute("href", "/soluciones/propiedad-horizontal-redes");
  await expect(menu.getByRole("link", { name: /Planta \/ Operador/ })).toHaveAttribute("href", "/soluciones/infraestructura-plantas");
  await expect(menu.getByRole("link", { name: /Diagnóstico inicial Greenatics/ })).toHaveAttribute("href", "/soluciones/diagnostico-caracterizacion");

  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
});

test("mobile shell uses a two-level drawer and returns focus after Escape", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "mobile shell contract");
  await page.goto("/");

  const trigger = page.getByRole("button", { name: "Abrir navegación" });
  await expect(trigger).toBeVisible();
  await trigger.click();

  const dialog = page.getByRole("dialog", { name: "Navegación Greenatics" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Wondergreen", exact: true })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Casa & Jardín", exact: true })).toBeVisible();
  await expect(dialog.getByRole("link", { name: "Hablar con nosotros", exact: true })).toHaveAttribute("href", "/contacto");
  await expect(dialog.getByRole("link", { name: "Ingresar", exact: true })).toHaveAttribute("href", "/app");

  await dialog.getByRole("button", { name: /Soluciones/ }).click();
  await expect(dialog.getByText("Por organización", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /ESP \/ Prestador/ })).toHaveAttribute("href", "/soluciones/esp-municipios");
  await expect(dialog.getByRole("link", { name: /Iniciar por diagnóstico/ })).toHaveAttribute("href", "/soluciones/diagnostico-caracterizacion");

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
