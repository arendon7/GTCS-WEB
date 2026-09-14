import { afterEach, describe, expect, it } from "vitest";
import { getDataMode, isSupabaseConfigured, shouldUseSupabase } from "./data-mode";

const original = { ...process.env };

afterEach(() => {
  process.env.NEXT_PUBLIC_DATA_MODE = original.NEXT_PUBLIC_DATA_MODE;
  process.env.NEXT_PUBLIC_SUPABASE_URL = original.NEXT_PUBLIC_SUPABASE_URL;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = original.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
});

describe("data backend boundary", () => {
  it("defaults to local without configuration", () => {
    delete process.env.NEXT_PUBLIC_DATA_MODE;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    expect(getDataMode()).toBe("local");
    expect(isSupabaseConfigured()).toBe(false);
    expect(shouldUseSupabase()).toBe(false);
  });

  it("requires both explicit mode and public project configuration", () => {
    process.env.NEXT_PUBLIC_DATA_MODE = "supabase";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-test-key";
    expect(getDataMode()).toBe("supabase");
    expect(isSupabaseConfigured()).toBe(true);
    expect(shouldUseSupabase()).toBe(true);
  });
});
