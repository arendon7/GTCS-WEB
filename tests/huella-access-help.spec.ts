import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL;
const qaEmail = "admin-recovery-qa@calculatuhuella.local";
const qaPassword = "AdminRecoveryQASafe2026!";

test.skip(!baseUrl, "Set PLAYWRIGHT_BASE_URL to an isolated local runtime without demo seed.");

test("real-account access help and manual explain the supported recovery path", async ({ page }) => {
  const target = new URL(baseUrl!);
  expect(["127.0.0.1", "localhost", "::1"]).toContain(target.hostname);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  const loginResponse = await page.goto(new URL("/login", target).toString());
  expect(loginResponse?.status()).toBe(200);
  await expect(page.locator("#login-access-help-title")).toBeVisible();
  await expect(page.getByText("En esta versión no hay recuperación automática por correo.")).toBeVisible();
  await expect(page.getByText("Demo2026!", { exact: false })).toHaveCount(0);

  const loginA11y = await new AxeBuilder({ page }).analyze();
  expect(loginA11y.violations.map(({ id }) => id)).toEqual([]);
  const initialWidth = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(initialWidth.document).toBeLessThanOrEqual(initialWidth.viewport);

  await page.locator("#login-email").fill(qaEmail);
  await page.locator("#login-password").fill(qaPassword);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/inventarios\/nuevo$/);

  await page.goto(new URL("/guia#dudas", target).toString());
  await expect(page.getByRole("heading", { name: "Tu inventario, paso a paso" })).toBeVisible();
  const recovery = page.locator("#dudas details").filter({ hasText: "Olvidé mi contraseña o no puedo ingresar" });
  await expect(recovery).toBeVisible();
  await recovery.locator("summary").click();
  await expect(recovery.getByRole("link", { name: "Ir a Organización y usuarios" })).toHaveAttribute("href", "/usuarios");

  const guideA11y = await new AxeBuilder({ page }).analyze();
  expect(guideA11y.violations.map(({ id }) => id)).toEqual([]);
  const finalWidth = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
  }));
  expect(finalWidth.document).toBeLessThanOrEqual(finalWidth.viewport);
  expect(errors).toEqual([]);
});
