import { describe,expect,it } from "vitest";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { canWriteOperationalRecord,hasOperationalWriteAccess,operationalWritePlantOptions } from "@/lib/ops-write-access";

function membership(plantId:string,role:PlantAccess["role"],name=plantId):PlantAccess{
  return {dbId:`db-${plantId}`,plantId,code:plantId.toUpperCase(),name,role};
}

describe("canonical operational write-plant capability",()=>{
  it.each(["operator","supervisor","technical","admin","director"] as const)("allows %s in the matching plant",(role)=>{
    expect(canWriteOperationalRecord([membership("tamesis",role)],"tamesis")).toBe(true);
  });

  it("keeps maintenance read-only for these governed transactions",()=>{
    expect(canWriteOperationalRecord([membership("tamesis","maintenance")],"tamesis")).toBe(false);
  });

  it("does not inherit a writable role from another plant",()=>{
    const access=[membership("yarumal","director"),membership("tamesis","maintenance")];
    expect(canWriteOperationalRecord(access,"tamesis")).toBe(false);
    expect(canWriteOperationalRecord(access,"yarumal")).toBe(true);
  });

  it("returns only writable remote plant options",()=>{
    const access=[
      membership("tamesis","maintenance","Támesis"),
      membership("yarumal","technical","Yarumal"),
    ];
    expect(operationalWritePlantOptions(true,access)).toEqual([{id:"yarumal",name:"Yarumal"}]);
  });

  it("never invents remote pilot plants when there is no writable membership",()=>{
    const access=[membership("tamesis","maintenance","Támesis")];
    expect(operationalWritePlantOptions(true,access)).toEqual([]);
    expect(hasOperationalWriteAccess(true,access)).toBe(false);
  });

  it("preserves both pilot plants in local/demo mode",()=>{
    expect(operationalWritePlantOptions(false,[])).toEqual([
      {id:"tamesis",name:"Támesis"},
      {id:"yarumal",name:"Yarumal"},
    ]);
    expect(hasOperationalWriteAccess(false,[])).toBe(true);
  });
});
