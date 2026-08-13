#!/usr/bin/env node

import { runVercelProtectedPilotPreflight } from "./vercel-protected-preflight-lib.mjs";

async function main() {
  const result = await runVercelProtectedPilotPreflight({
    onCleanupError: (error) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`GREENATICS Vercel protection cleanup: FAIL · ${message}`);
    },
  });

  console.log("GREENATICS protected hosted pilot preflight: PASS");
  console.log(`origin: ${result.origin}`);
  console.log(`mode: ${result.mode}`);
  console.log(`deployment: ${result.deployment.platform}/${result.deployment.environment}`);
  console.log(`branch: ${result.deployment.branch ?? "n/a"}`);
  console.log(`commit: ${result.deployment.commit ?? "n/a"}`);
  console.log(`checks: ${result.checks.join(", ")}`);
  console.log("protection-bypass: generated, used and revoked");
}

main().catch((error) => {
  console.error(`GREENATICS protected hosted pilot preflight: FAIL · ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
