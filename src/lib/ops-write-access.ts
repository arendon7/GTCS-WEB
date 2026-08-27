import type { PlantAccess } from "@/lib/ops-data-contract";

export type OperationalWritePlantOption={id:string;name:string};

const operationalWriterRoles=new Set<PlantAccess["role"]>(["operator","supervisor","technical","admin","director"]);
const localPilotPlants:OperationalWritePlantOption[]=[{id:"tamesis",name:"Támesis"},{id:"yarumal",name:"Yarumal"}];

export function canWriteOperationalRecord(access:PlantAccess[],plantId:string){
  return access.some((membership)=>membership.plantId===plantId&&operationalWriterRoles.has(membership.role));
}

export function operationalWritePlantOptions(remoteMode:boolean,access:PlantAccess[]):OperationalWritePlantOption[]{
  if(!remoteMode)return localPilotPlants.map((plant)=>({...plant}));
  const options=new Map<string,OperationalWritePlantOption>();
  for(const membership of access){
    if(operationalWriterRoles.has(membership.role)&&!options.has(membership.plantId))options.set(membership.plantId,{id:membership.plantId,name:membership.name});
  }
  return [...options.values()];
}

export function hasOperationalWriteAccess(remoteMode:boolean,access:PlantAccess[]){
  return !remoteMode||access.some((membership)=>operationalWriterRoles.has(membership.role));
}
