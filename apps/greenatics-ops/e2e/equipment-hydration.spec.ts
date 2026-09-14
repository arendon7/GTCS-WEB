import { expect, test } from "@playwright/test";

const hydrationPattern = /hydration|server rendered html|did not match/i;

test("equipment detail hydrates deterministically when client and server clocks differ", async ({ page }) => {
  const hydrationErrors: string[] = [];

  page.on("console", (message) => {
    if (message.type() === "error" && hydrationPattern.test(message.text())) {
      hydrationErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => {
    if (hydrationPattern.test(error.message)) hydrationErrors.push(error.message);
  });

  // The seed ticket mnt-001 is open for eq-tam-bp01. Freezing only the browser
  // clock far from the server clock makes any render-time Date dependency visible
  // as a hydration mismatch without relying on timing races.
  await page.clock.setFixedTime(new Date("2030-01-15T15:00:00.000Z"));
  await page.goto("/equipment/eq-tam-bp01");

  await expect(page.getByRole("heading", { name: "BP-01 · Bomba peristáltica" })).toBeVisible();
  await expect(page.getByText("Obstrucción recurrente", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Fuera de servicio", { exact: true })).toBeVisible();

  // React reports hydration mismatches during/just after hydration. Yield once so
  // console/pageerror listeners capture the diagnostic before asserting.
  await page.waitForTimeout(100);

  expect(hydrationErrors, hydrationErrors.join("\n\n")).toEqual([]);
});
