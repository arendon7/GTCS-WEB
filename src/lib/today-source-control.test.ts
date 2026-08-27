import { describe, expect, it } from "vitest";
import { getTodaySourceControl } from "./today-source-control";

describe("Today source controls", () => {
  it("keeps demo reset explicit in local mode", () => {
    expect(getTodaySourceControl({ mode: "local", status: "ready" }, true)).toEqual({
      label: "Demo local · este navegador",
      actionLabel: "Restablecer demo",
      action: "reset-demo",
    });
  });

  it("never presents a Supabase refresh as a demo reset", () => {
    expect(getTodaySourceControl({ mode: "supabase", status: "ready" }, true)).toEqual({
      label: "Supabase · datos sincronizados",
      actionLabel: "Actualizar datos",
      action: "refresh",
    });
  });

  it("keeps Supabase state explicit while synchronizing or failing", () => {
    expect(getTodaySourceControl({ mode: "supabase", status: "booting" }, false).label).toBe("Supabase · sincronizando");
    expect(getTodaySourceControl({ mode: "supabase", status: "error", error: "offline" }, true).label).toBe("Supabase · requiere atención");
  });
});
