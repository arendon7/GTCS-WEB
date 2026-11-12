#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";
import { runLocalHttpChecks } from "./local-http-checks.mjs";

const trimTrailingSlash = (value) => value.trim().replace(/\/$/, "");
const baseUrl = (env, name, fallback) => trimTrailingSlash(env[name] || fallback);
const joinUrl = (base, path) => `${trimTrailingSlash(base)}${path}`;

export function getLocalEcosystemChecks(env = process.env) {
  const siteUrl = baseUrl(env, "GREENATICS_SITE_URL", "http://127.0.0.1:4173");
  const redUrl = baseUrl(env, "GREENATICS_RED_URL", joinUrl(siteUrl, "/red/app"));
  const huellaUrl = baseUrl(env, "GREENATICS_HUELLA_URL", "http://127.0.0.1:8765");
  const opsUrl = baseUrl(env, "GREENATICS_OPS_URL", "http://localhost:3002");
  const expectOpsLocalBypass = env.GREENATICS_OPS_EXPECT_LOCAL_BYPASS === "true";

  return [
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
    label: expectOpsLocalBypass ? "OPS acceso de muestra en bypass local" : "OPS bloqueo anónimo",
    url: joinUrl(opsUrl, "/app"),
    redirect: "manual",
    expected: (response, body) => expectOpsLocalBypass
      ? response.status === 200 && body.includes("GREENATICS OPS")
      : [302, 307].includes(response.status) && response.headers.get("location")?.includes("reason=configuration"),
  },
  ];
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await runLocalHttpChecks(getLocalEcosystemChecks());
}
