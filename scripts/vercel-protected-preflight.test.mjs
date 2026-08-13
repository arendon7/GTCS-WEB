import { describe, expect, it, vi } from "vitest";
import {
  VercelProtectedPreflightError,
  createProtectionBypassFetch,
  parseVercelProtectedPreflightConfig,
  runVercelProtectedPilotPreflight,
} from "./vercel-protected-preflight-lib.mjs";

const env = {
  VERCEL_TOKEN: "vercel-token-never-log",
  VERCEL_ORG_ID: "team_test_scope",
  VERCEL_PROJECT_ID: "prj_greenatics_test",
  DEPLOYMENT_URL: "https://greenatics-preview.vercel.app",
  PILOT_PREVIEW_MODE: "full-ops",
  DEPLOY_GIT_REF: "develop",
  DEPLOY_GIT_SHA: "a".repeat(40),
};

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function bodyOf(init) {
  return init?.body ? JSON.parse(String(init.body)) : undefined;
}

describe("Vercel protected preview preflight", () => {
  it("requires a valid project id and deployment provenance", () => {
    expect(() => parseVercelProtectedPreflightConfig({ ...env, VERCEL_PROJECT_ID: "bad" })).toThrow(/VERCEL_PROJECT_ID/);
    expect(() => parseVercelProtectedPreflightConfig({ ...env, DEPLOYMENT_URL: "" })).toThrow(/DEPLOYMENT_URL/);
  });

  it("adds bypass only as an HTTP header", async () => {
    const secret = "a".repeat(32);
    const fetchImpl = vi.fn(async () => new Response("ok", { status: 200 }));
    const protectedFetch = createProtectionBypassFetch(secret, fetchImpl);
    await protectedFetch("https://greenatics-preview.vercel.app/api/health", {
      redirect: "manual",
      headers: { "user-agent": "test" },
    });

    const [url, init] = fetchImpl.mock.calls[0];
    expect(String(url)).not.toContain(secret);
    expect(init.headers.get("x-vercel-protection-bypass")).toBe(secret);
    expect(init.headers.get("user-agent")).toBe("test");
  });

  it("generates, uses and revokes one ephemeral bypass", async () => {
    const secret = "b".repeat(32);
    const calls = [];
    const fetchImpl = vi.fn(async (url, init = {}) => {
      calls.push({ url: new URL(url), method: init.method || "GET", headers: new Headers(init.headers ?? {}), body: bodyOf(init) });
      return jsonResponse({ protectionBypass: {} });
    });
    const preflightRunner = vi.fn(async ({ fetchImpl: protectedFetch }) => {
      await protectedFetch(`${env.DEPLOYMENT_URL}/api/health`, { redirect: "manual" });
      return {
        origin: env.DEPLOYMENT_URL,
        mode: "full-ops",
        deployment: { platform: "vercel", environment: "preview", branch: "develop", commit: env.DEPLOY_GIT_SHA },
        checks: ["health"],
      };
    });

    const result = await runVercelProtectedPilotPreflight({
      env,
      fetchImpl,
      preflightRunner,
      secretFactory: () => secret,
    });

    expect(result.mode).toBe("full-ops");
    const patches = calls.filter((call) => call.method === "PATCH");
    expect(patches).toHaveLength(2);
    expect(patches[0].url.pathname).toBe("/v1/projects/prj_greenatics_test/protection-bypass");
    expect(patches[0].body).toEqual({ generate: { secret, note: "GREENATICS hosted pilot CI" } });
    expect(patches[1].body).toEqual({ revoke: { secret, regenerate: false } });

    const deploymentRequest = calls.find((call) => call.url.hostname === "greenatics-preview.vercel.app");
    expect(deploymentRequest.headers.get("x-vercel-protection-bypass")).toBe(secret);
    expect(deploymentRequest.url.toString()).not.toContain(secret);
  });

  it("revokes the bypass even when the hosted preflight fails", async () => {
    const secret = "c".repeat(32);
    const bodies = [];
    const fetchImpl = vi.fn(async (_url, init = {}) => {
      if ((init.method || "GET") === "PATCH") bodies.push(bodyOf(init));
      return jsonResponse({ protectionBypass: {} });
    });

    await expect(runVercelProtectedPilotPreflight({
      env,
      fetchImpl,
      preflightRunner: vi.fn(async () => { throw new Error("health failed"); }),
      secretFactory: () => secret,
    })).rejects.toThrow(/health failed/);

    expect(bodies).toEqual([
      { generate: { secret, note: "GREENATICS hosted pilot CI" } },
      { revoke: { secret, regenerate: false } },
    ]);
  });

  it("never reflects remote messages that could contain credentials", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({
      error: { code: "forbidden", message: `token=${env.VERCEL_TOKEN}` },
    }, 403));

    let thrown;
    try {
      await runVercelProtectedPilotPreflight({
        env,
        fetchImpl,
        secretFactory: () => "d".repeat(32),
      });
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toBeInstanceOf(VercelProtectedPreflightError);
    expect(thrown.message).toContain("forbidden");
    expect(thrown.message).not.toContain(env.VERCEL_TOKEN);
  });
});
