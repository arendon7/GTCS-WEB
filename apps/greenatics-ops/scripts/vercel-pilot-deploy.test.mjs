import { describe, expect, it, vi } from "vitest";
import {
  VercelPilotError,
  parseVercelPilotConfig,
  runVercelPilotPreviewDeployment,
} from "./vercel-pilot-deploy-lib.mjs";

const baseEnv = {
  VERCEL_TOKEN: "vercel-test-token-never-log",
  VERCEL_ORG_ID: "team_test_scope",
  GITHUB_REPOSITORY: "arendon7/GTCS-WEB",
  DEPLOY_GIT_REF: "develop",
  DEPLOY_GIT_SHA: "a".repeat(40),
};

const publicEnv = {
  ...baseEnv,
  PILOT_PREVIEW_MODE: "public-only",
};

const fullOpsEnv = {
  ...baseEnv,
  PILOT_PREVIEW_MODE: "full-ops",
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

function successfulFetch({ projectName, deploymentUrl }) {
  const calls = [];
  let deploymentPolls = 0;
  const fetchImpl = vi.fn(async (url, init = {}) => {
    const parsed = new URL(url);
    const method = init.method || "GET";
    calls.push({ method, parsed, body: requestBody(init), authorization: init.headers?.Authorization });

    if (method === "GET" && parsed.pathname === `/v9/projects/${projectName}`) {
      return jsonResponse({ error: { code: "not_found" } }, 404);
    }
    if (method === "POST" && parsed.pathname === "/v11/projects") {
      return jsonResponse({ id: "prj_greenatics_test", name: projectName });
    }
    if (method === "POST" && parsed.pathname === "/v10/projects/prj_greenatics_test/env") {
      return jsonResponse({ created: [] });
    }
    if (method === "POST" && parsed.pathname === "/v13/deployments") {
      return jsonResponse({ id: "dpl_greenatics_test", url: deploymentUrl, status: "QUEUED" });
    }
    if (method === "GET" && parsed.pathname === "/v13/deployments/dpl_greenatics_test") {
      deploymentPolls += 1;
      return jsonResponse({
        id: "dpl_greenatics_test",
        url: deploymentUrl,
        status: deploymentPolls === 1 ? "BUILDING" : "READY",
      });
    }
    throw new Error(`Unexpected ${method} ${parsed.pathname}`);
  });
  return { calls, fetchImpl };
}

describe("Vercel hosted pilot preview deployment", () => {
  it("defaults to an isolated public-only project without backend credentials", () => {
    const config = parseVercelPilotConfig(baseEnv);
    expect(config.mode).toBe("public-only");
    expect(config.projectName).toBe("greenatics-public-preview");
    expect(config.supabaseUrl).toBeNull();
    expect(config.supabasePublishableKey).toBeNull();
    expect(config.supabaseSecretKey).toBeNull();
  });

  it("requires infrastructure, safe Git provenance and canonical mode/project identity", () => {
    expect(() => parseVercelPilotConfig({ ...publicEnv, VERCEL_TOKEN: "" })).toThrow(/VERCEL_TOKEN/);
    expect(() => parseVercelPilotConfig({ ...publicEnv, DEPLOY_GIT_SHA: "abc" })).toThrow(/40 caracteres/);
    expect(() => parseVercelPilotConfig({ ...publicEnv, DEPLOY_GIT_REF: "bad ref" })).toThrow(/referencia Git segura/);
    expect(() => parseVercelPilotConfig({ ...publicEnv, PILOT_PREVIEW_MODE: "unknown" })).toThrow(/public-only o full-ops/);
    expect(() => parseVercelPilotConfig({ ...publicEnv, VERCEL_PROJECT_NAME: "greenatics-ops" })).toThrow(/greenatics-public-preview/);
  });

  it("requires Supabase credentials only for full-ops", () => {
    expect(() => parseVercelPilotConfig({ ...baseEnv, PILOT_PREVIEW_MODE: "full-ops" })).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
    const config = parseVercelPilotConfig(fullOpsEnv);
    expect(config.mode).toBe("full-ops");
    expect(config.projectName).toBe("greenatics-ops");
    expect(config.supabaseSecretKey).toBe(fullOpsEnv.SUPABASE_SECRET_KEY);
  });

  it("creates an isolated public project without coupling provisioning to Git integration", async () => {
    const { calls, fetchImpl } = successfulFetch({
      projectName: "greenatics-public-preview",
      deploymentUrl: "greenatics-public-preview.vercel.app",
    });

    const result = await runVercelPilotPreviewDeployment({
      env: publicEnv,
      fetchImpl,
      sleepImpl: vi.fn(async () => {}),
      maxAttempts: 3,
      pollIntervalMs: 0,
    });

    expect(result.mode).toBe("public-only");
    expect(result.project).toEqual({ id: "prj_greenatics_test", name: "greenatics-public-preview", created: true });
    expect(result.deployment.origin).toBe("https://greenatics-public-preview.vercel.app");
    expect(result.deployment.state).toBe("READY");

    for (const call of calls) {
      expect(call.parsed.searchParams.get("teamId")).toBe(publicEnv.VERCEL_ORG_ID);
      expect(call.authorization).toBe(`Bearer ${publicEnv.VERCEL_TOKEN}`);
    }

    const createProject = calls.find((call) => call.method === "POST" && call.parsed.pathname === "/v11/projects");
    expect(createProject.body).toEqual({
      name: "greenatics-public-preview",
      framework: "nextjs",
    });
    expect(createProject.body).not.toHaveProperty("gitRepository");

    const envCall = calls.find((call) => call.parsed.pathname.endsWith("/env"));
    expect(envCall.parsed.searchParams.get("upsert")).toBe("true");
    expect(envCall.body).toEqual([
      expect.objectContaining({
        key: "NEXT_PUBLIC_DATA_MODE",
        value: "local",
        type: "plain",
        target: ["preview"],
      }),
    ]);

    const deployCall = calls.find((call) => call.method === "POST" && call.parsed.pathname === "/v13/deployments");
    expect(deployCall.parsed.searchParams.get("forceNew")).toBe("1");
    expect(deployCall.body).not.toHaveProperty("target");
    expect(deployCall.body.gitSource).toEqual({
      type: "github",
      org: "arendon7",
      repo: "GTCS-WEB",
      ref: "develop",
      sha: publicEnv.DEPLOY_GIT_SHA,
    });
    expect(deployCall.body.meta.greenaticsPilotMode).toBe("public-only");
  });

  it("injects Supabase secrets only into the dedicated full-ops Preview project", async () => {
    const { calls, fetchImpl } = successfulFetch({
      projectName: "greenatics-ops",
      deploymentUrl: "greenatics-ops-preview.vercel.app",
    });

    const result = await runVercelPilotPreviewDeployment({
      env: fullOpsEnv,
      fetchImpl,
      sleepImpl: vi.fn(async () => {}),
      maxAttempts: 3,
      pollIntervalMs: 0,
    });

    expect(result.mode).toBe("full-ops");
    expect(result.project.name).toBe("greenatics-ops");
    const envCall = calls.find((call) => call.parsed.pathname.endsWith("/env"));
    expect(envCall.body.map((item) => item.key)).toEqual([
      "NEXT_PUBLIC_DATA_MODE",
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_SECRET_KEY",
    ]);
    expect(envCall.body.every((item) => JSON.stringify(item.target) === JSON.stringify(["preview"]))).toBe(true);
    expect(envCall.body.find((item) => item.key === "NEXT_PUBLIC_DATA_MODE")?.value).toBe("supabase");
    expect(envCall.body.find((item) => item.key === "SUPABASE_SECRET_KEY")?.type).toBe("sensitive");
  });

  it("reuses the canonical project and fails closed on a terminal deployment state", async () => {
    const fetchImpl = vi.fn(async (url, init = {}) => {
      const parsed = new URL(url);
      const method = init.method || "GET";
      if (method === "GET" && parsed.pathname === "/v9/projects/greenatics-public-preview") {
        return jsonResponse({ id: "prj_greenatics_test", name: "greenatics-public-preview" });
      }
      if (method === "POST" && parsed.pathname.endsWith("/env")) return jsonResponse({ created: [] });
      if (method === "POST" && parsed.pathname === "/v13/deployments") {
        return jsonResponse({ id: "dpl_greenatics_test", url: "greenatics-public-preview.vercel.app", status: "QUEUED" });
      }
      if (method === "GET" && parsed.pathname === "/v13/deployments/dpl_greenatics_test") {
        return jsonResponse({ id: "dpl_greenatics_test", url: "greenatics-public-preview.vercel.app", status: "ERROR" });
      }
      throw new Error(`Unexpected ${method} ${parsed.pathname}`);
    });

    await expect(runVercelPilotPreviewDeployment({
      env: publicEnv,
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
        message: `credential=${fullOpsEnv.VERCEL_TOKEN}`,
      },
    }, 403));

    let thrown;
    try {
      await runVercelPilotPreviewDeployment({ env: fullOpsEnv, fetchImpl, maxAttempts: 1, pollIntervalMs: 0 });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(VercelPilotError);
    expect(thrown.message).toContain("forbidden");
    expect(thrown.message).not.toContain(fullOpsEnv.VERCEL_TOKEN);
    expect(thrown.message).not.toContain(fullOpsEnv.SUPABASE_SECRET_KEY);
  });
});
