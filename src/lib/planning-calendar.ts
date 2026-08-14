export type PlannerView = "day" | "week" | "month";

const bogotaDateTime = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Bogota",
});

function parseKey(key: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) throw new Error(`Fecha operativa inválida: ${key}`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

function utcDateFromKey(key: string) {
  const { year, month, day } = parseKey(key);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function keyFromUtcDate(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
}

export function addPlannerDays(key: string, days: number) {
  const date = utcDateFromKey(key);
  date.setUTCDate(date.getUTCDate() + days);
  return keyFromUtcDate(date);
}

export function startOfPlannerWeek(key: string) {
  const date = utcDateFromKey(key);
  const weekday = date.getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  return addPlannerDays(key, mondayOffset);
}

export function plannerMonthStart(key: string) {
  const { year, month } = parseKey(key);
  return `${year}-${String(month).padStart(2, "0")}-01`;
}

export function plannerMonthEndExclusive(key: string) {
  const { year, month } = parseKey(key);
  const date = new Date(Date.UTC(year, month, 1, 12));
  return keyFromUtcDate(date);
}

export function bogotaDayStartIso(key: string) {
  parseKey(key);
  return `${key}T05:00:00.000Z`;
}

export function plannerRange(view: PlannerView, anchorKey: string) {
  if (view === "day") {
    return { startKey: anchorKey, endKey: addPlannerDays(anchorKey, 1), startIso: bogotaDayStartIso(anchorKey), endIso: bogotaDayStartIso(addPlannerDays(anchorKey, 1)) };
  }
  if (view === "week") {
    const startKey = startOfPlannerWeek(anchorKey);
    const endKey = addPlannerDays(startKey, 7);
    return { startKey, endKey, startIso: bogotaDayStartIso(startKey), endIso: bogotaDayStartIso(endKey) };
  }
  const startKey = plannerMonthStart(anchorKey);
  const endKey = plannerMonthEndExclusive(anchorKey);
  return { startKey, endKey, startIso: bogotaDayStartIso(startKey), endIso: bogotaDayStartIso(endKey) };
}

export function movePlannerAnchor(view: PlannerView, anchorKey: string, direction: -1 | 1) {
  if (view === "day") return addPlannerDays(anchorKey, direction);
  if (view === "week") return addPlannerDays(anchorKey, direction * 7);
  const { year, month, day } = parseKey(anchorKey);
  const date = new Date(Date.UTC(year, month - 1 + direction, Math.min(day, 28), 12));
  return keyFromUtcDate(date);
}

export function plannerWeekKeys(anchorKey: string) {
  const start = startOfPlannerWeek(anchorKey);
  return Array.from({ length: 7 }, (_, index) => addPlannerDays(start, index));
}

export function plannerMonthCells(anchorKey: string) {
  const monthStart = plannerMonthStart(anchorKey);
  const first = utcDateFromKey(monthStart);
  const sundayOffset = -first.getUTCDay();
  const gridStart = addPlannerDays(monthStart, sundayOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const key = addPlannerDays(gridStart, index);
    return { key, inMonth: key.slice(0, 7) === monthStart.slice(0, 7) };
  });
}

export function bogotaIsoToLocalInput(iso: string) {
  const parts = bogotaDateTime.formatToParts(new Date(iso));
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}`;
}

export function bogotaLocalInputToIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Fecha y hora local inválidas.");
  const date = new Date(`${value}:00-05:00`);
  if (Number.isNaN(date.getTime())) throw new Error("Fecha y hora local inválidas.");
  return date.toISOString();
}
