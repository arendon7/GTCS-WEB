import { describe, expect, it } from "vitest";
import { withDashboardReportScope } from "./dashboard-report";

describe("downloaded dashboard report scope", () => {
  it("preserves the measured report and identifies the plant, source and export time", () => {
    const measured = "\uFEFFGREENATICS OPS;Día\nRecibido kg;1500.00\nPRODUCCIÓN DEL PERIODO\nkg;300.00";
    const csv = withDashboardReportScope(measured, {
      plantName: "Támesis", sourceMode: "local", generatedAt: "2026-10-16T18:00:00.000Z",
    });
    expect(csv.startsWith(`${measured}\n\n`)).toBe(true);
    expect(csv.match(/\uFEFF/g)).toHaveLength(1);
    expect(csv).toContain("Planta seleccionada;Támesis\nModo de datos;local");
    expect(csv).toContain("Informe generado (UTC);2026-10-16T18:00:00.000Z");
    expect(csv).toContain('Stock;"Snapshot cargado en la sesión; no se reconstruye históricamente"');
  });

  it("escapes a configured plant label without adding rows or changing the source mode", () => {
    const csv = withDashboardReportScope("\uFEFFInforme", {
      plantName: 'Planta; "Norte"\nSegunda línea',
      sourceMode: "supabase", generatedAt: "2026-10-16T18:00:00.000Z",
    });
    expect(csv).toContain('Planta seleccionada;"Planta; ""Norte""\nSegunda línea"');
    expect(csv).toContain("Modo de datos;supabase");
  });
});
