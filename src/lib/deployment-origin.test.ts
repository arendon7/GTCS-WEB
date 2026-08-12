import { describe, expect, it } from "vitest";
import { resolveTrustedAppBaseUrl } from "./deployment-origin";

describe("trusted deployment origin", () => {
  it("prefers an explicit APP_BASE_URL and reduces it to origin", () => {
    expect(resolveTrustedAppBaseUrl({
      APP_BASE_URL: "https://greenatics.com.co/account/setup?ignored=1",
      VERCEL_ENV: "preview",
      VERCEL_BRANCH_URL: "preview.example.vercel.app",
    })).toBe("https://greenatics.com.co");
  });

  it("uses the Vercel branch URL only for preview deployments", () => {
    expect(resolveTrustedAppBaseUrl({
      VERCEL_ENV: "preview",
      VERCEL_BRANCH_URL: "gtcs-web-git-feature-team.vercel.app",
    })).toBe("https://gtcs-web-git-feature-team.vercel.app");
  });

  it("does not use a Vercel branch URL as the production canonical origin", () => {
    expect(resolveTrustedAppBaseUrl({
      VERCEL_ENV: "production",
      VERCEL_BRANCH_URL: "gtcs-web-git-main-team.vercel.app",
    })).toBeNull();
  });

  it("rejects malformed branch URLs with path or credentials", () => {
    expect(resolveTrustedAppBaseUrl({ VERCEL_ENV: "preview", VERCEL_BRANCH_URL: "example.vercel.app/path" })).toBeNull();
    expect(resolveTrustedAppBaseUrl({ VERCEL_ENV: "preview", VERCEL_BRANCH_URL: "user:pass@example.vercel.app" })).toBeNull();
  });
});
