import { describe, expect, it } from "vitest";
import {
  PreflightError,
  assertHostedHealth,
  normalizeHostedBaseUrl,
  runHostedPilotPreflight,
} from "./hosted-pilot-preflight-lib.mjs";

const baselineHeaders = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};

const privateHeaders = {
  ...baselineHeaders,
  "cache-control": "private, no-store, max-age=0",
  pragma: "no-cache",
  "x-robots-tag": "noindex, nofollow, noarchive",
};

const healthPayload = {
  status: "ready",
  mode: "supabase",
  opsAccess: "supabase-auth",
  checks: { backend: "ok", admin: "ok", appOrigin: "ok" },
  deployment: {
    platform: "vercel",
    environment: "preview",
    branch: "develop",
    commit: "850ffcea0800",
  },
};

function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    ...init,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });
}

function hostedFixture(overrides = {}) {
  const origin = "https://greenatics-pilot.vercel.app";
  const responses = {
    [`${origin}/api/health`]: jsonResponse(healthPayload, { headers: privateHeaders }),
    [`${origin}/`]: new Response("home", { status: 200, headers: baselineHeaders }),
    [`${origin}/login`]: new Response("login", { status: 200, headers: privateHeaders }),
    [`${origin}/app`]: new Response(null, {
      status: 307,
      headers: { ...privateHeaders, location: `${origin}/login?next=%2Fapp` },
    }),
    [`${origin}/sitemap.xml`]: new Response(
      `<?xml version="1.0"?><urlset><url><loc>${origin}/</loc></url><url><loc>${origin}/wondergreen</loc></url></urlset>`,
      { status: 200 },
    ),
    [`${origin}/robots.txt`]: new Response("User-agent: *\nDisallow: /app\nDisallow: /login\nDisallow: /api/\n", { status: 200 }),
    ...overrides,
  };

  return {
    origin,
    fetchImpl: async (url) => {
      const response = responses[String(url)];
      if (!response) throw new Error(`Unexpected URL ${String(url)}`);
      return response.clone();
    },
  };
}

describe("hosted pilot preflight", () => {
  it("normalizes only HTTPS origins without embedded paths or credentials", () => {
    expect(normalizeHostedBaseUrl("https://pilot.example.com")).toBe("https://pilot.example.com");
    expect(() => normalizeHostedBaseUrl("http://pilot.example.com")).toThrow(PreflightError);
    expect(() => normalizeHostedBaseUrl("https://user:pass@pilot.example.com")).toThrow(PreflightError);
    expect(() => normalizeHostedBaseUrl("https://pilot.example.com/app")).toThrow(PreflightError);
  });

  it("accepts a ready Supabase deployment with matching branch and commit", async () => {
    const fixture = hostedFixture();
    const result = await runHostedPilotPreflight({
      baseUrl: fixture.origin,
      expectedBranch: "develop",
      expectedCommit: "850ffcea08008f40f7d6747a39a122259b5ccbf9",
      fetchImpl: fixture.fetchImpl,
    });

    expect(result.origin).toBe(fixture.origin);
    expect(result.deployment.environment).toBe("preview");
    expect(result.checks).toContain("ops-anonymous");
  });

  it("rejects a deployment that still reports configuration-block", () => {
    expect(() => assertHostedHealth({ ...healthPayload, opsAccess: "configuration-block" })).toThrow(/supabase-auth/);
  });

  it("rejects anonymous OPS redirects that leave the canonical origin", async () => {
    const fixture = hostedFixture({
      "https://greenatics-pilot.vercel.app/app": new Response(null, {
        status: 307,
        headers: { ...privateHeaders, location: "https://evil.example/login?next=%2Fapp" },
      }),
    });

    await expect(runHostedPilotPreflight({ baseUrl: fixture.origin, fetchImpl: fixture.fetchImpl })).rejects.toThrow(/login canónico/);
  });

  it("rejects internal routes leaked into the public sitemap", async () => {
    const fixture = hostedFixture({
      "https://greenatics-pilot.vercel.app/sitemap.xml": new Response(
        `<?xml version="1.0"?><urlset><url><loc>https://greenatics-pilot.vercel.app/app</loc></url></urlset>`,
        { status: 200 },
      ),
    });

    await expect(runHostedPilotPreflight({ baseUrl: fixture.origin, fetchImpl: fixture.fetchImpl })).rejects.toThrow(/ruta interna/);
  });
});
