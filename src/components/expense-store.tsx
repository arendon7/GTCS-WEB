"use client";

import { createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode } from "react";
import { useOpsStore } from "@/components/ops-store";
import { normalizeSupplierKey,supplierIdFromKey,validateOperationalExpense,type NewOperationalExpense,type OperationalExpenseRecord,type SupplierRecord } from "@/lib/expense-domain";
import { loadRemoteExpenses,recordRemoteExpense } from "@/lib/supabase/finance-repository";

const STORAGE_KEY="greenatics-ops-expenses-mvp-010";
type ExpenseResult={ok:true;id:string;supplierId:string}|{ok:false;error:string};
type ExpenseStore={suppliers:SupplierRecord[];expenses:OperationalExpenseRecord[];ready:boolean;error?:string;recordExpense:(payload:NewOperationalExpense)=>Promise<ExpenseResult>;refreshExpenses:()=>Promise<void>};
const ExpenseContext=createContext<ExpenseStore|null>(null);
function plantName(plantId:string){return plantId==="yarumal"?"Yarumal":"Támesis";}
function failure(error:unknown,fallback:string):{ok:false;error:string}{return {ok:false,error:error instanceof Error?error.message:fallback};}

export function ExpenseStoreProvider({children}:{children:ReactNode}){
  const {backend,access}=useOpsStore();
  const remoteMode=backend.mode==="supabase";
  const [suppliers,setSuppliers]=useState<SupplierRecord[]>([]);
  const [expenses,setExpenses]=useState<OperationalExpenseRecord[]>([]);
  const [ready,setReady]=useState(false);
  const [error,setError]=useState<string>();

  const hydrateRemote=useCallback(async()=>{
    if(backend.status!=="ready")return;
    const snapshot=await loadRemoteExpenses(access);
    setSuppliers(snapshot.suppliers);setExpenses(snapshot.expenses);setError(undefined);setReady(true);
  },[access,backend.status]);

  const refreshExpenses=useCallback(async()=>{
    if(!remoteMode)return;
    setReady(false);
    try{await hydrateRemote();}
    catch(caught){setSuppliers([]);setExpenses([]);setError(caught instanceof Error?caught.message:"No fue posible cargar compras/gastos remotos.");setReady(true);throw caught;}
  },[hydrateRemote,remoteMode]);

  useEffect(()=>{
    if(remoteMode){
      if(backend.status!=="ready"){
        const timer=window.setTimeout(()=>{setSuppliers([]);setExpenses([]);setError(backend.status==="error"?backend.error:undefined);setReady(backend.status==="error");},0);
        return()=>window.clearTimeout(timer);
      }
      const timer=window.setTimeout(()=>{void refreshExpenses().catch(()=>undefined);},0);
      return()=>window.clearTimeout(timer);
    }
    const timer=window.setTimeout(()=>{
      try{const raw=window.localStorage.getItem(STORAGE_KEY);if(raw){const parsed=JSON.parse(raw) as {suppliers?:SupplierRecord[];expenses?:OperationalExpenseRecord[]};if(parsed.suppliers)setSuppliers(parsed.suppliers);if(parsed.expenses)setExpenses(parsed.expenses);}}
      catch{window.localStorage.removeItem(STORAGE_KEY);}finally{setError(undefined);setReady(true);}
    },0);
    return()=>window.clearTimeout(timer);
  },[backend.error,backend.status,refreshExpenses,remoteMode]);

  useEffect(()=>{if(!ready||remoteMode)return;window.localStorage.setItem(STORAGE_KEY,JSON.stringify({suppliers,expenses}));},[suppliers,expenses,ready,remoteMode]);

  const value=useMemo<ExpenseStore>(()=>({
    suppliers,expenses,ready,error,refreshExpenses,
    async recordExpense(payload){
      const validation=validateOperationalExpense(payload);if(!validation.ok)return validation;
      if(payload.purchaseRequestId&&expenses.some((item)=>item.purchaseRequestId===payload.purchaseRequestId))return {ok:false,error:"Esta solicitud de compra ya tiene un gasto real vinculado."};
      if(remoteMode){
        if(payload.purchaseRequestId)return {ok:false,error:"Una solicitud aprobada debe convertirse mediante su flujo de cumplimiento remoto."};
        try{const result=await recordRemoteExpense(access,payload);try{await hydrateRemote();}catch(caught){setError(`La compra/gasto se guardó, pero no fue posible refrescar la vista: ${caught instanceof Error?caught.message:"error remoto"}`);}return {ok:true,...result};}
        catch(caught){return failure(caught,"No fue posible registrar la compra/gasto.");}
      }

      const normalizedKey=normalizeSupplierKey(payload.supplierName);const existing=suppliers.find((item)=>item.normalizedKey===normalizedKey);
      const supplier:SupplierRecord=existing??{id:supplierIdFromKey(normalizedKey),name:payload.supplierName.trim().replace(/\s+/g," "),normalizedKey,createdAt:new Date().toISOString()};
      const id=crypto.randomUUID();
      const record:OperationalExpenseRecord={id,plantId:payload.plantId,plant:plantName(payload.plantId),recordType:payload.recordType,supplierId:supplier.id,supplierName:supplier.name,category:payload.category,concept:payload.concept.trim(),amountCop:payload.amountCop,documentDate:payload.documentDate,documentRef:payload.documentRef?.trim()||undefined,equipmentId:payload.equipmentId||undefined,equipmentName:payload.equipmentName?.trim()||undefined,processRef:payload.processRef?.trim()||undefined,evidenceRef:payload.evidenceRef?.trim()||undefined,purchaseRequestId:payload.purchaseRequestId||undefined,note:payload.note?.trim()||undefined,recordedAt:new Date().toISOString()};
      if(!existing)setSuppliers((current)=>[supplier,...current]);setExpenses((current)=>[record,...current]);return {ok:true,id,supplierId:supplier.id};
    },
  }),[access,error,expenses,hydrateRemote,ready,refreshExpenses,remoteMode,suppliers]);

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}
export function useExpenseStore(){const context=useContext(ExpenseContext);if(!context)throw new Error("useExpenseStore debe usarse dentro de ExpenseStoreProvider");return context;}
