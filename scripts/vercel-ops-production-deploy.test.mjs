import { describe, expect, it, vi } from "vitest";
import { runVercelOpsProductionDeployment } from "./vercel-ops-production-deploy-lib.mjs";

const fullOpsEnv = {
  PILOT_PREVIEW_MODE: "full-ops",
  VERCEL_TOKEN: "vercel-test-token-never-log",
  VERCEL_ORG_ID: "team_test_scope",
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

describe("Vercel stable OPS production deployment", () => {
  it("publishes the exact full-ops SHA to production and assigns the stable alias", async () => {
    const calls = [];
    const fetchImpl = vi.fn(async (url, init = {}) => {
      const parsed = new URL(url);
      const method = init.method || "GET";
      calls.push({ method, parsed, body: requestBody(init) });

      if (method === "GET" && parsed.pathname === "/v9/projects/greenatics-ops") {
        return jsonResponse({ id: "prj_greenatics_ops", name: "greenatics-ops" });
      }
      if (method === "POST" && parsed.pathname === "/v10/projects/prj_greenatics_ops/env") {
        return jsonResponse({ created: [] });
      }
      if (method === "POST" && parsed.pathname === "/v13/deployments") {
        return jsonResponse({ id: "dpl_greenatics_ops", url: "greenatics-prod-unique.vercel.app", status: "QUEUED" });
      }
      if (method === "GET" && parsed.pathname === "/v13/deployments/dpl_greenatics_ops") {
        return jsonResponse({ id: "dpl_greenatics_ops", url: "greenatics-prod-unique.vercel.app", status: "READY" });
      }
      if (method === "GET" && parsed.pathname === "/v2/deployments/dpl_greenatics_ops/aliases") {
        return jsonResponse({ aliases: [] });
      }
      if (method === "POST" && parsed.pathname === "/v2/deployments/dpl_greenatics_ops/aliases") {
        return jsonResponse({ uid: "alias_test", alias: "greenatics-ops.vercel.app" });
      }
      throw new Error(`Unexpected ${method} ${parsed.pathname}`);
    });

    const result = await runVercelOpsProductionDeployment({
      env: fullOpsEnv,
      fetchImpl,
      sleepImpl: vi.fn(async () => {}),
      maxAttempts: 2,
      pollIntervalMs: 0,
    });

    expect(result.deployment.origin).toBe("https://greenatics-ops.vercel.app");
    expect(result.deployment.uniqueOrigin).toBe("https://greenatics-prod-unique.vercel.app");

    const envCall = calls.find((call) => call.method === "POST" && call.parsed.pathname.endsWith("/env"));
    expect(envCall.body).toHaveLength(4);
    expect(envCall.body.every((item) => JSON.stringify(item.target) === JSON.stringify(["production"]))).toBe(true);
    expect(envCall.body.find((item) => item.key === "SUPABASE_SECRET_KEY")?.type).toBe("sensitive");

    const deploymentCall = calls.find((call) => call.method === "POST" && call.parsed.pathname === "/v13/deployments");
    expect(deploymentCall.body.target).toBe("production");
    expect(deploymentCall.body.gitSource).toEqual({
      type: "github",
      org: "arendon7",
      repo: "GTCS-WEB",
      ref: "develop",
      sha: fullOpsEnv.DEPLOY_GIT_SHA,
    });

    const aliasCall = calls.find((call) => call.method === "POST" && call.parsed.pathname.endsWith("/aliases"));
    expect(aliasCall.body).toEqual({ alias: "greenatics-ops.vercel.app" });
  });

  it("fails closed when asked to publish public-only as stable OPS", async () => {
    const fetchImpl = vi.fn();
    await expect(runVercelOpsProductionDeployment({
      env: {
        VERCEL_TOKEN: "token",
        VERCEL_ORG_ID: "team_test_scope",
        GITHUB_REPOSITORY: "arendon7/GTCS-WEB",
        DEPLOY_GIT_REF: "develop",
        DEPLOY_GIT_SHA: "a".repeat(40),
        PILOT_PREVIEW_MODE: "public-only",
      },
      fetchImpl,
    })).rejects.toThrow(/solo admite PILOT_PREVIEW_MODE=full-ops/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
