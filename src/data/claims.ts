export type ImpactClaim = {
  id: "monthly-diversion" | "reception-purity" | "avoided-haul" | "freight-savings";
  value: string;
  label: string;
  compactLabel: string;
  context: string;
  evidence: string;
  method: string;
};

export const yarumalClaims: readonly ImpactClaim[] = [
  {
    id: "monthly-diversion",
    value: "+120 t/mes",
    label: "de residuos orgánicos desviados de disposición final",
    compactLabel: "Orgánicos desviados",
    context: "Caso Yarumal · periodo validado",
    evidence: "Registros operativos",
    method:
      "Consolidación de la masa orgánica recibida y gestionada durante el periodo de operación validado.",
  },
  {
    id: "reception-purity",
    value: "96,4 %",
    label: "de pureza orgánica en recepción",
    compactLabel: "Pureza en recepción",
    context: "Caso Yarumal · periodo validado",
    evidence: "Caracterización en recepción",
    method:
      "Relación entre material orgánico aceptado y masa total caracterizada al ingreso de la planta.",
  },
  {
    id: "avoided-haul",
    value: "140 km",
    label: "de transporte regional evitado por viaje sustituido",
    compactLabel: "Transporte evitado por viaje",
    context: "Caso Yarumal · ruta validada",
    evidence: "Comparación logística",
    method:
      "Diferencia de recorrido entre el traslado regional de referencia y el aprovechamiento local del material.",
  },
  {
    id: "freight-savings",
    value: "$180 M COP/año",
    label: "de ahorro validado en fletes",
    compactLabel: "Ahorro anual en fletes",
    context: "Caso Yarumal · escenario anualizado",
    evidence: "Modelo económico validado",
    method:
      "Anualización del costo de transporte sustituido con la frecuencia y las condiciones logísticas validadas.",
  },
] as const;

export function getYarumalClaim(id: ImpactClaim["id"]): ImpactClaim {
  const claim = yarumalClaims.find((item) => item.id === id);

  if (!claim) {
    throw new Error(`Unknown Yarumal claim: ${id}`);
  }

  return claim;
}
