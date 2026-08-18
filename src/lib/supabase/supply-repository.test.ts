import type { SupabaseClient } from "@supabase/supabase-js";
import { describe,expect,it,vi } from "vitest";
import { consumeRemoteSupply,recordRemoteSupplyReceipt } from "@/lib/supabase/supply-repository";
import type { PlantAccess } from "@/lib/ops-data-contract";

const access:PlantAccess[]=[{plantId:"tamesis",dbId:"plant-db-1",name:"Támesis",role:"supervisor"}];

function rpcClient(result:{data:unknown;error:{message?:string}|null}){
  const rpc=vi.fn().mockResolvedValue(result);
  return {client:{rpc} as unknown as SupabaseClient,rpc};
}

describe("supply repository write boundary",()=>{
  it("records measured receipt only through record_supply_receipt",async()=>{
    const {client,rpc}=rpcClient({data:{id:"receipt-1",lot_code:"SUP-20260818-ABC12345"},error:null});
    await expect(recordRemoteSupplyReceipt(access,{plantId:"tamesis",supplyName:"Melaza",category:"raw_material",unit:"kg",quantity:120,receivedOn:"2026-08-18",supplierName:"Proveedor A",documentRef:"FAC-1"},client)).resolves.toEqual({id:"receipt-1",lotCode:"SUP-20260818-ABC12345"});
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("record_supply_receipt",{p_plant_id:"plant-db-1",p_supply_name:"Melaza",p_category:"raw_material",p_unit:"kg",p_quantity:120,p_received_on:"2026-08-18",p_supplier_name:"Proveedor A",p_expense_id:null,p_document_ref:"FAC-1",p_evidence_ref:null,p_note:null});
  });

  it("records consumption only through consume_supply",async()=>{
    const {client,rpc}=rpcClient({data:"movement-1",error:null});
    await expect(consumeRemoteSupply(access,{plantId:"tamesis",supplyId:"supply-1",lotCode:"SUP-LOT-1",quantity:20,occurredOn:"2026-08-18",destination:"Compostaje"},client)).resolves.toBe("movement-1");
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("consume_supply",{p_plant_id:"plant-db-1",p_supply_id:"supply-1",p_lot_code:"SUP-LOT-1",p_quantity:20,p_occurred_on:"2026-08-18",p_destination:"Compostaje",p_equipment_id:null,p_process_ref:null,p_note:null});
  });

  it("surfaces a stock rejection without inventing a local movement",async()=>{
    const {client,rpc}=rpcClient({data:null,error:{message:"Stock insuficiente en el lote"}});
    await expect(consumeRemoteSupply(access,{plantId:"tamesis",supplyId:"supply-1",lotCode:"SUP-LOT-1",quantity:999,occurredOn:"2026-08-18",destination:"Proceso"},client)).rejects.toThrow("Stock insuficiente en el lote");
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("rejects an invalid receipt response instead of inventing a receipt or lot",async()=>{
    const {client,rpc}=rpcClient({data:{id:"receipt-2"},error:null});
    await expect(recordRemoteSupplyReceipt(access,{plantId:"tamesis",supplyName:"Empaque",category:"packaging",unit:"unidades",quantity:50,receivedOn:"2026-08-18"},client)).rejects.toThrow("servidor no devolvió lote e identificador válidos");
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
