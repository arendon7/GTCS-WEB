import { describe,expect,it } from "vitest";
import { aggregateSupplyStocks,isIsoCalendarDate,normalizeSupplyKey,supplyIdFromKey,supplyLotStocks,supplyStockForLot,validateSupplyConsumption,validateSupplyReceipt,type SupplyMovement } from "./supply-domain";

const movements:SupplyMovement[]=[
  {id:"m1",plantId:"tamesis",plant:"Támesis",supplyId:"s1",supplyName:"Melaza",category:"input",unit:"kg",lotCode:"TAM-SUP-1",kind:"receipt",quantity:100,occurredOn:"2026-08-11",recordedAt:"2026-08-11T10:00:00-05:00"},
  {id:"m2",plantId:"tamesis",plant:"Támesis",supplyId:"s1",supplyName:"Melaza",category:"input",unit:"kg",lotCode:"TAM-SUP-1",kind:"consumption",quantity:30,occurredOn:"2026-08-11",recordedAt:"2026-08-11T11:00:00-05:00"},
  {id:"m3",plantId:"yarumal",plant:"Yarumal",supplyId:"s2",supplyName:"Envase 1 L",category:"packaging",unit:"unidades",lotCode:"YAR-SUP-1",kind:"receipt",quantity:50,occurredOn:"2026-08-11",recordedAt:"2026-08-11T12:00:00-05:00"},
];

describe("supply inventory",()=>{
  it("normalizes physical supply masters deterministically",()=>{
    expect(normalizeSupplyKey("  Ácido   Húmico  ")).toBe("acido humico");
    expect(supplyIdFromKey(normalizeSupplyKey("Ácido Húmico"))).toBe("supply-acido-humico");
  });
  it("derives stock from append-only movements by lot",()=>{
    expect(supplyStockForLot(movements,"tamesis","s1","TAM-SUP-1")).toBe(70);
    expect(supplyLotStocks(movements)).toHaveLength(2);
    expect(aggregateSupplyStocks(movements).find((x)=>x.supplyId==="s1")?.quantity).toBe(70);
  });
  it("accepts only real calendar dates for physical movements",()=>{
    expect(isIsoCalendarDate("2026-08-11")).toBe(true);
    expect(isIsoCalendarDate("2026-02-29")).toBe(false);
    expect(isIsoCalendarDate("2026-13-01")).toBe(false);
    expect(validateSupplyReceipt({name:"Melaza",quantity:10,receivedOn:"2026-02-29"})).toEqual({ok:false,error:"Indica una fecha de recepción válida."});
    expect(validateSupplyConsumption({quantity:5,occurredOn:"2026-13-01",destination:"Proceso"})).toEqual({ok:false,error:"Indica una fecha de consumo válida."});
  });
});
