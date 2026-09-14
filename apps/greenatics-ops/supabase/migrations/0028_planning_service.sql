-- Wave 2A.3 · Transactional planning service.
-- Planning is versioned: revisions create a successor instead of rewriting history.

alter table public.scheduled_activities
  add column if not exists planning_note text,
  add column if not exists deviation_reason text,
  add column if not exists deviation_recorded_at timestamptz,
  add column if not exists deviation_recorded_by uuid references auth.users(id);

alter table public.scheduled_activities
  drop constraint if exists scheduled_canonical_window_check;
alter table public.scheduled_activities
  add constraint scheduled_canonical_window_check
  check (
    activity_template_id is null
    or (planned_end is not null and planned_end > planned_start)
  );

create index if not exists scheduled_activities_planning_window_idx
  on public.scheduled_activities(plant_id,planned_start,planned_end)
  where activity_template_id is not null and status in ('planned','delayed','running');

create or replace function private.guard_activity_template_process_change()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.process_id is distinct from old.process_id
     and (
       exists (select 1 from public.scheduled_activities s where s.activity_template_id = old.id)
       or exists (select 1 from public.activities a where a.activity_template_id = old.id)
     ) then
    raise exception 'No puedes cambiar el proceso de una plantilla que ya tiene historia operacional.';
  end if;
  return new;
end;
$$;

revoke all on function private.guard_activity_template_process_change() from public,anon,authenticated;

drop trigger if exists activity_template_process_history_guard on public.activity_templates;
create trigger activity_template_process_history_guard
before update of process_id on public.activity_templates
for each row execute function private.guard_activity_template_process_change();

create or replace function private.lock_planning_resources(
  employee_ids uuid[],
  target_equipment uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  worker_id uuid;
begin
  for worker_id in
    select distinct value
    from unnest(coalesce(employee_ids,'{}'::uuid[])) as value
    order by value
  loop
    perform pg_advisory_xact_lock(hashtextextended('greenatics-plan-worker:' || worker_id::text,0));
  end loop;

  if target_equipment is not null then
    perform pg_advisory_xact_lock(hashtextextended('greenatics-plan-equipment:' || target_equipment::text,0));
  end if;
end;
$$;

create or replace function private.assert_schedule_resources(
  target_plant uuid,
  target_template uuid,
  target_equipment uuid,
  employee_ids uuid[],
  starts_at timestamptz,
  ends_at timestamptz,
  exclude_schedule uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplied_count integer;
  visible_count integer;
  canonical_process uuid;
  template_requires_equipment boolean;
  template_active boolean;
  process_active boolean;
begin
  if starts_at is null or ends_at is null or ends_at <= starts_at then
    raise exception 'La hora final programada debe ser posterior al inicio.';
  end if;

  if not exists (select 1 from public.plants p where p.id=target_plant and p.active) then
    raise exception 'Planta no encontrada o inactiva.';
  end if;

  select t.process_id,t.requires_equipment,t.active,p.active
  into canonical_process,template_requires_equipment,template_active,process_active
  from public.activity_templates t
  join public.operational_processes p on p.id=t.process_id and p.plant_id=t.plant_id
  where t.id=target_template and t.plant_id=target_plant;

  if not found then
    raise exception 'La plantilla de actividad no pertenece a la planta.';
  end if;
  if not template_active then
    raise exception 'La plantilla de actividad está inactiva.';
  end if;
  if not process_active then
    raise exception 'El proceso de la actividad está inactivo.';
  end if;

  supplied_count := coalesce(cardinality(employee_ids),0);
  if supplied_count = 0 then
    raise exception 'Asigna al menos un trabajador a la programación.';
  end if;
  if supplied_count <> (select count(distinct value) from unnest(employee_ids) as value) then
    raise exception 'La programación contiene trabajadores duplicados.';
  end if;

  select count(*) into visible_count
  from public.employees e
  where e.id = any(employee_ids)
    and e.plant_id=target_plant
    and e.active;
  if visible_count <> supplied_count then
    raise exception 'Uno o más trabajadores no pertenecen a la planta o están inactivos.';
  end if;

  if template_requires_equipment and target_equipment is null then
    raise exception 'La plantilla requiere un equipo.';
  end if;

  if target_equipment is not null then
    if not exists (
      select 1 from public.equipment e
      where e.id=target_equipment and e.plant_id=target_plant
    ) then
      raise exception 'El equipo no pertenece a la planta.';
    end if;

    if not exists (
      select 1 from public.equipment_processes ep
      where ep.equipment_id=target_equipment
        and ep.process_id=canonical_process
        and ep.plant_id=target_plant
        and ep.active
    ) then
      raise exception 'El equipo no está habilitado para el proceso de la actividad.';
    end if;
  end if;

  perform private.lock_planning_resources(employee_ids,target_equipment);

  if exists (
    select 1
    from public.scheduled_activity_workers saw
    join public.scheduled_activities s on s.id=saw.scheduled_activity_id
    where saw.employee_id = any(employee_ids)
      and (exclude_schedule is null or s.id <> exclude_schedule)
      and s.status in ('planned','delayed','running')
      and s.planned_end is not null
      and tstzrange(s.planned_start,s.planned_end,'[)') && tstzrange(starts_at,ends_at,'[)')
  ) then
    raise exception 'Uno o más trabajadores ya tienen otra actividad programada en ese horario.';
  end if;

  if target_equipment is not null and exists (
    select 1
    from public.scheduled_activities s
    where s.equipment_id=target_equipment
      and (exclude_schedule is null or s.id <> exclude_schedule)
      and s.status in ('planned','delayed','running')
      and s.planned_end is not null
      and tstzrange(s.planned_start,s.planned_end,'[)') && tstzrange(starts_at,ends_at,'[)')
  ) then
    raise exception 'El equipo ya está asignado a otra actividad programada en ese horario.';
  end if;
end;
$$;

revoke all on function private.lock_planning_resources(uuid[],uuid) from public,anon,authenticated;
revoke all on function private.assert_schedule_resources(uuid,uuid,uuid,uuid[],timestamptz,timestamptz,uuid) from public,anon,authenticated;

create or replace function public.ops_create_scheduled_activity(
  target_plant uuid,
  target_template uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  employee_ids uuid[],
  target_equipment uuid default null,
  planning_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  schedule_id uuid;
  canonical_process uuid;
  template_name text;
  process_name text;
  equipment_code text;
begin
  if not private.has_plant_role(target_plant,array['supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para programar actividades en esta planta.';
  end if;

  perform private.assert_schedule_resources(
    target_plant,target_template,target_equipment,employee_ids,starts_at,ends_at,null
  );

  select t.process_id,t.name,p.name
  into canonical_process,template_name,process_name
  from public.activity_templates t
  join public.operational_processes p on p.id=t.process_id and p.plant_id=t.plant_id
  where t.id=target_template and t.plant_id=target_plant;

  if target_equipment is not null then
    select e.code into equipment_code
    from public.equipment e
    where e.id=target_equipment and e.plant_id=target_plant;
  end if;

  insert into public.scheduled_activities(
    plant_id,title,process,planned_start,planned_end,status,equipment_ref,
    process_id,activity_template_id,equipment_id,planning_note,created_by
  ) values (
    target_plant,template_name,process_name,starts_at,ends_at,'planned',equipment_code,
    canonical_process,target_template,target_equipment,nullif(btrim(planning_note),''),auth.uid()
  ) returning id into schedule_id;

  insert into public.scheduled_activity_workers(scheduled_activity_id,employee_id,plant_id,created_by)
  select schedule_id,value,target_plant,auth.uid()
  from unnest(employee_ids) as value;

  return schedule_id;
end;
$$;

create or replace function public.ops_revise_scheduled_activity(
  target_schedule uuid,
  target_template uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  employee_ids uuid[],
  target_equipment uuid,
  reason text,
  planning_note text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  prior public.scheduled_activities%rowtype;
  successor_id uuid;
  canonical_process uuid;
  template_name text;
  process_name text;
  equipment_code text;
begin
  select * into prior
  from public.scheduled_activities
  where id=target_schedule
  for update;

  if not found then raise exception 'Actividad programada no encontrada.'; end if;
  if not private.has_plant_role(prior.plant_id,array['supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para reprogramar actividades en esta planta.';
  end if;
  if prior.status not in ('planned','delayed','missed') then
    raise exception 'Solo puedes revisar una actividad pendiente, retrasada u omitida.';
  end if;
  if exists (select 1 from public.activities a where a.scheduled_activity_id=prior.id) then
    raise exception 'La actividad ya tiene ejecución real y no puede reprogramarse.';
  end if;
  if nullif(btrim(reason),'') is null then
    raise exception 'Indica el motivo de la reprogramación.';
  end if;
  if exists (select 1 from public.scheduled_activities s where s.rescheduled_from_id=prior.id) then
    raise exception 'La actividad ya tiene una revisión posterior.';
  end if;

  perform private.assert_schedule_resources(
    prior.plant_id,target_template,target_equipment,employee_ids,starts_at,ends_at,prior.id
  );

  select t.process_id,t.name,p.name
  into canonical_process,template_name,process_name
  from public.activity_templates t
  join public.operational_processes p on p.id=t.process_id and p.plant_id=t.plant_id
  where t.id=target_template and t.plant_id=prior.plant_id;

  if target_equipment is not null then
    select e.code into equipment_code
    from public.equipment e
    where e.id=target_equipment and e.plant_id=prior.plant_id;
  end if;

  insert into public.scheduled_activities(
    plant_id,title,process,planned_start,planned_end,status,equipment_ref,
    process_id,activity_template_id,equipment_id,planning_note,created_by,
    rescheduled_from_id,reschedule_reason,rescheduled_at,rescheduled_by
  ) values (
    prior.plant_id,template_name,process_name,starts_at,ends_at,'planned',equipment_code,
    canonical_process,target_template,target_equipment,
    coalesce(nullif(btrim(planning_note),''),prior.planning_note),auth.uid(),
    prior.id,btrim(reason),now(),auth.uid()
  ) returning id into successor_id;

  insert into public.scheduled_activity_workers(scheduled_activity_id,employee_id,plant_id,created_by)
  select successor_id,value,prior.plant_id,auth.uid()
  from unnest(employee_ids) as value;

  update public.scheduled_activities
  set status='rescheduled'
  where id=prior.id;

  return successor_id;
end;
$$;

create or replace function public.ops_record_schedule_deviation(
  target_schedule uuid,
  deviation_status text,
  reason text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  scheduled public.scheduled_activities%rowtype;
begin
  select * into scheduled
  from public.scheduled_activities
  where id=target_schedule
  for update;

  if not found then raise exception 'Actividad programada no encontrada.'; end if;
  if not private.has_plant_role(scheduled.plant_id,array['supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para registrar desviaciones del plan en esta planta.';
  end if;
  if deviation_status not in ('delayed','missed') then
    raise exception 'El estado de desviación debe ser retrasada u omitida.';
  end if;
  if scheduled.status not in ('planned','delayed','missed') then
    raise exception 'La actividad ya no admite una desviación de planeación.';
  end if;
  if scheduled.status='missed' and deviation_status <> 'missed' then
    raise exception 'Una actividad omitida solo puede reprogramarse mediante una revisión.';
  end if;
  if exists (select 1 from public.activities a where a.scheduled_activity_id=scheduled.id) then
    raise exception 'La actividad ya tiene ejecución real.';
  end if;
  if nullif(btrim(reason),'') is null then
    raise exception 'Indica el motivo de la desviación.';
  end if;

  update public.scheduled_activities
  set status=deviation_status,
      deviation_reason=btrim(reason),
      deviation_recorded_at=now(),
      deviation_recorded_by=auth.uid()
  where id=scheduled.id;

  return deviation_status;
end;
$$;

-- Preserve the existing RPC signature while allowing an empty worker array to use the planned assignment.
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
  effective_employee_ids uuid[];
begin
  select * into scheduled
  from public.scheduled_activities
  where id = scheduled_id
  for update;

  if not found then raise exception 'Actividad programada no encontrada.'; end if;
  if not private.has_plant_role(scheduled.plant_id,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para iniciar actividades en esta planta.';
  end if;
  if scheduled.status not in ('planned','delayed','missed') then
    raise exception 'La actividad programada no está disponible para iniciar.';
  end if;

  effective_employee_ids := employee_ids;
  if coalesce(cardinality(effective_employee_ids),0)=0 then
    select coalesce(array_agg(saw.employee_id order by saw.employee_id),'{}'::uuid[])
    into effective_employee_ids
    from public.scheduled_activity_workers saw
    where saw.scheduled_activity_id=scheduled.id;
  end if;

  perform private.assert_ops_workers(scheduled.plant_id,effective_employee_ids);

  insert into public.activities (
    plant_id,scheduled_activity_id,title,process,started_at,equipment_ref,
    process_id,activity_template_id,equipment_id,source_kind,created_by
  ) values (
    scheduled.plant_id,scheduled.id,scheduled.title,scheduled.process,now(),scheduled.equipment_ref,
    scheduled.process_id,scheduled.activity_template_id,scheduled.equipment_id,'app',auth.uid()
  ) returning id into activity_id;

  insert into public.activity_workers(activity_id,employee_id)
  select activity_id,value from unnest(effective_employee_ids) as value;

  update public.scheduled_activities
  set status='running'
  where id=scheduled.id;

  return activity_id;
end;
$$;

revoke all on function public.ops_create_scheduled_activity(uuid,uuid,timestamptz,timestamptz,uuid[],uuid,text) from public,anon;
revoke all on function public.ops_revise_scheduled_activity(uuid,uuid,timestamptz,timestamptz,uuid[],uuid,text,text) from public,anon;
revoke all on function public.ops_record_schedule_deviation(uuid,text,text) from public,anon;
revoke all on function public.ops_start_scheduled_activity(uuid,uuid[]) from public,anon;

grant execute on function public.ops_create_scheduled_activity(uuid,uuid,timestamptz,timestamptz,uuid[],uuid,text) to authenticated;
grant execute on function public.ops_revise_scheduled_activity(uuid,uuid,timestamptz,timestamptz,uuid[],uuid,text,text) to authenticated;
grant execute on function public.ops_record_schedule_deviation(uuid,text,text) to authenticated;
grant execute on function public.ops_start_scheduled_activity(uuid,uuid[]) to authenticated;

comment on function public.ops_create_scheduled_activity(uuid,uuid,timestamptz,timestamptz,uuid[],uuid,text)
  is 'Creates one canonical planned activity with validated worker/equipment reservations.';
comment on function public.ops_revise_scheduled_activity(uuid,uuid,timestamptz,timestamptz,uuid[],uuid,text,text)
  is 'Creates a successor schedule and marks the predecessor rescheduled; history is never overwritten.';
comment on function public.ops_record_schedule_deviation(uuid,text,text)
  is 'Records delayed/missed status with mandatory reason and author.';
