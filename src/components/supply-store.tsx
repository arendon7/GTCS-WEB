"use client";

import { createContext,useContext,useEffect,useMemo,useState,type ReactNode } from "react";
import { useExpenseStore } from "@/components/expense-store";
import { aggregateSupplyStocks,normalizeSupplyKey,supplyIdFromKey,supplyLotStocks,supplyStockForLot,validateSupplyReceipt,type SupplyCategory,type SupplyMaster,type SupplyMovement,type SupplyReceipt } from "@/lib/supply-domain";
import type { InventoryUnit } from "@/lib/inventory-domain";

const STORAGE_KEY="greenatics-ops-supplies-mvp-014";
type Result={ok:true;id:string;lotCode?:string}|{ok:false;error:string};
type ReceiptInput={plantId:string;supplyName:string;category:SupplyCategory;unit:InventoryUnit;quantity:number;receivedOn:string;supplierName?:string;expenseId?:string;documentRef?:string;evidenceRef?:string;note?:string};
type ConsumptionInput={plantId:string;supplyId:string;lotCode:string;quantity:number;occurredOn:string;destination:string;equipmentId?:string;processRef?:string;note?:string};
type Store={supplies:SupplyMaster[];receipts:SupplyReceipt[];movements:SupplyMovement[];stocks:ReturnType<typeof aggregateSupplyStocks>;lots:ReturnType<typeof supplyLotStocks>;ready:boolean;receiveSupply:(input:ReceiptInput)=>Result;consumeSupply:(input:ConsumptionInput)=>Result};
const Context=createContext<Store|null>(null);
function plantName(id:string){return id==="yarumal"?"Yarumal":"Támesis";}
function compactDate(value:string){return value.replaceAll("-","");}
function lotCode(receipts:SupplyReceipt[],plantId:string,receivedOn:string){const prefix=plantId==="yarumal"?"YAR":"TAM";const sequence=receipts.filter((r)=>r.plantId===plantId&&r.receivedOn===receivedOn).length+1;return `${prefix}-SUP-${compactDate(receivedOn)}-${String(sequence).padStart(3,"0")}`;}

export function SupplyStoreProvider({children}:{children:ReactNode}){
  const {expenses}=useExpenseStore();
  const [supplies,setSupplies]=useState<SupplyMaster[]>([]);
  const [receipts,setReceipts]=useState<SupplyReceipt[]>([]);
  const [movements,setMovements]=useState<SupplyMovement[]>([]);
  const [ready,setReady]=useState(false);
  useEffect(()=>{const timer=window.setTimeout(()=>{try{const raw=window.localStorage.getItem(STORAGE_KEY);if(raw){const parsed=JSON.parse(raw) as {supplies?:SupplyMaster[];receipts?:SupplyReceipt[];movements?:SupplyMovement[]};setSupplies(parsed.supplies??[]);setReceipts(parsed.receipts??[]);setMovements(parsed.movements??[]);}}catch{window.localStorage.removeItem(STORAGE_KEY);}finally{setReady(true);}},0);return()=>window.clearTimeout(timer);},[]);
  useEffect(()=>{if(ready)window.localStorage.setItem(STORAGE_KEY,JSON.stringify({supplies,receipts,movements}));},[supplies,receipts,movements,ready]);
  const stocks=useMemo(()=>aggregateSupplyStocks(movements),[movements]);
  const lots=useMemo(()=>supplyLotStocks(movements),[movements]);
  const value=useMemo<Store>(()=>({supplies,receipts,movements,stocks,lots,ready,
    receiveSupply(input){
      const validation=validateSupplyReceipt({name:input.supplyName,quantity:input.quantity,receivedOn:input.receivedOn});if(!validation.ok)return validation;
      if(input.expenseId&&!expenses.some((e)=>e.id===input.expenseId))return {ok:false,error:"La compra/gasto enlazado no existe."};
      const key=normalizeSupplyKey(input.supplyName);const existing=supplies.find((s)=>s.normalizedKey===key&&s.unit===input.unit);
      if(existing&&(existing.category!==input.category))return {ok:false,error:"El insumo ya existe con otra categoría; revisa el maestro antes de recibir."};
      const supply:SupplyMaster=existing??{id:supplyIdFromKey(`${key}-${input.unit.toLocaleLowerCase("es-CO")}`),name:input.supplyName.trim().replace(/\s+/g," "),normalizedKey:key,category:input.category,unit:input.unit,active:true,createdAt:new Date().toISOString()};
      const id=crypto.randomUUID();const code=lotCode(receipts,input.plantId,input.receivedOn);const plant=plantName(input.plantId);const recordedAt=new Date().toISOString();
      const receipt:SupplyReceipt={id,plantId:input.plantId,plant,supplyId:supply.id,supplyName:supply.name,category:supply.category,unit:supply.unit,quantity:input.quantity,lotCode:code,receivedOn:input.receivedOn,supplierName:input.supplierName?.trim()||undefined,expenseId:input.expenseId||undefined,documentRef:input.documentRef?.trim()||undefined,evidenceRef:input.evidenceRef?.trim()||undefined,note:input.note?.trim()||undefined,recordedAt};
      const movement:SupplyMovement={id:crypto.randomUUID(),plantId:input.plantId,plant,supplyId:supply.id,supplyName:supply.name,category:supply.category,unit:supply.unit,lotCode:code,kind:"receipt",quantity:input.quantity,occurredOn:input.receivedOn,referenceId:id,note:input.note?.trim()||undefined,recordedAt};
      if(!existing)setSupplies((current)=>[supply,...current]);setReceipts((current)=>[receipt,...current]);setMovements((current)=>[movement,...current]);return {ok:true,id,lotCode:code};
    },
    consumeSupply(input){
      const supply=supplies.find((s)=>s.id===input.supplyId&&s.active);if(!supply)return {ok:false,error:"Insumo no encontrado."};
      if(!Number.isFinite(input.quantity)||input.quantity<=0)return {ok:false,error:"La cantidad consumida debe ser mayor que cero."};
      if(!input.destination.trim())return {ok:false,error:"Indica el destino o uso del consumo."};
      const available=supplyStockForLot(movements,input.plantId,input.supplyId,input.lotCode);if(input.quantity>available+1e-9)return {ok:false,error:`Stock insuficiente en ${input.lotCode}. Disponible: ${available.toLocaleString("es-CO")} ${supply.unit}.`};
      const id=crypto.randomUUID();setMovements((current)=>[{id,plantId:input.plantId,plant:plantName(input.plantId),supplyId:supply.id,supplyName:supply.name,category:supply.category,unit:supply.unit,lotCode:input.lotCode,kind:"consumption",quantity:input.quantity,occurredOn:input.occurredOn,destination:input.destination.trim(),equipmentId:input.equipmentId||undefined,processRef:input.processRef?.trim()||undefined,note:input.note?.trim()||undefined,recordedAt:new Date().toISOString()},...current]);return {ok:true,id};
    }
  }),[supplies,receipts,movements,stocks,lots,ready,expenses]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSupplyStore(){const context=useContext(Context);if(!context)throw new Error("useSupplyStore debe usarse dentro de SupplyStoreProvider");return context;}
