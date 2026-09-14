import type { ExpenseCategory } from "@/lib/expense-domain";

export type PurchaseRequestStatus="submitted"|"approved"|"rejected"|"fulfilled";
export type PurchaseRequestEventKind="submitted"|"approved"|"rejected"|"fulfilled";

export const purchaseRequestStatusLabel:Record<PurchaseRequestStatus,string>={
  submitted:"Pendiente",
  approved:"Aprobada",
  rejected:"Rechazada",
  fulfilled:"Comprada / registrada",
};

export type PurchaseRequestRecord={
  id:string;
  plantId:string;
  plant:string;
  requestedBy:string;
  requestedAt:string;
  neededBy?:string;
  category:ExpenseCategory;
  concept:string;
  justification:string;
  estimatedAmountCop:number;
  suggestedSupplier?:string;
  equipmentId?:string;
  equipmentName?:string;
  processRef?:string;
  evidenceRef?:string;
  status:PurchaseRequestStatus;
  expenseId?:string;
};

export type PurchaseRequestEvent={
  id:string;
  requestId:string;
  kind:PurchaseRequestEventKind;
  actor:string;
  at:string;
  note?:string;
  expenseId?:string;
  actualAmountCop?:number;
};

export type NewPurchaseRequest={
  plantId:string;
  requestedBy:string;
  neededBy?:string;
  category:ExpenseCategory;
  concept:string;
  justification:string;
  estimatedAmountCop:number;
  suggestedSupplier?:string;
  equipmentId?:string;
  equipmentName?:string;
  processRef?:string;
  evidenceRef?:string;
};

export function validatePurchaseRequest(input:NewPurchaseRequest){
  if(!input.plantId.trim())return {ok:false as const,error:"Selecciona la planta."};
  if(!input.requestedBy.trim())return {ok:false as const,error:"Indica quién solicita."};
  if(!input.concept.trim())return {ok:false as const,error:"Describe qué se necesita comprar."};
  if(!input.justification.trim())return {ok:false as const,error:"Indica la justificación operacional."};
  if(!Number.isFinite(input.estimatedAmountCop)||input.estimatedAmountCop<=0)return {ok:false as const,error:"El monto estimado debe ser mayor que cero."};
  if(input.neededBy&&!/^\d{4}-\d{2}-\d{2}$/.test(input.neededBy))return {ok:false as const,error:"La fecha requerida no es válida."};
  return {ok:true as const};
}

export function canTransitionPurchaseRequest(from:PurchaseRequestStatus,to:PurchaseRequestStatus){
  return (from==="submitted"&&(to==="approved"||to==="rejected"))||(from==="approved"&&to==="fulfilled");
}

export function validateTransition(input:{from:PurchaseRequestStatus;to:PurchaseRequestStatus;actor:string;note?:string}){
  if(!canTransitionPurchaseRequest(input.from,input.to))return {ok:false as const,error:`Transición no permitida: ${input.from} → ${input.to}.`};
  if(!input.actor.trim())return {ok:false as const,error:"Indica el responsable de la decisión."};
  if(input.to==="rejected"&&!input.note?.trim())return {ok:false as const,error:"Indica la razón del rechazo."};
  return {ok:true as const};
}
