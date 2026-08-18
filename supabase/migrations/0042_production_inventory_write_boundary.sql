-- R2.5A · Production + finished-goods inventory write boundary.
-- The app already uses guarded SECURITY DEFINER RPCs for production and dispatch,
-- but legacy table INSERT policies still allowed authenticated clients to bypass those
-- transactional contracts. New writes are RPC-only; the append-only ledgers remain readable.

-- Remove legacy direct-DML paths.
drop policy if exists "production_operator_insert" on public.production_records;
drop policy if exists "inventory_dispatch_insert" on public.inventory_movements;
drop policy if exists "inventory_adjustment_insert" on public.inventory_movements;

revoke insert, update, delete on table public.production_records from authenticated;
revoke insert, update, delete on table public.inventory_movements from authenticated;

grant select on table public.production_records to authenticated;
grant select on table public.inventory_movements to authenticated;

-- Preserve governed stock corrections without reopening direct table writes.
-- Adjustments can only target an existing physical lot and require an explicit reason.
create or replace function public.ops_adjust_inventory(
  target_plant uuid,
  target_product uuid,
  target_lot text,
  adjustment_kind text,
  adjustment_quantity numeric,
  adjustment_reason text,
  adjustment_reference uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  product_active boolean;
  movement_id uuid;
  normalized_lot text;
begin
  if not private.has_plant_role(target_plant,array['supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para ajustar inventario en esta planta.';
  end if;
  if adjustment_kind is null or adjustment_kind not in ('adjustment_in','adjustment_out') then
    raise exception 'El tipo de ajuste debe ser adjustment_in o adjustment_out.';
  end if;
  if adjustment_quantity is null or adjustment_quantity <= 0 then
    raise exception 'La cantidad del ajuste debe ser mayor que cero.';
  end if;
  if nullif(btrim(target_lot),'') is null then
    raise exception 'Selecciona un lote físico existente.';
  end if;
  if nullif(btrim(adjustment_reason),'') is null then
    raise exception 'Registra el motivo del ajuste.';
  end if;
  if length(btrim(adjustment_reason)) > 1000 then
    raise exception 'El motivo del ajuste es demasiado largo.';
  end if;

  select p.active into product_active
  from public.inventory_products p
  where p.id=target_product;
  if product_active is null then raise exception 'Producto no encontrado.'; end if;
  if not product_active then raise exception 'Producto inactivo.'; end if;

  normalized_lot:=btrim(target_lot);
  if not exists (
    select 1
    from public.inventory_movements m
    where m.plant_id=target_plant
      and m.product_id=target_product
      and m.lot_code=normalized_lot
  ) then
    raise exception 'El lote seleccionado no existe para este producto y planta.';
  end if;

  insert into public.inventory_movements(
    plant_id,product_id,lot_code,kind,quantity,reference_id,note,created_by
  ) values (
    target_plant,target_product,normalized_lot,adjustment_kind,adjustment_quantity,
    adjustment_reference,btrim(adjustment_reason),auth.uid()
  ) returning inventory_movements.id into movement_id;

  -- adjustment_out is still serialized and protected by inventory_outflow_guard.
  return movement_id;
end;
$$;

revoke all on function public.ops_adjust_inventory(uuid,uuid,text,text,numeric,text,uuid) from public,anon;
grant execute on function public.ops_adjust_inventory(uuid,uuid,text,text,numeric,text,uuid) to authenticated;

comment on table public.production_records is
'Append-only finished-goods production ledger. Authenticated clients read through plant RLS; new production is RPC-only through ops_record_production.';
comment on table public.inventory_movements is
'Append-only finished-goods kardex. Authenticated clients read through plant RLS; dispatches and adjustments are RPC-only.';
comment on function public.ops_adjust_inventory(uuid,uuid,text,text,numeric,text,uuid) is
'Governed append-only finished-goods stock correction for an existing lot; restricted to supervisor/technical/admin/director roles.';
