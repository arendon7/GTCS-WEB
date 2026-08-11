import type { DashboardPeriod, PlantFilter } from "@/lib/analytics";
import { grossBillingCop, soldQuantityByUnit, type SaleRecord } from "@/lib/commercial-domain";
import type { InventoryUnit } from "@/lib/inventory-domain";
import { bogotaDateKey } from "@/lib/time";

export type CommercialUnitMetric = { unit: InventoryUnit; quantity: number };
export type CommercialRanked = {
  id: string;
  label: string;
  grossCop: number;
  salesCount: number;
  quantities: CommercialUnitMetric[];
};
export type CommercialAnalyticsEvent = {
  id: string;
  at: string;
  plant: string;
  kind: "sale";
  title: string;
  detail: string;
};

export type CommercialAnalytics = {
  salesCount: number;
  grossBillingCop: number;
  averageTicketCop: number;
  soldByUnit: CommercialUnitMetric[];
  customers: CommercialRanked[];
  products: CommercialRanked[];
  events: CommercialAnalyticsEvent[];
};

function inPeriod(iso: string, period: DashboardPeriod) {
  const key = bogotaDateKey(iso);
  return key >= period.startKey && key <= period.endKey;
}

function filterPlant(sales: SaleRecord[], plantId: PlantFilter) {
  return plantId === "all" ? sales : sales.filter((sale) => sale.plantId === plantId);
}

function addQuantity(map: Map<InventoryUnit, number>, unit: InventoryUnit, quantity: number) {
  map.set(unit, (map.get(unit) ?? 0) + quantity);
}

function ranked(
  sales: SaleRecord[],
  keyFor: (sale: SaleRecord) => string,
  labelFor: (sale: SaleRecord) => string,
) {
  const map = new Map<string, { label: string; grossCop: number; salesCount: number; quantities: Map<InventoryUnit, number> }>();
  for (const sale of sales) {
    const id = keyFor(sale);
    const current = map.get(id) ?? { label: labelFor(sale), grossCop: 0, salesCount: 0, quantities: new Map<InventoryUnit, number>() };
    current.grossCop += sale.totalCop;
    current.salesCount += 1;
    addQuantity(current.quantities, sale.unit, sale.quantity);
    map.set(id, current);
  }
  return [...map.entries()]
    .map(([id, item]): CommercialRanked => ({
      id,
      label: item.label,
      grossCop: item.grossCop,
      salesCount: item.salesCount,
      quantities: (["kg", "L", "unidades"] as InventoryUnit[])
        .filter((unit) => item.quantities.has(unit))
        .map((unit) => ({ unit, quantity: item.quantities.get(unit) ?? 0 })),
    }))
    .sort((a, b) => b.grossCop - a.grossCop || a.label.localeCompare(b.label, "es"));
}

export function buildCommercialAnalytics(input: {
  sales: SaleRecord[];
  period: DashboardPeriod;
  plantId: PlantFilter;
}): CommercialAnalytics {
  const sales = filterPlant(input.sales, input.plantId).filter((sale) => inPeriod(sale.soldAt, input.period));
  const gross = grossBillingCop(sales);

  return {
    salesCount: sales.length,
    grossBillingCop: gross,
    averageTicketCop: sales.length ? gross / sales.length : 0,
    soldByUnit: soldQuantityByUnit(sales),
    customers: ranked(sales, (sale) => sale.customerId, (sale) => sale.customerName),
    products: ranked(sales, (sale) => sale.productId, (sale) => sale.productName),
    events: sales.map((sale): CommercialAnalyticsEvent => ({
      id: `sale-${sale.id}`,
      at: sale.soldAt,
      plant: sale.plant,
      kind: "sale",
      title: `Venta ${sale.lotCode}`,
      detail: `${sale.customerName} · ${sale.quantity.toLocaleString("es-CO")} ${sale.unit} · $${sale.totalCop.toLocaleString("es-CO")}`,
    })).sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()),
  };
}

function csvCell(value: string | number) {
  const text = String(value);
  return /[;"\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function commercialAnalyticsCsvSection(analytics: CommercialAnalytics) {
  const rows: Array<Array<string | number>> = [
    ["VENTAS DEL PERIODO"],
    ["Indicador", "Valor"],
    ["Ventas", analytics.salesCount],
    ["Facturación bruta COP", analytics.grossBillingCop.toFixed(0)],
    ["Ticket promedio COP", analytics.averageTicketCop.toFixed(0)],
    [],
    ["Unidad", "Cantidad vendida"],
    ...analytics.soldByUnit.map((item) => [item.unit, item.quantity.toFixed(2)]),
    [],
    ["CLIENTES"],
    ["Cliente", "Facturación COP", "Ventas", "Cantidades"],
    ...analytics.customers.map((item) => [item.label, item.grossCop.toFixed(0), item.salesCount, item.quantities.map((q) => `${q.quantity.toFixed(2)} ${q.unit}`).join(" | ")]),
    [],
    ["PRODUCTOS"],
    ["Producto", "Facturación COP", "Ventas", "Cantidades"],
    ...analytics.products.map((item) => [item.label, item.grossCop.toFixed(0), item.salesCount, item.quantities.map((q) => `${q.quantity.toFixed(2)} ${q.unit}`).join(" | ")]),
  ];
  return rows.map((row) => row.map(csvCell).join(";")).join("\n");
}
