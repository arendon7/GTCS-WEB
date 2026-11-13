import { expect, test } from "@playwright/test";
import {
  buildDiagnosticContactHref,
  buildDiagnosticDestinationHref,
  buildDiagnosticRequestDetails,
  diagnosticNeeds,
  diagnosticProfiles,
  diagnosticRoutes,
} from "../src/data/diagnostic-routes";

const formProfileLabels: Record<string, string> = {
  municipio: "Municipio / ESP",
  esp: "Municipio / ESP",
  empresa: "Organización / Gran generador",
  agroindustria: "Agroindustria / proyecto productivo",
  agro: "Productor / Finca",
  hogar: "Casa y Jardín",
  clima: "Clima / datos",
  territorio: "Territorio / Organización",
  digital: "Equipo / plataforma",
  proyecto: "Proyecto / aliado",
};

function containsText(value: string) {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

for (const [routeKey, route] of Object.entries(diagnosticRoutes)) {
  const [profileId, needId] = routeKey.split(":");
  const profile = diagnosticProfiles.find((item) => item.id === profileId)!;
  const need = diagnosticNeeds[profileId].find((item) => item.id === needId)!;
  const contactHref = buildDiagnosticContactHref(profileId, route, need.label);
  const expectedFormProfile = formProfileLabels[route.contactProfile ?? profileId];
  const expectedDetails = buildDiagnosticRequestDetails(route.title, need.label, profileId === "hogar" ? "home" : "route");

  test(`${routeKey}: selection carries its need, audience and destination into contact`, async ({ page }) => {
    await page.goto("/diagnostico/");
    await page.getByRole("button", { name: containsText(profile.label) }).click();
    await page.getByRole("button", { name: containsText(need.label) }).click();

    await expect(page.getByRole("heading", { name: route.title })).toBeVisible();

    const primary = page.getByRole("link", { name: route.cta });
    await expect(primary).toHaveAttribute("href", buildDiagnosticDestinationHref(profileId, route, need.label));

    const contactAction = route.href === "/contacto/"
      ? primary
      : page.getByRole("link", { name: route.secondary!.cta });
    await expect(contactAction).toHaveAttribute("href", contactHref);
    await contactAction.click();

    await expect.poll(() => new URL(page.url()).pathname).toBe("/contacto/");
    const contactUrl = new URL(page.url());
    expect(contactUrl.searchParams.get("interes")).toBe(route.contactInterest);
    expect(contactUrl.searchParams.get("perfil")).toBe(route.contactProfile ?? profileId);
    expect(contactUrl.searchParams.get("diagnostico")).toBe(route.title);
    expect(contactUrl.searchParams.get("prioridad")).toBe(need.label);

    const context = page.getByRole("status").first();
    await expect(context).toBeVisible();
    await expect(context).toContainText(route.contactInterest === "casa-jardin" ? route.title : `Ruta sugerida: ${route.title}`);
    await expect(context).toContainText(`Perfil seleccionado: ${expectedFormProfile}`);
    await expect(context).toContainText(need.label);
    await expect(page.getByRole("button", { name: expectedFormProfile })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel("Qué quieres resolver o decidir")).toHaveValue(expectedDetails);
  });
}

test("a service recommendation keeps its selected context through the detail-page contact action", async ({ page }) => {
  const profileId = "municipio";
  const route = diagnosticRoutes["municipio:diagnostico"];
  const need = diagnosticNeeds[profileId].find((item) => item.id === "diagnostico")!;

  await page.goto("/diagnostico/");
  await page.getByRole("button", { name: containsText("Municipio / Entidad Pública") }).click();
  await page.getByRole("button", { name: containsText(need.label) }).click();

  const recommendation = page.getByRole("link", { name: route.cta });
  await expect(recommendation).toHaveAttribute("href", buildDiagnosticDestinationHref(profileId, route, need.label));
  await recommendation.click();
  await expect(page).toHaveURL(/\/servicios\/diagnostico-residuos\/\?perfil=municipio/);

  const serviceContact = page.getByRole("link", { name: "Solicitar diagnóstico de residuos" });
  await expect(serviceContact).toHaveAttribute("href", /perfil=municipio/);
  await expect(serviceContact).toHaveAttribute("href", /diagnostico=Caracterizar\+/);
  await expect(serviceContact).toHaveAttribute("href", /prioridad=Conocer\+/);
  await serviceContact.click();

  await expect.poll(() => new URL(page.url()).pathname).toBe("/contacto/");
  const contactUrl = new URL(page.url());
  expect(contactUrl.searchParams.get("servicio")).toBe("diagnostico-residuos");
  expect(contactUrl.searchParams.get("perfil")).toBe("municipio");
  expect(contactUrl.searchParams.get("diagnostico")).toBe(route.title);
  expect(contactUrl.searchParams.get("prioridad")).toBe(need.label);
  await expect(page.getByRole("status").first()).toContainText("Perfil seleccionado: Municipio / ESP");
  await expect(page.getByRole("status").first()).toContainText(need.label);
  await expect(page.getByLabel("Qué quieres resolver o decidir")).toHaveValue(buildDiagnosticRequestDetails(route.title, need.label, "route"));
});

test("the diagnostic wizard lets visitors revise one choice without restarting the whole flow", async ({ page }) => {
  await page.goto("/diagnostico/");
  const progress = page.getByRole("group", { name: "Paso 1 de 3: elige tu contexto" });
  await expect(progress).toBeVisible();

  await page.getByRole("button", { name: containsText("Municipio / Entidad Pública") }).click();
  await expect(page.getByRole("group", { name: "Paso 2 de 3: elige tu necesidad" })).toBeVisible();
  await page.getByRole("button", { name: containsText("Conocer la generación y las rutas posibles") }).click();
  await expect(page.getByRole("group", { name: "Paso 3 de 3: revisa tu ruta sugerida" })).toBeVisible();
  await expect(page.locator(".diagnostic-result-context")).toContainText("Municipio / Entidad Pública");
  await expect(page.locator(".diagnostic-result-context")).toContainText("Conocer la generación y las rutas posibles");

  await page.getByRole("button", { name: "Cambiar necesidad" }).click();
  await expect(page.getByRole("heading", { name: "¿Qué necesitas resolver como Municipio / Entidad Pública?" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "Caracterizar antes de dimensionar" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: containsText("Municipio / Entidad Pública") })).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: containsText("Conocer la generación y las rutas posibles") }).click();
  await page.getByRole("button", { name: "Cambiar contexto" }).last().click();
  await expect(page.getByRole("heading", { name: "¿Desde qué contexto nos consultas?" })).toBeFocused();
  await expect(page.getByRole("heading", { name: "¿Qué necesitas resolver como Municipio / Entidad Pública?" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: containsText("Municipio / Entidad Pública") })).toHaveAttribute("aria-pressed", "false");
});

test("the five profile choices keep a balanced final row across breakpoints", async ({ page }) => {
  await page.goto("/diagnostico/");
  const grid = page.locator(".profile-cards-grid");
  await expect(grid.locator(".profile-select-card")).toHaveCount(5);

  const layout = await grid.evaluate((element) => {
    const gridRect = element.getBoundingClientRect();
    const cards = Array.from(element.children, (card) => {
      const rect = card.getBoundingClientRect();
      return { left: rect.left, right: rect.right, top: rect.top, width: rect.width };
    });
    return {
      grid: { left: gridRect.left, right: gridRect.right },
      cards,
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
    };
  });

  expect(layout.documentWidth).toBeLessThanOrEqual(layout.viewportWidth);
  if (layout.viewportWidth >= 1100) {
    const finalRow = layout.cards.slice(3);
    const leftSpace = finalRow[0].left - layout.grid.left;
    const rightSpace = layout.grid.right - finalRow[1].right;
    expect(Math.abs(finalRow[0].top - finalRow[1].top)).toBeLessThan(1);
    expect(Math.abs(finalRow[0].width - finalRow[1].width)).toBeLessThan(1);
    expect(Math.abs(leftSpace - rightSpace)).toBeLessThan(2);
  } else if (layout.viewportWidth >= 769) {
    const lastCard = layout.cards[4];
    const centerOffset = Math.abs((lastCard.left + lastCard.right) / 2 - (layout.grid.left + layout.grid.right) / 2);
    expect(centerOffset).toBeLessThan(2);
  } else {
    expect(layout.cards.every((card, index) => index === 0 || card.top > layout.cards[index - 1].top)).toBe(true);
  }
});
