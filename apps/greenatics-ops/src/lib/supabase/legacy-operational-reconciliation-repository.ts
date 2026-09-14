import type {
  LegacyOperationalFieldKind,
  LegacyReconciliationApplyResult,
  LegacyReconciliationMetric,
  LegacyReconciliationRow,
} from "@/lib/legacy-operational-reconciliation";
import { createClient } from "@/lib/supabase/client";

type RpcResult<T> = { ok: true; data: T } | { ok: false; error: string };

type LegacyRowDb = {
  field_kind: LegacyOperationalFieldKind;
  legacy_value: string;
  normalized_value: string;
  occurrence_count: number | string;
  activity_rows: number | string;
  scheduled_rows: number | string;
  resolution_method: "exact" | "curated" | "unmapped";
  target_id: string | null;
  target_code: string | null;
  target_name: string | null;
};

type LegacyMetricDb = {
  field_kind: LegacyOperationalFieldKind;
  total_rows: number | string;
  canonical_rows: number | string;
  pending_rows: number | string;
  resolvable_rows: number | string;
  unmapped_rows: number | string;
  coverage_percent: number | string;
};

type ApplyResultDb = {
  activities_process: number | string;
  activities_template: number | string;
  activities_equipment: number | string;
  scheduled_process: number | string;
  scheduled_template: number | string;
  scheduled_equipment: number | string;
  template_process_conflicts: number | string;
};

function numeric(value: number | string | null | undefined) {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function friendlyError(error: { code?: string; message?: string } | null, fallback: string) {
  if (error?.code === "42501") return "Tu rol no puede ejecutar esta acción de reconciliación.";
  return error?.message?.trim() || fallback;
}

export async function loadLegacyOperationalReconciliation(
  plantId: string,
  fieldKind?: LegacyOperationalFieldKind,
): Promise<LegacyReconciliationRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("ops_list_legacy_operational_reconciliation", {
    target_plant: plantId,
    target_kind: fieldKind ?? null,
  });
  if (error) throw new Error(friendlyError(error, "No fue posible cargar la reconciliación histórica."));

  return ((data ?? []) as LegacyRowDb[]).map((row) => ({
    fieldKind: row.field_kind,
    legacyValue: row.legacy_value,
    normalizedValue: row.normalized_value,
    occurrenceCount: numeric(row.occurrence_count),
    activityRows: numeric(row.activity_rows),
    scheduledRows: numeric(row.scheduled_rows),
    resolutionMethod: row.resolution_method,
    targetId: row.target_id ?? undefined,
    targetCode: row.target_code ?? undefined,
    targetName: row.target_name ?? undefined,
  }));
}

export async function loadLegacyOperationalReconciliationMetrics(
  plantId: string,
): Promise<LegacyReconciliationMetric[]> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("ops_legacy_operational_reconciliation_metrics", {
    target_plant: plantId,
  });
  if (error) throw new Error(friendlyError(error, "No fue posible calcular la cobertura de reconciliación."));

  return ((data ?? []) as LegacyMetricDb[]).map((row) => ({
    fieldKind: row.field_kind,
    totalRows: numeric(row.total_rows),
    canonicalRows: numeric(row.canonical_rows),
    pendingRows: numeric(row.pending_rows),
    resolvableRows: numeric(row.resolvable_rows),
    unmappedRows: numeric(row.unmapped_rows),
    coveragePercent: numeric(row.coverage_percent),
  }));
}

export async function curateLegacyOperationalMapping(input: {
  plantId: string;
  fieldKind: LegacyOperationalFieldKind;
  legacyValue: string;
  targetId?: string;
}): Promise<RpcResult<string>> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("ops_curate_legacy_operational_mapping", {
    target_plant: input.plantId,
    target_kind: input.fieldKind,
    source_value: input.legacyValue,
    canonical_target: input.targetId ?? null,
  });
  if (error) return { ok: false, error: friendlyError(error, "No fue posible guardar la equivalencia histórica.") };
  return { ok: true, data: String(data) };
}

export async function applyLegacyOperationalReconciliation(
  plantId: string,
): Promise<RpcResult<LegacyReconciliationApplyResult>> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("ops_apply_legacy_operational_reconciliation", {
    target_plant: plantId,
  });
  if (error) return { ok: false, error: friendlyError(error, "No fue posible aplicar la reconciliación histórica.") };

  const row = ((data ?? []) as ApplyResultDb[])[0];
  if (!row) return { ok: false, error: "La reconciliación no devolvió un resultado verificable." };

  return {
    ok: true,
    data: {
      activitiesProcess: numeric(row.activities_process),
      activitiesTemplate: numeric(row.activities_template),
      activitiesEquipment: numeric(row.activities_equipment),
      scheduledProcess: numeric(row.scheduled_process),
      scheduledTemplate: numeric(row.scheduled_template),
      scheduledEquipment: numeric(row.scheduled_equipment),
      templateProcessConflicts: numeric(row.template_process_conflicts),
    },
  };
}
