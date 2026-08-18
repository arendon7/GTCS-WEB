import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlantAccess } from "@/lib/ops-data-contract";
import type { NewPurchaseRequest,PurchaseRequestEvent,PurchaseRequestRecord } from "@/lib/purchase-request-domain";
import { createClient } from "@/lib/supabase/client";

type RequestRow={id:string;plant_id:string;requested_by_name:string;requested_at:string;needed_by?:string|null;category:PurchaseRequestRecord["category"];concept:string;justification:string;estimated_amount_cop:number|string;suggested_supplier?:string|null;equipment_id?:string|null;process_ref?:string|null;evidence_ref?:string|null;status:PurchaseRequestRecord["status"];expense_id?:string|null};
type EventRow={id:string;request_id:string;event_kind:PurchaseRequestEvent["kind"];actor_name:string;note?:string|null;expense_id?:string|null;actual_amount_cop?:number|string|null;occurred_at:string};
type EquipmentRow={id:string;name:string};

export type RemoteFulfillmentPayload={requestId:string;actor:string;supplierName:string;actualAmountCop:number;documentDate:string;documentRef?:string;note?:string};
function errorMessage(scope:string,error:{message?:string}|null){return `${scope}: ${error?.message||"error remoto desconocido"}`;}
function remotePlantId(access:PlantAccess[],plantId:string){const plant=access.find((item)=>item.plantId===plantId);if(!plant)throw new Error(`No tienes acceso a la planta ${plantId}.`);return plant.dbId;}
function positiveNumber(value:number|string,scope:string){const parsed=Number(value);if(!Number.isFinite(parsed)||parsed<=0)throw new Error(`${scope} contiene un monto inválido.`);return parsed;}

export async function loadRemotePurchaseRequests(access:PlantAccess[],client:SupabaseClient=createClient()):Promise<{requests:PurchaseRequestRecord[];events:PurchaseRequestEvent[]}>{
  if(!access.length)return {requests:[],events:[]};
  const plantIds=access.map((plant)=>plant.dbId);
  const [requestResult,equipmentResult]=await Promise.all([
    client.from("purchase_requests").select("id,plant_id,requested_by_name,requested_at,needed_by,category,concept,justification,estimated_amount_cop,suggested_supplier,equipment_id,process_ref,evidence_ref,status,expense_id").in("plant_id",plantIds).order("requested_at",{ascending:false}),
    client.from("equipment").select("id,name").in("plant_id",plantIds),
  ]);
  if(requestResult.error)throw new Error(errorMessage("No fue posible cargar solicitudes de compra",requestResult.error));
  if(equipmentResult.error)throw new Error(errorMessage("No fue posible enlazar equipos con solicitudes",equipmentResult.error));
  const requestRows=(requestResult.data??[]) as unknown as RequestRow[];
  const requestIds=requestRows.map((row)=>row.id);
  let eventRows:EventRow[]=[];
  if(requestIds.length){const eventResult=await client.from("purchase_request_events").select("id,request_id,event_kind,actor_name,note,expense_id,actual_amount_cop,occurred_at").in("request_id",requestIds).order("occurred_at",{ascending:false});if(eventResult.error)throw new Error(errorMessage("No fue posible cargar historial de solicitudes",eventResult.error));eventRows=(eventResult.data??[]) as unknown as EventRow[];}
  const plantMap=new Map(access.map((plant)=>[plant.dbId,plant]));const equipmentMap=new Map(((equipmentResult.data??[]) as unknown as EquipmentRow[]).map((row)=>[row.id,row.name]));
  const requests=requestRows.map((row):PurchaseRequestRecord=>{const plant=plantMap.get(row.plant_id);if(!plant)throw new Error(`Solicitud ${row.id} pertenece a una planta no visible.`);return {id:row.id,plantId:plant.plantId,plant:plant.name,requestedBy:row.requested_by_name,requestedAt:row.requested_at,neededBy:row.needed_by||undefined,category:row.category,concept:row.concept,justification:row.justification,estimatedAmountCop:positiveNumber(row.estimated_amount_cop,`Solicitud ${row.id}`),suggestedSupplier:row.suggested_supplier||undefined,equipmentId:row.equipment_id||undefined,equipmentName:row.equipment_id?equipmentMap.get(row.equipment_id):undefined,processRef:row.process_ref||undefined,evidenceRef:row.evidence_ref||undefined,status:row.status,expenseId:row.expense_id||undefined};});
  const events=eventRows.map((row):PurchaseRequestEvent=>({id:row.id,requestId:row.request_id,kind:row.event_kind,actor:row.actor_name,at:row.occurred_at,note:row.note||undefined,expenseId:row.expense_id||undefined,actualAmountCop:row.actual_amount_cop===null||row.actual_amount_cop===undefined?undefined:positiveNumber(row.actual_amount_cop,`Evento ${row.id}`)}));
  return {requests,events};
}

export async function submitRemotePurchaseRequest(access:PlantAccess[],payload:NewPurchaseRequest,client:SupabaseClient=createClient()){
  const {data,error}=await client.rpc("ops_submit_purchase_request",{
    target_plant:remotePlantId(access,payload.plantId),
    requester_name:payload.requestedBy,
    needed_by_date:payload.neededBy||null,
    request_category:payload.category,
    request_concept:payload.concept,
    request_justification:payload.justification,
    request_estimated_amount_cop:payload.estimatedAmountCop,
    request_suggested_supplier:payload.suggestedSupplier||null,
    target_equipment:payload.equipmentId||null,
    request_process_ref:payload.processRef||null,
    request_evidence_ref:payload.evidenceRef||null,
  });
  if(error)throw new Error(errorMessage("No fue posible enviar la solicitud",error));
  if(typeof data!=="string")throw new Error("La solicitud se registró pero el servidor no devolvió un identificador válido.");
  return data;
}

export async function decideRemotePurchaseRequest(requestId:string,decision:"approved"|"rejected",actor:string,note:string|undefined,client:SupabaseClient=createClient()){
  const {error}=await client.rpc("decide_purchase_request",{p_request_id:requestId,p_decision:decision,p_actor_name:actor,p_note:note||null});if(error)throw new Error(errorMessage("No fue posible actualizar la solicitud",error));
}

export async function fulfillRemotePurchaseRequest(payload:RemoteFulfillmentPayload,client:SupabaseClient=createClient()){
  const {data,error}=await client.rpc("fulfill_purchase_request",{p_request_id:payload.requestId,p_actor_name:payload.actor,p_supplier_name:payload.supplierName,p_actual_amount_cop:payload.actualAmountCop,p_document_date:payload.documentDate,p_document_ref:payload.documentRef||null,p_note:payload.note||null});if(error)throw new Error(errorMessage("No fue posible registrar la compra real",error));if(typeof data!=="string")throw new Error("La compra se registró pero el servidor no devolvió su identificador.");return data as string;
}
