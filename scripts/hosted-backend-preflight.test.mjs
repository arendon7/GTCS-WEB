import { describe, expect, it, vi } from "vitest";
import {
  BackendPreflightError,
  HOSTED_SCHEMA_CONTRACT_VERSION,
  normalizeHostedSupabaseUrl,
  runHostedBackendPreflight,
} from "./hosted-backend-preflight-lib.mjs";
import { normalizePilotPlantCodes } from "./pilot-plant-codes.mjs";

const env = {
  NEXT_PUBLIC_SUPABASE_URL: "https://sanitized-project.supabase.co",
  SUPABASE_SECRET_KEY: "sanitized-server-secret",
};

function schemaContract(overrides = {}) {
  return {
    schema_contract: HOSTED_SCHEMA_CONTRACT_VERSION,
    public_table_count: 30,
    rls_enabled_table_count: 30,
    pilot_plant_codes: ["TAM", "YAR"],
    active_directors: 0,
    ...overrides,
  };
}

function fakeClient({
  plants = [
    { code: "TAM", name: "Támesis", active: true },
    { code: "YAR", name: "Yarumal", active: true },
  ],
  activeDirectors = 0,
  authError = null,
  contract = null,
  schemaError = null,
} = {}) {
  const effectiveContract = contract ?? schemaContract({ active_directors: activeDirectors });
  return {
    rpc: vi.fn(async (name) => {
      if (name !== "admin_hosted_schema_contract") throw new Error(`Unexpected RPC ${name}`);
      return { data: schemaError ? null : [effectiveContract], error: schemaError };
    }),
    auth: {
      admin: {
        listUsers: vi.fn(async () => ({ data: { users: [] }, error: authError })),
      },
    },
    from(table) {
      if (table === "plants") {
        return {
          select() {
            return {
              async in(_column, codes) {
                return { data: plants.filter((plant) => codes.includes(plant.code)), error: null };
              },
            };
          },
        };
      }
      if (table === "plant_memberships") {
        return {
          select() {
            const response = { data: null, count: activeDirectors, error: null };
            const chain = {
              eq() { return chain; },
              then(resolve, reject) { return Promise.resolve(response).then(resolve, reject); },
            };
            return chain;
          },
        };
      }
      throw new Error(`Unexpected table ${table}`);
    },
  };
}

describe("hosted backend preflight", () => {
  it("normalizes canonical plant codes and human aliases", () => {
    expect(normalizePilotPlantCodes("Támesis,Yarumal")).toEqual(["TAM", "YAR"]);
    expect(normalizePilotPlantCodes("tam,YAR")).toEqual(["TAM", "YAR"]);
    expect(() => normalizePilotPlantCodes("TAM,Támesis")).toThrow(/dos veces/);
  });

  it("accepts only a clean HTTPS Supabase origin", () => {
    expect(normalizeHostedSupabaseUrl(env.NEXT_PUBLIC_SUPABASE_URL)).toBe(env.NEXT_PUBLIC_SUPABASE_URL);
    expect(() => normalizeHostedSupabaseUrl("http://sanitized-project.supabase.co")).toThrow(BackendPreflightError);
    expect(() => normalizeHostedSupabaseUrl("https://sanitized-project.supabase.co/rest/v1")).toThrow(BackendPreflightError);
  });

  it("passes without mutating data when schema, backend, auth and pilot plants are ready", async () => {
    const createClientImpl = vi.fn(() => fakeClient());
    const result = await runHostedBackendPreflight({
      env,
      plants: "tamesis,yar",
      requireNoDirector: true,
      createClientImpl,
    });

    expect(result.schemaContract.version).toBe(HOSTED_SCHEMA_CONTRACT_VERSION);
    expect(result.schemaContract.publicTableCount).toBe(30);
    expect(result.schemaContract.rlsEnabledTableCount).toBe(30);
    expect(result.plants.map((plant) => plant.code)).toEqual(["TAM", "YAR"]);
    expect(result.activeDirectors).toBe(0);
    expect(result.directorState).toBe("empty");
    expect(result.checks).toContain("schema-contract");
    expect(result).not.toHaveProperty("secret");
    expect(createClientImpl).toHaveBeenCalledWith(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SECRET_KEY,
      expect.any(Object),
    );
  });

  it("fails closed when the hosted database is behind the canonical schema contract", async () => {
    await expect(runHostedBackendPreflight({
      env,
      createClientImpl: () => fakeClient({
        contract: schemaContract({ schema_contract: "0025" }),
      }),
    })).rejects.toThrow(/desactualizado.*0026.*0025/);
  });

  it("fails closed when any public table escapes RLS", async () => {
    await expect(runHostedBackendPreflight({
      env,
      createClientImpl: () => fakeClient({
        contract: schemaContract({ public_table_count: 30, rls_enabled_table_count: 29 }),
      }),
    })).rejects.toThrow(/RLS incompleto \(29\/30/);
  });

  it("fails closed when a requested plant is missing or inactive", async () => {
    await expect(runHostedBackendPreflight({
      env,
      createClientImpl: () => fakeClient({ plants: [{ code: "TAM", name: "Támesis", active: true }] }),
    })).rejects.toThrow(/YAR/);

    await expect(runHostedBackendPreflight({
      env,
      createClientImpl: () => fakeClient({
        plants: [
          { code: "TAM", name: "Támesis", active: false },
          { code: "YAR", name: "Yarumal", active: true },
        ],
      }),
    })).rejects.toThrow(/inactivas/);
  });

  it("can require a pristine bootstrap state without creating or deleting users", async () => {
    await expect(runHostedBackendPreflight({
      env,
      requireNoDirector: true,
      createClientImpl: () => fakeClient({ activeDirectors: 1 }),
    })).rejects.toThrow(/Ya existe 1 director activo/);
  });

  it("fails closed if director state changes while the preflight is running", async () => {
    await expect(runHostedBackendPreflight({
      env,
      createClientImpl: () => fakeClient({
        activeDirectors: 1,
        contract: schemaContract({ active_directors: 0 }),
      }),
    })).rejects.toThrow(/cambió durante el preflight/);
  });
});
