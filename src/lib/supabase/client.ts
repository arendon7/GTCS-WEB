import { createBrowserClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/data-mode";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error("Supabase no está configurado. Usa NEXT_PUBLIC_DATA_MODE=local o define URL y publishable key.");
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
