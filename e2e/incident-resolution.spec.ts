import { test, expect } from "@playwright/test";

test("Today resolves an incident deliberately in local mode", async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem("greenatics-ops-mvp-001", JSON.stringify({
      incidents: [{
        id: "incident-resolution-e2e",
        plantId: "tamesis",
        plant: "Támesis",
        title: "Novedad E2E pendiente",
        detail: "Verificación controlada del ciclo de resolución.",
        severity: "medium",
        openedAt: "2026-08-26T20:00:00-05:00",
        status: "open",
      }],
    }));
  });

  await page.goto("/app");

  const incident = page.locator('[data-incident-id="incident-resolution-e2e"]');
  await expect(incident).toBeVisible();
  await incident.getByRole("button", { name: "Resolver", exact: true }).click();
  await incident.getByLabel("Cómo se resolvió", { exact: true }).fill("Se verificó la causa y la operación quedó normalizada.");
  await incident.getByRole("button", { name: "Confirmar resolución", exact: true }).click();

  await expect(page.locator('[data-incident-id="incident-resolution-e2e"]')).toHaveCount(0);
  await expect(page.getByText("Novedad E2E pendiente", { exact: true })).toHaveCount(0);
});
