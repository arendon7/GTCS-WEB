import type { PlantAccess } from "@/lib/ops-data-contract";

export type SettlementKind="collection"|"payment";
export type SettlementMethod="transfer"|"cash"|"card"|"other";
export type SettlementSourceType="sale"|"expense";
export type SettlementStatus="pending"|"partial"|"settled";

export const settlementMethodLabel:Record<SettlementMethod,string>={transfer:"Transferencia",cash:"Efectivo",card:"Tarjeta",other:"Otro"};
export const settlementStatusLabel:Record<SettlementStatus,string>={pending:"Pendiente",partial:"Parcial",settled:"Saldado"};

const settlementManagerRoles=new Set<PlantAccess["role"]>(["supervisor","admin","director"]);

export type SettlementRecord={
  id:string;
  kind:SettlementKind;
  sourceType:SettlementSourceType;
  sourceId:string;
  plantId:string;
  plant:string;
  counterparty:string;
  amountCop:number;
  occurredOn:string;
  method:SettlementMethod;
  reference?:string;
  note?:string;
  recordedAt:string;
};

export function canRecordSettlement(access:PlantAccess[],plantId:string){
  const membership=access.find((item)=>item.plantId===plantId);
  return Boolean(membership&&settlementManagerRoles.has(membership.role));
}

export function settledAmount(records:SettlementRecord[],kind:SettlementKind,sourceId:string){
  return records.filter((item)=>item.kind===kind&&item.sourceId===sourceId).reduce((sum,item)=>sum+item.amountCop,0);
}

export function remainingAmount(totalCop:number,settledCop:number){return Math.max(0,totalCop-settledCop);}

export function settlementStatus(totalCop:number,settledCop:number):SettlementStatus{
  if(settledCop<=1e-9)return "pending";
  if(settledCop+1e-9>=totalCop)return "settled";
  return "partial";
}

export function validateSettlement(input:{amountCop:number;remainingCop:number;occurredOn:string}){
  if(!Number.isFinite(input.amountCop)||input.amountCop<=0)return {ok:false as const,error:"El monto debe ser mayor que cero."};
  if(!/^\d{4}-\d{2}-\d{2}$/.test(input.occurredOn))return {ok:false as const,error:"Indica una fecha efectiva válida."};
  if(input.remainingCop<=1e-9)return {ok:false as const,error:"La fuente ya está saldada."};
  if(input.amountCop>input.remainingCop+1e-9)return {ok:false as const,error:`El monto excede el saldo pendiente de $${Math.round(input.remainingCop).toLocaleString("es-CO")}.`};
  return {ok:true as const};
}
