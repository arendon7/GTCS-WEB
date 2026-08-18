-- R2.5B · Physical stock reconciliation.
-- A reconciliation freezes the ledger-derived expected balance and the physical count
-- in one transaction. Any difference produces exactly one append-only adjustment
-- referenced back to the reconciliation. No historical reconciliation is invented.

create table if not exists public.inventory_reconciliations (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete restrict,
  product_id uuid not null references public.inventory_products(id) on delete restrict,
  lot_code text not null check (btrim(lot_code) <> ''),
  expected_quantity numeric not null check (expected_quantity >= 0),
  counted_quantity numeric not null check (counted_quantity >= 0),
  difference_quantity numeric not null,
  note text not null check (btrim(note) <> ''),
  evidence_urls text[] not null default '{}'::text[],
  adjustment_movement_id uuid unique references public.inventory_movements(id) on delete restrict,
  performed_by uuid references auth.users(id) default auth.uid(),
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (difference_quantity = counted_quantity - expected_quantity),
  check (
    (difference_quantity = 0 and adjustment_movement_id is null)
    or (difference_quantity <> 0 and adjustment_movement_id is not null)
  )
);

create index if not exists inventory_reconciliations_lot_idx
  on public.inventory_reconciliations(plant_id,product_id,lot_code,occurred_at desc);
create index if not exists inventory_reconciliations_recent_idx
  on public.inventory_reconciliations(occurred_at desc);

alter table public.inventory_reconciliations enable row level security;

drop policy if exists "inventory_reconciliations_member_select" on public.inventory_reconciliations;
create policy "inventory_reconciliations_member_select"
on public.inventory_reconciliations
for select to authenticated
using ((select private.has_plant_access(plant_id)));

revoke insert, update, delete on table public.inventory_reconciliations from authenticated;
grant select on table public.inventory_reconciliations to authenticated;

create or replace function public.ops_reconcile_inventory(
  target_plant uuid,
  target_product uuid,
  target_lot text,
  physical_count numeric,
  reconciliation_note text,
  reconciliation_evidence text[] default '{}'::text[]
)
returns table(
  id uuid,
  adjustment_movement_id uuid,
  expected_quantity numeric,
  counted_quantity numeric,
  difference_quantity numeric
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  reconciliation_id uuid := gen_random_uuid();
  movement_id uuid;
  normalized_lot text;
  expected_stock numeric;
  difference numeric;
  adjustment_kind text;
  adjustment_quantity numeric;
  clean_evidence text[] := coalesce(reconciliation_evidence,'{}'::text[]);
begin
  if not private.has_plant_role(target_plant,array['supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para conciliar inventario en esta planta.';
  end if;
  if physical_count is null or physical_count < 0 then
    raise exception 'El conteo físico no puede ser negativo.';
  end if;
  if nullif(btrim(target_lot),'') is null then
    raise exception 'Selecciona un lote físico existente.';
  end if;
  if nullif(btrim(reconciliation_note),'') is null then
    raise exception 'Registra la observación del conteo físico.';
  end if;
  if length(btrim(reconciliation_note)) > 1000 then
    raise exception 'La observación de conciliación es demasiado larga.';
  end if;
  if exists (select 1 from unnest(clean_evidence) value where nullif(btrim(value),'') is null) then
    raise exception 'Las evidencias de conciliación no pueden contener valores vacíos.';
  end if;
  if not exists (select 1 from public.inventory_products p where p.id=target_product) then
    raise exception 'Producto no encontrado.';
  end if;

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

  -- Serialize every stock-changing operation for this exact physical lot.
  perform pg_advisory_xact_lock(hashtextextended(target_plant::text || '|' || target_product::text || '|' || normalized_lot,0));
  select private.inventory_stock(target_plant,target_product,normalized_lot) into expected_stock;
  if expected_stock < 0 then
    raise exception 'El kardex presenta saldo negativo y requiere revisión técnica antes de conciliar.';
  end if;

  difference:=physical_count-expected_stock;
  if difference <> 0 then
    adjustment_kind:=case when difference > 0 then 'adjustment_in' else 'adjustment_out' end;
    adjustment_quantity:=abs(difference);
    insert into public.inventory_movements(
      plant_id,product_id,lot_code,kind,quantity,reference_id,note,created_by
    ) values (
      target_plant,target_product,normalized_lot,adjustment_kind,adjustment_quantity,
      reconciliation_id,'Conciliación física: ' || btrim(reconciliation_note),auth.uid()
    ) returning inventory_movements.id into movement_id;
  end if;

  insert into public.inventory_reconciliations(
    id,plant_id,product_id,lot_code,expected_quantity,counted_quantity,difference_quantity,
    note,evidence_urls,adjustment_movement_id,performed_by
  ) values (
    reconciliation_id,target_plant,target_product,normalized_lot,expected_stock,physical_count,difference,
    btrim(reconciliation_note),clean_evidence,movement_id,auth.uid()
  );

  return query select reconciliation_id,movement_id,expected_stock,physical_count,difference;
end;
$$;

revoke all on function public.ops_reconcile_inventory(uuid,uuid,text,numeric,text,text[]) from public,anon;
grant execute on function public.ops_reconcile_inventory(uuid,uuid,text,numeric,text,text[]) to authenticated;

comment on table public.inventory_reconciliations is
'Immutable physical-count ledger. Each row freezes expected kardex balance vs counted balance; non-zero differences reference exactly one append-only inventory adjustment.';
comment on function public.ops_reconcile_inventory(uuid,uuid,text,numeric,text,text[]) is
'Atomically reconciles one existing physical lot using the current serialized kardex balance and an operator-supplied physical count.';
