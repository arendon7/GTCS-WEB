import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export function isSupabaseAdminConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

export function getAppBaseUrl() {
  const raw = process.env.APP_BASE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function createAdminClient() {
  if (!isSupabaseAdminConfigured()) throw new Error("Falta SUPABASE_SECRET_KEY en el entorno del servidor.");
  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SECRET_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}
