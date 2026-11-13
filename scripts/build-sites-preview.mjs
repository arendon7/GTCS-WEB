#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { assertPreviewBuildCapacity } from "./preview-build-capacity.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "out");
const backupDir = path.join(root, `.out-backup-${process.pid}`);
const defaultHuellaUrl = "https://greenatics-huella-staging.onrender.com";
const rawHuellaUrl = process.env.NEXT_PUBLIC_HUELLA_APP_URL?.trim() || defaultHuellaUrl;
const nextCli = path.join(root, "node_modules/next/dist/bin/next");
const normalizeScript = path.join(root, "scripts/normalize-static-export.mjs");
const toolContractsScript = path.join(root, "scripts/check-tool-contracts.mjs");
const staticAuditScript = path.join(root, "scripts/audit-static.mjs");
const publicOutputScript = path.join(root, "scripts/check-public-output.mjs");

let huellaUrl;
try {
  huellaUrl = new URL(rawHuellaUrl);
} catch {
  throw new Error("NEXT_PUBLIC_HUELLA_APP_URL debe ser una URL absoluta HTTPS.");
}

if (
  huellaUrl.protocol !== "https:" ||
  huellaUrl.username ||
  huellaUrl.password ||
  huellaUrl.search ||
  huellaUrl.hash ||
  huellaUrl.pathname !== "/"
) {
  throw new Error("La URL de Huella debe ser HTTPS, pública, sin credenciales, query ni ruta base.");
}

const normalizedHost = huellaUrl.hostname.toLowerCase().replace(/^\[|\]$/g, "");
const ipv4 = normalizedHost.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
const octets = ipv4?.slice(1).map(Number);
const privateIpv4 = octets && (
  octets.some((octet) => octet > 255) ||
  octets[0] === 0 ||
  octets[0] === 10 ||
  octets[0] === 127 ||
  octets[0] === 169 && octets[1] === 254 ||
  octets[0] === 172 && octets[1] >= 16 && octets[1] <= 31 ||
  octets[0] === 192 && octets[1] === 168 ||
  octets[0] === 100 && octets[1] >= 64 && octets[1] <= 127
);
const privateHostname = normalizedHost === "localhost" ||
  normalizedHost.endsWith(".local") ||
  normalizedHost === "::1" ||
  normalizedHost.startsWith("fe80:") ||
  normalizedHost.startsWith("fc") ||
  normalizedHost.startsWith("fd");

if (privateIpv4 || privateHostname) {
  throw new Error("NEXT_PUBLIC_HUELLA_APP_URL no puede apuntar a localhost, una IP privada o una red local.");
}

for (const requiredPath of [nextCli, normalizeScript, toolContractsScript, staticAuditScript, publicOutputScript]) {
  if (!existsSync(requiredPath)) throw new Error(`Falta el recurso local requerido: ${path.relative(root, requiredPath)}`);
}

const buildEnv = {
  ...process.env,
  NEXT_PUBLIC_HUELLA_APP_URL: huellaUrl.origin,
};

function runNodeScript(scriptPath, args = []) {
  const result = spawnSync(process.execPath, [scriptPath, ...args], {
    cwd: root,
    env: buildEnv,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${path.relative(root, scriptPath)} failed with status ${result.status ?? "unknown"}.`);
  }
}

assertPreviewBuildCapacity(root);

if (existsSync(outputDir)) {
  if (lstatSync(outputDir).isSymbolicLink()) {
    throw new Error("Refusing to replace out/ because it is a symbolic link.");
  }
  if (existsSync(backupDir)) throw new Error(`A previous build backup already exists: ${path.basename(backupDir)}`);
  renameSync(outputDir, backupDir);
}

try {
  console.log(`Building the static Sites preview with Calcula tu Huella at ${huellaUrl.origin}/login`);
  runNodeScript(nextCli, ["build", "--webpack"]);
  runNodeScript(normalizeScript);
  runNodeScript(toolContractsScript, ["--static"]);
  runNodeScript(staticAuditScript);
  runNodeScript(publicOutputScript);

  if (existsSync(backupDir)) rmSync(backupDir, { recursive: true, force: true });
  console.log("Sites preview build PASS: tool contracts, static routes/assets/links, and public-output checks passed.");
  console.log("No archive was packaged and nothing was published or deployed.");
} catch (error) {
  if (existsSync(outputDir)) {
    if (lstatSync(outputDir).isSymbolicLink()) {
      throw new Error("Build failed and out/ became a symbolic link; refusing to remove it.", { cause: error });
    }
    rmSync(outputDir, { recursive: true, force: true });
  }
  if (existsSync(backupDir)) renameSync(backupDir, outputDir);
  throw error;
}
