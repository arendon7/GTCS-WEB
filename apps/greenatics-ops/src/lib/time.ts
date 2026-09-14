const BOGOTA_TIME_ZONE = "America/Bogota";

const bogotaDateParts = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: BOGOTA_TIME_ZONE,
});

const bogotaDateTimeParts = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  hourCycle: "h23",
  timeZone: BOGOTA_TIME_ZONE,
});

export const bogotaTime = new Intl.DateTimeFormat("es-CO", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: BOGOTA_TIME_ZONE,
});

export function bogotaDateKey(value: string | Date) {
  const parts = bogotaDateParts.formatToParts(typeof value === "string" ? new Date(value) : value);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;
  if (!year || !month || !day) throw new Error("No se pudo construir la fecha operativa de Bogotá.");
  return `${year}-${month}-${day}`;
}

export function compactBogotaDate(value: string | Date) {
  const [year, month, day] = bogotaDateKey(value).split("-");
  return `${year.slice(2)}${month}${day}`;
}

export function bogotaDatetimeLocalValue(value: string | Date = new Date()) {
  const parts = bogotaDateTimeParts.formatToParts(typeof value === "string" ? new Date(value) : value);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  const year = read("year");
  const month = read("month");
  const day = read("day");
  const hour = read("hour");
  const minute = read("minute");
  if (!year || !month || !day || !hour || !minute) throw new Error("No se pudo construir la hora operativa de Bogotá.");
  return `${year}-${month}-${day}T${hour}:${minute}`;
}

export function bogotaDatetimeLocalToIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Fecha y hora de Bogotá inválidas.");
  const parsed = new Date(`${value}:00-05:00`);
  if (!Number.isFinite(parsed.getTime())) throw new Error("Fecha y hora de Bogotá inválidas.");
  return parsed.toISOString();
}
