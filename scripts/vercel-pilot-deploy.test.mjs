import { describe, expect, it, vi } from "vitest";
import {
  VercelPilotError,
  parseVercelPilotConfig,
  runVercelPilotPreviewDeployment,
} from "./vercel-pilot-deploy-lib.mjs";

const env = {
  VERCEL_TOKEN: "vercel-test-token-never-log",
  VERCEL_ORG_ID: "team_test_scope",
  VERCEL_PROJECT_NAME: "greenatics-ops",
  GITHUB_REPOSITORY: "arendon7/GTCS-WEB",
  DEPLOY_GIT_REF: "develop",
  DEPLOY_GIT_SHA: "a".repeat(40),
  NEXT_PUBLIC_SUPABASE_URL: "https://sanitized-project.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_sanitized",
  SUPABASE_SECRET_KEY: "sb_secret_sanitized_server_only",
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function requestBody(init) {
  return init?.body ? JSON.parse(String(init.body)) : undefined;
}

describe("Vercel hosted pilot preview deployment", () => {
  it("requires explicit infrastructure and backend configuration", () => {
    expect(() => parseVercelPilotConfig({ ...env, VERCEL_TOKEN: "" })).toThrow(/VERCEL_TOKEN/);
    expect(() => parseVercelPilotConfig({ ...env, DEPLOY_GIT_SHA: "abc" })).toThrow(/40 caracteres/);
    expect(() => parseVercelPilotConfig({ ...env, DEPLOY_GIT_REF: "bad ref" })).toThrow(/referencia Git segura/);
  });

  it("creates the project when absent, upserts preview-only env and deploys the exact SHA", async () => {
    const calls = [];
    let deploymentPolls = 0;
    const fetchImpl = vi.fn(async (url, init = {}) => {
      const parsed = new URL(url);
      const method = init.method || "GET";
      calls.push({ method, parsed, body: requestBody(init), authorization: init.headers?.Authorization });

      if (method === "GET" && parsed.pathname === "/v9/projects/greenatics-ops") {
        return jsonResponse({ error: { code: "not_found" } }, 404);
      }
      if (method === "POST" && parsed.pathname === "/v11/projects") {
        return jsonResponse({ id: "prj_greenatics_test", name: "greenatics-ops" });
      }
      if (method === "POST" && parsed.pathname === "/v10/projects/prj_greenatics_test/env") {
        return jsonResponse({ created: [] });
      }
      if (method === "POST" && parsed.pathname === "/v13/deployments") {
        return jsonResponse({ id: "dpl_greenatics_test", url: "greenatics-ops-preview.vercel.app", status: "QUEUED" });
      }
      if (method === "GET" && parsed.pathname === "/v13/deployments/dpl_greenatics_test") {
        deploymentPolls += 1;
        return jsonResponse({
          id: "dpl_greenatics_test",
          url: "greenatics-ops-preview.vercel.app",
          status: deploymentPolls === 1 ? "BUILDING" : "READY",
        });
      }
      throw new Error(`Unexpected ${method} ${parsed.pathname}`);
    });

    const result = await runVercelPilotPreviewDeployment({
      env,
      fetchImpl,
      sleepImpl: vi.fn(async () => {}),
      maxAttempts: 3,
      pollIntervalMs: 0,
    });

    expect(result.project).toEqual({ id: "prj_greenatics_test", name: "greenatics-ops", created: true });
    expect(result.deployment.origin).toBe("https://greenatics-ops-preview.vercel.app");
    expect(result.deployment.state).toBe("READY");

    for (const call of calls) {
      expect(call.parsed.searchParams.get("teamId")).toBe(env.VERCEL_ORG_ID);
      expect(call.authorization).toBe(`Bearer ${env.VERCEL_TOKEN}`);
    }

    const createProject = calls.find((call) => call.method === "POST" && call.parsed.pathname === "/v11/projects");
    expect(createProject.body).toMatchObject({
      name: "greenatics-ops",
      framework: "nextjs",
      gitRepository: { type: "github", repo: "arendon7/GTCS-WEB" },
    });

    const envCall = calls.find((call) => call.parsed.pathname.endsWith("/env"));
    expect(envCall.parsed.searchParams.get("upsert")).toBe("true");
    expect(envCall.body.map((item) => item.key)).toEqual([
      "NEXT_PUBLIC_DATA_MODE",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_SECRET_KEY",
    ]);
    expect(envCall.body.every((item) => JSON.stringify(item.target) === JSON.stringify(["preview"]))).toBe(true);
    expect(envCall.body.find((item) => item.key === "SUPABASE_SECRET_KEY")?.type).toBe("sensitive");

    const deployCall = calls.find((call) => call.method === "POST" && call.parsed.pathname === "/v13/deployments");
    expect(deployCall.parsed.searchParams.get("forceNew")).toBe("1");
    expect(deployCall.body).not.toHaveProperty("target");
    expect(deployCall.body.gitSource).toEqual({
      type: "github",
      org: "arendon7",
      repo: "GTCS-WEB",
      ref: "develop",
      sha: env.DEPLOY_GIT_SHA,
    });
  });

  it("reuses an existing project and fails closed on a terminal deployment state", async () => {
    const fetchImpl = vi.fn(async (url, init = {}) => {
      const parsed = new URL(url);
      const method = init.method || "GET";
      if (method === "GET" && parsed.pathname === "/v9/projects/greenatics-ops") {
        return jsonResponse({ id: "prj_greenatics_test", name: "greenatics-ops" });
      }
      if (method === "POST" && parsed.pathname.endsWith("/env")) return jsonResponse({ created: [] });
      if (method === "POST" && parsed.pathname === "/v13/deployments") {
        return jsonResponse({ id: "dpl_greenatics_test", url: "greenatics-ops-preview.vercel.app", status: "QUEUED" });
      }
      if (method === "GET" && parsed.pathname === "/v13/deployments/dpl_greenatics_test") {
        return jsonResponse({ id: "dpl_greenatics_test", url: "greenatics-ops-preview.vercel.app", status: "ERROR" });
      }
      throw new Error(`Unexpected ${method} ${parsed.pathname}`);
    });

    await expect(runVercelPilotPreviewDeployment({
      env,
      fetchImpl,
      sleepImpl: vi.fn(async () => {}),
      maxAttempts: 2,
      pollIntervalMs: 0,
    })).rejects.toThrow(/estado ERROR/);

    expect(fetchImpl.mock.calls.filter(([url, init]) => (init?.method || "GET") === "POST" && new URL(url).pathname === "/v11/projects")).toHaveLength(0);
  });

  it("never echoes a remote error message that could contain credentials", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({
      error: {
        code: "forbidden",
        message: `credential=${env.VERCEL_TOKEN}`,
      },
    }, 403));

    let thrown;
    try {
      await runVercelPilotPreviewDeployment({ env, fetchImpl, maxAttempts: 1, pollIntervalMs: 0 });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(VercelPilotError);
    expect(thrown.message).toContain("forbidden");
    expect(thrown.message).not.toContain(env.VERCEL_TOKEN);
  });
});
