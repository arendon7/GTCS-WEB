import type { IntakeLotDispositionDecision } from "@/lib/domain";
import type { PlantAccess } from "@/lib/ops-data-contract";
import type { ReceptionDecision } from "@/lib/reception-v2";
import { createClient } from "@/lib/supabase/client";
export type RemoteReceptionV2Payload={plantId:string;sourceId:string;materialTypeId:string;routeId?:string;responsibleEmployeeId?:string;startedAt:string;receivedWeightKg:number;acceptedWeightKg:number;rejectionWeightKg:number;improperWeightKg:number;acceptance:ReceptionDecision;driverName?:string;driverPhone?:string;vehiclePlate?:string;inspectionNotes?:string};
function remotePlantId(access:PlantAccess[],plantId:string){const plant=access.find(item=>item.plantId===plantId);if(!plant)throw new Error(`No tienes acceso a la planta ${plantId}.`);return plant.dbId;}
export async function createRemoteReceptionV2(access:PlantAccess[],payload:RemoteReceptionV2Payload){
 const client=createClient(); const endedAt=new Date().toISOString();
 const {data,error}=await client.rpc("ops_record_material_receipt_v2",{target_plant:remotePlantId(access,payload.plantId),target_source:payload.sourceId,target_material_type:payload.materialTypeId,receipt_started_at:payload.startedAt,receipt_ended_at:endedAt,received_weight_kg:payload.receivedWeightKg,accepted_weight_kg:payload.acceptedWeightKg,rejection_weight_kg:payload.rejectionWeightKg,improper_weight_kg:payload.improperWeightKg,acceptance_kind:payload.acceptance,target_route:payload.routeId??null,responsible_employee:payload.responsibleEmployeeId??null,transport_driver_name:payload.driverName?.trim()||null,transport_driver_phone:payload.driverPhone?.trim()||null,transport_vehicle_plate:payload.vehiclePlate?.trim()||null,inspection_notes_text:payload.inspectionNotes?.trim()||null});
 if(error)throw new Error(`No fue posible registrar la recepción: ${error.message}`);
 const row=Array.isArray(data)?data[0]:data;
 if(!row||typeof row.id!=="string"||typeof row.lot_code!=="string")throw new Error("La recepción fue registrada pero el servidor no devolvió identificadores válidos.");
 return{id:row.id as string,lotId:typeof row.lot_id==="string"?row.lot_id:undefined,lotCode:row.lot_code as string};
}
export async function disposeRemoteIntakeLot(lotId:string,decision:IntakeLotDispositionDecision,reason:string){
 const cleanReason=reason.trim();
 if(!lotId)throw new Error("Indica el lote físico.");
 if(!cleanReason)throw new Error("Registra el motivo de la decisión técnica.");
 const client=createClient();
 const {data,error}=await client.rpc("ops_dispose_material_intake_lot",{target_lot:lotId,disposition:decision,disposition_reason:cleanReason});
 if(error)throw new Error(`No fue posible resolver la cuarentena: ${error.message}`);
 if(data!=="available"&&data!=="rejected")throw new Error("La decisión se registró pero el servidor devolvió un estado inesperado.");
 return data as "available"|"rejected";
}
