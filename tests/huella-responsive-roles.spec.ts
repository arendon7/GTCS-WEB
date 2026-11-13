import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL;
const profiles = [
  ["Administración", "admin@calculatuhuella.local"],
  ["Consultoría", "consultor@calculatuhuella.local"],
  ["Cliente", "cliente@calculatuhuella.local"],
  ["Revisión", "revisor@calculatuhuella.local"],
  ["Verificación", "verificador@calculatuhuella.local"],
] as const;

test.skip(!baseUrl, "Set PLAYWRIGHT_BASE_URL to an isolated local demo runtime.");

for (const [profile, email] of profiles) {
  test(`${profile} dashboard is accessible and responsive`, async ({ page }) => {
    const target = new URL(baseUrl!);
    expect(["127.0.0.1", "localhost", "::1"]).toContain(target.hostname);

    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });

    const loginResponse = await page.goto(new URL("/login", target).toString());
    expect(loginResponse?.status()).toBe(200);
    await page.locator("#login-email").fill(email);
    await page.locator("#login-password").fill("Demo2026!");
    await page.getByRole("button", { name: "Iniciar sesión" }).click();
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("#sidebar")).toHaveAttribute("aria-label", "Menú de la plataforma");

    const firstFocus = page.keyboard.press("Tab").then(() =>
      page.evaluate(() => document.activeElement?.textContent?.trim()),
    );
    await expect(firstFocus).resolves.toContain("Saltar al contenido");

    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport);

    if (email.startsWith("verificador@")) {
      await expect(page).toHaveURL(/\/verificacion$/);
      await expect(page.locator(".verification-side")).toHaveAttribute(
        "aria-label",
        "Acciones y documentos de verificación",
      );
      if ((page.viewportSize()?.width ?? 1440) < 1100) {
        const table = page.locator(".verification-layout .table-wrap");
        const widths = await table.evaluate((element) => ({
          client: element.clientWidth,
          scroll: element.scrollWidth,
        }));
        expect(widths.scroll).toBeGreaterThan(widths.client);
      }
    } else {
      await expect(page).toHaveURL(/\/dashboard$/);
    }

    const accessibility = await new AxeBuilder({ page }).analyze();
    expect(accessibility.violations.map(({ id, impact }) => ({ id, impact }))).toEqual([]);
    expect(errors).toEqual([]);
  });
}
