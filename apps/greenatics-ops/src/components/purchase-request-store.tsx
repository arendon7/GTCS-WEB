"use client";

import { createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode } from "react";
import { useExpenseStore } from "@/components/expense-store";
import { useOpsStore } from "@/components/ops-store";
import { validatePurchaseRequest,validateTransition,type NewPurchaseRequest,type PurchaseRequestEvent,type PurchaseRequestRecord,type PurchaseRequestStatus } from "@/lib/purchase-request-domain";
import { decideRemotePurchaseRequest,fulfillRemotePurchaseRequest,loadRemotePurchaseRequests,submitRemotePurchaseRequest } from "@/lib/supabase/purchase-request-repository";

const STORAGE_KEY="greenatics-ops-purchase-requests-mvp-012";
type Result={ok:true;id:string}|{ok:false;error:string};
type FulfillmentPayload={requestId:string;actor:string;supplierName:string;actualAmountCop:number;documentDate:string;documentRef?:string;note?:string};
type PurchaseRequestStore={requests:PurchaseRequestRecord[];events:PurchaseRequestEvent[];ready:boolean;error?:string;submitRequest:(payload:NewPurchaseRequest)=>Promise<Result>;approveRequest:(requestId:string,actor:string,note?:string)=>Promise<Result>;rejectRequest:(requestId:string,actor:string,reason:string)=>Promise<Result>;fulfillRequest:(payload:FulfillmentPayload)=>Promise<Result>;refreshPurchaseRequests:()=>Promise<void>};
const PurchaseRequestContext=createContext<PurchaseRequestStore|null>(null);
function plantName(plantId:string){return plantId==="yarumal"?"Yarumal":"Támesis";}
function failure(error:unknown,fallback:string):{ok:false;error:string}{return {ok:false,error:error instanceof Error?error.message:fallback};}

export function PurchaseRequestStoreProvider({children}:{children:ReactNode}){
  const {backend,access}=useOpsStore();
  const {recordExpense,refreshExpenses}=useExpenseStore();
  const remoteMode=backend.mode==="supabase";
  const [requests,setRequests]=useState<PurchaseRequestRecord[]>([]);const [events,setEvents]=useState<PurchaseRequestEvent[]>([]);const [ready,setReady]=useState(false);const [error,setError]=useState<string>();

  const hydrateRemote=useCallback(async()=>{if(backend.status!=="ready")return;const snapshot=await loadRemotePurchaseRequests(access);setRequests(snapshot.requests);setEvents(snapshot.events);setError(undefined);setReady(true);},[access,backend.status]);
  const refreshPurchaseRequests=useCallback(async()=>{if(!remoteMode)return;setReady(false);try{await hydrateRemote();}catch(caught){setRequests([]);setEvents([]);setError(caught instanceof Error?caught.message:"No fue posible cargar solicitudes remotas.");setReady(true);throw caught;}},[hydrateRemote,remoteMode]);

  useEffect(()=>{
    if(remoteMode){if(backend.status!=="ready"){const timer=window.setTimeout(()=>{setRequests([]);setEvents([]);setError(backend.status==="error"?backend.error:undefined);setReady(backend.status==="error");},0);return()=>window.clearTimeout(timer);}const timer=window.setTimeout(()=>{void refreshPurchaseRequests().catch(()=>undefined);},0);return()=>window.clearTimeout(timer);}
    const timer=window.setTimeout(()=>{try{const raw=window.localStorage.getItem(STORAGE_KEY);if(raw){const parsed=JSON.parse(raw) as {requests?:PurchaseRequestRecord[];events?:PurchaseRequestEvent[]};if(parsed.requests)setRequests(parsed.requests);if(parsed.events)setEvents(parsed.events);}}catch{window.localStorage.removeItem(STORAGE_KEY);}finally{setError(undefined);setReady(true);}},0);return()=>window.clearTimeout(timer);
  },[backend.error,backend.status,refreshPurchaseRequests,remoteMode]);
  useEffect(()=>{if(!ready||remoteMode)return;window.localStorage.setItem(STORAGE_KEY,JSON.stringify({requests,events}));},[requests,events,ready,remoteMode]);

  const transition=useCallback(async(requestId:string,to:PurchaseRequestStatus,actor:string,note?:string):Promise<Result>=>{
    const request=requests.find((item)=>item.id===requestId);if(!request)return {ok:false,error:"Solicitud no encontrada."};const validation=validateTransition({from:request.status,to,actor,note});if(!validation.ok)return validation;
    if(remoteMode){if(to!=="approved"&&to!=="rejected")return {ok:false,error:"Transición remota no soportada."};try{await decideRemotePurchaseRequest(requestId,to,actor,note);await hydrateRemote();return {ok:true,id:requestId};}catch(caught){return failure(caught,"No fue posible actualizar la solicitud.");}}
    const at=new Date().toISOString();setRequests((current)=>current.map((item)=>item.id===requestId?{...item,status:to}:item));setEvents((current)=>[{id:crypto.randomUUID(),requestId,kind:to,actor:actor.trim(),at,note:note?.trim()||undefined},...current]);return {ok:true,id:requestId};
  },[hydrateRemote,remoteMode,requests]);

  const value=useMemo<PurchaseRequestStore>(()=>({
    requests,events,ready,error,refreshPurchaseRequests,
    async submitRequest(payload){const validation=validatePurchaseRequest(payload);if(!validation.ok)return validation;if(remoteMode){try{const id=await submitRemotePurchaseRequest(access,payload);await hydrateRemote();return {ok:true,id};}catch(caught){return failure(caught,"No fue posible enviar la solicitud.");}}
      const id=crypto.randomUUID();const requestedAt=new Date().toISOString();const record:PurchaseRequestRecord={id,plantId:payload.plantId,plant:plantName(payload.plantId),requestedBy:payload.requestedBy.trim(),requestedAt,neededBy:payload.neededBy||undefined,category:payload.category,concept:payload.concept.trim(),justification:payload.justification.trim(),estimatedAmountCop:payload.estimatedAmountCop,suggestedSupplier:payload.suggestedSupplier?.trim()||undefined,equipmentId:payload.equipmentId||undefined,equipmentName:payload.equipmentName?.trim()||undefined,processRef:payload.processRef?.trim()||undefined,evidenceRef:payload.evidenceRef?.trim()||undefined,status:"submitted"};setRequests((current)=>[record,...current]);setEvents((current)=>[{id:crypto.randomUUID(),requestId:id,kind:"submitted",actor:record.requestedBy,at:requestedAt,note:record.justification},...current]);return {ok:true,id};
    },
    approveRequest(requestId,actor,note){return transition(requestId,"approved",actor,note);},
    rejectRequest(requestId,actor,reason){return transition(requestId,"rejected",actor,reason);},
    async fulfillRequest(payload){const request=requests.find((item)=>item.id===payload.requestId);if(!request)return {ok:false,error:"Solicitud no encontrada."};const transitionValidation=validateTransition({from:request.status,to:"fulfilled",actor:payload.actor,note:payload.note});if(!transitionValidation.ok)return transitionValidation;if(!payload.supplierName.trim())return {ok:false,error:"Indica el proveedor real."};if(!Number.isFinite(payload.actualAmountCop)||payload.actualAmountCop<=0)return {ok:false,error:"El monto real debe ser mayor que cero."};
      if(remoteMode){try{const id=await fulfillRemotePurchaseRequest(payload);const refreshErrors:string[]=[];try{await hydrateRemote();}catch(caught){refreshErrors.push(caught instanceof Error?caught.message:"solicitudes");}try{await refreshExpenses();}catch(caught){refreshErrors.push(caught instanceof Error?caught.message:"compras/gastos");}if(refreshErrors.length)setError(`La compra se guardó, pero no fue posible refrescar toda la vista: ${refreshErrors.join(" · ")}`);return {ok:true,id};}catch(caught){return failure(caught,"No fue posible registrar la compra real.");}}
      const expenseResult=await recordExpense({plantId:request.plantId,recordType:"purchase",supplierName:payload.supplierName,category:request.category,concept:request.concept,amountCop:payload.actualAmountCop,documentDate:payload.documentDate,documentRef:payload.documentRef,equipmentId:request.equipmentId,equipmentName:request.equipmentName,processRef:request.processRef,evidenceRef:request.evidenceRef,purchaseRequestId:request.id,note:payload.note?.trim()||`Compra originada en solicitud ${request.id.slice(0,8)}.`});if(!expenseResult.ok)return expenseResult;const at=new Date().toISOString();setRequests((current)=>current.map((item)=>item.id===request.id?{...item,status:"fulfilled",expenseId:expenseResult.id}:item));setEvents((current)=>[{id:crypto.randomUUID(),requestId:request.id,kind:"fulfilled",actor:payload.actor.trim(),at,note:payload.note?.trim()||undefined,expenseId:expenseResult.id,actualAmountCop:payload.actualAmountCop},...current]);return {ok:true,id:expenseResult.id};
    },
  }),[access,error,events,hydrateRemote,ready,recordExpense,refreshExpenses,refreshPurchaseRequests,remoteMode,requests,transition]);

  return <PurchaseRequestContext.Provider value={value}>{children}</PurchaseRequestContext.Provider>;
}
export function usePurchaseRequestStore(){const context=useContext(PurchaseRequestContext);if(!context)throw new Error("usePurchaseRequestStore debe usarse dentro de PurchaseRequestStoreProvider");return context;}
