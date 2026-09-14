#!/usr/bin/env node

import { appendFile } from "node:fs/promises";
import { runVercelOpsProductionDeployment } from "./vercel-ops-production-deploy-lib.mjs";

async function writeOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile) return;
  await appendFile(outputFile, `${name}=${value}\n`, { encoding: "utf8" });
}

async function writeSummary(result) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile) return;
  const summary = [
    "## GREENATICS stable OPS production",
    "",
    `- Project: \`${result.project.name}\``,
    `- Git ref: \`${result.gitRef}\``,
    `- Git commit: \`${result.gitSha.slice(0, 12)}\``,
    `- Stable origin: ${result.deployment.origin}`,
    `- Unique deployment: ${result.deployment.uniqueOrigin}`,
    `- State: \`${result.deployment.state}\``,
    "- Environment target: `production`",
    "",
  ].join("\n");
  await appendFile(summaryFile, summary, { encoding: "utf8" });
}

async function main() {
  const result = await runVercelOpsProductionDeployment();
  await writeOutput("project_id", result.project.id);
  await writeOutput("deployment_id", result.deployment.id);
  await writeOutput("deployment_url", result.deployment.origin);
  await writeOutput("unique_deployment_url", result.deployment.uniqueOrigin);
  await writeSummary(result);

  console.log("GREENATICS stable OPS production: READY");
  console.log(`project: ${result.project.name}`);
  console.log(`origin: ${result.deployment.origin}`);
  console.log(`git: ${result.gitRef}@${result.gitSha.slice(0, 12)}`);
  console.log("target: production");
}

main().catch((error) => {
  console.error(`GREENATICS stable OPS production: FAIL · ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
