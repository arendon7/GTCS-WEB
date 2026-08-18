import type { SupabaseClient } from "@supabase/supabase-js";
import type { InventoryMovement, InventoryReconciliation, InventoryStockThresholdRevision, InventoryUnit, ProductMaster, ProductionOriginKind, ProductionRecord } from "@/lib/inventory-domain";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { createClient } from "@/lib/supabase/client";

type ProductRow = {
  id: string;
  name: string;
  unit: InventoryUnit;
  reference_code?: string | null;
  active: boolean;
  created_at: string;
};

type ProductionRow = {
  id: string;
  plant_id: string;
  product_id: string;
  product_reference_code?: string | null;
  quantity: number | string;
  lot_code: string;
  source_process: string;
  source_pile_id?: string | null;
  origin_kind: ProductionOriginKind;
  completed_at: string;
  note?: string | null;
};

type MovementRow = {
  id: string;
  plant_id: string;
  product_id: string;
  lot_code: string;
  kind: InventoryMovement["kind"];
  quantity: number | string;
  occurred_at: string;
  reference_id?: string | null;
  destination?: string | null;
  note?: string | null;
};

type ReconciliationRow = {
  id: string;
  plant_id: string;
  product_id: string;
  lot_code: string;
  expected_quantity: number | string;
  counted_quantity: number | string;
  difference_quantity: number | string;
  note: string;
  evidence_urls?: string[] | null;
  adjustment_movement_id?: string | null;
  occurred_at: string;
};

type ThresholdRow = {
  id: string;
  revision_no: number | string;
  plant_id: string;
  product_id: string;
  minimum_quantity?: number | string | null;
  note: string;
  effective_at: string;
  created_at: string;
};

export type RemoteProductionPayload = {
  plantId: string;
  productId: string;
  quantity: number;
  sourceProcess: string;
  sourcePileId?: string;
  note?: string;
};

export type RemoteDispatchPayload = {
  plantId: string;
  productId: string;
  lotCode: string;
  quantity: number;
  destination: string;
  note?: string;
  referenceId?: string;
};

export type RemoteReconciliationPayload = {
  plantId: string;
  productId: string;
  lotCode: string;
  countedQuantity: number;
  note: string;
  evidenceUrls?: string[];
};

export type RemoteStockThresholdPayload = {
  plantId: string;
  productId: string;
  minimumQuantity?: number;
  note: string;
};

function errorMessage(scope: string, error: { message?: string; code?: string } | null) {
  if (error?.code === "23505") return `${scope}: ya existe un registro con esa identidad.`;
  return `${scope}: ${error?.message || "error remoto desconocido"}`;
}

function remotePlantId(access: PlantAccess[], plantId: string) {
  const plant = access.find((item) => item.plantId === plantId);
  if (!plant) throw new Error(`No tienes acceso a la planta ${plantId}.`);
  return plant.dbId;
}

function positiveNumber(value: number | string, scope: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) throw new Error(`${scope} contiene una cantidad inválida.`);
  return parsed;
}

function nonNegativeNumber(value: number | string, scope: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`${scope} contiene una cantidad inválida.`);
  return parsed;
}

function finiteNumber(value: number | string, scope: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${scope} contiene una cantidad inválida.`);
  return parsed;
}

export async function loadRemoteInventory(
  access: PlantAccess[],
  client: SupabaseClient = createClient(),
): Promise<{ products: ProductMaster[]; productions: ProductionRecord[]; movements: InventoryMovement[]; reconciliations: InventoryReconciliation[]; thresholdRevisions: InventoryStockThresholdRevision[] }> {
  if (access.length === 0) return { products: [], productions: [], movements: [], reconciliations: [], thresholdRevisions: [] };
  const plantDbIds = access.map((plant) => plant.dbId);
  const [productsResult, productionsResult, movementsResult, reconciliationsResult, thresholdsResult] = await Promise.all([
    client.from("inventory_products").select("id,name,unit,reference_code,active,created_at").order("name"),
    client.from("production_records").select("id,plant_id,product_id,product_reference_code,quantity,lot_code,source_process,source_pile_id,origin_kind,completed_at,note").in("plant_id", plantDbIds).order("completed_at", { ascending: false }),
    client.from("inventory_movements").select("id,plant_id,product_id,lot_code,kind,quantity,occurred_at,reference_id,destination,note").in("plant_id", plantDbIds).order("occurred_at", { ascending: false }),
    client.from("inventory_reconciliations").select("id,plant_id,product_id,lot_code,expected_quantity,counted_quantity,difference_quantity,note,evidence_urls,adjustment_movement_id,occurred_at").in("plant_id", plantDbIds).order("occurred_at", { ascending: false }),
    client.from("inventory_stock_threshold_revisions").select("id,revision_no,plant_id,product_id,minimum_quantity,note,effective_at,created_at").in("plant_id", plantDbIds).order("revision_no", { ascending: false }),
  ]);
  if (productsResult.error) throw new Error(errorMessage("No fue posible cargar productos", productsResult.error));
  if (productionsResult.error) throw new Error(errorMessage("No fue posible cargar producción", productionsResult.error));
  if (movementsResult.error) throw new Error(errorMessage("No fue posible cargar kardex", movementsResult.error));
  if (reconciliationsResult.error) throw new Error(errorMessage("No fue posible cargar conciliaciones", reconciliationsResult.error));
  if (thresholdsResult.error) throw new Error(errorMessage("No fue posible cargar umbrales de inventario", thresholdsResult.error));

  const products = ((productsResult.data ?? []) as unknown as ProductRow[]).map((row): ProductMaster => ({
    id: row.id,
    name: row.name,
    unit: row.unit,
    referenceCode: row.reference_code || undefined,
    active: row.active,
    createdAt: row.created_at,
  }));
  const productMap = new Map(products.map((product) => [product.id, product]));
  const plantMap = new Map(access.map((plant) => [plant.dbId, plant]));

  const productions = ((productionsResult.data ?? []) as unknown as ProductionRow[]).map((row): ProductionRecord => {
    const plant = plantMap.get(row.plant_id);
    const product = productMap.get(row.product_id);
    if (!plant) throw new Error(`Producción ${row.id} pertenece a una planta no visible.`);
    if (!product) throw new Error(`Producción ${row.id} referencia un producto no visible.`);
    if (row.origin_kind !== "process" && row.origin_kind !== "compost_pile") throw new Error(`Producción ${row.id} contiene un origen no reconocido.`);
    return {
      id: row.id,
      plantId: plant.plantId,
      plant: plant.name,
      productId: product.id,
      productName: product.name,
      productReferenceCode: row.product_reference_code || undefined,
      unit: product.unit,
      quantity: positiveNumber(row.quantity, `Producción ${row.id}`),
      lotCode: row.lot_code,
      sourceProcess: row.source_process,
      sourcePileId: row.source_pile_id || undefined,
      originKind: row.origin_kind,
      completedAt: row.completed_at,
      note: row.note || undefined,
    };
  });

  const movements = ((movementsResult.data ?? []) as unknown as MovementRow[]).map((row): InventoryMovement => {
    const plant = plantMap.get(row.plant_id);
    const product = productMap.get(row.product_id);
    if (!plant) throw new Error(`Movimiento ${row.id} pertenece a una planta no visible.`);
    if (!product) throw new Error(`Movimiento ${row.id} referencia un producto no visible.`);
    return {
      id: row.id,
      plantId: plant.plantId,
      plant: plant.name,
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      lotCode: row.lot_code,
      kind: row.kind,
      quantity: positiveNumber(row.quantity, `Movimiento ${row.id}`),
      occurredAt: row.occurred_at,
      referenceId: row.reference_id || undefined,
      destination: row.destination || undefined,
      note: row.note || undefined,
    };
  });

  const reconciliations = ((reconciliationsResult.data ?? []) as unknown as ReconciliationRow[]).map((row): InventoryReconciliation => {
    const plant = plantMap.get(row.plant_id);
    const product = productMap.get(row.product_id);
    if (!plant) throw new Error(`Conciliación ${row.id} pertenece a una planta no visible.`);
    if (!product) throw new Error(`Conciliación ${row.id} referencia un producto no visible.`);
    return {
      id: row.id,
      plantId: plant.plantId,
      plant: plant.name,
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      lotCode: row.lot_code,
      expectedQuantity: nonNegativeNumber(row.expected_quantity, `Conciliación ${row.id}`),
      countedQuantity: nonNegativeNumber(row.counted_quantity, `Conciliación ${row.id}`),
      differenceQuantity: finiteNumber(row.difference_quantity, `Conciliación ${row.id}`),
      note: row.note,
      evidenceUrls: row.evidence_urls ?? [],
      adjustmentMovementId: row.adjustment_movement_id || undefined,
      occurredAt: row.occurred_at,
    };
  });

  const thresholdRevisions = ((thresholdsResult.data ?? []) as unknown as ThresholdRow[]).map((row): InventoryStockThresholdRevision => {
    const plant = plantMap.get(row.plant_id);
    const product = productMap.get(row.product_id);
    if (!plant) throw new Error(`Umbral ${row.id} pertenece a una planta no visible.`);
    if (!product) throw new Error(`Umbral ${row.id} referencia un producto no visible.`);
    return {
      id: row.id,
      revisionNo: positiveNumber(row.revision_no, `Umbral ${row.id}`),
      plantId: plant.plantId,
      plant: plant.name,
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      minimumQuantity: row.minimum_quantity === null || row.minimum_quantity === undefined ? undefined : positiveNumber(row.minimum_quantity, `Umbral ${row.id}`),
      note: row.note,
      effectiveAt: row.effective_at,
      createdAt: row.created_at,
    };
  });

  return { products, productions, movements, reconciliations, thresholdRevisions };
}

export async function createRemoteInventoryProduct(
  name: string,
  unit: InventoryUnit,
  referenceCode?: string,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.rpc("ops_create_inventory_product", {
    product_name: name.trim(),
    product_unit: unit,
    product_reference_code: referenceCode?.trim() || null,
  });
  if (error) throw new Error(errorMessage("No fue posible crear el producto", error));
  if (typeof data !== "string") throw new Error("El producto fue creado pero el servidor no devolvió un identificador válido.");
  return data;
}

export async function setRemoteInventoryProductReference(
  productId: string,
  referenceCode?: string,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.rpc("ops_set_inventory_product_reference", {
    target_product: productId,
    product_reference_code: referenceCode?.trim() || null,
  });
  if (error) throw new Error(errorMessage("No fue posible actualizar la referencia", error));
  if (typeof data !== "string") throw new Error("La referencia fue actualizada pero el servidor no devolvió un identificador válido.");
  return data;
}

export async function setRemoteInventoryStockThreshold(
  access: PlantAccess[],
  payload: RemoteStockThresholdPayload,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.rpc("ops_set_inventory_stock_threshold", {
    target_plant: remotePlantId(access, payload.plantId),
    target_product: payload.productId,
    threshold_minimum_quantity: payload.minimumQuantity ?? null,
    threshold_note: payload.note.trim(),
  });
  if (error) throw new Error(errorMessage("No fue posible actualizar el umbral de inventario", error));
  if (typeof data !== "string") throw new Error("El umbral fue actualizado pero el servidor no devolvió un identificador válido.");
  return data;
}

export async function recordRemoteProduction(
  access: PlantAccess[],
  payload: RemoteProductionPayload,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.rpc("ops_record_production", {
    target_plant: remotePlantId(access, payload.plantId),
    target_product: payload.productId,
    production_quantity: payload.quantity,
    source_process_name: payload.sourceProcess,
    source_pile: payload.sourcePileId || null,
    production_note: payload.note || null,
  });
  if (error) throw new Error(errorMessage("No fue posible registrar la producción", error));
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.id !== "string" || typeof row.lot_code !== "string") {
    throw new Error("La producción fue registrada pero el servidor no devolvió lote e identificador válidos.");
  }
  return { id: row.id as string, lotCode: row.lot_code as string };
}

export async function dispatchRemoteInventory(
  access: PlantAccess[],
  payload: RemoteDispatchPayload,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.rpc("ops_dispatch_inventory", {
    target_plant: remotePlantId(access, payload.plantId),
    target_product: payload.productId,
    target_lot: payload.lotCode,
    dispatch_quantity: payload.quantity,
    dispatch_destination: payload.destination,
    dispatch_note: payload.note || null,
    dispatch_reference: payload.referenceId || null,
  });
  if (error) throw new Error(errorMessage("No fue posible registrar la salida", error));
  if (typeof data !== "string") throw new Error("La salida fue registrada pero el servidor no devolvió un identificador válido.");
  return data;
}

export async function reconcileRemoteInventory(
  access: PlantAccess[],
  payload: RemoteReconciliationPayload,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.rpc("ops_reconcile_inventory", {
    target_plant: remotePlantId(access, payload.plantId),
    target_product: payload.productId,
    target_lot: payload.lotCode,
    physical_count: payload.countedQuantity,
    reconciliation_note: payload.note,
    reconciliation_evidence: payload.evidenceUrls ?? [],
  });
  if (error) throw new Error(errorMessage("No fue posible conciliar el inventario", error));
  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row.id !== "string") {
    throw new Error("La conciliación fue registrada pero el servidor no devolvió un identificador válido.");
  }
  return {
    id: row.id as string,
    adjustmentMovementId: typeof row.adjustment_movement_id === "string" ? row.adjustment_movement_id : undefined,
    expectedQuantity: Number(row.expected_quantity),
    countedQuantity: Number(row.counted_quantity),
    differenceQuantity: Number(row.difference_quantity),
  };
}
