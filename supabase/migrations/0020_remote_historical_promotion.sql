-- CORE-003 · atomic historical promotion.
-- The browser may stage/inspect locally; only an explicit approval writes immutable source evidence and canonical rows.

create or replace function private.normalize_person_name(value text)
returns text
language sql
immutable
set search_path=''
as $$
  select btrim(regexp_replace(regexp_replace(lower(translate(btrim(value),'ÁÉÍÓÚÜÑáéíóúüñ','AEIOUUNaeiouun')),'[^a-z0-9 ]+','','g'),'[[:space:]]+',' ','g'));
$$;

create or replace function private.resolve_import_plant(canonical_id text)
returns uuid
language sql
stable
security definer
set search_path=''
as $$
  select p.id
  from public.plants p
  where p.active
    and (
      private.normalize_person_name(p.code)=private.normalize_person_name(canonical_id)
      or private.normalize_person_name(p.name)=private.normalize_person_name(canonical_id)
      or (private.normalize_person_name(canonical_id)='tamesis' and private.normalize_person_name(p.name)='tamesis')
      or (private.normalize_person_name(canonical_id)='yarumal' and private.normalize_person_name(p.name)='yarumal')
    )
  order by case when private.normalize_person_name(p.code)=private.normalize_person_name(canonical_id) then 0 else 1 end
  limit 1;
$$;

create or replace function private.resolve_historical_employee(target_plant uuid,worker_name text)
returns uuid
language plpgsql
security definer
set search_path=''
as $$
declare
  normalized text;
  employee_uuid uuid;
begin
  normalized:=private.normalize_person_name(worker_name);
  if normalized='' then raise exception 'Trabajador histórico sin nombre'; end if;
  perform pg_advisory_xact_lock(hashtextextended('greenatics-historical-worker:'||target_plant::text||':'||normalized,0));
  select e.id into employee_uuid
  from public.employees e
  where e.plant_id=target_plant and private.normalize_person_name(e.display_name)=normalized
  order by e.active desc,e.created_at asc
  limit 1;
  if employee_uuid is null then
    insert into public.employees(plant_id,display_name,historical)
    values(target_plant,btrim(worker_name),true)
    returning id into employee_uuid;
  end if;
  return employee_uuid;
end;
$$;

create or replace function public.promote_historical_import(
  p_source_name text,
  p_source_hash text,
  p_source_rows jsonb,
  p_issues jsonb,
  p_activities jsonb,
  p_receipts jsonb
)
returns table(run_id uuid,activities_count integer,receptions_count integer)
language plpgsql
security definer
set search_path=''
as $$
declare
  existing public.import_runs%rowtype;
  run_uuid uuid;
  item jsonb;
  issue jsonb;
  activity jsonb;
  receipt jsonb;
  target_plant uuid;
  activity_uuid uuid;
  employee_uuid uuid;
  worker jsonb;
  activity_total integer:=0;
  receipt_total integer:=0;
  rejection numeric;
  net_weight numeric;
begin
  if not private.has_import_role() then raise exception 'Solo administración o dirección puede promover históricos'; end if;
  if btrim(coalesce(p_source_name,''))='' then raise exception 'La fuente histórica no tiene nombre'; end if;
  if btrim(coalesce(p_source_hash,''))='' then raise exception 'La fuente histórica no tiene hash'; end if;
  if jsonb_typeof(coalesce(p_source_rows,'[]'::jsonb))<>'array' or jsonb_typeof(coalesce(p_issues,'[]'::jsonb))<>'array' or jsonb_typeof(coalesce(p_activities,'[]'::jsonb))<>'array' or jsonb_typeof(coalesce(p_receipts,'[]'::jsonb))<>'array' then raise exception 'Payload histórico inválido'; end if;

  select * into existing from public.import_runs where source_hash=p_source_hash for update;
  if existing.id is not null then
    raise exception 'Esta fuente histórica ya existe en el repositorio remoto con estado %',existing.status;
  end if;

  insert into public.import_runs(source_name,source_hash,status,created_by)
  values(btrim(p_source_name),btrim(p_source_hash),'dry_run',auth.uid())
  returning id into run_uuid;

  for item in select value from jsonb_array_elements(coalesce(p_source_rows,'[]'::jsonb))
  loop
    insert into public.import_source_rows(run_id,source_row_id,row_kind,status,raw,normalized)
    values(
      run_uuid,
      item->>'sourceRowId',
      item->>'rowKind',
      item->>'status',
      coalesce(item->'raw','{}'::jsonb),
      item->'normalized'
    );
  end loop;

  for issue in select value from jsonb_array_elements(coalesce(p_issues,'[]'::jsonb))
  loop
    insert into public.import_issues(run_id,source_row_id,code,field_name,severity,source_value,detail)
    values(
      run_uuid,
      issue->>'rowId',
      issue->>'code',
      issue->>'field',
      issue->>'severity',
      issue->'sourceValue',
      issue->>'detail'
    );
  end loop;

  for activity in select value from jsonb_array_elements(coalesce(p_activities,'[]'::jsonb))
  loop
    target_plant:=private.resolve_import_plant(activity->>'plantId');
    if target_plant is null then raise exception 'Planta histórica no resoluble: %',activity->>'plantId'; end if;
    if not private.has_plant_role(target_plant,array['admin','director']) then raise exception 'Sin permiso de importación sobre la planta %',activity->>'plantId'; end if;
    if coalesce(jsonb_array_length(coalesce(activity->'workers','[]'::jsonb)),0)=0 then raise exception 'Actividad histórica sin trabajadores'; end if;

    insert into public.activities(
      plant_id,title,process,started_at,ended_at,equipment_ref,source_kind,import_run_id,source_row_ids,import_record_key,created_by
    ) values(
      target_plant,
      activity->>'title',
      coalesce(nullif(activity->>'process',''),activity->>'title'),
      (activity->>'startedAt')::timestamptz,
      (activity->>'endedAt')::timestamptz,
      nullif(activity->>'equipment',''),
      'historical',
      run_uuid,
      array(select jsonb_array_elements_text(coalesce(activity->'sourceRowIds','[]'::jsonb))),
      activity->>'recordKey',
      auth.uid()
    ) returning id into activity_uuid;

    for worker in select value from jsonb_array_elements(activity->'workers')
    loop
      employee_uuid:=private.resolve_historical_employee(target_plant,worker#>>'{}');
      insert into public.activity_workers(activity_id,employee_id) values(activity_uuid,employee_uuid) on conflict do nothing;
    end loop;
    activity_total:=activity_total+1;
  end loop;

  for receipt in select value from jsonb_array_elements(coalesce(p_receipts,'[]'::jsonb))
  loop
    target_plant:=private.resolve_import_plant(receipt->>'plantId');
    if target_plant is null then raise exception 'Planta histórica no resoluble: %',receipt->>'plantId'; end if;
    if not private.has_plant_role(target_plant,array['admin','director']) then raise exception 'Sin permiso de importación sobre la planta %',receipt->>'plantId'; end if;
    net_weight:=(receipt->>'netWeightKg')::numeric;
    rejection:=(receipt->>'rejectionKg')::numeric;
    if net_weight<=0 or rejection<0 or rejection>net_weight then raise exception 'Masa histórica inválida en %',receipt->>'recordKey'; end if;

    insert into public.material_receipts(
      plant_id,generator,route,waste_type,net_weight_kg,rejection_kg,rejection_known,acceptance_status,observation,
      started_at,ended_at,lot_code,source_kind,time_precision,import_run_id,source_row_ids,import_record_key,created_by
    ) values(
      target_plant,
      receipt->>'generator',
      receipt->>'route',
      receipt->>'wasteType',
      net_weight,
      rejection,
      coalesce((receipt->>'rejectionKnown')::boolean,true),
      'unknown',
      nullif(receipt->>'observation',''),
      (receipt->>'startedAt')::timestamptz,
      (receipt->>'endedAt')::timestamptz,
      receipt->>'lotCode',
      'historical',
      coalesce(nullif(receipt->>'timePrecision',''),'datetime'),
      run_uuid,
      array(select jsonb_array_elements_text(coalesce(receipt->'sourceRowIds','[]'::jsonb))),
      receipt->>'recordKey',
      auth.uid()
    );
    receipt_total:=receipt_total+1;
  end loop;

  update public.import_runs set status='promoted',promoted_at=now() where id=run_uuid;
  return query select run_uuid,activity_total,receipt_total;
end;
$$;

revoke all on function private.normalize_person_name(text) from public;
revoke all on function private.resolve_import_plant(text) from public;
revoke all on function private.resolve_historical_employee(uuid,text) from public;
revoke all on function public.promote_historical_import(text,text,jsonb,jsonb,jsonb,jsonb) from public,anon;
grant execute on function public.promote_historical_import(text,text,jsonb,jsonb,jsonb,jsonb) to authenticated;
