"use client";

import { createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode } from "react";
import { useCommercialStore } from "@/components/commercial-store";
import { useExpenseStore } from "@/components/expense-store";
import { useOpsStore } from "@/components/ops-store";
import { remainingAmount,settledAmount,validateSettlement,type SettlementMethod,type SettlementRecord } from "@/lib/settlement-domain";
import { loadRemoteSettlements,recordRemoteCollection,recordRemotePayment } from "@/lib/supabase/settlement-repository";

const STORAGE_KEY="greenatics-ops-settlements-mvp-013";
type Result={ok:true;id:string}|{ok:false;error:string};
type Input={sourceId:string;amountCop:number;occurredOn:string;method:SettlementMethod;reference?:string;note?:string};
type SettlementStore={settlements:SettlementRecord[];ready:boolean;error?:string;recordCollection:(input:Input)=>Promise<Result>;recordPayment:(input:Input)=>Promise<Result>;refreshSettlements:()=>Promise<void>};
const SettlementContext=createContext<SettlementStore|null>(null);
function failure(error:unknown,fallback:string):{ok:false;error:string}{return {ok:false,error:error instanceof Error?error.message:fallback};}

export function SettlementStoreProvider({children}:{children:ReactNode}){
  const {backend,access}=useOpsStore();const {sales}=useCommercialStore();const {expenses}=useExpenseStore();const remoteMode=backend.mode==="supabase";
  const [settlements,setSettlements]=useState<SettlementRecord[]>([]);const [ready,setReady]=useState(false);const [error,setError]=useState<string>();
  const hydrateRemote=useCallback(async()=>{if(backend.status!=="ready")return;const rows=await loadRemoteSettlements(access);setSettlements(rows);setError(undefined);setReady(true);},[access,backend.status]);
  const refreshSettlements=useCallback(async()=>{if(!remoteMode)return;setReady(false);try{await hydrateRemote();}catch(caught){setSettlements([]);setError(caught instanceof Error?caught.message:"No fue posible cargar recaudos/pagos remotos.");setReady(true);throw caught;}},[hydrateRemote,remoteMode]);

  useEffect(()=>{
    if(remoteMode){if(backend.status!=="ready"){const timer=window.setTimeout(()=>{setSettlements([]);setError(backend.status==="error"?backend.error:undefined);setReady(backend.status==="error");},0);return()=>window.clearTimeout(timer);}const timer=window.setTimeout(()=>{void refreshSettlements().catch(()=>undefined);},0);return()=>window.clearTimeout(timer);}
    const timer=window.setTimeout(()=>{try{const raw=window.localStorage.getItem(STORAGE_KEY);if(raw)setSettlements((JSON.parse(raw) as {settlements?:SettlementRecord[]}).settlements??[]);}catch{window.localStorage.removeItem(STORAGE_KEY);}finally{setError(undefined);setReady(true);}},0);return()=>window.clearTimeout(timer);
  },[backend.error,backend.status,refreshSettlements,remoteMode]);
  useEffect(()=>{if(ready&&!remoteMode)window.localStorage.setItem(STORAGE_KEY,JSON.stringify({settlements}));},[settlements,ready,remoteMode]);

  const value=useMemo<SettlementStore>(()=>({settlements,ready,error,refreshSettlements,
    async recordCollection(input){const sale=sales.find((item)=>item.id===input.sourceId);if(!sale)return {ok:false,error:"Venta no encontrada."};const already=settledAmount(settlements,"collection",sale.id);const validation=validateSettlement({amountCop:input.amountCop,remainingCop:remainingAmount(sale.totalCop,already),occurredOn:input.occurredOn});if(!validation.ok)return validation;
      if(remoteMode){try{const id=await recordRemoteCollection(input);try{await hydrateRemote();}catch(caught){setError(`El recaudo se guardó, pero no fue posible refrescar la vista: ${caught instanceof Error?caught.message:"error remoto"}`);}return {ok:true,id};}catch(caught){return failure(caught,"No fue posible registrar el recaudo.");}}
      const id=crypto.randomUUID();setSettlements((current)=>[{id,kind:"collection",sourceType:"sale",sourceId:sale.id,plantId:sale.plantId,plant:sale.plant,counterparty:sale.customerName,amountCop:input.amountCop,occurredOn:input.occurredOn,method:input.method,reference:input.reference?.trim()||undefined,note:input.note?.trim()||undefined,recordedAt:new Date().toISOString()},...current]);return {ok:true,id};
    },
    async recordPayment(input){const expense=expenses.find((item)=>item.id===input.sourceId);if(!expense)return {ok:false,error:"Compra/gasto no encontrado."};const already=settledAmount(settlements,"payment",expense.id);const validation=validateSettlement({amountCop:input.amountCop,remainingCop:remainingAmount(expense.amountCop,already),occurredOn:input.occurredOn});if(!validation.ok)return validation;
      if(remoteMode){try{const id=await recordRemotePayment(input);try{await hydrateRemote();}catch(caught){setError(`El pago se guardó, pero no fue posible refrescar la vista: ${caught instanceof Error?caught.message:"error remoto"}`);}return {ok:true,id};}catch(caught){return failure(caught,"No fue posible registrar el pago.");}}
      const id=crypto.randomUUID();setSettlements((current)=>[{id,kind:"payment",sourceType:"expense",sourceId:expense.id,plantId:expense.plantId,plant:expense.plant,counterparty:expense.supplierName,amountCop:input.amountCop,occurredOn:input.occurredOn,method:input.method,reference:input.reference?.trim()||undefined,note:input.note?.trim()||undefined,recordedAt:new Date().toISOString()},...current]);return {ok:true,id};
    }
  }),[error,expenses,hydrateRemote,ready,refreshSettlements,remoteMode,sales,settlements]);
  return <SettlementContext.Provider value={value}>{children}</SettlementContext.Provider>;
}
export function useSettlementStore(){const context=useContext(SettlementContext);if(!context)throw new Error("useSettlementStore debe usarse dentro de SettlementStoreProvider");return context;}
