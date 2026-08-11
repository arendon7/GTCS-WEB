import { describe, expect, it } from "vitest";
import { customerIdFromKey, grossBillingCop, normalizeCustomerKey, saleTotalCop, soldQuantityByUnit, type SaleRecord } from "./commercial-domain";

const sales: SaleRecord[] = [
  { id:"s1",plantId:"tamesis",plant:"Támesis",customerId:"c1",customerName:"Cliente Uno",productId:"solid",productName:"Wondergreen sólido",unit:"kg",lotCode:"L1",quantity:60,unitPriceCop:2000,totalCop:120000,soldAt:"2026-08-11T10:00:00-05:00",inventoryMovementId:"m1" },
  { id:"s2",plantId:"tamesis",plant:"Támesis",customerId:"c2",customerName:"Cliente Dos",productId:"liquid",productName:"Wondergreen líquido",unit:"L",lotCode:"L2",quantity:40,unitPriceCop:3100,totalCop:124000,soldAt:"2026-08-11T11:00:00-05:00",inventoryMovementId:"m2" },
  { id:"s3",plantId:"tamesis",plant:"Támesis",customerId:"c1",customerName:"Cliente Uno",productId:"solid",productName:"Wondergreen sólido",unit:"kg",lotCode:"L3",quantity:20,unitPriceCop:2200,totalCop:44000,soldAt:"2026-08-11T12:00:00-05:00",inventoryMovementId:"m3" },
];

describe("commercial domain", () => {
  it("normalizes equivalent customer names without losing display name", () => {
    expect(normalizeCustomerKey("  Café   José S.A.S. ")).toBe("cafe jose sas");
    expect(normalizeCustomerKey("CAFE JOSE SAS")).toBe("cafe jose sas");
    expect(customerIdFromKey("cafe jose sas")).toBe("customer-cafe-jose-sas");
  });

  it("derives sale total instead of accepting an editable total", () => {
    expect(saleTotalCop(60,2000)).toBe(120000);
    expect(saleTotalCop(0,2000)).toBe(0);
  });

  it("sums gross billing in COP but keeps sold quantities separated by unit", () => {
    expect(grossBillingCop(sales)).toBe(288000);
    expect(soldQuantityByUnit(sales)).toEqual([{unit:"kg",quantity:80},{unit:"L",quantity:40}]);
  });
});
