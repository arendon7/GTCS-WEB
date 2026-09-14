import { describe, expect, it } from "vitest";
import { internalRoutePrefixes, publicStaticRoutes } from "./public-site";
import { legacyPublicRedirects, legacyPublicRoutes } from "./legacy-public-migration";

function isInternal(path: string) {
  return internalRoutePrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

describe("legacy public migration registry", () => {
  it("keeps legacy sources unique and path-only", () => {
    const sources = legacyPublicRoutes.map((route) => route.source);
    expect(new Set(sources).size).toBe(sources.length);
    for (const source of sources) {
      expect(source).toMatch(/^\/[a-z0-9-]+$/);
      expect(source.endsWith("/")).toBe(false);
    }
  });

  it("only emits permanent redirects toward public routes", () => {
    expect(legacyPublicRedirects.length).toBeGreaterThan(0);
    for (const redirect of legacyPublicRedirects) {
      expect(redirect.permanent).toBe(true);
      expect(redirect.destination.startsWith("/")).toBe(true);
      expect(isInternal(redirect.destination)).toBe(false);
      expect(redirect.destination).not.toBe(redirect.source);
    }
  });

  it("never emits quarantined or manual-review routes as redirects", () => {
    const emittedSources = new Set(legacyPublicRedirects.map((route) => route.source));
    for (const route of legacyPublicRoutes.filter((item) => item.disposition !== "redirect")) {
      expect(emittedSources.has(route.source)).toBe(false);
      expect(route.destination).toBeUndefined();
    }
  });

  it("quarantines the indexed spam-contaminated template slug", () => {
    const route = legacyPublicRoutes.find((item) => item.source === "/cities-must-show-the-way-forward-on-renewable-energy");
    expect(route?.disposition).toBe("quarantine");
    expect(route?.destination).toBeUndefined();
  });

  it("routes historical impact traffic to the governed impact surface", () => {
    expect(legacyPublicRedirects).toContainEqual({
      source: "/impacto-y-resultados",
      destination: "/impacto",
      permanent: true,
    });
    expect(publicStaticRoutes).toContain("/impacto");
  });

  it("preserves legacy store discovery without recreating WooCommerce checkout semantics", () => {
    expect(legacyPublicRedirects).toContainEqual({
      source: "/store",
      destination: "/wondergreen",
      permanent: true,
    });
    for (const source of ["/my-account", "/cart"]) {
      expect(legacyPublicRoutes.find((route) => route.source === source)?.disposition).toBe("manual-review");
    }
  });

  it("routes the stale field-validation template slug to Wondergreen without carrying claims forward", () => {
    expect(legacyPublicRedirects).toContainEqual({
      source: "/a-decline-in-solar-growth-root-cause-of-analysis-records",
      destination: "/wondergreen",
      permanent: true,
    });
  });

  it("requires legal legacy surfaces to stay under manual review", () => {
    for (const source of ["/terminos-y-condiciones", "/privacidad", "/politicas"]) {
      expect(legacyPublicRoutes.find((route) => route.source === source)?.disposition).toBe("manual-review");
    }
  });
});
