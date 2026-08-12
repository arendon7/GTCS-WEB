-- CORE-003 · transactional remote core for GREENATICS OPS.
-- The browser never receives privileged credentials; authorization remains enforced by RLS/role checks.

insert into public.plants (code,name)
values ('TAM','Támesis'),('YAR','Yarumal')
on conflict (code) do nothing;

alter table public.scheduled_activities
  add column if not exists equipment_ref text;

alter table public.activities
  add column if not exists equipment_ref text,
  add column if not exists novelty_type text;

alter table public.activities drop constraint if exists activities_novelty_type_check;
alter table public.activities add constraint activities_novelty_type_check
  check (novelty_type is null or novelty_type in ('equipment_failure','delay','quality','safety','other'));

alter table public.incidents
  add column if not exists activity_id uuid references public.activities(id) on delete restrict;

create unique index if not exists activities_scheduled_once_uidx
  on public.activities(scheduled_activity_id)
  where scheduled_activity_id is not null;

create index if not exists activity_workers_employee_idx
  on public.activity_workers(employee_id);

create index if not exists incidents_activity_idx
  on public.incidents(activity_id)
  where activity_id is not null;

create or replace function private.lock_ops_workers(employee_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  worker_id uuid;
begin
  for worker_id in
    select distinct value from unnest(employee_ids) as value order by value
  loop
    perform pg_advisory_xact_lock(hashtextextended('greenatics-worker:' || worker_id::text, 0));
  end loop;
end;
$$;

create or replace function private.assert_ops_workers(target_plant uuid, employee_ids uuid[])
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplied_count integer;
  visible_count integer;
begin
  supplied_count := coalesce(cardinality(employee_ids),0);
  if supplied_count = 0 then
    raise exception 'Selecciona al menos un trabajador.';
  end if;

  if supplied_count <> (select count(distinct value) from unnest(employee_ids) as value) then
    raise exception 'La lista de trabajadores contiene duplicados.';
  end if;

  select count(*) into visible_count
  from public.employees e
  where e.id = any(employee_ids)
    and e.plant_id = target_plant
    and e.active;

  if visible_count <> supplied_count then
    raise exception 'Uno o más trabajadores no pertenecen a la planta o están inactivos.';
  end if;

  perform private.lock_ops_workers(employee_ids);

  if exists (
    select 1
    from public.activity_workers aw
    join public.activities a on a.id = aw.activity_id
    where aw.employee_id = any(employee_ids)
      and a.ended_at is null
  ) then
    raise exception 'Uno o más trabajadores ya están en otra actividad en curso.';
  end if;
end;
$$;

create or replace function public.ops_start_scheduled_activity(
  scheduled_id uuid,
  employee_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  scheduled public.scheduled_activities%rowtype;
  activity_id uuid;
begin
  select * into scheduled
  from public.scheduled_activities
  where id = scheduled_id
  for update;

  if not found then raise exception 'Actividad programada no encontrada.'; end if;
  if not private.has_plant_role(scheduled.plant_id,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para iniciar actividades en esta planta.';
  end if;
  if scheduled.status not in ('planned','delayed') then
    raise exception 'La actividad programada no está disponible para iniciar.';
  end if;

  perform private.assert_ops_workers(scheduled.plant_id,employee_ids);

  insert into public.activities (
    plant_id,scheduled_activity_id,title,process,started_at,equipment_ref,source_kind,created_by
  ) values (
    scheduled.plant_id,scheduled.id,scheduled.title,scheduled.process,now(),scheduled.equipment_ref,'app',auth.uid()
  ) returning id into activity_id;

  insert into public.activity_workers(activity_id,employee_id)
  select activity_id,value from unnest(employee_ids) as value;

  update public.scheduled_activities
  set status='running'
  where id=scheduled.id;

  return activity_id;
end;
$$;

create or replace function public.ops_create_unplanned_activity(
  target_plant uuid,
  activity_title text,
  activity_process text,
  employee_ids uuid[],
  equipment_ref text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  activity_id uuid;
begin
  if not private.has_plant_role(target_plant,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para registrar actividades en esta planta.';
  end if;
  if nullif(btrim(activity_title),'') is null then raise exception 'Escribe el nombre de la actividad.'; end if;
  if nullif(btrim(activity_process),'') is null then raise exception 'Indica el proceso.'; end if;

  perform private.assert_ops_workers(target_plant,employee_ids);

  insert into public.activities (
    plant_id,title,process,started_at,equipment_ref,source_kind,created_by
  ) values (
    target_plant,btrim(activity_title),btrim(activity_process),now(),nullif(btrim(equipment_ref),''),'app',auth.uid()
  ) returning id into activity_id;

  insert into public.activity_workers(activity_id,employee_id)
  select activity_id,value from unnest(employee_ids) as value;

  return activity_id;
end;
$$;

create or replace function public.ops_finish_activity(
  target_activity uuid,
  result_quantity numeric default null,
  result_unit text default null,
  novelty_kind text default null,
  activity_notes text default null,
  open_incident boolean default false
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  activity public.activities%rowtype;
  finished_at timestamptz := now();
  incident_severity text;
begin
  select * into activity
  from public.activities
  where id=target_activity
  for update;

  if not found then raise exception 'Actividad no encontrada.'; end if;
  if not private.has_plant_role(activity.plant_id,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para finalizar actividades en esta planta.';
  end if;
  if activity.ended_at is not null then raise exception 'La actividad ya está finalizada.'; end if;
  if result_quantity is not null and result_quantity <= 0 then raise exception 'La cantidad debe ser mayor que cero.'; end if;
  if novelty_kind is not null and novelty_kind not in ('equipment_failure','delay','quality','safety','other') then
    raise exception 'Tipo de novedad inválido.';
  end if;
  if finished_at < activity.started_at then raise exception 'La hora final no puede ser anterior al inicio.'; end if;

  update public.activities
  set ended_at=finished_at,
      quantity=result_quantity,
      unit=case when result_quantity is null then null else nullif(btrim(result_unit),'') end,
      novelty_type=novelty_kind,
      notes=nullif(btrim(activity_notes),'')
  where id=activity.id;

  if activity.scheduled_activity_id is not null then
    update public.scheduled_activities set status='done' where id=activity.scheduled_activity_id;
  end if;

  if open_incident and novelty_kind is not null then
    incident_severity := case when novelty_kind in ('equipment_failure','safety') then 'high' else 'medium' end;
    insert into public.incidents (
      activity_id,plant_id,severity,title,description,opened_at,created_by
    ) values (
      activity.id,
      activity.plant_id,
      incident_severity,
      case when novelty_kind='equipment_failure' then 'Falla reportada · ' || activity.title else 'Novedad · ' || activity.title end,
      coalesce(nullif(btrim(activity_notes),''),'Novedad reportada durante la actividad.'),
      finished_at,
      auth.uid()
    );
  end if;

  return finished_at;
end;
$$;

create or replace function public.ops_record_material_receipt(
  target_plant uuid,
  generator_name text,
  route_name text,
  waste_kind text,
  net_weight numeric,
  rejection_weight numeric,
  acceptance_kind text,
  receipt_started_at timestamptz,
  receipt_ended_at timestamptz,
  observation_text text default null
)
returns table(id uuid,lot_code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  plant_code text;
  prefix text;
  receipt_date date;
  sequence_no integer;
  generated_lot text;
begin
  if not private.has_plant_role(target_plant,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para registrar recepciones en esta planta.';
  end if;
  if nullif(btrim(generator_name),'') is null then raise exception 'Indica el generador o proveedor.'; end if;
  if nullif(btrim(route_name),'') is null then raise exception 'Indica la ruta u origen.'; end if;
  if waste_kind not in ('FORSU','PODA','GALLINAZA','MATERIA_PRIMA','OTRO') then raise exception 'Tipo de material inválido.'; end if;
  if net_weight <= 0 then raise exception 'El peso neto debe ser mayor que cero.'; end if;
  if rejection_weight < 0 or rejection_weight > net_weight then raise exception 'El rechazo registrado es inválido.'; end if;
  if acceptance_kind not in ('accepted','conditioned','rejected') then raise exception 'Estado de aceptación inválido.'; end if;
  if receipt_ended_at < receipt_started_at then raise exception 'La hora final no puede ser anterior al inicio.'; end if;

  select p.code into plant_code
  from public.plants p
  where p.id=target_plant and p.active;
  if plant_code is null then raise exception 'Planta no encontrada o inactiva.'; end if;

  prefix := case
    when lower(plant_code) like 'yar%' then 'YAR'
    when lower(plant_code) like 'tam%' then 'TAM'
    else upper(left(regexp_replace(plant_code,'[^a-zA-Z0-9]','','g'),3))
  end;
  receipt_date := (receipt_ended_at at time zone 'America/Bogota')::date;

  perform pg_advisory_xact_lock(hashtextextended('greenatics-receipt:' || target_plant::text || ':' || receipt_date::text,0));

  select count(*) + 1 into sequence_no
  from public.material_receipts r
  where r.plant_id=target_plant
    and (r.ended_at at time zone 'America/Bogota')::date=receipt_date;

  generated_lot := prefix || '-' || waste_kind || '-' || to_char(receipt_date,'YYYYMMDD') || '-' || lpad(sequence_no::text,3,'0');

  return query
  insert into public.material_receipts as r (
    plant_id,generator,route,waste_type,net_weight_kg,rejection_kg,acceptance_status,observation,started_at,ended_at,lot_code,source_kind,created_by
  ) values (
    target_plant,btrim(generator_name),btrim(route_name),waste_kind,net_weight,rejection_weight,acceptance_kind,nullif(btrim(observation_text),''),receipt_started_at,receipt_ended_at,generated_lot,'app',auth.uid()
  )
  returning r.id,r.lot_code;
end;
$$;

revoke all on function private.lock_ops_workers(uuid[]) from public;
revoke all on function private.assert_ops_workers(uuid,uuid[]) from public;
revoke all on function public.ops_start_scheduled_activity(uuid,uuid[]) from public,anon;
revoke all on function public.ops_create_unplanned_activity(uuid,text,text,uuid[],text) from public,anon;
revoke all on function public.ops_finish_activity(uuid,numeric,text,text,text,boolean) from public,anon;
revoke all on function public.ops_record_material_receipt(uuid,text,text,text,numeric,numeric,text,timestamptz,timestamptz,text) from public,anon;

grant execute on function public.ops_start_scheduled_activity(uuid,uuid[]) to authenticated;
grant execute on function public.ops_create_unplanned_activity(uuid,text,text,uuid[],text) to authenticated;
grant execute on function public.ops_finish_activity(uuid,numeric,text,text,text,boolean) to authenticated;
grant execute on function public.ops_record_material_receipt(uuid,text,text,text,numeric,numeric,text,timestamptz,timestamptz,text) to authenticated;
