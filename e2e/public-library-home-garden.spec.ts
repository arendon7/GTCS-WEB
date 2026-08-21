import { test, expect } from "@playwright/test";

test("central public library publishes Wondergreen PDFs without exposing private document links", async ({ page }) => {
  await page.goto("/biblioteca");

  await expect(page.getByText("Tengo plantas en casa", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /Abrir Casa & Jardín/i })).toHaveAttribute("href", "/casa-jardin");

  for (const guide of [
    "Guía Wondergreen Casa & Jardín",
    "Guía Mi Huerta",
    "Guía rápida de etapas",
    "Guía de trasplante",
  ]) {
    await expect(page.getByRole("heading", { name: guide, exact: true })).toBeVisible();
  }

  const hrefs = await page.locator("a").evaluateAll((links) => links.map((link) => link.getAttribute("href") ?? ""));
  expect(hrefs.join(" ")).not.toMatch(/sharepoint|graph\.microsoft/i);
  expect(hrefs.filter((href) => href.startsWith("/api/public-resources/wondergreen-")).length).toBe(6);

  const homeGardenCards = page.getByRole("article").filter({ hasText: "Casa & Jardín" });
  await expect(homeGardenCards.first()).toContainText(/PDF maestro pendiente/i);
});
