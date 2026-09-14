import { describe, expect, it } from "vitest";
import { protectedOpsRoutePrefixes } from "./ops-access-policy";
import {
  baselineSecurityHeaders,
  deploymentHeadersConfig,
  internalHeaderRoutePrefixes,
  internalResponseHeaders,
} from "./http-security";

function headerValue(headers: { key: string; value: string }[], key: string) {
  return headers.find((header) => header.key === key)?.value;
}

describe("deployment response headers", () => {
  it("applies defensive headers to every route", () => {
    expect(headerValue(baselineSecurityHeaders, "X-Content-Type-Options")).toBe("nosniff");
    expect(headerValue(baselineSecurityHeaders, "Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headerValue(baselineSecurityHeaders, "X-Frame-Options")).toBe("DENY");
    expect(headerValue(baselineSecurityHeaders, "Permissions-Policy")).toContain("camera=()");
  });

  it("marks internal responses private, non-cacheable and non-indexable", () => {
    expect(headerValue(internalResponseHeaders, "Cache-Control")).toContain("no-store");
    expect(headerValue(internalResponseHeaders, "X-Robots-Tag")).toBe("noindex, nofollow, noarchive");
    expect(headerValue(internalResponseHeaders, "Pragma")).toBe("no-cache");
  });

  it("covers every protected OPS family plus login and API", () => {
    for (const prefix of protectedOpsRoutePrefixes) expect(internalHeaderRoutePrefixes).toContain(prefix);
    expect(internalHeaderRoutePrefixes).toContain("/login");
    expect(internalHeaderRoutePrefixes).toContain("/api");
  });

  it("generates one baseline rule plus one private rule per internal prefix", () => {
    const config = deploymentHeadersConfig();
    expect(config).toHaveLength(1 + internalHeaderRoutePrefixes.length);
    expect(config[0]).toEqual({ source: "/:path*", headers: baselineSecurityHeaders });
    expect(config.some((rule) => rule.source === "/app/:path*")).toBe(true);
    expect(config.some((rule) => rule.source === "/login/:path*")).toBe(true);
    expect(config.some((rule) => rule.source === "/api/:path*")).toBe(true);
  });
});
