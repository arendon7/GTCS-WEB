export type CompostStatus = "active" | "maturing" | "closed";
export type CompostRangeStatus = "not_configured" | "not_recorded" | "within_range" | "out_of_range";
export type CompostEventType = "formation" | "turning" | "hydration" | "other";
export type CompostIntakeLotStatus = "available" | "quarantined" | "in_process" | "depleted";

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

export type CompostIntakeLot = {
  id: string;
  receiptId: string;
  plantId: string;
  lotCode: string;
  initialMassKg: number;
  availableMassKg: number;
  status: CompostIntakeLotStatus;
  receivedAt: string;
};

export type CompostSourceAllocation = {
  pileId: string;
  intakeLotId: string;
  lotCode: string;
  allocatedMassKg?: number;
  allocationConfirmed: boolean;
};

export type CompostEvent = {
  id: string;
  pileId: string;
  type: CompostEventType;
  startedAt: string;
  endedAt: string;
  volumeM3?: number;
  workerIds: string[];
  notes?: string;
};

export type CompostControlRange = {
  plantId: string;
  temperatureAvgMinC?: number;
  temperatureAvgMaxC?: number;
  humidityMinPct?: number;
  humidityMaxPct?: number;
  active: boolean;
};

export type CompostMeasurement = {
  id: string;
  pileId: string;
  recordedAt: string;
  temperaturePointsC: number[];
  ambientTemperatureC?: number;
  temperatureAvgC?: number;
  humidityPct?: number;
  temperatureRangeStatus?: Exclude<CompostRangeStatus, "not_recorded">;
  humidityRangeStatus?: CompostRangeStatus;
  notes?: string;
};

export function averageTemperature(measurement: Pick<CompostMeasurement, "temperaturePointsC" | "temperatureAvgC">) {
  if (measurement.temperatureAvgC !== undefined) return measurement.temperatureAvgC;
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

export function compostEventDurationHours(event: Pick<CompostEvent, "startedAt" | "endedAt">) {
  return Math.max(0, (new Date(event.endedAt).getTime() - new Date(event.startedAt).getTime()) / 3_600_000);
}

export function compostEventProductivity(event: Pick<CompostEvent, "startedAt" | "endedAt" | "volumeM3" | "workerIds">) {
  const hours = compostEventDurationHours(event);
  if (!event.volumeM3 || hours <= 0 || event.workerIds.length === 0) return 0;
  return event.volumeM3 / (hours * event.workerIds.length);
}

export function rangeStatusLabel(status?: CompostRangeStatus) {
  if (!status || status === "not_configured") return "Sin rango configurado";
  if (status === "not_recorded") return "No medido";
  if (status === "within_range") return "Dentro de rango";
  return "Fuera de rango";
}
