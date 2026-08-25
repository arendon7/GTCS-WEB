import { test, expect } from "@playwright/test";

test("desktop shell exposes direct commercial solutions, explicit OPS and closes with Escape", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "desktop shell contract");
  await page.goto("/");

  const header = page.getByRole("banner");
  const nav = header.getByRole("navigation", { name: "Navegación pública" });
  await expect(nav.getByRole("link", { name: "Soluciones", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Wondergreen", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Casa & Jardín", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Recursos", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Nosotros", exact: true })).toBeVisible();
  await expect(header.getByRole("link", { name: "GREENATICS OPS", exact: true })).toHaveAttribute("href", "/app");

  await header.getByRole("button", { name: "Abrir menú Soluciones" }).click();
  const menu = header.getByRole("group", { name: "Menú Soluciones" });
  await expect(menu).toBeVisible();
  await expect(menu.getByText("Elige el servicio que necesitas o entra por tu tipo de organización.", { exact: true })).toBeVisible();
  await expect(menu.getByRole("link", { name: /ESP \/ Prestador/ })).toHaveAttribute("href", "/soluciones/esp");
  await expect(menu.getByRole("link", { name: /Municipio/ }).first()).toHaveAttribute("href", "/soluciones/municipios");
  await expect(menu.getByRole("link", { name: /Empresa \/ Gran generador/ })).toHaveAttribute("href", "/soluciones/empresas");
  await expect(menu.getByRole("link", { name: /Propiedad horizontal \/ Institución/ })).toHaveAttribute("href", "/soluciones/propiedad-horizontal");
  await expect(menu.getByRole("link", { name: /Planta \/ Operador/ })).toHaveAttribute("href", "/soluciones/plantas");
  await expect(menu.getByRole("link", { name: /Gestión jurídica y regulatoria/ })).toHaveAttribute("href", "/soluciones/gestion-juridica-regulatoria");
  await expect(menu.getByRole("link", { name: /Valorizar y desarrollar productos/ })).toHaveAttribute("href", "/soluciones/valorizacion-productos");
  await expect(menu.getByRole("link", { name: /Usar orientador inicial/ })).toHaveAttribute("href", "/soluciones/diagnostico-inicial");

  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
});

test("mobile shell uses a two-level drawer with direct services, explicit OPS and optional orientation", async ({ page }, testInfo) => {
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
  await expect(dialog.getByRole("link", { name: "GREENATICS OPS", exact: true })).toHaveAttribute("href", "/app");

  await dialog.getByRole("button", { name: /Soluciones/ }).click();
  await expect(dialog.getByText("Elige el servicio que necesitas o entra por tu tipo de organización.", { exact: true })).toBeVisible();
  await expect(dialog.getByText("Por organización", { exact: true })).toBeVisible();
  await expect(dialog.getByRole("link", { name: /ESP \/ Prestador/ })).toHaveAttribute("href", "/soluciones/esp");
  await expect(dialog.getByRole("link", { name: /Municipio/ }).first()).toHaveAttribute("href", "/soluciones/municipios");
  await expect(dialog.getByRole("link", { name: /Empresa \/ Gran generador/ })).toHaveAttribute("href", "/soluciones/empresas");
  await expect(dialog.getByRole("link", { name: /Propiedad horizontal \/ Institución/ })).toHaveAttribute("href", "/soluciones/propiedad-horizontal");
  await expect(dialog.getByRole("link", { name: /Planta \/ Operador/ })).toHaveAttribute("href", "/soluciones/plantas");
  await expect(dialog.getByRole("link", { name: /Gestión jurídica y regulatoria/ })).toHaveAttribute("href", "/soluciones/gestion-juridica-regulatoria");
  await expect(dialog.getByRole("link", { name: /Valorizar y desarrollar productos/ })).toHaveAttribute("href", "/soluciones/valorizacion-productos");
  await expect(dialog.getByRole("link", { name: /Usar orientador inicial/ })).toHaveAttribute("href", "/soluciones/diagnostico-inicial");

  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
