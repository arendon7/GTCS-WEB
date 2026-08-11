import { describe, expect, it } from "vitest";
import { utils, write } from "xlsx";
import { dryRunLegacyImport } from "./importer";
import { excelSerialToBogotaIso, parseGreenaticsWorkbook } from "./xlsx-adapter";

function workbookBytes() {
  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([
    ["Fecha", "Actividad a realizar", "Trabajador responsable", "Hora de inicio", "Hora de finalización", "Herramientas utilizadas", "Comentarios", "Datos adjuntos"],
    [46196, "Molienda", "Alejandro", 46196.291666666664, 46196.5, "Molino", null, "1"],
    [46196, "Molienda", "Gabriel", 46196.291666666664, 46196.5, "Molino", null, "1"],
  ]), "BITACORA PROCESOS PLANTA TÁMESI");
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([
    ["Fecha y hora", "Placa", "Cliente", "Masa (Ton)", "Nobre conductor", "Teléfono conductor", "MES", "Material de rechazo"],
    [46192.52777777778, "WLX212", "Municipio de Támesis", 1.3, "Carlos Vallejo", "3017452101", "junio", "9 bultos"],
  ]), "Ingreso de Material Támesis");
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([
    ["Fecha y hora", "Cliente", "Masa (Ton)", "Nobre conductor", "Teléfono conductor", "Datos adjuntos", "MES", "Material de Rechazo PESO KG", "Material de Rechazo VOLUMEN", "Placa"],
    [46197.73263888889, "Greenatics", 426, "Carlos Areiza", "89", "1", "junio", null, "12 costales", "89"],
  ]), "Ingreso de Material Yarumal");
  utils.book_append_sheet(workbook, utils.aoa_to_sheet([["Columna desconocida"], ["dato"]]), "OTRA HOJA");
  return write(workbook, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

describe("GREENATICS XLSX adapter", () => {
  it("converts Excel wall-clock serials to Bogota timestamps deterministically", () => {
    expect(excelSerialToBogotaIso(46196.583333333336)).toBe("2026-06-23T14:00:00-05:00");
  });

  it("maps approved sheets and reports unknown/ambiguous profiles", async () => {
    const parsed = await parseGreenaticsWorkbook(workbookBytes(), "BD_Operativa_Greenatics.xlsx");
    expect(parsed.sourceHash).toMatch(/^[a-f0-9]{64}$/);
    expect(parsed.payload.logs).toHaveLength(2);
    expect(parsed.payload.receipts).toHaveLength(2);
    expect(parsed.sheets.find((sheet) => sheet.name === "Ingreso de Material Támesis")?.profile).toContain("toneladas");
    expect(parsed.issues.some((issue) => issue.code === "AMBIGUOUS_MASS_PROFILE" && issue.sheetName.includes("Yarumal"))).toBe(true);
    expect(parsed.issues.some((issue) => issue.code === "SHEET_UNRECOGNIZED")).toBe(true);
  });

  it("sends Tamesis to promotable warnings and Yarumal ambiguous mass to quarantine", async () => {
    const parsed = await parseGreenaticsWorkbook(workbookBytes(), "BD_Operativa_Greenatics.xlsx");
    const run = dryRunLegacyImport(parsed.payload, parsed.sourceHash);
    const tamesis = run.receipts.find((row) => row.plantId === "tamesis");
    const yarumal = run.receipts.find((row) => row.raw.plant === "Yarumal");
    expect(tamesis?.status).toBe("warning");
    expect(tamesis?.netWeightKg).toBe(1300);
    expect(tamesis?.rejectionKnown).toBe(false);
    expect(yarumal?.status).toBe("quarantined");
    expect(run.issues.some((issue) => issue.code === "UNIT_AMBIGUOUS" && issue.rowId.includes("Yarumal"))).toBe(true);
    expect(run.activities).toHaveLength(1);
    expect(run.activities[0].workers).toEqual(["Alejandro", "Gabriel"]);
  });
});
