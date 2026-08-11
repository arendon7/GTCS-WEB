"use client";

import { createContext,useContext,useEffect,useMemo,useState,type ReactNode } from "react";
import { useExpenseStore } from "@/components/expense-store";
import { validatePurchaseRequest,validateTransition,type NewPurchaseRequest,type PurchaseRequestEvent,type PurchaseRequestRecord,type PurchaseRequestStatus } from "@/lib/purchase-request-domain";

const STORAGE_KEY="greenatics-ops-purchase-requests-mvp-012";

type Result={ok:true;id:string}|{ok:false;error:string};
type FulfillmentPayload={requestId:string;actor:string;supplierName:string;actualAmountCop:number;documentDate:string;documentRef?:string;note?:string};
type PurchaseRequestStore={
  requests:PurchaseRequestRecord[];
  events:PurchaseRequestEvent[];
  ready:boolean;
  submitRequest:(payload:NewPurchaseRequest)=>Result;
  approveRequest:(requestId:string,actor:string,note?:string)=>Result;
  rejectRequest:(requestId:string,actor:string,reason:string)=>Result;
  fulfillRequest:(payload:FulfillmentPayload)=>Result;
};

const PurchaseRequestContext=createContext<PurchaseRequestStore|null>(null);
function plantName(plantId:string){return plantId==="yarumal"?"Yarumal":"Támesis";}

export function PurchaseRequestStoreProvider({children}:{children:ReactNode}){
  const {recordExpense}=useExpenseStore();
  const [requests,setRequests]=useState<PurchaseRequestRecord[]>([]);
  const [events,setEvents]=useState<PurchaseRequestEvent[]>([]);
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      try{
        const raw=window.localStorage.getItem(STORAGE_KEY);
        if(raw){
          const parsed=JSON.parse(raw) as {requests?:PurchaseRequestRecord[];events?:PurchaseRequestEvent[]};
          if(parsed.requests)setRequests(parsed.requests);
          if(parsed.events)setEvents(parsed.events);
        }
      }catch{window.localStorage.removeItem(STORAGE_KEY);}
      finally{setReady(true);}
    },0);
    return()=>window.clearTimeout(timer);
  },[]);

  useEffect(()=>{
    if(!ready)return;
    window.localStorage.setItem(STORAGE_KEY,JSON.stringify({requests,events}));
  },[requests,events,ready]);

  function transition(requestId:string,to:PurchaseRequestStatus,actor:string,note?:string):Result{
    const request=requests.find((item)=>item.id===requestId);
    if(!request)return {ok:false,error:"Solicitud no encontrada."};
    const validation=validateTransition({from:request.status,to,actor,note});
    if(!validation.ok)return validation;
    const at=new Date().toISOString();
    setRequests((current)=>current.map((item)=>item.id===requestId?{...item,status:to}:item));
    setEvents((current)=>[{id:crypto.randomUUID(),requestId,kind:to,actor:actor.trim(),at,note:note?.trim()||undefined},...current]);
    return {ok:true,id:requestId};
  }

  const value=useMemo<PurchaseRequestStore>(()=>({
    requests,events,ready,
    submitRequest(payload){
      const validation=validatePurchaseRequest(payload);
      if(!validation.ok)return validation;
      const id=crypto.randomUUID();
      const requestedAt=new Date().toISOString();
      const record:PurchaseRequestRecord={
        id,plantId:payload.plantId,plant:plantName(payload.plantId),requestedBy:payload.requestedBy.trim(),requestedAt,
        neededBy:payload.neededBy||undefined,category:payload.category,concept:payload.concept.trim(),justification:payload.justification.trim(),
        estimatedAmountCop:payload.estimatedAmountCop,suggestedSupplier:payload.suggestedSupplier?.trim()||undefined,
        equipmentId:payload.equipmentId||undefined,equipmentName:payload.equipmentName?.trim()||undefined,processRef:payload.processRef?.trim()||undefined,
        evidenceRef:payload.evidenceRef?.trim()||undefined,status:"submitted",
      };
      setRequests((current)=>[record,...current]);
      setEvents((current)=>[{id:crypto.randomUUID(),requestId:id,kind:"submitted",actor:record.requestedBy,at:requestedAt,note:record.justification},...current]);
      return {ok:true,id};
    },
    approveRequest(requestId,actor,note){return transition(requestId,"approved",actor,note);},
    rejectRequest(requestId,actor,reason){return transition(requestId,"rejected",actor,reason);},
    fulfillRequest(payload){
      const request=requests.find((item)=>item.id===payload.requestId);
      if(!request)return {ok:false,error:"Solicitud no encontrada."};
      const transitionValidation=validateTransition({from:request.status,to:"fulfilled",actor:payload.actor,note:payload.note});
      if(!transitionValidation.ok)return transitionValidation;
      if(!payload.supplierName.trim())return {ok:false,error:"Indica el proveedor real."};
      if(!Number.isFinite(payload.actualAmountCop)||payload.actualAmountCop<=0)return {ok:false,error:"El monto real debe ser mayor que cero."};
      const expenseResult=recordExpense({
        plantId:request.plantId,recordType:"purchase",supplierName:payload.supplierName,category:request.category,concept:request.concept,
        amountCop:payload.actualAmountCop,documentDate:payload.documentDate,documentRef:payload.documentRef,
        equipmentId:request.equipmentId,equipmentName:request.equipmentName,processRef:request.processRef,evidenceRef:request.evidenceRef,
        purchaseRequestId:request.id,note:payload.note?.trim()||`Compra originada en solicitud ${request.id.slice(0,8)}.`
      });
      if(!expenseResult.ok)return expenseResult;
      const at=new Date().toISOString();
      setRequests((current)=>current.map((item)=>item.id===request.id?{...item,status:"fulfilled",expenseId:expenseResult.id}:item));
      setEvents((current)=>[{id:crypto.randomUUID(),requestId:request.id,kind:"fulfilled",actor:payload.actor.trim(),at,note:payload.note?.trim()||undefined,expenseId:expenseResult.id,actualAmountCop:payload.actualAmountCop},...current]);
      return {ok:true,id:expenseResult.id};
    },
  // transition is intentionally only used inside the guarded public actions above.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }),[requests,events,ready,recordExpense]);

  return <PurchaseRequestContext.Provider value={value}>{children}</PurchaseRequestContext.Provider>;
}

export function usePurchaseRequestStore(){
  const context=useContext(PurchaseRequestContext);
  if(!context)throw new Error("usePurchaseRequestStore debe usarse dentro de PurchaseRequestStoreProvider");
  return context;
}
