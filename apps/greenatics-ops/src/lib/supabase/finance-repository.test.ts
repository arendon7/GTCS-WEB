import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { recordRemoteExpense } from "@/lib/supabase/finance-repository";

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

describe("finance repository operational-expense write boundary", () => {
  it("records a standalone economic fact only through the governed RPC", async () => {
    const { client, rpc } = rpcClient({ data: [{ id: "expense-1", supplier_id: "supplier-1" }], error: null });

    await expect(recordRemoteExpense(access, {
      plantId: "tamesis",
      recordType: "expense",
      supplierName: "Proveedor QA",
      category: "maintenance",
      concept: "Mantenimiento QA",
      amountCop: 50000,
      documentDate: "2026-08-18",
      documentRef: "DOC-001",
      equipmentId: "equipment-1",
      processRef: "compostaje",
      evidenceRef: "evidencia/001",
      note: "Registro QA",
    }, client)).resolves.toEqual({ id: "expense-1", supplierId: "supplier-1" });

    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith("ops_record_operational_expense", {
      target_plant: "plant-db-tam",
      expense_record_type: "expense",
      supplier_name: "Proveedor QA",
      expense_category: "maintenance",
      expense_concept: "Mantenimiento QA",
      expense_amount_cop: 50000,
      expense_document_date: "2026-08-18",
      expense_document_ref: "DOC-001",
      target_equipment: "equipment-1",
      expense_process_ref: "compostaje",
      expense_evidence_ref: "evidencia/001",
      expense_note: "Registro QA",
    });
  });

  it("maps optional evidence fields to null at the RPC boundary", async () => {
    const { client, rpc } = rpcClient({ data: { id: "expense-2", supplier_id: "supplier-2" }, error: null });

    await recordRemoteExpense(access, {
      plantId: "tamesis",
      recordType: "purchase",
      supplierName: "Proveedor QA",
      category: "input",
      concept: "Compra QA",
      amountCop: 25000,
      documentDate: "2026-08-18",
    }, client);

    expect(rpc).toHaveBeenCalledWith("ops_record_operational_expense", expect.objectContaining({
      expense_document_ref: null,
      target_equipment: null,
      expense_process_ref: null,
      expense_evidence_ref: null,
      expense_note: null,
    }));
  });

  it("surfaces database rejection and never falls back to direct table persistence", async () => {
    const { client, rpc } = rpcClient({ data: null, error: { message: "El monto COP debe ser mayor que cero" } });

    await expect(recordRemoteExpense(access, {
      plantId: "tamesis",
      recordType: "expense",
      supplierName: "Proveedor QA",
      category: "operations",
      concept: "Monto inválido",
      amountCop: 0,
      documentDate: "2026-08-18",
    }, client)).rejects.toThrow("El monto COP debe ser mayor que cero");
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it("fails before the RPC when the selected plant is outside visible access", async () => {
    const { client, rpc } = rpcClient({ data: [{ id: "expense-3", supplier_id: "supplier-3" }], error: null });

    await expect(recordRemoteExpense(access, {
      plantId: "yarumal",
      recordType: "expense",
      supplierName: "Proveedor QA",
      category: "operations",
      concept: "Gasto QA",
      amountCop: 10000,
      documentDate: "2026-08-18",
    }, client)).rejects.toThrow("No tienes acceso a la planta yarumal.");
    expect(rpc).not.toHaveBeenCalled();
  });
});
