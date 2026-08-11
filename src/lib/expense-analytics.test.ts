import { describe,expect,it } from "vitest";
import { resolveDashboardPeriod } from "./analytics";
import { buildExpenseAnalytics } from "./expense-analytics";
import type { OperationalExpenseRecord } from "./expense-domain";

const records:OperationalExpenseRecord[]=[
  {id:"e1",plantId:"tamesis",plant:"Támesis",recordType:"purchase",supplierId:"s1",supplierName:"Ferretería Uno",category:"maintenance",concept:"Rodamiento",amountCop:185000,documentDate:"2026-08-11",recordedAt:"2026-08-12T10:00:00-05:00"},
  {id:"e2",plantId:"tamesis",plant:"Támesis",recordType:"expense",supplierId:"s2",supplierName:"Transportes Uno",category:"transport",concept:"Flete",amountCop:65000,documentDate:"2026-08-11",recordedAt:"2026-08-11T11:00:00-05:00"},
  {id:"e3",plantId:"yarumal",plant:"Yarumal",recordType:"purchase",supplierId:"s1",supplierName:"Ferretería Uno",category:"maintenance",concept:"Banda",amountCop:250000,documentDate:"2026-08-11",recordedAt:"2026-08-11T12:00:00-05:00"},
  {id:"e4",plantId:"tamesis",plant:"Támesis",recordType:"expense",supplierId:"s1",supplierName:"Ferretería Uno",category:"services",concept:"Servicio técnico",amountCop:100000,documentDate:"2026-08-10",recordedAt:"2026-08-11T13:00:00-05:00"},
];

describe("expense analytics",()=>{
  it("uses document date instead of audit recordedAt for period",()=>{
    const result=buildExpenseAnalytics({records,period:resolveDashboardPeriod("day","2026-08-11"),plantId:"all"});
    expect(result.recordsCount).toBe(3);
    expect(result.totalRegisteredCop).toBe(500000);
    expect(result.averageRecordCop).toBeCloseTo(166666.667,2);
  });

  it("filters by plant and separates purchase from expense",()=>{
    const result=buildExpenseAnalytics({records,period:resolveDashboardPeriod("day","2026-08-11"),plantId:"tamesis"});
    expect(result.totalRegisteredCop).toBe(250000);
    expect(result.byRecordType).toEqual([
      {recordType:"purchase",label:"Compra",amountCop:185000,recordsCount:1},
      {recordType:"expense",label:"Gasto",amountCop:65000,recordsCount:1},
    ]);
  });

  it("ranks categories and suppliers by registered amount",()=>{
    const result=buildExpenseAnalytics({records,period:resolveDashboardPeriod("history","2026-08-11",["2026-08-10","2026-08-11"]),plantId:"tamesis"});
    expect(result.categories.map((item)=>item.label)).toEqual(["Repuesto / mantenimiento","Servicios","Transporte / logística"]);
    expect(result.suppliers[0]).toMatchObject({id:"s1",label:"Ferretería Uno",amountCop:285000,recordsCount:2});
  });
});
