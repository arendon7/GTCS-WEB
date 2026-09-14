-- Wave 2B.5 · Mantenimiento 2.0 foundation.
-- Additive contract: structured failures, evidence, transactional repair lifecycle,
-- physical spare-part consumption and schedule-based mechanical availability.

create unique index if not exists maintenance_tickets_id_plant_uidx on public.maintenance_tickets(id,plant_id);

alter table public.maintenance_tickets
  add column if not exists failure_type text not null default 'other',
  add column if not exists failed_at timestamptz;

update public.maintenance_tickets
set failed_at=opened_at
where failed_at is null;

alter table public.maintenance_tickets alter column failed_at set not null;
alter table public.maintenance_tickets drop constraint if exists maintenance_tickets_failure_type_check;
alter table public.maintenance_tickets add constraint maintenance_tickets_failure_type_check
  check (failure_type in ('mechanical','electrical','hydraulic','pneumatic','blockage','instrumentation','structural','other'));
alter table public.maintenance_tickets drop constraint if exists maintenance_tickets_failed_at_check;
alter table public.maintenance_tickets add constraint maintenance_tickets_failed_at_check
  check (failed_at <= opened_at + interval '5 minutes');
alter table public.maintenance_tickets drop constraint if exists maintenance_tickets_repair_after_failure_check;
alter table public.maintenance_tickets add constraint maintenance_tickets_repair_after_failure_check
  check (repair_started_at is null or repair_started_at >= failed_at);
alter table public.maintenance_tickets drop constraint if exists maintenance_tickets_close_after_repair_check;
alter table public.maintenance_tickets add constraint maintenance_tickets_close_after_repair_check
  check (closed_at is null or repair_started_at is null or closed_at >= repair_started_at);

create table if not exists public.maintenance_ticket_evidence (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null,
  plant_id uuid not null references public.plants(id) on delete restrict,
  stage text not null check (stage in ('failure','repair')),
  evidence_ref text not null,
  created_by uuid references auth.users(id) default auth.uid(),
  created_at timestamptz not null default now(),
  foreign key (ticket_id,plant_id) references public.maintenance_tickets(id,plant_id) on delete cascade,
  unique (ticket_id,stage,evidence_ref),
  check (nullif(btrim(evidence_ref),'') is not null),
  check (length(evidence_ref) <= 1000)
);
create index if not exists maintenance_ticket_evidence_ticket_idx on public.maintenance_ticket_evidence(ticket_id,stage,created_at);
alter table public.maintenance_ticket_evidence enable row level security;
create policy "maintenance_evidence_member_select" on public.maintenance_ticket_evidence for select to authenticated
using ((select private.has_plant_access(plant_id)));
grant select on public.maintenance_ticket_evidence to authenticated;
revoke insert,update,delete on public.maintenance_ticket_evidence from authenticated;

create or replace function public.ops_report_equipment_failure_v2(
  target_equipment uuid,
  failure_kind text,
  failure_occurred_at timestamptz,
  failure_severity text,
  failure_title text,
  failure_impact text,
  evidence_refs text[] default '{}'::text[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  asset public.equipment%rowtype;
  ticket_id uuid;
  evidence_ref text;
begin
  select * into asset from public.equipment e where e.id=target_equipment for update;
  if not found then raise exception 'Equipo no encontrado.'; end if;
  if not private.has_plant_role(asset.plant_id,array['operator','supervisor','technical','maintenance','admin','director']) then
    raise exception 'No tienes permiso para reportar fallas en esta planta.';
  end if;
  if failure_kind not in ('mechanical','electrical','hydraulic','pneumatic','blockage','instrumentation','structural','other') then raise exception 'Tipo de falla inválido.'; end if;
  if failure_severity not in ('low','medium','high') then raise exception 'Severidad inválida.'; end if;
  if failure_occurred_at is null then raise exception 'Indica la hora en que ocurrió la falla.'; end if;
  if failure_occurred_at > now()+interval '5 minutes' then raise exception 'La hora de falla no puede estar en el futuro.'; end if;
  if nullif(btrim(failure_title),'') is null then raise exception 'Indica qué falló.'; end if;
  if nullif(btrim(failure_impact),'') is null then raise exception 'Describe qué ocurrió o cuál fue el impacto.'; end if;
  if exists(select 1 from public.maintenance_tickets t where t.equipment_id=asset.id and t.status<>'closed') then raise exception 'El equipo ya tiene una falla activa.'; end if;

  insert into public.maintenance_tickets(equipment_id,plant_id,severity,title,description,status,opened_at,failed_at,failure_type,created_by)
  values(asset.id,asset.plant_id,failure_severity,btrim(failure_title),btrim(failure_impact),'open',now(),failure_occurred_at,failure_kind,auth.uid())
  returning maintenance_tickets.id into ticket_id;

  update public.equipment set status='stopped' where id=asset.id;

  foreach evidence_ref in array coalesce(evidence_refs,'{}'::text[]) loop
    if nullif(btrim(evidence_ref),'') is null then raise exception 'Las referencias de evidencia no pueden estar vacías.'; end if;
    if length(btrim(evidence_ref))>1000 then raise exception 'Una referencia de evidencia es demasiado larga.'; end if;
    insert into public.maintenance_ticket_evidence(ticket_id,plant_id,stage,evidence_ref,created_by)
    values(ticket_id,asset.plant_id,'failure',btrim(evidence_ref),auth.uid());
  end loop;

  return ticket_id;
end;
$$;

create or replace function public.ops_start_equipment_repair_v2(
  target_ticket uuid,
  repair_started timestamptz default now()
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  ticket public.maintenance_tickets%rowtype;
begin
  select * into ticket from public.maintenance_tickets t where t.id=target_ticket for update;
  if not found then raise exception 'Ticket de mantenimiento no encontrado.'; end if;
  if not private.has_plant_role(ticket.plant_id,array['maintenance','supervisor','technical','admin','director']) then raise exception 'No tienes permiso para iniciar reparaciones en esta planta.'; end if;
  if ticket.status<>'open' then raise exception 'La reparación solo puede iniciarse desde una falla abierta.'; end if;
  if repair_started is null or repair_started<ticket.failed_at then raise exception 'El inicio de reparación no puede ser anterior a la falla.'; end if;
  if repair_started>now()+interval '5 minutes' then raise exception 'El inicio de reparación no puede estar en el futuro.'; end if;

  update public.maintenance_tickets set status='repairing',repair_started_at=repair_started where id=ticket.id;
  update public.equipment set status='maintenance' where id=ticket.equipment_id;
end;
$$;

create or replace function public.ops_close_equipment_repair_v2(
  target_ticket uuid,
  repair_ended timestamptz,
  root_cause text,
  repair_action text,
  spare_supply_ids uuid[] default '{}'::uuid[],
  spare_lot_codes text[] default '{}'::text[],
  spare_quantities numeric[] default '{}'::numeric[],
  repair_evidence_refs text[] default '{}'::text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  ticket public.maintenance_tickets%rowtype;
  supplied_count integer;
  idx integer;
  movement_id uuid;
  evidence_ref text;
begin
  select * into ticket from public.maintenance_tickets t where t.id=target_ticket for update;
  if not found then raise exception 'Ticket de mantenimiento no encontrado.'; end if;
  if not private.has_plant_role(ticket.plant_id,array['maintenance','supervisor','technical','admin','director']) then raise exception 'No tienes permiso para cerrar reparaciones en esta planta.'; end if;
  if ticket.status<>'repairing' or ticket.repair_started_at is null then raise exception 'La reparación debe estar iniciada antes de cerrarse.'; end if;
  if repair_ended is null or repair_ended<ticket.repair_started_at then raise exception 'El fin de reparación no puede ser anterior al inicio.'; end if;
  if repair_ended>now()+interval '5 minutes' then raise exception 'El fin de reparación no puede estar en el futuro.'; end if;
  if nullif(btrim(root_cause),'') is null then raise exception 'Registra la causa encontrada.'; end if;
  if nullif(btrim(repair_action),'') is null then raise exception 'Registra la acción realizada.'; end if;

  supplied_count:=coalesce(cardinality(spare_supply_ids),0);
  if supplied_count<>coalesce(cardinality(spare_lot_codes),0) or supplied_count<>coalesce(cardinality(spare_quantities),0) then raise exception 'Cada repuesto debe incluir insumo, lote y cantidad.'; end if;
  if exists(select 1 from unnest(coalesce(spare_quantities,'{}'::numeric[])) value where value is null or value<=0) then raise exception 'Las cantidades de repuestos deben ser mayores que cero.'; end if;

  if supplied_count>0 then
    for idx in 1..supplied_count loop
      if nullif(btrim(spare_lot_codes[idx]),'') is null then raise exception 'Indica el lote de cada repuesto.'; end if;
      movement_id:=private.consume_supply(
        ticket.plant_id,
        spare_supply_ids[idx],
        btrim(spare_lot_codes[idx]),
        spare_quantities[idx],
        (repair_ended at time zone 'America/Bogota')::date,
        'Mantenimiento correctivo',
        ticket.equipment_id,
        'maintenance:'||ticket.id::text,
        'Repuesto consumido en reparación '||ticket.id::text
      );
      update public.supply_movements set reference_id=ticket.id where id=movement_id;
    end loop;
  end if;

  foreach evidence_ref in array coalesce(repair_evidence_refs,'{}'::text[]) loop
    if nullif(btrim(evidence_ref),'') is null then raise exception 'Las referencias de evidencia no pueden estar vacías.'; end if;
    if length(btrim(evidence_ref))>1000 then raise exception 'Una referencia de evidencia es demasiado larga.'; end if;
    insert into public.maintenance_ticket_evidence(ticket_id,plant_id,stage,evidence_ref,created_by)
    values(ticket.id,ticket.plant_id,'repair',btrim(evidence_ref),auth.uid());
  end loop;

  update public.maintenance_tickets
  set status='closed',closed_at=repair_ended,cause=btrim(root_cause),resolution=btrim(repair_action)
  where id=ticket.id;
  update public.equipment set status='available' where id=ticket.equipment_id;
end;
$$;

create or replace function public.ops_equipment_maintenance_metrics(
  target_equipment uuid,
  range_start timestamptz,
  range_end timestamptz
)
returns table(
  planned_hours numeric,
  downtime_hours numeric,
  unavailable_scheduled_hours numeric,
  availability_pct numeric,
  failure_count bigint,
  mttr_hours numeric
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  plant uuid;
  planned_seconds numeric;
  downtime_seconds numeric;
  unavailable_seconds numeric;
  failures bigint;
  repair_seconds numeric;
begin
  if range_start is null or range_end is null or range_end<=range_start then raise exception 'El rango de métricas no es válido.'; end if;
  select e.plant_id into plant from public.equipment e where e.id=target_equipment;
  if plant is null then raise exception 'Equipo no encontrado.'; end if;
  if not private.has_plant_access(plant) then raise exception 'No tienes acceso a este equipo.'; end if;

  select coalesce(sum(extract(epoch from (least(sa.planned_end,range_end)-greatest(sa.planned_start,range_start)))),0)
  into planned_seconds
  from public.scheduled_activities sa
  where sa.equipment_id=target_equipment
    and sa.planned_end is not null
    and sa.planned_end>sa.planned_start
    and sa.planned_end>range_start and sa.planned_start<range_end
    and sa.status<>'rescheduled';

  select
    coalesce(sum(extract(epoch from (least(coalesce(t.closed_at,range_end),range_end)-greatest(t.failed_at,range_start)))),0),
    count(*),
    coalesce(sum(case when t.repair_started_at is not null and t.closed_at is not null then extract(epoch from (t.closed_at-t.repair_started_at)) else 0 end),0)
  into downtime_seconds,failures,repair_seconds
  from public.maintenance_tickets t
  where t.equipment_id=target_equipment
    and coalesce(t.closed_at,range_end)>range_start
    and t.failed_at<range_end;

  select coalesce(sum(extract(epoch from (
    least(sa.planned_end,coalesce(t.closed_at,range_end),range_end)
    - greatest(sa.planned_start,t.failed_at,range_start)
  ))),0)
  into unavailable_seconds
  from public.scheduled_activities sa
  join public.maintenance_tickets t on t.equipment_id=sa.equipment_id
  where sa.equipment_id=target_equipment
    and sa.planned_end is not null and sa.planned_end>sa.planned_start
    and sa.planned_end>range_start and sa.planned_start<range_end
    and sa.status<>'rescheduled'
    and coalesce(t.closed_at,range_end)>greatest(sa.planned_start,range_start)
    and t.failed_at<least(sa.planned_end,range_end);

  return query select
    round(planned_seconds/3600.0,2),
    round(downtime_seconds/3600.0,2),
    round(unavailable_seconds/3600.0,2),
    case when planned_seconds>0 then round(greatest(0,least(100,100*(planned_seconds-unavailable_seconds)/planned_seconds)),2) else null end,
    failures,
    case when failures>0 and repair_seconds>0 then round((repair_seconds/3600.0)/failures,2) else null end;
end;
$$;

revoke all on function public.ops_report_equipment_failure_v2(uuid,text,timestamptz,text,text,text,text[]) from public,anon;
revoke all on function public.ops_start_equipment_repair_v2(uuid,timestamptz) from public,anon;
revoke all on function public.ops_close_equipment_repair_v2(uuid,timestamptz,text,text,uuid[],text[],numeric[],text[]) from public,anon;
revoke all on function public.ops_equipment_maintenance_metrics(uuid,timestamptz,timestamptz) from public,anon;
grant execute on function public.ops_report_equipment_failure_v2(uuid,text,timestamptz,text,text,text,text[]) to authenticated;
grant execute on function public.ops_start_equipment_repair_v2(uuid,timestamptz) to authenticated;
grant execute on function public.ops_close_equipment_repair_v2(uuid,timestamptz,text,text,uuid[],text[],numeric[],text[]) to authenticated;
grant execute on function public.ops_equipment_maintenance_metrics(uuid,timestamptz,timestamptz) to authenticated;

comment on column public.maintenance_tickets.failed_at is 'Actual failure occurrence time; downtime starts here, independently of report/open time.';
comment on column public.maintenance_tickets.failure_type is 'Structured operational failure category used for maintenance analysis.';
comment on table public.maintenance_ticket_evidence is 'Failure/repair evidence references. File storage is adapter-agnostic; history remains plant-scoped.';
comment on function public.ops_close_equipment_repair_v2(uuid,timestamptz,text,text,uuid[],text[],numeric[],text[]) is 'Atomic repair close: validates lifecycle, consumes physical spare stock by lot, links movements to ticket and returns equipment to available.';
comment on function public.ops_equipment_maintenance_metrics(uuid,timestamptz,timestamptz) is 'Schedule-based mechanical availability. Returns NULL availability when no planned equipment hours exist; never invents a 100% denominator.';
