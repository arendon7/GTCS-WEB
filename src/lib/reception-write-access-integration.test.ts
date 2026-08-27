import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";

const formSource=readFileSync("src/components/reception-form.tsx","utf8");
const viewSource=readFileSync("src/components/receptions-view.tsx","utf8");

describe("reception visible authorization integration",()=>{
  it("uses the canonical operational write-plant options instead of every visible membership",()=>{
    expect(formSource).toContain("operationalWritePlantOptions");
    expect(formSource).not.toContain("access.map((item)=>({id:item.plantId,name:item.name}))");
  });

  it("gates the new-reception entry point with canonical operational write access",()=>{
    expect(viewSource).toContain("hasOperationalWriteAccess");
    expect(viewSource).toContain("Modo solo lectura");
  });
});
