import { expect, test } from "@playwright/test";

test("current kit proposals show their approved art and can be added by keyboard", async ({ page }) => {
  await page.goto("/wondergreen/cotizador/#kits");
  await page.locator(".quote-presets-section > summary").click();

  const kitImages = page.locator(".preset-card__visual img");
  await expect(kitImages).toHaveCount(9);
  await expect(kitImages.first()).toHaveAttribute("alt", /Arte de referencia de Mi Primera Matera/);

  const addKit = page.getByRole("button", { name: "Añadir consulta sobre Plantas Verdes al borrador de cotización" });
  await expect(addKit).toBeVisible();
  await expect(page.getByRole("checkbox")).toHaveCount(0);
  if (await page.evaluate(() => matchMedia("(pointer: coarse)").matches)) {
    await addKit.click();
  } else {
    await addKit.press("Space");
  }

  await expect(page.getByText(/1\s*×\s*Propuesta\s+Plantas Verdes/)).toBeVisible();
  const addAnotherKit = page.getByRole("button", { name: "Añadir otra consulta sobre Plantas Verdes al borrador de cotización" });
  await addAnotherKit.press("Space");
  await expect(page.getByText(/2\s*×\s*Propuesta\s+Plantas Verdes/)).toBeVisible();
});

test("catalog filters expose toggle state and product quantity transfers to Contacto", async ({ page }) => {
  await page.goto("/wondergreen/cotizador/");

  const filters = page.getByRole("group", { name: "Filtrar catálogo" });
  const solids = filters.getByRole("button", { name: "Sólidos (40 kg)" });
  const liquids = filters.getByRole("button", { name: "Líquidos (1 L a 1000 L)" });
  await expect(solids).toHaveAttribute("aria-pressed", "false");
  await solids.focus();
  await page.keyboard.press("Space");
  await expect(solids).toHaveAttribute("aria-pressed", "true");
  await expect(liquids).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByText("Wondergreen 2GROW Líquido", { exact: true })).toHaveCount(0);

  const addSolid = page.getByRole("button", { name: "Aumentar cantidad de Wondergreen 2GROW" });
  await addSolid.focus();
  await page.keyboard.press("Space");
  await expect(page.getByText(/1× Wondergreen 2GROW/)).toBeVisible();

  await page.getByRole("link", { name: "Enviar solicitud al equipo" }).click();
  await expect(page).toHaveURL(/\/contacto\//);
  await expect(page.locator("#contact-details")).toHaveValue(/Wondergreen 2GROW 15-3-3 \(40 kg\)/);
  await expect(page.locator("#contact-details")).toHaveValue(/no confirma disponibilidad, registro, precio/);
});

test("a kit quote opens a reviewable Greenatics WhatsApp draft and transfers to Contacto", async ({ page }) => {
  await page.goto("/wondergreen/cotizador/?kit=plantas-verdes#kits");

  await expect(page.getByText(/1\s*×\s*Propuesta\s+Plantas Verdes/)).toBeVisible();
  const whatsapp = page.getByRole("link", { name: "Abrir borrador en WhatsApp" });
  const href = await whatsapp.getAttribute("href");
  expect(href).toMatch(/^https:\/\/wa\.me\/573003078822\?text=/);

  const whatsappText = new URL(href!).searchParams.get("text") ?? "";
  expect(whatsappText).toContain("Solicitud de revisión y cotización Wondergreen Casa & Jardín");
  expect(whatsappText).toContain("Propuesta de kit Plantas Verdes");
  expect(whatsappText).toContain("Revisar contenido, referencias, presentaciones y empaque");
  expect(whatsappText).toContain("Esta solicitud es un borrador.");
  expect(whatsappText).toContain("confirmará precio, disponibilidad, cantidades finales");

  await page.getByRole("link", { name: "Enviar solicitud al equipo" }).click();
  await expect(page).toHaveURL(/\/contacto\//);
  await expect(page.locator("#contact-details")).toHaveValue(/1 × Propuesta de kit Plantas Verdes/);
  await expect(page.locator("#contact-details")).toHaveValue(/no confirma disponibilidad, registro, precio, cantidades finales ni pedido/);
});

test("a mixed product and kit draft survives reload and return from Contacto", async ({ page }) => {
  await page.goto("/wondergreen/cotizador/?kit=plantas-verdes#kits");
  await expect(page.getByText(/1\s*×\s*Propuesta\s+Plantas Verdes/)).toBeVisible();

  await page.getByRole("button", { name: "Aumentar cantidad de Wondergreen Compost" }).click();
  await expect(page.getByText(/1× Wondergreen Compost/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/1× Wondergreen Compost/)).toBeVisible();
  await expect(page.getByText(/1\s*×\s*Propuesta\s+Plantas Verdes/)).toBeVisible();

  await page.getByRole("link", { name: "Enviar solicitud al equipo" }).click();
  await expect(page.locator("#contact-details")).toHaveValue(/Wondergreen Compost \(40 kg\)/);
  await expect(page.locator("#contact-details")).toHaveValue(/Propuesta de kit Plantas Verdes/);

  await page.goBack();
  await expect(page.getByText(/1× Wondergreen Compost/)).toBeVisible();
  await expect(page.getByText(/1\s*×\s*Propuesta\s+Plantas Verdes/)).toBeVisible();
  await page.getByRole("button", { name: "Vaciar" }).click();
  await page.reload();
  await expect(page.getByText("Aún no agregas productos ni kits")).toBeVisible();
});

test("a catalog product opens its quote group without preselecting quantity", async ({ page }) => {
  await page.goto("/biblioteca/catalogo-wondergreen/");
  await page.locator(".wg-catalog-family--liquidos > summary").click();
  const quoteLink = page.locator('a[href="/wondergreen/cotizador/?grupo=2grow-liquido"]');
  await quoteLink.scrollIntoViewIfNeeded();
  await quoteLink.click();

  await expect(page).toHaveURL(/\/wondergreen\/cotizador\/\?grupo=2grow-liquido$/);
  const allCatalog = page.getByRole("group", { name: "Filtrar catálogo" }).getByRole("button", { name: "Todo el catálogo (20)" });
  await expect(allCatalog).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("status")).toContainText("Wondergreen 2GROW líquido · 100-20-20");
  await expect(page.getByRole("status")).toContainText("La referencia 200-0-0 se consulta por separado.");
  await expect(page.getByRole("button", { name: "Aumentar cantidad de Wondergreen 2GROW Líquido" })).toHaveCount(5);
  await expect(page.getByText("Aún no agregas productos ni kits")).toBeVisible();

  await page.getByRole("status").getByRole("button", { name: "Ver todo el catálogo" }).click();
  await expect(allCatalog).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Aumentar cantidad de Wondergreen 2GROW Líquido" })).toHaveCount(5);
});

test("a technical catalog reference is added as a consultation, separate from commercial offers", async ({ page }) => {
  await page.goto("/biblioteca/catalogo-wondergreen/");
  await page.locator(".wg-catalog-family--liquidos > summary").click();
  await page.getByRole("link", { name: /Consultar 2GROW líquido 200-0-0/ }).click();

  await expect(page).toHaveURL(/consulta=2grow-200-0-0#consultas-tecnicas$/);
  await expect(page.getByRole("heading", { name: "1 elemento seleccionado" })).toBeVisible();
  await expect(page.locator(".quote-line-item--technical").getByText("2GROW líquido 200-0-0", { exact: true })).toBeVisible();
  await expect(page.getByText("Consulta técnica · no es oferta cotizable")).toBeVisible();
  await expect(page.locator(".quote-line-item--technical input, .quote-line-item--technical button[aria-label*='cantidad']")).toHaveCount(0);

  const whatsapp = page.getByRole("link", { name: "Abrir borrador en WhatsApp" });
  const whatsappText = new URL((await whatsapp.getAttribute("href"))!).searchParams.get("text") ?? "";
  expect(whatsappText).toContain("Consulta sobre referencias técnicas Wondergreen");
  expect(whatsappText).toContain("Formato y suministro por consultar");
  expect(whatsappText).not.toMatch(/\b\d+\s*[×x]\s*2GROW|\$\s?\d/);

  await page.getByRole("link", { name: "Enviar solicitud al equipo" }).click();
  await expect(page.locator("#contact-details")).toHaveValue(/Consulta técnica: 2GROW líquido 200-0-0/);
  await expect(page.locator("#contact-details")).toHaveValue(/no son ofertas comerciales/);
});
