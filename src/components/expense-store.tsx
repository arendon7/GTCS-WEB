"use client";

import { createContext,useContext,useEffect,useMemo,useState,type ReactNode } from "react";
import { normalizeSupplierKey,supplierIdFromKey,validateOperationalExpense,type NewOperationalExpense,type OperationalExpenseRecord,type SupplierRecord } from "@/lib/expense-domain";

const STORAGE_KEY="greenatics-ops-expenses-mvp-010";

type ExpenseResult={ok:true;id:string;supplierId:string}|{ok:false;error:string};
type ExpenseStore={
  suppliers:SupplierRecord[];
  expenses:OperationalExpenseRecord[];
  ready:boolean;
  recordExpense:(payload:NewOperationalExpense)=>ExpenseResult;
};

const ExpenseContext=createContext<ExpenseStore|null>(null);

function plantName(plantId:string){return plantId==="yarumal"?"Yarumal":"Támesis";}

export function ExpenseStoreProvider({children}:{children:ReactNode}){
  const [suppliers,setSuppliers]=useState<SupplierRecord[]>([]);
  const [expenses,setExpenses]=useState<OperationalExpenseRecord[]>([]);
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      try{
        const raw=window.localStorage.getItem(STORAGE_KEY);
        if(raw){
          const parsed=JSON.parse(raw) as {suppliers?:SupplierRecord[];expenses?:OperationalExpenseRecord[]};
          if(parsed.suppliers)setSuppliers(parsed.suppliers);
          if(parsed.expenses)setExpenses(parsed.expenses);
        }
      }catch{window.localStorage.removeItem(STORAGE_KEY);}
      finally{setReady(true);}
    },0);
    return()=>window.clearTimeout(timer);
  },[]);

  useEffect(()=>{
    if(!ready)return;
    window.localStorage.setItem(STORAGE_KEY,JSON.stringify({suppliers,expenses}));
  },[suppliers,expenses,ready]);

  const value=useMemo<ExpenseStore>(()=>({
    suppliers,expenses,ready,
    recordExpense(payload){
      const validation=validateOperationalExpense(payload);
      if(!validation.ok)return validation;
      const normalizedKey=normalizeSupplierKey(payload.supplierName);
      const existing=suppliers.find((item)=>item.normalizedKey===normalizedKey);
      const supplier:SupplierRecord=existing??{
        id:supplierIdFromKey(normalizedKey),
        name:payload.supplierName.trim().replace(/\s+/g," "),
        normalizedKey,
        createdAt:new Date().toISOString(),
      };
      const id=crypto.randomUUID();
      const record:OperationalExpenseRecord={
        id,
        plantId:payload.plantId,
        plant:plantName(payload.plantId),
        recordType:payload.recordType,
        supplierId:supplier.id,
        supplierName:supplier.name,
        category:payload.category,
        concept:payload.concept.trim(),
        amountCop:payload.amountCop,
        documentDate:payload.documentDate,
        documentRef:payload.documentRef?.trim()||undefined,
        equipmentId:payload.equipmentId||undefined,
        equipmentName:payload.equipmentName?.trim()||undefined,
        processRef:payload.processRef?.trim()||undefined,
        evidenceRef:payload.evidenceRef?.trim()||undefined,
        note:payload.note?.trim()||undefined,
        recordedAt:new Date().toISOString(),
      };
      if(!existing)setSuppliers((current)=>[supplier,...current]);
      setExpenses((current)=>[record,...current]);
      return {ok:true,id,supplierId:supplier.id};
    },
  }),[suppliers,expenses,ready]);

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenseStore(){
  const context=useContext(ExpenseContext);
  if(!context)throw new Error("useExpenseStore debe usarse dentro de ExpenseStoreProvider");
  return context;
}
