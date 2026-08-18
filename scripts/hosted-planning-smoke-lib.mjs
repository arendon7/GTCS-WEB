import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { normalizePilotPlantCodes } from "./pilot-plant-codes.mjs";

export class HostedPlanningSmokeError extends Error {
  constructor(message) {
    super(message);
    this.name = "HostedPlanningSmokeError";
  }
}

function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

function requireCredential(env, emailName, passwordName) {
  const email = clean(env[emailName]).toLowerCase();
  const password = typeof env[passwordName] === "string" ? env[passwordName] : "";
  if (!email || !email.includes("@") || email.length > 320) throw new HostedPlanningSmokeError(`${emailName} falta o no es válido.`);
  if (!password || password.length > 4096) throw new HostedPlanningSmokeError(`${passwordName} falta o no es válido.`);
  return Object.freeze({ email, password });
}

function normalizeUrl(value) {
  let url;
  try { url = new URL(clean(value)); } catch { throw new HostedPlanningSmokeError("NEXT_PUBLIC_SUPABASE_URL no es una URL válida."); }
  if (url.protocol !== "https:" || url.username || url.password || (url.pathname !== "/" && url.pathname !== "")) {
    throw new HostedPlanningSmokeError("NEXT_PUBLIC_SUPABASE_URL debe ser un origen HTTPS sin credenciales ni ruta.");
  }
  return url.origin;
}

function decodeJwtPayload(value) {
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : null;
  } catch {
    throw new HostedPlanningSmokeError("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY parece un JWT inválido.");
  }
}

function validatePublishableKey(value) {
  const key = clean(value);
  if (!key || key.length > 8192 || key.startsWith("sb_secret_")) {
    throw new HostedPlanningSmokeError("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY falta o no es publicable.");
  }
  const payload = decodeJwtPayload(key);
  if (payload?.role === "service_role") {
    throw new HostedPlanningSmokeError("El smoke de planificación no acepta una clave service_role como clave publicable.");
  }
  return key;
}

export function parseHostedPlanningSmokeConfig(env = process.env) {
  const url = normalizeUrl(env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = validatePublishableKey(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const secretKey = clean(env.SUPABASE_SECRET_KEY);
  if (!secretKey || secretKey.length > 4096) throw new HostedPlanningSmokeError("SUPABASE_SECRET_KEY falta o no es válida.");
  const director = requireCredential(env, "PILOT_DIRECTOR_EMAIL", "PILOT_DIRECTOR_PASSWORD");
  const operator = requireCredential(env, "PILOT_OPERATOR_EMAIL", "PILOT_OPERATOR_PASSWORD");
  if (director.email === operator.email) throw new HostedPlanningSmokeError("Director y operario deben ser usuarios distintos.");
  const [plantCode] = normalizePilotPlantCodes(env.PILOT_PLANNING_PLANT || "TAM");
  return Object.freeze({ url, publishableKey, secretKey, director, operator, plantCode });
}

function createUserClient(config, createClientImpl) {
  return createClientImpl(config.url, config.publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function createAdminClient(config, createClientImpl) {
  return createClientImpl(config.url, config.secretKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

async function signIn(client, credentials, label) {
  const { error } = await client.auth.signInWithPassword(credentials);
  if (error) throw new HostedPlanningSmokeError(`No fue posible autenticar ${label}: ${error.message || "error remoto"}.`);
}

async function safeSignOut(client) {
  try { await client.auth.signOut(); } catch { /* cleanup best effort */ }
}

async function single(query, label) {
  const { data, error } = await query.maybeSingle();
  if (error) throw new HostedPlanningSmokeError(`${label}: ${error.message || "error remoto"}.`);
  if (!data) throw new HostedPlanningSmokeError(`${label}: no se encontró un registro requerido.`);
  return data;
}

async function discoverResources(admin, plantCode) {
  const plant = await single(admin.from("plants").select("id,code,name,active").eq("code", plantCode).eq("active", true), `Planta piloto ${plantCode}`);
  const { data: templates, error: templateError } = await admin
    .from("activity_templates")
    .select("id,plant_id,process_id,code,name,requires_equipment,active")
    .eq("plant_id", plant.id)
    .eq("active", true)
    .order("requires_equipment", { ascending: true })
    .order("code");
  if (templateError) throw new HostedPlanningSmokeError(`No fue posible consultar plantillas: ${templateError.message || "error remoto"}.`);
  if (!Array.isArray(templates) || templates.length === 0) throw new HostedPlanningSmokeError(`La planta ${plantCode} no tiene plantillas activas para certificar planificación.`);

  const { data: workers, error: workerError } = await admin
    .from("employees")
    .select("id,plant_id,display_name,active")
    .eq("plant_id", plant.id)
    .eq("active", true)
    .order("display_name");
  if (workerError) throw new HostedPlanningSmokeError(`No fue posible consultar trabajadores: ${workerError.message || "error remoto"}.`);
  if (!Array.isArray(workers) || workers.length === 0) throw new HostedPlanningSmokeError(`La planta ${plantCode} no tiene trabajadores activos para certificar planificación.`);

  for (const template of templates) {
    if (!template.requires_equipment) return Object.freeze({ plant, template, worker: workers[0], equipment: null });
    const { data: links, error: linkError } = await admin
      .from("equipment_processes")
      .select("equipment_id,active")
      .eq("plant_id", plant.id)
      .eq("process_id", template.process_id)
      .eq("active", true);
    if (linkError) throw new HostedPlanningSmokeError(`No fue posible consultar equipos compatibles: ${linkError.message || "error remoto"}.`);
    const equipmentIds = Array.isArray(links) ? links.map((row) => row.equipment_id).filter(Boolean) : [];
    if (!equipmentIds.length) continue;
    const { data: equipmentRows, error: equipmentError } = await admin
      .from("equipment")
      .select("id,plant_id,code,name,status")
      .eq("plant_id", plant.id)
      .in("id", equipmentIds)
      .order("code");
    if (equipmentError) throw new HostedPlanningSmokeError(`No fue posible consultar equipos: ${equipmentError.message || "error remoto"}.`);
    if (Array.isArray(equipmentRows) && equipmentRows.length) return Object.freeze({ plant, template, worker: workers[0], equipment: equipmentRows[0] });
  }

  throw new HostedPlanningSmokeError(`La planta ${plantCode} no tiene una combinación activa plantilla/equipo apta para certificar planificación.`);
}

function candidateWindows(now = new Date()) {
  const base = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  base.setUTCHours(3, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const start = new Date(base.getTime() + index * 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    return { start: start.toISOString(), end: end.toISOString() };
  });
}

async function createDirectorSchedule(client, resources, now) {
  let lastError;
  for (const window of candidateWindows(now)) {
    const { data, error } = await client.rpc("ops_create_scheduled_activity", {
      target_plant: resources.plant.id,
      target_template: resources.template.id,
      starts_at: window.start,
      ends_at: window.end,
      employee_ids: [resources.worker.id],
      target_equipment: resources.equipment?.id || null,
      planning_note: "UAT hosted planning smoke · fila temporal",
    });
    if (!error && typeof data === "string") return Object.freeze({ id: data, ...window });
    lastError = error;
  }
  throw new HostedPlanningSmokeError(`Director no pudo crear una programación temporal en las ventanas UAT: ${lastError?.message || "error remoto"}.`);
}

async function assertOperatorWriteDenied(client, resources, window) {
  const { data, error } = await client.rpc("ops_create_scheduled_activity", {
    target_plant: resources.plant.id,
    target_template: resources.template.id,
    starts_at: window.start,
    ends_at: window.end,
    employee_ids: [resources.worker.id],
    target_equipment: resources.equipment?.id || null,
    planning_note: "UAT operator write must be denied",
  });
  if (!error || data) throw new HostedPlanningSmokeError("Fallo de autorización: el operario pudo crear una programación.");
  if (!/No tienes permiso para programar actividades/i.test(error.message || "")) {
    throw new HostedPlanningSmokeError(`La escritura del operario falló por una razón distinta al boundary de autorización: ${error.message || "error remoto"}.`);
  }
}

async function assertScheduleVisible(client, scheduleId, label) {
  const { data, error } = await client
    .from("scheduled_activities")
    .select("id,plant_id,title,status,planned_start,planned_end")
    .eq("id", scheduleId)
    .maybeSingle();
  if (error) throw new HostedPlanningSmokeError(`${label} no pudo leer la programación UAT: ${error.message || "error remoto"}.`);
  if (!data || data.id !== scheduleId || data.status !== "planned") {
    throw new HostedPlanningSmokeError(`${label} no ve la programación UAT esperada por RLS.`);
  }
  return data;
}

async function cleanup(admin, scheduleId) {
  if (!scheduleId) return;
  const { error } = await admin.from("scheduled_activities").delete().eq("id", scheduleId);
  if (error) throw new HostedPlanningSmokeError(`No fue posible limpiar la programación UAT ${scheduleId}: ${error.message || "error remoto"}.`);
}

export async function runHostedPlanningSmoke({ env = process.env, createClientImpl = createSupabaseClient, now = new Date() } = {}) {
  const config = parseHostedPlanningSmokeConfig(env);
  const admin = createAdminClient(config, createClientImpl);
  const director = createUserClient(config, createClientImpl);
  const operator = createUserClient(config, createClientImpl);
  let directorSignedIn = false;
  let operatorSignedIn = false;
  let scheduleId;
  let primaryError;

  try {
    const resources = await discoverResources(admin, config.plantCode);
    await signIn(director, config.director, "director");
    directorSignedIn = true;
    await signIn(operator, config.operator, "operario");
    operatorSignedIn = true;

    const schedule = await createDirectorSchedule(director, resources, now);
    scheduleId = schedule.id;
    const directorRow = await assertScheduleVisible(director, scheduleId, "Director");
    const operatorRow = await assertScheduleVisible(operator, scheduleId, "Operario");
    await assertOperatorWriteDenied(operator, resources, schedule);

    return Object.freeze({
      plantCode: config.plantCode,
      scheduleId,
      templateCode: String(resources.template.code || ""),
      workerName: String(resources.worker.display_name || ""),
      equipmentCode: resources.equipment ? String(resources.equipment.code || "") : null,
      title: String(directorRow.title || operatorRow.title || ""),
      checks: Object.freeze(["director-write", "director-read", "operator-read", "operator-write-denied", "cleanup"]),
    });
  } catch (error) {
    primaryError = error;
    throw error;
  } finally {
    try {
      await cleanup(admin, scheduleId);
    } catch (cleanupError) {
      if (!primaryError) throw cleanupError;
      console.error(`GREENATICS hosted planning cleanup warning · ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
    }
    if (operatorSignedIn) await safeSignOut(operator);
    if (directorSignedIn) await safeSignOut(director);
  }
}
