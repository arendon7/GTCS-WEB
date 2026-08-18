import { describe, expect, it } from "vitest";
import { resolveDashboardPeriod } from "./analytics";
import { buildInventoryAnalytics } from "./inventory-analytics";
import type { InventoryMovement, ProductionRecord } from "./inventory-domain";

const productions: ProductionRecord[] = [
  { id:"p1",plantId:"tamesis",plant:"Támesis",productId:"solid",productName:"Wondergreen sólido",unit:"kg",quantity:250,lotCode:"TAM-PROD-1",sourceProcess:"Formulación",originKind:"process",completedAt:"2026-08-11T09:00:00-05:00" },
  { id:"p2",plantId:"tamesis",plant:"Támesis",productId:"liquid",productName:"Wondergreen líquido",unit:"L",quantity:600,lotCode:"TAM-PROD-2",sourceProcess:"Formulación",originKind:"process",completedAt:"2026-08-11T10:00:00-05:00" },
  { id:"p3",plantId:"yarumal",plant:"Yarumal",productId:"solid",productName:"Wondergreen sólido",unit:"kg",quantity:100,lotCode:"YAR-PROD-1",sourceProcess:"Formulación",originKind:"process",completedAt:"2026-08-10T10:00:00-05:00" },
];

const movements: InventoryMovement[] = [
  { id:"m1",plantId:"tamesis",plant:"Támesis",productId:"solid",productName:"Wondergreen sólido",unit:"kg",lotCode:"TAM-PROD-1",kind:"production",quantity:250,occurredAt:"2026-08-11T09:00:00-05:00" },
  { id:"m2",plantId:"tamesis",plant:"Támesis",productId:"solid",productName:"Wondergreen sólido",unit:"kg",lotCode:"TAM-PROD-1",kind:"dispatch",quantity:60,occurredAt:"2026-08-11T11:00:00-05:00",destination:"Cliente" },
  { id:"m3",plantId:"tamesis",plant:"Támesis",productId:"liquid",productName:"Wondergreen líquido",unit:"L",lotCode:"TAM-PROD-2",kind:"production",quantity:600,occurredAt:"2026-08-11T10:00:00-05:00" },
  { id:"m4",plantId:"tamesis",plant:"Támesis",productId:"solid",productName:"Wondergreen sólido",unit:"kg",lotCode:"TAM-OLD",kind:"production",quantity:50,occurredAt:"2026-08-01T10:00:00-05:00" },
];

describe("production and inventory analytics", () => {
  it("never mixes incompatible production units", () => {
    const result=buildInventoryAnalytics({productions,movements,period:resolveDashboardPeriod("day","2026-08-11"),plantId:"all"});
    expect(result.productionByUnit).toEqual([{unit:"kg",quantity:250},{unit:"L",quantity:600}]);
    expect(result.productionByProduct.find((item)=>item.productId==="solid")?.quantity).toBe(250);
    expect(result.productionByProduct.find((item)=>item.productId==="liquid")?.quantity).toBe(600);
  });

  it("filters period flows by plant while current stock remains a current snapshot", () => {
    const day=buildInventoryAnalytics({productions,movements,period:resolveDashboardPeriod("day","2026-08-11"),plantId:"tamesis"});
    expect(day.inflowByUnit).toEqual([{unit:"kg",quantity:250},{unit:"L",quantity:600}]);
    expect(day.outflowByUnit).toEqual([{unit:"kg",quantity:60}]);
    expect(day.currentStockByUnit).toEqual([{unit:"kg",quantity:240},{unit:"L",quantity:600}]);
    expect(day.currentLotCount).toBe(3);

    const otherDay=buildInventoryAnalytics({productions,movements,period:resolveDashboardPeriod("day","2026-08-10"),plantId:"tamesis"});
    expect(otherDay.productionByUnit).toEqual([]);
    expect(otherDay.currentStockByUnit).toEqual(day.currentStockByUnit);
  });

  it("filters current stock by plant without changing unit semantics", () => {
    const result=buildInventoryAnalytics({productions,movements,period:resolveDashboardPeriod("history","2026-08-11",["2026-08-01","2026-08-11"]),plantId:"yarumal"});
    expect(result.productionByUnit).toEqual([{unit:"kg",quantity:100}]);
    expect(result.currentStockByUnit).toEqual([]);
  });
});
