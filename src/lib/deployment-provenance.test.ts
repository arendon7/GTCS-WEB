import { describe, expect, it } from "vitest";
import { getDeploymentProvenance } from "./deployment-provenance";

describe("deployment provenance", () => {
  it("reports a Vercel preview with only safe branch and short commit metadata", () => {
    expect(getDeploymentProvenance({
      VERCEL: "1",
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "feat/vercel-preview-contract-v0.13.1",
      VERCEL_GIT_COMMIT_SHA: "ABCDEF1234567890abcdef1234567890abcdef12",
      VERCEL_URL: "private-preview.example.vercel.app",
    })).toEqual({
      platform: "vercel",
      environment: "preview",
      branch: "feat/vercel-preview-contract-v0.13.1",
      commit: "abcdef123456",
    });
  });

  it("does not invent Git provenance outside Vercel", () => {
    expect(getDeploymentProvenance({ NODE_ENV: "test" })).toEqual({
      platform: "generic",
      environment: "test",
      branch: null,
      commit: null,
    });
  });

  it("drops malformed branch and commit values instead of reflecting arbitrary input", () => {
    expect(getDeploymentProvenance({
      VERCEL_ENV: "preview",
      VERCEL_GIT_COMMIT_REF: "bad branch <script>",
      VERCEL_GIT_COMMIT_SHA: "not-a-sha",
    })).toEqual({
      platform: "vercel",
      environment: "preview",
      branch: null,
      commit: null,
    });
  });

  it("normalizes an invalid environment label to unknown", () => {
    expect(getDeploymentProvenance({ VERCEL_ENV: "preview<script>" }).environment).toBe("unknown");
  });
});
