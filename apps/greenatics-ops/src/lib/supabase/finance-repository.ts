import type { SupabaseClient } from "@supabase/supabase-js";
import type { NewOperationalExpense,OperationalExpenseRecord,SupplierRecord } from "@/lib/expense-domain";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { createClient } from "@/lib/supabase/client";

type SupplierRow={id:string;name:string;normalized_key:string;created_at:string};
type ExpenseRow={id:string;plant_id:string;record_type:OperationalExpenseRecord["recordType"];supplier_id:string;category:OperationalExpenseRecord["category"];concept:string;amount_cop:number|string;document_date:string;document_ref?:string|null;equipment_id?:string|null;process_ref?:string|null;evidence_ref?:string|null;purchase_request_id?:string|null;note?:string|null;recorded_at:string};
type EquipmentRow={id:string;name:string};

function errorMessage(scope:string,error:{message?:string}|null){return `${scope}: ${error?.message||"error remoto desconocido"}`;}
function remotePlantId(access:PlantAccess[],plantId:string){const plant=access.find((item)=>item.plantId===plantId);if(!plant)throw new Error(`No tienes acceso a la planta ${plantId}.`);return plant.dbId;}
function positiveNumber(value:number|string,scope:string){const parsed=Number(value);if(!Number.isFinite(parsed)||parsed<=0)throw new Error(`${scope} contiene un monto inválido.`);return parsed;}

export async function loadRemoteExpenses(access:PlantAccess[],client:SupabaseClient=createClient()):Promise<{suppliers:SupplierRecord[];expenses:OperationalExpenseRecord[]}>{
  if(!access.length)return {suppliers:[],expenses:[]};
  const plantIds=access.map((plant)=>plant.dbId);
  const [supplierResult,expenseResult,equipmentResult]=await Promise.all([
    client.from("suppliers").select("id,name,normalized_key,created_at").order("name"),
    client.from("operational_expenses").select("id,plant_id,record_type,supplier_id,category,concept,amount_cop,document_date,document_ref,equipment_id,process_ref,evidence_ref,purchase_request_id,note,recorded_at").in("plant_id",plantIds).order("document_date",{ascending:false}).order("recorded_at",{ascending:false}),
    client.from("equipment").select("id,name").in("plant_id",plantIds),
  ]);
  if(supplierResult.error)throw new Error(errorMessage("No fue posible cargar proveedores",supplierResult.error));
  if(expenseResult.error)throw new Error(errorMessage("No fue posible cargar compras/gastos",expenseResult.error));
  if(equipmentResult.error)throw new Error(errorMessage("No fue posible enlazar equipos con compras/gastos",equipmentResult.error));

  const suppliers=((supplierResult.data??[]) as unknown as SupplierRow[]).map((row):SupplierRecord=>({id:row.id,name:row.name,normalizedKey:row.normalized_key,createdAt:row.created_at}));
  const supplierMap=new Map(suppliers.map((item)=>[item.id,item]));
  const plantMap=new Map(access.map((plant)=>[plant.dbId,plant]));
  const equipmentMap=new Map(((equipmentResult.data??[]) as unknown as EquipmentRow[]).map((item)=>[item.id,item.name]));

  const expenses=((expenseResult.data??[]) as unknown as ExpenseRow[]).map((row):OperationalExpenseRecord=>{
    const plant=plantMap.get(row.plant_id);const supplier=supplierMap.get(row.supplier_id);
    if(!plant)throw new Error(`Compra/gasto ${row.id} pertenece a una planta no visible.`);
    if(!supplier)throw new Error(`Compra/gasto ${row.id} referencia un proveedor no visible.`);
    return {id:row.id,plantId:plant.plantId,plant:plant.name,recordType:row.record_type,supplierId:supplier.id,supplierName:supplier.name,category:row.category,concept:row.concept,amountCop:positiveNumber(row.amount_cop,`Compra/gasto ${row.id}`),documentDate:row.document_date,documentRef:row.document_ref||undefined,equipmentId:row.equipment_id||undefined,equipmentName:row.equipment_id?equipmentMap.get(row.equipment_id):undefined,processRef:row.process_ref||undefined,evidenceRef:row.evidence_ref||undefined,purchaseRequestId:row.purchase_request_id||undefined,note:row.note||undefined,recordedAt:row.recorded_at};
  });
  return {suppliers,expenses};
}

export async function recordRemoteExpense(access:PlantAccess[],payload:NewOperationalExpense,client:SupabaseClient=createClient()){
  const {data,error}=await client.rpc("ops_record_operational_expense",{target_plant:remotePlantId(access,payload.plantId),expense_record_type:payload.recordType,supplier_name:payload.supplierName,expense_category:payload.category,expense_concept:payload.concept,expense_amount_cop:payload.amountCop,expense_document_date:payload.documentDate,expense_document_ref:payload.documentRef||null,target_equipment:payload.equipmentId||null,expense_process_ref:payload.processRef||null,expense_evidence_ref:payload.evidenceRef||null,expense_note:payload.note||null});
  if(error)throw new Error(errorMessage("No fue posible registrar la compra/gasto",error));
  const row=Array.isArray(data)?data[0]:data;
  if(!row||typeof row.id!=="string"||typeof row.supplier_id!=="string")throw new Error("La compra/gasto se registró pero el servidor no devolvió identificadores válidos.");
  return {id:row.id as string,supplierId:row.supplier_id as string};
}
