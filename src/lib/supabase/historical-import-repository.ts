import type { SupabaseClient } from "@supabase/supabase-js";
import type { ImportRun } from "@/lib/importer";
import { buildCanonicalPromotion } from "@/lib/import-promotion";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { createClient } from "@/lib/supabase/client";

function errorMessage(scope:string,error:{message?:string}|null){return `${scope}: ${error?.message||"error remoto desconocido"}`;}

function ensureImportAccess(access:PlantAccess[],run:ImportRun){
  const plantIds=new Set<string>();
  for(const activity of run.activities)plantIds.add(activity.plantId);
  for(const receipt of run.receipts){if(receipt.status!=="quarantined"&&receipt.status!=="duplicate"&&receipt.plantId)plantIds.add(receipt.plantId);}
  for(const plantId of plantIds){const membership=access.find((item)=>item.plantId===plantId);if(!membership)throw new Error(`No tienes acceso a la planta ${plantId}.`);if(membership.role!=="admin"&&membership.role!=="director")throw new Error(`La promoción histórica requiere rol admin/director en ${membership.name}.`);}
}

export async function promoteRemoteHistoricalImport(access:PlantAccess[],run:ImportRun,client:SupabaseClient=createClient()){
  ensureImportAccess(access,run);
  const promotion=buildCanonicalPromotion(run);
  if(promotion.errors.length)throw new Error(promotion.errors.join(" "));
  const workerById=new Map(promotion.workers.map((worker)=>[worker.id,worker.name]));
  const sourceRows=[
    ...run.receipts.map((row)=>({sourceRowId:row.rowId,rowKind:"receipt",status:row.status,raw:row.raw,normalized:{plantId:row.plantId,plant:row.plant,date:row.date,generator:row.generator,route:row.route,wasteType:row.wasteType,netWeightKg:row.netWeightKg,rejectionKg:row.rejectionKg,rejectionKnown:row.rejectionKnown,timePrecision:row.timePrecision}})),
    ...run.logs.map((row)=>({sourceRowId:row.rowId,rowKind:"log",status:row.status,raw:row.raw,normalized:{plantId:row.plantId,plant:row.plant,activity:row.activity,workerOriginal:row.workerOriginal,workerCanonical:row.workerCanonical,startedAt:row.startedAt,endedAt:row.endedAt,durationHours:row.durationHours,equipment:row.equipment}})),
  ];
  const activities=promotion.activities.map((activity)=>({recordKey:activity.id,plantId:activity.plantId,title:activity.title,process:activity.process,startedAt:activity.actualStart,endedAt:activity.actualEnd,equipment:activity.equipment??null,sourceRowIds:activity.provenance?.sourceRowIds??[],workers:activity.workerIds.map((id)=>workerById.get(id)).filter((name):name is string=>Boolean(name))}));
  const receipts=promotion.receptions.map((receipt)=>({recordKey:receipt.id,plantId:receipt.plantId,generator:receipt.generator,route:receipt.route,wasteType:receipt.wasteType,netWeightKg:receipt.netWeightKg,rejectionKg:receipt.rejectionKg,rejectionKnown:receipt.rejectionKnown??true,observation:receipt.observation??null,startedAt:receipt.startedAt,endedAt:receipt.endedAt,lotCode:receipt.lotCode,timePrecision:receipt.timePrecision??"datetime",sourceRowIds:receipt.provenance?.sourceRowIds??[]}));

  const {data,error}=await client.rpc("promote_historical_import",{p_source_name:run.sourceName,p_source_hash:run.sourceHash,p_source_rows:sourceRows,p_issues:run.issues,p_activities:activities,p_receipts:receipts});
  if(error)throw new Error(errorMessage("No fue posible promover el histórico",error));
  const row=Array.isArray(data)?data[0]:data;
  if(!row||typeof row.activities_count!=="number"||typeof row.receptions_count!=="number")throw new Error("La promoción terminó sin devolver conteos válidos.");
  return {activities:row.activities_count as number,receptions:row.receptions_count as number};
}
