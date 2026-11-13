import { expect, test } from "@playwright/test";

const expectedHuellaOrigin = new URL(
  process.env.NEXT_PUBLIC_HUELLA_APP_URL || "https://greenatics-huella-staging.onrender.com",
).origin;

for (const route of ["/huella/", "/herramientas/", "/acceso/"]) {
  test(`${route} exposes the configured Back 2 Green login and public landing`, async ({ page }) => {
    test.skip(
      process.env.PLAYWRIGHT_EXPECT_HUELLA_STAGING_LINK !== "true",
      "Run against the explicit Sites Preview export with the staging URL configured.",
    );

    await page.goto(route, { waitUntil: "networkidle" });
    const entry = page.getByRole("link", {
      name: route === "/huella/" ? "Abrir Back 2 Green" : "Entrar a Back 2 Green",
    });

    await expect(entry).toHaveAttribute("href", `${expectedHuellaOrigin}/login`);
    await expect(entry).toHaveAttribute("target", "_blank");
    await expect(entry).toHaveAttribute("rel", /noopener noreferrer/);

    if (route === "/herramientas/") {
      await expect(page.getByRole("link", { name: /Ver plataforma y planes/ })).toHaveAttribute("href", "/huella/");
    }

    if (route === "/acceso/") {
      const accessRow = page.locator("#calcula-tu-huella");
      await expect(accessRow.getByRole("link", { name: "Ver planes y recorrido" })).toHaveAttribute("href", "/huella/");
      await expect(accessRow.getByRole("link", { name: /Solicitar demo guiada/ })).toHaveAttribute("href", "/contacto/?interes=calcula-tu-huella");
    }
  });
}
