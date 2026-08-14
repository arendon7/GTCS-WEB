import { describe, expect, it, vi } from "vitest";
import { BackendPreflightError, runHostedBackendPreflight } from "./hosted-backend-preflight-lib.mjs";

const env = {
  NEXT_PUBLIC_SUPABASE_URL: "https://sanitized-project.supabase.co",
  SUPABASE_SECRET_KEY: "sanitized-server-secret",
};

function fakeClient(activeDirectors) {
  const directorMemberships = Array.from(
    { length: activeDirectors },
    (_, index) => ({ user_id: `director-${index + 1}` }),
  );

  return {
    rpc: vi.fn(async () => ({
      data: [{
        schema_contract: "0026",
        public_table_count: 30,
        rls_enabled_table_count: 30,
        pilot_plant_codes: ["TAM", "YAR"],
        active_directors: activeDirectors,
      }],
      error: null,
    })),
    auth: { admin: { listUsers: vi.fn(async () => ({ data: { users: [] }, error: null })) } },
    from(table) {
      if (table === "plants") {
        return {
          select() {
            return {
              async in() {
                return {
                  data: [
                    { code: "TAM", name: "Támesis", active: true },
                    { code: "YAR", name: "Yarumal", active: true },
                  ],
                  error: null,
                };
              },
            };
          },
        };
      }
      if (table === "plant_memberships") {
        return {
          select() {
            const response = { data: directorMemberships, error: null };
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

describe("hosted director post-bootstrap gate", () => {
  it("fails closed when a director is required but none exists", async () => {
    await expect(runHostedBackendPreflight({
      env,
      requireDirector: true,
      createClientImpl: () => fakeClient(0),
    })).rejects.toThrow(/No existe ningún director activo/);
  });

  it("passes when a director is required and memberships exist", async () => {
    const result = await runHostedBackendPreflight({
      env,
      requireDirector: true,
      createClientImpl: () => fakeClient(2),
    });
    expect(result.directorState).toBe("present");
    expect(result.activeDirectors).toBe(2);
  });

  it("rejects contradictory director requirements before touching the backend", async () => {
    const createClientImpl = vi.fn(() => fakeClient(0));
    await expect(runHostedBackendPreflight({
      env,
      requireDirector: true,
      requireNoDirector: true,
      createClientImpl,
    })).rejects.toBeInstanceOf(BackendPreflightError);
    expect(createClientImpl).not.toHaveBeenCalled();
  });
});
