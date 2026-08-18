import { describe, expect, it } from "vitest";
import { HostedPlanningSmokeError, parseHostedPlanningSmokeConfig } from "./hosted-planning-smoke-lib.mjs";

const baseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://sanitized-project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_sanitized_test_key",
  SUPABASE_SECRET_KEY: "sb_secret_sanitized_admin_key",
  PILOT_DIRECTOR_EMAIL: "director@example.test",
  PILOT_DIRECTOR_PASSWORD: "director-test-password",
  PILOT_OPERATOR_EMAIL: "operator@example.test",
  PILOT_OPERATOR_PASSWORD: "operator-test-password",
};

describe("hosted planning smoke", () => {
  it("parses isolated hosted credentials and defaults the write smoke to TAM", () => {
    const config = parseHostedPlanningSmokeConfig(baseEnv);
    expect(config.url).toBe("https://sanitized-project.supabase.co");
    expect(config.plantCode).toBe("TAM");
    expect(config.director.email).toBe("director@example.test");
    expect(config.operator.email).toBe("operator@example.test");
  });

  it("normalizes a configured pilot plant alias", () => {
    const config = parseHostedPlanningSmokeConfig({ ...baseEnv, PILOT_PLANNING_PLANT: "Támesis" });
    expect(config.plantCode).toBe("TAM");
  });

  it("fails closed when the user-facing key is actually secret", () => {
    expect(() => parseHostedPlanningSmokeConfig({
      ...baseEnv,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_should_never_be_used_as_public",
    })).toThrow(HostedPlanningSmokeError);
  });

  it("requires distinct director and operator identities", () => {
    expect(() => parseHostedPlanningSmokeConfig({
      ...baseEnv,
      PILOT_OPERATOR_EMAIL: baseEnv.PILOT_DIRECTOR_EMAIL,
    })).toThrow(/usuarios distintos/);
  });

  it("rejects non-origin or non-HTTPS Supabase URLs", () => {
    expect(() => parseHostedPlanningSmokeConfig({ ...baseEnv, NEXT_PUBLIC_SUPABASE_URL: "http://sanitized-project.supabase.co" })).toThrow(HostedPlanningSmokeError);
    expect(() => parseHostedPlanningSmokeConfig({ ...baseEnv, NEXT_PUBLIC_SUPABASE_URL: "https://sanitized-project.supabase.co/rest/v1" })).toThrow(HostedPlanningSmokeError);
  });
});
