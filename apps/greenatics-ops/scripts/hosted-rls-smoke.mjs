#!/usr/bin/env node

import { runHostedRlsSmoke } from "./hosted-rls-smoke-lib.mjs";

function printHelp() {
  console.log(`GREENATICS hosted RLS smoke · solo lectura

Uso:
  npm run pilot:rls-smoke

Variables requeridas:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  PILOT_DIRECTOR_EMAIL
  PILOT_DIRECTOR_PASSWORD
  PILOT_OPERATOR_EMAIL
  PILOT_OPERATOR_PASSWORD

Opcionales:
  PILOT_DIRECTOR_PLANTS   Default: TAM,YAR
  PILOT_OPERATOR_PLANTS   Default: TAM

Las credenciales se leen únicamente desde variables de entorno. No se aceptan por argumentos CLI y no se imprimen en la salida.
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printHelp();
    return;
  }
  if (process.argv.length > 2) {
    throw new Error("pilot:rls-smoke no acepta argumentos CLI; usa variables de entorno para credenciales y alcance esperado.");
  }

  const result = await runHostedRlsSmoke();
  console.log("GREENATICS hosted RLS smoke: PASS");
  console.log(`director-plants: ${result.directorPlants.join(",")}`);
  console.log(`operator-plants: ${result.operatorPlants.join(",")}`);
  console.log(`denied-checks: ${result.deniedChecks.join(",") || "none"}`);
  console.log(`checks: ${result.checks.join(", ")}`);
}

main().catch((error) => {
  console.error(`GREENATICS hosted RLS smoke: FAIL · ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
