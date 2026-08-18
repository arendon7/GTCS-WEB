import { describe, expect, it } from "vitest";
import { resolveDashboardPeriod } from "./analytics";
import { buildInventoryAnalytics, buildInventoryCriticality } from "./inventory-analytics";
import type { CurrentInventoryStockThreshold, InventoryMovement, ProductMaster, ProductionRecord } from "./inventory-domain";

const products: ProductMaster[] = [
  {id:"solid",name:"Wondergreen sólido",unit:"kg",active:true,createdAt:"2026-08-01T00:00:00-05:00"},
  {id:"liquid",name:"Wondergreen líquido",unit:"L",active:true,createdAt:"2026-08-01T00:00:00-05:00"},
];

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

function threshold(input: Partial<CurrentInventoryStockThreshold> & Pick<CurrentInventoryStockThreshold,"plantId"|"plant"|"productId"|"productName"|"unit"|"configured">):CurrentInventoryStockThreshold {
  return {id:`thr-${input.plantId}-${input.productId}`,revisionNo:1,note:"Criterio QA",effectiveAt:"2026-08-11T00:00:00-05:00",createdAt:"2026-08-11T00:00:00-05:00",...input};
}

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

  it("classifies critical and healthy stock only against configured thresholds", () => {
    const thresholds:CurrentInventoryStockThreshold[]=[
      threshold({plantId:"tamesis",plant:"Támesis",productId:"solid",productName:"Wondergreen sólido",unit:"kg",configured:true,minimumQuantity:300}),
      threshold({plantId:"tamesis",plant:"Támesis",productId:"liquid",productName:"Wondergreen líquido",unit:"L",configured:true,minimumQuantity:500}),
    ];
    const result=buildInventoryCriticality({products,movements,thresholds,plantId:"tamesis"});
    expect(result.find((row)=>row.productId==="solid")).toMatchObject({stockQuantity:240,minimumQuantity:300,status:"critical"});
    expect(result.find((row)=>row.productId==="liquid")).toMatchObject({stockQuantity:600,minimumQuantity:500,status:"ok"});
  });

  it("keeps missing or explicitly cleared thresholds as unconfigured instead of healthy", () => {
    const thresholds:CurrentInventoryStockThreshold[]=[
      threshold({plantId:"tamesis",plant:"Támesis",productId:"solid",productName:"Wondergreen sólido",unit:"kg",configured:false}),
    ];
    const result=buildInventoryCriticality({products,movements,thresholds,plantId:"tamesis"});
    expect(result.find((row)=>row.productId==="solid")).toMatchObject({stockQuantity:240,status:"unconfigured"});
    expect(result.find((row)=>row.productId==="liquid")).toMatchObject({stockQuantity:600,status:"unconfigured"});
  });

  it("can classify zero stock as critical when a governed threshold exists even before any movement", () => {
    const thresholds:CurrentInventoryStockThreshold[]=[
      threshold({plantId:"yarumal",plant:"Yarumal",productId:"solid",productName:"Wondergreen sólido",unit:"kg",configured:true,minimumQuantity:100}),
    ];
    const result=buildInventoryCriticality({products,movements,thresholds,plantId:"yarumal"});
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({plantId:"yarumal",productId:"solid",stockQuantity:0,minimumQuantity:100,status:"critical"});
  });
});
