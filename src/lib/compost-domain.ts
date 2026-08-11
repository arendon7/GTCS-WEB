export type CompostStatus = "active" | "maturing" | "closed";

export type CompostPile = {
  id: string;
  plantId: string;
  plant: string;
  code: string;
  location: string;
  sourceReceiptIds: string[];
  initialWeightKg: number;
  startedAt: string;
  maturationStartedAt?: string;
  closedAt?: string;
  finalWeightKg?: number;
  status: CompostStatus;
};

export type CompostMeasurement = {
  id: string;
  pileId: string;
  recordedAt: string;
  temperaturePointsC: number[];
  humidityPct?: number;
  notes?: string;
};

export function averageTemperature(measurement: Pick<CompostMeasurement, "temperaturePointsC">) {
  if (!measurement.temperaturePointsC.length) return 0;
  return measurement.temperaturePointsC.reduce((sum, value) => sum + value, 0) / measurement.temperaturePointsC.length;
}

export function compostAgeDays(pile: Pick<CompostPile, "startedAt" | "closedAt">, nowIso?: string) {
  const end = pile.closedAt ?? nowIso;
  if (!end) return 0;
  return Math.max(0, (new Date(end).getTime() - new Date(pile.startedAt).getTime()) / 86_400_000);
}

export function maturationDays(pile: Pick<CompostPile, "maturationStartedAt" | "closedAt">, nowIso?: string) {
  if (!pile.maturationStartedAt) return 0;
  const end = pile.closedAt ?? nowIso;
  if (!end) return 0;
  return Math.max(0, (new Date(end).getTime() - new Date(pile.maturationStartedAt).getTime()) / 86_400_000);
}

export function compostYieldPct(pile: Pick<CompostPile, "initialWeightKg" | "finalWeightKg">) {
  if (!pile.finalWeightKg || pile.initialWeightKg <= 0) return 0;
  return (pile.finalWeightKg / pile.initialWeightKg) * 100;
}
