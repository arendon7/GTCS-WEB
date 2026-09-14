#!/usr/bin/env node

import fs from "node:fs";

const runtimeVariables = [
  "NEXT_PUBLIC_HUELLA_APP_URL",
  "NEXT_PUBLIC_OPS_APP_URL",
  "NEXT_PUBLIC_RED_APP_URL",
];

const failures = [];

function readLocalRuntimeConfig() {
  const values = {};
  for (const filename of [".env", ".env.local"]) {
    if (!fs.existsSync(filename)) continue;
    for (const line of fs.readFileSync(filename, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*(NEXT_PUBLIC_(?:HUELLA|OPS|RED)_APP_URL)\s*=\s*(.*?)\s*$/);
      if (!match) continue;
      values[match[1]] = match[2].replace(/^(["'])(.*)\1$/, "$2");
    }
  }
  return values;
}

const localConfig = readLocalRuntimeConfig();
const runtimeValue = (variable) => process.env[variable]?.trim() ?? localConfig[variable]?.trim() ?? "";

for (const variable of runtimeVariables) {
  const rawValue = runtimeValue(variable);
  if (!rawValue) continue;

  let parsed;
  try {
    parsed = new URL(rawValue);
  } catch {
    failures.push(`${variable} no es una URL absoluta válida.`);
    continue;
  }

  if (!new Set(["https:", "http:"]).has(parsed.protocol)) {
    failures.push(`${variable} debe usar http:// o https://.`);
  }

  if (parsed.username || parsed.password) {
    failures.push(`${variable} no puede contener credenciales.`);
  }

  if (parsed.hash || parsed.search) {
    failures.push(`${variable} no debe contener query string ni fragmento.`);
  }

  if (parsed.hostname === "example.com" || parsed.hostname.endsWith(".example.com")) {
    failures.push(`${variable} todavía apunta a un dominio de ejemplo.`);
  }
}

if (failures.length > 0) {
  console.error("Runtime config FAIL:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  const configured = runtimeVariables.filter((variable) => runtimeValue(variable)).length;
  console.log(`Runtime config PASS: ${configured}/${runtimeVariables.length} URLs externas configuradas.`);
}
