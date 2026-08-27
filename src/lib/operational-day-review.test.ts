import { describe,expect,it } from "vitest";
import type { ActivityRecord,IncidentRecord,ReceptionRecord } from "@/lib/domain";
import type { MaintenanceTicket } from "@/lib/maintenance-domain";
import type { PlantAccess } from "@/lib/ops-data-contract";
import {
  buildOperationalDaySnapshot,
  canReviewOperationalDay,
  localOperationalDaySnapshotHash,
  validateOperationalDayReview,
} from "@/lib/operational-day-review";

function membership(plantId:string,role:PlantAccess["role"]):PlantAccess{
  return {dbId:`db-${plantId}`,plantId,code:plantId.toUpperCase(),name:plantId,role};
}

function scheduled(id:string,status:ActivityRecord["status"],overrides:Partial<ActivityRecord>={}):ActivityRecord{
  return {
    id,plantId:"tamesis",plant:"Támesis",title:id,process:"Proceso",
    plannedStart:"2026-08-27T13:00:00.000Z",plannedEnd:"2026-08-27T14:00:00.000Z",
    workerIds:["worker-1"],status,source:"scheduled",...overrides,
  };
}

function reception(id:string,overrides:Partial<ReceptionRecord>={}):ReceptionRecord{
  return {
    id,plantId:"tamesis",plant:"Támesis",generator:"Generador",route:"Ruta",wasteType:"FORSU",
    netWeightKg:1000,rejectionKg:0,acceptance:"accepted",
    startedAt:"2026-08-27T14:00:00.000Z",endedAt:"2026-08-27T14:30:00.000Z",
    lotCode:`TAM-FORSU-20260827-${id}`,source:"local",...overrides,
  };
}

function incident(id:string,overrides:Partial<IncidentRecord>={}):IncidentRecord{
  return {
    id,plantId:"tamesis",plant:"Támesis",title:"Incidente",detail:"Detalle",severity:"medium",
    openedAt:"2026-08-27T15:00:00.000Z",status:"open",...overrides,
  };
}

function ticket(id:string,overrides:Partial<MaintenanceTicket>={}):MaintenanceTicket{
  return {
    id,equipmentId:`eq-${id}`,plantId:"tamesis",plant:"Támesis",severity:"medium",title:"Falla",
    description:"Detalle",failedAt:"2026-08-27T15:00:00.000Z",openedAt:"2026-08-27T15:05:00.000Z",status:"open",...overrides,
  };
}

describe("operational day review authorization",()=>{
  it.each(["supervisor","admin","director"] as const)("allows %s to attest the matching plant",(role)=>{
    expect(canReviewOperationalDay(true,[membership("tamesis",role)],"tamesis")).toBe(true);
  });

  it.each(["operator","technical","maintenance"] as const)("keeps %s in read-only review mode",(role)=>{
    expect(canReviewOperationalDay(true,[membership("tamesis",role)],"tamesis")).toBe(false);
  });

  it("does not inherit review authority from another plant",()=>{
    expect(canReviewOperationalDay(true,[membership("yarumal","director"),membership("tamesis","operator")],"tamesis")).toBe(false);
  });

  it("keeps local/demo review usable",()=>{
    expect(canReviewOperationalDay(false,[],"tamesis")).toBe(true);
  });
});

describe("operational day review acknowledgement",()=>{
  it("allows a clean day without a note",()=>{
    expect(validateOperationalDayReview({exceptionCount:0,acknowledgeExceptions:false,note:""})).toEqual({ok:true,note:undefined});
  });

  it("requires explicit acknowledgement when attention signals remain",()=>{
    expect(validateOperationalDayReview({exceptionCount:2,acknowledgeExceptions:false,note:"Pendientes identificados y asignados."}).ok).toBe(false);
  });

  it("requires a meaningful note when closing with attention signals",()=>{
    expect(validateOperationalDayReview({exceptionCount:2,acknowledgeExceptions:true,note:"corto"}).ok).toBe(false);
    expect(validateOperationalDayReview({exceptionCount:2,acknowledgeExceptions:true,note:"Pendientes identificados y asignados."})).toEqual({ok:true,note:"Pendientes identificados y asignados."});
  });

  it("rejects notes longer than the governed limit",()=>{
    expect(validateOperationalDayReview({exceptionCount:1,acknowledgeExceptions:true,note:"x".repeat(1001)}).ok).toBe(false);
  });
});

describe("operational day snapshot",()=>{
  const nowIso="2026-08-27T20:00:00.000Z";
  const activities:ActivityRecord[]=[
    scheduled("done","done",{actualStart:"2026-08-27T13:05:00.000Z",actualEnd:"2026-08-27T13:50:00.000Z"}),
    scheduled("pending","planned",{plannedStart:"2026-08-27T18:00:00.000Z"}),
    scheduled("missed","missed",{plannedStart:"2026-08-27T16:00:00.000Z",deviationReason:"No llegó material"}),
    {id:"unplanned-running",plantId:"tamesis",plant:"Támesis",title:"Aseo extraordinario",process:"Aseo",plannedStart:"2026-08-27T19:00:00.000Z",actualStart:"2026-08-27T19:00:00.000Z",workerIds:["worker-2"],status:"running",source:"unplanned"},
    scheduled("other-plant","planned",{plantId:"yarumal",plant:"Yarumal"}),
  ];
  const receptions:ReceptionRecord[]=[
    reception("001"),
    reception("002",{netWeightKg:500,rejectionKg:50,acceptance:"partial_rejection"}),
    reception("003",{netWeightKg:300,rejectionKg:0,acceptance:"conditioned",physicalLot:{id:"lot-003",initialMassKg:300,availableMassKg:300,status:"quarantined"}}),
  ];
  const incidents:IncidentRecord[]=[
    incident("open"),
    incident("closed",{status:"closed",closedAt:"2026-08-27T17:00:00.000Z"}),
  ];
  const tickets:MaintenanceTicket[]=[
    ticket("open"),
    ticket("closed",{status:"closed",closedAt:"2026-08-27T18:00:00.000Z"}),
  ];

  it("summarizes plan, actual work, intake and unresolved attention at the cutoff",()=>{
    expect(buildOperationalDaySnapshot({plantId:"tamesis",operationalDate:"2026-08-27",nowIso,activities,receptions,incidents,maintenanceTickets:tickets})).toEqual({
      scheduledCount:3,
      completedScheduledCount:1,
      incompleteScheduledCount:2,
      missedScheduledCount:1,
      runningActivityCount:1,
      runningUnplannedActivityCount:1,
      receptionCount:3,
      receivedWeightKg:1800,
      nonConformingReceptionCount:2,
      openIncidentCount:1,
      activeMaintenanceCount:1,
      quarantinedLotCount:1,
      exceptionCount:8,
    });
  });

  it("produces a stable local fingerprint that changes with material state",()=>{
    const snapshot=buildOperationalDaySnapshot({plantId:"tamesis",operationalDate:"2026-08-27",nowIso,activities,receptions,incidents,maintenanceTickets:tickets});
    expect(localOperationalDaySnapshotHash(snapshot)).toBe(localOperationalDaySnapshotHash({...snapshot}));
    expect(localOperationalDaySnapshotHash({...snapshot,receptionCount:snapshot.receptionCount+1})).not.toBe(localOperationalDaySnapshotHash(snapshot));
  });
});
