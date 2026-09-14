import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlantAccess } from "@/lib/ops-data-contract";
import type { SupplyMaster,SupplyMovement,SupplyReceipt,SupplyCategory } from "@/lib/supply-domain";
import type { InventoryUnit } from "@/lib/inventory-domain";
import { createClient } from "@/lib/supabase/client";

type SupplyRow={id:string;name:string;normalized_key:string;category:SupplyCategory;unit:InventoryUnit;active:boolean;created_at:string};
type ReceiptRow={id:string;plant_id:string;supply_id:string;quantity:number|string;lot_code:string;received_on:string;supplier_name?:string|null;expense_id?:string|null;document_ref?:string|null;evidence_ref?:string|null;note?:string|null;recorded_at:string};
type MovementRow={id:string;plant_id:string;supply_id:string;lot_code:string;kind:SupplyMovement["kind"];quantity:number|string;occurred_on:string;reference_id?:string|null;destination?:string|null;equipment_id?:string|null;process_ref?:string|null;note?:string|null;recorded_at:string};
export type RemoteSupplyReceiptInput={plantId:string;supplyName:string;category:SupplyCategory;unit:InventoryUnit;quantity:number;receivedOn:string;supplierName?:string;expenseId?:string;documentRef?:string;evidenceRef?:string;note?:string};
export type RemoteSupplyConsumptionInput={plantId:string;supplyId:string;lotCode:string;quantity:number;occurredOn:string;destination:string;equipmentId?:string;processRef?:string;note?:string};
function errorMessage(scope:string,error:{message?:string}|null){return `${scope}: ${error?.message||"error remoto desconocido"}`;}
function remotePlantId(access:PlantAccess[],plantId:string){const plant=access.find((item)=>item.plantId===plantId);if(!plant)throw new Error(`No tienes acceso a la planta ${plantId}.`);return plant.dbId;}
function positiveNumber(value:number|string,scope:string){const parsed=Number(value);if(!Number.isFinite(parsed)||parsed<=0)throw new Error(`${scope} contiene una cantidad inválida.`);return parsed;}

export async function loadRemoteSupplies(access:PlantAccess[],client:SupabaseClient=createClient()):Promise<{supplies:SupplyMaster[];receipts:SupplyReceipt[];movements:SupplyMovement[]}>{
  if(!access.length)return {supplies:[],receipts:[],movements:[]};
  const plantIds=access.map((plant)=>plant.dbId);
  const [supplyResult,receiptResult,movementResult]=await Promise.all([
    client.from("supplies").select("id,name,normalized_key,category,unit,active,created_at").order("name"),
    client.from("supply_receipts").select("id,plant_id,supply_id,quantity,lot_code,received_on,supplier_name,expense_id,document_ref,evidence_ref,note,recorded_at").in("plant_id",plantIds).order("received_on",{ascending:false}).order("recorded_at",{ascending:false}),
    client.from("supply_movements").select("id,plant_id,supply_id,lot_code,kind,quantity,occurred_on,reference_id,destination,equipment_id,process_ref,note,recorded_at").in("plant_id",plantIds).order("occurred_on",{ascending:false}).order("recorded_at",{ascending:false}),
  ]);
  if(supplyResult.error)throw new Error(errorMessage("No fue posible cargar el maestro de insumos",supplyResult.error));
  if(receiptResult.error)throw new Error(errorMessage("No fue posible cargar recepciones de insumos",receiptResult.error));
  if(movementResult.error)throw new Error(errorMessage("No fue posible cargar kardex de insumos",movementResult.error));
  const supplies=((supplyResult.data??[]) as unknown as SupplyRow[]).map((row):SupplyMaster=>({id:row.id,name:row.name,normalizedKey:row.normalized_key,category:row.category,unit:row.unit,active:row.active,createdAt:row.created_at}));
  const supplyMap=new Map(supplies.map((supply)=>[supply.id,supply]));const plantMap=new Map(access.map((plant)=>[plant.dbId,plant]));
  const receipts=((receiptResult.data??[]) as unknown as ReceiptRow[]).map((row):SupplyReceipt=>{const plant=plantMap.get(row.plant_id);const supply=supplyMap.get(row.supply_id);if(!plant)throw new Error(`Recepción ${row.id} pertenece a una planta no visible.`);if(!supply)throw new Error(`Recepción ${row.id} referencia un insumo no visible.`);return {id:row.id,plantId:plant.plantId,plant:plant.name,supplyId:supply.id,supplyName:supply.name,category:supply.category,unit:supply.unit,quantity:positiveNumber(row.quantity,`Recepción ${row.id}`),lotCode:row.lot_code,receivedOn:row.received_on,supplierName:row.supplier_name||undefined,expenseId:row.expense_id||undefined,documentRef:row.document_ref||undefined,evidenceRef:row.evidence_ref||undefined,note:row.note||undefined,recordedAt:row.recorded_at};});
  const movements=((movementResult.data??[]) as unknown as MovementRow[]).map((row):SupplyMovement=>{const plant=plantMap.get(row.plant_id);const supply=supplyMap.get(row.supply_id);if(!plant)throw new Error(`Movimiento ${row.id} pertenece a una planta no visible.`);if(!supply)throw new Error(`Movimiento ${row.id} referencia un insumo no visible.`);return {id:row.id,plantId:plant.plantId,plant:plant.name,supplyId:supply.id,supplyName:supply.name,category:supply.category,unit:supply.unit,lotCode:row.lot_code,kind:row.kind,quantity:positiveNumber(row.quantity,`Movimiento ${row.id}`),occurredOn:row.occurred_on,referenceId:row.reference_id||undefined,destination:row.destination||undefined,equipmentId:row.equipment_id||undefined,processRef:row.process_ref||undefined,note:row.note||undefined,recordedAt:row.recorded_at};});
  return {supplies,receipts,movements};
}

export async function recordRemoteSupplyReceipt(access:PlantAccess[],input:RemoteSupplyReceiptInput,client:SupabaseClient=createClient()){
  const {data,error}=await client.rpc("record_supply_receipt",{p_plant_id:remotePlantId(access,input.plantId),p_supply_name:input.supplyName,p_category:input.category,p_unit:input.unit,p_quantity:input.quantity,p_received_on:input.receivedOn,p_supplier_name:input.supplierName||null,p_expense_id:input.expenseId||null,p_document_ref:input.documentRef||null,p_evidence_ref:input.evidenceRef||null,p_note:input.note||null});
  if(error)throw new Error(errorMessage("No fue posible registrar la recepción física",error));const row=Array.isArray(data)?data[0]:data;if(!row||typeof row.id!=="string"||typeof row.lot_code!=="string")throw new Error("La recepción se registró pero el servidor no devolvió lote e identificador válidos.");return {id:row.id as string,lotCode:row.lot_code as string};
}
export async function consumeRemoteSupply(access:PlantAccess[],input:RemoteSupplyConsumptionInput,client:SupabaseClient=createClient()){
  const {data,error}=await client.rpc("consume_supply",{p_plant_id:remotePlantId(access,input.plantId),p_supply_id:input.supplyId,p_lot_code:input.lotCode,p_quantity:input.quantity,p_occurred_on:input.occurredOn,p_destination:input.destination,p_equipment_id:input.equipmentId||null,p_process_ref:input.processRef||null,p_note:input.note||null});
  if(error)throw new Error(errorMessage("No fue posible registrar el consumo físico",error));if(typeof data!=="string")throw new Error("El consumo se registró pero el servidor no devolvió su identificador.");return data as string;
}
