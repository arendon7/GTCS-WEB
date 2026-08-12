#!/usr/bin/env node

import { runHostedBackendPreflight } from "./hosted-backend-preflight-lib.mjs";
import { DEFAULT_PILOT_PLANT_CODES } from "./pilot-plant-codes.mjs";

function readArg(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`Falta valor para ${name}.`);
  return value;
}

function printHelp() {
  console.log(`GREENATICS hosted backend preflight

Uso:
  npm run pilot:backend-preflight -- [opciones]

Opciones:
  --plants <codes>          Códigos o alias separados por coma. Default: TAM,YAR.
  --require-no-director     Falla si ya existe un director activo.
  --help                    Muestra esta ayuda.

Variables requeridas:
  NEXT_PUBLIC_SUPABASE_URL
  SUPABASE_SECRET_KEY
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printHelp();
    return;
  }

  const result = await runHostedBackendPreflight({
    plants: readArg("--plants") ?? DEFAULT_PILOT_PLANT_CODES,
    requireNoDirector: process.argv.includes("--require-no-director"),
  });

  console.log("GREENATICS hosted backend preflight: PASS");
  console.log(`project: ${new URL(result.projectOrigin).hostname}`);
  console.log(`plants: ${result.plants.map((plant) => `${plant.code}=${plant.name}`).join(", ")}`);
  console.log(`director-state: ${result.directorState} (${result.activeDirectors})`);
  console.log(`checks: ${result.checks.join(", ")}`);
}

main().catch((error) => {
  console.error(`GREENATICS hosted backend preflight: FAIL · ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
