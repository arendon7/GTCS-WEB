import type { PlantAccess } from "@/lib/ops-data-contract";

const repairManagerRoles=new Set<PlantAccess["role"]>(["maintenance","supervisor","technical","admin","director"]);

export function canManageEquipmentRepair(access:PlantAccess[],plantId:string){
  return access.some((membership)=>membership.plantId===plantId&&repairManagerRoles.has(membership.role));
}
