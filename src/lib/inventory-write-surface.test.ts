import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";

function source(path:string){return readFileSync(path,"utf8");}

describe("inventory visible write access",()=>{
  it("derives production and dispatch plant options from the canonical operational writer contract",()=>{
    for(const path of ["src/components/production-form.tsx","src/components/dispatch-form.tsx"]){
      const text=source(path);
      expect(text).toContain("operationalWritePlantOptions");
      expect(text).not.toContain("access.map((plant)=>({id:plant.plantId,name:plant.name}))");
    }
  });

  it("gates production and inventory creation entry points with the canonical operational writer contract",()=>{
    const production=source("src/components/production-view.tsx");
    const inventory=source("src/components/inventory-view.tsx");
    expect(production).toContain("hasOperationalWriteAccess");
    expect(inventory).toContain("hasOperationalWriteAccess");
    expect(production).toContain("Modo solo lectura");
    expect(inventory).toContain("Modo solo lectura");
  });
});
