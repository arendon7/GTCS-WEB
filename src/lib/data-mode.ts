export type DataMode = "local" | "supabase";

export function getDataMode(): DataMode {
  return process.env.NEXT_PUBLIC_DATA_MODE === "supabase" ? "supabase" : "local";
}

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function shouldUseSupabase() {
  return getDataMode() === "supabase" && isSupabaseConfigured();
}
