import type { InventoryUnit } from "@/lib/inventory-domain";

export type CustomerRecord = {
  id: string;
  name: string;
  normalizedKey: string;
  createdAt: string;
};

export type SaleRecord = {
  id: string;
  plantId: string;
  plant: string;
  customerId: string;
  customerName: string;
  productId: string;
  productName: string;
  unit: InventoryUnit;
  lotCode: string;
  quantity: number;
  unitPriceCop: number;
  totalCop: number;
  soldAt: string;
  inventoryMovementId: string;
  note?: string;
};

export function normalizeCustomerKey(value: string) {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es-CO")
    .replace(/[^a-z0-9 ]+/g, "")
    .trim();
}

export function customerIdFromKey(key: string) {
  return `customer-${key.replace(/\s+/g, "-") || "sin-nombre"}`;
}

export function saleTotalCop(quantity: number, unitPriceCop: number) {
  if (!Number.isFinite(quantity) || quantity <= 0) return 0;
  if (!Number.isFinite(unitPriceCop) || unitPriceCop <= 0) return 0;
  return quantity * unitPriceCop;
}

export function soldQuantityByUnit(sales: SaleRecord[]) {
  const totals = new Map<InventoryUnit, number>();
  for (const sale of sales) totals.set(sale.unit, (totals.get(sale.unit) ?? 0) + sale.quantity);
  return (["kg", "L", "unidades"] as InventoryUnit[])
    .filter((unit) => totals.has(unit))
    .map((unit) => ({ unit, quantity: totals.get(unit) ?? 0 }));
}

export function grossBillingCop(sales: SaleRecord[]) {
  return sales.reduce((sum, sale) => sum + sale.totalCop, 0);
}
