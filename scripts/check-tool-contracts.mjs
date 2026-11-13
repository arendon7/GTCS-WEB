#!/usr/bin/env node

import fs from "node:fs";
import pathModule from "node:path";
import { fileURLToPath } from "node:url";

const contracts = [
  ["/acceso/", null, null],
  ["/app/", "Explorar la muestra pública", "#estacion"],
  ["/huella/", "Planes y precios", 'href="#planes"'],
  ["/red/", "Abrir la estación con datos ficticios", "/red/app/"],
  ["/agroway/", "Abrir la demo navegable", "/agroway/app/"],
  ["/sana/", "Recorrer la muestra", "/sana/app/#overview"],
];

function hasHonestHuellaEntry(body) {
  const publicLogin = /href="https:\/\/[^\"]+\/login"[^>]*>Entrar a la plataforma/.test(body);
  const accessDirectory = body.includes('href="/acceso/#calcula-tu-huella"');
  const localPreview = body.includes('href="#plataforma">Ver cómo funciona')
    && body.includes("El acceso local es solo para pruebas y requiere que el servidor de Calcula tu Huella esté iniciado en este equipo.");

  return publicLogin || accessDirectory || localPreview;
}

function hasHuellaPricingLink(body) {
  return body.includes('href="#planes"') && /planes y precios/i.test(body);
}

function hasHuellaAccessPortal(body) {
  const cardStart = body.indexOf('id="calcula-tu-huella"');
  const cardEnd = cardStart < 0 ? -1 : body.indexOf("</article>", cardStart);
  if (cardStart < 0 || cardEnd < 0) return false;

  const card = body.slice(cardStart, cardEnd);
  const configuredLogin = /href="https:\/\/[^\"]+\/login"/.test(card)
    && card.includes("Entrar a Back 2 Green");
  const publicLanding = card.includes('href="/huella/"')
    && card.includes("Ver recorrido y planes");

  return configuredLogin || publicLanding;
}

export async function runToolContractChecks({
  staticOutput = process.argv.includes("--static"),
  baseUrl = process.env.GREENATICS_SITE_URL || "http://127.0.0.1:4173",
  projectRoot = process.cwd(),
  fetchImpl = fetch,
  writeLine = (line) => process.stdout.write(`${line}\n`),
  writeError = (line) => process.stderr.write(`${line}\n`),
} = {}) {
  const origin = baseUrl.replace(/\/$/, "");
  let passed = 0;
  let failures = 0;
  let blocked = 0;

  for (const [route, demoLabel, demoHref] of contracts) {
    let body;
    let status = 200;
    try {
      if (staticOutput) {
        const relativePath = route.replace(/^\/+|\/+$/g, "");
        body = fs.readFileSync(pathModule.join(projectRoot, "out", relativePath, "index.html"), "utf8");
      } else {
        const response = await fetchImpl(`${origin}${route}`);
        status = response.status;
        body = await response.text();
      }
    } catch (error) {
      blocked += 1;
      const detail = error instanceof Error ? error.message : String(error);
      writeError(`BLOCKED ${route} · ${staticOutput ? "export no disponible" : "sitio no accesible"}${detail ? ` (${detail})` : ""}`);
      continue;
    }

    const hasExpectedAction = route === "/acceso/"
      ? hasHuellaAccessPortal(body)
      : body.includes(demoLabel) && body.includes(demoHref);

    const valid = status === 200
      && hasExpectedAction
      && (route !== "/huella/" || hasHonestHuellaEntry(body))
      && (route !== "/huella/" || hasHuellaPricingLink(body))
      && (route !== "/acceso/" || hasHuellaAccessPortal(body))
      && body.includes('href="/herramientas/"')
      && body.includes('href="/"');

    if (!valid) {
      failures += 1;
      writeError(`FAIL ${route} · landing, demo o navegación institucional incompleta (HTTP ${status})`);
      continue;
    }

    passed += 1;
    writeLine(`PASS ${route} · landing + demo + navegación`);
  }

  const target = staticOutput ? "HTML exportado" : origin;
  if (failures > 0) {
    writeError(`Tool contract QA FAIL: ${failures} defecto(s), ${blocked} bloqueo(s), ${passed} aprobado(s).`);
    return 1;
  }
  if (blocked > 0) {
    writeError(`Tool contract QA BLOCKED: ${blocked}/${contracts.length} rutas no verificables; ${passed} aprobadas en ${target}.`);
    return 2;
  }

  writeLine(`Tool contract QA PASS: ${passed} landings verificadas en ${target}.`);
  return 0;
}

if (process.argv[1] && pathModule.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await runToolContractChecks();
}
