import type { CompostMeasurement, CompostPile } from "@/lib/compost-domain";

export const seedCompostPiles: CompostPile[] = [
  {
    id: "pile-tam-001",
    plantId: "tamesis",
    plant: "Támesis",
    code: "TAM-COMP-260811-001",
    location: "Zona compostaje A",
    sourceReceiptIds: ["rec-002"],
    initialWeightKg: 1900,
    startedAt: "2026-08-11T11:20:00-05:00",
    status: "active",
  },
];

export const seedCompostMeasurements: CompostMeasurement[] = [
  { id: "cm-001", pileId: "pile-tam-001", recordedAt: "2026-08-11T12:00:00-05:00", temperaturePointsC: [54, 56, 55], humidityPct: 62, notes: "Control inicial." },
];
