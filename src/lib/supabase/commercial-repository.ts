import type { SupabaseClient } from "@supabase/supabase-js";
import type { CustomerRecord, SaleRecord } from "@/lib/commercial-domain";
import type { InventoryUnit } from "@/lib/inventory-domain";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { createClient } from "@/lib/supabase/client";

type CustomerRow={id:string;name:string;normalized_key:string;created_at:string};
type SaleRow={id:string;plant_id:string;customer_id:string;product_id:string;lot_code:string;quantity:number|string;unit_price_cop:number|string;total_cop:number|string;sold_at:string;note?:string|null};
type ProductRow={id:string;name:string;unit:InventoryUnit};
type MovementRow={id:string;reference_id?:string|null};

export type RemoteSalePayload={plantId:string;customerName:string;productId:string;lotCode:string;quantity:number;unitPriceCop:number;note?:string};

function errorMessage(scope:string,error:{message?:string}|null){return `${scope}: ${error?.message||"error remoto desconocido"}`;}
function remotePlantId(access:PlantAccess[],plantId:string){const plant=access.find((item)=>item.plantId===plantId);if(!plant)throw new Error(`No tienes acceso a la planta ${plantId}.`);return plant.dbId;}
function positiveNumber(value:number|string,scope:string){const parsed=Number(value);if(!Number.isFinite(parsed)||parsed<=0)throw new Error(`${scope} contiene un valor inválido.`);return parsed;}

export async function loadRemoteCommercial(access:PlantAccess[],client:SupabaseClient=createClient()):Promise<{customers:CustomerRecord[];sales:SaleRecord[]}>{
  if(!access.length)return {customers:[],sales:[]};
  const plantIds=access.map((plant)=>plant.dbId);
  const [customerResult,saleResult,productResult]=await Promise.all([
    client.from("customers").select("id,name,normalized_key,created_at").order("name"),
    client.from("sales").select("id,plant_id,customer_id,product_id,lot_code,quantity,unit_price_cop,total_cop,sold_at,note").in("plant_id",plantIds).order("sold_at",{ascending:false}),
    client.from("inventory_products").select("id,name,unit"),
  ]);
  if(customerResult.error)throw new Error(errorMessage("No fue posible cargar clientes",customerResult.error));
  if(saleResult.error)throw new Error(errorMessage("No fue posible cargar ventas",saleResult.error));
  if(productResult.error)throw new Error(errorMessage("No fue posible cargar productos comerciales",productResult.error));

  const customerRows=(customerResult.data??[]) as unknown as CustomerRow[];
  const saleRows=(saleResult.data??[]) as unknown as SaleRow[];
  const productRows=(productResult.data??[]) as unknown as ProductRow[];
  const saleIds=saleRows.map((sale)=>sale.id);
  let movementRows:MovementRow[]=[];
  if(saleIds.length){
    const movementResult=await client.from("inventory_movements").select("id,reference_id").eq("kind","dispatch").in("reference_id",saleIds);
    if(movementResult.error)throw new Error(errorMessage("No fue posible enlazar ventas con inventario",movementResult.error));
    movementRows=(movementResult.data??[]) as unknown as MovementRow[];
  }

  const customers=customerRows.map((row):CustomerRecord=>({id:row.id,name:row.name,normalizedKey:row.normalized_key,createdAt:row.created_at}));
  const customerMap=new Map(customers.map((customer)=>[customer.id,customer]));
  const productMap=new Map(productRows.map((product)=>[product.id,product]));
  const plantMap=new Map(access.map((plant)=>[plant.dbId,plant]));
  const movementBySale=new Map(movementRows.flatMap((movement)=>movement.reference_id?[[movement.reference_id,movement.id] as const]:[]));

  const sales=saleRows.map((row):SaleRecord=>{
    const plant=plantMap.get(row.plant_id);const customer=customerMap.get(row.customer_id);const product=productMap.get(row.product_id);const inventoryMovementId=movementBySale.get(row.id);
    if(!plant)throw new Error(`Venta ${row.id} pertenece a una planta no visible.`);
    if(!customer)throw new Error(`Venta ${row.id} referencia un cliente no visible.`);
    if(!product)throw new Error(`Venta ${row.id} referencia un producto no visible.`);
    if(!inventoryMovementId)throw new Error(`Venta ${row.id} no tiene salida de inventario enlazada.`);
    return {id:row.id,plantId:plant.plantId,plant:plant.name,customerId:customer.id,customerName:customer.name,productId:product.id,productName:product.name,unit:product.unit,lotCode:row.lot_code,quantity:positiveNumber(row.quantity,`Venta ${row.id}`),unitPriceCop:positiveNumber(row.unit_price_cop,`Venta ${row.id}`),totalCop:positiveNumber(row.total_cop,`Venta ${row.id}`),soldAt:row.sold_at,inventoryMovementId,note:row.note||undefined};
  });
  return {customers,sales};
}

export async function recordRemoteSale(access:PlantAccess[],payload:RemoteSalePayload,client:SupabaseClient=createClient()){
  const {data,error}=await client.rpc("ops_record_sale",{target_plant:remotePlantId(access,payload.plantId),customer_name:payload.customerName,target_product:payload.productId,target_lot:payload.lotCode,sale_quantity:payload.quantity,sale_unit_price_cop:payload.unitPriceCop,sale_note:payload.note||null});
  if(error)throw new Error(errorMessage("No fue posible registrar la venta",error));
  const row=Array.isArray(data)?data[0]:data;
  if(!row||typeof row.id!=="string"||typeof row.movement_id!=="string")throw new Error("La venta fue registrada pero el servidor no devolvió sus identificadores válidos.");
  return {id:row.id as string,movementId:row.movement_id as string};
}
