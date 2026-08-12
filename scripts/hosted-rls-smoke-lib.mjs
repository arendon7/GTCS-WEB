import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { normalizePilotPlantCodes } from "./pilot-plant-codes.mjs";

export class RlsSmokeError extends Error {
  constructor(message) {
    super(message);
    this.name = "RlsSmokeError";
  }
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSupabaseUrl(value) {
  let url;
  try {
    url = new URL(clean(value));
  } catch {
    throw new RlsSmokeError("NEXT_PUBLIC_SUPABASE_URL no es una URL válida.");
  }

  if (url.protocol !== "https:" || url.username || url.password || (url.pathname !== "/" && url.pathname !== "")) {
    throw new RlsSmokeError("NEXT_PUBLIC_SUPABASE_URL debe ser un origen HTTPS sin credenciales ni ruta.");
  }
  return url.origin;
}

function decodeJwtPayload(value) {
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("payload");
    }
    return payload;
  } catch {
    throw new RlsSmokeError("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY parece un JWT inválido.");
  }
}

export function validatePublishableKey(value) {
  const key = clean(value);
  if (!key || key.length > 8192) {
    throw new RlsSmokeError("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY falta o tiene una longitud inválida.");
  }
  if (key.startsWith("sb_secret_")) {
    throw new RlsSmokeError("El smoke RLS no acepta una clave secreta de Supabase.");
  }

  const payload = decodeJwtPayload(key);
  if (payload?.role === "service_role") {
    throw new RlsSmokeError("El smoke RLS no acepta un JWT service_role; debe ejecutarse con la clave publicable/anon.");
  }
  return key;
}

function credential(env, emailName, passwordName) {
  const email = clean(env[emailName]).toLowerCase();
  const password = typeof env[passwordName] === "string" ? env[passwordName] : "";
  if (!email || !email.includes("@") || email.length > 320) {
    throw new RlsSmokeError(`${emailName} falta o no es un correo válido.`);
  }
  if (!password || password.length > 4096) {
    throw new RlsSmokeError(`${passwordName} falta o tiene una longitud inválida.`);
  }
  return Object.freeze({ email, password });
}

export function parseRlsSmokeConfig(env = process.env) {
  const url = normalizeSupabaseUrl(env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = validatePublishableKey(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const director = credential(env, "PILOT_DIRECTOR_EMAIL", "PILOT_DIRECTOR_PASSWORD");
  const operator = credential(env, "PILOT_OPERATOR_EMAIL", "PILOT_OPERATOR_PASSWORD");
  if (director.email === operator.email) {
    throw new RlsSmokeError("Director y operario deben ser usuarios distintos.");
  }

  const directorPlants = normalizePilotPlantCodes(env.PILOT_DIRECTOR_PLANTS || "TAM,YAR");
  const operatorPlants = normalizePilotPlantCodes(env.PILOT_OPERATOR_PLANTS || "TAM");
  const directorSet = new Set(directorPlants);
  const outsideDirectorScope = operatorPlants.filter((code) => !directorSet.has(code));
  if (outsideDirectorScope.length) {
    throw new RlsSmokeError(`El alcance esperado del operario no puede exceder al del director: ${outsideDirectorScope.join(", ")}.`);
  }

  return Object.freeze({ url, publishableKey, director, operator, directorPlants, operatorPlants });
}

function createUserClient(config, createClientImpl) {
  return createClientImpl(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

async function signIn(client, credentials, label) {
  const { error } = await client.auth.signInWithPassword(credentials);
  if (error) throw new RlsSmokeError(`No fue posible autenticar el usuario de prueba ${label}: ${error.message || "error remoto"}.`);
}

async function visiblePlants(client, label) {
  const { data, error } = await client.from("plants").select("code,name,active").order("code");
  if (error) throw new RlsSmokeError(`No fue posible consultar plantas como ${label}: ${error.message || "error remoto"}.`);
  if (!Array.isArray(data)) throw new RlsSmokeError(`Supabase devolvió una respuesta de plantas inválida para ${label}.`);

  return data.map((row) => ({
    code: String(row?.code || "").toUpperCase(),
    active: row?.active === true,
  }));
}

function assertExactVisibility(label, rows, expectedCodes) {
  const codes = rows.map((row) => row.code);
  if (codes.some((code) => !code) || new Set(codes).size !== codes.length) {
    throw new RlsSmokeError(`La visibilidad de ${label} contiene códigos vacíos o duplicados.`);
  }

  const visible = [...codes].sort();
  const expected = [...expectedCodes].sort();
  if (visible.length !== expected.length || visible.some((code, index) => code !== expected[index])) {
    throw new RlsSmokeError(`Visibilidad RLS inesperada para ${label}: esperado ${expected.join(",")}; visible ${visible.join(",") || "ninguna"}.`);
  }

  const inactive = rows.filter((row) => !row.active).map((row) => row.code);
  if (inactive.length) {
    throw new RlsSmokeError(`El usuario ${label} ve plantas piloto inactivas: ${inactive.join(",")}.`);
  }
  return Object.freeze(visible);
}

async function assertDeniedPlant(client, code) {
  const { data, error } = await client.from("plants").select("code").eq("code", code).maybeSingle();
  if (error) throw new RlsSmokeError(`La comprobación RLS explícita de ${code} falló con error remoto: ${error.message || "desconocido"}.`);
  if (data !== null) {
    throw new RlsSmokeError(`Fallo de aislamiento RLS: el operario pudo leer la planta ${code}.`);
  }
}

async function safeSignOut(client) {
  try {
    await client.auth.signOut();
  } catch {
    // Cleanup must not replace the primary smoke result.
  }
}

export async function runHostedRlsSmoke({ env = process.env, createClientImpl = createSupabaseClient } = {}) {
  const config = parseRlsSmokeConfig(env);
  const directorClient = createUserClient(config, createClientImpl);
  const operatorClient = createUserClient(config, createClientImpl);

  let directorSignedIn = false;
  let operatorSignedIn = false;
  try {
    await signIn(directorClient, config.director, "director");
    directorSignedIn = true;
    const directorRows = await visiblePlants(directorClient, "director");
    const directorVisible = assertExactVisibility("director", directorRows, config.directorPlants);

    await signIn(operatorClient, config.operator, "operario");
    operatorSignedIn = true;
    const operatorRows = await visiblePlants(operatorClient, "operario");
    const operatorVisible = assertExactVisibility("operario", operatorRows, config.operatorPlants);

    const operatorSet = new Set(config.operatorPlants);
    const deniedChecks = config.directorPlants.filter((code) => !operatorSet.has(code));
    for (const code of deniedChecks) await assertDeniedPlant(operatorClient, code);

    return Object.freeze({
      directorPlants: directorVisible,
      operatorPlants: operatorVisible,
      deniedChecks: Object.freeze([...deniedChecks]),
      checks: Object.freeze(["director-auth", "director-visibility", "operator-auth", "operator-visibility", "explicit-denial"]),
    });
  } finally {
    if (operatorSignedIn) await safeSignOut(operatorClient);
    if (directorSignedIn) await safeSignOut(directorClient);
  }
}
