import { describe, expect, it } from "vitest";
import { resolveDashboardPeriod } from "./analytics";
import { buildCommercialAnalytics } from "./commercial-analytics";
import type { SaleRecord } from "./commercial-domain";

const sales: SaleRecord[] = [
  { id:"s1",plantId:"tamesis",plant:"Támesis",customerId:"c1",customerName:"Cliente Uno",productId:"solid",productName:"Wondergreen sólido",unit:"kg",lotCode:"TAM-1",quantity:60,unitPriceCop:2000,totalCop:120000,soldAt:"2026-08-11T10:00:00-05:00",inventoryMovementId:"m1" },
  { id:"s2",plantId:"tamesis",plant:"Támesis",customerId:"c2",customerName:"Cliente Dos",productId:"liquid",productName:"Wondergreen líquido",unit:"L",lotCode:"TAM-2",quantity:40,unitPriceCop:3100,totalCop:124000,soldAt:"2026-08-11T11:00:00-05:00",inventoryMovementId:"m2" },
  { id:"s3",plantId:"tamesis",plant:"Támesis",customerId:"c1",customerName:"Cliente Uno",productId:"solid",productName:"Wondergreen sólido",unit:"kg",lotCode:"TAM-3",quantity:20,unitPriceCop:2200,totalCop:44000,soldAt:"2026-08-10T12:00:00-05:00",inventoryMovementId:"m3" },
  { id:"s4",plantId:"yarumal",plant:"Yarumal",customerId:"c3",customerName:"Cliente Tres",productId:"solid",productName:"Wondergreen sólido",unit:"kg",lotCode:"YAR-1",quantity:100,unitPriceCop:1800,totalCop:180000,soldAt:"2026-08-11T13:00:00-05:00",inventoryMovementId:"m4" },
];

describe("commercial analytics", () => {
  it("derives gross billing and average ticket for the selected period", () => {
    const result=buildCommercialAnalytics({sales,period:resolveDashboardPeriod("day","2026-08-11"),plantId:"all"});
    expect(result.salesCount).toBe(3);
    expect(result.grossBillingCop).toBe(424000);
    expect(result.averageTicketCop).toBeCloseTo(141333.333,2);
  });

  it("keeps sold physical quantities separated by unit", () => {
    const result=buildCommercialAnalytics({sales,period:resolveDashboardPeriod("day","2026-08-11"),plantId:"all"});
    expect(result.soldByUnit).toEqual([{unit:"kg",quantity:160},{unit:"L",quantity:40}]);
  });

  it("filters by plant without changing commercial metric semantics", () => {
    const result=buildCommercialAnalytics({sales,period:resolveDashboardPeriod("day","2026-08-11"),plantId:"tamesis"});
    expect(result.salesCount).toBe(2);
    expect(result.grossBillingCop).toBe(244000);
    expect(result.soldByUnit).toEqual([{unit:"kg",quantity:60},{unit:"L",quantity:40}]);
    expect(result.customers.map((item)=>item.label)).toEqual(["Cliente Dos","Cliente Uno"]);
  });

  it("ranks customers and products by gross billing while retaining unit quantities", () => {
    const result=buildCommercialAnalytics({sales,period:resolveDashboardPeriod("history","2026-08-11",["2026-08-10","2026-08-11"]),plantId:"tamesis"});
    expect(result.customers[0].label).toBe("Cliente Uno");
    expect(result.customers[0].grossCop).toBe(164000);
    expect(result.customers[0].quantities).toEqual([{unit:"kg",quantity:80}]);
    expect(result.products.find((item)=>item.productId==="solid")?.grossCop).toBe(164000);
  });
});
