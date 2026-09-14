import { createClient } from "@supabase/supabase-js";
import { DEFAULT_PILOT_PLANT_CODES, normalizePilotPlantCodes } from "./pilot-plant-codes.mjs";

const INVITE_ACCEPTANCE_PATH = "/auth/accept-invite";

function arg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}
function fail(message) {
  console.error(`BOOTSTRAP_ABORTED: ${message}`);
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
const rawBaseUrl = process.env.APP_BASE_URL?.trim();
const email = (arg("email") || "").trim().toLowerCase();
const displayName = (arg("name") || "").trim().replace(/\s+/g, " ");
let plantCodes;
try {
  plantCodes = normalizePilotPlantCodes(arg("plants") || DEFAULT_PILOT_PLANT_CODES);
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

if (!url || !secret) fail("Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SECRET_KEY.");
let baseUrl;
try {
  const parsed = new URL(rawBaseUrl || "");
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("protocol");
  baseUrl = parsed.origin;
} catch {
  fail("Define APP_BASE_URL como un origen HTTP/HTTPS válido.");
}
if (!email || !email.includes("@")) fail("Usa --email usuario@dominio.");
if (displayName.length < 2) fail("Usa --name 'Nombre Apellido'.");

const admin = createClient(url, secret, { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });

const { data: userPage, error: listError } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
if (listError) fail(`No fue posible buscar usuarios Auth: ${listError.message}`);
let user = userPage.users.find((candidate) => (candidate.email || "").toLowerCase() === email);
let invited = false;

if (!user) {
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, { data: { display_name: displayName }, redirectTo: `${baseUrl}${INVITE_ACCEPTANCE_PATH}` });
  if (error) fail(`No fue posible invitar al primer director: ${error.message}`);
  user = data.user;
  invited = true;
}
if (!user) fail("Supabase no devolvió el usuario objetivo.");

const { data: bootstrapPlants, error: bootstrapError } = await admin.rpc("admin_bootstrap_first_director", {
  target_user: user.id,
  target_display_name: displayName,
  target_plant_codes: plantCodes,
});

if (bootstrapError) {
  if (invited) await admin.auth.admin.deleteUser(user.id);
  fail(`No fue posible completar el bootstrap atómico; ${invited ? "la invitación fue revertida" : "el usuario existente no fue eliminado"}: ${bootstrapError.message}`);
}

if (!bootstrapPlants?.length) {
  if (invited) await admin.auth.admin.deleteUser(user.id);
  fail(`El bootstrap no devolvió plantas; ${invited ? "la invitación fue revertida" : "el usuario existente no fue eliminado"}.`);
}

console.log(`BOOTSTRAP_OK: ${displayName} (${email}) quedó como director en ${bootstrapPlants.map((plant) => plant.plant_name).join(" + ")}.`);
console.log("El bootstrap atómico se bloqueará en futuras ejecuciones mientras exista un director activo.");
