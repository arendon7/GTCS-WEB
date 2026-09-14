import { describe, expect, it } from "vitest";
import {
  PreflightError,
  assertHostedHealth,
  normalizeHostedBaseUrl,
  normalizePilotMode,
  normalizePublicOrigin,
  runHostedPilotPreflight,
} from "./hosted-pilot-preflight-lib.mjs";

const canonicalPublicOrigin = "https://greenatics.com.co";

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

const deployment = {
  platform: "vercel",
  environment: "preview",
  branch: "develop",
  commit: "850ffcea0800",
};

const fullOpsHealth = {
  status: "ready",
  mode: "supabase",
  opsAccess: "supabase-auth",
  checks: { backend: "ok", admin: "ok", appOrigin: "ok" },
  publicOrigin: canonicalPublicOrigin,
  deployment,
};

const publicHealth = {
  status: "ready",
  mode: "local",
  opsAccess: "configuration-block",
  checks: { backend: "missing", admin: "missing", appOrigin: "ok" },
  publicOrigin: canonicalPublicOrigin,
  deployment,
};

function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    ...init,
    headers: { "content-type": "application/json", ...(init.headers ?? {}) },
  });
}

function hostedFixture({ mode = "full-ops", overrides = {} } = {}) {
  const origin = "https://greenatics-pilot.vercel.app";
  const publicOnly = mode === "public-only";
  const responses = {
    [`${origin}/api/health`]: jsonResponse(publicOnly ? publicHealth : fullOpsHealth, { headers: privateHeaders }),
    [`${origin}/`]: new Response("home", { status: 200, headers: baselineHeaders }),
    [`${origin}/login`]: new Response("login", { status: 200, headers: privateHeaders }),
    [`${origin}/app`]: new Response(null, {
      status: 307,
      headers: {
        ...privateHeaders,
        location: publicOnly
          ? `${origin}/login?reason=configuration&next=%2Fapp`
          : `${origin}/login?next=%2Fapp`,
      },
    }),
    [`${origin}/sitemap.xml`]: new Response(
      `<?xml version="1.0"?><urlset><url><loc>${canonicalPublicOrigin}/</loc></url><url><loc>${canonicalPublicOrigin}/wondergreen</loc></url></urlset>`,
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
  it("normalizes only clean HTTPS deployment and public origins plus accepted pilot modes", () => {
    expect(normalizeHostedBaseUrl("https://pilot.example.com")).toBe("https://pilot.example.com");
    expect(normalizePublicOrigin(canonicalPublicOrigin)).toBe(canonicalPublicOrigin);
    expect(() => normalizeHostedBaseUrl("http://pilot.example.com")).toThrow(PreflightError);
    expect(() => normalizeHostedBaseUrl("https://user:pass@pilot.example.com")).toThrow(PreflightError);
    expect(() => normalizeHostedBaseUrl("https://pilot.example.com/app")).toThrow(PreflightError);
    expect(() => normalizePublicOrigin("http://greenatics.com.co")).toThrow(/HTTPS/);
    expect(() => normalizePublicOrigin("https://greenatics.com.co/path")).toThrow(/únicamente un origen/);
    expect(normalizePilotMode(undefined)).toBe("full-ops");
    expect(normalizePilotMode("public-only")).toBe("public-only");
    expect(() => normalizePilotMode("unknown")).toThrow(/public-only o full-ops/);
  });

  it("accepts a ready full-ops deployment with matching branch, commit and canonical public origin", async () => {
    const fixture = hostedFixture();
    const result = await runHostedPilotPreflight({
      baseUrl: fixture.origin,
      expectedMode: "full-ops",
      expectedBranch: "develop",
      expectedCommit: "850ffcea08008f40f7d6747a39a122259b5ccbf9",
      fetchImpl: fixture.fetchImpl,
    });

    expect(result.origin).toBe(fixture.origin);
    expect(result.publicOrigin).toBe(canonicalPublicOrigin);
    expect(result.mode).toBe("full-ops");
    expect(result.deployment.environment).toBe("preview");
    expect(result.checks).toContain("ops-anonymous");
  });

  it("rejects hosted health without a valid canonical public origin", () => {
    expect(() => assertHostedHealth({ ...fullOpsHealth, publicOrigin: undefined }, { expectedMode: "full-ops" })).toThrow(/publicOrigin/);
    expect(() => assertHostedHealth({ ...fullOpsHealth, publicOrigin: "https://greenatics.com.co/path" }, { expectedMode: "full-ops" })).toThrow(/publicOrigin/);
  });

  it("accepts Vercel's platform noindex on a Preview public home", async () => {
    const origin = "https://greenatics-pilot.vercel.app";
    const fixture = hostedFixture({
      overrides: {
        [`${origin}/`]: new Response("home", {
          status: 200,
          headers: { ...baselineHeaders, "x-robots-tag": "noindex" },
        }),
      },
    });

    await expect(runHostedPilotPreflight({
      baseUrl: fixture.origin,
      expectedMode: "full-ops",
      fetchImpl: fixture.fetchImpl,
    })).resolves.toMatchObject({ mode: "full-ops", publicOrigin: canonicalPublicOrigin });
  });

  it("rejects the private OPS robots policy on a Preview public home", async () => {
    const origin = "https://greenatics-pilot.vercel.app";
    const fixture = hostedFixture({
      overrides: {
        [`${origin}/`]: new Response("home", { status: 200, headers: privateHeaders }),
      },
    });

    await expect(runHostedPilotPreflight({
      baseUrl: fixture.origin,
      expectedMode: "full-ops",
      fetchImpl: fixture.fetchImpl,
    })).rejects.toThrow(/X-Robots-Tag privado o inesperado/);
  });

  it("keeps a production public home free of X-Robots-Tag", async () => {
    const origin = "https://greenatics-pilot.vercel.app";
    const productionHealth = {
      ...fullOpsHealth,
      deployment: { ...deployment, environment: "production" },
    };
    const fixture = hostedFixture({
      overrides: {
        [`${origin}/api/health`]: jsonResponse(productionHealth, { headers: privateHeaders }),
        [`${origin}/`]: new Response("home", {
          status: 200,
          headers: { ...baselineHeaders, "x-robots-tag": "noindex" },
        }),
      },
    });

    await expect(runHostedPilotPreflight({
      baseUrl: fixture.origin,
      expectedMode: "full-ops",
      fetchImpl: fixture.fetchImpl,
    })).rejects.toThrow(/X-Robots-Tag privado o inesperado/);
  });

  it("accepts a public-only deployment only when OPS is configuration-blocked and Supabase is absent", async () => {
    const fixture = hostedFixture({ mode: "public-only" });
    const result = await runHostedPilotPreflight({
      baseUrl: fixture.origin,
      expectedMode: "public-only",
      expectedBranch: "develop",
      expectedCommit: "850ffcea08008f40f7d6747a39a122259b5ccbf9",
      fetchImpl: fixture.fetchImpl,
    });

    expect(result.mode).toBe("public-only");
    expect(result.checks).toContain("ops-configuration-block");
  });

  it("rejects backend credential contamination in public-only", () => {
    expect(() => assertHostedHealth({
      ...publicHealth,
      checks: { ...publicHealth.checks, backend: "ok" },
    }, { expectedMode: "public-only" })).toThrow(/no debe recibir credenciales Supabase/);
  });

  it("rejects configuration-block when full-ops is expected", () => {
    expect(() => assertHostedHealth({ ...fullOpsHealth, opsAccess: "configuration-block" }, { expectedMode: "full-ops" })).toThrow(/supabase-auth/);
  });

  it("rejects an OPS redirect that does not match the selected mode", async () => {
    const origin = "https://greenatics-pilot.vercel.app";
    const fixture = hostedFixture({
      mode: "public-only",
      overrides: {
        [`${origin}/app`]: new Response(null, {
          status: 307,
          headers: { ...privateHeaders, location: `${origin}/login?next=%2Fapp` },
        }),
      },
    });

    await expect(runHostedPilotPreflight({
      baseUrl: fixture.origin,
      expectedMode: "public-only",
      fetchImpl: fixture.fetchImpl,
    })).rejects.toThrow(/reason=configuration/);
  });

  it("rejects anonymous OPS redirects that leave the deployment origin", async () => {
    const origin = "https://greenatics-pilot.vercel.app";
    const fixture = hostedFixture({
      overrides: {
        [`${origin}/app`]: new Response(null, {
          status: 307,
          headers: { ...privateHeaders, location: "https://evil.example/login?next=%2Fapp" },
        }),
      },
    });

    await expect(runHostedPilotPreflight({ baseUrl: fixture.origin, fetchImpl: fixture.fetchImpl })).rejects.toThrow(/login canónico/);
  });

  it("rejects internal routes leaked into the canonical public sitemap", async () => {
    const origin = "https://greenatics-pilot.vercel.app";
    const fixture = hostedFixture({
      overrides: {
        [`${origin}/sitemap.xml`]: new Response(
          `<?xml version="1.0"?><urlset><url><loc>${canonicalPublicOrigin}/app</loc></url></urlset>`,
          { status: 200 },
        ),
      },
    });

    await expect(runHostedPilotPreflight({ baseUrl: fixture.origin, fetchImpl: fixture.fetchImpl })).rejects.toThrow(/ruta interna/);
  });

  it("rejects sitemap URLs outside health's canonical public origin", async () => {
    const origin = "https://greenatics-pilot.vercel.app";
    const fixture = hostedFixture({
      overrides: {
        [`${origin}/sitemap.xml`]: new Response(
          `<?xml version="1.0"?><urlset><url><loc>https://evil.example/wondergreen</loc></url></urlset>`,
          { status: 200 },
        ),
      },
    });

    await expect(runHostedPilotPreflight({ baseUrl: fixture.origin, fetchImpl: fixture.fetchImpl })).rejects.toThrow(/origen público canónico/);
  });
});
