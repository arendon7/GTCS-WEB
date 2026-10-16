type DashboardReportScope = {
  plantName: string;
  sourceMode: "local" | "supabase";
  generatedAt: string;
};

/** Preserve the measured sections and identify the scope of the downloaded cut. */
export function withDashboardReportScope(csv: string, scope: DashboardReportScope) {
  const cell = (value: string) => /[;"\r\n]/.test(value)
    ? `"${value.replaceAll('"', '""')}"` : value;
  const rows = [
    ["ALCANCE DEL INFORME"],
    ["Planta seleccionada", scope.plantName],
    ["Modo de datos", scope.sourceMode],
    ["Informe generado (UTC)", scope.generatedAt],
    ["Stock", "Snapshot cargado en la sesión; no se reconstruye históricamente"],
  ];
  return `${csv}\n\n${rows.map((row) => row.map(cell).join(";")).join("\n")}`;
}
