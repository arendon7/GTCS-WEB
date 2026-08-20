import { test, expect } from "@playwright/test";

test("central public library integrates Casa Jardin without exposing private document links", async ({ page }) => {
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
  expect(hrefs.filter((href) => /\.pdf(?:$|\?)/i.test(href))).toHaveLength(0);

  await expect(page.getByText(/PDF maestro identificado · descarga pública en preparación/i).first()).toBeVisible();
});
