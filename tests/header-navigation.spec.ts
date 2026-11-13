import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { digitalTools } from "../src/data/digital-tools";
import { serviceAudienceLabels } from "../src/data/services";
import { primaryNav } from "../src/data/site";

test("desktop header keeps a keyboard navigation contract at standard desktop widths", async () => {
  const styles = fs.readFileSync("src/app/site-v3.css", "utf8");
  const component = fs.readFileSync("src/components/site-header.tsx", "utf8");

  expect(styles).toContain("@media (min-width: 1321px)");
  expect(styles).toContain("@media (max-width: 1320px)");
  expect(styles).toContain(".site-header .nav-dropdown-menu[hidden]");
  expect(styles).toContain("display: none;");
  expect(component).not.toContain('aria-haspopup="menu"');
  expect(component).toContain('role="group"');
  expect(component).toContain("hidden={!isOpen}");
  expect(component).toContain("focusedDropdown.querySelector<HTMLElement>(\".nav-dropdown-trigger\")?.focus()");
});

test("navigation exposes named digital tools and the separate organic estimator", async () => {
  const component = fs.readFileSync("src/components/site-header.tsx", "utf8");
  const tools = primaryNav.find((item) => item.href === "/herramientas/");

  expect(primaryNav.every((item) => item.subitems?.every((subitem) => subitem.href !== item.href) ?? true)).toBe(true);
  expect(tools?.subitems?.filter((tool) => tool.href !== "/herramientas/estimador-organicos/").map((tool) => tool.label)).toEqual(digitalTools.map((tool) => tool.name));
  expect(tools?.subitems?.find((tool) => tool.href === "/herramientas/estimador-organicos/")).toMatchObject({
    label: "Estimador de orgánicos",
    description: expect.stringMatching(/no calcula emisiones/i),
  });
  expect(tools?.subitems?.find((tool) => tool.href === "/app/")?.description).toMatch(/muestra/i);
  expect(tools?.subitems?.find((tool) => tool.href === "/agroway/")?.description).toMatch(/modelo histórico de trazabilidad agrícola/i);
  expect(component).not.toContain("featuredTools");
  expect(component).not.toContain('item.href !== "/herramientas/"');
  expect(component).toContain("createPortal(");
  expect(component).toContain("document.body");
});

test("navigation uses the canonical name for organizations and large generators", () => {
  const services = primaryNav.find((item) => item.href === "/servicios/");
  const organizations = services?.subitems?.find((item) => item.href === "/empresas/");

  expect(organizations?.label).toBe(serviceAudienceLabels.Empresas);
  expect(organizations?.label).toBe("Organizaciones y grandes generadores");
});

test("header access action follows the active Huella page instead of routing visitors to OPS", () => {
  const component = fs.readFileSync("src/components/site-header.tsx", "utf8");
  const landing = fs.readFileSync("src/app/huella/page.tsx", "utf8");

  expect(component).toContain('const isHuellaPage = normalizePath(pathname) === "/huella";');
  expect(component).toContain('hasPublicHuellaRuntime ? `${runtimeLinks.huella}/login` : hasLocalHuellaRuntime ? "/huella/#planes-heading-start" : "/huella/#plataforma"');
  expect(component).toContain('hasPublicHuellaRuntime ? "Entrar a Huella" : hasLocalHuellaRuntime ? "Ver planes y precios" : "Ver módulos de Huella"');
  expect(component).toContain('href={headerAppUrl}');
  expect(component).toContain("{headerAppLabel}");
  expect(landing).toContain("const hasLocalHuellaRuntime = Boolean(runtimeLinks.huella && isLocalRuntime(runtimeLinks.huella));");
  expect(landing).toContain("const hasPublicHuellaRuntime = Boolean(runtimeLinks.huella && !hasLocalHuellaRuntime);");
  expect(landing).toContain('href="#planes-heading-start">Ver planes anuales</a>');
  expect(landing).toContain("El acceso local es solo para pruebas y requiere que el servidor de Back 2 Green esté iniciado en este equipo.");
});

test("Huella header action avoids a dead local login and keeps consultation separate", async ({ page }) => {
  await page.goto("/huella/", { waitUntil: "networkidle" });

  let headerAction = page.locator(".header-ops-btn");
  if ((page.viewportSize()?.width ?? 1440) <= 990) {
    await page.getByRole("button", { name: "Abrir menú" }).click();
    headerAction = page.getByRole("dialog", { name: "Menú de navegación" }).locator("a.button--dark");
  }
  const href = await headerAction.getAttribute("href");
  if (href === "/huella/#planes-heading-start") {
    await expect(headerAction).toHaveText("Ver planes y precios");
  } else if (href === "/huella/#plataforma") {
    await expect(headerAction).toHaveText("Ver módulos de Huella");
  } else {
    expect(href).toMatch(/^https:\/\/[^/]+\/login$/);
    await expect(headerAction).toHaveText("Entrar a Huella");
  }
  await expect(page.getByRole("link", { name: "Hablar con un especialista" })).toHaveAttribute(
    "href",
    "/contacto/?servicio=clima-carbono",
  );
  if (href === "/huella/#planes-heading-start") {
    await headerAction.click();
    await expect(page).toHaveURL(/\/huella\/#planes-heading-start$/);
    await expect(page.getByRole("heading", { name: "Un plan anual para ordenar el inventario y avanzar con apoyo." })).toBeInViewport();
  } else if (href === "/huella/#plataforma") {
    await headerAction.click();
    await expect(page).toHaveURL(/\/huella\/#plataforma$/);
    await expect(page.getByRole("heading", { name: "Del dato de actividad a una revisión con contexto." })).toBeInViewport();
  }
});

test("mobile navigation exposes one direct link per digital tool and a portfolio entry", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Abrir menú" }).click();

  const menu = page.getByRole("dialog", { name: "Menú de navegación" });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: "Portafolio", exact: true })).toHaveAttribute("href", "/portafolio/");
  await expect(menu.getByRole("link", { name: "Organizaciones y grandes generadores", exact: true })).toHaveAttribute("href", "/empresas/");

  for (const name of ["GREENATICS Red", "Back 2 Green", "AGROWAY", "SANA", "GREENATICS OPS"]) {
    await expect(menu.getByRole("link", { name: new RegExp(name) }), `${name} appears once in the mobile menu`).toHaveCount(1);
  }
  await expect(menu.getByRole("link", { name: "Centro de herramientas", exact: true })).toHaveCount(0);
});

test("mobile navigation traps focus and restores it after Escape", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/", { waitUntil: "networkidle" });

  const toggle = page.getByRole("button", { name: "Abrir menú" });
  await toggle.click();
  const menu = page.getByRole("dialog", { name: "Menú de navegación" });
  const close = menu.getByRole("button", { name: "Cerrar menú" });
  await expect(close).toBeFocused();

  await close.press("Shift+Tab");
  await expect(page.getByRole("link", { name: "Herramientas y acceso" })).toBeFocused();
  await page.keyboard.press("Escape");

  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();
});

test("mobile OPS action names the actual destination on the access hub", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/acceso/", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Abrir menú" }).click();

  const menu = page.getByRole("dialog", { name: "Menú de navegación" });
  const action = menu.getByRole("link", { name: "Explorar muestra de OPS", exact: true });
  await expect(action).toHaveAttribute("href", "/app/#estacion");
});

test("desktop navigation is visible and Greenatics submenu opens by keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/", { waitUntil: "networkidle" });

  const desktopNav = page.getByRole("navigation", { name: "Navegación principal" });
  const greenatics = desktopNav.getByRole("link", { name: "Greenatics" });
  const dropdowns = page.locator(".desktop-nav .nav-dropdown-menu");
  await expect(desktopNav).toBeVisible();
  await expect(page.getByRole("button", { name: "Abrir menú" })).toBeHidden();
  await expect(dropdowns).toHaveCount(5);
  for (let index = 0; index < 5; index += 1) await expect(dropdowns.nth(index)).toBeHidden();

  await greenatics.focus();
  const submenu = desktopNav.getByRole("group", { name: "Enlaces de Greenatics" });
  const portfolio = submenu.getByRole("link", { name: "Portafolio" });
  await expect(submenu).toBeVisible();
  await expect(portfolio).toBeVisible();
  for (let index = 0; index < 4; index += 1) await expect(dropdowns.nth(index)).toBeHidden();

  await portfolio.focus();
  await page.keyboard.press("Escape");
  await expect(submenu).toBeHidden();
  await expect(greenatics).toBeFocused();
});
