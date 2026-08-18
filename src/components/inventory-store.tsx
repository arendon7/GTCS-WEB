"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useCompostStore } from "@/components/compost-store";
import { useOpsStore } from "@/components/ops-store";
import { aggregateProductStocks, lotStocks, stockForLot, type InventoryMovement, type InventoryReconciliation, type InventoryUnit, type ProductMaster, type ProductionRecord } from "@/lib/inventory-domain";
import {
  createRemoteInventoryProduct,
  dispatchRemoteInventory,
  loadRemoteInventory,
  reconcileRemoteInventory,
  recordRemoteProduction,
} from "@/lib/supabase/inventory-repository";
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
type ReconciliationResult = { ok:true; id:string; adjustmentMovementId?:string; expectedQuantity:number; countedQuantity:number; differenceQuantity:number } | { ok:false; error:string };
type NewProduction = { plantId:string; productId:string; quantity:number; sourceProcess:string; sourcePileId?:string; note?:string };
type NewDispatch = { plantId:string; productId:string; lotCode:string; quantity:number; destination:string; note?:string; referenceId?:string };
type NewReconciliation = { plantId:string; productId:string; lotCode:string; countedQuantity:number; note:string; evidenceUrls?:string[] };

type InventoryStore = {
  products: ProductMaster[];
  productions: ProductionRecord[];
  movements: InventoryMovement[];
  reconciliations: InventoryReconciliation[];
  ready:boolean;
  error?:string;
  stocks: ReturnType<typeof aggregateProductStocks>;
  lots: ReturnType<typeof lotStocks>;
  createProduct:(name:string,unit:InventoryUnit)=>Promise<CreateProductResult>;
  recordProduction:(payload:NewProduction)=>Promise<ProductionResult>;
  dispatch:(payload:NewDispatch)=>Promise<DispatchResult>;
  reconcile:(payload:NewReconciliation)=>Promise<ReconciliationResult>;
  refreshInventory:()=>Promise<void>;
  resetInventoryDemo:()=>void;
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

function failure(error:unknown,fallback:string):{ok:false;error:string}{
  return {ok:false,error:error instanceof Error ? error.message : fallback};
}

export function InventoryStoreProvider({children}:{children:ReactNode}) {
  const {backend,access}=useOpsStore();
  const {piles}=useCompostStore();
  const remoteMode=backend.mode==="supabase";
  const [products,setProducts]=useState<ProductMaster[]>(()=>remoteMode?[]:seedProducts);
  const [productions,setProductions]=useState<ProductionRecord[]>([]);
  const [movements,setMovements]=useState<InventoryMovement[]>([]);
  const [reconciliations,setReconciliations]=useState<InventoryReconciliation[]>([]);
  const [ready,setReady]=useState(false);
  const [error,setError]=useState<string>();

  const hydrateRemote=useCallback(async()=>{
    if(backend.status!=="ready") return;
    const snapshot=await loadRemoteInventory(access);
    setProducts(snapshot.products);
    setProductions(snapshot.productions);
    setMovements(snapshot.movements);
    setReconciliations(snapshot.reconciliations);
    setError(undefined);
    setReady(true);
  },[access,backend.status]);

  const refreshInventory=useCallback(async()=>{
    if(!remoteMode) return;
    setReady(false);
    try { await hydrateRemote(); }
    catch(caught){
      setProducts([]);setProductions([]);setMovements([]);setReconciliations([]);
      setError(caught instanceof Error ? caught.message : "No fue posible cargar producción e inventario remoto.");
      setReady(true);
      throw caught;
    }
  },[hydrateRemote,remoteMode]);

  useEffect(()=>{
    if(remoteMode){
      if(backend.status!=="ready"){
        const timer=window.setTimeout(()=>{
          setProducts([]);setProductions([]);setMovements([]);setReconciliations([]);
          setError(backend.status==="error"?backend.error:undefined);
          setReady(backend.status==="error");
        },0);
        return ()=>window.clearTimeout(timer);
      }
      const timer=window.setTimeout(()=>{void refreshInventory().catch(()=>undefined);},0);
      return ()=>window.clearTimeout(timer);
    }

    const timer=window.setTimeout(()=>{
      try {
        const raw=window.localStorage.getItem(STORAGE_KEY);
        if(raw){
          const parsed=JSON.parse(raw) as {products?:ProductMaster[];productions?:ProductionRecord[];movements?:InventoryMovement[];reconciliations?:InventoryReconciliation[]};
          if(parsed.products?.length) setProducts(parsed.products);
          if(parsed.productions) setProductions(parsed.productions);
          if(parsed.movements) setMovements(parsed.movements);
          if(parsed.reconciliations) setReconciliations(parsed.reconciliations);
        }
      } catch { window.localStorage.removeItem(STORAGE_KEY); }
      finally { setError(undefined);setReady(true); }
    },0);
    return ()=>window.clearTimeout(timer);
  },[backend.error,backend.status,refreshInventory,remoteMode]);

  useEffect(()=>{
    if(!ready||remoteMode) return;
    window.localStorage.setItem(STORAGE_KEY,JSON.stringify({products,productions,movements,reconciliations}));
  },[products,productions,movements,reconciliations,ready,remoteMode]);

  const stocks=useMemo(()=>aggregateProductStocks(movements),[movements]);
  const lots=useMemo(()=>lotStocks(movements),[movements]);

  const reloadRemote=useCallback(async()=>{
    try { await hydrateRemote(); }
    catch(caught){
      setError(caught instanceof Error ? `El cambio se guardó, pero no fue posible refrescar producción/inventario: ${caught.message}` : "El cambio se guardó, pero no fue posible refrescar producción/inventario.");
    }
  },[hydrateRemote]);

  const value=useMemo<InventoryStore>(()=>({
    products,productions,movements,reconciliations,ready,error,stocks,lots,
    async createProduct(name,unit){
      const clean=name.trim();
      if(!clean) return {ok:false,error:"Escribe el nombre del producto."};
      if(products.some((item)=>item.name.toLocaleLowerCase("es-CO")===clean.toLocaleLowerCase("es-CO") && item.unit===unit)) return {ok:false,error:"Ya existe un producto con ese nombre y unidad."};

      if(remoteMode){
        try {
          const id=await createRemoteInventoryProduct(clean,unit);
          await reloadRemote();
          return {ok:true,id};
        } catch(caught){ return failure(caught,"No fue posible crear el producto."); }
      }

      const base=slug(clean)||"producto";
      let id=base;let suffix=2;
      while(products.some((item)=>item.id===id)){id=`${base}-${suffix}`;suffix+=1;}
      setProducts((current)=>[...current,{id,name:clean,unit,active:true,createdAt:new Date().toISOString()}]);
      return {ok:true,id};
    },
    async recordProduction(payload){
      const product=products.find((item)=>item.id===payload.productId&&item.active);
      if(!product) return {ok:false,error:"Selecciona un producto activo."};
      if(!Number.isFinite(payload.quantity)||payload.quantity<=0) return {ok:false,error:"La cantidad producida debe ser mayor que cero."};
      if(!payload.sourceProcess.trim()) return {ok:false,error:"Indica el proceso que originó esta producción."};
      if(payload.sourcePileId){
        const sourcePile=piles.find((pile)=>pile.id===payload.sourcePileId);
        if(!sourcePile||sourcePile.plantId!==payload.plantId||sourcePile.status!=="closed") return {ok:false,error:"La pila relacionada debe estar cerrada y pertenecer a la misma planta."};
      }

      if(remoteMode){
        try {
          const result=await recordRemoteProduction(access,payload);
          await reloadRemote();
          return {ok:true,...result};
        } catch(caught){ return failure(caught,"No fue posible registrar la producción."); }
      }

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
    async dispatch(payload){
      const product=products.find((item)=>item.id===payload.productId&&item.active);
      if(!product) return {ok:false,error:"Producto no encontrado."};
      if(!Number.isFinite(payload.quantity)||payload.quantity<=0) return {ok:false,error:"La cantidad de salida debe ser mayor que cero."};
      if(!payload.destination.trim()) return {ok:false,error:"Indica el destino de la salida."};
      const available=stockForLot(movements,payload.plantId,payload.productId,payload.lotCode);
      if(payload.quantity>available+1e-9) return {ok:false,error:`Stock insuficiente en ${payload.lotCode}. Disponible: ${available.toLocaleString("es-CO")} ${product.unit}.`};

      if(remoteMode){
        try {
          const movementId=await dispatchRemoteInventory(access,payload);
          await reloadRemote();
          return {ok:true,movementId};
        } catch(caught){ return failure(caught,"No fue posible registrar la salida."); }
      }

      const movementId=crypto.randomUUID();
      const movement:InventoryMovement={id:movementId,plantId:payload.plantId,plant:plantName(payload.plantId),productId:product.id,productName:product.name,unit:product.unit,lotCode:payload.lotCode,kind:"dispatch",quantity:payload.quantity,occurredAt:new Date().toISOString(),referenceId:payload.referenceId,destination:payload.destination.trim(),note:payload.note?.trim()||undefined};
      setMovements((current)=>[movement,...current]);
      return {ok:true,movementId};
    },
    async reconcile(payload){
      const product=products.find((item)=>item.id===payload.productId);
      if(!product) return {ok:false,error:"Producto no encontrado."};
      if(!Number.isFinite(payload.countedQuantity)||payload.countedQuantity<0) return {ok:false,error:"El conteo físico no puede ser negativo."};
      if(!payload.note.trim()) return {ok:false,error:"Registra la observación del conteo físico."};
      const expectedQuantity=stockForLot(movements,payload.plantId,payload.productId,payload.lotCode);
      if(expectedQuantity<0) return {ok:false,error:"El kardex presenta saldo negativo y requiere revisión técnica antes de conciliar."};
      if(!movements.some((movement)=>movement.plantId===payload.plantId&&movement.productId===payload.productId&&movement.lotCode===payload.lotCode)) return {ok:false,error:"El lote seleccionado no existe para este producto y planta."};

      if(remoteMode){
        try {
          const result=await reconcileRemoteInventory(access,payload);
          await reloadRemote();
          return {ok:true,...result};
        } catch(caught){ return failure(caught,"No fue posible conciliar el inventario."); }
      }

      const id=crypto.randomUUID();
      const occurredAt=new Date().toISOString();
      const differenceQuantity=payload.countedQuantity-expectedQuantity;
      const adjustmentMovementId=Math.abs(differenceQuantity)>1e-9?crypto.randomUUID():undefined;
      if(adjustmentMovementId){
        const movement:InventoryMovement={
          id:adjustmentMovementId,
          plantId:payload.plantId,
          plant:plantName(payload.plantId),
          productId:product.id,
          productName:product.name,
          unit:product.unit,
          lotCode:payload.lotCode,
          kind:differenceQuantity>0?"adjustment_in":"adjustment_out",
          quantity:Math.abs(differenceQuantity),
          occurredAt,
          referenceId:id,
          note:`Conciliación física: ${payload.note.trim()}`,
        };
        setMovements((current)=>[movement,...current]);
      }
      const reconciliation:InventoryReconciliation={
        id,
        plantId:payload.plantId,
        plant:plantName(payload.plantId),
        productId:product.id,
        productName:product.name,
        unit:product.unit,
        lotCode:payload.lotCode,
        expectedQuantity,
        countedQuantity:payload.countedQuantity,
        differenceQuantity,
        note:payload.note.trim(),
        evidenceUrls:payload.evidenceUrls?.filter(Boolean)??[],
        adjustmentMovementId,
        occurredAt,
      };
      setReconciliations((current)=>[reconciliation,...current]);
      return {ok:true,id,adjustmentMovementId,expectedQuantity,countedQuantity:payload.countedQuantity,differenceQuantity};
    },
    refreshInventory,
    resetInventoryDemo(){
      if(remoteMode){void refreshInventory().catch(()=>undefined);return;}
      setProducts(seedProducts);setProductions([]);setMovements([]);setReconciliations([]);setError(undefined);
      window.localStorage.removeItem(STORAGE_KEY);
    },
  }),[access,error,lots,movements,piles,products,productions,reconciliations,ready,refreshInventory,reloadRemote,remoteMode,stocks]);

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>;
}

export function useInventoryStore(){
  const context=useContext(InventoryContext);
  if(!context) throw new Error("useInventoryStore debe usarse dentro de InventoryStoreProvider");
  return context;
}
