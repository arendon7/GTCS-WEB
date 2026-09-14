import { describe, expect, it } from "vitest";
import { aggregateProductStocks, lotStocks, stockForLot, type InventoryMovement } from "./inventory-domain";

const movements: InventoryMovement[] = [
  { id:"m1", plantId:"tamesis", plant:"Támesis", productId:"p1", productName:"Wondergreen sólido", unit:"kg", lotCode:"TAM-PROD-001", kind:"production", quantity:250, occurredAt:"2026-08-11T10:00:00-05:00" },
  { id:"m2", plantId:"tamesis", plant:"Támesis", productId:"p1", productName:"Wondergreen sólido", unit:"kg", lotCode:"TAM-PROD-001", kind:"dispatch", quantity:60, occurredAt:"2026-08-11T11:00:00-05:00" },
  { id:"m3", plantId:"tamesis", plant:"Támesis", productId:"p1", productName:"Wondergreen sólido", unit:"kg", lotCode:"TAM-PROD-002", kind:"production", quantity:100, occurredAt:"2026-08-11T12:00:00-05:00" },
];

describe("inventory ledger", () => {
  it("derives stock by lot from append-only movements", () => {
    expect(stockForLot(movements,"tamesis","p1","TAM-PROD-001")).toBe(190);
    expect(stockForLot(movements,"tamesis","p1","TAM-PROD-002")).toBe(100);
  });

  it("keeps lots separate while aggregating product stock", () => {
    expect(lotStocks(movements)).toHaveLength(2);
    const summary=aggregateProductStocks(movements)[0];
    expect(summary.quantity).toBe(290);
    expect(summary.lots).toBe(2);
    expect(summary.unit).toBe("kg");
  });
});
