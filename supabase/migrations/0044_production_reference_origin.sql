-- R2.5C · Product references + structured production origin.
-- Product reference codes are governed master data and are never invented by the system.
-- A production snapshots the reference that was valid when it was recorded. Historical
-- productions are not backfilled with later reference codes. Origin remains independent
-- from finished quantity: linking a compost pile never copies or consumes its mass.

alter table public.inventory_products
  add column if not exists reference_code text;

alter table public.production_records
  add column if not exists product_reference_code text;

alter table public.production_records
  add column if not exists origin_kind text;

-- Existing source_pile_id is explicit evidence, so origin_kind can be derived safely.
update public.production_records
set origin_kind = case when source_pile_id is null then 'process' else 'compost_pile' end
where origin_kind is null;

alter table public.production_records
  alter column origin_kind set default 'process',
  alter column origin_kind set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='inventory_products_reference_code_nonblank'
      and conrelid='public.inventory_products'::regclass
  ) then
    alter table public.inventory_products
      add constraint inventory_products_reference_code_nonblank
      check (reference_code is null or btrim(reference_code) <> '');
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname='production_records_origin_kind_check'
      and conrelid='public.production_records'::regclass
  ) then
    alter table public.production_records
      add constraint production_records_origin_kind_check
      check (origin_kind in ('process','compost_pile'));
  end if;
  if not exists (
    select 1 from pg_constraint
    where conname='production_records_origin_consistency_check'
      and conrelid='public.production_records'::regclass
  ) then
    alter table public.production_records
      add constraint production_records_origin_consistency_check
      check (
        (origin_kind='process' and source_pile_id is null)
        or (origin_kind='compost_pile' and source_pile_id is not null)
      );
  end if;
end;
$$;

create unique index if not exists inventory_products_reference_code_uidx
  on public.inventory_products(lower(btrim(reference_code)))
  where reference_code is not null;

-- Product master mutations become governed RPC-only operations.
drop policy if exists "inventory_products_admin_insert" on public.inventory_products;
drop policy if exists "inventory_products_admin_update" on public.inventory_products;
revoke insert, update, delete on table public.inventory_products from authenticated;
grant select on table public.inventory_products to authenticated;

create or replace function public.ops_create_inventory_product(
  product_name text,
  product_unit text,
  product_reference_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  product_id uuid;
  clean_name text := nullif(btrim(product_name),'');
  clean_reference text := nullif(btrim(product_reference_code),'');
begin
  if not exists (
    select 1 from public.plant_memberships pm
    where pm.user_id=auth.uid()
      and pm.active
      and pm.role in ('admin','director')
  ) then
    raise exception 'No tienes permiso para administrar el maestro de productos.';
  end if;
  if clean_name is null then raise exception 'Escribe el nombre del producto.'; end if;
  if product_unit is null or product_unit not in ('kg','L','unidades') then
    raise exception 'La unidad del producto no es válida.';
  end if;
  if exists (
    select 1 from public.inventory_products p
    where lower(p.name)=lower(clean_name) and p.unit=product_unit
  ) then
    raise exception 'Ya existe un producto con ese nombre y unidad.';
  end if;
  if clean_reference is not null and exists (
    select 1 from public.inventory_products p
    where lower(btrim(p.reference_code))=lower(clean_reference)
  ) then
    raise exception 'Ya existe un producto con esa referencia.';
  end if;

  insert into public.inventory_products(name,unit,reference_code,active,created_by)
  values (clean_name,product_unit,clean_reference,true,auth.uid())
  returning inventory_products.id into product_id;
  return product_id;
end;
$$;

create or replace function public.ops_set_inventory_product_reference(
  target_product uuid,
  product_reference_code text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  clean_reference text := nullif(btrim(product_reference_code),'');
begin
  if not exists (
    select 1 from public.plant_memberships pm
    where pm.user_id=auth.uid()
      and pm.active
      and pm.role in ('admin','director')
  ) then
    raise exception 'No tienes permiso para administrar el maestro de productos.';
  end if;
  if not exists (select 1 from public.inventory_products p where p.id=target_product) then
    raise exception 'Producto no encontrado.';
  end if;
  if clean_reference is not null and exists (
    select 1 from public.inventory_products p
    where p.id<>target_product
      and lower(btrim(p.reference_code))=lower(clean_reference)
  ) then
    raise exception 'Ya existe un producto con esa referencia.';
  end if;

  update public.inventory_products
  set reference_code=clean_reference
  where id=target_product;
  return target_product;
end;
$$;

-- Preserve the established RPC signature while snapshotting reference and origin.
create or replace function public.ops_record_production(
  target_plant uuid,
  target_product uuid,
  production_quantity numeric,
  source_process_name text,
  source_pile uuid default null,
  production_note text default null
)
returns table(id uuid, lot_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  plant_code text;
  prefix text;
  product_active boolean;
  product_reference text;
  production_date date := (now() at time zone 'America/Bogota')::date;
  sequence_no integer;
  generated_lot text;
  production_id uuid;
  structured_origin text;
begin
  if not private.has_plant_role(target_plant,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para registrar producción en esta planta.';
  end if;
  if production_quantity is null or production_quantity <= 0 then
    raise exception 'La cantidad producida debe ser mayor que cero.';
  end if;
  if nullif(btrim(source_process_name),'') is null then
    raise exception 'Indica el proceso que originó esta producción.';
  end if;

  select p.active,p.reference_code into product_active,product_reference
  from public.inventory_products p
  where p.id=target_product;
  if product_active is null then raise exception 'Producto no encontrado.'; end if;
  if not product_active then raise exception 'Selecciona un producto activo.'; end if;

  if source_pile is not null and not exists (
    select 1
    from public.compost_piles cp
    where cp.id=source_pile
      and cp.plant_id=target_plant
      and cp.status='closed'
  ) then
    raise exception 'La pila relacionada debe estar cerrada y pertenecer a la misma planta.';
  end if;
  structured_origin:=case when source_pile is null then 'process' else 'compost_pile' end;

  select p.code into plant_code
  from public.plants p
  where p.id=target_plant and p.active;
  if plant_code is null then raise exception 'Planta no encontrada o inactiva.'; end if;

  prefix := case
    when lower(plant_code) like 'yar%' then 'YAR'
    when lower(plant_code) like 'tam%' then 'TAM'
    else upper(left(regexp_replace(plant_code,'[^a-zA-Z0-9]','','g'),3))
  end;

  perform pg_advisory_xact_lock(hashtextextended('greenatics-production:' || target_plant::text || ':' || production_date::text,0));

  select count(*) + 1 into sequence_no
  from public.production_records pr
  where pr.plant_id=target_plant
    and (pr.completed_at at time zone 'America/Bogota')::date=production_date;

  generated_lot := prefix || '-PROD-' || to_char(production_date,'YYYYMMDD') || '-' || lpad(sequence_no::text,3,'0');

  insert into public.production_records(
    plant_id,product_id,product_reference_code,quantity,lot_code,source_process,source_pile_id,origin_kind,note,created_by
  ) values (
    target_plant,target_product,product_reference,production_quantity,generated_lot,btrim(source_process_name),source_pile,structured_origin,nullif(btrim(production_note),''),auth.uid()
  ) returning production_records.id into production_id;

  return query select production_id,generated_lot;
end;
$$;

revoke all on function public.ops_create_inventory_product(text,text,text) from public,anon;
revoke all on function public.ops_set_inventory_product_reference(uuid,text) from public,anon;
grant execute on function public.ops_create_inventory_product(text,text,text) to authenticated;
grant execute on function public.ops_set_inventory_product_reference(uuid,text) to authenticated;

comment on column public.inventory_products.reference_code is
'Optional governed commercial/operational product reference. The system never invents this value.';
comment on column public.production_records.product_reference_code is
'Immutable snapshot of the product reference that existed when this production was recorded; historical rows are intentionally not backfilled.';
comment on column public.production_records.origin_kind is
'Structured origin classification: process-only or explicit closed compost pile reference. It does not imply mass transfer.';
comment on function public.ops_create_inventory_product(text,text,text) is
'Creates governed finished-goods master data; optional reference codes are user-supplied and globally unique case-insensitively.';
comment on function public.ops_set_inventory_product_reference(uuid,text) is
'Assigns, changes or clears a governed product reference without rewriting historical production snapshots.';
