import type { ActivityRecord, ReceptionRecord, WasteType, Worker } from "@/lib/domain";
import type { ImportRun } from "@/lib/importer";

export type CanonicalPromotion = {
  activities: ActivityRecord[];
  receptions: ReceptionRecord[];
  workers: Worker[];
  errors: string[];
};

function slug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CO")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function wasteType(value: string): WasteType | undefined {
  const normalized = slug(value).replace(/-/g, "_").toUpperCase();
  if (normalized === "FORSU") return "FORSU";
  if (normalized === "PODA") return "PODA";
  if (normalized === "GALLINAZA") return "GALLINAZA";
  if (normalized === "MATERIA_PRIMA") return "MATERIA_PRIMA";
  if (normalized === "OTRO") return "OTRO";
  return undefined;
}

function plantPrefix(plantId: string) {
  return plantId === "yarumal" ? "YAR" : plantId === "tamesis" ? "TAM" : plantId.slice(0, 3).toUpperCase();
}

function compactDate(iso: string) {
  const date = new Date(iso);
  const formatter = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota", year: "2-digit", month: "2-digit", day: "2-digit" });
  const parts = Object.fromEntries(formatter.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]));
  return `${parts.year}${parts.month}${parts.day}`;
}

export function buildCanonicalPromotion(run: ImportRun): CanonicalPromotion {
  const errors: string[] = [];
  const workers = new Map<string, Worker>();

  const activities: ActivityRecord[] = run.activities.map((candidate) => {
    const workerIds = candidate.workers.map((name) => {
      const id = `hist-worker-${candidate.plantId}-${slug(name)}`;
      workers.set(id, { id, name, plantId: candidate.plantId, historical: true });
      return id;
    });
    return {
      id: `hist-act-${slug(run.id)}-${candidate.sourceRowIds.map(slug).join("-")}`,
      plantId: candidate.plantId,
      plant: candidate.plant,
      title: candidate.activity,
      process: candidate.activity,
      plannedStart: candidate.startedAt,
      actualStart: candidate.startedAt,
      actualEnd: candidate.endedAt,
      workerIds,
      status: "done",
      source: "historical",
      provenance: { importRunId: run.id, sourceName: run.sourceName, sourceRowIds: candidate.sourceRowIds },
    };
  });

  const receptions: ReceptionRecord[] = [];
  for (const row of run.receipts) {
    if (row.status === "quarantined" || row.status === "duplicate") continue;
    if (!row.plantId || !row.plant || !row.date || row.netWeightKg === undefined) {
      errors.push(`${row.rowId}: recepción promovible sin campos normalizados obligatorios.`);
      continue;
    }
    const canonicalWaste = wasteType(row.wasteType);
    if (!canonicalWaste) {
      errors.push(`${row.rowId}: tipo de residuo '${row.wasteType}' no tiene mapeo canónico aprobado.`);
      continue;
    }
    const rowSlug = slug(row.rowId).toUpperCase();
    receptions.push({
      id: `hist-rec-${slug(run.id)}-${slug(row.rowId)}`,
      plantId: row.plantId,
      plant: row.plant,
      generator: row.generator || "Generador histórico sin dato",
      route: row.route || "Origen histórico sin dato",
      wasteType: canonicalWaste,
      netWeightKg: row.netWeightKg,
      rejectionKg: row.rejectionKg,
      acceptance: "unknown",
      observation: "Registro histórico importado. Estado de aceptación no disponible en la fuente.",
      startedAt: row.date,
      endedAt: row.date,
      lotCode: `HIST-${plantPrefix(row.plantId)}-${canonicalWaste}-${compactDate(row.date)}-${rowSlug}`,
      source: "historical",
      timePrecision: "datetime",
      provenance: { importRunId: run.id, sourceName: run.sourceName, sourceRowIds: [row.rowId] },
    });
  }

  return { activities, receptions, workers: [...workers.values()], errors };
}
