import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/publish-greenatics-web.yml", "utf8");

describe("GREENATICS manual production release workflow", () => {
  it("is manual-only and requires an explicit production confirmation", () => {
    expect(workflow).toContain("workflow_dispatch:");
    expect(workflow).not.toMatch(/^\s*push:\s*$/m);
    expect(workflow).toContain("confirm_production:");
    expect(workflow).toContain("PUBLISH-GREENATICS");
  });

  it("publishes only the exact current develop head", () => {
    expect(workflow).toContain('ref: ${{ inputs.release_sha }}');
    expect(workflow).toContain('^\[0-9a-f\]{40}$');
    expect(workflow).toContain('develop_head="$(git rev-parse origin/develop)"');
    expect(workflow).toContain('if [ "$develop_head" != "$REQUESTED_SHA" ]');
    expect(workflow).toContain('DEPLOY_GIT_SHA=$REQUESTED_SHA');
  });

  it("keeps quality, hosted backend, preview, production provenance and semantic smoke as release gates", () => {
    for (const marker of [
      "npm run typecheck",
      "npm run lint",
      "npm test",
      "npm run build",
      "npm run pilot:backend-preflight -- --plants TAM,YAR",
      "npm run pilot:vercel-preview",
      "npm run pilot:vercel-preflight",
      "node scripts/vercel-ops-production-deploy.mjs",
      '--expected-commit "$DEPLOY_GIT_SHA"',
      'check_route "/" "Transformamos residuos en vida."',
      'check_route "/robots.txt" "Disallow: /app"',
      "greenatics/web-release",
    ]) {
      expect(workflow).toContain(marker);
    }
  });
});
