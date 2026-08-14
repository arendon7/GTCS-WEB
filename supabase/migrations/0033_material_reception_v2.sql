-- Wave 2B.2 · Recepción FORSU 2.0.
-- Canonical origin/route/material, transport + inspection data and a real physical intake lot.
-- Legacy text columns remain populated for compatibility and historical reads.

create unique index if not exists material_sources_id_plant_uidx on public.material_sources(id,plant_id);
create unique index if not exists collection_routes_id_plant_uidx on public.collection_routes(id,plant_id);
create unique index if not exists material_types_id_plant_uidx on public.material_types(id,plant_id);
create unique index if not exists employees_id_plant_uidx on public.employees(id,plant_id);
create unique index if not exists material_receipts_id_plant_uidx on public.material_receipts(id,plant_id);

alter table public.material_receipts
  add column if not exists material_source_id uuid,
  add column if not exists collection_route_id uuid,
  add column if not exists material_type_id uuid,
  add column if not exists responsible_employee_id uuid,
  add column if not exists driver_name text,
  add column if not exists driver_phone text,
  add column if not exists vehicle_plate text,
  add column if not exists accepted_weight_kg numeric,
  add column if not exists improper_weight_kg numeric,
  add column if not exists inspection_notes text;

alter table public.material_receipts drop constraint if exists material_receipts_acceptance_status_check;
alter table public.material_receipts add constraint material_receipts_acceptance_status_check check (acceptance_status in ('accepted','conditioned','partial_rejection','rejected','unknown'));
alter table public.material_receipts
  add constraint material_receipts_source_plant_fk foreign key (material_source_id,plant_id) references public.material_sources(id,plant_id) on delete restrict,
  add constraint material_receipts_route_plant_fk foreign key (collection_route_id,plant_id) references public.collection_routes(id,plant_id) on delete restrict,
  add constraint material_receipts_material_type_plant_fk foreign key (material_type_id,plant_id) references public.material_types(id,plant_id) on delete restrict,
  add constraint material_receipts_responsible_plant_fk foreign key (responsible_employee_id,plant_id) references public.employees(id,plant_id) on delete restrict,
  add constraint material_receipts_accepted_weight_check check (accepted_weight_kg is null or (accepted_weight_kg >= 0 and accepted_weight_kg <= net_weight_kg)),
  add constraint material_receipts_improper_weight_check check (improper_weight_kg is null or (improper_weight_kg >= 0 and improper_weight_kg <= rejection_kg));

create table if not exists public.material_intake_lots (
  id uuid primary key default gen_random_uuid(), plant_id uuid not null references public.plants(id) on delete restrict,
  receipt_id uuid not null, lot_code text not null, material_source_id uuid not null, collection_route_id uuid, material_type_id uuid not null,
  received_at timestamptz not null, initial_mass_kg numeric not null, available_mass_kg numeric not null,
  status text not null default 'available', created_by uuid references auth.users(id) default auth.uid(), created_at timestamptz not null default now(),
  unique (receipt_id), unique (plant_id,lot_code), unique (id,plant_id),
  foreign key (receipt_id,plant_id) references public.material_receipts(id,plant_id) on delete restrict,
  foreign key (material_source_id,plant_id) references public.material_sources(id,plant_id) on delete restrict,
  foreign key (collection_route_id,plant_id) references public.collection_routes(id,plant_id) on delete restrict,
  foreign key (material_type_id,plant_id) references public.material_types(id,plant_id) on delete restrict,
  check (nullif(btrim(lot_code),'') is not null), check (initial_mass_kg > 0), check (available_mass_kg >= 0 and available_mass_kg <= initial_mass_kg),
  check (status in ('available','quarantined','in_process','depleted'))
);
create index if not exists material_intake_lots_plant_status_idx on public.material_intake_lots(plant_id,status,received_at desc);
create index if not exists material_receipts_canonical_source_idx on public.material_receipts(plant_id,material_source_id,ended_at desc);
alter table public.material_intake_lots enable row level security;
create policy "material_intake_lots_member_select" on public.material_intake_lots for select to authenticated using ((select private.has_plant_access(plant_id)));

drop policy if exists "receipts_operator_insert" on public.material_receipts;
drop policy if exists "receipts_supervisor_update" on public.material_receipts;

insert into public.material_sources(plant_id,code,name,source_kind)
select p.id,'MUNICIPIO_TAMESIS','Municipio de Támesis','generator' from public.plants p where p.code='TAM' and p.active on conflict (plant_id,code) do nothing;
insert into public.material_sources(plant_id,code,name,source_kind)
select p.id,'GREENATICS','Greenatics','internal' from public.plants p where p.code='YAR' and p.active on conflict (plant_id,code) do nothing;

create or replace function public.ops_record_material_receipt_v2(
  target_plant uuid, target_source uuid, target_material_type uuid, receipt_started_at timestamptz, receipt_ended_at timestamptz,
  received_weight_kg numeric, accepted_weight_kg numeric, rejection_weight_kg numeric default 0, improper_weight_kg numeric default 0,
  acceptance_kind text default 'accepted', target_route uuid default null, responsible_employee uuid default null,
  transport_driver_name text default null, transport_driver_phone text default null, transport_vehicle_plate text default null,
  inspection_notes_text text default null
)
returns table(id uuid, lot_id uuid, lot_code text)
language plpgsql security definer set search_path = '' as $$
declare source_name text; route_name text; material_code text; plant_code text; prefix text; receipt_date date; sequence_no integer; generated_lot text; receipt_id uuid; physical_lot_id uuid; lot_status text;
begin
  if not private.has_plant_role(target_plant,array['operator','supervisor','technical','admin','director']) then raise exception 'No tienes permiso para registrar recepciones en esta planta.'; end if;
  if receipt_started_at is null or receipt_ended_at is null then raise exception 'Indica fecha y horas de la recepción.'; end if;
  if receipt_ended_at < receipt_started_at then raise exception 'La hora final no puede ser anterior al inicio.'; end if;
  if receipt_ended_at > now() + interval '5 minutes' then raise exception 'La hora final no puede estar en el futuro.'; end if;
  if received_weight_kg is null or received_weight_kg <= 0 then raise exception 'La masa recibida debe ser mayor que cero.'; end if;
  if accepted_weight_kg is null or accepted_weight_kg < 0 then raise exception 'La masa aceptada debe ser cero o mayor.'; end if;
  if rejection_weight_kg is null or rejection_weight_kg < 0 then raise exception 'La masa rechazada no puede ser negativa.'; end if;
  if improper_weight_kg is null or improper_weight_kg < 0 or improper_weight_kg > rejection_weight_kg then raise exception 'La masa de impropios debe estar dentro de la masa rechazada.'; end if;
  if abs((accepted_weight_kg + rejection_weight_kg) - received_weight_kg) > 0.001 then raise exception 'Masa aceptada + masa rechazada debe coincidir con la masa recibida.'; end if;
  if acceptance_kind not in ('accepted','conditioned','partial_rejection','rejected') then raise exception 'Estado de aceptación inválido.'; end if;
  if acceptance_kind='rejected' and accepted_weight_kg<>0 then raise exception 'Una recepción rechazada no puede dejar masa aceptada.'; end if;
  if acceptance_kind<>'rejected' and accepted_weight_kg<=0 then raise exception 'Una recepción aceptada debe dejar masa física mayor que cero.'; end if;

  select s.name into source_name from public.material_sources s where s.id=target_source and s.plant_id=target_plant and s.active;
  if source_name is null then raise exception 'El origen o generador no pertenece a la planta o está inactivo.'; end if;
  if target_route is not null then select r.name into route_name from public.collection_routes r where r.id=target_route and r.plant_id=target_plant and r.active; if route_name is null then raise exception 'La ruta no pertenece a la planta o está inactiva.'; end if; else route_name := 'Sin ruta específica'; end if;
  select mt.code into material_code from public.material_types mt where mt.id=target_material_type and mt.plant_id=target_plant and mt.active;
  if material_code is null then raise exception 'El tipo de material no pertenece a la planta o está inactivo.'; end if;
  if material_code not in ('FORSU','PODA','GALLINAZA','MATERIA_PRIMA','OTRO') then raise exception 'El tipo de material no es compatible con recepción.'; end if;
  if responsible_employee is not null and not exists (select 1 from public.employees e where e.id=responsible_employee and e.plant_id=target_plant and e.active) then raise exception 'El responsable de aprovechamiento no pertenece a la planta o está inactivo.'; end if;
  if nullif(btrim(transport_vehicle_plate),'') is not null and upper(regexp_replace(btrim(transport_vehicle_plate),'[^A-Za-z0-9]','','g')) !~ '^[A-Z0-9]{5,8}$' then raise exception 'La placa del vehículo no tiene un formato válido.'; end if;

  select p.code into plant_code from public.plants p where p.id=target_plant and p.active; if plant_code is null then raise exception 'Planta no encontrada o inactiva.'; end if;
  prefix := case when lower(plant_code) like 'yar%' then 'YAR' when lower(plant_code) like 'tam%' then 'TAM' else upper(left(regexp_replace(plant_code,'[^a-zA-Z0-9]','','g'),3)) end;
  receipt_date := (receipt_ended_at at time zone 'America/Bogota')::date;
  perform pg_advisory_xact_lock(hashtextextended('greenatics-receipt:'||target_plant::text||':'||receipt_date::text,0));
  select count(*)+1 into sequence_no from public.material_receipts r where r.plant_id=target_plant and (r.ended_at at time zone 'America/Bogota')::date=receipt_date;
  generated_lot := prefix||'-'||material_code||'-'||to_char(receipt_date,'YYYYMMDD')||'-'||lpad(sequence_no::text,3,'0');

  insert into public.material_receipts(plant_id,generator,route,waste_type,net_weight_kg,rejection_kg,rejection_known,acceptance_status,observation,started_at,ended_at,lot_code,source_kind,created_by,material_source_id,collection_route_id,material_type_id,responsible_employee_id,driver_name,driver_phone,vehicle_plate,accepted_weight_kg,improper_weight_kg,inspection_notes)
  values(target_plant,source_name,route_name,material_code,received_weight_kg,rejection_weight_kg,true,acceptance_kind,nullif(btrim(inspection_notes_text),''),receipt_started_at,receipt_ended_at,generated_lot,'app',auth.uid(),target_source,target_route,target_material_type,responsible_employee,nullif(btrim(transport_driver_name),''),nullif(btrim(transport_driver_phone),''),nullif(upper(regexp_replace(coalesce(btrim(transport_vehicle_plate),''),'[^A-Za-z0-9]','','g')),''),accepted_weight_kg,improper_weight_kg,nullif(btrim(inspection_notes_text),'')) returning material_receipts.id into receipt_id;

  physical_lot_id := null;
  if accepted_weight_kg > 0 then
    lot_status := case when acceptance_kind='conditioned' then 'quarantined' else 'available' end;
    insert into public.material_intake_lots(plant_id,receipt_id,lot_code,material_source_id,collection_route_id,material_type_id,received_at,initial_mass_kg,available_mass_kg,status,created_by)
    values(target_plant,receipt_id,generated_lot,target_source,target_route,target_material_type,receipt_ended_at,accepted_weight_kg,accepted_weight_kg,lot_status,auth.uid()) returning material_intake_lots.id into physical_lot_id;
  end if;
  return query select receipt_id,physical_lot_id,generated_lot;
end; $$;

revoke all on function public.ops_record_material_receipt_v2(uuid,uuid,uuid,timestamptz,timestamptz,numeric,numeric,numeric,numeric,text,uuid,uuid,text,text,text,text) from public,anon;
grant execute on function public.ops_record_material_receipt_v2(uuid,uuid,uuid,timestamptz,timestamptz,numeric,numeric,numeric,numeric,text,uuid,uuid,text,text,text,text) to authenticated;
grant select on public.material_intake_lots to authenticated;
comment on table public.material_intake_lots is 'Physical intake lots created only from accepted reception mass; source for downstream treatment traceability.';
comment on function public.ops_record_material_receipt_v2(uuid,uuid,uuid,timestamptz,timestamptz,numeric,numeric,numeric,numeric,text,uuid,uuid,text,text,text,text) is 'Atomic Reception 2.0 write: canonical source/route/material, transport, inspection, mass balance and physical intake lot.';
