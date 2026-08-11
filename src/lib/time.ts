const BOGOTA_TIME_ZONE = "America/Bogota";

const bogotaDateParts = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
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
