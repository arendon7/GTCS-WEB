import { describe,expect,it } from "vitest";
import { normalizeSupplierKey,supplierIdFromKey } from "./expense-domain";

describe("expense supplier identity",()=>{
  it("maps punctuation and accent variants to one stable supplier identity",()=>{
    const variants=["Ferretería Industrial S.A.S.","FERRETERIA INDUSTRIAL SAS"," Ferretería  Industrial  SAS "];
    const ids=variants.map((value)=>supplierIdFromKey(normalizeSupplierKey(value)));
    expect(new Set(ids).size).toBe(1);
    expect(ids[0]).toBe("supplier-ferreteria-industrial-sas");
  });
});
