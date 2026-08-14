-- Wave 2B.4 · Compostaje 2.0.
-- Canonical physical-lot allocation, operational events, ambient controls and configurable technical ranges.
-- No technical threshold is seeded: ranges only evaluate when explicitly configured by Greenatics.

create unique index if not exists compost_piles_id_plant_uidx on public.compost_piles(id,plant_id);

create table if not exists public.compost_pile_intake_sources (
  pile_id uuid not null,
  intake_lot_id uuid not null,
  plant_id uuid not null references public.plants(id) on delete restrict,
  allocated_mass_kg numeric,
  allocation_confirmed boolean not null default true,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (pile_id,intake_lot_id),
  foreign key (pile_id,plant_id) references public.compost_piles(id,plant_id) on delete cascade,
  foreign key (intake_lot_id,plant_id) references public.material_intake_lots(id,plant_id) on delete restrict,
  check (
    (allocation_confirmed and allocated_mass_kg is not null and allocated_mass_kg > 0)
    or (not allocation_confirmed and allocated_mass_kg is null)
  )
);
create index if not exists compost_pile_intake_sources_lot_idx on public.compost_pile_intake_sources(intake_lot_id);

-- Preserve discoverability of piles created before Reception 2.0 without inventing or decrementing historical mass.
insert into public.compost_pile_intake_sources(pile_id,intake_lot_id,plant_id,allocated_mass_kg,allocation_confirmed,created_by)
select distinct cps.pile_id,mil.id,p.plant_id,null::numeric,false,p.created_by
from public.compost_pile_sources cps
join public.compost_piles p on p.id=cps.pile_id
join public.material_intake_lots mil on mil.receipt_id=cps.material_receipt_id and mil.plant_id=p.plant_id
on conflict (pile_id,intake_lot_id) do nothing;

create table if not exists public.compost_events (
  id uuid primary key default gen_random_uuid(),
  pile_id uuid not null,
  plant_id uuid not null references public.plants(id) on delete restrict,
  event_type text not null check (event_type in ('formation','turning','hydration','other')),
  started_at timestamptz not null,
  ended_at timestamptz not null,
  volume_m3 numeric,
  notes text,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  unique (id,plant_id),
  foreign key (pile_id,plant_id) references public.compost_piles(id,plant_id) on delete cascade,
  check (ended_at >= started_at),
  check (volume_m3 is null or volume_m3 > 0),
  check (event_type not in ('formation','turning') or volume_m3 is not null)
);
create unique index if not exists compost_events_one_formation_uidx on public.compost_events(pile_id) where event_type='formation';
create index if not exists compost_events_pile_started_idx on public.compost_events(pile_id,started_at desc);

create table if not exists public.compost_event_workers (
  event_id uuid not null,
  employee_id uuid not null,
  plant_id uuid not null references public.plants(id) on delete restrict,
  primary key (event_id,employee_id),
  foreign key (event_id,plant_id) references public.compost_events(id,plant_id) on delete cascade,
  foreign key (employee_id,plant_id) references public.employees(id,plant_id) on delete restrict
);

create table if not exists public.compost_control_ranges (
  plant_id uuid primary key references public.plants(id) on delete cascade,
  temperature_avg_min_c numeric,
  temperature_avg_max_c numeric,
  humidity_min_pct numeric,
  humidity_max_pct numeric,
  active boolean not null default true,
  updated_by uuid references auth.users(id) default auth.uid(),
  updated_at timestamptz not null default now(),
  check (temperature_avg_min_c is null or temperature_avg_max_c is null or temperature_avg_min_c <= temperature_avg_max_c),
  check (humidity_min_pct is null or (humidity_min_pct >= 0 and humidity_min_pct <= 100)),
  check (humidity_max_pct is null or (humidity_max_pct >= 0 and humidity_max_pct <= 100)),
  check (humidity_min_pct is null or humidity_max_pct is null or humidity_min_pct <= humidity_max_pct)
);

alter table public.compost_measurements
  add column if not exists ambient_temperature_c numeric,
  add column if not exists temperature_avg_c numeric,
  add column if not exists temperature_range_status text not null default 'not_configured',
  add column if not exists humidity_range_status text not null default 'not_configured';

update public.compost_measurements m
set temperature_avg_c=(select avg(value) from unnest(m.temperature_points_c) value)
where m.temperature_avg_c is null;

alter table public.compost_measurements drop constraint if exists compost_measurements_temperature_range_status_check;
alter table public.compost_measurements add constraint compost_measurements_temperature_range_status_check
  check (temperature_range_status in ('not_configured','within_range','out_of_range'));
alter table public.compost_measurements drop constraint if exists compost_measurements_humidity_range_status_check;
alter table public.compost_measurements add constraint compost_measurements_humidity_range_status_check
  check (humidity_range_status in ('not_configured','not_recorded','within_range','out_of_range'));

alter table public.compost_pile_intake_sources enable row level security;
alter table public.compost_events enable row level security;
alter table public.compost_event_workers enable row level security;
alter table public.compost_control_ranges enable row level security;

create policy "compost_intake_sources_member_select" on public.compost_pile_intake_sources for select to authenticated
using ((select private.has_plant_access(plant_id)));
create policy "compost_events_member_select" on public.compost_events for select to authenticated
using ((select private.has_plant_access(plant_id)));
create policy "compost_event_workers_member_select" on public.compost_event_workers for select to authenticated
using ((select private.has_plant_access(plant_id)));
create policy "compost_control_ranges_member_select" on public.compost_control_ranges for select to authenticated
using ((select private.has_plant_access(plant_id)));

-- All current compost writes are routed through invariant-preserving RPCs.
drop policy if exists "compost_piles_operator_insert" on public.compost_piles;
drop policy if exists "compost_piles_operator_update" on public.compost_piles;
drop policy if exists "compost_sources_operator_insert" on public.compost_pile_sources;
drop policy if exists "compost_measurements_operator_insert" on public.compost_measurements;
revoke insert,update,delete on public.compost_piles from authenticated;
revoke insert,update,delete on public.compost_pile_sources from authenticated;
revoke insert,update,delete on public.compost_measurements from authenticated;
revoke insert,update,delete on public.compost_pile_intake_sources from authenticated;
revoke insert,update,delete on public.compost_events from authenticated;
revoke insert,update,delete on public.compost_event_workers from authenticated;
revoke insert,update,delete on public.compost_control_ranges from authenticated;
grant select on public.compost_pile_intake_sources,public.compost_events,public.compost_event_workers,public.compost_control_ranges to authenticated;

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
    update public.material_intake_lots
    set available_mass_kg=available_mass_kg-intake_allocations_kg[idx],
        status=case when available_mass_kg-intake_allocations_kg[idx] <= 0.001 then 'depleted' else 'in_process' end
    where id=intake_lot_ids[idx];
  end loop;

  insert into public.compost_events(pile_id,plant_id,event_type,started_at,ended_at,volume_m3,notes,created_by)
  values(new_pile_id,target_plant,'formation',formation_started_at,formation_ended_at,formation_volume_m3,nullif(btrim(formation_notes),''),auth.uid())
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

  insert into public.compost_events(pile_id,plant_id,event_type,started_at,ended_at,volume_m3,notes,created_by)
  values(pile.id,pile.plant_id,event_kind,event_started_at,event_ended_at,event_volume_m3,nullif(btrim(event_notes),''),auth.uid())
  returning compost_events.id into event_id;
  insert into public.compost_event_workers(event_id,employee_id,plant_id)
  select event_id,value,pile.plant_id from unnest(employee_ids) value;
  return event_id;
end;
$$;

create or replace function public.ops_record_compost_measurement_v2(
  target_pile uuid,
  temperature_points numeric[],
  ambient_temperature numeric,
  humidity numeric default null,
  measurement_notes text default null,
  measurement_recorded_at timestamptz default now()
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  pile public.compost_piles%rowtype;
  measurement_id uuid;
  average_temp numeric;
  control_range public.compost_control_ranges%rowtype;
  temp_status text := 'not_configured';
  humidity_status text := 'not_configured';
begin
  select * into pile from public.compost_piles where id=target_pile for update;
  if not found then raise exception 'Pila no encontrada.'; end if;
  if not private.has_plant_role(pile.plant_id,array['operator','supervisor','technical','admin','director']) then raise exception 'No tienes permiso para registrar controles en esta planta.'; end if;
  if pile.status='closed' then raise exception 'No se pueden registrar controles en una pila cerrada.'; end if;
  if temperature_points is null or cardinality(temperature_points) not between 3 and 5 then raise exception 'Registra entre 3 y 5 puntos de temperatura.'; end if;
  if exists(select 1 from unnest(temperature_points) value where value is null) then raise exception 'Todas las temperaturas deben ser numéricas.'; end if;
  if ambient_temperature is null then raise exception 'Registra la temperatura ambiente.'; end if;
  if humidity is not null and (humidity<0 or humidity>100) then raise exception 'La humedad debe estar entre 0 y 100 %%.'; end if;
  if measurement_recorded_at is null or measurement_recorded_at < pile.started_at then raise exception 'La fecha del control no puede ser anterior a la conformación.'; end if;
  if measurement_recorded_at > now()+interval '5 minutes' then raise exception 'El control no puede registrarse en el futuro.'; end if;

  select avg(value) into average_temp from unnest(temperature_points) value;
  select * into control_range from public.compost_control_ranges r where r.plant_id=pile.plant_id and r.active;
  if found then
    if control_range.temperature_avg_min_c is not null or control_range.temperature_avg_max_c is not null then
      temp_status := case when (control_range.temperature_avg_min_c is not null and average_temp<control_range.temperature_avg_min_c) or (control_range.temperature_avg_max_c is not null and average_temp>control_range.temperature_avg_max_c) then 'out_of_range' else 'within_range' end;
    end if;
    if humidity is null then
      if control_range.humidity_min_pct is not null or control_range.humidity_max_pct is not null then humidity_status := 'not_recorded'; end if;
    elsif control_range.humidity_min_pct is not null or control_range.humidity_max_pct is not null then
      humidity_status := case when (control_range.humidity_min_pct is not null and humidity<control_range.humidity_min_pct) or (control_range.humidity_max_pct is not null and humidity>control_range.humidity_max_pct) then 'out_of_range' else 'within_range' end;
    end if;
  end if;

  insert into public.compost_measurements(pile_id,temperature_points_c,ambient_temperature_c,temperature_avg_c,humidity_pct,temperature_range_status,humidity_range_status,notes,recorded_at,created_by)
  values(pile.id,temperature_points,ambient_temperature,average_temp,humidity,temp_status,humidity_status,nullif(btrim(measurement_notes),''),measurement_recorded_at,auth.uid())
  returning compost_measurements.id into measurement_id;
  return measurement_id;
end;
$$;

create or replace function public.ops_configure_compost_control_range(
  target_plant uuid,
  temperature_min numeric default null,
  temperature_max numeric default null,
  humidity_min numeric default null,
  humidity_max numeric default null,
  range_active boolean default true
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.has_plant_role(target_plant,array['technical','admin','director']) then raise exception 'Solo dirección, administración o el rol técnico pueden configurar rangos de compostaje.'; end if;
  if not exists(select 1 from public.plants p where p.id=target_plant and p.active) then raise exception 'Planta no encontrada o inactiva.'; end if;
  if temperature_min is not null and temperature_max is not null and temperature_min>temperature_max then raise exception 'El mínimo de temperatura no puede superar el máximo.'; end if;
  if humidity_min is not null and (humidity_min<0 or humidity_min>100) then raise exception 'El mínimo de humedad debe estar entre 0 y 100 %%.'; end if;
  if humidity_max is not null and (humidity_max<0 or humidity_max>100) then raise exception 'El máximo de humedad debe estar entre 0 y 100 %%.'; end if;
  if humidity_min is not null and humidity_max is not null and humidity_min>humidity_max then raise exception 'El mínimo de humedad no puede superar el máximo.'; end if;
  if range_active and temperature_min is null and temperature_max is null and humidity_min is null and humidity_max is null then raise exception 'Define al menos un límite técnico o desactiva el rango.'; end if;

  insert into public.compost_control_ranges(plant_id,temperature_avg_min_c,temperature_avg_max_c,humidity_min_pct,humidity_max_pct,active,updated_by,updated_at)
  values(target_plant,temperature_min,temperature_max,humidity_min,humidity_max,range_active,auth.uid(),now())
  on conflict (plant_id) do update set temperature_avg_min_c=excluded.temperature_avg_min_c,temperature_avg_max_c=excluded.temperature_avg_max_c,humidity_min_pct=excluded.humidity_min_pct,humidity_max_pct=excluded.humidity_max_pct,active=excluded.active,updated_by=auth.uid(),updated_at=now();
end;
$$;

-- Prevent authenticated clients from bypassing physical-lot allocation or ambient/range evaluation through legacy RPCs.
revoke execute on function public.ops_create_compost_pile(uuid,text,uuid[],numeric) from authenticated;
revoke execute on function public.ops_record_compost_measurement(uuid,numeric[],numeric,text) from authenticated;
revoke all on function public.ops_create_compost_pile_v2(uuid,text,uuid[],numeric[],timestamptz,timestamptz,numeric,uuid[],text) from public,anon;
revoke all on function public.ops_record_compost_event_v2(uuid,text,timestamptz,timestamptz,numeric,uuid[],text) from public,anon;
revoke all on function public.ops_record_compost_measurement_v2(uuid,numeric[],numeric,numeric,text,timestamptz) from public,anon;
revoke all on function public.ops_configure_compost_control_range(uuid,numeric,numeric,numeric,numeric,boolean) from public,anon;
grant execute on function public.ops_create_compost_pile_v2(uuid,text,uuid[],numeric[],timestamptz,timestamptz,numeric,uuid[],text) to authenticated;
grant execute on function public.ops_record_compost_event_v2(uuid,text,timestamptz,timestamptz,numeric,uuid[],text) to authenticated;
grant execute on function public.ops_record_compost_measurement_v2(uuid,numeric[],numeric,numeric,text,timestamptz) to authenticated;
grant execute on function public.ops_configure_compost_control_range(uuid,numeric,numeric,numeric,numeric,boolean) to authenticated;

comment on table public.compost_pile_intake_sources is 'Canonical physical intake-lot allocations to compost piles; confirmed allocations decrement lot availability atomically.';
comment on table public.compost_events is 'Operational compost events such as formation, turning and hydration with duration, volume and workers.';
comment on table public.compost_control_ranges is 'Plant technical thresholds; intentionally empty until Greenatics configures validated ranges.';
comment on function public.ops_create_compost_pile_v2(uuid,text,uuid[],numeric[],timestamptz,timestamptz,numeric,uuid[],text) is 'Creates a pile from physical intake lots, decrements available mass and records the formation event/workers atomically.';
comment on function public.ops_record_compost_measurement_v2(uuid,numeric[],numeric,numeric,text,timestamptz) is 'Records 3–5 pile temperatures, ambient temperature and optional humidity; evaluates only explicitly configured plant ranges.';
