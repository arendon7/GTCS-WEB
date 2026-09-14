export type ImportRowStatus = "valid" | "warning" | "quarantined" | "duplicate";

export type ImportIssueCode =
  | "DATE_INVALID"
  | "DURATION_ZERO_OR_NEGATIVE"
  | "DURATION_EXCESSIVE"
  | "WORKER_MISSING"
  | "WORKER_ALIAS_RESOLVED"
  | "ACTIVITY_MISSING"
  | "MASS_NON_POSITIVE"
  | "UNIT_CONVERTED_TON_TO_KG"
  | "UNIT_AMBIGUOUS"
  | "REJECTION_UNQUANTIFIED"
  | "PLANT_UNKNOWN"
  | "DUPLICATE_EXACT";

export type LegacyReceiptRow = {
  rowId: string;
  plant: string;
  date: string;
  generator: string;
  route: string;
  wasteType: string;
  netWeight: number;
  massUnit: string;
  rejectionKg?: number;
  rejectionKnown?: boolean;
  timePrecision?: "datetime" | "date_only";
};

export type LegacyLogRow = {
  rowId: string;
  plant: string;
  activity: string;
  worker: string;
  startedAt: string;
  endedAt: string;
  equipment?: string;
};

export type LegacyImportPayload = {
  sourceName: string;
  receipts: LegacyReceiptRow[];
  logs: LegacyLogRow[];
};

export type ImportIssue = {
  rowId: string;
  code: ImportIssueCode;
  field: string;
  severity: "warning" | "error";
  sourceValue?: string | number;
  detail: string;
};

export type StagedReceipt = {
  rowId: string;
  status: ImportRowStatus;
  plantId?: string;
  plant?: string;
  date?: string;
  generator: string;
  route: string;
  wasteType: string;
  netWeightKg?: number;
  rejectionKg: number;
  rejectionKnown: boolean;
  timePrecision: "datetime" | "date_only";
  raw: LegacyReceiptRow;
};

export type StagedLog = {
  rowId: string;
  status: ImportRowStatus;
  plantId?: string;
  plant?: string;
  activity: string;
  workerOriginal: string;
  workerCanonical?: string;
  startedAt?: string;
  endedAt?: string;
  durationHours?: number;
  equipment?: string;
  raw: LegacyLogRow;
};

export type CandidateActivity = {
  key: string;
  plantId: string;
  plant: string;
  activity: string;
  startedAt: string;
  endedAt: string;
  durationHours: number;
  workers: string[];
  sourceRowIds: string[];
};

export type ImportRun = {
  id: string;
  sourceName: string;
  sourceHash: string;
  createdAt: string;
  promoted: boolean;
  receipts: StagedReceipt[];
  logs: StagedLog[];
  activities: CandidateActivity[];
  issues: ImportIssue[];
  counts: {
    totalRows: number;
    valid: number;
    warning: number;
    quarantined: number;
    duplicate: number;
    activities: number;
  };
};

const WORKER_ALIASES = new Map<string, string>([
  ["jonathan valbin", "Jonathan Balbín"],
  ["jonathan balbin", "Jonathan Balbín"],
]);

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizePlant(value: string) {
  const normalized = normalizeText(value).toLocaleLowerCase("es-CO");
  if (normalized === "yarumal") return { id: "yarumal", name: "Yarumal" };
  if (normalized === "támesis" || normalized === "tamesis") return { id: "tamesis", name: "Támesis" };
  return undefined;
}

function normalizeWorker(value: string) {
  const original = normalizeText(value);
  const canonical = WORKER_ALIASES.get(original.toLocaleLowerCase("es-CO")) ?? original;
  return { original, canonical, aliased: canonical !== original };
}

function parseIso(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}

function receiptFingerprint(row: LegacyReceiptRow) {
  return JSON.stringify([
    normalizeText(row.plant).toLocaleLowerCase("es-CO"),
    row.date,
    normalizeText(row.generator).toLocaleLowerCase("es-CO"),
    normalizeText(row.route).toLocaleLowerCase("es-CO"),
    normalizeText(row.wasteType).toLocaleLowerCase("es-CO"),
    row.netWeight,
    normalizeText(row.massUnit).toLocaleLowerCase("es-CO"),
    row.rejectionKg ?? null,
    row.rejectionKnown ?? row.rejectionKg !== undefined,
  ]);
}

function logFingerprint(row: LegacyLogRow) {
  return JSON.stringify([
    normalizeText(row.plant).toLocaleLowerCase("es-CO"),
    normalizeText(row.activity).toLocaleLowerCase("es-CO"),
    normalizeText(row.worker).toLocaleLowerCase("es-CO"),
    row.startedAt,
    row.endedAt,
    normalizeText(row.equipment ?? "").toLocaleLowerCase("es-CO"),
  ]);
}

function pushIssue(issues: ImportIssue[], issue: ImportIssue) { issues.push(issue); }

function finalStatus(hasError: boolean, hasWarning: boolean): ImportRowStatus {
  if (hasError) return "quarantined";
  if (hasWarning) return "warning";
  return "valid";
}

function buildCandidateActivities(logs: StagedLog[]) {
  const groups = new Map<string, CandidateActivity>();
  for (const log of logs) {
    if (log.status === "duplicate" || log.status === "quarantined") continue;
    if (!log.plantId || !log.plant || !log.startedAt || !log.endedAt || !log.workerCanonical || log.durationHours === undefined) continue;
    const key = [log.plantId, log.activity, log.startedAt, log.endedAt].join("|");
    const current = groups.get(key) ?? {
      key,
      plantId: log.plantId,
      plant: log.plant,
      activity: log.activity,
      startedAt: log.startedAt,
      endedAt: log.endedAt,
      durationHours: log.durationHours,
      workers: [],
      sourceRowIds: [],
    };
    if (!current.workers.includes(log.workerCanonical)) current.workers.push(log.workerCanonical);
    current.sourceRowIds.push(log.rowId);
    groups.set(key, current);
  }
  return [...groups.values()];
}

export function dryRunLegacyImport(payload: LegacyImportPayload, sourceHash: string): ImportRun {
  const issues: ImportIssue[] = [];
  const receiptFingerprints = new Set<string>();
  const logFingerprints = new Set<string>();

  const receipts: StagedReceipt[] = payload.receipts.map((raw) => {
    const rejectionKnown = raw.rejectionKnown ?? raw.rejectionKg !== undefined;
    const timePrecision = raw.timePrecision ?? "datetime";
    const fingerprint = receiptFingerprint(raw);
    if (receiptFingerprints.has(fingerprint)) {
      pushIssue(issues, { rowId: raw.rowId, code: "DUPLICATE_EXACT", field: "row", severity: "warning", detail: "La fila repite exactamente una recepción ya vista en esta fuente." });
      return { rowId: raw.rowId, status: "duplicate", generator: raw.generator, route: raw.route, wasteType: raw.wasteType, rejectionKg: raw.rejectionKg ?? 0, rejectionKnown, timePrecision, raw };
    }
    receiptFingerprints.add(fingerprint);

    let hasError = false;
    let hasWarning = false;
    const plant = normalizePlant(raw.plant);
    if (!plant) {
      hasError = true;
      pushIssue(issues, { rowId: raw.rowId, code: "PLANT_UNKNOWN", field: "plant", severity: "error", sourceValue: raw.plant, detail: "La planta no puede resolverse de forma inequívoca." });
    }

    const date = parseIso(raw.date);
    if (!date) {
      hasError = true;
      pushIssue(issues, { rowId: raw.rowId, code: "DATE_INVALID", field: "date", severity: "error", sourceValue: raw.date, detail: "La fecha de recepción no es válida." });
    }

    let netWeightKg: number | undefined;
    const unit = normalizeText(raw.massUnit).toLocaleLowerCase("es-CO");
    if (!Number.isFinite(raw.netWeight) || raw.netWeight <= 0) {
      hasError = true;
      pushIssue(issues, { rowId: raw.rowId, code: "MASS_NON_POSITIVE", field: "netWeight", severity: "error", sourceValue: raw.netWeight, detail: "La masa debe ser mayor que cero." });
    } else if (["kg", "kilogramo", "kilogramos"].includes(unit)) {
      netWeightKg = raw.netWeight;
    } else if (["t", "ton", "tons", "tonelada", "toneladas"].includes(unit)) {
      netWeightKg = raw.netWeight * 1000;
      hasWarning = true;
      pushIssue(issues, { rowId: raw.rowId, code: "UNIT_CONVERTED_TON_TO_KG", field: "massUnit", severity: "warning", sourceValue: raw.massUnit, detail: "La fuente declara toneladas; se normaliza explícitamente a kg." });
    } else {
      hasError = true;
      pushIssue(issues, { rowId: raw.rowId, code: "UNIT_AMBIGUOUS", field: "massUnit", severity: "error", sourceValue: raw.massUnit, detail: "La unidad de masa no es inequívoca y no se convierte automáticamente." });
    }

    if (!rejectionKnown) {
      hasWarning = true;
      pushIssue(issues, { rowId: raw.rowId, code: "REJECTION_UNQUANTIFIED", field: "rejectionKg", severity: "warning", detail: "La fuente describe rechazo pero no aporta una masa cuantificable en kg; se conserva como desconocida, no como cero observado." });
    }

    return {
      rowId: raw.rowId,
      status: finalStatus(hasError, hasWarning),
      plantId: plant?.id,
      plant: plant?.name,
      date,
      generator: normalizeText(raw.generator),
      route: normalizeText(raw.route),
      wasteType: normalizeText(raw.wasteType),
      netWeightKg,
      rejectionKg: raw.rejectionKg ?? 0,
      rejectionKnown,
      timePrecision,
      raw,
    };
  });

  const logs: StagedLog[] = payload.logs.map((raw) => {
    const fingerprint = logFingerprint(raw);
    if (logFingerprints.has(fingerprint)) {
      pushIssue(issues, { rowId: raw.rowId, code: "DUPLICATE_EXACT", field: "row", severity: "warning", detail: "La fila repite exactamente una participación ya vista en esta fuente." });
      return { rowId: raw.rowId, status: "duplicate", activity: normalizeText(raw.activity), workerOriginal: normalizeText(raw.worker), equipment: raw.equipment, raw };
    }
    logFingerprints.add(fingerprint);

    let hasError = false;
    let hasWarning = false;
    const plant = normalizePlant(raw.plant);
    if (!plant) {
      hasError = true;
      pushIssue(issues, { rowId: raw.rowId, code: "PLANT_UNKNOWN", field: "plant", severity: "error", sourceValue: raw.plant, detail: "La planta no puede resolverse de forma inequívoca." });
    }

    const activity = normalizeText(raw.activity);
    if (!activity) {
      hasError = true;
      pushIssue(issues, { rowId: raw.rowId, code: "ACTIVITY_MISSING", field: "activity", severity: "error", detail: "La actividad está vacía." });
    }

    const worker = normalizeWorker(raw.worker);
    if (!worker.original) {
      hasError = true;
      pushIssue(issues, { rowId: raw.rowId, code: "WORKER_MISSING", field: "worker", severity: "error", detail: "No hay trabajador resoluble en la fila." });
    } else if (worker.aliased) {
      hasWarning = true;
      pushIssue(issues, { rowId: raw.rowId, code: "WORKER_ALIAS_RESOLVED", field: "worker", severity: "warning", sourceValue: worker.original, detail: `Se conserva el valor original y se resuelve a ${worker.canonical}.` });
    }

    const startedAt = parseIso(raw.startedAt);
    const endedAt = parseIso(raw.endedAt);
    let durationHours: number | undefined;
    if (!startedAt || !endedAt) {
      hasError = true;
      pushIssue(issues, { rowId: raw.rowId, code: "DATE_INVALID", field: !startedAt ? "startedAt" : "endedAt", severity: "error", sourceValue: !startedAt ? raw.startedAt : raw.endedAt, detail: "La fecha/hora no es válida." });
    } else {
      durationHours = (new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 3_600_000;
      if (durationHours <= 0) {
        hasError = true;
        pushIssue(issues, { rowId: raw.rowId, code: "DURATION_ZERO_OR_NEGATIVE", field: "endedAt", severity: "error", sourceValue: raw.endedAt, detail: "La duración debe ser mayor que cero y el fin debe ser posterior al inicio." });
      } else if (durationHours > 12) {
        hasError = true;
        pushIssue(issues, { rowId: raw.rowId, code: "DURATION_EXCESSIVE", field: "endedAt", severity: "error", sourceValue: durationHours, detail: "La duración supera el guardrail inicial de 12 h y requiere revisión humana." });
      }
    }

    return {
      rowId: raw.rowId,
      status: finalStatus(hasError, hasWarning),
      plantId: plant?.id,
      plant: plant?.name,
      activity,
      workerOriginal: worker.original,
      workerCanonical: worker.original ? worker.canonical : undefined,
      startedAt,
      endedAt,
      durationHours,
      equipment: raw.equipment ? normalizeText(raw.equipment) : undefined,
      raw,
    };
  });

  const activities = buildCandidateActivities(logs);
  const allStatuses = [...receipts.map((item) => item.status), ...logs.map((item) => item.status)];
  const counts = {
    totalRows: allStatuses.length,
    valid: allStatuses.filter((status) => status === "valid").length,
    warning: allStatuses.filter((status) => status === "warning").length,
    quarantined: allStatuses.filter((status) => status === "quarantined").length,
    duplicate: allStatuses.filter((status) => status === "duplicate").length,
    activities: activities.length,
  };

  return {
    id: `IMP-${sourceHash.slice(0, 12).toUpperCase()}`,
    sourceName: payload.sourceName,
    sourceHash,
    createdAt: new Date().toISOString(),
    promoted: false,
    receipts,
    logs,
    activities,
    issues,
    counts,
  };
}

export async function sha256Bytes(value: ArrayBuffer | Uint8Array) {
  const source = value instanceof Uint8Array ? value : new Uint8Array(value);
  const owned = new Uint8Array(source.byteLength);
  owned.set(source);
  const digest = await crypto.subtle.digest("SHA-256", owned.buffer);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function sha256Text(value: string) {
  return sha256Bytes(new TextEncoder().encode(value));
}
