import type { SupabaseClient } from "@supabase/supabase-js";
import { type ActivityTemplate, type CollectionRoute, type EquipmentMasterOption, type EquipmentProcessAssignment, type MaterialSource, type MaterialSourceKind, type MaterialTypeMaster, type MeasurementUnit, type OperationalMasterSnapshot, type OperationalProcess, type OperationalTool, type SimpleMasterKind } from "@/lib/operational-master-data";
import { createClient } from "@/lib/supabase/client";

type SimpleRow = { id:string; plant_id:string; code:string; name:string; active:boolean };
type TemplateRow = SimpleRow & { process_id:string; default_unit_code?:string|null; requires_quantity:boolean; requires_lot:boolean; requires_equipment:boolean; allows_unplanned:boolean };
type SourceRow = SimpleRow & { source_kind:MaterialSourceKind };
type EquipmentRow = { id:string; plant_id:string; code:string; name:string; status:EquipmentMasterOption["status"] };
type EquipmentProcessRow = { equipment_id:string; process_id:string; plant_id:string; active:boolean };
type Result = { ok:true } | { ok:false; error:string };

function errorMessage(scope:string,error:{message?:string;code?:string}|null){ if(error?.code==="23505") return `${scope}: ya existe un registro con ese código en la planta.`; return `${scope}: ${error?.message || "error remoto desconocido"}`; }
const mapSimple=(row:SimpleRow)=>({id:row.id,plantId:row.plant_id,code:row.code,name:row.name,active:row.active});
function mapTemplate(row:TemplateRow):ActivityTemplate{return{id:row.id,plantId:row.plant_id,processId:row.process_id,code:row.code,name:row.name,defaultUnitCode:row.default_unit_code||undefined,requiresQuantity:row.requires_quantity,requiresLot:row.requires_lot,requiresEquipment:row.requires_equipment,allowsUnplanned:row.allows_unplanned,active:row.active};}

export async function loadOperationalMasterSnapshot(plantId:string,client:SupabaseClient=createClient()):Promise<OperationalMasterSnapshot>{
  const [u,p,t,s,r,m,o,e,a]=await Promise.all([
    client.from("measurement_units").select("code,name,symbol,category,active").eq("active",true).order("code"),
    client.from("operational_processes").select("id,plant_id,code,name,active").eq("plant_id",plantId).order("name"),
    client.from("activity_templates").select("id,plant_id,process_id,code,name,default_unit_code,requires_quantity,requires_lot,requires_equipment,allows_unplanned,active").eq("plant_id",plantId).order("name"),
    client.from("material_sources").select("id,plant_id,code,name,source_kind,active").eq("plant_id",plantId).order("name"),
    client.from("collection_routes").select("id,plant_id,code,name,active").eq("plant_id",plantId).order("name"),
    client.from("material_types").select("id,plant_id,code,name,active").eq("plant_id",plantId).order("name"),
    client.from("operational_tools").select("id,plant_id,code,name,active").eq("plant_id",plantId).order("name"),
    client.from("equipment").select("id,plant_id,code,name,status").eq("plant_id",plantId).order("code"),
    client.from("equipment_processes").select("equipment_id,process_id,plant_id,active").eq("plant_id",plantId),
  ]);
  const failed=[u,p,t,s,r,m,o,e,a].find(x=>x.error); if(failed?.error) throw new Error(errorMessage("No fue posible cargar los maestros operacionales",failed.error));
  return {
    units:(u.data??[]) as unknown as MeasurementUnit[],
    processes:((p.data??[]) as unknown as SimpleRow[]).map(mapSimple) as OperationalProcess[],
    activityTemplates:((t.data??[]) as unknown as TemplateRow[]).map(mapTemplate),
    sources:((s.data??[]) as unknown as SourceRow[]).map(row=>({...mapSimple(row),sourceKind:row.source_kind})) as MaterialSource[],
    routes:((r.data??[]) as unknown as SimpleRow[]).map(mapSimple) as CollectionRoute[],
    materialTypes:((m.data??[]) as unknown as SimpleRow[]).map(mapSimple) as MaterialTypeMaster[],
    tools:((o.data??[]) as unknown as SimpleRow[]).map(mapSimple) as OperationalTool[],
    equipment:((e.data??[]) as unknown as EquipmentRow[]).map(row=>({id:row.id,plantId:row.plant_id,code:row.code,name:row.name,status:row.status})),
    equipmentProcesses:((a.data??[]) as unknown as EquipmentProcessRow[]).map(row=>({equipmentId:row.equipment_id,processId:row.process_id,plantId:row.plant_id,active:row.active} as EquipmentProcessAssignment)),
  };
}
function tableFor(kind:SimpleMasterKind){return kind==="process"?"operational_processes":kind==="route"?"collection_routes":kind==="tool"?"operational_tools":"material_types";}
export async function createSimpleOperationalMaster(input:{kind:SimpleMasterKind;plantId:string;code:string;name:string},client:SupabaseClient=createClient()):Promise<Result>{const{error}=await client.from(tableFor(input.kind)).insert({plant_id:input.plantId,code:input.code,name:input.name});return error?{ok:false,error:errorMessage("No fue posible crear el maestro",error)}:{ok:true};}
export async function updateSimpleOperationalMaster(input:{kind:SimpleMasterKind;id:string;name:string;active:boolean},client:SupabaseClient=createClient()):Promise<Result>{const{data,error}=await client.from(tableFor(input.kind)).update({name:input.name,active:input.active}).eq("id",input.id).select("id").maybeSingle();if(error)return{ok:false,error:errorMessage("No fue posible actualizar el maestro",error)};return data?.id?{ok:true}:{ok:false,error:"El maestro cambió o dejó de estar disponible. Actualiza la vista."};}
export async function createMaterialSource(input:{plantId:string;code:string;name:string;sourceKind:MaterialSourceKind},client:SupabaseClient=createClient()):Promise<Result>{const{error}=await client.from("material_sources").insert({plant_id:input.plantId,code:input.code,name:input.name,source_kind:input.sourceKind});return error?{ok:false,error:errorMessage("No fue posible crear el origen",error)}:{ok:true};}
export async function updateMaterialSource(input:{id:string;name:string;sourceKind:MaterialSourceKind;active:boolean},client:SupabaseClient=createClient()):Promise<Result>{const{data,error}=await client.from("material_sources").update({name:input.name,source_kind:input.sourceKind,active:input.active}).eq("id",input.id).select("id").maybeSingle();if(error)return{ok:false,error:errorMessage("No fue posible actualizar el origen",error)};return data?.id?{ok:true}:{ok:false,error:"El origen cambió o dejó de estar disponible. Actualiza la vista."};}
export async function createActivityTemplate(input:{plantId:string;processId:string;code:string;name:string;defaultUnitCode?:string;requiresQuantity:boolean;requiresLot:boolean;requiresEquipment:boolean;allowsUnplanned:boolean},client:SupabaseClient=createClient()):Promise<Result>{const{error}=await client.from("activity_templates").insert({plant_id:input.plantId,process_id:input.processId,code:input.code,name:input.name,default_unit_code:input.defaultUnitCode||null,requires_quantity:input.requiresQuantity,requires_lot:input.requiresLot,requires_equipment:input.requiresEquipment,allows_unplanned:input.allowsUnplanned});return error?{ok:false,error:errorMessage("No fue posible crear la plantilla",error)}:{ok:true};}
export async function updateActivityTemplate(input:{id:string;processId:string;name:string;defaultUnitCode?:string;requiresQuantity:boolean;requiresLot:boolean;requiresEquipment:boolean;allowsUnplanned:boolean;active:boolean},client:SupabaseClient=createClient()):Promise<Result>{const{data,error}=await client.from("activity_templates").update({process_id:input.processId,name:input.name,default_unit_code:input.defaultUnitCode||null,requires_quantity:input.requiresQuantity,requires_lot:input.requiresLot,requires_equipment:input.requiresEquipment,allows_unplanned:input.allowsUnplanned,active:input.active}).eq("id",input.id).select("id").maybeSingle();if(error)return{ok:false,error:errorMessage("No fue posible actualizar la plantilla",error)};return data?.id?{ok:true}:{ok:false,error:"La plantilla cambió o dejó de estar disponible. Actualiza la vista."};}
export async function setEquipmentProcessAssignment(input:{plantId:string;equipmentId:string;processId:string;active:boolean},client:SupabaseClient=createClient()):Promise<Result>{const{error}=await client.from("equipment_processes").upsert({plant_id:input.plantId,equipment_id:input.equipmentId,process_id:input.processId,active:input.active},{onConflict:"equipment_id,process_id"});return error?{ok:false,error:errorMessage("No fue posible actualizar la relación equipo-proceso",error)}:{ok:true};}
