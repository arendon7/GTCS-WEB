import { describe,expect,it } from "vitest";
import { canonicalPlantId,mapRemoteActivities,mapRemoteEmployee,mapRemoteReceipt,type PlantAccess } from "@/lib/ops-data-contract";

const access:PlantAccess[]=[
  {dbId:"db-tam",plantId:"tamesis",code:"TAM",name:"Támesis",role:"operator"},
  {dbId:"db-yar",plantId:"yarumal",code:"YAR",name:"Yarumal",role:"director"},
];

describe("ops remote data contract",()=>{
  it("maps database plant identifiers to canonical app plant ids",()=>{
    expect(canonicalPlantId("TAM","Támesis")).toBe("tamesis");
    expect(canonicalPlantId("yarumal","Yarumal")).toBe("yarumal");
  });

  it("maps visible remote employees",()=>{
    expect(mapRemoteEmployee({id:"emp-1",plant_id:"db-tam",display_name:"Nelson"},access)).toEqual({id:"emp-1",name:"Nelson",plantId:"tamesis",historical:undefined});
  });

  it("joins scheduled workers and actual tools",()=>{
    const rows=mapRemoteActivities([
      {id:"sched-1",plant_id:"db-tam",title:"Volteo",process:"Compostaje",process_id:"proc",activity_template_id:"tpl",planned_start:"2026-08-12T13:00:00Z",status:"planned"},
    ],[],[],access,{scheduledWorkers:[{scheduled_activity_id:"sched-1",employee_id:"emp-1"}]});
    expect(rows[0]).toMatchObject({workerIds:["emp-1"],processId:"proc",activityTemplateId:"tpl"});

    const actual=mapRemoteActivities([], [
      {id:"act",plant_id:"db-tam",title:"Aseo",process:"Aseo",started_at:"2026-08-12T13:00:00Z",ended_at:"2026-08-12T14:00:00Z",source_kind:"app",activity_comment:"Listo"},
    ],[],access,{activityTools:[{activity_id:"act",tool_id:"tool-1"}],tools:[{id:"tool-1",name:"Pala"}]});
    expect(actual[0]).toMatchObject({comment:"Listo",toolIds:["tool-1"],tools:["Pala"]});
  });

  it("retains a planning deviation after the scheduled activity starts",()=>{
    const rows=mapRemoteActivities([
      {id:"sched-late",plant_id:"db-tam",title:"Volteo",process:"Compostaje",planned_start:"2026-08-12T13:00:00Z",planned_end:"2026-08-12T14:00:00Z",status:"running",deviation_reason:"Lluvia intensa"},
    ],[
      {id:"act-late",plant_id:"db-tam",scheduled_activity_id:"sched-late",title:"Volteo",process:"Compostaje",started_at:"2026-08-12T15:00:00Z",source_kind:"app"},
    ],[],access);
    expect(rows[0]).toMatchObject({id:"act-late",status:"running",source:"scheduled",deviationReason:"Lluvia intensa"});
  });

  it("keeps a not-yet-executed schedule planned",()=>{
    expect(mapRemoteActivities([{id:"s",plant_id:"db-yar",title:"T",planned_start:"2026-08-13T12:00:00Z",status:"planned"}],[],[],access)[0].status).toBe("planned");
  });

  it("does not surface superseded rows",()=>{
    const rows=mapRemoteActivities([
      {id:"old",plant_id:"db-yar",title:"T",planned_start:"2026-08-11T12:00:00Z",status:"rescheduled"},
      {id:"new",plant_id:"db-yar",title:"T",planned_start:"2026-08-13T12:00:00Z",status:"planned"},
    ],[],[],access);
    expect(rows.map(r=>r.id)).toEqual(["new"]);
  });

  it("preserves result and novelty",()=>{
    const rows=mapRemoteActivities([],[
      {id:"a",plant_id:"db-yar",title:"Limpieza",process:"Aseo",started_at:"2026-08-12T14:00:00Z",ended_at:"2026-08-12T15:00:00Z",quantity:"120",unit:"kg",novelty_type:"delay",notes:"Lluvia",source_kind:"app"},
    ],[],access);
    expect(rows[0]).toMatchObject({quantity:120,unit:"kg",novelty:"Lluvia",status:"done"});
  });

  it("rejects impossible running schedule",()=>{
    expect(()=>mapRemoteActivities([{id:"bad",plant_id:"db-tam",title:"T",planned_start:"2026-08-12T13:00:00Z",status:"running"}],[],[],access)).toThrow(/no tiene ejecución enlazada/);
  });

  it("preserves reception uncertainty",()=>{
    const r=mapRemoteReceipt({id:"r",plant_id:"db-yar",generator:"G",route:"R",waste_type:"FORSU",net_weight_kg:"1250.5",rejection_kg:"0",rejection_known:false,acceptance_status:"unknown",started_at:"2026-06-01T05:00:00Z",ended_at:"2026-06-01T05:00:00Z",lot_code:"L",source_kind:"historical",time_precision:"date_only",import_run_id:"run",source_row_ids:["row"]},access);
    expect(r).toMatchObject({plantId:"yarumal",rejectionKnown:false,source:"historical",physicalLot:undefined});
  });

  it("maps accepted mass, impropers and the physical intake lot",()=>{
    const r=mapRemoteReceipt({id:"receipt-v2",plant_id:"db-tam",generator:"Municipio",route:"Ruta 1",waste_type:"FORSU",net_weight_kg:"1000",rejection_kg:"100",rejection_known:true,accepted_weight_kg:"900",improper_weight_kg:"40",acceptance_status:"conditioned",started_at:"2026-08-17T13:00:00Z",ended_at:"2026-08-17T13:20:00Z",lot_code:"TAM-FORSU-20260817-001",source_kind:"app"},access,{id:"lot-v2",plant_id:"db-tam",receipt_id:"receipt-v2",lot_code:"TAM-FORSU-20260817-001",initial_mass_kg:"900",available_mass_kg:"650",status:"quarantined"});
    expect(r).toMatchObject({acceptedWeightKg:900,improperWeightKg:40,physicalLot:{id:"lot-v2",initialMassKg:900,availableMassKg:650,status:"quarantined"}});
  });

  it("rejects a physical lot linked to another receipt",()=>{
    expect(()=>mapRemoteReceipt({id:"receipt-v2",plant_id:"db-tam",generator:"Municipio",route:"Ruta 1",waste_type:"FORSU",net_weight_kg:"1000",rejection_kg:"0",accepted_weight_kg:"1000",acceptance_status:"accepted",started_at:"2026-08-17T13:00:00Z",ended_at:"2026-08-17T13:20:00Z",lot_code:"TAM-FORSU-20260817-001",source_kind:"app"},access,{id:"bad-lot",plant_id:"db-tam",receipt_id:"other",lot_code:"TAM-FORSU-20260817-001",initial_mass_kg:"1000",available_mass_kg:"1000",status:"available"})).toThrow(/no coincide con la recepción/);
  });

  it("rejects inaccessible plant",()=>{
    expect(()=>mapRemoteEmployee({id:"x",plant_id:"other",display_name:"X"},access)).toThrow(/Sin membresía visible/);
  });
});
