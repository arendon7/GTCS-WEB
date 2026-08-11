create table if not exists inventory_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null check (unit in ('kg','L','unidades')),
  active boolean not null default true,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  unique (lower(name), unit)
);

create table if not exists production_records (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id),
  product_id uuid not null references inventory_products(id),
  quantity numeric not null check (quantity > 0),
  lot_code text not null unique,
  source_process text not null check (btrim(source_process) <> ''),
  source_pile_id uuid references compost_piles(id) on delete restrict,
  completed_at timestamptz not null default now(),
  note text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now()
);

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references plants(id),
  product_id uuid not null references inventory_products(id),
  lot_code text not null,
  kind text not null check (kind in ('production','dispatch','adjustment_in','adjustment_out')),
  quantity numeric not null check (quantity > 0),
  reference_id uuid,
  destination text,
  note text,
  occurred_at timestamptz not null default now(),
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  check (kind <> 'dispatch' or btrim(coalesce(destination,'')) <> '')
);

create index if not exists production_records_plant_completed_idx on production_records(plant_id, completed_at desc);
create index if not exists inventory_movements_lot_idx on inventory_movements(plant_id, product_id, lot_code, occurred_at);
create index if not exists inventory_movements_recent_idx on inventory_movements(occurred_at desc);

create or replace function private.inventory_signed_quantity(target_kind text, target_quantity numeric)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select case when target_kind in ('dispatch','adjustment_out') then -target_quantity else target_quantity end;
$$;

create or replace function private.inventory_stock(target_plant uuid, target_product uuid, target_lot text)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(sum(private.inventory_signed_quantity(m.kind, m.quantity)),0)
  from public.inventory_movements m
  where m.plant_id = target_plant
    and m.product_id = target_product
    and m.lot_code = target_lot;
$$;

create or replace function private.guard_inventory_outflow()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  available numeric;
begin
  if new.kind not in ('dispatch','adjustment_out') then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.plant_id::text || '|' || new.product_id::text || '|' || new.lot_code, 0));
  select private.inventory_stock(new.plant_id, new.product_id, new.lot_code) into available;

  if new.quantity > available then
    raise exception 'Stock insuficiente para lote %. Disponible %, solicitado %', new.lot_code, available, new.quantity
      using errcode = '23514';
  end if;
  return new;
end;
$$;

create or replace function private.production_to_inventory()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.inventory_movements (
    plant_id, product_id, lot_code, kind, quantity, reference_id, occurred_at, created_by, note
  ) values (
    new.plant_id, new.product_id, new.lot_code, 'production', new.quantity, new.id, new.completed_at, new.created_by, new.note
  );
  return new;
end;
$$;

revoke all on function private.inventory_signed_quantity(text,numeric) from public;
revoke all on function private.inventory_stock(uuid,uuid,text) from public;
revoke all on function private.guard_inventory_outflow() from public;
revoke all on function private.production_to_inventory() from public;
grant execute on function private.inventory_signed_quantity(text,numeric) to authenticated;
grant execute on function private.inventory_stock(uuid,uuid,text) to authenticated;

drop trigger if exists inventory_outflow_guard on inventory_movements;
create trigger inventory_outflow_guard
before insert on inventory_movements
for each row execute function private.guard_inventory_outflow();

drop trigger if exists production_inventory_entry on production_records;
create trigger production_inventory_entry
after insert on production_records
for each row execute function private.production_to_inventory();

alter table inventory_products enable row level security;
alter table production_records enable row level security;
alter table inventory_movements enable row level security;

create policy "inventory_products_member_select" on inventory_products for select to authenticated
using (exists (
  select 1 from public.plant_memberships pm
  where pm.user_id = (select auth.uid()) and pm.active
));
create policy "inventory_products_admin_insert" on inventory_products for insert to authenticated
with check (exists (
  select 1 from public.plant_memberships pm
  where pm.user_id = (select auth.uid()) and pm.active and pm.role in ('admin','director')
));
create policy "inventory_products_admin_update" on inventory_products for update to authenticated
using (exists (
  select 1 from public.plant_memberships pm
  where pm.user_id = (select auth.uid()) and pm.active and pm.role in ('admin','director')
))
with check (exists (
  select 1 from public.plant_memberships pm
  where pm.user_id = (select auth.uid()) and pm.active and pm.role in ('admin','director')
));

create policy "production_member_select" on production_records for select to authenticated
using ((select private.has_plant_access(plant_id)));
create policy "production_operator_insert" on production_records for insert to authenticated
with check ((select private.has_plant_role(plant_id, array['operator','supervisor','technical','admin','director'])));

create policy "inventory_movements_member_select" on inventory_movements for select to authenticated
using ((select private.has_plant_access(plant_id)));
create policy "inventory_dispatch_insert" on inventory_movements for insert to authenticated
with check (
  kind = 'dispatch'
  and (select private.has_plant_role(plant_id, array['operator','supervisor','technical','admin','director']))
);
create policy "inventory_adjustment_insert" on inventory_movements for insert to authenticated
with check (
  kind in ('adjustment_in','adjustment_out')
  and (select private.has_plant_role(plant_id, array['supervisor','technical','admin','director']))
);

-- No UPDATE/DELETE policies for production records or inventory movements.
-- Corrections are append-only inventory adjustments, preserving operational auditability.
