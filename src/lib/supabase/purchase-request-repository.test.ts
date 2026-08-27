import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { decideRemotePurchaseRequest, fulfillRemotePurchaseRequest, submitRemotePurchaseRequest } from "@/lib/supabase/purchase-request-repository";

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

describe("purchase request repository write boundary", () => {
  it("submits through the governed RPC instead of direct table DML", async () => {
    const { client, rpc } = rpcClient({ data: "request-1", error: null });

    await expect(submitRemotePurchaseRequest(access, {
      plantId: "tamesis",
      requestedBy: "Operador Támesis",
      neededBy: "2026-08-25",
      category: "maintenance",
      concept: "Repuesto bomba",
      justification: "Cambio preventivo",
      estimatedAmountCop: 125000,
      suggestedSupplier: "Proveedor QA",
      equipmentId: "equipment-1",
      processRef: "compostaje",
      evidenceRef: "evidencia/qa-001",
    }, client)).resolves.toBe("request-1");

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("ops_submit_purchase_request", {
      target_plant: "plant-db-tam",
      requester_name: "Operador Támesis",
      needed_by_date: "2026-08-25",
      request_category: "maintenance",
      request_concept: "Repuesto bomba",
      request_justification: "Cambio preventivo",
      request_estimated_amount_cop: 125000,
      request_suggested_supplier: "Proveedor QA",
      target_equipment: "equipment-1",
      request_process_ref: "compostaje",
      request_evidence_ref: "evidencia/qa-001",
    });
  });

  it("maps absent optional fields to explicit nulls at the RPC boundary", async () => {
    const { client, rpc } = rpcClient({ data: "request-2", error: null });

    await submitRemotePurchaseRequest(access, {
      plantId: "tamesis",
      requestedBy: "Operador Támesis",
      category: "operations",
      concept: "Consumible operativo",
      justification: "Reposición",
      estimatedAmountCop: 50000,
    }, client);

    expect(rpc).toHaveBeenCalledWith("ops_submit_purchase_request", expect.objectContaining({
      needed_by_date: null,
      request_suggested_supplier: null,
      target_equipment: null,
      request_process_ref: null,
      request_evidence_ref: null,
    }));
  });

  it("surfaces database validation and never falls back to another persistence path", async () => {
    const { client, rpc } = rpcClient({ data: null, error: { message: "El equipo seleccionado no pertenece a la planta de la solicitud." } });

    await expect(submitRemotePurchaseRequest(access, {
      plantId: "tamesis",
      requestedBy: "Operador Támesis",
      category: "maintenance",
      concept: "Equipo cruzado",
      justification: "Prueba",
      estimatedAmountCop: 50000,
      equipmentId: "equipment-other-plant",
    }, client)).rejects.toThrow("El equipo seleccionado no pertenece a la planta de la solicitud.");
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("fails before the RPC when the selected plant is outside visible access", async () => {
    const { client, rpc } = rpcClient({ data: "request-3", error: null });

    await expect(submitRemotePurchaseRequest(access, {
      plantId: "yarumal",
      requestedBy: "Operador",
      category: "operations",
      concept: "Solicitud fuera de planta",
      justification: "Prueba",
      estimatedAmountCop: 50000,
    }, client)).rejects.toThrow("No tienes acceso a la planta yarumal.");
    expect(rpc).not.toHaveBeenCalled();
  });

  it("decides only through the governed transition RPC with the exact decision payload", async () => {
    const { client, rpc } = rpcClient({ data: null, error: null });

    await expect(decideRemotePurchaseRequest(
      "request-approved",
      "approved",
      "Supervisor Támesis",
      "Compra autorizada",
      client,
    )).resolves.toBeUndefined();

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("decide_purchase_request", {
      p_request_id: "request-approved",
      p_decision: "approved",
      p_actor_name: "Supervisor Támesis",
      p_note: "Compra autorizada",
    });
  });

  it("maps an absent decision note to null without inventing content", async () => {
    const { client, rpc } = rpcClient({ data: null, error: null });

    await decideRemotePurchaseRequest("request-approved", "approved", "Director", undefined, client);

    expect(rpc).toHaveBeenCalledWith("decide_purchase_request", expect.objectContaining({ p_note: null }));
  });

  it("fulfills through the governed RPC using the actual amount and returns the expense id", async () => {
    const { client, rpc } = rpcClient({ data: "expense-real-1", error: null });

    await expect(fulfillRemotePurchaseRequest({
      requestId: "request-approved",
      actor: "Supervisor Támesis",
      supplierName: "Ferretería Real S.A.S.",
      actualAmountCop: 185000,
      documentDate: "2026-08-27",
      documentRef: "FV-REAL-001",
      note: "Monto final verificado",
    }, client)).resolves.toBe("expense-real-1");

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("fulfill_purchase_request", {
      p_request_id: "request-approved",
      p_actor_name: "Supervisor Támesis",
      p_supplier_name: "Ferretería Real S.A.S.",
      p_actual_amount_cop: 185000,
      p_document_date: "2026-08-27",
      p_document_ref: "FV-REAL-001",
      p_note: "Monto final verificado",
    });
  });

  it("surfaces fulfillment rejection without fabricating an expense identifier", async () => {
    const { client, rpc } = rpcClient({ data: null, error: { message: "Solo una solicitud aprobada puede convertirse en compra real" } });

    await expect(fulfillRemotePurchaseRequest({
      requestId: "request-closed",
      actor: "Supervisor",
      supplierName: "Proveedor",
      actualAmountCop: 185000,
      documentDate: "2026-08-27",
    }, client)).rejects.toThrow("Solo una solicitud aprobada puede convertirse en compra real");
    expect(rpc).toHaveBeenCalledTimes(1);
  });
});
