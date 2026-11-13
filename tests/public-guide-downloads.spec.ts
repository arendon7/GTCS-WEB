import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { expect, test } from "@playwright/test";

const files = ["guia-rapida-etapas.pdf"];
const digest = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");

for (const filename of files) {
  test(`public guide ${filename} downloads the exact PDF promised by its card`, async ({ page, request }) => {
    await page.goto("/casa-jardin/guias/");
    const href = `/downloads/${filename}`;
    const link = page.locator(`.homegarden-guide-card a[download][href="${href}"]`);
    await expect(link).toHaveCount(1);
    const response = await request.get(href);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    const bytes = await response.body();
    expect(bytes.subarray(0, 5).toString()).toBe("%PDF-");
    expect(bytes.subarray(-1024).toString()).toContain("%%EOF");
    const source = fs.readFileSync(path.join(process.cwd(), "public", "downloads", filename));
    expect(digest(bytes)).toBe(digest(source));
    const pending = page.waitForEvent("download");
    await link.click();
    const download = await pending;
    expect(download.suggestedFilename()).toBe(filename);
    expect(await download.failure()).toBeNull();
    const saved = await download.path();
    expect(saved).not.toBeNull();
    expect(digest(fs.readFileSync(saved!))).toBe(digest(source));
  });
}

test("Mi Huerta uses its web guide instead of distributing the unreconciled PDF", async ({ page }) => {
  for (const route of ["/casa-jardin/guias/", "/casa-jardin/kits/mi-huerta/", "/casa-jardin/productos/fructifica/", "/biblioteca/"]) {
    await page.goto(route);
    await expect(page.locator('a[href="/downloads/guia-mi-huerta.pdf"]')).toHaveCount(0);
  }
  await page.goto("/casa-jardin/kits/mi-huerta/");
  const guide = page.getByRole("link", { name: "Consultar Guía Mi Huerta", exact: true });
  await expect(guide).not.toHaveAttribute("download");
  await guide.click();
  await expect(page).toHaveURL(/\/biblioteca\/huertas\//);
  await expect(page.locator("h1")).toBeVisible();
});
