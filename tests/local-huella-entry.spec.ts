import { expect, test } from "@playwright/test";

for (const hub of [
  { path: "/acceso/", container: ".access-v4-environment" },
  { path: "/herramientas/", container: ".digital-v4-platforms article" },
]) {
  test(`${hub.path} opens the real local Huella login and keeps its landing visible`, async ({ page }) => {
    test.skip(process.env.PLAYWRIGHT_EXPECT_LOCAL_HUELLA !== "true", "Requires the local Huella runtime preview.");

    await page.goto(hub.path, { waitUntil: "networkidle" });
    const row = page.locator(hub.container).filter({ hasText: "Back 2 Green" });
    const entry = row.getByRole("link", { name: "Entrar a Back 2 Green" });

    await expect(entry).toHaveAttribute("href", "http://127.0.0.1:8765/login");
    await expect(row.getByRole("link", { name: /Ver plataforma y planes/ })).toHaveAttribute("href", "/huella/");
    const appPagePromise = page.waitForEvent("popup");
    await entry.click();
    const appPage = await appPagePromise;
    await expect(appPage).toHaveURL("http://127.0.0.1:8765/login");
    await expect(appPage.getByRole("heading", { name: "Bienvenido" })).toBeVisible();
    await expect(appPage.getByRole("textbox", { name: "Correo electrónico" })).toBeVisible();
    await expect(appPage.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
  });
}
