-- Wave 2B.1 · Bitácora 2.0 foundation.
-- Structured activity capture based on the real Támesis/Yarumal bitácoras.
-- Tools and operational comments become first-class data; legacy labels remain preserved.

create table if not exists public.operational_tools (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  code text not null,
  name text not null,
  active boolean not null default true,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  unique (plant_id,code),
  unique (id,plant_id),
  check (nullif(btrim(code),'') is not null),
  check (nullif(btrim(name),'') is not null)
);

create unique index if not exists activities_id_plant_uidx on public.activities(id,plant_id);

create table if not exists public.activity_tools (
  activity_id uuid not null,
  tool_id uuid not null,
  plant_id uuid not null,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  primary key (activity_id,tool_id),
  foreign key (activity_id,plant_id) references public.activities(id,plant_id) on delete cascade,
  foreign key (tool_id,plant_id) references public.operational_tools(id,plant_id) on delete restrict
);

alter table public.activities
  add column if not exists activity_comment text;

create index if not exists operational_tools_plant_active_idx
  on public.operational_tools(plant_id,active,name);
create index if not exists activity_tools_tool_idx
  on public.activity_tools(tool_id);

alter table public.operational_tools enable row level security;
alter table public.activity_tools enable row level security;

create policy "operational_tools_member_select"
  on public.operational_tools for select to authenticated
  using ((select private.has_plant_access(plant_id)));
create policy "operational_tools_manager_insert"
  on public.operational_tools for insert to authenticated
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));
create policy "operational_tools_manager_update"
  on public.operational_tools for update to authenticated
  using ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])))
  with check ((select private.has_plant_role(plant_id,array['supervisor','technical','admin','director'])));

create policy "activity_tools_member_select"
  on public.activity_tools for select to authenticated
  using ((select private.has_plant_access(plant_id)));

-- Stable templates recovered from the operational workbooks. One-off prose rows are intentionally excluded.
with seed(plant_code,process_code,code,name,default_unit_code,allows_unplanned) as (values
  ('TAM','PRODUCCION','TAMIZAJE_PRODUCTO','Tamizaje de producto','kg',true),
  ('TAM','BIODIGESTION','RECIRCULACION','Recirculación',null,true),
  ('TAM','MANTENIMIENTO','MANTENIMIENTO_HERRAMIENTAS_EQUIPOS','Mantenimiento de herramientas o equipos',null,true),
  ('TAM','ASEO','ASEO_ZONA_RECEPCION_PICADO','Aseo zona de recepción y picado',null,true),
  ('TAM','ACONDICIONAMIENTO','MOLIENDA','Molienda','kg',true),
  ('TAM','BIODIGESTION','ALIMENTACION_REACTORES_PERCOLACION','Alimentación de reactores percolación','kg',true),
  ('TAM','LOGISTICA','RECOLECCION_ORDINARIOS_SEPARACION','Recolección ordinarios separación',null,true),
  ('TAM','ACONDICIONAMIENTO','SEPARACION_RESIDUOS','Separación de residuos','kg',true),
  ('TAM','BIODIGESTION','REDISTRIBUCION_RESIDUOS_PERCOLADOR','Redistribución de residuos dentro del percolador',null,true),
  ('TAM','COMPOSTAJE','VOLTEO_COMPOSTAJE','Volteo de compostaje',null,true),
  ('TAM','PRODUCCION','EMPACAR_PESAR_PRODUCTO','Empacar y pesar producto','kg',true),
  ('TAM','COMPOSTAJE','CONFORMACION_PILAS','Conformación de pilas','kg',true),
  ('TAM','BIODIGESTION','ALIMENTACION_TANQUE_PULMON','Alimentación tanque pulmón (influente)','L',true),
  ('TAM','RECEPCION','RECEPCION_RESIDUOS','Recepción de residuos','kg',false),
  ('TAM','MANTENIMIENTO','MANTENIMIENTO_AREAS','Mantenimiento de áreas',null,true),
  ('TAM','PRODUCCION','FORMULACION_LIQUIDOS','Formulación de líquidos','L',true),
  ('TAM','PRODUCCION','COCER_ALMACENAR_PRODUCTO','Cocer y almacenar producto','kg',true),
  ('TAM','ASEO','ASEO_HERRAMIENTAS','Aseo de herramientas',null,true),
  ('TAM','ACONDICIONAMIENTO','MOLIENDA_PRE_TAMIZAJE','Molienda Pre-Tamizaje','kg',true),
  ('TAM','OTRO','ACTIVIDADES_OFICINA_ADMIN','Actividades de oficina / admin',null,true),
  ('TAM','LOGISTICA','INVENTARIO_GENERAL','Inventario general',null,true),
  ('TAM','ASEO','ASEO_AREAS_PRODUCTIVAS','Aseo de áreas productivas',null,true),

  ('YAR','ASEO','ASEO_AREAS_OFICINA','Aseo de áreas de oficina',null,true),
  ('YAR','ACONDICIONAMIENTO','MOLIENDA','Molienda','kg',true),
  ('YAR','ACONDICIONAMIENTO','SEPARACION_RESIDUOS','Separación de residuos','kg',true),
  ('YAR','ASEO','ASEO_AREAS_PRODUCTIVAS','Aseo de áreas productivas',null,true),
  ('YAR','COMPOSTAJE','VOLTEO_COMPOSTAJE','Volteo de compostaje',null,true),
  ('YAR','COMPOSTAJE','CONFORMACION_PILAS','Conformación de pilas','kg',true),
  ('YAR','ACONDICIONAMIENTO','SEPARACION_RECICLAJE','Separación de reciclaje','kg',true),
  ('YAR','OTRO','ACTIVIDADES_OFICINA_ADMIN','Actividades de oficina / admin',null,true),
  ('YAR','PRODUCCION','TAMIZAJE_PRODUCTO','Tamizaje de producto','kg',true),
  ('YAR','ACONDICIONAMIENTO','MOLIENDA_PRE_TAMIZAJE','Molienda Pre-Tamizaje','kg',true),
  ('YAR','PRODUCCION','BIOFABRICA','Biofábrica','L',true),
  ('YAR','COMPOSTAJE','MEDICION_TEMPERATURA_PILAS','Medición temperatura pilas',null,true),
  ('YAR','ASEO','ASEO_HERRAMIENTAS','Aseo de herramientas',null,true),
  ('YAR','MANTENIMIENTO','MANTENIMIENTO_HERRAMIENTAS_EQUIPOS','Mantenimiento de herramientas o equipos',null,true),
  ('YAR','LOGISTICA','RECOLECCION_ORDINARIOS_SEPARACION','Recolección ordinarios separación',null,true),
  ('YAR','MANTENIMIENTO','MANTENIMIENTO_AREAS','Mantenimiento de áreas',null,true),
  ('YAR','OTRO','ACOMPANAMIENTO_VISITANTES','Acompañamiento de visitantes',null,true),
  ('YAR','COMPOSTAJE','HIDRATAR_PILAS_COMPOST','Hidratar pilas compost','L',true),
  ('YAR','PRODUCCION','COCER_ALMACENAR_PRODUCTO','Cocer y almacenar producto','kg',true),
  ('YAR','PRODUCCION','EMPACAR_PESAR_PRODUCTO','Empacar y pesar producto','kg',true),
  ('YAR','PRODUCCION','FORMULACION_NITROGENADO_15_3_3','Formulación de Nitrogenado 15-3-3','kg',true),
  ('YAR','LOGISTICA','CLASIFICACION_PESAJE_RECICLAJE','Clasificación y pesaje reciclaje','kg',true),
  ('YAR','ASEO','LIMPIEZA_TANQUES_ISOTANQUES','Limpieza tanques e Isotanques',null,true),
  ('YAR','ASEO','ASEO_ZONA_RECEPCION_PICADO','Aseo zona de recepción y picado',null,true),
  ('YAR','RECEPCION','RECEPCION_RESIDUOS','Recepción de residuos','kg',false),
  ('YAR','LOGISTICA','RECIBIR_CARGAR_PRODUCTO','Recibir el camión y cargar producto',null,true),
  ('YAR','PRODUCCION','PELETIZAR_PRODUCTO','Peletizar producto','kg',true),
  ('YAR','PRODUCCION','TRIPLE_7_7_7_SOLIDO','Triple 7-7-7 sólido','kg',true),
  ('YAR','PRODUCCION','SOLIDO_NITROGENADO','Sólido Nitrogenado','kg',true),
  ('YAR','COMPOSTAJE','LOMBRICULTIVO','Lombricultivo',null,true),
  ('YAR','PRODUCCION','PASAR_PRODUCTO_ZONA_SECADO','Pasar producto tamizado a la zona de secado','kg',true),
  ('YAR','PRODUCCION','NITROGENADO_FORMULADO','Nitrogenado Formulado','kg',true),
  ('YAR','LOGISTICA','ORGANIZACION_HERRAMIENTAS','Organización de herramientas',null,true)
)
insert into public.activity_templates(
  plant_id,process_id,code,name,default_unit_code,allows_unplanned
)
select pl.id,op.id,s.code,s.name,s.default_unit_code,s.allows_unplanned
from seed s
join public.plants pl on pl.code=s.plant_code and pl.active
join public.operational_processes op on op.plant_id=pl.id and op.code=s.process_code
on conflict (plant_id,code) do nothing;

-- Hand tools/resources explicitly observed in the operational workbooks.
with seed(plant_code,code,name) as (values
  ('TAM','MOTOBOMBA_GASOLINA','Motobomba a gasolina'),
  ('TAM','MANGUERA','Manguera'),
  ('TAM','ESCALERA','Escalera'),
  ('TAM','EPP','Elementos de protección personal'),
  ('YAR','PALA','Pala'),
  ('YAR','AZADON','Azadón'),
  ('YAR','COSTAL','Costal'),
  ('YAR','CARRETA','Carreta'),
  ('YAR','ESCOBA','Escoba'),
  ('YAR','RECOGEDOR','Recogedor'),
  ('YAR','HIDROLAVADORA','Hidrolavadora'),
  ('YAR','TERMOMETRO_TERMOPAR','Termómetro digital de termopar'),
  ('YAR','COMPUTADOR','Computador'),
  ('YAR','CABUYA','Cabuya'),
  ('YAR','TIJERAS','Tijeras'),
  ('YAR','BALDE','Balde'),
  ('YAR','TRAPERA','Trapera'),
  ('YAR','CEPILLO','Cepillo'),
  ('YAR','MANGUERA','Manguera'),
  ('YAR','MOTOBOMBA','Motobomba'),
  ('YAR','EXTENSION_ELECTRICA','Extensión eléctrica'),
  ('YAR','GANCHO','Gancho'),
  ('YAR','MACHETE','Machete'),
  ('YAR','CUCHILLO','Cuchillo'),
  ('YAR','PALO','Palo'),
  ('YAR','MATA_MALEZA','Mata maleza'),
  ('YAR','EPP','Elementos de protección personal')
)
insert into public.operational_tools(plant_id,code,name)
select pl.id,s.code,s.name
from seed s
join public.plants pl on pl.code=s.plant_code and pl.active
on conflict (plant_id,code) do nothing;

create or replace function private.assert_activity_log_workers(
  target_plant uuid,
  employee_ids uuid[],
  starts_at timestamptz,
  ends_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplied_count integer;
  visible_count integer;
begin
  if starts_at is null then raise exception 'Indica la hora de inicio.'; end if;
  if starts_at > now() + interval '5 minutes' then raise exception 'La hora de inicio no puede estar en el futuro.'; end if;
  if ends_at is not null and ends_at <= starts_at then raise exception 'La hora final debe ser posterior al inicio.'; end if;
  if ends_at is not null and ends_at > now() + interval '5 minutes' then raise exception 'La hora final no puede estar en el futuro.'; end if;

  supplied_count := coalesce(cardinality(employee_ids),0);
  if supplied_count=0 then raise exception 'Selecciona al menos un trabajador.'; end if;
  if supplied_count <> (select count(distinct value) from unnest(employee_ids) as value) then
    raise exception 'La lista de trabajadores contiene duplicados.';
  end if;

  select count(*) into visible_count
  from public.employees e
  where e.id=any(employee_ids) and e.plant_id=target_plant and e.active;
  if visible_count<>supplied_count then
    raise exception 'Uno o más trabajadores no pertenecen a la planta o están inactivos.';
  end if;

  perform private.lock_ops_workers(employee_ids);

  if exists (
    select 1
    from public.activity_workers aw
    join public.activities a on a.id=aw.activity_id
    where aw.employee_id=any(employee_ids)
      and a.plant_id=target_plant
      and tstzrange(a.started_at,coalesce(a.ended_at,'infinity'::timestamptz),'[)')
        && tstzrange(starts_at,coalesce(ends_at,'infinity'::timestamptz),'[)')
  ) then
    raise exception 'Uno o más trabajadores ya tienen otra actividad real en ese horario.';
  end if;
end;
$$;

create or replace function private.assert_activity_log_tools(
  target_plant uuid,
  tool_ids uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  supplied_count integer;
  visible_count integer;
begin
  supplied_count := coalesce(cardinality(tool_ids),0);
  if supplied_count=0 then return; end if;
  if supplied_count <> (select count(distinct value) from unnest(tool_ids) as value) then
    raise exception 'La lista de herramientas contiene duplicados.';
  end if;
  select count(*) into visible_count
  from public.operational_tools t
  where t.id=any(tool_ids) and t.plant_id=target_plant and t.active;
  if visible_count<>supplied_count then
    raise exception 'Una o más herramientas no pertenecen a la planta o están inactivas.';
  end if;
end;
$$;

create or replace function public.ops_record_activity_log(
  target_plant uuid,
  target_template uuid,
  employee_ids uuid[],
  activity_started_at timestamptz,
  activity_ended_at timestamptz default null,
  target_equipment uuid default null,
  tool_ids uuid[] default '{}'::uuid[],
  activity_comment text default null,
  result_quantity numeric default null,
  result_unit text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  activity_id uuid;
  canonical_process uuid;
  template_name text;
  process_name text;
  template_active boolean;
  process_active boolean;
  template_allows_unplanned boolean;
  template_requires_lot boolean;
  template_requires_equipment boolean;
  template_requires_quantity boolean;
  template_default_unit text;
  equipment_code text;
  effective_unit text;
begin
  if not private.has_plant_role(target_plant,array['operator','supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para registrar actividades en esta planta.';
  end if;

  select t.process_id,t.name,t.active,p.name,p.active,t.allows_unplanned,t.requires_lot,
         t.requires_equipment,t.requires_quantity,t.default_unit_code
  into canonical_process,template_name,template_active,process_name,process_active,
       template_allows_unplanned,template_requires_lot,template_requires_equipment,
       template_requires_quantity,template_default_unit
  from public.activity_templates t
  join public.operational_processes p on p.id=t.process_id and p.plant_id=t.plant_id
  where t.id=target_template and t.plant_id=target_plant;

  if not found then raise exception 'La actividad seleccionada no pertenece a la planta.'; end if;
  if not template_active or not process_active then raise exception 'La actividad o su proceso están inactivos.'; end if;
  if not template_allows_unplanned then raise exception 'Esta actividad debe registrarse desde su flujo operacional específico.'; end if;
  if template_requires_lot then raise exception 'Esta actividad requiere un lote y debe registrarse desde el flujo técnico correspondiente.'; end if;
  if template_requires_equipment and target_equipment is null then raise exception 'Esta actividad requiere un equipo.'; end if;

  perform private.assert_activity_log_workers(target_plant,employee_ids,activity_started_at,activity_ended_at);
  perform private.assert_activity_log_tools(target_plant,tool_ids);

  if target_equipment is not null then
    select e.code into equipment_code
    from public.equipment e
    where e.id=target_equipment and e.plant_id=target_plant;
    if equipment_code is null then raise exception 'El equipo no pertenece a la planta.'; end if;
    if not exists (
      select 1 from public.equipment_processes ep
      where ep.equipment_id=target_equipment
        and ep.process_id=canonical_process
        and ep.plant_id=target_plant
        and ep.active
    ) then
      raise exception 'El equipo no está habilitado para el proceso de la actividad.';
    end if;

    perform pg_advisory_xact_lock(hashtextextended('greenatics-actual-equipment:'||target_equipment::text,0));
    if exists (
      select 1 from public.activities a
      where a.plant_id=target_plant
        and a.equipment_id=target_equipment
        and tstzrange(a.started_at,coalesce(a.ended_at,'infinity'::timestamptz),'[)')
          && tstzrange(activity_started_at,coalesce(activity_ended_at,'infinity'::timestamptz),'[)')
    ) then
      raise exception 'El equipo ya está asociado a otra actividad real en ese horario.';
    end if;
  end if;

  if result_quantity is not null and result_quantity<=0 then raise exception 'La cantidad debe ser mayor que cero.'; end if;
  if activity_ended_at is null and result_quantity is not null then raise exception 'La cantidad final se registra al cerrar la actividad.'; end if;
  if activity_ended_at is not null and template_requires_quantity and result_quantity is null then
    raise exception 'Esta actividad requiere registrar la cantidad final.';
  end if;

  effective_unit := case when result_quantity is null then null else coalesce(nullif(btrim(result_unit),''),template_default_unit) end;
  if result_quantity is not null and effective_unit is null then raise exception 'Selecciona la unidad de la cantidad.'; end if;
  if effective_unit is not null and not exists (select 1 from public.measurement_units u where u.code=effective_unit and u.active) then
    raise exception 'La unidad seleccionada no es válida.';
  end if;

  insert into public.activities(
    plant_id,title,process,started_at,ended_at,quantity,unit,equipment_ref,
    process_id,activity_template_id,equipment_id,activity_comment,source_kind,created_by
  ) values (
    target_plant,template_name,process_name,activity_started_at,activity_ended_at,result_quantity,effective_unit,equipment_code,
    canonical_process,target_template,target_equipment,nullif(btrim(activity_comment),''),'app',auth.uid()
  ) returning id into activity_id;

  insert into public.activity_workers(activity_id,employee_id)
  select activity_id,value from unnest(employee_ids) as value;

  insert into public.activity_tools(activity_id,tool_id,plant_id,created_by)
  select activity_id,value,target_plant,auth.uid()
  from unnest(coalesce(tool_ids,'{}'::uuid[])) as value;

  return activity_id;
end;
$$;

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

revoke all on function private.assert_activity_log_workers(uuid,uuid[],timestamptz,timestamptz) from public,anon,authenticated;
revoke all on function private.assert_activity_log_tools(uuid,uuid[]) from public,anon,authenticated;
revoke all on function public.ops_record_activity_log(uuid,uuid,uuid[],timestamptz,timestamptz,uuid,uuid[],text,numeric,text) from public,anon;
revoke all on function public.ops_finish_activity_v2(uuid,numeric,text,text,text,boolean,text,uuid[]) from public,anon;

grant execute on function public.ops_record_activity_log(uuid,uuid,uuid[],timestamptz,timestamptz,uuid,uuid[],text,numeric,text) to authenticated;
grant execute on function public.ops_finish_activity_v2(uuid,numeric,text,text,text,boolean,text,uuid[]) to authenticated;

grant select,insert,update on public.operational_tools to authenticated;
grant select on public.activity_tools to authenticated;

comment on table public.operational_tools is 'Plant-scoped tool/resource catalog used by Bitácora 2.0; deactivate instead of deleting history.';
comment on table public.activity_tools is 'Tools actually used in an activity. Authenticated writes are atomic through Bitácora RPCs.';
comment on column public.activities.activity_comment is 'Normal operational observation/comment, separate from incident or novelty notes.';
comment on function public.ops_record_activity_log(uuid,uuid,uuid[],timestamptz,timestamptz,uuid,uuid[],text,numeric,text) is 'Records a structured unplanned activity using canonical template/process/equipment/tool references and explicit real times.';
comment on function public.ops_finish_activity_v2(uuid,numeric,text,text,text,boolean,text,uuid[]) is 'Closes a running activity while recording result, final operational comment, tools used and optional novelty/incident.';
