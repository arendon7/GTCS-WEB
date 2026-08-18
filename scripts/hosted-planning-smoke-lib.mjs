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

async function discoverFreeWorker(admin, plantId) {
  const { data: workers, error: workerError } = await admin
    .from("employees")
    .select("id,plant_id,display_name,active")
    .eq("plant_id", plantId)
    .eq("active", true)
    .order("display_name");
  if (workerError) throw new HostedPlanningSmokeError(`No fue posible consultar trabajadores: ${workerError.message || "error remoto"}.`);
  if (!Array.isArray(workers) || workers.length === 0) throw new HostedPlanningSmokeError("La planta no tiene trabajadores activos para certificar ejecución.");

  const { data: openActivities, error: activityError } = await admin
    .from("activities")
    .select("id")
    .eq("plant_id", plantId)
    .is("ended_at", null);
  if (activityError) throw new HostedPlanningSmokeError(`No fue posible validar actividades abiertas: ${activityError.message || "error remoto"}.`);
  const openIds = Array.isArray(openActivities) ? openActivities.map((row) => row.id).filter(Boolean) : [];
  if (!openIds.length) return workers[0];

  const { data: busyRows, error: busyError } = await admin
    .from("activity_workers")
    .select("employee_id")
    .in("activity_id", openIds);
  if (busyError) throw new HostedPlanningSmokeError(`No fue posible validar trabajadores ocupados: ${busyError.message || "error remoto"}.`);
  const busy = new Set((busyRows || []).map((row) => row.employee_id));
  const worker = workers.find((row) => !busy.has(row.id));
  if (!worker) throw new HostedPlanningSmokeError("Todos los trabajadores activos de la planta tienen una actividad real abierta; el smoke no interferirá con ellas.");
  return worker;
}

async function discoverResources(admin, plantCode) {
  const plant = await single(admin.from("plants").select("id,code,name,active").eq("code", plantCode).eq("active", true), `Planta piloto ${plantCode}`);
  const { data: templates, error: templateError } = await admin
    .from("activity_templates")
    .select("id,plant_id,process_id,code,name,requires_equipment,requires_quantity,default_unit_code,active")
    .eq("plant_id", plant.id)
    .eq("active", true)
    .order("requires_equipment", { ascending: true })
    .order("requires_quantity", { ascending: true })
    .order("code");
  if (templateError) throw new HostedPlanningSmokeError(`No fue posible consultar plantillas: ${templateError.message || "error remoto"}.`);
  if (!Array.isArray(templates) || templates.length === 0) throw new HostedPlanningSmokeError(`La planta ${plantCode} no tiene plantillas activas para certificar planificación.`);

  const worker = await discoverFreeWorker(admin, plant.id);

  for (const template of templates) {
    if (template.requires_quantity && !clean(template.default_unit_code)) continue;
    if (!template.requires_equipment) return Object.freeze({ plant, template, worker, equipment: null });
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
    if (Array.isArray(equipmentRows) && equipmentRows.length) return Object.freeze({ plant, template, worker, equipment: equipmentRows[0] });
  }

  throw new HostedPlanningSmokeError(`La planta ${plantCode} no tiene una combinación activa plantilla/trabajador/equipo apta para certificar plan vs real.`);
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
      planning_note: "UAT hosted plan-vs-real smoke · fila temporal",
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

async function readSchedule(client, scheduleId, label, expectedStatus) {
  const { data, error } = await client
    .from("scheduled_activities")
    .select("id,plant_id,title,status,planned_start,planned_end")
    .eq("id", scheduleId)
    .maybeSingle();
  if (error) throw new HostedPlanningSmokeError(`${label} no pudo leer la programación UAT: ${error.message || "error remoto"}.`);
  if (!data || data.id !== scheduleId || data.status !== expectedStatus) {
    throw new HostedPlanningSmokeError(`${label} no ve la programación UAT en estado ${expectedStatus}.`);
  }
  return data;
}

async function startScheduledActivity(operator, resources, scheduleId) {
  const { data, error } = await operator.rpc("ops_start_scheduled_activity", {
    scheduled_id: scheduleId,
    employee_ids: [resources.worker.id],
  });
  if (error) throw new HostedPlanningSmokeError(`El operario no pudo iniciar la programación UAT: ${error.message || "error remoto"}.`);
  if (typeof data !== "string") throw new HostedPlanningSmokeError("La ejecución UAT inició sin devolver un activity_id válido.");
  return data;
}

async function readActivity(client, activityId, scheduleId, expectedFinished) {
  const { data, error } = await client
    .from("activities")
    .select("id,plant_id,scheduled_activity_id,title,started_at,ended_at,quantity,unit")
    .eq("id", activityId)
    .maybeSingle();
  if (error) throw new HostedPlanningSmokeError(`No fue posible leer la ejecución UAT: ${error.message || "error remoto"}.`);
  if (!data || data.id !== activityId || data.scheduled_activity_id !== scheduleId) {
    throw new HostedPlanningSmokeError("La actividad real UAT perdió el vínculo exacto con su programación.");
  }
  if (expectedFinished ? !data.ended_at : Boolean(data.ended_at)) {
    throw new HostedPlanningSmokeError(`La actividad UAT no refleja el cierre esperado (${expectedFinished ? "finalizada" : "en curso"}).`);
  }
  return data;
}

async function finishActivity(operator, resources, activityId) {
  const quantity = resources.template.requires_quantity ? 1 : null;
  const unit = quantity === null ? null : clean(resources.template.default_unit_code);
  const { data, error } = await operator.rpc("ops_finish_activity_v2", {
    target_activity: activityId,
    result_quantity: quantity,
    result_unit: unit,
    novelty_kind: null,
    novelty_notes: null,
    open_incident: false,
    activity_comment: "UAT hosted plan-vs-real smoke · ejecución temporal",
    tool_ids: [],
  });
  if (error) throw new HostedPlanningSmokeError(`El operario no pudo finalizar la actividad UAT: ${error.message || "error remoto"}.`);
  if (typeof data !== "string" || Number.isNaN(Date.parse(data))) {
    throw new HostedPlanningSmokeError("La actividad UAT finalizó sin devolver una hora válida.");
  }
  return data;
}

async function cleanup(admin, activityId, scheduleId) {
  if (activityId) {
    const { error: activityError } = await admin.from("activities").delete().eq("id", activityId);
    if (activityError) throw new HostedPlanningSmokeError(`No fue posible limpiar la actividad UAT ${activityId}: ${activityError.message || "error remoto"}.`);
  }
  if (scheduleId) {
    const { error: scheduleError } = await admin.from("scheduled_activities").delete().eq("id", scheduleId);
    if (scheduleError) throw new HostedPlanningSmokeError(`No fue posible limpiar la programación UAT ${scheduleId}: ${scheduleError.message || "error remoto"}.`);
  }
}

export async function runHostedPlanningSmoke({ env = process.env, createClientImpl = createSupabaseClient, now = new Date() } = {}) {
  const config = parseHostedPlanningSmokeConfig(env);
  const admin = createAdminClient(config, createClientImpl);
  const director = createUserClient(config, createClientImpl);
  const operator = createUserClient(config, createClientImpl);
  let directorSignedIn = false;
  let operatorSignedIn = false;
  let scheduleId;
  let activityId;
  let primaryError;

  try {
    const resources = await discoverResources(admin, config.plantCode);
    await signIn(director, config.director, "director");
    directorSignedIn = true;
    await signIn(operator, config.operator, "operario");
    operatorSignedIn = true;

    const schedule = await createDirectorSchedule(director, resources, now);
    scheduleId = schedule.id;
    const directorRow = await readSchedule(director, scheduleId, "Director", "planned");
    await readSchedule(operator, scheduleId, "Operario", "planned");
    await assertOperatorWriteDenied(operator, resources, schedule);

    activityId = await startScheduledActivity(operator, resources, scheduleId);
    await readSchedule(operator, scheduleId, "Operario", "running");
    await readActivity(operator, activityId, scheduleId, false);

    await finishActivity(operator, resources, activityId);
    await readActivity(operator, activityId, scheduleId, true);
    await readSchedule(director, scheduleId, "Director", "done");

    return Object.freeze({
      plantCode: config.plantCode,
      scheduleId,
      activityId,
      templateCode: String(resources.template.code || ""),
      workerName: String(resources.worker.display_name || ""),
      equipmentCode: resources.equipment ? String(resources.equipment.code || "") : null,
      title: String(directorRow.title || ""),
      checks: Object.freeze([
        "director-plan-write",
        "operator-plan-read",
        "operator-plan-write-denied",
        "operator-start-real",
        "plan-running",
        "plan-real-link",
        "operator-finish-real",
        "plan-done",
        "cleanup",
      ]),
    });
  } catch (error) {
    primaryError = error;
    throw error;
  } finally {
    try {
      await cleanup(admin, activityId, scheduleId);
    } catch (cleanupError) {
      if (!primaryError) throw cleanupError;
      console.error(`GREENATICS hosted plan-vs-real cleanup warning · ${cleanupError instanceof Error ? cleanupError.message : String(cleanupError)}`);
    }
    if (operatorSignedIn) await safeSignOut(operator);
    if (directorSignedIn) await safeSignOut(director);
  }
}
