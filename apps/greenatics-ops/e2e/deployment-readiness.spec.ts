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

test("health exposes only safe deployment provenance and the canonical public origin", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  const body = await response.json() as {
    status: string;
    mode: string;
    opsAccess: string;
    publicOrigin: string;
    deployment: { platform: string; environment: string; branch: string | null; commit: string | null };
  };

  expect(body.status).toBe("ready");
  expect(body.mode).toBe("local");
  expect(body.opsAccess).toBe("local-bypass");
  expect(body.publicOrigin).toBe("https://greenatics.com.co");
  expect(body.deployment.platform).toBe("generic");
  expect(Object.keys(body.deployment).sort()).toEqual(["branch", "commit", "environment", "platform"]);
  expect(body.deployment.branch).toBeNull();
  expect(body.deployment.commit).toBeNull();
});

test("HOME content CTA crosses the public-to-OPS document boundary with an explicit product name", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("main").getByRole("link", { name: "Ingresar a GREENATICS OPS", exact: true }).click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(page.getByRole("heading", { name: "Operación de hoy" })).toBeVisible();
});
