#!/usr/bin/env node

import fs from "node:fs";
import pathModule from "node:path";

const staticOutput = process.argv.includes("--static");
const baseUrl = (process.env.GREENATICS_SITE_URL || "http://localhost:3001").replace(/\/$/, "");
const contracts = [
  ["/app/", "Explorar la estación", "#estacion"],
  ["/huella/", "Ver planes y precios", "#planes-heading-start"],
  ["/red/", "Abrir muestra de GREENATICS Red", "/red/app/"],
  ["/agroway/", "Explorar recorrido ilustrativo", "/agroway/app/"],
  ["/sana/", "Explorar recorrido ilustrativo", "/sana/app/"],
];

let failures = 0;

for (const [path, demoLabel, demoHref] of contracts) {
  try {
    let body;
    let status = 200;
    if (staticOutput) {
      const relativePath = path.replace(/^\/+|\/+$/g, "");
      body = fs.readFileSync(pathModule.join(process.cwd(), "out", relativePath, "index.html"), "utf8");
    } else {
      const response = await fetch(`${baseUrl}${path}`);
      status = response.status;
      body = await response.text();
    }
    const valid = status === 200
      && body.includes(demoLabel)
      && body.includes(demoHref)
      && (path !== "/huella/" || body.includes('href="/acceso/#calcula-tu-huella"') || body.includes("Abrir Calcula tu Huella") && /href="https:\/\/[^\"]+\/login"/.test(body))
      && (path !== "/acceso/" || body.includes('id="calcula-tu-huella"'))
      && body.includes('href="/herramientas/"')
      && body.includes('href="/"');
    if (!valid) throw new Error("landing, demo o navegación institucional incompleta");
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
  const target = staticOutput ? "HTML exportado" : baseUrl;
  console.log(`Tool contract QA PASS: ${contracts.length} landings verificadas en ${target}.`);
}
