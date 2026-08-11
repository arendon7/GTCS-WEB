import { describe,expect,it } from "vitest";
import { resolveDashboardPeriod } from "./analytics";
import { buildSettlementAnalytics } from "./settlement-analytics";
import type { SettlementRecord } from "./settlement-domain";

const rows:SettlementRecord[]=[
  {id:"c1",kind:"collection",sourceType:"sale",sourceId:"s1",plantId:"tamesis",plant:"Támesis",counterparty:"Cliente",amountCop:50000,occurredOn:"2026-08-11",method:"transfer",recordedAt:"2026-08-11T10:00:00-05:00"},
  {id:"p1",kind:"payment",sourceType:"expense",sourceId:"e1",plantId:"tamesis",plant:"Támesis",counterparty:"Proveedor",amountCop:100000,occurredOn:"2026-08-11",method:"transfer",recordedAt:"2026-08-11T11:00:00-05:00"},
  {id:"c2",kind:"collection",sourceType:"sale",sourceId:"s2",plantId:"yarumal",plant:"Yarumal",counterparty:"Cliente Y",amountCop:70000,occurredOn:"2026-08-11",method:"cash",recordedAt:"2026-08-11T12:00:00-05:00"},
  {id:"c3",kind:"collection",sourceType:"sale",sourceId:"s3",plantId:"tamesis",plant:"Támesis",counterparty:"Cliente viejo",amountCop:20000,occurredOn:"2026-08-10",method:"card",recordedAt:"2026-08-11T12:00:00-05:00"},
];

describe("settlement analytics",()=>{
  it("uses effective movement date and derives observed cash flow",()=>{
    const result=buildSettlementAnalytics({records:rows,period:resolveDashboardPeriod("day","2026-08-11"),plantId:"all"});
    expect(result.collectedCop).toBe(120000);
    expect(result.paidCop).toBe(100000);
    expect(result.netRegisteredCashFlowCop).toBe(20000);
    expect(result.recordsCount).toBe(3);
  });
  it("filters both inflows and outflows by plant",()=>{
    const result=buildSettlementAnalytics({records:rows,period:resolveDashboardPeriod("day","2026-08-11"),plantId:"tamesis"});
    expect(result.collectedCop).toBe(50000);
    expect(result.paidCop).toBe(100000);
    expect(result.netRegisteredCashFlowCop).toBe(-50000);
  });
});
