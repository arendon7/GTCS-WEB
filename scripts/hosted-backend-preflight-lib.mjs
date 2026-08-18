import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_PILOT_PLANT_CODES, normalizePilotPlantCodes } from "./pilot-plant-codes.mjs";

export const HOSTED_SCHEMA_CONTRACT_VERSION = "0051";

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

function parseNonNegativeInteger(value, label) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) {
    throw new BackendPreflightError(`${label}: conteo inválido.`);
  }
  return number;
}

function validateSchemaContract(data, error, requestedCodes) {
  const rows = requireRows(data, error, "No fue posible validar el contrato de esquema hospedado");
  if (rows.length !== 1 || !rows[0] || typeof rows[0] !== "object") {
    throw new BackendPreflightError("Contrato de esquema hospedado: se esperaba exactamente una fila.");
  }

  const row = rows[0];
  const version = clean(row.schema_contract);
  if (version !== HOSTED_SCHEMA_CONTRACT_VERSION) {
    throw new BackendPreflightError(
      `Contrato de esquema hospedado desactualizado: esperado ${HOSTED_SCHEMA_CONTRACT_VERSION}, recibido ${version || "vacío"}.`,
    );
  }

  const publicTableCount = parseNonNegativeInteger(row.public_table_count, "Contrato de esquema hospedado");
  const rlsEnabledTableCount = parseNonNegativeInteger(row.rls_enabled_table_count, "Contrato de esquema hospedado");
  if (publicTableCount === 0 || rlsEnabledTableCount !== publicTableCount) {
    throw new BackendPreflightError(
      `Contrato de esquema hospedado: RLS incompleto (${rlsEnabledTableCount}/${publicTableCount} tablas públicas).`,
    );
  }

  let pilotPlantCodes;
  try {
    pilotPlantCodes = normalizePilotPlantCodes(Array.isArray(row.pilot_plant_codes) ? row.pilot_plant_codes : []);
  } catch (error_) {
    throw new BackendPreflightError(
      `Contrato de esquema hospedado: plantas inválidas (${error_ instanceof Error ? error_.message : String(error_)}).`,
    );
  }
  const missingContractPlants = requestedCodes.filter((code) => !pilotPlantCodes.includes(code));
  if (missingContractPlants.length) {
    throw new BackendPreflightError(
      `Contrato de esquema hospedado no contiene las plantas solicitadas: ${missingContractPlants.join(", ")}.`,
    );
  }

  return Object.freeze({
    version,
    publicTableCount,
    rlsEnabledTableCount,
    pilotPlantCodes,
    activeDirectors: parseNonNegativeInteger(row.active_directors, "Contrato de esquema hospedado"),
  });
}

export async function runHostedBackendPreflight({
  env = process.env,
  plants = DEFAULT_PILOT_PLANT_CODES,
  requireNoDirector = false,
  requireDirector = false,
  createClientImpl = createSupabaseClient,
} = {}) {
  if (requireNoDirector && requireDirector) {
    throw new BackendPreflightError("El preflight no puede exigir simultáneamente ausencia y presencia de director.");
  }

  const config = parseHostedBackendConfig(env);
  const requestedCodes = normalizePilotPlantCodes(plants);
  const admin = createClientImpl(config.url, config.secret, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  const schemaContractResponse = await admin.rpc("admin_hosted_schema_contract");
  const schemaContract = validateSchemaContract(
    schemaContractResponse.data,
    schemaContractResponse.error,
    requestedCodes,
  );

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
    .select("user_id")
    .eq("role", "director")
    .eq("active", true);
  const directorRows = requireRows(
    directorResponse.data,
    directorResponse.error,
    "No fue posible validar el estado del director",
  );
  const directorUserIds = directorRows.map((row) => clean(row?.user_id));
  if (directorUserIds.some((userId) => !userId)) {
    throw new BackendPreflightError("Estado del director: se encontró una membresía activa sin user_id válido.");
  }
  const activeDirectors = new Set(directorUserIds).size;
  if (schemaContract.activeDirectors !== activeDirectors) {
    throw new BackendPreflightError(
      `Estado del director cambió durante el preflight (${schemaContract.activeDirectors} → ${activeDirectors}); vuelve a ejecutar el gate.`,
    );
  }
  if (requireNoDirector && activeDirectors > 0) {
    throw new BackendPreflightError(`Ya existe ${activeDirectors} director activo; el bootstrap inicial debe permanecer bloqueado.`);
  }
  if (requireDirector && activeDirectors === 0) {
    throw new BackendPreflightError("No existe ningún director activo; el bootstrap inicial todavía no quedó confirmado.");
  }

  return Object.freeze({
    projectOrigin: config.url,
    schemaContract,
    plants: Object.freeze(requestedCodes.map((code) => Object.freeze({
      code,
      name: String(byCode.get(code)?.name || code),
      active: true,
    }))),
    activeDirectors,
    directorState: activeDirectors === 0 ? "empty" : "present",
    checks: Object.freeze(["schema-contract", "database", "auth-admin", "plants", "director-state"]),
  });
}
