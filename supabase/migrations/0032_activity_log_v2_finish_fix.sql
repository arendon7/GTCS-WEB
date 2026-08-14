-- Wave 2B.1 corrective hardening.
-- Resolve the PL/pgSQL parameter/column name collision without changing the public RPC signature.

create or replace function public.ops_finish_activity_v2(
  target_activity uuid,
  result_quantity numeric default null,
  result_unit text default null,
  novelty_kind text default null,
  novelty_notes text default null,
  open_incident boolean default false,
  activity_comment text default null,
  tool_ids uuid[] default '{}'::uuid[]
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_variable
declare
  activity public.activities%rowtype;
  finished_at timestamptz := now();
  incident_severity text;
  template_requires_quantity boolean := false;
  template_default_unit text;
  effective_unit text;
begin
  select * into activity from public.activities where id=target_activity for update;
  if not found then raise exception 'Actividad no encontrada.'; end if;
  if not private.has_plant_role(activity.plant_id,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para finalizar actividades en esta planta.';
  end if;
  if activity.ended_at is not null then raise exception 'La actividad ya está finalizada.'; end if;
  if finished_at < activity.started_at then raise exception 'La hora final no puede ser anterior al inicio.'; end if;
  if result_quantity is not null and result_quantity<=0 then raise exception 'La cantidad debe ser mayor que cero.'; end if;
  if novelty_kind is not null and novelty_kind not in ('equipment_failure','delay','quality','safety','other') then
    raise exception 'Tipo de novedad inválido.';
  end if;

  if activity.activity_template_id is not null then
    select t.requires_quantity,t.default_unit_code
    into template_requires_quantity,template_default_unit
    from public.activity_templates t
    where t.id=activity.activity_template_id and t.plant_id=activity.plant_id;
  end if;
  if template_requires_quantity and result_quantity is null then raise exception 'Esta actividad requiere registrar la cantidad final.'; end if;

  effective_unit := case when result_quantity is null then null else coalesce(nullif(btrim(result_unit),''),template_default_unit) end;
  if result_quantity is not null and effective_unit is null then raise exception 'Selecciona la unidad de la cantidad.'; end if;
  if effective_unit is not null and not exists (select 1 from public.measurement_units u where u.code=effective_unit and u.active) then
    raise exception 'La unidad seleccionada no es válida.';
  end if;

  perform private.assert_activity_log_tools(activity.plant_id,tool_ids);

  update public.activities
  set ended_at=finished_at,
      quantity=result_quantity,
      unit=effective_unit,
      novelty_type=novelty_kind,
      notes=nullif(btrim(novelty_notes),''),
      activity_comment=nullif(btrim(activity_comment),'')
  where id=activity.id;

  delete from public.activity_tools where activity_id=activity.id;
  insert into public.activity_tools(activity_id,tool_id,plant_id,created_by)
  select activity.id,value,activity.plant_id,auth.uid()
  from unnest(coalesce(tool_ids,'{}'::uuid[])) as value;

  if activity.scheduled_activity_id is not null then
    update public.scheduled_activities set status='done' where id=activity.scheduled_activity_id;
  end if;

  if open_incident and novelty_kind is not null then
    incident_severity := case when novelty_kind in ('equipment_failure','safety') then 'high' else 'medium' end;
    insert into public.incidents(activity_id,plant_id,severity,title,description,opened_at,created_by)
    values(
      activity.id,activity.plant_id,incident_severity,
      case when novelty_kind='equipment_failure' then 'Falla reportada · '||activity.title else 'Novedad · '||activity.title end,
      coalesce(nullif(btrim(novelty_notes),''),'Novedad reportada durante la actividad.'),finished_at,auth.uid()
    );
  end if;

  return finished_at;
end;
$$;

revoke all on function public.ops_finish_activity_v2(uuid,numeric,text,text,text,boolean,text,uuid[]) from public,anon;
grant execute on function public.ops_finish_activity_v2(uuid,numeric,text,text,text,boolean,text,uuid[]) to authenticated;
