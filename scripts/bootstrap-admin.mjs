#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js";
import { DEFAULT_PILOT_PLANT_CODES, normalizePilotPlantCodes } from "./pilot-plant-codes.mjs";

const INVITE_ACCEPTANCE_PATH = "/auth/accept-invite";

function readArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function normalizeEmail(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeName(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function normalizeBaseUrl(value) {
  const parsed = new URL(String(value ?? "").trim());
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("APP_BASE_URL debe ser HTTP/HTTPS.");
  if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("APP_BASE_URL debe ser únicamente un origen, sin credenciales, ruta, query ni fragmento.");
  }
  return parsed.origin;
}

async function cleanupInvitedUser(admin, userId) {
  try {
    await admin.from("plant_memberships").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("id", userId);
  } finally {
    await admin.auth.admin.deleteUser(userId);
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secret) throw new Error("Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY.");

  const baseUrl = normalizeBaseUrl(process.env.APP_BASE_URL);
  const email = normalizeEmail(readArg("email"));
  const displayName = normalizeName(readArg("name"));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Usa --email usuario@dominio.");
  if (displayName.length < 2 || displayName.length > 120) throw new Error("Usa --name con un nombre visible válido.");

  const plantCodes = normalizePilotPlantCodes(readArg("plants") || DEFAULT_PILOT_PLANT_CODES);
  const admin = createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });

  const { data: existingUsers, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listError) throw new Error(`No fue posible consultar usuarios Auth: ${listError.message}`);
  const existing = existingUsers.users.find((candidate) => normalizeEmail(candidate.email) === email);
  if (existing) throw new Error("El usuario administrador ya existe en Auth; usa la administración normal de usuarios para modificarlo.");

  const { data: plantRows, error: plantsError } = await admin
    .from("plants")
    .select("id,code,name,active")
    .in("code", plantCodes)
    .eq("active", true);
  if (plantsError) throw new Error(`No fue posible resolver plantas: ${plantsError.message}`);

  const plantsByCode = new Map((plantRows ?? []).map((plant) => [plant.code, plant]));
  const missingCodes = plantCodes.filter((code) => !plantsByCode.has(code));
  if (missingCodes.length) throw new Error(`Faltan plantas activas requeridas: ${missingCodes.join(", ")}.`);

  const { data: inviteData, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { display_name: displayName },
    redirectTo: `${baseUrl}${INVITE_ACCEPTANCE_PATH}`,
  });
  if (inviteError) throw new Error(`No fue posible invitar al administrador: ${inviteError.message}`);
  const invitedUser = inviteData.user;
  if (!invitedUser?.id) throw new Error("Supabase no devolvió el usuario administrador invitado.");

  try {
    const { error: profileError } = await admin.from("profiles").upsert({
      id: invitedUser.id,
      display_name: displayName,
      active: true,
    });
    if (profileError) throw new Error(`No fue posible crear el perfil administrador: ${profileError.message}`);

    const assignments = plantCodes.map((code) => ({
      user_id: invitedUser.id,
      plant_id: plantsByCode.get(code).id,
      role: "admin",
      active: true,
    }));
    const { error: membershipError } = await admin
      .from("plant_memberships")
      .upsert(assignments, { onConflict: "user_id,plant_id" });
    if (membershipError) throw new Error(`No fue posible crear membresías administrador: ${membershipError.message}`);

    const { data: verificationRows, error: verificationError } = await admin
      .from("plant_memberships")
      .select("plant_id,role,active")
      .eq("user_id", invitedUser.id);
    if (verificationError) throw new Error(`No fue posible verificar membresías administrador: ${verificationError.message}`);

    const expectedIds = new Set(assignments.map((assignment) => assignment.plant_id));
    const validRows = (verificationRows ?? []).filter((row) => expectedIds.has(row.plant_id) && row.role === "admin" && row.active === true);
    if (validRows.length !== expectedIds.size) throw new Error("La verificación final de membresías administrador no coincidió con TAM+YAR.");
  } catch (error) {
    await cleanupInvitedUser(admin, invitedUser.id);
    throw new Error(`${error instanceof Error ? error.message : String(error)} La invitación administrador fue revertida.`);
  }

  console.log(`BOOTSTRAP_ADMIN_OK: ${displayName} quedó como administrador en ${plantCodes.join(" + ")}.`);
}

main().catch((error) => {
  console.error(`BOOTSTRAP_ADMIN_ABORTED: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
