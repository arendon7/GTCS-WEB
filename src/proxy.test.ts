import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { config, proxy } from "./proxy";

afterEach(() => {
  vi.unstubAllEnvs();
});

function request(pathname: string) {
  return new NextRequest(`https://greenatics.com.co${pathname}`);
}

describe("OPS request boundary", () => {
  it("keeps public routes outside the auth boundary", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "local");

    const response = await proxy(request("/wondergreen"));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("keeps local OPS available during development", async () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "local");

    const response = await proxy(request("/app"));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });

  it("blocks production OPS when remote auth is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "local");

    const response = await proxy(request("/app"));
    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.status).toBeLessThan(400);
    expect(response.headers.get("location")).toContain("/login?reason=configuration");
    expect(response.headers.get("location")).toContain("next=%2Fapp");
  });

  it("protects account and administration through the same boundary", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "local");

    const response = await proxy(request("/admin/users"));
    expect(response.headers.get("location")).toContain("/login?reason=configuration");
    expect(config.matcher).toContain("/admin/:path*");
    expect(config.matcher).toContain("/account/:path*");
  });

  it("blocks deployed previews even if a local bypass flag is present", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "local");
    vi.stubEnv("GREENATICS_OPS_LOCAL_BYPASS", "true");

    const response = await proxy(request("/dashboard"));
    expect(response.headers.get("location")).toContain("/login?reason=configuration");
  });

  it("leaves the login screen reachable when remote configuration is missing", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_DATA_MODE", "local");

    const response = await proxy(request("/login"));
    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
  });
});
