import { test, expect } from "@playwright/test";

function expectDevelopmentNonCacheable(cacheControl: string | undefined) {
  expect(cacheControl).toBeTruthy();
  expect(cacheControl).toMatch(/no-store|no-cache/);
}

test("public responses expose baseline security headers without internal noindex", async ({ request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);
  const headers = response.headers();

  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["x-robots-tag"]).toBeUndefined();
});

test("OPS responses are non-indexable and non-cacheable in the development E2E server", async ({ request }) => {
  const response = await request.get("/app");
  expect(response.ok()).toBe(true);
  const headers = response.headers();

  expect(headers["x-robots-tag"]).toBe("noindex, nofollow, noarchive");
  expectDevelopmentNonCacheable(headers["cache-control"]);
  expect(headers["pragma"]).toBe("no-cache");
});

test("login is private and excluded from indexing in the development E2E server", async ({ request }) => {
  const response = await request.get("/login");
  expect(response.ok()).toBe(true);
  const headers = response.headers();

  expect(headers["x-robots-tag"]).toBe("noindex, nofollow, noarchive");
  expectDevelopmentNonCacheable(headers["cache-control"]);
});

test("HOME content CTA crosses the public-to-OPS document boundary", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Entrar a GREENATICS OPS" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
});
