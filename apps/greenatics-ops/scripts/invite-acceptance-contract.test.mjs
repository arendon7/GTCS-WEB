import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

async function source(relativePath) {
  return readFile(new URL(relativePath, import.meta.url), "utf8");
}

describe("hosted invitation contract", () => {
  it("routes Director and managed-user invitations through the public acceptance bridge", async () => {
    const bootstrap = await source("./bootstrap-director.mjs");
    const bootstrapAdmin = await source("./bootstrap-admin.mjs");
    const adminRoute = await source("../src/app/api/admin/users/route.ts");
    expect(bootstrap).toContain("/auth/accept-invite");
    expect(bootstrapAdmin).toContain("/auth/accept-invite");
    expect(adminRoute).toContain("INVITE_ACCEPTANCE_PATH");
    expect(bootstrap).not.toContain("redirectTo: `${baseUrl}/account/setup`");
    expect(adminRoute).not.toContain("redirectTo: `${baseUrl}/account/setup`");
  });

  it("grants OPS explicitly during each bootstrap path", async () => {
    const bootstrap = await source("./bootstrap-director.mjs");
    const bootstrapAdmin = await source("./bootstrap-admin.mjs");
    for (const script of [bootstrap, bootstrapAdmin]) {
      expect(script).toContain('from("application_access")');
      expect(script).toContain('app_code: "ops"');
      expect(script).toContain('onConflict: "user_id,app_code"');
    }
  });

  it("keeps auth routes public from the proxy but private from caches and indexing", async () => {
    const proxy = await source("../src/proxy.ts");
    const headers = await source("../src/lib/http-security.ts");
    expect(proxy).not.toContain('"/auth/:path*"');
    expect(headers).toContain('"/auth"');
  });

  it("scrubs the browser URL before leaving invite acceptance", async () => {
    const page = await source("../src/app/auth/accept-invite/page.tsx");
    const contract = await source("../src/lib/invite-acceptance.ts");
    expect(page).toContain("window.history.replaceState");
    expect(contract.indexOf("scrubUrl();")).toBeLessThan(contract.indexOf("replaceLocation(target);"));
    expect(contract).not.toContain("access_token");
    expect(contract).not.toContain("refresh_token");
  });
});
