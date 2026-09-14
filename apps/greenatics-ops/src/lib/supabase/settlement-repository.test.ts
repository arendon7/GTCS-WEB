import type { SupabaseClient } from "@supabase/supabase-js";
import { describe,expect,it,vi } from "vitest";
import { recordRemoteCollection,recordRemotePayment } from "@/lib/supabase/settlement-repository";

function rpcClient(result:{data:unknown;error:{message?:string}|null}){
  const rpc=vi.fn().mockResolvedValue(result);
  return {client:{rpc} as unknown as SupabaseClient,rpc};
}

describe("settlement repository write boundary",()=>{
  it("records a collection only through the governed sale RPC",async()=>{
    const {client,rpc}=rpcClient({data:"collection-1",error:null});

    await expect(recordRemoteCollection({
      sourceId:"sale-1",
      amountCop:40000,
      occurredOn:"2026-08-18",
      method:"transfer",
      reference:"REC-001",
      note:"Recaudo parcial",
    },client)).resolves.toBe("collection-1");

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("record_sale_collection",{
      p_sale_id:"sale-1",
      p_amount_cop:40000,
      p_occurred_on:"2026-08-18",
      p_method:"transfer",
      p_reference:"REC-001",
      p_note:"Recaudo parcial",
    });
  });

  it("records a payment only through the governed expense RPC and maps optional fields to null",async()=>{
    const {client,rpc}=rpcClient({data:"payment-1",error:null});

    await expect(recordRemotePayment({
      sourceId:"expense-1",
      amountCop:30000,
      occurredOn:"2026-08-18",
      method:"cash",
    },client)).resolves.toBe("payment-1");

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("record_expense_payment",{
      p_expense_id:"expense-1",
      p_amount_cop:30000,
      p_occurred_on:"2026-08-18",
      p_method:"cash",
      p_reference:null,
      p_note:null,
    });
  });

  it("surfaces a collection rejection and never falls back to direct table persistence",async()=>{
    const {client,rpc}=rpcClient({data:null,error:{message:"El recaudo excede el saldo pendiente"}});

    await expect(recordRemoteCollection({
      sourceId:"sale-1",
      amountCop:999999,
      occurredOn:"2026-08-18",
      method:"card",
    },client)).rejects.toThrow("El recaudo excede el saldo pendiente");

    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("rejects an invalid RPC response instead of inventing a local settlement id",async()=>{
    const {client,rpc}=rpcClient({data:{id:"payment-2"},error:null});

    await expect(recordRemotePayment({
      sourceId:"expense-2",
      amountCop:10000,
      occurredOn:"2026-08-18",
      method:"other",
    },client)).rejects.toThrow("servidor no devolvió su identificador");

    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
