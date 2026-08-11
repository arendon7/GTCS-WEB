"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { aggregateProductStocks, lotStocks, stockForLot, type InventoryMovement, type InventoryUnit, type ProductMaster, type ProductionRecord } from "@/lib/inventory-domain";
import { bogotaDateKey, compactBogotaDate } from "@/lib/time";

const STORAGE_KEY = "greenatics-ops-inventory-mvp-006";

const seedProducts: ProductMaster[] = [
  { id:"wondergreen-solido", name:"Wondergreen sólido", unit:"kg", active:true, createdAt:"2026-08-11T00:00:00-05:00" },
  { id:"wondergreen-liquido", name:"Wondergreen líquido", unit:"L", active:true, createdAt:"2026-08-11T00:00:00-05:00" },
  { id:"material-estabilizado", name:"Material estabilizado / compost", unit:"kg", active:true, createdAt:"2026-08-11T00:00:00-05:00" },
];

type DispatchResult = { ok:true; movementId:string } | { ok:false; error:string };
type CreateProductResult = { ok:true; id:string } | { ok:false; error:string };
type ProductionResult = { ok:true; id:string; lotCode:string } | { ok:false; error:string };
type NewProduction = { plantId:string; productId:string; quantity:number; sourceProcess:string; sourcePileId?:string; note?:string };
type NewDispatch = { plantId:string; productId:string; lotCode:string; quantity:number; destination:string; note?:string; referenceId?:string };

type InventoryStore = {
  products: ProductMaster[];
  productions: ProductionRecord[];
  movements: InventoryMovement[];
  ready:boolean;
  stocks: ReturnType<typeof aggregateProductStocks>;
  lots: ReturnType<typeof lotStocks>;
  createProduct:(name:string,unit:InventoryUnit)=>CreateProductResult;
  recordProduction:(payload:NewProduction)=>ProductionResult;
  dispatch:(payload:NewDispatch)=>DispatchResult;
};

const InventoryContext=createContext<InventoryStore|null>(null);

function slug(value:string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase("es-CO").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

function plantName(plantId:string) { return plantId === "yarumal" ? "Yarumal" : "Támesis"; }

function productionLotCode(productions:ProductionRecord[], plantId:string, completedAt:string) {
  const date=bogotaDateKey(completedAt);
  const prefix=plantId === "yarumal" ? "YAR" : "TAM";
  const sequence=productions.filter((item)=>item.plantId===plantId && bogotaDateKey(item.completedAt)===date).length+1;
  return `${prefix}-PROD-${compactBogotaDate(completedAt)}-${String(sequence).padStart(3,"0")}`;
}

export function InventoryStoreProvider({children}:{children:ReactNode}) {
  const [products,setProducts]=useState<ProductMaster[]>(seedProducts);
  const [productions,setProductions]=useState<ProductionRecord[]>([]);
  const [movements,setMovements]=useState<InventoryMovement[]>([]);
  const [ready,setReady]=useState(false);

  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      try {
        const raw=window.localStorage.getItem(STORAGE_KEY);
        if(raw){
          const parsed=JSON.parse(raw) as {products?:ProductMaster[];productions?:ProductionRecord[];movements?:InventoryMovement[]};
          if(parsed.products?.length) setProducts(parsed.products);
          if(parsed.productions) setProductions(parsed.productions);
          if(parsed.movements) setMovements(parsed.movements);
        }
      } catch { window.localStorage.removeItem(STORAGE_KEY); }
      finally { setReady(true); }
    },0);
    return ()=>window.clearTimeout(timer);
  },[]);

  useEffect(()=>{
    if(!ready) return;
    window.localStorage.setItem(STORAGE_KEY,JSON.stringify({products,productions,movements}));
  },[products,productions,movements,ready]);

  const stocks=useMemo(()=>aggregateProductStocks(movements),[movements]);
  const lots=useMemo(()=>lotStocks(movements),[movements]);

  const value=useMemo<InventoryStore>(()=>({
    products,productions,movements,ready,stocks,lots,
    createProduct(name,unit){
      const clean=name.trim();
      if(!clean) return {ok:false,error:"Escribe el nombre del producto."};
      if(products.some((item)=>item.name.toLocaleLowerCase("es-CO")===clean.toLocaleLowerCase("es-CO") && item.unit===unit)) return {ok:false,error:"Ya existe un producto con ese nombre y unidad."};
      const base=slug(clean) || "producto";
      let id=base; let suffix=2;
      while(products.some((item)=>item.id===id)){ id=`${base}-${suffix}`; suffix+=1; }
      setProducts((current)=>[...current,{id,name:clean,unit,active:true,createdAt:new Date().toISOString()}]);
      return {ok:true,id};
    },
    recordProduction(payload){
      const product=products.find((item)=>item.id===payload.productId && item.active);
      if(!product) return {ok:false,error:"Selecciona un producto activo."};
      if(!Number.isFinite(payload.quantity) || payload.quantity<=0) return {ok:false,error:"La cantidad producida debe ser mayor que cero."};
      if(!payload.sourceProcess.trim()) return {ok:false,error:"Indica el proceso que originó esta producción."};
      const completedAt=new Date().toISOString();
      const lotCode=productionLotCode(productions,payload.plantId,completedAt);
      const id=crypto.randomUUID();
      const plant=plantName(payload.plantId);
      const record:ProductionRecord={id,plantId:payload.plantId,plant,productId:product.id,productName:product.name,unit:product.unit,quantity:payload.quantity,lotCode,sourceProcess:payload.sourceProcess.trim(),sourcePileId:payload.sourcePileId||undefined,completedAt,note:payload.note?.trim()||undefined};
      const movement:InventoryMovement={id:crypto.randomUUID(),plantId:payload.plantId,plant,productId:product.id,productName:product.name,unit:product.unit,lotCode,kind:"production",quantity:payload.quantity,occurredAt:completedAt,referenceId:id,note:payload.note?.trim()||undefined};
      setProductions((current)=>[record,...current]);
      setMovements((current)=>[movement,...current]);
      return {ok:true,id,lotCode};
    },
    dispatch(payload){
      const product=products.find((item)=>item.id===payload.productId && item.active);
      if(!product) return {ok:false,error:"Producto no encontrado."};
      if(!Number.isFinite(payload.quantity) || payload.quantity<=0) return {ok:false,error:"La cantidad de salida debe ser mayor que cero."};
      if(!payload.destination.trim()) return {ok:false,error:"Indica el destino de la salida."};
      const available=stockForLot(movements,payload.plantId,payload.productId,payload.lotCode);
      if(payload.quantity>available+1e-9) return {ok:false,error:`Stock insuficiente en ${payload.lotCode}. Disponible: ${available.toLocaleString("es-CO")} ${product.unit}.`};
      const movementId=crypto.randomUUID();
      const movement:InventoryMovement={id:movementId,plantId:payload.plantId,plant:plantName(payload.plantId),productId:product.id,productName:product.name,unit:product.unit,lotCode:payload.lotCode,kind:"dispatch",quantity:payload.quantity,occurredAt:new Date().toISOString(),referenceId:payload.referenceId,destination:payload.destination.trim(),note:payload.note?.trim()||undefined};
      setMovements((current)=>[movement,...current]);
      return {ok:true,movementId};
    },
  }),[products,productions,movements,ready,stocks,lots]);

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventoryStore(){
  const context=useContext(InventoryContext);
  if(!context) throw new Error("useInventoryStore debe usarse dentro de InventoryStoreProvider");
  return context;
}
