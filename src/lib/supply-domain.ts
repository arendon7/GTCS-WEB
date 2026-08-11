import type { InventoryUnit } from "@/lib/inventory-domain";

export type SupplyCategory="raw_material"|"input"|"spare_part"|"packaging"|"consumable"|"other";
export type SupplyMovementKind="receipt"|"consumption"|"adjustment_in"|"adjustment_out";

export const supplyCategoryLabel:Record<SupplyCategory,string>={
  raw_material:"Materia prima",
  input:"Insumo",
  spare_part:"Repuesto",
  packaging:"Empaque",
  consumable:"Consumible",
  other:"Otro",
};

export type SupplyMaster={
  id:string;
  name:string;
  normalizedKey:string;
  category:SupplyCategory;
  unit:InventoryUnit;
  active:boolean;
  createdAt:string;
};

export type SupplyReceipt={
  id:string;
  plantId:string;
  plant:string;
  supplyId:string;
  supplyName:string;
  category:SupplyCategory;
  unit:InventoryUnit;
  quantity:number;
  lotCode:string;
  receivedOn:string;
  supplierName?:string;
  expenseId?:string;
  documentRef?:string;
  evidenceRef?:string;
  note?:string;
  recordedAt:string;
};

export type SupplyMovement={
  id:string;
  plantId:string;
  plant:string;
  supplyId:string;
  supplyName:string;
  category:SupplyCategory;
  unit:InventoryUnit;
  lotCode:string;
  kind:SupplyMovementKind;
  quantity:number;
  occurredOn:string;
  referenceId?:string;
  destination?:string;
  equipmentId?:string;
  processRef?:string;
  note?:string;
  recordedAt:string;
};

export type SupplyLotStock={plantId:string;plant:string;supplyId:string;supplyName:string;category:SupplyCategory;unit:InventoryUnit;lotCode:string;quantity:number};

export function normalizeSupplyKey(value:string){return value.trim().replace(/\s+/g," ").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es-CO").replace(/[^a-z0-9 ]+/g,"").trim();}
export function supplyIdFromKey(key:string){return `supply-${key.replace(/\s+/g,"-")||"sin-nombre"}`;}
export function signedSupplyQuantity(movement:Pick<SupplyMovement,"kind"|"quantity">){return movement.kind==="consumption"||movement.kind==="adjustment_out"?-movement.quantity:movement.quantity;}
export function supplyStockForLot(movements:SupplyMovement[],plantId:string,supplyId:string,lotCode:string){return movements.filter((item)=>item.plantId===plantId&&item.supplyId===supplyId&&item.lotCode===lotCode).reduce((sum,item)=>sum+signedSupplyQuantity(item),0);}
export function supplyLotStocks(movements:SupplyMovement[]):SupplyLotStock[]{
  const map=new Map<string,SupplyLotStock>();
  for(const movement of movements){const key=`${movement.plantId}|${movement.supplyId}|${movement.lotCode}`;const current=map.get(key)??{plantId:movement.plantId,plant:movement.plant,supplyId:movement.supplyId,supplyName:movement.supplyName,category:movement.category,unit:movement.unit,lotCode:movement.lotCode,quantity:0};current.quantity+=signedSupplyQuantity(movement);map.set(key,current);}
  return [...map.values()].filter((row)=>Math.abs(row.quantity)>1e-9).sort((a,b)=>a.supplyName.localeCompare(b.supplyName,"es")||a.lotCode.localeCompare(b.lotCode,"es"));
}
export function aggregateSupplyStocks(movements:SupplyMovement[]){
  const map=new Map<string,{plantId:string;plant:string;supplyId:string;supplyName:string;category:SupplyCategory;unit:InventoryUnit;quantity:number;lots:number}>();
  for(const lot of supplyLotStocks(movements)){const key=`${lot.plantId}|${lot.supplyId}`;const current=map.get(key)??{plantId:lot.plantId,plant:lot.plant,supplyId:lot.supplyId,supplyName:lot.supplyName,category:lot.category,unit:lot.unit,quantity:0,lots:0};current.quantity+=lot.quantity;current.lots+=1;map.set(key,current);}
  return [...map.values()].filter((row)=>Math.abs(row.quantity)>1e-9).sort((a,b)=>a.supplyName.localeCompare(b.supplyName,"es"));
}

export function isIsoCalendarDate(value:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const [year,month,day]=value.split("-").map(Number);
  const parsed=new Date(Date.UTC(year,month-1,day));
  return parsed.getUTCFullYear()===year&&parsed.getUTCMonth()===month-1&&parsed.getUTCDate()===day;
}

export function validateSupplyReceipt(input:{name:string;quantity:number;receivedOn:string}){
  if(!normalizeSupplyKey(input.name))return {ok:false as const,error:"Indica el insumo recibido."};
  if(!Number.isFinite(input.quantity)||input.quantity<=0)return {ok:false as const,error:"La cantidad recibida debe ser mayor que cero."};
  if(!isIsoCalendarDate(input.receivedOn))return {ok:false as const,error:"Indica una fecha de recepción válida."};
  return {ok:true as const};
}

export function validateSupplyConsumption(input:{quantity:number;occurredOn:string;destination:string}){
  if(!Number.isFinite(input.quantity)||input.quantity<=0)return {ok:false as const,error:"La cantidad consumida debe ser mayor que cero."};
  if(!isIsoCalendarDate(input.occurredOn))return {ok:false as const,error:"Indica una fecha de consumo válida."};
  if(!input.destination.trim())return {ok:false as const,error:"Indica el destino o uso del consumo."};
  return {ok:true as const};
}
