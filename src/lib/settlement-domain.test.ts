import { describe,expect,it } from "vitest";
import { remainingAmount,settledAmount,settlementStatus,validateSettlement,type SettlementRecord } from "./settlement-domain";

const rows:SettlementRecord[]=[
  {id:"r1",kind:"collection",sourceType:"sale",sourceId:"s1",plantId:"tamesis",plant:"Támesis",counterparty:"Cliente",amountCop:50000,occurredOn:"2026-08-11",method:"transfer",recordedAt:"2026-08-11T10:00:00-05:00"},
  {id:"r2",kind:"collection",sourceType:"sale",sourceId:"s1",plantId:"tamesis",plant:"Támesis",counterparty:"Cliente",amountCop:70000,occurredOn:"2026-08-12",method:"cash",recordedAt:"2026-08-12T10:00:00-05:00"},
  {id:"r3",kind:"payment",sourceType:"expense",sourceId:"e1",plantId:"tamesis",plant:"Támesis",counterparty:"Proveedor",amountCop:100000,occurredOn:"2026-08-11",method:"transfer",recordedAt:"2026-08-11T11:00:00-05:00"},
];

describe("settlement domain",()=>{
  it("derives partial and fully settled balances without mutating source totals",()=>{
    expect(settledAmount(rows,"collection","s1")).toBe(120000);
    expect(remainingAmount(120000,50000)).toBe(70000);
    expect(settlementStatus(120000,0)).toBe("pending");
    expect(settlementStatus(120000,50000)).toBe("partial");
    expect(settlementStatus(120000,120000)).toBe("settled");
  });

  it("blocks collection or payment beyond remaining source balance",()=>{
    expect(validateSettlement({amountCop:70000,remainingCop:70000,occurredOn:"2026-08-11"})).toEqual({ok:true});
    expect(validateSettlement({amountCop:70001,remainingCop:70000,occurredOn:"2026-08-11"})).toEqual({ok:false,error:"El monto excede el saldo pendiente de $70.000."});
    expect(validateSettlement({amountCop:1,remainingCop:0,occurredOn:"2026-08-11"})).toEqual({ok:false,error:"La fuente ya está saldada."});
  });
});
