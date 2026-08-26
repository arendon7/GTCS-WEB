import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { normalizeResponseText } from "./http-visible-text.mjs";

const workflowPath = ".github/workflows/publish-greenatics-web.yml";
const workflow = readFileSync(workflowPath, "utf8");

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

  it("requires authenticated TAM/YAR isolation before preview or production", () => {
    for (const marker of [
      "PILOT_DIRECTOR_EMAIL",
      "PILOT_DIRECTOR_PASSWORD",
      "PILOT_OPERATOR_TAM_EMAIL",
      "PILOT_OPERATOR_TAM_PASSWORD",
      "PILOT_OPERATOR_YAR_EMAIL",
      "PILOT_OPERATOR_YAR_PASSWORD",
      "PILOT_DIRECTOR_PLANTS: TAM,YAR",
      "Certify Director vs Operario Támesis RLS isolation",
      "PILOT_OPERATOR_PLANTS: TAM",
      "Certify Director vs Operario Yarumal RLS isolation",
      "PILOT_OPERATOR_PLANTS: YAR",
      "npm run pilot:rls-smoke",
    ]) {
      expect(workflow).toContain(marker);
    }

    expect(workflow.indexOf("Certify Director vs Operario Támesis RLS isolation"))
      .toBeLessThan(workflow.indexOf("Deploy full OPS preview"));
    expect(workflow.indexOf("Certify Director vs Operario Yarumal RLS isolation"))
      .toBeLessThan(workflow.indexOf("Deploy full OPS preview"));
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

  it("checks semantic markers against normalized visible response text", () => {
    expect(workflow).toContain('node scripts/http-visible-text.mjs "$outfile" > "$textfile"');
    expect(workflow).toContain('grep -Fq "$marker" "$textfile"');
    expect(workflow).not.toContain('grep -Fq "$marker" "$outfile"');

    const renderedHome = [
      "<main>",
      "<h1>Transformamos residuos <em>en vida.</em></h1>",
      "<script>Transformamos residuos en vida. hidden hydration payload</script>",
      "<style>.fake::after { content: 'Transformamos residuos en vida.'; }</style>",
      "</main>",
    ].join("");
    const visibleHome = normalizeResponseText(renderedHome);

    expect(visibleHome).toContain("Transformamos residuos en vida.");
    expect(visibleHome).not.toContain("hidden hydration payload");
    expect(visibleHome).not.toContain(".fake::after");
    expect(normalizeResponseText("User-agent: *\nDisallow: /app\n")).toContain("Disallow: /app");
    expect(normalizeResponseText("<url><loc>https://greenatics.com.co/wondergreen</loc></url>"))
      .toContain("https://greenatics.com.co/wondergreen");
    expect(normalizeResponseText("<p>Rutas &amp; logística&nbsp;operativa</p>"))
      .toBe("Rutas & logística operativa");
  });

  it("has exactly one manual workflow capable of stable production deployment", () => {
    const manualProductionDispatchers = readdirSync(".github/workflows")
      .filter((name) => /\.ya?ml$/.test(name))
      .filter((name) => {
        const source = readFileSync(`.github/workflows/${name}`, "utf8");
        return source.includes("workflow_dispatch:") && source.includes("vercel-ops-production-deploy.mjs");
      })
      .sort();

    expect(manualProductionDispatchers).toEqual(["publish-greenatics-web.yml"]);
  });
});
