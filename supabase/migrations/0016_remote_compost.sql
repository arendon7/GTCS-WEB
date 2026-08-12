-- CORE-003 · transactional compost operations.
-- Cross-table invariants live in PostgreSQL so the UI cannot create partial or impossible states.

create or replace function public.ops_create_compost_pile(
  target_plant uuid,
  pile_location text,
  source_receipt_ids uuid[],
  initial_weight numeric
)
returns table(id uuid, code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplied_count integer;
  valid_count integer;
  plant_code text;
  prefix text;
  pile_date date := (now() at time zone 'America/Bogota')::date;
  sequence_no integer;
  generated_code text;
  pile_id uuid;
begin
  if not private.has_plant_role(target_plant,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para crear pilas en esta planta.';
  end if;
  if nullif(btrim(pile_location),'') is null then raise exception 'Indica la ubicación de la pila.'; end if;
  if initial_weight is null or initial_weight <= 0 then raise exception 'El peso inicial medido debe ser mayor que cero.'; end if;

  supplied_count := coalesce(cardinality(source_receipt_ids),0);
  if supplied_count = 0 then raise exception 'Selecciona al menos un lote de origen.'; end if;
  if supplied_count <> (select count(distinct value) from unnest(source_receipt_ids) as value) then
    raise exception 'Los lotes de origen contienen duplicados.';
  end if;

  select count(*) into valid_count
  from public.material_receipts r
  where r.id = any(source_receipt_ids)
    and r.plant_id = target_plant
    and r.acceptance_status in ('accepted','conditioned');
  if valid_count <> supplied_count then
    raise exception 'Uno o más lotes no pertenecen a la planta o no están aceptados para proceso.';
  end if;

  select p.code into plant_code from public.plants p where p.id=target_plant and p.active;
  if plant_code is null then raise exception 'Planta no encontrada o inactiva.'; end if;
  prefix := case
    when lower(plant_code) like 'yar%' then 'YAR'
    when lower(plant_code) like 'tam%' then 'TAM'
    else upper(left(regexp_replace(plant_code,'[^a-zA-Z0-9]','','g'),3))
  end;

  perform pg_advisory_xact_lock(hashtextextended('greenatics-compost:' || target_plant::text || ':' || pile_date::text,0));
  select count(*) + 1 into sequence_no
  from public.compost_piles p
  where p.plant_id=target_plant
    and (p.started_at at time zone 'America/Bogota')::date=pile_date;
  generated_code := prefix || '-COMP-' || to_char(pile_date,'YYYYMMDD') || '-' || lpad(sequence_no::text,3,'0');

  insert into public.compost_piles(plant_id,code,location,initial_weight_kg,created_by)
  values(target_plant,generated_code,btrim(pile_location),initial_weight,auth.uid())
  returning compost_piles.id into pile_id;

  insert into public.compost_pile_sources(pile_id,material_receipt_id)
  select pile_id,value from unnest(source_receipt_ids) as value;

  return query select pile_id,generated_code;
end;
$$;

create or replace function public.ops_record_compost_measurement(
  target_pile uuid,
  temperature_points numeric[],
  humidity numeric default null,
  measurement_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  pile public.compost_piles%rowtype;
  measurement_id uuid;
begin
  select * into pile from public.compost_piles where id=target_pile for update;
  if not found then raise exception 'Pila no encontrada.'; end if;
  if not private.has_plant_role(pile.plant_id,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para registrar controles en esta planta.';
  end if;
  if pile.status='closed' then raise exception 'No se pueden registrar controles en una pila cerrada.'; end if;
  if temperature_points is null or cardinality(temperature_points) not between 3 and 5 then raise exception 'Registra entre 3 y 5 puntos de temperatura.'; end if;
  if exists(select 1 from unnest(temperature_points) as value where value is null) then
    raise exception 'Todas las temperaturas deben ser numéricas.';
  end if;
  if humidity is not null and (humidity < 0 or humidity > 100) then raise exception 'La humedad debe estar entre 0 y 100 %.'; end if;

  insert into public.compost_measurements(pile_id,temperature_points_c,humidity_pct,notes,created_by)
  values(pile.id,temperature_points,humidity,nullif(btrim(measurement_notes),''),auth.uid())
  returning compost_measurements.id into measurement_id;
  return measurement_id;
end;
$$;

create or replace function public.ops_start_compost_maturation(target_pile uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  pile public.compost_piles%rowtype;
  started_at timestamptz := now();
begin
  select * into pile from public.compost_piles where id=target_pile for update;
  if not found then raise exception 'Pila no encontrada.'; end if;
  if not private.has_plant_role(pile.plant_id,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para cambiar esta pila.';
  end if;
  if pile.status <> 'active' then
    if pile.status='closed' then raise exception 'La pila ya está cerrada.'; end if;
    raise exception 'La pila ya está en maduración.';
  end if;

  update public.compost_piles
  set status='maturing',maturation_started_at=started_at
  where id=pile.id;
  return started_at;
end;
$$;

create or replace function public.ops_close_compost_pile(target_pile uuid, final_weight numeric)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  pile public.compost_piles%rowtype;
  finished_at timestamptz := now();
begin
  select * into pile from public.compost_piles where id=target_pile for update;
  if not found then raise exception 'Pila no encontrada.'; end if;
  if not private.has_plant_role(pile.plant_id,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para cerrar esta pila.';
  end if;
  if pile.status <> 'maturing' or pile.maturation_started_at is null then
    raise exception 'La pila debe estar en maduración antes de cerrarse.';
  end if;
  if final_weight is null or final_weight <= 0 then raise exception 'El peso final debe ser mayor que cero.'; end if;

  update public.compost_piles
  set status='closed',final_weight_kg=final_weight,closed_at=finished_at
  where id=pile.id;
  return finished_at;
end;
$$;

revoke all on function public.ops_create_compost_pile(uuid,text,uuid[],numeric) from public,anon;
revoke all on function public.ops_record_compost_measurement(uuid,numeric[],numeric,text) from public,anon;
revoke all on function public.ops_start_compost_maturation(uuid) from public,anon;
revoke all on function public.ops_close_compost_pile(uuid,numeric) from public,anon;

grant execute on function public.ops_create_compost_pile(uuid,text,uuid[],numeric) to authenticated;
grant execute on function public.ops_record_compost_measurement(uuid,numeric[],numeric,text) to authenticated;
grant execute on function public.ops_start_compost_maturation(uuid) to authenticated;
grant execute on function public.ops_close_compost_pile(uuid,numeric) to authenticated;
