import { test, expect } from "@playwright/test";

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

test("OPS responses are non-indexable and non-cacheable", async ({ request }) => {
  const response = await request.get("/app");
  expect(response.ok()).toBe(true);
  const headers = response.headers();

  expect(headers["x-robots-tag"]).toBe("noindex, nofollow, noarchive");
  expect(headers["cache-control"]).toContain("no-store");
  expect(headers["pragma"]).toBe("no-cache");
});

test("login is also private and excluded from indexing", async ({ request }) => {
  const response = await request.get("/login");
  expect(response.ok()).toBe(true);
  const headers = response.headers();

  expect(headers["x-robots-tag"]).toBe("noindex, nofollow, noarchive");
  expect(headers["cache-control"]).toContain("no-store");
});
