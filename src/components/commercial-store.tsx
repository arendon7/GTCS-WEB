"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useInventoryStore } from "@/components/inventory-store";
import { useOpsStore } from "@/components/ops-store";
import { customerIdFromKey, normalizeCustomerKey, saleTotalCop, type CustomerRecord, type SaleRecord } from "@/lib/commercial-domain";
import { loadRemoteCommercial, recordRemoteSale } from "@/lib/supabase/commercial-repository";

const STORAGE_KEY = "greenatics-ops-sales-mvp-008";

type SaleResult = { ok:true; id:string; movementId:string } | { ok:false; error:string };
type NewSale = { plantId:string; customerName:string; productId:string; lotCode:string; quantity:number; unitPriceCop:number; note?:string };

type CommercialStore = {
  customers: CustomerRecord[];
  sales: SaleRecord[];
  ready:boolean;
  error?:string;
  recordSale:(payload:NewSale)=>Promise<SaleResult>;
  refreshCommercial:()=>Promise<void>;
};

const CommercialContext=createContext<CommercialStore|null>(null);
function plantName(plantId:string){return plantId==="yarumal"?"Yarumal":"Támesis";}
function failure(error:unknown,fallback:string):{ok:false;error:string}{return {ok:false,error:error instanceof Error?error.message:fallback};}

export function CommercialStoreProvider({children}:{children:ReactNode}){
  const {backend,access}=useOpsStore();
  const {products,dispatch,refreshInventory}=useInventoryStore();
  const remoteMode=backend.mode==="supabase";
  const [customers,setCustomers]=useState<CustomerRecord[]>([]);
  const [sales,setSales]=useState<SaleRecord[]>([]);
  const [ready,setReady]=useState(false);
  const [error,setError]=useState<string>();

  const hydrateRemote=useCallback(async()=>{
    if(backend.status!=="ready")return;
    const snapshot=await loadRemoteCommercial(access);
    setCustomers(snapshot.customers);setSales(snapshot.sales);setError(undefined);setReady(true);
  },[access,backend.status]);

  const refreshCommercial=useCallback(async()=>{
    if(!remoteMode)return;
    setReady(false);
    try{await hydrateRemote();}
    catch(caught){setCustomers([]);setSales([]);setError(caught instanceof Error?caught.message:"No fue posible cargar ventas remotas.");setReady(true);throw caught;}
  },[hydrateRemote,remoteMode]);

  useEffect(()=>{
    if(remoteMode){
      if(backend.status!=="ready"){
        const timer=window.setTimeout(()=>{setCustomers([]);setSales([]);setError(backend.status==="error"?backend.error:undefined);setReady(backend.status==="error");},0);
        return()=>window.clearTimeout(timer);
      }
      const timer=window.setTimeout(()=>{void refreshCommercial().catch(()=>undefined);},0);
      return()=>window.clearTimeout(timer);
    }

    const timer=window.setTimeout(()=>{
      try{
        const raw=window.localStorage.getItem(STORAGE_KEY);
        if(raw){const parsed=JSON.parse(raw) as {customers?:CustomerRecord[];sales?:SaleRecord[]};if(parsed.customers)setCustomers(parsed.customers);if(parsed.sales)setSales(parsed.sales);}
      }catch{window.localStorage.removeItem(STORAGE_KEY);}
      finally{setError(undefined);setReady(true);}
    },0);
    return()=>window.clearTimeout(timer);
  },[backend.error,backend.status,refreshCommercial,remoteMode]);

  useEffect(()=>{if(!ready||remoteMode)return;window.localStorage.setItem(STORAGE_KEY,JSON.stringify({customers,sales}));},[customers,sales,ready,remoteMode]);

  const reloadAfterRemoteSale=useCallback(async()=>{
    const errors:string[]=[];
    try{await hydrateRemote();}catch(caught){errors.push(caught instanceof Error?caught.message:"ventas");}
    try{await refreshInventory();}catch(caught){errors.push(caught instanceof Error?caught.message:"inventario");}
    if(errors.length)setError(`La venta se guardó, pero no fue posible refrescar toda la vista: ${errors.join(" · ")}`);
  },[hydrateRemote,refreshInventory]);

  const value=useMemo<CommercialStore>(()=>({
    customers,sales,ready,error,refreshCommercial,
    async recordSale(payload){
      const normalizedKey=normalizeCustomerKey(payload.customerName);
      if(!normalizedKey)return {ok:false,error:"Indica el cliente de la venta."};
      const cleanCustomerName=payload.customerName.trim().replace(/\s+/g," ");
      const product=products.find((item)=>item.id===payload.productId&&item.active);
      if(!product)return {ok:false,error:"Producto no encontrado."};
      if(!payload.lotCode.trim())return {ok:false,error:"Selecciona un lote con stock."};
      if(!Number.isFinite(payload.quantity)||payload.quantity<=0)return {ok:false,error:"La cantidad vendida debe ser mayor que cero."};
      if(!Number.isFinite(payload.unitPriceCop)||payload.unitPriceCop<=0)return {ok:false,error:"El precio unitario debe ser mayor que cero."};

      if(remoteMode){
        try{
          const result=await recordRemoteSale(access,payload);
          await reloadAfterRemoteSale();
          return {ok:true,...result};
        }catch(caught){return failure(caught,"No fue posible registrar la venta.");}
      }

      const existingCustomer=customers.find((item)=>item.normalizedKey===normalizedKey);
      const customer:CustomerRecord=existingCustomer??{id:customerIdFromKey(normalizedKey),name:cleanCustomerName,normalizedKey,createdAt:new Date().toISOString()};
      const saleId=crypto.randomUUID();
      const dispatchResult=await dispatch({plantId:payload.plantId,productId:payload.productId,lotCode:payload.lotCode,quantity:payload.quantity,destination:customer.name,referenceId:saleId,note:payload.note?.trim()||undefined});
      if(!dispatchResult.ok)return dispatchResult;

      const soldAt=new Date().toISOString();
      const sale:SaleRecord={id:saleId,plantId:payload.plantId,plant:plantName(payload.plantId),customerId:customer.id,customerName:customer.name,productId:product.id,productName:product.name,unit:product.unit,lotCode:payload.lotCode,quantity:payload.quantity,unitPriceCop:payload.unitPriceCop,totalCop:saleTotalCop(payload.quantity,payload.unitPriceCop),soldAt,inventoryMovementId:dispatchResult.movementId,note:payload.note?.trim()||undefined};
      if(!existingCustomer)setCustomers((current)=>[customer,...current]);
      setSales((current)=>[sale,...current]);
      return {ok:true,id:saleId,movementId:dispatchResult.movementId};
    },
  }),[access,customers,dispatch,error,products,ready,refreshCommercial,reloadAfterRemoteSale,remoteMode,sales]);

  return <CommercialContext.Provider value={value}>{children}</CommercialContext.Provider>;
}

export function useCommercialStore(){const context=useContext(CommercialContext);if(!context)throw new Error("useCommercialStore debe usarse dentro de CommercialStoreProvider");return context;}
