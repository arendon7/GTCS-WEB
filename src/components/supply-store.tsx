"use client";

import { createContext,useCallback,useContext,useEffect,useMemo,useState,type ReactNode } from "react";
import { useExpenseStore } from "@/components/expense-store";
import { useOpsStore } from "@/components/ops-store";
import { aggregateSupplyStocks,normalizeSupplyKey,supplyIdFromKey,supplyLotStocks,supplyStockForLot,validateSupplyConsumption,validateSupplyReceipt,type SupplyCategory,type SupplyMaster,type SupplyMovement,type SupplyReceipt } from "@/lib/supply-domain";
import type { InventoryUnit } from "@/lib/inventory-domain";
import { consumeRemoteSupply,loadRemoteSupplies,recordRemoteSupplyReceipt } from "@/lib/supabase/supply-repository";

const STORAGE_KEY="greenatics-ops-supplies-mvp-014";
type Result={ok:true;id:string;lotCode?:string}|{ok:false;error:string};
type ReceiptInput={plantId:string;supplyName:string;category:SupplyCategory;unit:InventoryUnit;quantity:number;receivedOn:string;supplierName?:string;expenseId?:string;documentRef?:string;evidenceRef?:string;note?:string};
type ConsumptionInput={plantId:string;supplyId:string;lotCode:string;quantity:number;occurredOn:string;destination:string;equipmentId?:string;processRef?:string;note?:string};
type Store={supplies:SupplyMaster[];receipts:SupplyReceipt[];movements:SupplyMovement[];stocks:ReturnType<typeof aggregateSupplyStocks>;lots:ReturnType<typeof supplyLotStocks>;ready:boolean;error?:string;receiveSupply:(input:ReceiptInput)=>Promise<Result>;consumeSupply:(input:ConsumptionInput)=>Promise<Result>;refreshSupplies:()=>Promise<void>};
const Context=createContext<Store|null>(null);
function plantName(id:string){return id==="yarumal"?"Yarumal":"Támesis";}
function compactDate(value:string){return value.replaceAll("-","");}
function lotCode(receipts:SupplyReceipt[],plantId:string,receivedOn:string){const prefix=plantId==="yarumal"?"YAR":"TAM";const sequence=receipts.filter((r)=>r.plantId===plantId&&r.receivedOn===receivedOn).length+1;return `${prefix}-SUP-${compactDate(receivedOn)}-${String(sequence).padStart(3,"0")}`;}
function failure(error:unknown,fallback:string):{ok:false;error:string}{return {ok:false,error:error instanceof Error?error.message:fallback};}

export function SupplyStoreProvider({children}:{children:ReactNode}){
  const {backend,access}=useOpsStore();const {expenses}=useExpenseStore();const remoteMode=backend.mode==="supabase";
  const [supplies,setSupplies]=useState<SupplyMaster[]>([]);const [receipts,setReceipts]=useState<SupplyReceipt[]>([]);const [movements,setMovements]=useState<SupplyMovement[]>([]);const [ready,setReady]=useState(false);const [error,setError]=useState<string>();

  const hydrateRemote=useCallback(async()=>{if(backend.status!=="ready")return;const snapshot=await loadRemoteSupplies(access);setSupplies(snapshot.supplies);setReceipts(snapshot.receipts);setMovements(snapshot.movements);setError(undefined);setReady(true);},[access,backend.status]);
  const refreshSupplies=useCallback(async()=>{if(!remoteMode)return;setReady(false);try{await hydrateRemote();}catch(caught){setSupplies([]);setReceipts([]);setMovements([]);setError(caught instanceof Error?caught.message:"No fue posible cargar insumos remotos.");setReady(true);throw caught;}},[hydrateRemote,remoteMode]);

  useEffect(()=>{
    if(remoteMode){if(backend.status!=="ready"){const timer=window.setTimeout(()=>{setSupplies([]);setReceipts([]);setMovements([]);setError(backend.status==="error"?backend.error:undefined);setReady(backend.status==="error");},0);return()=>window.clearTimeout(timer);}const timer=window.setTimeout(()=>{void refreshSupplies().catch(()=>undefined);},0);return()=>window.clearTimeout(timer);}
    const timer=window.setTimeout(()=>{try{const raw=window.localStorage.getItem(STORAGE_KEY);if(raw){const parsed=JSON.parse(raw) as {supplies?:SupplyMaster[];receipts?:SupplyReceipt[];movements?:SupplyMovement[]};setSupplies(parsed.supplies??[]);setReceipts(parsed.receipts??[]);setMovements(parsed.movements??[]);}}catch{window.localStorage.removeItem(STORAGE_KEY);}finally{setError(undefined);setReady(true);}},0);return()=>window.clearTimeout(timer);
  },[backend.error,backend.status,refreshSupplies,remoteMode]);
  useEffect(()=>{if(ready&&!remoteMode)window.localStorage.setItem(STORAGE_KEY,JSON.stringify({supplies,receipts,movements}));},[supplies,receipts,movements,ready,remoteMode]);
  const stocks=useMemo(()=>aggregateSupplyStocks(movements),[movements]);const lots=useMemo(()=>supplyLotStocks(movements),[movements]);

  const value=useMemo<Store>(()=>({supplies,receipts,movements,stocks,lots,ready,error,refreshSupplies,
    async receiveSupply(input){
      const validation=validateSupplyReceipt({name:input.supplyName,quantity:input.quantity,receivedOn:input.receivedOn});if(!validation.ok)return validation;
      const linkedExpense=input.expenseId?expenses.find((e)=>e.id===input.expenseId):undefined;if(input.expenseId&&!linkedExpense)return {ok:false,error:"La compra/gasto enlazado no existe."};if(linkedExpense&&linkedExpense.plantId!==input.plantId)return {ok:false,error:"La compra/gasto pertenece a otra planta."};if(linkedExpense&&linkedExpense.recordType!=="purchase")return {ok:false,error:"Solo una compra real puede enlazarse a recepción física."};
      if(remoteMode){try{const result=await recordRemoteSupplyReceipt(access,input);try{await hydrateRemote();}catch(caught){setError(`La recepción física se guardó, pero no fue posible refrescar la vista: ${caught instanceof Error?caught.message:"error remoto"}`);}return {ok:true,...result};}catch(caught){return failure(caught,"No fue posible registrar la recepción física.");}}
      const key=normalizeSupplyKey(input.supplyName);const existing=supplies.find((s)=>s.normalizedKey===key&&s.unit===input.unit);if(existing&&existing.category!==input.category)return {ok:false,error:"El insumo ya existe con otra categoría; revisa el maestro antes de recibir."};const supply:SupplyMaster=existing??{id:supplyIdFromKey(`${key}-${input.unit.toLocaleLowerCase("es-CO")}`),name:input.supplyName.trim().replace(/\s+/g," "),normalizedKey:key,category:input.category,unit:input.unit,active:true,createdAt:new Date().toISOString()};const id=crypto.randomUUID();const code=lotCode(receipts,input.plantId,input.receivedOn);const plant=plantName(input.plantId);const recordedAt=new Date().toISOString();const receipt:SupplyReceipt={id,plantId:input.plantId,plant,supplyId:supply.id,supplyName:supply.name,category:supply.category,unit:supply.unit,quantity:input.quantity,lotCode:code,receivedOn:input.receivedOn,supplierName:input.supplierName?.trim()||undefined,expenseId:input.expenseId||undefined,documentRef:input.documentRef?.trim()||undefined,evidenceRef:input.evidenceRef?.trim()||undefined,note:input.note?.trim()||undefined,recordedAt};const movement:SupplyMovement={id:crypto.randomUUID(),plantId:input.plantId,plant,supplyId:supply.id,supplyName:supply.name,category:supply.category,unit:supply.unit,lotCode:code,kind:"receipt",quantity:input.quantity,occurredOn:input.receivedOn,referenceId:id,note:input.note?.trim()||undefined,recordedAt};if(!existing)setSupplies((current)=>[supply,...current]);setReceipts((current)=>[receipt,...current]);setMovements((current)=>[movement,...current]);return {ok:true,id,lotCode:code};
    },
    async consumeSupply(input){
      const supply=supplies.find((s)=>s.id===input.supplyId&&s.active);if(!supply)return {ok:false,error:"Insumo no encontrado."};const validation=validateSupplyConsumption({quantity:input.quantity,occurredOn:input.occurredOn,destination:input.destination});if(!validation.ok)return validation;const available=supplyStockForLot(movements,input.plantId,input.supplyId,input.lotCode);if(input.quantity>available+1e-9)return {ok:false,error:`Stock insuficiente en ${input.lotCode}. Disponible: ${available.toLocaleString("es-CO")} ${supply.unit}.`};
      if(remoteMode){try{const id=await consumeRemoteSupply(access,input);try{await hydrateRemote();}catch(caught){setError(`El consumo físico se guardó, pero no fue posible refrescar la vista: ${caught instanceof Error?caught.message:"error remoto"}`);}return {ok:true,id};}catch(caught){return failure(caught,"No fue posible registrar el consumo físico.");}}
      const id=crypto.randomUUID();setMovements((current)=>[{id,plantId:input.plantId,plant:plantName(input.plantId),supplyId:supply.id,supplyName:supply.name,category:supply.category,unit:supply.unit,lotCode:input.lotCode,kind:"consumption",quantity:input.quantity,occurredOn:input.occurredOn,destination:input.destination.trim(),equipmentId:input.equipmentId||undefined,processRef:input.processRef?.trim()||undefined,note:input.note?.trim()||undefined,recordedAt:new Date().toISOString()},...current]);return {ok:true,id};
    }
  }),[access,error,expenses,hydrateRemote,lots,movements,ready,receipts,refreshSupplies,remoteMode,stocks,supplies]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSupplyStore(){const context=useContext(Context);if(!context)throw new Error("useSupplyStore debe usarse dentro de SupplyStoreProvider");return context;}
