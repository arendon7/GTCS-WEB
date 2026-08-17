-- Wave 2B.3 · Disposición técnica de lotes de recepción en cuarentena.
-- La decisión es irreversible: liberar a proceso o rechazar definitivamente.
-- La masa física no se borra; el estado gobierna su elegibilidad para tratamiento.

do $$
declare
  constraint_name text;
begin
  for constraint_name in
    select c.conname
    from pg_constraint c
    where c.conrelid = 'public.material_intake_lots'::regclass
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%status%'
      and pg_get_constraintdef(c.oid) ilike '%available%'
      and pg_get_constraintdef(c.oid) ilike '%quarantined%'
      and pg_get_constraintdef(c.oid) ilike '%depleted%'
  loop
    execute format('alter table public.material_intake_lots drop constraint %I', constraint_name);
  end loop;
end
$$;

alter table public.material_intake_lots
  add constraint material_intake_lots_status_check
  check (status in ('available','quarantined','in_process','depleted','rejected'));

create table public.material_intake_lot_dispositions (
  id uuid primary key default gen_random_uuid(),
  plant_id uuid not null references public.plants(id) on delete restrict,
  lot_id uuid not null,
  decision text not null,
  reason text not null,
  previous_status text not null,
  resulting_status text not null,
  decided_by uuid not null references auth.users(id) on delete restrict,
  decided_at timestamptz not null default now(),
  unique (lot_id),
  foreign key (lot_id,plant_id) references public.material_intake_lots(id,plant_id) on delete restrict,
  check (decision in ('release','reject')),
  check (previous_status = 'quarantined'),
  check (resulting_status in ('available','rejected')),
  check (nullif(btrim(reason),'') is not null),
  check (length(btrim(reason)) <= 1000)
);

create index material_intake_lot_dispositions_plant_decided_idx
  on public.material_intake_lot_dispositions(plant_id,decided_at desc);

alter table public.material_intake_lot_dispositions enable row level security;
create policy "material_intake_lot_dispositions_member_select"
  on public.material_intake_lot_dispositions
  for select to authenticated
  using ((select private.has_plant_access(plant_id)));

grant select on public.material_intake_lot_dispositions to authenticated;

create or replace function public.ops_dispose_material_intake_lot(
  target_lot uuid,
  disposition text,
  disposition_reason text
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  lot public.material_intake_lots%rowtype;
  next_status text;
  clean_reason text;
begin
  if target_lot is null then raise exception 'Indica el lote físico.'; end if;
  if disposition not in ('release','reject') then raise exception 'Decisión de cuarentena inválida.'; end if;

  clean_reason := nullif(btrim(coalesce(disposition_reason,'')),'');
  if clean_reason is null then raise exception 'Registra el motivo de la decisión técnica.'; end if;
  if length(clean_reason) > 1000 then raise exception 'El motivo de la decisión es demasiado largo.'; end if;

  select * into lot
  from public.material_intake_lots l
  where l.id = target_lot
  for update;

  if not found then raise exception 'Lote físico no encontrado.'; end if;
  if not private.has_plant_role(lot.plant_id,array['supervisor','technical','admin','director']) then
    raise exception 'No tienes permiso para resolver cuarentenas en esta planta.';
  end if;
  if lot.status <> 'quarantined' then
    raise exception 'Solo un lote en cuarentena puede recibir una decisión técnica.';
  end if;
  if lot.available_mass_kg <= 0 then
    raise exception 'El lote en cuarentena no tiene masa física pendiente de disposición.';
  end if;

  next_status := case when disposition = 'release' then 'available' else 'rejected' end;

  insert into public.material_intake_lot_dispositions(
    plant_id,lot_id,decision,reason,previous_status,resulting_status,decided_by
  ) values (
    lot.plant_id,lot.id,disposition,clean_reason,'quarantined',next_status,auth.uid()
  );

  update public.material_intake_lots
  set status = next_status
  where id = lot.id;

  return next_status;
end;
$$;

revoke all on function public.ops_dispose_material_intake_lot(uuid,text,text) from public,anon;
grant execute on function public.ops_dispose_material_intake_lot(uuid,text,text) to authenticated;

comment on table public.material_intake_lot_dispositions is
  'Immutable audit ledger for the one-time technical disposition of quarantined reception lots.';
comment on function public.ops_dispose_material_intake_lot(uuid,text,text) is
  'Atomically resolves a quarantined physical intake lot as released (available) or finally rejected, restricted by plant role.';
