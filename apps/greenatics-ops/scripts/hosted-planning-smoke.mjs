#!/usr/bin/env node

import { runHostedPlanningSmoke } from "./hosted-planning-smoke-lib.mjs";

function printHelp() {
  console.log(`GREENATICS hosted plan-vs-real smoke · escritura temporal autocontenible

Uso:
  npm run pilot:planning-smoke

Variables requeridas:
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  SUPABASE_SECRET_KEY
  PILOT_DIRECTOR_EMAIL
  PILOT_DIRECTOR_PASSWORD
  PILOT_OPERATOR_EMAIL
  PILOT_OPERATOR_PASSWORD

Opcional:
  PILOT_PLANNING_PLANT   Default: TAM

El smoke crea una programación temporal como Director, exige denegación de programación al Operario, inicia y finaliza esa actividad como Operario, valida planned → running → done y el vínculo schedule → actividad real, y limpia únicamente los IDs UAT creados.
`);
}

async function main() {
  if (process.argv.includes("--help")) {
    printHelp();
    return;
  }
  if (process.argv.length > 2) throw new Error("pilot:planning-smoke no acepta argumentos CLI; usa variables de entorno.");

  const result = await runHostedPlanningSmoke();
  console.log("GREENATICS hosted plan-vs-real smoke: PASS");
  console.log(`plant: ${result.plantCode}`);
  console.log(`template: ${result.templateCode}`);
  console.log(`worker: ${result.workerName}`);
  console.log(`equipment: ${result.equipmentCode || "not-required"}`);
  console.log(`checks: ${result.checks.join(", ")}`);
}

main().catch((error) => {
  console.error(`GREENATICS hosted plan-vs-real smoke: FAIL · ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
