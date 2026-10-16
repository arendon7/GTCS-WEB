#!/usr/bin/env node

const baseUrl = (process.env.GREENATICS_SITE_URL || "http://localhost:3001").replace(/\/$/, "");
const contracts = [
  ["/app/", "Explorar estación demo", "/app/#estacion"],
  ["/huella/", "Explorar estimador demo", "/huella/#calculadora"],
  ["/red/", "Entrar a la estación demo", "/red/app/", "la disponibilidad y los permisos se confirman al ingresar"],
  ["/agroway/", "Entrar como usuario demo", "/agroway/app/"],
  ["/sana/", "Entrar como usuario demo", "/sana/app/"],
];

let failures = 0;

for (const [path, demoLabel, demoHref, requiredCopy] of contracts) {
  try {
    const response = await fetch(`${baseUrl}${path}`);
    const body = await response.text();
    const valid = response.status === 200
      && body.includes(demoLabel)
      && body.includes(demoHref)
      && body.includes('href="/herramientas/"')
      && body.includes('href="/"')
      && (!requiredCopy || body.includes(requiredCopy))
      && (path !== "/red/" || !body.includes("Espacio operativo conectado"));
    if (!valid) throw new Error("landing, demo, estado de acceso o navegación institucional incompleta");
    console.log(`PASS ${path} · landing + demo + navegación`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${path} · ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures > 0) {
  console.error(`Tool contract QA FAIL: ${failures}/${contracts.length} landings fallaron.`);
  process.exitCode = 1;
} else {
  console.log(`Tool contract QA PASS: ${contracts.length} landings verificadas.`);
}
