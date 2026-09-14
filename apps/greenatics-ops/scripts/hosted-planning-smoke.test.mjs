import { describe, expect, it, vi } from "vitest";
import {
  HostedPlanningSmokeError,
  parseHostedPlanningSmokeConfig,
  runHostedPlanningSmoke,
} from "./hosted-planning-smoke-lib.mjs";

const baseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: "https://sanitized-project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_sanitized_test_key",
  SUPABASE_SECRET_KEY: "sb_secret_sanitized_admin_key",
  PILOT_DIRECTOR_EMAIL: "director@example.test",
  PILOT_DIRECTOR_PASSWORD: "director-test-password",
  PILOT_OPERATOR_EMAIL: "operator@example.test",
  PILOT_OPERATOR_PASSWORD: "operator-test-password",
};

function fakeJwt(payload) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.sanitized-signature`;
}

class FakeQuery {
  constructor(client, table, operation = "select") {
    this.client = client;
    this.table = table;
    this.operation = operation;
    this.filters = [];
  }

  select() { return this; }
  delete() { this.operation = "delete"; return this; }
  eq(column, value) { this.filters.push(["eq", column, value]); return this; }
  is(column, value) { this.filters.push(["is", column, value]); return this; }
  in(column, values) { this.filters.push(["in", column, values]); return this; }
  order() { return this; }
  maybeSingle() { return Promise.resolve(this.client.resolveQuery(this, true)); }
  then(resolve, reject) { return Promise.resolve(this.client.resolveQuery(this, false)).then(resolve, reject); }
}

function filterValue(query, column) {
  return query.filters.find(([, key]) => key === column)?.[2];
}

function fakeHostedClients({ failFinish = false } = {}) {
  const state = {
    schedule: null,
    activity: null,
    deletedActivities: [],
    deletedSchedules: [],
  };

  function makeClient(role) {
    const signInWithPassword = vi.fn(async () => ({ data: { user: { id: `${role}-user` } }, error: null }));
    const signOut = vi.fn(async () => ({ error: null }));
    const client = {
      role,
      auth: { signInWithPassword, signOut },
      from(table) { return new FakeQuery(client, table); },
      resolveQuery(query, single) {
        if (query.operation === "delete") {
          const id = filterValue(query, "id");
          if (query.table === "activities") {
            state.deletedActivities.push(id);
            if (state.activity?.id === id) state.activity = null;
            return { data: null, error: null };
          }
          if (query.table === "scheduled_activities") {
            state.deletedSchedules.push(id);
            if (state.schedule?.id === id) state.schedule = null;
            return { data: null, error: null };
          }
          throw new Error(`Unexpected delete table ${query.table}`);
        }

        if (role === "admin") {
          if (query.table === "plants") return single
            ? { data: { id: "plant-tam", code: "TAM", name: "Támesis", active: true }, error: null }
            : { data: [{ id: "plant-tam", code: "TAM", name: "Támesis", active: true }], error: null };
          if (query.table === "activity_templates") return { data: [{
            id: "template-1", plant_id: "plant-tam", process_id: "process-1", code: "ASEO_HERRAMIENTAS",
            name: "Aseo de herramientas", requires_equipment: false, requires_quantity: false,
            default_unit_code: null, active: true,
          }], error: null };
          if (query.table === "employees") return { data: [{ id: "worker-1", plant_id: "plant-tam", display_name: "Operario UAT", active: true }], error: null };
          if (query.table === "activities") return { data: [], error: null };
          if (query.table === "activity_workers") return { data: [], error: null };
        }

        if (query.table === "scheduled_activities") {
          const id = filterValue(query, "id");
          const row = state.schedule?.id === id ? { ...state.schedule } : null;
          return single ? { data: row, error: null } : { data: row ? [row] : [], error: null };
        }
        if (query.table === "activities") {
          const id = filterValue(query, "id");
          const row = state.activity?.id === id ? { ...state.activity } : null;
          return single ? { data: row, error: null } : { data: row ? [row] : [], error: null };
        }
        throw new Error(`Unexpected ${role} query ${query.table}`);
      },
      async rpc(name) {
        if (name === "ops_create_scheduled_activity") {
          if (role === "operator") return { data: null, error: { message: "No tienes permiso para programar actividades en esta planta." } };
          state.schedule = {
            id: "schedule-1", plant_id: "plant-tam", title: "Aseo de herramientas", status: "planned",
            planned_start: "2026-08-19T03:00:00.000Z", planned_end: "2026-08-19T03:30:00.000Z",
          };
          return { data: state.schedule.id, error: null };
        }
        if (name === "ops_start_scheduled_activity" && role === "operator") {
          state.schedule.status = "running";
          state.activity = {
            id: "activity-1", plant_id: "plant-tam", scheduled_activity_id: state.schedule.id,
            title: state.schedule.title, started_at: "2026-08-18T19:00:00.000Z", ended_at: null,
            quantity: null, unit: null,
          };
          return { data: state.activity.id, error: null };
        }
        if (name === "ops_finish_activity_v2" && role === "operator") {
          if (failFinish) return { data: null, error: { message: "fallo simulado de cierre" } };
          state.activity.ended_at = "2026-08-18T19:01:00.000Z";
          state.schedule.status = "done";
          return { data: state.activity.ended_at, error: null };
        }
        throw new Error(`Unexpected ${role} RPC ${name}`);
      },
    };
    return { client, signInWithPassword, signOut };
  }

  const admin = makeClient("admin");
  const director = makeClient("director");
  const operator = makeClient("operator");
  const queue = [admin.client, director.client, operator.client];
  return { state, admin, director, operator, createClientImpl: vi.fn(() => queue.shift()) };
}

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

  it("fails closed when the user-facing key is secret or service-role", () => {
    expect(() => parseHostedPlanningSmokeConfig({
      ...baseEnv,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_secret_should_never_be_used_as_public",
    })).toThrow(HostedPlanningSmokeError);
    expect(() => parseHostedPlanningSmokeConfig({
      ...baseEnv,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: fakeJwt({ role: "service_role" }),
    })).toThrow(/service_role/);
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

  it("certifies planned → running → done with an exact schedule-to-activity link and cleans both UAT rows", async () => {
    const fake = fakeHostedClients();
    const result = await runHostedPlanningSmoke({
      env: baseEnv,
      createClientImpl: fake.createClientImpl,
      now: new Date("2026-08-18T19:00:00.000Z"),
    });

    expect(result.scheduleId).toBe("schedule-1");
    expect(result.activityId).toBe("activity-1");
    expect(result.checks).toContain("plan-real-link");
    expect(result.checks).toContain("plan-done");
    expect(fake.state.deletedActivities).toEqual(["activity-1"]);
    expect(fake.state.deletedSchedules).toEqual(["schedule-1"]);
    expect(fake.state.activity).toBeNull();
    expect(fake.state.schedule).toBeNull();
    expect(fake.operator.signOut).toHaveBeenCalledOnce();
    expect(fake.director.signOut).toHaveBeenCalledOnce();
  });

  it("cleans the started activity and schedule even when finishing the real activity fails", async () => {
    const fake = fakeHostedClients({ failFinish: true });
    await expect(runHostedPlanningSmoke({
      env: baseEnv,
      createClientImpl: fake.createClientImpl,
      now: new Date("2026-08-18T19:00:00.000Z"),
    })).rejects.toThrow(/fallo simulado de cierre/);

    expect(fake.state.deletedActivities).toEqual(["activity-1"]);
    expect(fake.state.deletedSchedules).toEqual(["schedule-1"]);
    expect(fake.state.activity).toBeNull();
    expect(fake.state.schedule).toBeNull();
  });
});
