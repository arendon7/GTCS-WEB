import { describe,expect,it } from "vitest";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { canRecordSettlement } from "@/lib/settlement-domain";

function membership(plantId:string,role:PlantAccess["role"]):PlantAccess{
  return {
    dbId:`db-${plantId}`,
    plantId,
    code:plantId.toUpperCase(),
    name:plantId,
    role,
  };
}

describe("cash visible authorization",()=>{
  it.each(["supervisor","admin","director"] as const)("allows %s in the source plant",(role)=>{
    expect(canRecordSettlement([membership("tamesis",role)],"tamesis")).toBe(true);
  });

  it.each(["operator","technical","maintenance"] as const)("hides cash write controls from %s",(role)=>{
    expect(canRecordSettlement([membership("tamesis",role)],"tamesis")).toBe(false);
  });

  it("does not inherit authorization from another plant",()=>{
    expect(canRecordSettlement([
      membership("yarumal","director"),
      membership("tamesis","operator"),
    ],"tamesis")).toBe(false);
  });

  it("allows the same user where the matching plant membership is authorized",()=>{
    expect(canRecordSettlement([
      membership("yarumal","director"),
      membership("tamesis","operator"),
    ],"yarumal")).toBe(true);
  });

  it("rejects an unknown plant",()=>{
    expect(canRecordSettlement([membership("tamesis","director")],"fredonia")).toBe(false);
  });
});
