-- R2.4B · Maintenance repair -> canonical activity.
-- New repair closes create exactly one canonical maintenance activity in the same transaction.
-- Existing/historical tickets remain nullable to avoid inventing labor records.

alter table public.maintenance_tickets
  add column if not exists repair_activity_id uuid;

alter table public.maintenance_tickets
  drop constraint if exists maintenance_tickets_repair_activity_plant_fk;
alter table public.maintenance_tickets
  add constraint maintenance_tickets_repair_activity_plant_fk
  foreign key (repair_activity_id,plant_id)
  references public.activities(id,plant_id)
  on delete restrict;

create unique index if not exists maintenance_tickets_repair_activity_uidx
  on public.maintenance_tickets(repair_activity_id)
  where repair_activity_id is not null;

create or replace function private.insert_maintenance_repair_activity(
  target_ticket uuid,
  employee_ids uuid[],
  repair_ended timestamptz,
  root_cause text,
  repair_action text
)
returns uuid
language plpgsql
security invoker
set search_path=''
as $$
declare
  ticket public.maintenance_tickets%rowtype;
  asset public.equipment%rowtype;
  canonical_process uuid;
  process_name text;
  template_id uuid;
  template_name text;
  activity_id uuid;
begin
  select * into ticket from public.maintenance_tickets t where t.id=target_ticket for update;
  if not found then raise exception 'Ticket de mantenimiento no encontrado.'; end if;
  if ticket.status<>'repairing' or ticket.repair_started_at is null then raise exception 'La reparación debe estar iniciada antes de registrar su actividad.'; end if;
  if ticket.repair_activity_id is not null then raise exception 'La reparación ya tiene una actividad canónica.'; end if;

  select * into asset from public.equipment e where e.id=ticket.equipment_id and e.plant_id=ticket.plant_id;
  if not found then raise exception 'Equipo de mantenimiento no encontrado en la planta.'; end if;

  perform private.assert_activity_log_workers(ticket.plant_id,employee_ids,ticket.repair_started_at,repair_ended);

  select p.id,p.name into canonical_process,process_name
  from public.operational_processes p
  where p.plant_id=ticket.plant_id and p.code='MANTENIMIENTO' and p.active;
  if not found then raise exception 'La planta no tiene un proceso activo de mantenimiento.'; end if;

  select t.id,t.name into template_id,template_name
  from public.activity_templates t
  where t.plant_id=ticket.plant_id
    and t.process_id=canonical_process
    and t.code='MANTENIMIENTO_HERRAMIENTAS_EQUIPOS'
    and t.active;

  insert into public.activities(
    plant_id,title,process,started_at,ended_at,equipment_id,equipment_ref,
    process_id,activity_template_id,activity_comment,source_kind,created_by
  ) values (
    ticket.plant_id,
    coalesce(template_name,'Mantenimiento de equipo'),
    process_name,
    ticket.repair_started_at,
    repair_ended,
    asset.id,
    asset.code,
    canonical_process,
    template_id,
    'Ticket '||ticket.id::text||' · Causa: '||btrim(root_cause)||' · Acción: '||btrim(repair_action),
    'app',
    auth.uid()
  ) returning id into activity_id;

  insert into public.activity_workers(activity_id,employee_id)
  select activity_id,value from unnest(employee_ids) value;

  return activity_id;
end;
$$;

revoke all on function private.insert_maintenance_repair_activity(uuid,uuid[],timestamptz,text,text)
from public,anon,authenticated;

-- Extend the guarded close RPC with actual repair workers. Spare-part and evidence semantics stay unchanged.
create or replace function public.ops_close_equipment_repair_v2(
  target_ticket uuid,
  repair_ended timestamptz,
  root_cause text,
  repair_action text,
  spare_supply_ids uuid[] default '{}'::uuid[],
  spare_lot_codes text[] default '{}'::text[],
  spare_quantities numeric[] default '{}'::numeric[],
  repair_evidence_refs text[] default '{}'::text[],
  employee_ids uuid[] default '{}'::uuid[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  ticket public.maintenance_tickets%rowtype;
  supplied_count integer;
  worker_count integer;
  idx integer;
  movement_id uuid;
  evidence_ref text;
  repair_activity uuid;
begin
  select * into ticket from public.maintenance_tickets t where t.id=target_ticket for update;
  if not found then raise exception 'Ticket de mantenimiento no encontrado.'; end if;
  if not private.has_plant_role(ticket.plant_id,array['maintenance','supervisor','technical','admin','director']) then raise exception 'No tienes permiso para cerrar reparaciones en esta planta.'; end if;
  if ticket.status<>'repairing' or ticket.repair_started_at is null then raise exception 'La reparación debe estar iniciada antes de cerrarse.'; end if;
  if repair_ended is null or repair_ended<ticket.repair_started_at then raise exception 'El fin de reparación no puede ser anterior al inicio.'; end if;
  if repair_ended>now()+interval '5 minutes' then raise exception 'El fin de reparación no puede estar en el futuro.'; end if;
  if nullif(btrim(root_cause),'') is null then raise exception 'Registra la causa encontrada.'; end if;
  if nullif(btrim(repair_action),'') is null then raise exception 'Registra la acción realizada.'; end if;

  worker_count:=coalesce(cardinality(employee_ids),0);
  if worker_count=0 then raise exception 'Selecciona al menos un trabajador para cerrar la reparación.'; end if;
  if worker_count<>(select count(distinct value) from unnest(employee_ids) value) then raise exception 'Los trabajadores de reparación contienen duplicados.'; end if;

  -- Assert and lock workers before any stock/evidence mutation.
  perform private.assert_activity_log_workers(ticket.plant_id,employee_ids,ticket.repair_started_at,repair_ended);

  supplied_count:=coalesce(cardinality(spare_supply_ids),0);
  if supplied_count<>coalesce(cardinality(spare_lot_codes),0) or supplied_count<>coalesce(cardinality(spare_quantities),0) then raise exception 'Cada repuesto debe incluir insumo, lote y cantidad.'; end if;
  if exists(select 1 from unnest(coalesce(spare_quantities,'{}'::numeric[])) value where value is null or value<=0) then raise exception 'Las cantidades de repuestos deben ser mayores que cero.'; end if;

  if supplied_count>0 then
    for idx in 1..supplied_count loop
      if nullif(btrim(spare_lot_codes[idx]),'') is null then raise exception 'Indica el lote de cada repuesto.'; end if;
      movement_id:=private.consume_maintenance_spare(
        ticket.plant_id,
        spare_supply_ids[idx],
        btrim(spare_lot_codes[idx]),
        spare_quantities[idx],
        (repair_ended at time zone 'America/Bogota')::date,
        ticket.equipment_id,
        ticket.id
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

  repair_activity:=private.insert_maintenance_repair_activity(
    ticket.id,employee_ids,repair_ended,root_cause,repair_action
  );

  update public.maintenance_tickets
  set status='closed',closed_at=repair_ended,cause=btrim(root_cause),resolution=btrim(repair_action),repair_activity_id=repair_activity
  where id=ticket.id;
  update public.equipment set status='available' where id=ticket.equipment_id;
end;
$$;

-- Remove the previous overload entirely: there is no supported close path without actual workers.
drop function if exists public.ops_close_equipment_repair_v2(uuid,timestamptz,text,text,uuid[],text[],numeric[],text[]);
revoke all on function public.ops_close_equipment_repair_v2(uuid,timestamptz,text,text,uuid[],text[],numeric[],text[],uuid[]) from public,anon;
grant execute on function public.ops_close_equipment_repair_v2(uuid,timestamptz,text,text,uuid[],text[],numeric[],text[],uuid[]) to authenticated;

comment on column public.maintenance_tickets.repair_activity_id is
'Canonical activity created atomically when a new Maintenance V2 repair closes; null is reserved for historical/pre-link tickets.';
comment on function private.insert_maintenance_repair_activity(uuid,uuid[],timestamptz,text,text) is
'Internal bridge from one validated repair interval to one canonical maintenance activity and its actual workers.';
