import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { recordRemoteSale } from "@/lib/supabase/commercial-repository";

const access: PlantAccess[] = [{
  dbId: "plant-db-tam",
  plantId: "tamesis",
  code: "TAM",
  name: "Támesis",
  role: "operator",
}];

function rpcClient(result: { data: unknown; error: { message?: string } | null }) {
  const rpc = vi.fn().mockResolvedValue(result);
  return { client: { rpc } as unknown as SupabaseClient, rpc };
}

describe("commercial repository sales write boundary", () => {
  it("records a sale only through the governed RPC", async () => {
    const { client, rpc } = rpcClient({ data: [{ id: "sale-1", movement_id: "movement-1", customer_id: "customer-1" }], error: null });

    await expect(recordRemoteSale(access, {
      plantId: "tamesis",
      customerName: "Cliente QA",
      productId: "product-1",
      lotCode: "LOT-001",
      quantity: 25,
      unitPriceCop: 2000,
      note: "Despacho QA",
    }, client)).resolves.toEqual({ id: "sale-1", movementId: "movement-1" });

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("ops_record_sale", {
      target_plant: "plant-db-tam",
      customer_name: "Cliente QA",
      target_product: "product-1",
      target_lot: "LOT-001",
      sale_quantity: 25,
      sale_unit_price_cop: 2000,
      sale_note: "Despacho QA",
    });
  });

  it("maps an absent note to null at the RPC boundary", async () => {
    const { client, rpc } = rpcClient({ data: { id: "sale-2", movement_id: "movement-2", customer_id: "customer-2" }, error: null });

    await recordRemoteSale(access, {
      plantId: "tamesis",
      customerName: "Cliente QA",
      productId: "product-1",
      lotCode: "LOT-001",
      quantity: 5,
      unitPriceCop: 2500,
    }, client);

    expect(rpc).toHaveBeenCalledWith("ops_record_sale", expect.objectContaining({ sale_note: null }));
  });

  it("surfaces database rejection and never falls back to direct table persistence", async () => {
    const { client, rpc } = rpcClient({ data: null, error: { message: "Stock insuficiente para lote LOT-001." } });

    await expect(recordRemoteSale(access, {
      plantId: "tamesis",
      customerName: "Cliente QA",
      productId: "product-1",
      lotCode: "LOT-001",
      quantity: 999,
      unitPriceCop: 2000,
    }, client)).rejects.toThrow("Stock insuficiente para lote LOT-001.");
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("fails before the RPC when the selected plant is outside visible access", async () => {
    const { client, rpc } = rpcClient({ data: [{ id: "sale-3", movement_id: "movement-3" }], error: null });

    await expect(recordRemoteSale(access, {
      plantId: "yarumal",
      customerName: "Cliente QA",
      productId: "product-1",
      lotCode: "LOT-001",
      quantity: 1,
      unitPriceCop: 2000,
    }, client)).rejects.toThrow("No tienes acceso a la planta yarumal.");
    expect(rpc).not.toHaveBeenCalled();
  });
});
