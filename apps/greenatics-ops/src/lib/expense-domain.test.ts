import { describe,expect,it } from "vitest";
import { normalizeSupplierKey, supplierIdFromKey, totalRegisteredExpenseCop, validateOperationalExpense, type OperationalExpenseRecord } from "./expense-domain";

const base={plantId:"tamesis",recordType:"purchase" as const,supplierName:"Ferretería Industrial S.A.S.",category:"maintenance" as const,concept:"Rodamiento molino",amountCop:185000,documentDate:"2026-08-11"};

describe("expense domain",()=>{
  it("normalizes equivalent supplier names deterministically",()=>{
    expect(normalizeSupplierKey("  Ferretería   Industrial S.A.S. ")).toBe("ferreteria industrial sas");
    expect(normalizeSupplierKey("FERRETERIA INDUSTRIAL SAS")).toBe("ferreteria industrial sas");
    expect(supplierIdFromKey(normalizeSupplierKey("Ferretería Industrial S.A.S."))).toBe("supplier-ferreteria-industrial-sas");
  });

  it("validates canonical operational expense input",()=>{
    expect(validateOperationalExpense(base)).toEqual({ok:true});
    expect(validateOperationalExpense({...base,amountCop:0})).toEqual({ok:false,error:"El monto COP debe ser mayor que cero."});
    expect(validateOperationalExpense({...base,documentDate:"2026-02-31"})).toEqual({ok:false,error:"Indica una fecha de documento válida."});
    expect(validateOperationalExpense({...base,concept:"  "})).toEqual({ok:false,error:"Describe el concepto de la compra o gasto."});
  });

  it("totals only recorded COP amounts without inferring payment",()=>{
    const records=[
      {...base,id:"e1",plant:"Támesis",supplierId:"s1",supplierName:"Proveedor Uno",recordedAt:"2026-08-11T10:00:00-05:00"},
      {...base,id:"e2",plant:"Támesis",supplierId:"s2",supplierName:"Proveedor Dos",amountCop:15000,recordedAt:"2026-08-11T11:00:00-05:00"},
    ] satisfies OperationalExpenseRecord[];
    expect(totalRegisteredExpenseCop(records)).toBe(200000);
  });
});
