-- R2.3 · Compostaje -> Bitácora canónica.
-- Every new Compost V2 operational event creates exactly one canonical activity in the same transaction.
-- Existing compost events remain nullable to avoid inventing or duplicating historical activity records.

alter table public.compost_events
  add column if not exists activity_id uuid;

alter table public.compost_events
  drop constraint if exists compost_events_activity_plant_fk;
alter table public.compost_events
  add constraint compost_events_activity_plant_fk
  foreign key (activity_id,plant_id)
  references public.activities(id,plant_id)
  on delete restrict;

create unique index if not exists compost_events_activity_uidx
  on public.compost_events(activity_id)
  where activity_id is not null;

create or replace function private.insert_compost_activity(
  target_plant uuid,
  pile_code text,
  event_kind text,
  activity_started_at timestamptz,
  activity_ended_at timestamptz,
  result_quantity numeric,
  result_unit text,
  employee_ids uuid[],
  event_notes text default null
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  canonical_process uuid;
  process_name text;
  template_code text;
  template_id uuid;
  template_name text;
  activity_title text;
  activity_id uuid;
  effective_unit text;
begin
  select p.id,p.name
  into canonical_process,process_name
  from public.operational_processes p
  where p.plant_id=target_plant and p.code='COMPOSTAJE' and p.active;
  if not found then raise exception 'La planta no tiene un proceso activo de compostaje.'; end if;

  template_code := case event_kind
    when 'formation' then 'CONFORMACION_PILAS'
    when 'turning' then 'VOLTEO_COMPOSTAJE'
    when 'hydration' then 'HIDRATAR_PILAS_COMPOST'
    else null
  end;

  if template_code is not null then
    select t.id,t.name
    into template_id,template_name
    from public.activity_templates t
    where t.plant_id=target_plant
      and t.process_id=canonical_process
      and t.code=template_code
      and t.active;
  end if;

  activity_title := coalesce(
    template_name,
    case event_kind
      when 'formation' then 'Conformación de pila'
      when 'turning' then 'Volteo de compostaje'
      when 'hydration' then 'Hidratación de pila'
      else 'Intervención de compostaje'
    end
  );

  if result_quantity is not null and result_quantity<=0 then
    raise exception 'La cantidad operacional debe ser mayor que cero.';
  end if;
  effective_unit := case when result_quantity is null then null else nullif(btrim(result_unit),'') end;
  if result_quantity is not null and effective_unit is null then
    raise exception 'La actividad de compostaje requiere unidad para su cantidad operacional.';
  end if;
  if effective_unit is not null and not exists(
    select 1 from public.measurement_units u where u.code=effective_unit and u.active
  ) then
    raise exception 'La unidad operacional del evento de compostaje no es válida.';
  end if;

  insert into public.activities(
    plant_id,title,process,started_at,ended_at,quantity,unit,
    process_id,activity_template_id,activity_comment,source_kind,created_by
  ) values (
    target_plant,activity_title,process_name,activity_started_at,activity_ended_at,result_quantity,effective_unit,
    canonical_process,template_id,
    case
      when nullif(btrim(event_notes),'') is null then 'Pila '||pile_code
      else 'Pila '||pile_code||' · '||btrim(event_notes)
    end,
    'app',auth.uid()
  ) returning public.activities.id into activity_id;

  insert into public.activity_workers(activity_id,employee_id)
  select activity_id,value from unnest(employee_ids) value;

  return activity_id;
end;
$$;

revoke all on function private.insert_compost_activity(uuid,text,text,timestamptz,timestamptz,numeric,text,uuid[],text)
from public,anon,authenticated;

create or replace function public.ops_create_compost_pile_v2(
  target_plant uuid,
  pile_location text,
  intake_lot_ids uuid[],
  intake_allocations_kg numeric[],
  formation_started_at timestamptz,
  formation_ended_at timestamptz,
  formation_volume_m3 numeric,
  employee_ids uuid[],
  formation_notes text default null
)
returns table(id uuid, code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplied_count integer;
  worker_count integer;
  valid_count integer;
  plant_code text;
  prefix text;
  pile_date date;
  sequence_no integer;
  generated_code text;
  new_pile_id uuid;
  formation_event_id uuid;
  formation_activity_id uuid;
  idx integer;
  lot_available numeric;
  lot_status text;
  total_mass numeric := 0;
begin
  if not private.has_plant_role(target_plant,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para crear pilas en esta planta.';
  end if;
  if nullif(btrim(pile_location),'') is null then raise exception 'Indica la ubicación de la pila.'; end if;
  if formation_started_at is null or formation_ended_at is null then raise exception 'Indica inicio y fin de la conformación.'; end if;
  if formation_ended_at < formation_started_at then raise exception 'El fin de conformación no puede ser anterior al inicio.'; end if;
  if formation_ended_at > now() + interval '5 minutes' then raise exception 'La conformación no puede finalizar en el futuro.'; end if;
  if formation_volume_m3 is null or formation_volume_m3 <= 0 then raise exception 'Registra el volumen conformado en m3.'; end if;

  supplied_count := coalesce(cardinality(intake_lot_ids),0);
  if supplied_count=0 then raise exception 'Selecciona al menos un lote físico de origen.'; end if;
  if supplied_count <> coalesce(cardinality(intake_allocations_kg),0) then raise exception 'Cada lote físico debe tener una masa asignada.'; end if;
  if supplied_count <> (select count(distinct value) from unnest(intake_lot_ids) value) then raise exception 'Los lotes físicos contienen duplicados.'; end if;
  if exists(select 1 from unnest(intake_allocations_kg) value where value is null or value <= 0) then raise exception 'Las masas asignadas deben ser mayores que cero.'; end if;

  worker_count := coalesce(cardinality(employee_ids),0);
  if worker_count=0 then raise exception 'Selecciona al menos un trabajador para la conformación.'; end if;
  if worker_count <> (select count(distinct value) from unnest(employee_ids) value) then raise exception 'Los trabajadores de conformación contienen duplicados.'; end if;
  select count(*) into valid_count from public.employees e where e.id=any(employee_ids) and e.plant_id=target_plant and e.active;
  if valid_count<>worker_count then raise exception 'Uno o más trabajadores no pertenecen a la planta o están inactivos.'; end if;

  -- Reuse Bitácora 2.0 worker locking/overlap rules before any physical material mutation.
  perform private.assert_activity_log_workers(target_plant,employee_ids,formation_started_at,formation_ended_at);

  select count(*) into valid_count from public.material_intake_lots l
  where l.id=any(intake_lot_ids) and l.plant_id=target_plant and l.status in ('available','in_process') and l.available_mass_kg>0;
  if valid_count<>supplied_count then raise exception 'Uno o más lotes no pertenecen a la planta, están en cuarentena o no tienen masa disponible.'; end if;

  perform 1 from public.material_intake_lots l where l.id=any(intake_lot_ids) order by l.id for update;
  for idx in 1..supplied_count loop
    select l.available_mass_kg,l.status into lot_available,lot_status from public.material_intake_lots l where l.id=intake_lot_ids[idx];
    if lot_status not in ('available','in_process') then raise exception 'El lote físico % ya no está disponible para proceso.',intake_lot_ids[idx]; end if;
    if intake_allocations_kg[idx] > lot_available then raise exception 'La masa asignada supera la masa disponible del lote físico %.',intake_lot_ids[idx]; end if;
    total_mass := total_mass + intake_allocations_kg[idx];
  end loop;

  select p.code into plant_code from public.plants p where p.id=target_plant and p.active;
  if plant_code is null then raise exception 'Planta no encontrada o inactiva.'; end if;
  prefix := case when lower(plant_code) like 'yar%' then 'YAR' when lower(plant_code) like 'tam%' then 'TAM' else upper(left(regexp_replace(plant_code,'[^a-zA-Z0-9]','','g'),3)) end;
  pile_date := (formation_started_at at time zone 'America/Bogota')::date;
  perform pg_advisory_xact_lock(hashtextextended('greenatics-compost:'||target_plant::text||':'||pile_date::text,0));
  select count(*)+1 into sequence_no from public.compost_piles p where p.plant_id=target_plant and (p.started_at at time zone 'America/Bogota')::date=pile_date;
  generated_code := prefix||'-COMP-'||to_char(pile_date,'YYYYMMDD')||'-'||lpad(sequence_no::text,3,'0');

  insert into public.compost_piles(plant_id,code,location,initial_weight_kg,started_at,created_by)
  values(target_plant,generated_code,btrim(pile_location),total_mass,formation_started_at,auth.uid()) returning compost_piles.id into new_pile_id;

  insert into public.compost_pile_sources(pile_id,material_receipt_id)
  select distinct new_pile_id,l.receipt_id from public.material_intake_lots l where l.id=any(intake_lot_ids);

  for idx in 1..supplied_count loop
    insert into public.compost_pile_intake_sources(pile_id,intake_lot_id,plant_id,allocated_mass_kg,allocation_confirmed,created_by)
    values(new_pile_id,intake_lot_ids[idx],target_plant,intake_allocations_kg[idx],true,auth.uid());
    update public.material_intake_lots as l
    set available_mass_kg=l.available_mass_kg-intake_allocations_kg[idx],
        status=case when l.available_mass_kg-intake_allocations_kg[idx] <= 0.001 then 'depleted' else 'in_process' end
    where l.id=intake_lot_ids[idx];
  end loop;

  formation_activity_id := private.insert_compost_activity(
    target_plant,generated_code,'formation',formation_started_at,formation_ended_at,
    total_mass,'kg',employee_ids,formation_notes
  );

  insert into public.compost_events(pile_id,plant_id,activity_id,event_type,started_at,ended_at,volume_m3,notes,created_by)
  values(new_pile_id,target_plant,formation_activity_id,'formation',formation_started_at,formation_ended_at,formation_volume_m3,nullif(btrim(formation_notes),''),auth.uid())
  returning compost_events.id into formation_event_id;
  insert into public.compost_event_workers(event_id,employee_id,plant_id)
  select formation_event_id,value,target_plant from unnest(employee_ids) value;

  return query select new_pile_id,generated_code;
end;
$$;

create or replace function public.ops_record_compost_event_v2(
  target_pile uuid,
  event_kind text,
  event_started_at timestamptz,
  event_ended_at timestamptz,
  event_volume_m3 numeric,
  employee_ids uuid[],
  event_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  pile public.compost_piles%rowtype;
  event_id uuid;
  event_activity_id uuid;
  worker_count integer;
  valid_count integer;
begin
  select * into pile from public.compost_piles where id=target_pile for update;
  if not found then raise exception 'Pila no encontrada.'; end if;
  if not private.has_plant_role(pile.plant_id,array['operator','supervisor','technical','admin','director']) then raise exception 'No tienes permiso para registrar eventos en esta planta.'; end if;
  if pile.status='closed' then raise exception 'No se pueden registrar eventos en una pila cerrada.'; end if;
  if event_kind not in ('turning','hydration','other') then raise exception 'Tipo de evento de compostaje inválido.'; end if;
  if event_started_at is null or event_ended_at is null then raise exception 'Indica inicio y fin del evento.'; end if;
  if event_ended_at < event_started_at then raise exception 'El fin del evento no puede ser anterior al inicio.'; end if;
  if event_started_at < pile.started_at then raise exception 'El evento no puede ocurrir antes de la conformación de la pila.'; end if;
  if event_ended_at > now()+interval '5 minutes' then raise exception 'El evento no puede finalizar en el futuro.'; end if;
  if event_kind='turning' and (event_volume_m3 is null or event_volume_m3<=0) then raise exception 'Registra el volumen volteado en m3.'; end if;
  if event_volume_m3 is not null and event_volume_m3<=0 then raise exception 'El volumen del evento debe ser mayor que cero.'; end if;

  worker_count := coalesce(cardinality(employee_ids),0);
  if worker_count=0 then raise exception 'Selecciona al menos un trabajador para el evento.'; end if;
  if worker_count<>(select count(distinct value) from unnest(employee_ids) value) then raise exception 'Los trabajadores del evento contienen duplicados.'; end if;
  select count(*) into valid_count from public.employees e where e.id=any(employee_ids) and e.plant_id=pile.plant_id and e.active;
  if valid_count<>worker_count then raise exception 'Uno o más trabajadores no pertenecen a la planta o están inactivos.'; end if;

  perform private.assert_activity_log_workers(pile.plant_id,employee_ids,event_started_at,event_ended_at);

  event_activity_id := private.insert_compost_activity(
    pile.plant_id,pile.code,event_kind,event_started_at,event_ended_at,
    event_volume_m3,case when event_volume_m3 is null then null else 'm3' end,employee_ids,event_notes
  );

  insert into public.compost_events(pile_id,plant_id,activity_id,event_type,started_at,ended_at,volume_m3,notes,created_by)
  values(pile.id,pile.plant_id,event_activity_id,event_kind,event_started_at,event_ended_at,event_volume_m3,nullif(btrim(event_notes),''),auth.uid())
  returning compost_events.id into event_id;
  insert into public.compost_event_workers(event_id,employee_id,plant_id)
  select event_id,value,pile.plant_id from unnest(employee_ids) value;
  return event_id;
end;
$$;

revoke all on function public.ops_create_compost_pile_v2(uuid,text,uuid[],numeric[],timestamptz,timestamptz,numeric,uuid[],text)
from public,anon;
revoke all on function public.ops_record_compost_event_v2(uuid,text,timestamptz,timestamptz,numeric,uuid[],text)
from public,anon;
grant execute on function public.ops_create_compost_pile_v2(uuid,text,uuid[],numeric[],timestamptz,timestamptz,numeric,uuid[],text) to authenticated;
grant execute on function public.ops_record_compost_event_v2(uuid,text,timestamptz,timestamptz,numeric,uuid[],text) to authenticated;

comment on column public.compost_events.activity_id is 'Canonical activity produced atomically by the Compost V2 RPC for new events; null is reserved for pre-link historical events.';
comment on function private.insert_compost_activity(uuid,text,text,timestamptz,timestamptz,numeric,text,uuid[],text) is 'Internal bridge from a validated compost event to one canonical operational activity and its workers.';
comment on function public.ops_create_compost_pile_v2(uuid,text,uuid[],numeric[],timestamptz,timestamptz,numeric,uuid[],text) is 'Creates a pile from physical intake lots and atomically records both formation event and canonical activity.';
comment on function public.ops_record_compost_event_v2(uuid,text,timestamptz,timestamptz,numeric,uuid[],text) is 'Records one compost event and one linked canonical activity atomically, reusing Bitácora worker-overlap controls.';
