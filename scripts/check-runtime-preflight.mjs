#!/usr/bin/env node

import fs from "node:fs";

const timeoutMs = 8_000;
const localConfig = readLocalConfig();
const strictPublic = process.env.STRICT_PUBLIC_RUNTIME_PREFLIGHT === "true";
const results = { verified: 0, local: 0, configOnly: 0, unconfigured: 0 };

const targets = [
  {
    key: "OPS",
    env: "NEXT_PUBLIC_OPS_APP_URL",
    fallback: "https://greenatics-ops.vercel.app",
    health: true,
    login: true,
    protectedPath: "/app",
  },
  {
    key: "HUELLA",
    env: "NEXT_PUBLIC_HUELLA_APP_URL",
    health: true,
    login: true,
  },
  {
    key: "RED",
    env: "NEXT_PUBLIC_RED_APP_URL",
    health: false,
    login: false,
    readiness: true,
  },
];

function readLocalConfig() {
  const values = {};
  for (const filename of [".env", ".env.local"]) {
    if (!fs.existsSync(filename)) continue;
    for (const line of fs.readFileSync(filename, "utf8").split(/\r?\n/)) {
      const match = line.match(/^\s*(NEXT_PUBLIC_(?:HUELLA|OPS|RED)_APP_URL)\s*=\s*(.*?)\s*$/);
      if (!match) continue;
      values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
  return values;
}

function configuredValue(target) {
  return process.env[target.env]?.trim() || localConfig[target.env]?.trim() || target.fallback || "";
}

function normalizeOrigin(value, label) {
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label}: URL inválida.`);
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error(`${label}: no puede contener credenciales, query ni fragmento.`);
  }
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && isPrivateOrLocalHost(parsed.hostname))) {
    throw new Error(`${label}: debe ser un origen HTTPS público o un origen HTTP local.`);
  }
  return parsed.origin;
}

function isPrivateOrLocalHost(hostname) {
  const normalized = hostname.toLowerCase();
  if (normalized === "localhost" || normalized.endsWith(".local") || normalized === "::1") return true;
  const ipv4 = normalized.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) return normalized.startsWith("127.") || normalized.startsWith("fe80:") || normalized.startsWith("fc") || normalized.startsWith("fd");
  const [first, second] = ipv4.slice(1).map(Number);
  return first === 0 || first === 10 || first === 127 || (first === 169 && second === 254) || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168) || (first === 100 && second >= 64 && second <= 127);
}

async function request(origin, pathname) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(`${origin}${pathname}`, {
      redirect: "manual",
      signal: controller.signal,
      headers: { "user-agent": "greenatics-runtime-preflight/1.0" },
    });
  } finally {
    clearTimeout(timer);
  }
}

async function checkTarget(target) {
  const raw = configuredValue(target);
  if (!raw) {
    results.unconfigured += 1;
    if (strictPublic) throw new Error(`${target.key} no tiene un runtime configurado para este entorno.`);
    console.log(`SKIP ${target.key} · no hay runtime externo configurado.`);
    return;
  }

  const origin = normalizeOrigin(raw, `${target.key} runtime`);
  const host = new URL(origin).hostname;
  if (isPrivateOrLocalHost(host)) {
    if (strictPublic) throw new Error(`${target.key} apunta a ${host}; se esperaba un runtime HTTPS público.`);
    results.local += 1;
    console.log(`LOCAL ${target.key} · ${host} · se omite preflight externo (usa STRICT_PUBLIC_RUNTIME_PREFLIGHT=true para bloquearlo).`);
    return;
  }
  const checks = [];

  if (target.health) {
    const response = await request(origin, "/api/health");
    if (response.status !== 200) throw new Error(`${target.key} /api/health respondió HTTP ${response.status}.`);
    let payload = {};
    try {
      payload = await response.json();
    } catch {
      throw new Error(`${target.key} /api/health no devolvió JSON.`);
    }
    if (payload.status && !["ok", "ready"].includes(payload.status)) {
      throw new Error(`${target.key} /api/health reportó status=${String(payload.status)}.`);
    }
    checks.push(`health:${payload.status || "200"}`);
  }

  if (target.login) {
    const response = await request(origin, "/login");
    if (response.status !== 200) throw new Error(`${target.key} /login respondió HTTP ${response.status}.`);
    checks.push("login:200");
  }

  if (target.readiness) {
    const response = await request(origin, "/api/ready");
    if (response.status !== 200) throw new Error(`${target.key} /api/ready respondió HTTP ${response.status}.`);
    let payload = {};
    try {
      payload = await response.json();
    } catch {
      throw new Error(`${target.key} /api/ready no devolvió JSON.`);
    }
    if (
      payload.status !== "ready" || payload.application !== "GREENATICS RED" ||
      payload.project_workspaces !== 4 || payload.drive_backup_verified !== true
    ) {
      throw new Error(`${target.key} /api/ready no confirmó el expediente RED completo y su respaldo.`);
    }
    checks.push("readiness:ready");
  }

  if (target.protectedPath) {
    const response = await request(origin, target.protectedPath);
    const location = response.headers.get("location") || "";
    const protectedResponse = response.status === 200 || (response.status >= 300 && response.status < 400 && /login/i.test(location));
    if (!protectedResponse) {
      throw new Error(`${target.key} ${target.protectedPath} no conserva el contrato de acceso (HTTP ${response.status}).`);
    }
    checks.push(response.status === 200 ? "app:200" : "app:login-redirect");
  }

  if (checks.length === 0) {
    results.configOnly += 1;
    if (strictPublic) throw new Error(`${target.key} no tiene un endpoint de salud o acceso definido; la disponibilidad no puede verificarse.`);
    console.log(`CONFIG ${target.key} · ${host} · origen HTTPS configurado; alcance y disponibilidad no verificados (sin endpoint de salud o acceso definido).`);
    return;
  }

  results.verified += 1;
  console.log(`PASS ${target.key} · ${host} · ${checks.join(" · ")}`);
}

let failures = 0;
for (const target of targets) {
  try {
    await checkTarget(target);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${target.key} · ${error instanceof Error ? error.message : String(error)}`);
  }
}

if (failures > 0) {
  console.error(`Runtime preflight FAIL: ${failures} runtime(s) requieren atención.`);
  process.exitCode = 1;
} else {
  const summary = `${results.verified} verificados por HTTP · ${results.local} locales omitidos · ${results.configOnly} solo configuración · ${results.unconfigured} sin configurar`;
  if (results.configOnly > 0 || results.unconfigured > 0) {
    console.log(`Runtime preflight PARTIAL: ${summary}. La disponibilidad pública sigue pendiente para los destinos no verificados.`);
  } else if (results.verified === 0) {
    console.log(`Runtime preflight LOCAL ONLY: ${summary}. No se verificó disponibilidad pública.`);
  } else {
    console.log(`Runtime preflight PASS: ${summary}.`);
  }
}
