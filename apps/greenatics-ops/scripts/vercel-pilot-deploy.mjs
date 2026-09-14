#!/usr/bin/env node

import { appendFile } from "node:fs/promises";
import { runVercelPilotPreviewDeployment } from "./vercel-pilot-deploy-lib.mjs";

async function writeOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile) return;
  await appendFile(outputFile, `${name}=${value}\n`, { encoding: "utf8" });
}

async function writeSummary(result) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile) return;
  const summary = [
    "## GREENATICS hosted pilot preview",
    "",
    `- Mode: \`${result.mode}\``,
    `- Project: \`${result.project.name}\``,
    `- Project created in this run: \`${result.project.created ? "yes" : "no"}\``,
    `- Git ref: \`${result.gitRef}\``,
    `- Git commit: \`${result.gitSha.slice(0, 12)}\``,
    `- Deployment: ${result.deployment.origin}`,
    `- State: \`${result.deployment.state}\``,
    "- Environment target: `preview` only",
    "",
  ].join("\n");
  await appendFile(summaryFile, summary, { encoding: "utf8" });
}

async function main() {
  const result = await runVercelPilotPreviewDeployment();

  await writeOutput("pilot_mode", result.mode);
  await writeOutput("project_id", result.project.id);
  await writeOutput("deployment_id", result.deployment.id);
  await writeOutput("deployment_url", result.deployment.origin);
  await writeSummary(result);

  console.log("GREENATICS Vercel hosted pilot: READY");
  console.log(`mode: ${result.mode}`);
  console.log(`project: ${result.project.name}`);
  console.log(`project-created: ${result.project.created ? "yes" : "no"}`);
  console.log(`deployment: ${result.deployment.origin}`);
  console.log(`git: ${result.gitRef}@${result.gitSha.slice(0, 12)}`);
  console.log("target: preview");
}

main().catch((error) => {
  console.error(`GREENATICS Vercel hosted pilot: FAIL · ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
