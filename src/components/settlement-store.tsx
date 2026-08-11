"use client";

import { createContext,useContext,useEffect,useMemo,useState,type ReactNode } from "react";
import { useCommercialStore } from "@/components/commercial-store";
import { useExpenseStore } from "@/components/expense-store";
import { remainingAmount,settledAmount,validateSettlement,type SettlementMethod,type SettlementRecord } from "@/lib/settlement-domain";

const STORAGE_KEY="greenatics-ops-settlements-mvp-013";
type Result={ok:true;id:string}|{ok:false;error:string};
type Input={sourceId:string;amountCop:number;occurredOn:string;method:SettlementMethod;reference?:string;note?:string};
type SettlementStore={settlements:SettlementRecord[];ready:boolean;recordCollection:(input:Input)=>Result;recordPayment:(input:Input)=>Result};
const SettlementContext=createContext<SettlementStore|null>(null);

export function SettlementStoreProvider({children}:{children:ReactNode}){
  const {sales}=useCommercialStore();
  const {expenses}=useExpenseStore();
  const [settlements,setSettlements]=useState<SettlementRecord[]>([]);
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      try{const raw=window.localStorage.getItem(STORAGE_KEY);if(raw)setSettlements((JSON.parse(raw) as {settlements?:SettlementRecord[]}).settlements??[]);}catch{window.localStorage.removeItem(STORAGE_KEY);}finally{setReady(true);}
    },0);
    return()=>window.clearTimeout(timer);
  },[]);
  useEffect(()=>{if(ready)window.localStorage.setItem(STORAGE_KEY,JSON.stringify({settlements}));},[settlements,ready]);

  const value=useMemo<SettlementStore>(()=>({settlements,ready,
    recordCollection(input){
      const sale=sales.find((item)=>item.id===input.sourceId);
      if(!sale)return {ok:false,error:"Venta no encontrada."};
      const already=settledAmount(settlements,"collection",sale.id);
      const validation=validateSettlement({amountCop:input.amountCop,remainingCop:remainingAmount(sale.totalCop,already),occurredOn:input.occurredOn});
      if(!validation.ok)return validation;
      const id=crypto.randomUUID();
      setSettlements((current)=>[{id,kind:"collection",sourceType:"sale",sourceId:sale.id,plantId:sale.plantId,plant:sale.plant,counterparty:sale.customerName,amountCop:input.amountCop,occurredOn:input.occurredOn,method:input.method,reference:input.reference?.trim()||undefined,note:input.note?.trim()||undefined,recordedAt:new Date().toISOString()},...current]);
      return {ok:true,id};
    },
    recordPayment(input){
      const expense=expenses.find((item)=>item.id===input.sourceId);
      if(!expense)return {ok:false,error:"Compra/gasto no encontrado."};
      const already=settledAmount(settlements,"payment",expense.id);
      const validation=validateSettlement({amountCop:input.amountCop,remainingCop:remainingAmount(expense.amountCop,already),occurredOn:input.occurredOn});
      if(!validation.ok)return validation;
      const id=crypto.randomUUID();
      setSettlements((current)=>[{id,kind:"payment",sourceType:"expense",sourceId:expense.id,plantId:expense.plantId,plant:expense.plant,counterparty:expense.supplierName,amountCop:input.amountCop,occurredOn:input.occurredOn,method:input.method,reference:input.reference?.trim()||undefined,note:input.note?.trim()||undefined,recordedAt:new Date().toISOString()},...current]);
      return {ok:true,id};
    }
  }),[settlements,ready,sales,expenses]);
  return <SettlementContext.Provider value={value}>{children}</SettlementContext.Provider>;
}

export function useSettlementStore(){const context=useContext(SettlementContext);if(!context)throw new Error("useSettlementStore debe usarse dentro de SettlementStoreProvider");return context;}
