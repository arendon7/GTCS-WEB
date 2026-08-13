#!/usr/bin/env node

import { runHostedPilotPreflight } from "./hosted-pilot-preflight-lib.mjs";

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`Falta valor para ${name}.`);
  return value;
}

function printHelp() {
  console.log(`GREENATICS hosted pilot preflight

Uso:
  npm run pilot:preflight -- --base-url https://preview.example.com [opciones]

Opciones:
  --base-url <origin>        Origen HTTPS del deployment. APP_BASE_URL es fallback.
  --mode <mode>              public-only o full-ops. Default: full-ops.
  --expected-branch <name>   Exige que /api/health reporte esta rama.
  --expected-commit <sha>    Exige que /api/health reporte este commit (12 primeros caracteres).
  --help                     Muestra esta ayuda.
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printHelp();
    return;
  }

  const result = await runHostedPilotPreflight({
    baseUrl: readArg("--base-url") ?? process.env.APP_BASE_URL,
    expectedMode: readArg("--mode") ?? process.env.PILOT_PREVIEW_MODE,
    expectedBranch: readArg("--expected-branch"),
    expectedCommit: readArg("--expected-commit"),
  });

  console.log("GREENATICS hosted pilot preflight: PASS");
  console.log(`origin: ${result.origin}`);
  console.log(`mode: ${result.mode}`);
  console.log(`deployment: ${result.deployment.platform}/${result.deployment.environment}`);
  console.log(`branch: ${result.deployment.branch ?? "n/a"}`);
  console.log(`commit: ${result.deployment.commit ?? "n/a"}`);
  console.log(`checks: ${result.checks.join(", ")}`);
}

main().catch((error) => {
  console.error(`GREENATICS hosted pilot preflight: FAIL · ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
