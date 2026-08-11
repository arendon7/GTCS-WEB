"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useInventoryStore } from "@/components/inventory-store";
import { customerIdFromKey, normalizeCustomerKey, saleTotalCop, type CustomerRecord, type SaleRecord } from "@/lib/commercial-domain";

const STORAGE_KEY = "greenatics-ops-sales-mvp-008";

type SaleResult = { ok:true; id:string; movementId:string } | { ok:false; error:string };
type NewSale = { plantId:string; customerName:string; productId:string; lotCode:string; quantity:number; unitPriceCop:number; note?:string };

type CommercialStore = {
  customers: CustomerRecord[];
  sales: SaleRecord[];
  ready:boolean;
  recordSale:(payload:NewSale)=>SaleResult;
};

const CommercialContext=createContext<CommercialStore|null>(null);

function plantName(plantId:string){return plantId==="yarumal"?"Yarumal":"Támesis";}

export function CommercialStoreProvider({children}:{children:ReactNode}){
  const {products,dispatch}=useInventoryStore();
  const [customers,setCustomers]=useState<CustomerRecord[]>([]);
  const [sales,setSales]=useState<SaleRecord[]>([]);
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      try{
        const raw=window.localStorage.getItem(STORAGE_KEY);
        if(raw){
          const parsed=JSON.parse(raw) as {customers?:CustomerRecord[];sales?:SaleRecord[]};
          if(parsed.customers) setCustomers(parsed.customers);
          if(parsed.sales) setSales(parsed.sales);
        }
      }catch{window.localStorage.removeItem(STORAGE_KEY);}
      finally{setReady(true);}
    },0);
    return()=>window.clearTimeout(timer);
  },[]);

  useEffect(()=>{
    if(!ready)return;
    window.localStorage.setItem(STORAGE_KEY,JSON.stringify({customers,sales}));
  },[customers,sales,ready]);

  const value=useMemo<CommercialStore>(()=>({
    customers,sales,ready,
    recordSale(payload){
      const normalizedKey=normalizeCustomerKey(payload.customerName);
      if(!normalizedKey)return {ok:false,error:"Indica el cliente de la venta."};
      const cleanCustomerName=payload.customerName.trim().replace(/\s+/g," ");
      const product=products.find((item)=>item.id===payload.productId && item.active);
      if(!product)return {ok:false,error:"Producto no encontrado."};
      if(!payload.lotCode.trim())return {ok:false,error:"Selecciona un lote con stock."};
      if(!Number.isFinite(payload.quantity)||payload.quantity<=0)return {ok:false,error:"La cantidad vendida debe ser mayor que cero."};
      if(!Number.isFinite(payload.unitPriceCop)||payload.unitPriceCop<=0)return {ok:false,error:"El precio unitario debe ser mayor que cero."};

      const existingCustomer=customers.find((item)=>item.normalizedKey===normalizedKey);
      const customer:CustomerRecord=existingCustomer??{id:customerIdFromKey(normalizedKey),name:cleanCustomerName,normalizedKey,createdAt:new Date().toISOString()};
      const saleId=crypto.randomUUID();
      const dispatchResult=dispatch({
        plantId:payload.plantId,
        productId:payload.productId,
        lotCode:payload.lotCode,
        quantity:payload.quantity,
        destination:customer.name,
        referenceId:saleId,
        note:payload.note?.trim()||undefined,
      });
      if(!dispatchResult.ok)return dispatchResult;

      const soldAt=new Date().toISOString();
      const sale:SaleRecord={
        id:saleId,
        plantId:payload.plantId,
        plant:plantName(payload.plantId),
        customerId:customer.id,
        customerName:customer.name,
        productId:product.id,
        productName:product.name,
        unit:product.unit,
        lotCode:payload.lotCode,
        quantity:payload.quantity,
        unitPriceCop:payload.unitPriceCop,
        totalCop:saleTotalCop(payload.quantity,payload.unitPriceCop),
        soldAt,
        inventoryMovementId:dispatchResult.movementId,
        note:payload.note?.trim()||undefined,
      };
      if(!existingCustomer)setCustomers((current)=>[customer,...current]);
      setSales((current)=>[sale,...current]);
      return {ok:true,id:saleId,movementId:dispatchResult.movementId};
    },
  }),[customers,sales,ready,products,dispatch]);

  return <CommercialContext.Provider value={value}>{children}</CommercialContext.Provider>;
}

export function useCommercialStore(){
  const context=useContext(CommercialContext);
  if(!context)throw new Error("useCommercialStore debe usarse dentro de CommercialStoreProvider");
  return context;
}
