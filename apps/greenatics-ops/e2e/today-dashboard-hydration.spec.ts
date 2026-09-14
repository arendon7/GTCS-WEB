import { expect, test } from "@playwright/test";

const hydrationPattern = /hydration|server rendered html|did not match/i;

test("OPS home hydrates deterministically when browser and server clocks differ", async ({ page }) => {
  const hydrationErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error" && hydrationPattern.test(message.text())) {
      hydrationErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (hydrationPattern.test(error.message)) hydrationErrors.push(error.message);
  });

  // Freeze only the browser clock far from the server clock. TodayDashboard
  // currently derives its first client render from new Date(), so any temporal
  // dependency that is not serialized from the server becomes deterministic.
  await page.clock.setFixedTime(new Date("2030-01-15T15:00:00.000Z"));
  await page.goto("/app");

  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Indicadores de hoy" })).toBeVisible();
  await expect(page.getByText("Horas-hombre", { exact: true })).toBeVisible();

  // React reports hydration mismatches during or immediately after hydration.
  // Yield once so console/pageerror listeners capture the diagnostic.
  await page.waitForTimeout(100);

  expect(hydrationErrors, hydrationErrors.join("\n\n")).toEqual([]);
});
