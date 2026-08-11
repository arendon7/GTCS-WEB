export type InventoryUnit = "kg" | "L" | "unidades";
export type InventoryMovementKind = "production" | "dispatch" | "adjustment_in" | "adjustment_out";

export type ProductMaster = {
  id: string;
  name: string;
  unit: InventoryUnit;
  active: boolean;
  createdAt: string;
};

export type ProductionRecord = {
  id: string;
  plantId: string;
  plant: string;
  productId: string;
  productName: string;
  unit: InventoryUnit;
  quantity: number;
  lotCode: string;
  sourceProcess: string;
  sourcePileId?: string;
  completedAt: string;
  note?: string;
};

export type InventoryMovement = {
  id: string;
  plantId: string;
  plant: string;
  productId: string;
  productName: string;
  unit: InventoryUnit;
  lotCode: string;
  kind: InventoryMovementKind;
  quantity: number;
  occurredAt: string;
  referenceId?: string;
  destination?: string;
  note?: string;
};

export type LotStock = {
  plantId: string;
  plant: string;
  productId: string;
  productName: string;
  unit: InventoryUnit;
  lotCode: string;
  quantity: number;
};

export function signedMovementQuantity(movement: Pick<InventoryMovement, "kind" | "quantity">) {
  return movement.kind === "dispatch" || movement.kind === "adjustment_out" ? -movement.quantity : movement.quantity;
}

export function stockForLot(movements: InventoryMovement[], plantId: string, productId: string, lotCode: string) {
  return movements
    .filter((movement) => movement.plantId === plantId && movement.productId === productId && movement.lotCode === lotCode)
    .reduce((sum, movement) => sum + signedMovementQuantity(movement), 0);
}

export function lotStocks(movements: InventoryMovement[]): LotStock[] {
  const map = new Map<string, LotStock>();
  for (const movement of movements) {
    const key = `${movement.plantId}|${movement.productId}|${movement.lotCode}`;
    const current = map.get(key) ?? {
      plantId: movement.plantId,
      plant: movement.plant,
      productId: movement.productId,
      productName: movement.productName,
      unit: movement.unit,
      lotCode: movement.lotCode,
      quantity: 0,
    };
    current.quantity += signedMovementQuantity(movement);
    map.set(key, current);
  }
  return [...map.values()].filter((row) => Math.abs(row.quantity) > 1e-9).sort((a,b) => a.productName.localeCompare(b.productName,"es") || a.lotCode.localeCompare(b.lotCode,"es"));
}

export function aggregateProductStocks(movements: InventoryMovement[]) {
  const map = new Map<string, { plantId: string; plant: string; productId: string; productName: string; unit: InventoryUnit; quantity: number; lots: number }>();
  for (const lot of lotStocks(movements)) {
    const key = `${lot.plantId}|${lot.productId}`;
    const current = map.get(key) ?? { plantId: lot.plantId, plant: lot.plant, productId: lot.productId, productName: lot.productName, unit: lot.unit, quantity: 0, lots: 0 };
    current.quantity += lot.quantity;
    current.lots += 1;
    map.set(key, current);
  }
  return [...map.values()].filter((row) => Math.abs(row.quantity) > 1e-9).sort((a,b) => a.productName.localeCompare(b.productName,"es"));
}
