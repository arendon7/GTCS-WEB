export type PlantStatus = "normal" | "attention" | "stopped";
export type ActivityStatus = "running" | "planned" | "done" | "delayed" | "missed";
export type AlertSeverity = "high" | "medium" | "low";
export type ActivityUnit = "kg" | "t" | "L" | "unidades" | "m3";
export type NoveltyType = "equipment_failure" | "delay" | "quality" | "safety" | "other";
export type AcceptanceStatus = "accepted" | "conditioned" | "partial_rejection" | "rejected" | "unknown";
export type WasteType = "FORSU" | "PODA" | "GALLINAZA" | "MATERIA_PRIMA" | "OTRO";
export type PhysicalLotStatus = "available" | "quarantined" | "in_process" | "depleted" | "rejected";
export type IntakeLotDispositionDecision = "release" | "reject";
export type HistoricalProvenance = { importRunId: string; sourceName: string; sourceRowIds: string[] };
export type PlantSummary = { id: string; name: string; status: PlantStatus; receivedT: number; processedT: number; planCompliancePct: number };
export type Worker = { id: string; name: string; plantId: string; historical?: boolean };
export type OpsAlert = { id: string; severity: AlertSeverity; title: string; detail: string; plant: string };
export type ActivityRecord = {
  id:string; plantId:string; plant:string; title:string; process:string; processId?:string; activityTemplateId?:string;
  plannedStart:string; plannedEnd?:string; actualStart?:string; actualEnd?:string; workerIds:string[];
  equipment?:string; equipmentId?:string; toolIds?:string[]; tools?:string[]; comment?:string; status:ActivityStatus;
  deviationReason?:string;
  quantity?:number; unit?:ActivityUnit; noveltyType?:NoveltyType; novelty?:string; source:"scheduled"|"unplanned"|"historical"; provenance?:HistoricalProvenance;
};
export type IncidentRecord = { id:string; activityId?:string; plantId:string; plant:string; title:string; detail:string; severity:AlertSeverity; equipment?:string; openedAt:string; status:"open"|"closed" };
export type ReceptionLotDisposition = { decision:IntakeLotDispositionDecision; reason:string; decidedAt:string };
export type ReceptionPhysicalLot = { id:string; initialMassKg:number; availableMassKg:number; status:PhysicalLotStatus; disposition?:ReceptionLotDisposition };
export type ReceptionRecord = { id:string; plantId:string; plant:string; generator:string; route:string; wasteType:WasteType; netWeightKg:number; rejectionKg:number; rejectionKnown?:boolean; acceptedWeightKg?:number; improperWeightKg?:number; acceptance:AcceptanceStatus; observation?:string; startedAt:string; endedAt:string; lotCode:string; physicalLot?:ReceptionPhysicalLot; source:"demo"|"local"|"historical"; timePrecision?:"datetime"|"date_only"; provenance?:HistoricalProvenance };
export function getDurationMinutes(activity:ActivityRecord,nowIso?:string){if(!activity.actualStart)return 0;const end=activity.actualEnd??nowIso;if(!end)return 0;return Math.max(0,(new Date(end).getTime()-new Date(activity.actualStart).getTime())/60000);}
export function getLaborHours(activity:ActivityRecord,nowIso?:string){return(getDurationMinutes(activity,nowIso)*activity.workerIds.length)/60;}
export function getRejectionPct(reception:Pick<ReceptionRecord,"netWeightKg"|"rejectionKg">){if(reception.netWeightKg<=0)return 0;return(reception.rejectionKg/reception.netWeightKg)*100;}
export function getReceptionDurationMinutes(reception:Pick<ReceptionRecord,"startedAt"|"endedAt">){return Math.max(0,(new Date(reception.endedAt).getTime()-new Date(reception.startedAt).getTime())/60000);}
