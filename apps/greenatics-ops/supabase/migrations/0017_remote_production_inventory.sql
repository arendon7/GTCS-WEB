-- CORE-003 · transactional production and finished-goods inventory operations.
-- Production remains append-only and creates its inventory entry through the existing trigger.

insert into public.inventory_products(name,unit,active)
select 'Wondergreen sólido','kg',true
where not exists (
  select 1 from public.inventory_products p where lower(p.name)=lower('Wondergreen sólido') and p.unit='kg'
);

insert into public.inventory_products(name,unit,active)
select 'Wondergreen líquido','L',true
where not exists (
  select 1 from public.inventory_products p where lower(p.name)=lower('Wondergreen líquido') and p.unit='L'
);

insert into public.inventory_products(name,unit,active)
select 'Material estabilizado / compost','kg',true
where not exists (
  select 1 from public.inventory_products p where lower(p.name)=lower('Material estabilizado / compost') and p.unit='kg'
);

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
  production_date date := (now() at time zone 'America/Bogota')::date;
  sequence_no integer;
  generated_lot text;
  production_id uuid;
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

  select p.active into product_active
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
    plant_id,product_id,quantity,lot_code,source_process,source_pile_id,note,created_by
  ) values (
    target_plant,target_product,production_quantity,generated_lot,btrim(source_process_name),source_pile,nullif(btrim(production_note),''),auth.uid()
  ) returning production_records.id into production_id;

  return query select production_id,generated_lot;
end;
$$;

create or replace function public.ops_dispatch_inventory(
  target_plant uuid,
  target_product uuid,
  target_lot text,
  dispatch_quantity numeric,
  dispatch_destination text,
  dispatch_note text default null,
  dispatch_reference uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  product_active boolean;
  movement_id uuid;
begin
  if not private.has_plant_role(target_plant,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para registrar salidas en esta planta.';
  end if;
  if nullif(btrim(target_lot),'') is null then raise exception 'Selecciona un lote con stock.'; end if;
  if dispatch_quantity is null or dispatch_quantity <= 0 then raise exception 'La cantidad de salida debe ser mayor que cero.'; end if;
  if nullif(btrim(dispatch_destination),'') is null then raise exception 'Indica el destino de la salida.'; end if;

  select p.active into product_active
  from public.inventory_products p
  where p.id=target_product;
  if product_active is null then raise exception 'Producto no encontrado.'; end if;
  if not product_active then raise exception 'Producto inactivo.'; end if;

  if not exists (
    select 1 from public.inventory_movements m
    where m.plant_id=target_plant and m.product_id=target_product and m.lot_code=target_lot
  ) then
    raise exception 'El lote seleccionado no existe para este producto y planta.';
  end if;

  insert into public.inventory_movements(
    plant_id,product_id,lot_code,kind,quantity,reference_id,destination,note,created_by
  ) values (
    target_plant,target_product,btrim(target_lot),'dispatch',dispatch_quantity,dispatch_reference,btrim(dispatch_destination),nullif(btrim(dispatch_note),''),auth.uid()
  ) returning inventory_movements.id into movement_id;

  -- The existing BEFORE INSERT inventory_outflow_guard serializes the exact lot
  -- and rejects this transaction if it would leave a negative balance.
  return movement_id;
end;
$$;

revoke all on function public.ops_record_production(uuid,uuid,numeric,text,uuid,text) from public,anon;
revoke all on function public.ops_dispatch_inventory(uuid,uuid,text,numeric,text,text,uuid) from public,anon;

grant execute on function public.ops_record_production(uuid,uuid,numeric,text,uuid,text) to authenticated;
grant execute on function public.ops_dispatch_inventory(uuid,uuid,text,numeric,text,text,uuid) to authenticated;
