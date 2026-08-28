import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";

function source(path:string){return readFileSync(path,"utf8");}

describe("core physical write surfaces",()=>{
  it.each([
    "src/components/reception-form.tsx",
    "src/components/production-form.tsx",
    "src/components/dispatch-form.tsx",
    "src/components/compost-create-form.tsx",
  ])("%s derives remote plant options from the shared operational write contract",(path)=>{
    const text=source(path);
    expect(text).toContain("operationalWritePlantOptions");
    expect(text).not.toMatch(/access\.map\s*\(/);
  });

  it.each([
    ["src/components/receptions-view.tsx","Nueva recepción"],
    ["src/components/production-view.tsx","Registrar producción"],
    ["src/components/compost-list.tsx","Nueva pila"],
  ])("%s gates its creation CTA with shared operational write access",(path,label)=>{
    const text=source(path);
    expect(text).toContain("hasOperationalWriteAccess");
    expect(text).toContain(label);
  });

  it("inventory gates production and dispatch entry points with shared operational write access",()=>{
    const text=source("src/components/inventory-view.tsx");
    expect(text).toContain("hasOperationalWriteAccess");
    expect(text).toContain("/inventory/dispatch");
    expect(text).toContain("/production/new");
  });

  it("compost detail gates general operational actions per pile plant while preserving the narrower technical-range gate",()=>{
    const text=source("src/components/compost-detail.tsx");
    expect(text).toContain("canWriteOperationalRecord");
    expect(text).toContain("canWritePile");
    expect(text).toContain("canConfigureRange");
  });
});
