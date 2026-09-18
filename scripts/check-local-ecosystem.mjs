#!/usr/bin/env node

const trimTrailingSlash = (value) => value.trim().replace(/\/$/, "");
const baseUrl = (name, fallback) => trimTrailingSlash(process.env[name] || fallback);
const joinUrl = (base, path) => `${trimTrailingSlash(base)}${path}`;

// Defaults preserve the original local layout; CI and staging can provide their own hosts.
const siteUrl = baseUrl("GREENATICS_SITE_URL", "http://localhost:3001");
const redUrl = baseUrl("GREENATICS_RED_URL", joinUrl(siteUrl, "/red/app"));
const huellaUrl = baseUrl("GREENATICS_HUELLA_URL", "http://127.0.0.1:8765");
const opsUrl = baseUrl("GREENATICS_OPS_URL", "http://localhost:3002");

const checks = [
  {
    label: "web pública",
    url: joinUrl(siteUrl, "/"),
    expected: (response, body) => response.status === 200 && body.includes("Greenatics"),
  },
  {
    label: "Centro Greenatics",
    url: joinUrl(siteUrl, "/plataforma/"),
    expected: (response, body) => response.status === 200 && body.includes("Centro Greenatics"),
  },
  {
    label: "GREENATICS Red",
    url: joinUrl(redUrl, "/"),
    expected: (response, body) => response.status === 200 && body.includes("GREENATICS Red"),
  },
  {
    label: "Huella health",
    url: joinUrl(huellaUrl, "/api/health"),
    expected: (response, body) => response.status === 200 && body.includes('"app":"Calcula tu Huella"'),
  },
  {
    label: "Huella login",
    url: joinUrl(huellaUrl, "/login"),
    expected: (response) => response.status === 200,
  },
  {
    label: "OPS health",
    url: joinUrl(opsUrl, "/api/health"),
    expected: (response, body) => response.status === 200 && body.includes('"mode":"local"'),
  },
  {
    label: "OPS login",
    url: joinUrl(opsUrl, "/login"),
    expected: (response) => response.status === 200,
  },
  {
    label: "OPS bloqueo anónimo",
    url: joinUrl(opsUrl, "/app"),
    expected: (response) => [302, 307].includes(response.status) && response.headers.get("location")?.includes("reason=configuration"),
  },
];

let failures = 0;

for (const check of checks) {
  try {
    const response = await fetch(check.url, { redirect: "manual" });
    const body = await response.text();
    if (!check.expected(response, body)) throw new Error(`respuesta inesperada (${response.status})`);
    console.log(`PASS ${check.label} · ${response.status}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${check.label} · ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures > 0) {
  console.error(`Local ecosystem QA FAIL: ${failures}/${checks.length} comprobaciones fallaron.`);
  process.exitCode = 1;
} else {
  console.log(`Local ecosystem QA PASS: ${checks.length} superficies verificadas.`);
}
