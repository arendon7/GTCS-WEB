import { test, expect } from "@playwright/test";

const storageKey = "greenatics-ops-mvp-001";

const openIncident = {
  id: "incident-open-history",
  plantId: "tamesis",
  plant: "Támesis",
  title: "Temperatura fuera de rango",
  detail: "La lectura requiere verificación operacional.",
  severity: "medium",
  openedAt: "2026-08-26T08:00:00-05:00",
  status: "open",
};

const closedIncident = {
  id: "incident-closed-history",
  activityId: "activity-history-link",
  plantId: "yarumal",
  plant: "Yarumal",
  title: "Obstrucción en línea",
  detail: "Se detectó restricción durante la operación.",
  severity: "high",
  openedAt: "2026-08-25T09:00:00-05:00",
  closedAt: "2026-08-25T10:30:00-05:00",
  resolutionNote: "Se retiró la obstrucción y se verificó el flujo normal.",
  status: "closed",
};

test("incident history exposes open and resolved records with governed filters", async ({ page }) => {
  await page.addInitScript(({ key, incidents }) => {
    window.localStorage.setItem(key, JSON.stringify({ incidents }));
  }, { key: storageKey, incidents: [openIncident, closedIncident] });

  await page.goto("/incidents");

  await expect(page.getByRole("heading", { name: "Incidentes y excepciones", exact: true })).toBeVisible();
  await expect(page.getByText("Temperatura fuera de rango", { exact: true })).toBeVisible();
  await expect(page.getByText("Obstrucción en línea", { exact: true })).toBeVisible();
  await expect(page.getByText("Se retiró la obstrucción y se verificó el flujo normal.", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Alertas", exact: true })).toHaveAttribute("href", "/incidents");
  await expect(page.getByRole("link", { name: "Ver actividad relacionada", exact: true })).toHaveAttribute("href", "/activities/activity-history-link");

  await page.getByLabel("Filtrar por estado").selectOption("closed");
  await expect(page.getByText("Temperatura fuera de rango", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Obstrucción en línea", { exact: true })).toBeVisible();

  await page.getByLabel("Filtrar por planta").selectOption("tamesis");
  await expect(page.getByText("Obstrucción en línea", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Sin incidentes para estos filtros", { exact: true })).toBeVisible();
});

test("resolved incident leaves Today attention and remains visible in history", async ({ page }) => {
  await page.addInitScript(({ key, incident }) => {
    window.localStorage.setItem(key, JSON.stringify({ incidents: [incident] }));
  }, { key: storageKey, incident: openIncident });

  await page.goto("/app");
  const incident = page.locator('[data-incident-id="incident-open-history"]');
  await expect(incident).toBeVisible();
  await incident.getByRole("button", { name: "Resolver", exact: true }).click();
  await incident.getByLabel("Cómo se resolvió", { exact: true }).fill("Se verificó el proceso y la lectura regresó al rango esperado.");
  await incident.getByRole("button", { name: "Confirmar resolución", exact: true }).click();
  await expect(page.locator('[data-incident-id="incident-open-history"]')).toHaveCount(0);

  await page.getByRole("link", { name: "Ver historial", exact: true }).click();
  await expect(page).toHaveURL(/\/incidents$/);
  await expect(page.getByText("Temperatura fuera de rango", { exact: true })).toBeVisible();
  await expect(page.getByText("Se verificó el proceso y la lectura regresó al rango esperado.", { exact: true })).toBeVisible();
  await expect(page.getByText("Resuelto", { exact: true })).toBeVisible();
});
