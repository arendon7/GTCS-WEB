import type { DashboardPeriod, PlantFilter } from "@/lib/analytics";
import { aggregateProductStocks, lotStocks, type InventoryMovement, type InventoryUnit, type ProductionRecord } from "@/lib/inventory-domain";
import { bogotaDateKey } from "@/lib/time";

export type UnitMetric = { unit: InventoryUnit; quantity: number };
export type ProductMetric = { productId: string; productName: string; unit: InventoryUnit; quantity: number; plant?: string; lots?: number };
export type InventoryAnalyticsEvent = { id: string; at: string; plant: string; kind: "production" | "dispatch" | "adjustment"; title: string; detail: string };

export type InventoryAnalytics = {
  productionByUnit: UnitMetric[];
  productionByProduct: ProductMetric[];
  inflowByUnit: UnitMetric[];
  outflowByUnit: UnitMetric[];
  currentStockByUnit: UnitMetric[];
  currentStockByProduct: ProductMetric[];
  currentLotCount: number;
  periodMovementCount: number;
  periodProductionCount: number;
  events: InventoryAnalyticsEvent[];
};

const UNIT_ORDER: InventoryUnit[] = ["kg", "L", "unidades"];

function inPeriod(iso: string, period: DashboardPeriod) {
  const key = bogotaDateKey(iso);
  return key >= period.startKey && key <= period.endKey;
}

function filterPlant<T extends { plantId: string }>(items: T[], plantId: PlantFilter) {
  return plantId === "all" ? items : items.filter((item) => item.plantId === plantId);
}

function unitMetrics(items: Array<{ unit: InventoryUnit; quantity: number }>) {
  const totals = new Map<InventoryUnit, number>();
  for (const item of items) totals.set(item.unit, (totals.get(item.unit) ?? 0) + item.quantity);
  return UNIT_ORDER.filter((unit) => totals.has(unit)).map((unit) => ({ unit, quantity: totals.get(unit) ?? 0 }));
}

function productMetrics(items: Array<{ productId: string; productName: string; unit: InventoryUnit; quantity: number; plant?: string; lots?: number }>) {
  const totals = new Map<string, ProductMetric>();
  for (const item of items) {
    const key = `${item.productId}|${item.unit}`;
    const current = totals.get(key) ?? { productId: item.productId, productName: item.productName, unit: item.unit, quantity: 0, plant: item.plant, lots: 0 };
    current.quantity += item.quantity;
    current.lots = (current.lots ?? 0) + (item.lots ?? 0);
    if (current.plant && item.plant && current.plant !== item.plant) current.plant = undefined;
    totals.set(key, current);
  }
  return [...totals.values()].sort((a,b) => b.quantity - a.quantity || a.productName.localeCompare(b.productName,"es"));
}

export function buildInventoryAnalytics(input: {
  productions: ProductionRecord[];
  movements: InventoryMovement[];
  period: DashboardPeriod;
  plantId: PlantFilter;
}): InventoryAnalytics {
  const productions = filterPlant(input.productions, input.plantId);
  const movements = filterPlant(input.movements, input.plantId);
  const periodProductions = productions.filter((item) => inPeriod(item.completedAt, input.period));
  const periodMovements = movements.filter((item) => inPeriod(item.occurredAt, input.period));
  const inflows = periodMovements.filter((item) => item.kind === "production" || item.kind === "adjustment_in");
  const outflows = periodMovements.filter((item) => item.kind === "dispatch" || item.kind === "adjustment_out");

  const currentLots = lotStocks(movements).filter((item) => item.quantity > 0);
  const currentProducts = aggregateProductStocks(movements).filter((item) => item.quantity > 0);

  const events: InventoryAnalyticsEvent[] = periodMovements.map((movement) => ({
    id: `inventory-${movement.id}`,
    at: movement.occurredAt,
    plant: movement.plant,
    kind: movement.kind === "production" ? "production" : movement.kind === "dispatch" ? "dispatch" : "adjustment",
    title: movement.kind === "production" ? `Producción ${movement.lotCode}` : movement.kind === "dispatch" ? `Salida ${movement.lotCode}` : `Ajuste ${movement.lotCode}`,
    detail: `${movement.productName} · ${movement.quantity.toLocaleString("es-CO")} ${movement.unit}${movement.destination ? ` · ${movement.destination}` : ""}`,
  })).sort((a,b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return {
    productionByUnit: unitMetrics(periodProductions),
    productionByProduct: productMetrics(periodProductions),
    inflowByUnit: unitMetrics(inflows),
    outflowByUnit: unitMetrics(outflows),
    currentStockByUnit: unitMetrics(currentLots),
    currentStockByProduct: productMetrics(currentProducts),
    currentLotCount: currentLots.length,
    periodMovementCount: periodMovements.length,
    periodProductionCount: periodProductions.length,
    events,
  };
}

export function inventoryAnalyticsCsvSection(analytics: InventoryAnalytics) {
  const rows: string[][] = [
    ["PRODUCCIÓN DEL PERIODO"],
    ["Unidad", "Cantidad"],
    ...analytics.productionByUnit.map((item) => [item.unit, item.quantity.toFixed(2)]),
    [],
    ["Producto", "Unidad", "Producción periodo"],
    ...analytics.productionByProduct.map((item) => [item.productName, item.unit, item.quantity.toFixed(2)]),
    [],
    ["MOVIMIENTOS DEL PERIODO"],
    ["Unidad", "Entradas", "Salidas"],
    ...UNIT_ORDER.filter((unit) => analytics.inflowByUnit.some((item) => item.unit === unit) || analytics.outflowByUnit.some((item) => item.unit === unit)).map((unit) => [
      unit,
      (analytics.inflowByUnit.find((item) => item.unit === unit)?.quantity ?? 0).toFixed(2),
      (analytics.outflowByUnit.find((item) => item.unit === unit)?.quantity ?? 0).toFixed(2),
    ]),
    [],
    ["STOCK ACTUAL (snapshot, no depende del periodo)"],
    ["Producto", "Unidad", "Cantidad", "Lotes"],
    ...analytics.currentStockByProduct.map((item) => [item.productName, item.unit, item.quantity.toFixed(2), String(item.lots ?? 0)]),
  ];
  return rows.map((row) => row.map((value) => /[;"\n]/.test(value) ? `"${value.replaceAll('"','""')}"` : value).join(";")).join("\n");
}
