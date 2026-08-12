import { describe, expect, it } from "vitest";
import { getOpsAccessMode, isLocalOpsBypassAllowed, isProtectedOpsPath } from "./ops-access-policy";

const base = {
  NODE_ENV: "production",
  VERCEL_ENV: undefined,
  NEXT_PUBLIC_DATA_MODE: "local",
  NEXT_PUBLIC_SUPABASE_URL: undefined,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: undefined,
  GREENATICS_OPS_LOCAL_BYPASS: undefined,
} as NodeJS.ProcessEnv;

describe("OPS access policy", () => {
  it("recognizes every protected route family without swallowing public routes", () => {
    for (const path of ["/app", "/activities/new", "/compost/abc", "/dashboard", "/receptions/new", "/sales", "/supplies/consume"]) {
      expect(isProtectedOpsPath(path)).toBe(true);
    }
    for (const path of ["/", "/wondergreen", "/soluciones", "/proyectos/yarumal", "/contacto", "/login"]) {
      expect(isProtectedOpsPath(path)).toBe(false);
    }
  });

  it("allows local OPS automatically only outside production", () => {
    expect(isLocalOpsBypassAllowed({ ...base, NODE_ENV: "development" })).toBe(true);
    expect(isLocalOpsBypassAllowed({ ...base, NODE_ENV: "test" })).toBe(true);
    expect(isLocalOpsBypassAllowed(base)).toBe(false);
  });

  it("can explicitly allow a local production-runtime demo only off Vercel", () => {
    expect(isLocalOpsBypassAllowed({ ...base, GREENATICS_OPS_LOCAL_BYPASS: "true" })).toBe(true);
    expect(isLocalOpsBypassAllowed({ ...base, GREENATICS_OPS_LOCAL_BYPASS: "true", VERCEL_ENV: "preview" })).toBe(false);
    expect(isLocalOpsBypassAllowed({ ...base, GREENATICS_OPS_LOCAL_BYPASS: "true", VERCEL_ENV: "production" })).toBe(false);
  });

  it("blocks production when remote auth is not configured", () => {
    expect(getOpsAccessMode(base)).toBe("configuration-block");
    expect(getOpsAccessMode({ ...base, NEXT_PUBLIC_DATA_MODE: "supabase" })).toBe("configuration-block");
  });

  it("requires Supabase auth when production remote configuration is complete", () => {
    expect(getOpsAccessMode({
      ...base,
      NEXT_PUBLIC_DATA_MODE: "supabase",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    })).toBe("supabase-auth");
  });

  it("never treats supabase mode as a local bypass", () => {
    expect(isLocalOpsBypassAllowed({
      ...base,
      NODE_ENV: "development",
      NEXT_PUBLIC_DATA_MODE: "supabase",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    })).toBe(false);
  });
});
