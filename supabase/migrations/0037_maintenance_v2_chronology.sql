-- Mantenimiento 2.0 contract reconciliation.
-- V2 uses failed_at as the actual occurrence time independently from report/open time.
-- It also owns spare-part consumption atomically from the repair-close RPC.

-- Remove only legacy checks that incorrectly compare repair/close timestamps to opened_at.
-- The V2 checks failed_at -> repair_started_at -> closed_at remain authoritative.
do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.maintenance_tickets'::regclass
      and c.contype = 'c'
      and c.conname not in (
        'maintenance_tickets_repair_after_failure_check',
        'maintenance_tickets_close_after_repair_check',
        'maintenance_tickets_failed_at_check'
      )
      and (
        (
          pg_get_constraintdef(c.oid) ilike '%repair_started_at%'
          and pg_get_constraintdef(c.oid) ilike '%opened_at%'
          and pg_get_constraintdef(c.oid) not ilike '%closed_at%'
        )
        or (
          pg_get_constraintdef(c.oid) ilike '%closed_at%'
          and pg_get_constraintdef(c.oid) ilike '%opened_at%'
          and pg_get_constraintdef(c.oid) not ilike '%repair_started_at%'
        )
      )
  loop
    execute format(
      'alter table public.maintenance_tickets drop constraint %I',
      constraint_name
    );
  end loop;
end
$$;

-- Purpose-built ledger write used only from the SECURITY DEFINER maintenance-close RPC.
-- It does not grant the maintenance role access to the generic public.consume_supply RPC.
create or replace function private.consume_maintenance_spare(
  p_plant_id uuid,
  p_supply_id uuid,
  p_lot_code text,
  p_quantity numeric,
  p_occurred_on date,
  p_equipment_id uuid,
  p_ticket_id uuid
)
returns uuid
language plpgsql
security invoker
set search_path=''
as $$
declare
  available numeric;
  movement_id uuid;
  supply_category text;
begin
  if p_quantity is null or p_quantity<=0 then raise exception 'La cantidad consumida debe ser mayor que cero'; end if;
  if nullif(btrim(coalesce(p_lot_code,'')),'') is null then raise exception 'Indica el lote del repuesto'; end if;

  select s.category into supply_category
  from public.supplies s
  where s.id=p_supply_id;
  if supply_category is null then raise exception 'Repuesto no encontrado'; end if;
  if supply_category<>'spare_part' then raise exception 'Solo los repuestos pueden consumirse desde mantenimiento'; end if;

  if not exists(
    select 1 from public.equipment e
    where e.id=p_equipment_id and e.plant_id=p_plant_id
  ) then raise exception 'El equipo no pertenece a la planta'; end if;

  if not exists(
    select 1 from public.maintenance_tickets t
    where t.id=p_ticket_id
      and t.plant_id=p_plant_id
      and t.equipment_id=p_equipment_id
      and t.status='repairing'
  ) then raise exception 'El ticket no está habilitado para consumir repuestos'; end if;

  perform pg_advisory_xact_lock(hashtext(p_plant_id::text||'|'||p_supply_id::text||'|'||btrim(p_lot_code)));
  if not exists(
    select 1 from public.supply_movements
    where plant_id=p_plant_id and supply_id=p_supply_id and lot_code=btrim(p_lot_code)
  ) then raise exception 'Lote de insumo no encontrado'; end if;

  select coalesce(sum(case when kind in ('receipt','adjustment_in') then quantity else -quantity end),0)
    into available
  from public.supply_movements
  where plant_id=p_plant_id and supply_id=p_supply_id and lot_code=btrim(p_lot_code);

  if p_quantity>available then raise exception 'Stock insuficiente en el lote'; end if;

  insert into public.supply_movements(
    plant_id,supply_id,lot_code,kind,quantity,occurred_on,destination,
    equipment_id,process_ref,note,created_by
  ) values(
    p_plant_id,p_supply_id,btrim(p_lot_code),'consumption',p_quantity,p_occurred_on,
    'Mantenimiento correctivo',p_equipment_id,'maintenance:'||p_ticket_id::text,
    'Repuesto consumido en reparación '||p_ticket_id::text,auth.uid()
  ) returning id into movement_id;

  return movement_id;
end;
$$;

revoke all on function private.consume_maintenance_spare(uuid,uuid,text,numeric,date,uuid,uuid) from public,anon,authenticated;

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

  update public.maintenance_tickets
  set status='closed',closed_at=repair_ended,cause=btrim(root_cause),resolution=btrim(repair_action)
  where id=ticket.id;
  update public.equipment set status='available' where id=ticket.equipment_id;
end;
$$;

comment on function private.consume_maintenance_spare(uuid,uuid,text,numeric,date,uuid,uuid)
is 'Internal maintenance-only spare ledger write. Executable through the guarded repair-close RPC, not by authenticated users directly.';
