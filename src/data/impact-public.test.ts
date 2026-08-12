import { describe, expect, it } from "vitest";
import { isPublishableMetric, publicImpactMetrics } from "./impact-public";

describe("public impact publication contract", () => {
  it("defines six governed metrics with unique ids", () => {
    expect(publicImpactMetrics).toHaveLength(6);
    expect(new Set(publicImpactMetrics.map((metric) => metric.id)).size).toBe(6);
  });

  it("starts without unapproved public values", () => {
    for (const metric of publicImpactMetrics) {
      expect(metric.status).toBe("pending_publication");
      expect(metric.value).toBeNull();
      expect(metric.cutoff).toBeNull();
      expect(isPublishableMetric(metric)).toBe(false);
    }
  });

  it("requires methodology for derived impact metrics", () => {
    expect(publicImpactMetrics.find((metric) => metric.id === "climate-impact")?.methodologyRequired).toBe(true);
    expect(publicImpactMetrics.find((metric) => metric.id === "rejection-rate")?.methodologyRequired).toBe(true);
    expect(publicImpactMetrics.find((metric) => metric.id === "recovered-mass")?.methodologyRequired).toBe(true);
  });

  it("only publishes a metric with status, value and cutoff", () => {
    const base = publicImpactMetrics[0];
    expect(isPublishableMetric({ ...base, status: "published", value: 12.5, cutoff: null })).toBe(false);
    expect(isPublishableMetric({ ...base, status: "published", value: null, cutoff: "2026-08-01" })).toBe(false);
    expect(isPublishableMetric({ ...base, status: "published", value: 12.5, cutoff: "2026-08-01" })).toBe(true);
  });
});
