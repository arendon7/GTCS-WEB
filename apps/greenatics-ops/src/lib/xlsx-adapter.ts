import { read, utils, type WorkSheet } from "xlsx";
import type { LegacyImportPayload, LegacyLogRow, LegacyReceiptRow } from "@/lib/importer";
import { sha256Bytes } from "@/lib/importer";

export type XlsxAdapterIssueCode = "SHEET_UNRECOGNIZED" | "PLANT_UNRESOLVED" | "AMBIGUOUS_MASS_PROFILE";
export type XlsxAdapterIssue = { sheetName: string; code: XlsxAdapterIssueCode; detail: string };
export type XlsxSheetSummary = { name: string; kind: "logs" | "receipts" | "unknown"; plant?: string; rows: number; profile?: string };
export type XlsxAdapterResult = { payload: LegacyImportPayload; sourceHash: string; sheets: XlsxSheetSummary[]; issues: XlsxAdapterIssue[] };

type Cell = string | number | boolean | Date | null | undefined;
type Matrix = Cell[][];

const LOG_HEADERS = ["fecha", "actividad a realizar", "trabajador responsable", "hora de inicio", "hora de finalizacion"];
const RECEIPT_HEADERS = ["fecha y hora", "cliente", "masa ton"];

function normalize(value: unknown) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CO")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function sheetPlant(sheetName: string) {
  const name = normalize(sheetName);
  if (name.includes("yaruma")) return "Yarumal";
  if (name.includes("tamesi")) return "Támesis";
  return undefined;
}

function matrix(sheet: WorkSheet): Matrix {
  return utils.sheet_to_json<Cell[]>(sheet, { header: 1, raw: true, defval: null }) as Matrix;
}

function headerIndex(headers: Cell[]) {
  const result = new Map<string, number>();
  headers.forEach((value, index) => result.set(normalize(value), index));
  return result;
}

function hasHeaders(index: Map<string, number>, required: string[]) {
  return required.every((header) => index.has(header));
}

function cell(row: Cell[], index: Map<string, number>, header: string) {
  const position = index.get(header);
  return position === undefined ? undefined : row[position];
}

function text(value: Cell) { return value === null || value === undefined ? "" : String(value).trim(); }
function finiteNumber(value: Cell) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(",", "."));
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function pad(value: number) { return String(value).padStart(2, "0"); }

export function excelSerialToBogotaIso(value: Cell) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const wall = new Date(Date.UTC(1899, 11, 30) + Math.round(value * 86_400_000));
    return `${wall.getUTCFullYear()}-${pad(wall.getUTCMonth() + 1)}-${pad(wall.getUTCDate())}T${pad(wall.getUTCHours())}:${pad(wall.getUTCMinutes())}:${pad(wall.getUTCSeconds())}-05:00`;
  }
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return `${value.getUTCFullYear()}-${pad(value.getUTCMonth() + 1)}-${pad(value.getUTCDate())}T${pad(value.getUTCHours())}:${pad(value.getUTCMinutes())}:${pad(value.getUTCSeconds())}-05:00`;
  }
  return text(value);
}

function rowId(sheetName: string, excelRow: number) { return `${sheetName}!${excelRow}`; }

function parseLogs(sheetName: string, rows: Matrix, headers: Map<string, number>, plant: string): LegacyLogRow[] {
  const result: LegacyLogRow[] = [];
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const activity = text(cell(row, headers, "actividad a realizar"));
    const worker = text(cell(row, headers, "trabajador responsable"));
    const startedAt = excelSerialToBogotaIso(cell(row, headers, "hora de inicio"));
    const endedAt = excelSerialToBogotaIso(cell(row, headers, "hora de finalizacion"));
    if (!activity && !worker && !startedAt && !endedAt) continue;
    result.push({
      rowId: rowId(sheetName, rowIndex + 1),
      plant,
      activity,
      worker,
      startedAt,
      endedAt,
      equipment: text(cell(row, headers, "herramientas utilizadas")) || undefined,
    });
  }
  return result;
}

function receiptMassProfile(sheetName: string, plant: string) {
  if (plant === "Támesis") return { massUnit: "t", profile: "Támesis · Masa (Ton) declarada como toneladas" };
  if (plant === "Yarumal") return { massUnit: "ambiguous-mixed-ton-column", profile: "Yarumal · Masa (Ton) con valores de escala incompatible; requiere decisión" };
  return { massUnit: "ambiguous", profile: `${sheetName} · unidad sin perfil aprobado` };
}

function parseReceipts(sheetName: string, rows: Matrix, headers: Map<string, number>, plant: string): LegacyReceiptRow[] {
  const result: LegacyReceiptRow[] = [];
  const massProfile = receiptMassProfile(sheetName, plant);
  const rejectionWeightHeader = headers.has("material de rechazo peso kg") ? "material de rechazo peso kg" : undefined;
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const row = rows[rowIndex] ?? [];
    const date = excelSerialToBogotaIso(cell(row, headers, "fecha y hora"));
    const generator = text(cell(row, headers, "cliente"));
    const netWeight = finiteNumber(cell(row, headers, "masa ton"));
    if (!date && !generator && netWeight === undefined) continue;
    const plate = text(cell(row, headers, "placa"));
    const rejectionKg = rejectionWeightHeader ? finiteNumber(cell(row, headers, rejectionWeightHeader)) : undefined;
    result.push({
      rowId: rowId(sheetName, rowIndex + 1),
      plant,
      date,
      generator: generator || "Generador no informado en fuente",
      route: plate ? `Placa ${plate}` : "Ruta/origen no informado en fuente",
      wasteType: "FORSU",
      netWeight: netWeight ?? Number.NaN,
      massUnit: massProfile.massUnit,
      rejectionKg,
      rejectionKnown: rejectionKg !== undefined,
      timePrecision: "datetime",
    });
  }
  return result;
}

export async function parseGreenaticsWorkbook(bytes: ArrayBuffer, sourceName: string): Promise<XlsxAdapterResult> {
  const sourceHash = await sha256Bytes(bytes);
  const workbook = read(bytes, { type: "array", cellDates: false });
  const receipts: LegacyReceiptRow[] = [];
  const logs: LegacyLogRow[] = [];
  const sheets: XlsxSheetSummary[] = [];
  const issues: XlsxAdapterIssue[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = matrix(sheet);
    const headers = headerIndex(rows[0] ?? []);
    const plant = sheetPlant(sheetName);

    if (hasHeaders(headers, LOG_HEADERS)) {
      if (!plant) {
        issues.push({ sheetName, code: "PLANT_UNRESOLVED", detail: "La hoja parece una bitácora pero el nombre no permite resolver Yarumal/Támesis." });
        sheets.push({ name: sheetName, kind: "logs", rows: Math.max(0, rows.length - 1) });
        continue;
      }
      const parsed = parseLogs(sheetName, rows, headers, plant);
      logs.push(...parsed);
      sheets.push({ name: sheetName, kind: "logs", plant, rows: parsed.length, profile: "Bitácora operativa por cabeceras canónicas" });
      continue;
    }

    if (hasHeaders(headers, RECEIPT_HEADERS)) {
      if (!plant) {
        issues.push({ sheetName, code: "PLANT_UNRESOLVED", detail: "La hoja parece una recepción pero el nombre no permite resolver Yarumal/Támesis." });
        sheets.push({ name: sheetName, kind: "receipts", rows: Math.max(0, rows.length - 1) });
        continue;
      }
      const parsed = parseReceipts(sheetName, rows, headers, plant);
      receipts.push(...parsed);
      const massProfile = receiptMassProfile(sheetName, plant);
      sheets.push({ name: sheetName, kind: "receipts", plant, rows: parsed.length, profile: massProfile.profile });
      if (massProfile.massUnit.startsWith("ambiguous")) issues.push({ sheetName, code: "AMBIGUOUS_MASS_PROFILE", detail: "La columna Masa (Ton) no se convierte automáticamente porque la misma fuente contiene escalas incompatibles. Las filas quedarán en cuarentena de staging." });
      continue;
    }

    issues.push({ sheetName, code: "SHEET_UNRECOGNIZED", detail: "La hoja no coincide con las cabeceras aprobadas de bitácora o recepción y no se ignora silenciosamente." });
    sheets.push({ name: sheetName, kind: "unknown", rows: Math.max(0, rows.length - 1) });
  }

  return { payload: { sourceName, receipts, logs }, sourceHash, sheets, issues };
}
