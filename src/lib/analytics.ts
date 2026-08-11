import type { ActivityRecord, IncidentRecord, ReceptionRecord, Worker } from "@/lib/domain";
import type { CompostMeasurement, CompostPile } from "@/lib/compost-domain";
import { averageTemperature, compostYieldPct } from "@/lib/compost-domain";
import type { EquipmentRecord, MaintenanceTicket } from "@/lib/maintenance-domain";
import { bogotaDateKey } from "@/lib/time";

export type DashboardPreset = "day" | "week" | "month" | "history";
export type PlantFilter = "all" | string;

export type DashboardPeriod = {
  preset: DashboardPreset;
  anchorKey: string;
  startKey: string;
  endKey: string;
  label: string;
};

export type DashboardAnalyticsInput = {
  activities: ActivityRecord[];
  receptions: ReceptionRecord[];
  incidents: IncidentRecord[];
  tickets: MaintenanceTicket[];
  equipment: EquipmentRecord[];
  piles: CompostPile[];
  measurements: CompostMeasurement[];
  workers: Worker[];
  preset: DashboardPreset;
  anchorKey: string;
  plantId: PlantFilter;
  nowIso: string;
};

export type RankedValue = { id: string; label: string; value: number; detail?: string };
export type TrendPoint = { key: string; label: string; receivedKg: number; laborHours: number; downtimeMinutes: number };
export type OperationalEvent = { id: string; at: string; plant: string; kind: "activity" | "reception" | "maintenance" | "compost"; title: string; detail: string };
export type PlantComparisonRow = { plantId: string; plant: string; receivedKg: number; rejectionPct: number; laborHours: number; compliancePct: number; downtimeMinutes: number; attention: number };

export type DashboardAnalytics = {
  period: DashboardPeriod;
  receivedKg: number;
  rejectionKg: number;
  rejectionPct: number;
  laborHours: number;
  downtimeMinutes: number;
  scheduledCount: number;
  executedScheduledCount: number;
  delayedCount: number;
  unplannedCount: number;
  compliancePct: number;
  exceptionsCount: number;
  nonConformingReceipts: number;
  openIncidents: number;
  maintenanceTickets: number;
  activePiles: number;
  maturingPiles: number;
  closedPilesInPeriod: number;
  averageClosedYieldPct: number;
  trend: TrendPoint[];
  processHours: RankedValue[];
  workerHours: RankedValue[];
  equipmentDowntime: RankedValue[];
  plantComparison: PlantComparisonRow[];
  events: OperationalEvent[];
  latestCompost: Array<{ pileId: string; code: string; plant: string; status: CompostPile["status"]; temperatureC?: number; humidityPct?: number; recordedAt?: string }>;
  dataCounts: { activities: number; receptions: number; tickets: number; piles: number };
};

const BOGOTA_OFFSET = "-05:00";

function parseKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return { year, month, day };
}

export function addDaysKey(key: string, days: number) {
  const { year, month, day } = parseKey(key);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function mondayKey(key: string) {
  const { year, month, day } = parseKey(key);
  const weekday = new Date(Date.UTC(year, month - 1, day, 12)).getUTCDay();
  const offset = (weekday + 6) % 7;
  return addDaysKey(key, -offset);
}

function monthStartKey(key: string) {
  return `${key.slice(0, 7)}-01`;
}

function monthEndKey(key: string) {
  const { year, month } = parseKey(key);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

function monthLabel(key: string) {
  const { year, month } = parseKey(key);
  return new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 15)));
}

function shortDayLabel(key: string) {
  const { year, month, day } = parseKey(key);
  return new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
}

function allOperationalKeys(input: Omit<DashboardAnalyticsInput, "preset" | "anchorKey" | "plantId" | "nowIso">) {
  const keys = [
    ...input.activities.flatMap((item) => [item.plannedStart, item.actualStart, item.actualEnd].filter(Boolean) as string[]),
    ...input.receptions.flatMap((item) => [item.startedAt, item.endedAt]),
    ...input.incidents.map((item) => item.openedAt),
    ...input.tickets.flatMap((item) => [item.openedAt, item.repairStartedAt, item.closedAt].filter(Boolean) as string[]),
    ...input.piles.flatMap((item) => [item.startedAt, item.maturationStartedAt, item.closedAt].filter(Boolean) as string[]),
    ...input.measurements.map((item) => item.recordedAt),
  ].map(bogotaDateKey).sort();
  return keys;
}

export function resolveDashboardPeriod(preset: DashboardPreset, anchorKey: string, keys: string[] = []): DashboardPeriod {
  if (preset === "day") return { preset, anchorKey, startKey: anchorKey, endKey: anchorKey, label: shortDayLabel(anchorKey) };
  if (preset === "week") {
    const startKey = mondayKey(anchorKey);
    const endKey = addDaysKey(startKey, 6);
    return { preset, anchorKey, startKey, endKey, label: `${shortDayLabel(startKey)} – ${shortDayLabel(endKey)}` };
  }
  if (preset === "month") {
    const startKey = monthStartKey(anchorKey);
    const endKey = monthEndKey(anchorKey);
    return { preset, anchorKey, startKey, endKey, label: monthLabel(anchorKey) };
  }
  const startKey = keys[0] ?? anchorKey;
  const endKey = keys.at(-1) ?? anchorKey;
  return { preset, anchorKey, startKey, endKey, label: `${shortDayLabel(startKey)} – ${shortDayLabel(endKey)}` };
}

function periodBounds(period: DashboardPeriod) {
  return {
    startMs: new Date(`${period.startKey}T00:00:00${BOGOTA_OFFSET}`).getTime(),
    endMs: new Date(`${addDaysKey(period.endKey, 1)}T00:00:00${BOGOTA_OFFSET}`).getTime(),
  };
}

function inPeriod(iso: string | undefined, period: DashboardPeriod) {
  if (!iso) return false;
  const key = bogotaDateKey(iso);
  return key >= period.startKey && key <= period.endKey;
}

export function overlapMinutes(startIso: string | undefined, endIso: string | undefined, period: DashboardPeriod, nowIso: string) {
  if (!startIso) return 0;
  const { startMs, endMs } = periodBounds(period);
  const start = Math.max(new Date(startIso).getTime(), startMs);
  const end = Math.min(new Date(endIso ?? nowIso).getTime(), endMs);
  return Math.max(0, (end - start) / 60_000);
}

function filterPlant<T extends { plantId: string }>(items: T[], plantId: PlantFilter) {
  return plantId === "all" ? items : items.filter((item) => item.plantId === plantId);
}

function pct(numerator: number, denominator: number) {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}

function rank(map: Map<string, { label: string; value: number; detail?: string }>) {
  return [...map.entries()].map(([id, item]) => ({ id, ...item })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
}

function periodDayKeys(period: DashboardPeriod) {
  const days: string[] = [];
  let current = period.startKey;
  while (current <= period.endKey && days.length <= 400) {
    days.push(current);
    current = addDaysKey(current, 1);
  }
  return days;
}

function splitIntoBuckets(period: DashboardPeriod) {
  const days = periodDayKeys(period);
  if (period.preset !== "history" || days.length <= 45) {
    return days.map((key) => ({ key, startKey: key, endKey: key, label: shortDayLabel(key) }));
  }
  const months = [...new Set(days.map((key) => key.slice(0, 7)))];
  return months.map((month) => {
    const startKey = `${month}-01`;
    const endKey = monthEndKey(startKey);
    return { key: month, startKey, endKey, label: monthLabel(startKey).replace(/^./, (char) => char.toUpperCase()) };
  });
}

function summarizePlant(
  plantId: string,
  plantName: string,
  period: DashboardPeriod,
  input: DashboardAnalyticsInput,
): PlantComparisonRow {
  const activities = input.activities.filter((item) => item.plantId === plantId);
  const receipts = input.receptions.filter((item) => item.plantId === plantId && inPeriod(item.endedAt, period));
  const tickets = input.tickets.filter((item) => item.plantId === plantId);
  const incidents = input.incidents.filter((item) => item.plantId === plantId && item.status === "open" && inPeriod(item.openedAt, period));
  const scheduled = activities.filter((item) => item.source === "scheduled" && inPeriod(item.plannedStart, period));
  const executed = scheduled.filter((item) => Boolean(item.actualStart));
  const laborHours = activities.reduce((sum, item) => sum + overlapMinutes(item.actualStart, item.actualEnd, period, input.nowIso) * item.workerIds.length / 60, 0);
  const downtimeMinutes = tickets.reduce((sum, item) => sum + overlapMinutes(item.openedAt, item.closedAt, period, input.nowIso), 0);
  const receivedKg = receipts.reduce((sum, item) => sum + item.netWeightKg, 0);
  const rejectionKg = receipts.reduce((sum, item) => sum + item.rejectionKg, 0);
  const delayed = scheduled.filter((item) => item.status === "delayed" || item.status === "missed").length;
  const nonConforming = receipts.filter((item) => item.acceptance !== "accepted").length;
  const activeTickets = tickets.filter((item) => item.status !== "closed" && overlapMinutes(item.openedAt, item.closedAt, period, input.nowIso) > 0).length;
  return { plantId, plant: plantName, receivedKg, rejectionPct: pct(rejectionKg, receivedKg), laborHours, compliancePct: pct(executed.length, scheduled.length), downtimeMinutes, attention: delayed + nonConforming + incidents.length + activeTickets };
}

export function buildOperationalAnalytics(input: DashboardAnalyticsInput): DashboardAnalytics {
  const period = resolveDashboardPeriod(input.preset, input.anchorKey, allOperationalKeys(input));
  const activities = filterPlant(input.activities, input.plantId);
  const receptions = filterPlant(input.receptions, input.plantId);
  const incidents = filterPlant(input.incidents, input.plantId);
  const tickets = filterPlant(input.tickets, input.plantId);
  const equipment = filterPlant(input.equipment, input.plantId);
  const piles = filterPlant(input.piles, input.plantId);

  const periodReceipts = receptions.filter((item) => inPeriod(item.endedAt, period));
  const receivedKg = periodReceipts.reduce((sum, item) => sum + item.netWeightKg, 0);
  const rejectionKg = periodReceipts.reduce((sum, item) => sum + item.rejectionKg, 0);
  const nonConformingReceipts = periodReceipts.filter((item) => item.acceptance !== "accepted").length;

  const scheduled = activities.filter((item) => item.source === "scheduled" && inPeriod(item.plannedStart, period));
  const executedScheduled = scheduled.filter((item) => Boolean(item.actualStart));
  const delayed = scheduled.filter((item) => item.status === "delayed" || item.status === "missed");
  const unplanned = activities.filter((item) => item.source === "unplanned" && inPeriod(item.actualStart, period));

  const processMap = new Map<string, { label: string; value: number }>();
  const workerMap = new Map<string, { label: string; value: number; detail?: string }>();
  let laborHours = 0;
  for (const activity of activities) {
    const durationHours = overlapMinutes(activity.actualStart, activity.actualEnd, period, input.nowIso) / 60;
    if (durationHours <= 0) continue;
    const activityLabor = durationHours * activity.workerIds.length;
    laborHours += activityLabor;
    const process = processMap.get(activity.process) ?? { label: activity.process, value: 0 };
    process.value += activityLabor;
    processMap.set(activity.process, process);
    for (const workerId of activity.workerIds) {
      const worker = input.workers.find((item) => item.id === workerId);
      const row = workerMap.get(workerId) ?? { label: worker?.name ?? workerId, value: 0, detail: activity.plant };
      row.value += durationHours;
      workerMap.set(workerId, row);
    }
  }

  const equipmentMap = new Map<string, { label: string; value: number; detail?: string }>();
  let downtimeMinutes = 0;
  let maintenanceTickets = 0;
  for (const ticket of tickets) {
    const minutes = overlapMinutes(ticket.openedAt, ticket.closedAt, period, input.nowIso);
    if (minutes <= 0) continue;
    downtimeMinutes += minutes;
    maintenanceTickets += 1;
    const asset = equipment.find((item) => item.id === ticket.equipmentId);
    const row = equipmentMap.get(ticket.equipmentId) ?? { label: asset ? `${asset.code} · ${asset.name}` : ticket.equipmentId, value: 0, detail: ticket.plant };
    row.value += minutes;
    equipmentMap.set(ticket.equipmentId, row);
  }

  const openIncidents = incidents.filter((item) => item.status === "open" && inPeriod(item.openedAt, period)).length;
  const activeMaintenance = tickets.filter((item) => item.status !== "closed" && overlapMinutes(item.openedAt, item.closedAt, period, input.nowIso) > 0).length;

  const closedPiles = piles.filter((item) => item.status === "closed" && inPeriod(item.closedAt, period));
  const averageClosedYieldPct = closedPiles.length ? closedPiles.reduce((sum, item) => sum + compostYieldPct(item), 0) / closedPiles.length : 0;
  const latestCompost = piles.filter((item) => item.status !== "closed").map((pile) => {
    const latest = input.measurements.filter((measurement) => measurement.pileId === pile.id).sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())[0];
    return { pileId: pile.id, code: pile.code, plant: pile.plant, status: pile.status, temperatureC: latest ? averageTemperature(latest) : undefined, humidityPct: latest?.humidityPct, recordedAt: latest?.recordedAt };
  }).slice(0, 6);

  const trend = splitIntoBuckets(period).map((bucket) => {
    const bucketPeriod: DashboardPeriod = { ...period, startKey: bucket.startKey, endKey: bucket.endKey };
    const bucketReceipts = receptions.filter((item) => inPeriod(item.endedAt, bucketPeriod));
    const bucketReceived = bucketReceipts.reduce((sum, item) => sum + item.netWeightKg, 0);
    const bucketLabor = activities.reduce((sum, item) => sum + overlapMinutes(item.actualStart, item.actualEnd, bucketPeriod, input.nowIso) * item.workerIds.length / 60, 0);
    const bucketDowntime = tickets.reduce((sum, item) => sum + overlapMinutes(item.openedAt, item.closedAt, bucketPeriod, input.nowIso), 0);
    return { key: bucket.key, label: bucket.label, receivedKg: bucketReceived, laborHours: bucketLabor, downtimeMinutes: bucketDowntime };
  });

  const events: OperationalEvent[] = [];
  for (const receipt of periodReceipts) events.push({ id: `receipt-${receipt.id}`, at: receipt.endedAt, plant: receipt.plant, kind: "reception", title: `Recepción · ${receipt.lotCode}`, detail: `${receipt.netWeightKg.toLocaleString("es-CO")} kg · ${pct(receipt.rejectionKg, receipt.netWeightKg).toFixed(1)} % rechazo` });
  for (const activity of activities) if (inPeriod(activity.actualEnd ?? activity.actualStart, period) && activity.actualStart) events.push({ id: `activity-${activity.id}`, at: activity.actualEnd ?? activity.actualStart, plant: activity.plant, kind: "activity", title: activity.title, detail: `${activity.process} · ${activity.workerIds.length} trabajador${activity.workerIds.length === 1 ? "" : "es"}` });
  for (const ticket of tickets) {
    if (inPeriod(ticket.openedAt, period)) events.push({ id: `maintenance-open-${ticket.id}`, at: ticket.openedAt, plant: ticket.plant, kind: "maintenance", title: `Falla · ${ticket.title}`, detail: equipment.find((item) => item.id === ticket.equipmentId)?.name ?? "Equipo" });
    if (ticket.closedAt && inPeriod(ticket.closedAt, period)) events.push({ id: `maintenance-close-${ticket.id}`, at: ticket.closedAt, plant: ticket.plant, kind: "maintenance", title: `Reparación cerrada · ${ticket.title}`, detail: ticket.resolution ?? "Cierre de mantenimiento" });
  }
  for (const pile of piles) {
    if (inPeriod(pile.startedAt, period)) events.push({ id: `pile-open-${pile.id}`, at: pile.startedAt, plant: pile.plant, kind: "compost", title: `Pila creada · ${pile.code}`, detail: `${pile.initialWeightKg.toLocaleString("es-CO")} kg iniciales` });
    if (pile.closedAt && inPeriod(pile.closedAt, period)) events.push({ id: `pile-close-${pile.id}`, at: pile.closedAt, plant: pile.plant, kind: "compost", title: `Pila cerrada · ${pile.code}`, detail: `${compostYieldPct(pile).toFixed(1)} % rendimiento` });
  }
  events.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const plantNames = new Map<string, string>();
  for (const item of [...input.activities, ...input.receptions, ...input.tickets, ...input.piles, ...input.equipment]) plantNames.set(item.plantId, item.plant);
  if (!plantNames.has("yarumal")) plantNames.set("yarumal", "Yarumal");
  if (!plantNames.has("tamesis")) plantNames.set("tamesis", "Támesis");
  const plantComparison = [...plantNames.entries()].map(([id, name]) => summarizePlant(id, name, period, input)).sort((a, b) => a.plant.localeCompare(b.plant));

  return {
    period,
    receivedKg,
    rejectionKg,
    rejectionPct: pct(rejectionKg, receivedKg),
    laborHours,
    downtimeMinutes,
    scheduledCount: scheduled.length,
    executedScheduledCount: executedScheduled.length,
    delayedCount: delayed.length,
    unplannedCount: unplanned.length,
    compliancePct: pct(executedScheduled.length, scheduled.length),
    exceptionsCount: delayed.length + nonConformingReceipts + openIncidents + activeMaintenance,
    nonConformingReceipts,
    openIncidents,
    maintenanceTickets,
    activePiles: piles.filter((item) => item.status === "active").length,
    maturingPiles: piles.filter((item) => item.status === "maturing").length,
    closedPilesInPeriod: closedPiles.length,
    averageClosedYieldPct,
    trend,
    processHours: rank(processMap),
    workerHours: rank(workerMap),
    equipmentDowntime: rank(equipmentMap),
    plantComparison,
    events: events.slice(0, 14),
    latestCompost,
    dataCounts: { activities: activities.length, receptions: periodReceipts.length, tickets: maintenanceTickets, piles: piles.length },
  };
}

function csvCell(value: string | number) {
  const text = String(value).replaceAll('"', '""');
  return `"${text}"`;
}

export function analyticsCsv(analytics: DashboardAnalytics) {
  const rows: Array<Array<string | number>> = [
    ["GREENATICS OPS", analytics.period.label],
    ["Indicador", "Valor"],
    ["Recibido kg", analytics.receivedKg.toFixed(2)],
    ["Rechazo kg", analytics.rejectionKg.toFixed(2)],
    ["Rechazo %", analytics.rejectionPct.toFixed(2)],
    ["Horas-hombre", analytics.laborHours.toFixed(2)],
    ["Cumplimiento %", analytics.compliancePct.toFixed(2)],
    ["Parada min", analytics.downtimeMinutes.toFixed(2)],
    ["Excepciones", analytics.exceptionsCount],
    [],
    ["Periodo", "Recibido kg", "Horas-hombre", "Parada min"],
    ...analytics.trend.map((point) => [point.label, point.receivedKg.toFixed(2), point.laborHours.toFixed(2), point.downtimeMinutes.toFixed(2)]),
  ];
  return `\uFEFF${rows.map((row) => row.map(csvCell).join(";")).join("\n")}`;
}
