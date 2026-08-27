import { describe,expect,it } from "vitest";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { canManageEquipmentRepair } from "@/lib/maintenance-access";

function membership(role:PlantAccess["role"],plantId="tamesis"):PlantAccess{
  return {dbId:`db-${plantId}`,plantId,code:plantId==="tamesis"?"TAM":"YAR",name:plantId==="tamesis"?"Támesis":"Yarumal",role};
}

describe("maintenance visible authorization",()=>{
  it.each(["maintenance","supervisor","technical","admin","director"] as PlantAccess["role"][])("allows %s to manage repair lifecycle in its plant",(role)=>{
    expect(canManageEquipmentRepair([membership(role)],"tamesis")).toBe(true);
  });

  it("keeps operator able to report but unable to start or close a repair",()=>{
    expect(canManageEquipmentRepair([membership("operator")],"tamesis")).toBe(false);
  });

  it("does not inherit repair authorization from another plant",()=>{
    expect(canManageEquipmentRepair([membership("maintenance","yarumal")],"tamesis")).toBe(false);
  });

  it("requires a visible authorized membership",()=>{
    expect(canManageEquipmentRepair([],"tamesis")).toBe(false);
  });
});
