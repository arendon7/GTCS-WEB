import { describe, expect, it, vi } from "vitest";
import {
  RlsSmokeError,
  parseRlsSmokeConfig,
  runHostedRlsSmoke,
  validatePublishableKey,
} from "./hosted-rls-smoke-lib.mjs";

const baseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://sanitized-project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_sanitized_test_key",
  PILOT_DIRECTOR_EMAIL: "director@example.test",
  PILOT_DIRECTOR_PASSWORD: "director-test-password",
  PILOT_OPERATOR_EMAIL: "operator@example.test",
  PILOT_OPERATOR_PASSWORD: "operator-test-password",
};

function fakeJwt(payload) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.sanitized-signature`;
}

function plantQuery(visibleCodes, deniedReads) {
  return {
    select() {
      return {
        async order() {
          return {
            data: [...visibleCodes].sort().map((code) => ({ code, name: code, active: true })),
            error: null,
          };
        },
        eq(_column, code) {
          return {
            async maybeSingle() {
              deniedReads.push(code);
              return visibleCodes.includes(code)
                ? { data: { code }, error: null }
                : { data: null, error: null };
            },
          };
        },
      };
    },
  };
}

function fakeUserClient(visibleCodes) {
  const deniedReads = [];
  const signInWithPassword = vi.fn(async () => ({ data: { user: { id: "sanitized-user" } }, error: null }));
  const signOut = vi.fn(async () => ({ error: null }));
  return {
    client: {
      auth: { signInWithPassword, signOut },
      from(table) {
        if (table !== "plants") throw new Error(`Unexpected table ${table}`);
        return plantQuery(visibleCodes, deniedReads);
      },
    },
    deniedReads,
    signInWithPassword,
    signOut,
  };
}

describe("hosted multiuser RLS smoke", () => {
  it("rejects secret/service-role keys instead of accidentally bypassing RLS", () => {
    expect(() => validatePublishableKey("sb_secret_sanitized")).toThrow(RlsSmokeError);
    expect(() => validatePublishableKey(fakeJwt({ role: "service_role" }))).toThrow(/service_role/);
    expect(validatePublishableKey(fakeJwt({ role: "anon" }))).toContain(".");
  });

  it("normalizes expected plant aliases while keeping credentials out of the returned config shape used by results", () => {
    const config = parseRlsSmokeConfig({
      ...baseEnv,
      PILOT_DIRECTOR_PLANTS: "Támesis,Yarumal",
      PILOT_OPERATOR_PLANTS: "tamesis",
    });
    expect(config.directorPlants).toEqual(["TAM", "YAR"]);
    expect(config.operatorPlants).toEqual(["TAM"]);
    expect(config.publishableKey).toBe(baseEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  });

  it("certifies director TAM/YAR visibility and explicit YAR denial for a TAM-only operator", async () => {
    const director = fakeUserClient(["TAM", "YAR"]);
    const operator = fakeUserClient(["TAM"]);
    const clients = [director.client, operator.client];
    const createClientImpl = vi.fn(() => clients.shift());

    const result = await runHostedRlsSmoke({ env: baseEnv, createClientImpl });

    expect(result).toEqual({
      directorPlants: ["TAM", "YAR"],
      operatorPlants: ["TAM"],
      deniedChecks: ["YAR"],
      checks: ["director-auth", "director-visibility", "operator-auth", "operator-visibility", "explicit-denial"],
    });
    expect(operator.deniedReads).toEqual(["YAR"]);
    expect(director.signInWithPassword).toHaveBeenCalledWith({
      email: baseEnv.PILOT_DIRECTOR_EMAIL,
      password: baseEnv.PILOT_DIRECTOR_PASSWORD,
    });
    expect(operator.signInWithPassword).toHaveBeenCalledWith({
      email: baseEnv.PILOT_OPERATOR_EMAIL,
      password: baseEnv.PILOT_OPERATOR_PASSWORD,
    });
    expect(director.signOut).toHaveBeenCalledOnce();
    expect(operator.signOut).toHaveBeenCalledOnce();
  });

  it("fails closed if the operator can see YAR", async () => {
    const director = fakeUserClient(["TAM", "YAR"]);
    const operator = fakeUserClient(["TAM", "YAR"]);
    const clients = [director.client, operator.client];

    await expect(runHostedRlsSmoke({
      env: baseEnv,
      createClientImpl: () => clients.shift(),
    })).rejects.toThrow(/Visibilidad RLS inesperada para operario/);

    expect(director.signOut).toHaveBeenCalledOnce();
    expect(operator.signOut).toHaveBeenCalledOnce();
  });

  it("fails closed if the director cannot see all expected pilot plants", async () => {
    const director = fakeUserClient(["TAM"]);
    const operator = fakeUserClient(["TAM"]);
    const clients = [director.client, operator.client];

    await expect(runHostedRlsSmoke({
      env: baseEnv,
      createClientImpl: () => clients.shift(),
    })).rejects.toThrow(/Visibilidad RLS inesperada para director/);

    expect(director.signOut).toHaveBeenCalledOnce();
    expect(operator.signOut).not.toHaveBeenCalled();
  });
});
