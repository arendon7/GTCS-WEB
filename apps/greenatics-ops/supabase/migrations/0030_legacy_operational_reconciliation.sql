-- Wave 2A.5 · Legacy operational reconciliation.
-- Exact normalized matches may be applied automatically; fuzzy matches never are.
-- Curated decisions are append-only and always preserve the original legacy text.

create or replace function private.normalize_operational_label(value text)
returns text
language sql
immutable
set search_path = ''
as $$
  select btrim(
    regexp_replace(
      regexp_replace(
        lower(translate(coalesce(value,''),'ÁÉÍÓÚÜÑáéíóúüñ','AEIOUUNaeiouun')),
        '[^a-z0-9]+',' ','g'
      ),
      '[[:space:]]+',' ','g'
    )
  );
$$;

revoke all on function private.normalize_operational_label(text) from public,anon,authenticated;

create table if not exists public.legacy_operational_mapping_decisions (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete cascade,
  field_kind text not null check (field_kind in ('process','activity','equipment')),
  legacy_value text not null,
  normalized_value text not null,
  decision_kind text not null check (decision_kind in ('curated','unmapped')),
  target_process_id uuid,
  target_activity_template_id uuid,
  target_equipment_id uuid,
  version integer not null check (version > 0),
  decided_by uuid not null references auth.users(id),
  decided_at timestamptz not null default now(),
  unique (plant_id,field_kind,normalized_value,version),
  foreign key (target_process_id,plant_id)
    references public.operational_processes(id,plant_id) on delete restrict,
  foreign key (target_activity_template_id,plant_id)
    references public.activity_templates(id,plant_id) on delete restrict,
  foreign key (target_equipment_id,plant_id)
    references public.equipment(id,plant_id) on delete restrict,
  check (nullif(btrim(legacy_value),'') is not null),
  check (nullif(btrim(normalized_value),'') is not null),
  check (
    (decision_kind='unmapped'
      and target_process_id is null
      and target_activity_template_id is null
      and target_equipment_id is null)
    or
    (decision_kind='curated' and (
      (field_kind='process'
        and target_process_id is not null
        and target_activity_template_id is null
        and target_equipment_id is null)
      or
      (field_kind='activity'
        and target_process_id is null
        and target_activity_template_id is not null
        and target_equipment_id is null)
      or
      (field_kind='equipment'
        and target_process_id is null
        and target_activity_template_id is null
        and target_equipment_id is not null)
    ))
  )
);

create index if not exists legacy_operational_mapping_lookup_idx
  on public.legacy_operational_mapping_decisions(plant_id,field_kind,normalized_value,version desc);

alter table public.legacy_operational_mapping_decisions enable row level security;

create policy "legacy_operational_mapping_member_select"
  on public.legacy_operational_mapping_decisions for select to authenticated
  using ((select private.has_plant_access(plant_id)));

-- Deliberately no INSERT/UPDATE/DELETE policies. Curated decisions are append-only via RPC.

create or replace function private.resolve_legacy_operational_target(
  target_plant uuid,
  target_kind text,
  source_value text
)
returns table(
  resolution_method text,
  target_id uuid,
  target_code text,
  target_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  normalized text;
  latest public.legacy_operational_mapping_decisions%rowtype;
  exact_count integer;
begin
  if target_kind not in ('process','activity','equipment') then
    raise exception 'Tipo de reconciliación inválido.';
  end if;

  normalized := private.normalize_operational_label(source_value);
  if normalized='' then
    return query select 'unmapped'::text,null::uuid,null::text,null::text;
    return;
  end if;

  select d.* into latest
  from public.legacy_operational_mapping_decisions d
  where d.plant_id=target_plant
    and d.field_kind=target_kind
    and d.normalized_value=normalized
  order by d.version desc,d.decided_at desc,d.id desc
  limit 1;

  if found then
    if latest.decision_kind='unmapped' then
      return query select 'unmapped'::text,null::uuid,null::text,null::text;
      return;
    end if;

    if target_kind='process' then
      return query
      select 'curated'::text,p.id,p.code,p.name
      from public.operational_processes p
      where p.id=latest.target_process_id and p.plant_id=target_plant;
    elsif target_kind='activity' then
      return query
      select 'curated'::text,t.id,t.code,t.name
      from public.activity_templates t
      where t.id=latest.target_activity_template_id and t.plant_id=target_plant;
    else
      return query
      select 'curated'::text,e.id,e.code,e.name
      from public.equipment e
      where e.id=latest.target_equipment_id and e.plant_id=target_plant;
    end if;
    return;
  end if;

  if target_kind='process' then
    select count(distinct p.id) into exact_count
    from public.operational_processes p
    where p.plant_id=target_plant
      and normalized in (
        private.normalize_operational_label(p.code),
        private.normalize_operational_label(p.name)
      );

    if exact_count=1 then
      return query
      select 'exact'::text,p.id,p.code,p.name
      from public.operational_processes p
      where p.plant_id=target_plant
        and normalized in (
          private.normalize_operational_label(p.code),
          private.normalize_operational_label(p.name)
        )
      order by p.id
      limit 1;
      return;
    end if;
  elsif target_kind='activity' then
    select count(distinct t.id) into exact_count
    from public.activity_templates t
    where t.plant_id=target_plant
      and normalized in (
        private.normalize_operational_label(t.code),
        private.normalize_operational_label(t.name)
      );

    if exact_count=1 then
      return query
      select 'exact'::text,t.id,t.code,t.name
      from public.activity_templates t
      where t.plant_id=target_plant
        and normalized in (
          private.normalize_operational_label(t.code),
          private.normalize_operational_label(t.name)
        )
      order by t.id
      limit 1;
      return;
    end if;
  else
    select count(distinct e.id) into exact_count
    from public.equipment e
    where e.plant_id=target_plant
      and normalized in (
        private.normalize_operational_label(e.code),
        private.normalize_operational_label(e.name)
      );

    if exact_count=1 then
      return query
      select 'exact'::text,e.id,e.code,e.name
      from public.equipment e
      where e.plant_id=target_plant
        and normalized in (
          private.normalize_operational_label(e.code),
          private.normalize_operational_label(e.name)
        )
      order by e.id
      limit 1;
      return;
    end if;
  end if;

  return query select 'unmapped'::text,null::uuid,null::text,null::text;
end;
$$;

revoke all on function private.resolve_legacy_operational_target(uuid,text,text) from public,anon,authenticated;

create or replace function public.ops_list_legacy_operational_reconciliation(
  target_plant uuid,
  target_kind text default null
)
returns table(
  field_kind text,
  legacy_value text,
  normalized_value text,
  occurrence_count bigint,
  activity_rows bigint,
  scheduled_rows bigint,
  resolution_method text,
  target_id uuid,
  target_code text,
  target_name text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.has_plant_access(target_plant) then
    raise exception 'No tienes acceso a esta planta.';
  end if;
  if target_kind is not null and target_kind not in ('process','activity','equipment') then
    raise exception 'Tipo de reconciliación inválido.';
  end if;

  return query
  with pending as (
    select 'process'::text as kind,a.process as value,1::bigint as activity_count,0::bigint as scheduled_count
    from public.activities a
    where a.plant_id=target_plant and a.process_id is null and nullif(btrim(a.process),'') is not null
    union all
    select 'process',s.process,0::bigint,1::bigint
    from public.scheduled_activities s
    where s.plant_id=target_plant and s.process_id is null and nullif(btrim(s.process),'') is not null
    union all
    select 'activity',a.title,1::bigint,0::bigint
    from public.activities a
    where a.plant_id=target_plant and a.activity_template_id is null and nullif(btrim(a.title),'') is not null
    union all
    select 'activity',s.title,0::bigint,1::bigint
    from public.scheduled_activities s
    where s.plant_id=target_plant and s.activity_template_id is null and nullif(btrim(s.title),'') is not null
    union all
    select 'equipment',a.equipment_ref,1::bigint,0::bigint
    from public.activities a
    where a.plant_id=target_plant and a.equipment_id is null and nullif(btrim(a.equipment_ref),'') is not null
    union all
    select 'equipment',s.equipment_ref,0::bigint,1::bigint
    from public.scheduled_activities s
    where s.plant_id=target_plant and s.equipment_id is null and nullif(btrim(s.equipment_ref),'') is not null
  ), grouped as (
    select
      p.kind,
      min(p.value) as sample_value,
      private.normalize_operational_label(p.value) as normalized,
      sum(p.activity_count)::bigint as activity_count,
      sum(p.scheduled_count)::bigint as scheduled_count
    from pending p
    where target_kind is null or p.kind=target_kind
    group by p.kind,private.normalize_operational_label(p.value)
  )
  select
    g.kind,
    g.sample_value,
    g.normalized,
    (g.activity_count+g.scheduled_count)::bigint,
    g.activity_count,
    g.scheduled_count,
    r.resolution_method,
    r.target_id,
    r.target_code,
    r.target_name
  from grouped g
  cross join lateral private.resolve_legacy_operational_target(target_plant,g.kind,g.sample_value) r
  order by g.kind,(g.activity_count+g.scheduled_count) desc,g.normalized;
end;
$$;

create or replace function public.ops_legacy_operational_reconciliation_metrics(
  target_plant uuid
)
returns table(
  field_kind text,
  total_rows bigint,
  canonical_rows bigint,
  pending_rows bigint,
  resolvable_rows bigint,
  unmapped_rows bigint,
  coverage_percent numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.has_plant_access(target_plant) then
    raise exception 'No tienes acceso a esta planta.';
  end if;

  return query
  with base as (
    select 'process'::text as kind,
      (select count(*) from public.activities a where a.plant_id=target_plant and nullif(btrim(a.process),'') is not null)
      +(select count(*) from public.scheduled_activities s where s.plant_id=target_plant and nullif(btrim(s.process),'') is not null) as total,
      (select count(*) from public.activities a where a.plant_id=target_plant and nullif(btrim(a.process),'') is not null and a.process_id is not null)
      +(select count(*) from public.scheduled_activities s where s.plant_id=target_plant and nullif(btrim(s.process),'') is not null and s.process_id is not null) as canonical
    union all
    select 'activity',
      (select count(*) from public.activities a where a.plant_id=target_plant and nullif(btrim(a.title),'') is not null)
      +(select count(*) from public.scheduled_activities s where s.plant_id=target_plant and nullif(btrim(s.title),'') is not null),
      (select count(*) from public.activities a where a.plant_id=target_plant and a.activity_template_id is not null)
      +(select count(*) from public.scheduled_activities s where s.plant_id=target_plant and s.activity_template_id is not null)
    union all
    select 'equipment',
      (select count(*) from public.activities a where a.plant_id=target_plant and nullif(btrim(a.equipment_ref),'') is not null)
      +(select count(*) from public.scheduled_activities s where s.plant_id=target_plant and nullif(btrim(s.equipment_ref),'') is not null),
      (select count(*) from public.activities a where a.plant_id=target_plant and nullif(btrim(a.equipment_ref),'') is not null and a.equipment_id is not null)
      +(select count(*) from public.scheduled_activities s where s.plant_id=target_plant and nullif(btrim(s.equipment_ref),'') is not null and s.equipment_id is not null)
  ), pending_resolution as (
    select l.field_kind,
      coalesce(sum(l.occurrence_count) filter (where l.resolution_method in ('exact','curated')),0)::bigint as resolvable,
      coalesce(sum(l.occurrence_count) filter (where l.resolution_method='unmapped'),0)::bigint as unmapped
    from public.ops_list_legacy_operational_reconciliation(target_plant,null) l
    group by l.field_kind
  )
  select
    b.kind,
    b.total::bigint,
    b.canonical::bigint,
    (b.total-b.canonical)::bigint,
    coalesce(pr.resolvable,0)::bigint,
    coalesce(pr.unmapped,0)::bigint,
    case when b.total=0 then 100.00::numeric
      else round((b.canonical::numeric*100.0)/b.total::numeric,2)
    end
  from base b
  left join pending_resolution pr on pr.field_kind=b.kind
  order by case b.kind when 'process' then 1 when 'activity' then 2 else 3 end;
end;
$$;

create or replace function public.ops_curate_legacy_operational_mapping(
  target_plant uuid,
  target_kind text,
  source_value text,
  canonical_target uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized text;
  next_version integer;
  decision_id uuid;
  target_process uuid;
  target_template uuid;
  target_equipment uuid;
begin
  if not private.has_plant_role(target_plant,array['admin','director']) then
    raise exception 'Solo administración o dirección puede curar equivalencias legacy.';
  end if;
  if target_kind not in ('process','activity','equipment') then
    raise exception 'Tipo de reconciliación inválido.';
  end if;

  normalized := private.normalize_operational_label(source_value);
  if normalized='' then raise exception 'El valor legacy no puede quedar vacío.'; end if;

  if canonical_target is not null then
    if target_kind='process' then
      select p.id into target_process
      from public.operational_processes p
      where p.id=canonical_target and p.plant_id=target_plant;
      if target_process is null then raise exception 'El proceso canónico no pertenece a la planta.'; end if;
    elsif target_kind='activity' then
      select t.id into target_template
      from public.activity_templates t
      where t.id=canonical_target and t.plant_id=target_plant;
      if target_template is null then raise exception 'La plantilla canónica no pertenece a la planta.'; end if;
    else
      select e.id into target_equipment
      from public.equipment e
      where e.id=canonical_target and e.plant_id=target_plant;
      if target_equipment is null then raise exception 'El equipo canónico no pertenece a la planta.'; end if;
    end if;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(
    'greenatics-legacy-map:'||target_plant::text||':'||target_kind||':'||normalized,0
  ));

  select coalesce(max(d.version),0)+1 into next_version
  from public.legacy_operational_mapping_decisions d
  where d.plant_id=target_plant
    and d.field_kind=target_kind
    and d.normalized_value=normalized;

  insert into public.legacy_operational_mapping_decisions(
    plant_id,field_kind,legacy_value,normalized_value,decision_kind,
    target_process_id,target_activity_template_id,target_equipment_id,
    version,decided_by
  ) values (
    target_plant,target_kind,btrim(source_value),normalized,
    case when canonical_target is null then 'unmapped' else 'curated' end,
    target_process,target_template,target_equipment,
    next_version,auth.uid()
  ) returning id into decision_id;

  return decision_id;
end;
$$;

create or replace function public.ops_apply_legacy_operational_reconciliation(
  target_plant uuid
)
returns table(
  activities_process integer,
  activities_template integer,
  activities_equipment integer,
  scheduled_process integer,
  scheduled_template integer,
  scheduled_equipment integer,
  template_process_conflicts integer
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  count_activities_process integer := 0;
  count_activities_template integer := 0;
  count_activities_equipment integer := 0;
  count_scheduled_process integer := 0;
  count_scheduled_template integer := 0;
  count_scheduled_equipment integer := 0;
  count_conflicts integer := 0;
begin
  if not private.has_plant_role(target_plant,array['admin','director']) then
    raise exception 'Solo administración o dirección puede aplicar reconciliación legacy.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('greenatics-legacy-apply:'||target_plant::text,0));

  with candidates as (
    select a.id,r.target_id
    from public.activities a
    cross join lateral private.resolve_legacy_operational_target(a.plant_id,'process',a.process) r
    where a.plant_id=target_plant
      and a.process_id is null
      and nullif(btrim(a.process),'') is not null
      and r.target_id is not null
  )
  update public.activities a
  set process_id=c.target_id
  from candidates c
  where a.id=c.id;
  get diagnostics count_activities_process = row_count;

  with candidates as (
    select a.id,r.target_id,t.process_id as template_process_id,a.process_id as current_process_id
    from public.activities a
    cross join lateral private.resolve_legacy_operational_target(a.plant_id,'activity',a.title) r
    join public.activity_templates t on t.id=r.target_id and t.plant_id=a.plant_id
    where a.plant_id=target_plant
      and a.activity_template_id is null
      and r.target_id is not null
  )
  update public.activities a
  set activity_template_id=c.target_id,
      process_id=coalesce(a.process_id,c.template_process_id)
  from candidates c
  where a.id=c.id
    and (a.process_id is null or a.process_id=c.template_process_id);
  get diagnostics count_activities_template = row_count;

  with candidates as (
    select a.id,r.target_id
    from public.activities a
    cross join lateral private.resolve_legacy_operational_target(a.plant_id,'equipment',a.equipment_ref) r
    where a.plant_id=target_plant
      and a.equipment_id is null
      and nullif(btrim(a.equipment_ref),'') is not null
      and r.target_id is not null
  )
  update public.activities a
  set equipment_id=c.target_id
  from candidates c
  where a.id=c.id;
  get diagnostics count_activities_equipment = row_count;

  with candidates as (
    select s.id,r.target_id
    from public.scheduled_activities s
    cross join lateral private.resolve_legacy_operational_target(s.plant_id,'process',s.process) r
    where s.plant_id=target_plant
      and s.process_id is null
      and nullif(btrim(s.process),'') is not null
      and r.target_id is not null
  )
  update public.scheduled_activities s
  set process_id=c.target_id
  from candidates c
  where s.id=c.id;
  get diagnostics count_scheduled_process = row_count;

  with candidates as (
    select s.id,r.target_id,t.process_id as template_process_id,s.process_id as current_process_id
    from public.scheduled_activities s
    cross join lateral private.resolve_legacy_operational_target(s.plant_id,'activity',s.title) r
    join public.activity_templates t on t.id=r.target_id and t.plant_id=s.plant_id
    where s.plant_id=target_plant
      and s.activity_template_id is null
      and r.target_id is not null
  )
  update public.scheduled_activities s
  set activity_template_id=c.target_id,
      process_id=coalesce(s.process_id,c.template_process_id)
  from candidates c
  where s.id=c.id
    and (s.process_id is null or s.process_id=c.template_process_id);
  get diagnostics count_scheduled_template = row_count;

  with candidates as (
    select s.id,r.target_id
    from public.scheduled_activities s
    cross join lateral private.resolve_legacy_operational_target(s.plant_id,'equipment',s.equipment_ref) r
    where s.plant_id=target_plant
      and s.equipment_id is null
      and nullif(btrim(s.equipment_ref),'') is not null
      and r.target_id is not null
  )
  update public.scheduled_activities s
  set equipment_id=c.target_id
  from candidates c
  where s.id=c.id;
  get diagnostics count_scheduled_equipment = row_count;

  select
    (select count(*)
      from public.activities a
      cross join lateral private.resolve_legacy_operational_target(a.plant_id,'activity',a.title) r
      join public.activity_templates t on t.id=r.target_id and t.plant_id=a.plant_id
      where a.plant_id=target_plant
        and a.activity_template_id is null
        and r.target_id is not null
        and a.process_id is not null
        and a.process_id<>t.process_id)
    +
    (select count(*)
      from public.scheduled_activities s
      cross join lateral private.resolve_legacy_operational_target(s.plant_id,'activity',s.title) r
      join public.activity_templates t on t.id=r.target_id and t.plant_id=s.plant_id
      where s.plant_id=target_plant
        and s.activity_template_id is null
        and r.target_id is not null
        and s.process_id is not null
        and s.process_id<>t.process_id)
  into count_conflicts;

  return query select
    count_activities_process,
    count_activities_template,
    count_activities_equipment,
    count_scheduled_process,
    count_scheduled_template,
    count_scheduled_equipment,
    count_conflicts;
end;
$$;

revoke all on function public.ops_list_legacy_operational_reconciliation(uuid,text) from public,anon;
revoke all on function public.ops_legacy_operational_reconciliation_metrics(uuid) from public,anon;
revoke all on function public.ops_curate_legacy_operational_mapping(uuid,text,text,uuid) from public,anon;
revoke all on function public.ops_apply_legacy_operational_reconciliation(uuid) from public,anon;

grant execute on function public.ops_list_legacy_operational_reconciliation(uuid,text) to authenticated;
grant execute on function public.ops_legacy_operational_reconciliation_metrics(uuid) to authenticated;
grant execute on function public.ops_curate_legacy_operational_mapping(uuid,text,text,uuid) to authenticated;
grant execute on function public.ops_apply_legacy_operational_reconciliation(uuid) to authenticated;

comment on table public.legacy_operational_mapping_decisions is
  'Append-only human curation for legacy process/activity/equipment labels. Latest version wins; raw legacy text remains untouched.';
comment on function public.ops_apply_legacy_operational_reconciliation(uuid) is
  'Backfills nullable canonical operational FKs only. Never rewrites title/process/equipment_ref legacy evidence.';
