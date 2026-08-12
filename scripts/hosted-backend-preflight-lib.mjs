import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_PILOT_PLANT_CODES, normalizePilotPlantCodes } from "./pilot-plant-codes.mjs";

export class BackendPreflightError extends Error {
  constructor(message) {
    super(message);
    this.name = "BackendPreflightError";
  }
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeHostedSupabaseUrl(value) {
  const raw = clean(value);
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new BackendPreflightError("NEXT_PUBLIC_SUPABASE_URL no es una URL válida.");
  }

  if (url.protocol !== "https:" || url.username || url.password || (url.pathname !== "/" && url.pathname !== "")) {
    throw new BackendPreflightError("NEXT_PUBLIC_SUPABASE_URL debe ser un origen HTTPS sin credenciales ni ruta.");
  }
  return url.origin;
}

export function parseHostedBackendConfig(env = process.env) {
  const url = normalizeHostedSupabaseUrl(env.NEXT_PUBLIC_SUPABASE_URL);
  const secret = clean(env.SUPABASE_SECRET_KEY);
  if (!secret || secret.length > 4096) {
    throw new BackendPreflightError("SUPABASE_SECRET_KEY falta o tiene una longitud inválida.");
  }
  return Object.freeze({ url, secret });
}

function requireRows(data, error, label) {
  if (error) throw new BackendPreflightError(`${label}: ${error.message || "error remoto"}.`);
  if (!Array.isArray(data)) throw new BackendPreflightError(`${label}: respuesta inválida.`);
  return data;
}

export async function runHostedBackendPreflight({
  env = process.env,
  plants = DEFAULT_PILOT_PLANT_CODES,
  requireNoDirector = false,
  createClientImpl = createSupabaseClient,
} = {}) {
  const config = parseHostedBackendConfig(env);
  const requestedCodes = normalizePilotPlantCodes(plants);
  const admin = createClientImpl(config.url, config.secret, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  const plantResponse = await admin
    .from("plants")
    .select("code,name,active")
    .in("code", requestedCodes);
  const plantRows = requireRows(plantResponse.data, plantResponse.error, "No fue posible validar las plantas");
  const byCode = new Map(plantRows.map((row) => [String(row.code || "").toUpperCase(), row]));

  const missing = requestedCodes.filter((code) => !byCode.has(code));
  if (missing.length) {
    throw new BackendPreflightError(`Faltan plantas solicitadas en Supabase: ${missing.join(", ")}.`);
  }

  const inactive = requestedCodes.filter((code) => !byCode.get(code)?.active);
  if (inactive.length) {
    throw new BackendPreflightError(`Hay plantas solicitadas inactivas: ${inactive.join(", ")}.`);
  }

  const { error: authError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (authError) {
    throw new BackendPreflightError(`No fue posible validar Supabase Auth Admin: ${authError.message || "error remoto"}.`);
  }

  const directorResponse = await admin
    .from("plant_memberships")
    .select("user_id", { head: true, count: "exact" })
    .eq("role", "director")
    .eq("active", true);
  if (directorResponse.error) {
    throw new BackendPreflightError(`No fue posible validar el estado del director: ${directorResponse.error.message || "error remoto"}.`);
  }
  const activeDirectors = Number(directorResponse.count ?? 0);
  if (!Number.isInteger(activeDirectors) || activeDirectors < 0) {
    throw new BackendPreflightError("Supabase devolvió un conteo de directores inválido.");
  }
  if (requireNoDirector && activeDirectors > 0) {
    throw new BackendPreflightError(`Ya existe ${activeDirectors} director activo; el bootstrap inicial debe permanecer bloqueado.`);
  }

  return Object.freeze({
    projectOrigin: config.url,
    plants: Object.freeze(requestedCodes.map((code) => Object.freeze({
      code,
      name: String(byCode.get(code)?.name || code),
      active: true,
    }))),
    activeDirectors,
    directorState: activeDirectors === 0 ? "empty" : "present",
    checks: Object.freeze(["database", "auth-admin", "plants", "director-state"]),
  });
}
