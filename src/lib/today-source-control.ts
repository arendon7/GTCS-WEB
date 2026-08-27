import type { OpsBackendState } from "@/lib/ops-data-contract";

export type TodaySourceAction = "reset-demo" | "refresh";

export type TodaySourceControl = Readonly<{
  label: string;
  actionLabel: string;
  action: TodaySourceAction;
}>;

export function getTodaySourceControl(backend: OpsBackendState, ready: boolean): TodaySourceControl {
  if (backend.mode === "supabase") {
    const label = backend.status === "error"
      ? "Supabase · requiere atención"
      : backend.status === "ready" && ready
        ? "Supabase · datos sincronizados"
        : "Supabase · sincronizando";

    return {
      label,
      actionLabel: "Actualizar datos",
      action: "refresh",
    };
  }

  return {
    label: ready ? "Demo local · este navegador" : "Demo local · cargando",
    actionLabel: "Restablecer demo",
    action: "reset-demo",
  };
}
