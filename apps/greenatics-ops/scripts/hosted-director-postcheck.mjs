#!/usr/bin/env node

import { runHostedBackendPreflight } from "./hosted-backend-preflight-lib.mjs";
import { DEFAULT_PILOT_PLANT_CODES } from "./pilot-plant-codes.mjs";

async function main() {
  const result = await runHostedBackendPreflight({
    plants: DEFAULT_PILOT_PLANT_CODES,
    requireDirector: true,
  });

  console.log("GREENATICS hosted director postcheck: PASS");
  console.log(`plants: ${result.plants.map((plant) => plant.code).join(",")}`);
  console.log(`director-state: ${result.directorState} (${result.activeDirectors})`);
}

main().catch((error) => {
  console.error(`GREENATICS hosted director postcheck: FAIL · ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
