import type { SupabaseClient } from "@supabase/supabase-js";
import type { InventoryMovement, InventoryUnit, ProductMaster, ProductionRecord } from "@/lib/inventory-domain";
import type { PlantAccess } from "@/lib/ops-data-contract";
import { createClient } from "@/lib/supabase/client";

type ProductRow = {
  id: string;
  name: string;
  unit: InventoryUnit;
  active: boolean;
  created_at: string;
};

type ProductionRow = {
  id: string;
  plant_id: string;
  product_id: string;
  quantity: number | string;
  lot_code: string;
  source_process: string;
  source_pile_id?: string | null;
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

export async function loadRemoteInventory(
  access: PlantAccess[],
  client: SupabaseClient = createClient(),
): Promise<{ products: ProductMaster[]; productions: ProductionRecord[]; movements: InventoryMovement[] }> {
  if (access.length === 0) return { products: [], productions: [], movements: [] };
  const plantDbIds = access.map((plant) => plant.dbId);
  const [productsResult, productionsResult, movementsResult] = await Promise.all([
    client.from("inventory_products").select("id,name,unit,active,created_at").order("name"),
    client.from("production_records").select("id,plant_id,product_id,quantity,lot_code,source_process,source_pile_id,completed_at,note").in("plant_id", plantDbIds).order("completed_at", { ascending: false }),
    client.from("inventory_movements").select("id,plant_id,product_id,lot_code,kind,quantity,occurred_at,reference_id,destination,note").in("plant_id", plantDbIds).order("occurred_at", { ascending: false }),
  ]);
  if (productsResult.error) throw new Error(errorMessage("No fue posible cargar productos", productsResult.error));
  if (productionsResult.error) throw new Error(errorMessage("No fue posible cargar producción", productionsResult.error));
  if (movementsResult.error) throw new Error(errorMessage("No fue posible cargar kardex", movementsResult.error));

  const products = ((productsResult.data ?? []) as unknown as ProductRow[]).map((row): ProductMaster => ({
    id: row.id,
    name: row.name,
    unit: row.unit,
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
    return {
      id: row.id,
      plantId: plant.plantId,
      plant: plant.name,
      productId: product.id,
      productName: product.name,
      unit: product.unit,
      quantity: positiveNumber(row.quantity, `Producción ${row.id}`),
      lotCode: row.lot_code,
      sourceProcess: row.source_process,
      sourcePileId: row.source_pile_id || undefined,
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

  return { products, productions, movements };
}

export async function createRemoteInventoryProduct(
  name: string,
  unit: InventoryUnit,
  client: SupabaseClient = createClient(),
) {
  const { data, error } = await client.from("inventory_products")
    .insert({ name: name.trim(), unit, active: true })
    .select("id")
    .single();
  if (error) {
    if (error.code === "23505") throw new Error("Ya existe un producto con ese nombre y unidad.");
    throw new Error(errorMessage("No fue posible crear el producto", error));
  }
  if (!data?.id) throw new Error("El producto fue creado pero el servidor no devolvió un identificador válido.");
  return data.id as string;
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
